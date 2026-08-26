export default class Building_DropPod
{
    static get availableCrashSiteDebris(){ return [
        '/Game/FactoryGame/World/Benefit/DropPod/BP_CrashSiteDebris.BP_CrashSiteDebris_C',
        '/Game/FactoryGame/World/Benefit/DropPod/BP_DebrisActor_01.BP_DebrisActor_01_C',
        '/Game/FactoryGame/World/Benefit/DropPod/BP_DebrisActor_02.BP_DebrisActor_02_C',
        '/Game/FactoryGame/World/Benefit/DropPod/BP_DebrisActor_03.BP_DebrisActor_03_C',
        '/Game/FactoryGame/World/Benefit/DropPod/BP_Ship.BP_Ship_C'
    ]; }

    static dismantleCrashSite(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mIsDismantled   = baseLayout.getObjectProperty(currentObject, 'mIsDismantled', 0);
            if(mIsDismantled === 0)
            {
                baseLayout.setObjectProperty(currentObject, 'mIsDismantled', 1, 'Bool');
                baseLayout.satisfactoryMap.availableLayers.crashDebris.removeLayer(marker.relatedTarget);

                let crashSiteButton = $('.updateLayerState[data-id="crashDebris"]');
                let dataCollected   = parseInt($('.updateLayerState[data-id="crashDebris"]').attr('data-collected')) - 1;
                    if(dataCollected > 0)
                    {
                        crashSiteButton.show();
                        crashSiteButton.attr('data-collected', dataCollected);
                        crashSiteButton.find('.badge').html(new Intl.NumberFormat(this.language).format(dataCollected));
                    }
                    else
                    {
                        crashSiteButton.hide();
                        crashSiteButton.attr('data-collected', 0);
                        crashSiteButton.find('.badge').html(0);
                    }
            }
    }

    static toggleHasBeenOpened(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let hasBeenOpened   = baseLayout.getObjectProperty(currentObject, 'mHasBeenOpened', 0);
            if(hasBeenOpened == 0)
            {
                baseLayout.setObjectProperty(currentObject, 'mHasBeenOpened', 1, 'Bool');
            }
            else
            {
                baseLayout.deleteObjectProperty(currentObject, 'mHasBeenOpened');
            }
    }

    static toggleHasBeenLooted(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let layerId         = marker.relatedTarget.options.layerId;

        let dataCollected   = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected'));
        let dataTotal       = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-total'));

        let mHasBeenLooted   = baseLayout.getObjectProperty(currentObject, 'mHasBeenLooted', 0);
            if(mHasBeenLooted == 0)
            {
                dataCollected++;
                //baseLayout.setObjectProperty(currentObject, 'mSpawnedDebris', 1, 'Bool');
                baseLayout.setObjectProperty(currentObject, 'mHasBeenOpened', 1, 'Bool');
                baseLayout.setObjectProperty(currentObject, 'mHasBeenLooted', 1, 'Bool');
                marker.relatedTarget.setOpacity(window.SCIM.collectedOpacity);
            }
            else
            {
                dataCollected--;
                baseLayout.deleteObjectProperty(currentObject, 'mHasBeenLooted');
                marker.relatedTarget.setOpacity(1);
            }

        $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);

        if(dataCollected === 0)
        {
            $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(baseLayout.language).format(dataTotal));
        }
        else
        {
            $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(baseLayout.language).format(dataCollected) + '/' + new Intl.NumberFormat(baseLayout.language).format(dataTotal));
        }
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let mIsDismantled = baseLayout.getObjectProperty(currentObject, 'mIsDismantled');
            if(Building_DropPod.availableCrashSiteDebris.includes(currentObject.className))
            {
                contextMenu.push({
                    icon        : baseLayout.satisfactoryMap.mapColors.crashDebris.icon,
                    text        : 'Crash Site Debris'
                });

                if(mIsDismantled === null)
                {
                    contextMenu.push({
                        icon        : 'fa-trash-alt',
                        text        : 'Dismantle',
                        callback    : Building_DropPod.dismantleCrashSite
                    });
                }

                return contextMenu;
            }

            if(mIsDismantled === null)
            {
                let hasBeenOpened = baseLayout.getObjectProperty(currentObject, 'mHasBeenOpened', 0);
                    contextMenu.push({
                        text    : ((hasBeenOpened === 1) ? '<strong class="text-danger">Close</strong>' : '<strong class="text-success">Open</strong>') + ' drop-pod',
                        callback: Building_DropPod.toggleHasBeenOpened
                    });

                    if(hasBeenOpened === 1)
                    {
                        let hasBeenLooted = baseLayout.getObjectProperty(currentObject, 'mHasBeenLooted', 0);
                            contextMenu.push({
                                text    : ((hasBeenLooted === 1) ? '<strong class="text-success">Add Hard Drive</strong>' : '<strong class="text-danger">Remove Hard Drive</strong>'),
                                callback: Building_DropPod.toggleHasBeenLooted
                            });
                    }
            }

        return contextMenu;
    }
}