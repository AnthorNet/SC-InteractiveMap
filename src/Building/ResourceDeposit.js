export default class Building_ResourceDeposit
{
    static getItemId(baseLayout, currentObject)
    {
        let mResourceDepositTableIndex  = baseLayout.getObjectProperty(currentObject, 'mResourceDepositTableIndex');
            switch(mResourceDepositTableIndex)
            {
                case 0:
                    return 'Desc_Stone_C';
                case 1:
                    return 'Desc_OreIron_C';
                case 2:
                    return 'Desc_OreCopper_C';
                case 3:
                    return 'Desc_Coal_C';
                case 4:
                    return 'Desc_OreGold_C';
                case 5:
                    return 'Desc_Sulfur_C';
                case 6:
                    return 'Desc_RawQuartz_C';
                case 7:
                    return 'Desc_OreBauxite_C';
                case 8:
                    return 'Desc_OreUranium_C';
                default:
                    console.log('Unknown mResourceDepositTableIndex', currentObject);
            }

        return null;
    }

    /*
     * ADD/DELETE
     */
    static add(baseLayout, currentObject)
    {
        let layerId                     = 'playerResourceDepositsLayer';
        let mResourcesLeft              = baseLayout.getObjectProperty(currentObject, 'mResourcesLeft');
        let mIsEmptied                  = baseLayout.getObjectProperty(currentObject, 'mIsEmptied');

            if(mIsEmptied === null && mResourcesLeft !== null)
            {
                let itemId = Building_ResourceDeposit.getItemId(baseLayout, currentObject);
                    if(itemId !== null)
                    {
                        baseLayout.setupSubLayer(layerId, false);

                        let depositMarker = L.mapMarker(
                                baseLayout.satisfactoryMap.unproject(currentObject.transform.translation),
                                {
                                    pathName    : currentObject.pathName,
                                    itemId      : itemId,
                                    itemQty     : mResourcesLeft,
                                    icon        : baseLayout.itemsData[itemId].image
                                }
                            );
                            baseLayout.bindMouseEvents(depositMarker);

                        baseLayout.playerLayers[layerId].elements.push(depositMarker);

                        if(baseLayout.playerLayers[layerId].filtersCount !== undefined)
                        {
                            if(baseLayout.playerLayers[layerId].filtersCount[itemId] === undefined)
                            {
                                baseLayout.playerLayers[layerId].filtersCount[itemId] = 0;
                            }
                            baseLayout.playerLayers[layerId].filtersCount[itemId]++;
                        }
                    }
            }
    }

    static delete(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mIsEmptied      = baseLayout.getObjectProperty(currentObject, 'mIsEmptied');

            if(mIsEmptied === null)
            {
                currentObject.properties.push({name: 'mIsEmptied', type: 'Bool', value: 1});
            }

            baseLayout.deleteObjectProperty(currentObject, 'mResourcesLeft');

        baseLayout.deleteMarkerFromElements('playerResourceDepositsLayer', marker.relatedTarget);
        baseLayout.setBadgeLayerCount('playerResourceDepositsLayer');
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            text        : 'Resource Deposit'
        });
        contextMenu.push({
            icon        : 'fa-portal-exit',
            text        : 'Teleport player',
            callback    : baseLayout.teleportPlayer
        });
        contextMenu.push('-');
        contextMenu.push({
            icon        : 'fa-trash-alt',
            text        : 'Delete',
            callback    : Building_ResourceDeposit.delete
        });

        return contextMenu;
    }
}