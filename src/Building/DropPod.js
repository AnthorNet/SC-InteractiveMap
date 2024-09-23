export default class Building_DropPod
{
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

        return contextMenu;
    }
}