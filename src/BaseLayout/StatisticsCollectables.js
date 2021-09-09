/* global collectableMarkers, Intl */
export default class BaseLayout_Statistics_Collectables
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
    }

    get()
    {
        let playerCollectables  = this.baseLayout.playerStatistics.collectables;

            for(let className in playerCollectables)
            {
                playerCollectables[className].used = 0;

                if(typeof this.baseLayout.satisfactoryMap.mapOptions !== 'undefined' && this.baseLayout.satisfactoryMap.mapOptions !== undefined && this.baseLayout.satisfactoryMap.mapOptions !== null)
                {
                    for(let i = 0; i < this.baseLayout.satisfactoryMap.mapOptions.length; i++)
                    {
                        for(let j = 0; j < this.baseLayout.satisfactoryMap.mapOptions[i].options.length; j++)
                        {
                            for(let k = 0; k < this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options.length; k++)
                            {
                                if(this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options[k].layerId === playerCollectables[className].layerId)
                                {
                                    playerCollectables[className].name      = this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options[k].name;
                                    playerCollectables[className].image     = this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options[k].icon;
                                    playerCollectables[className].markers   = this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options[k].markers;

                                    for(let m = 0; m < playerCollectables[className].markers.length; m++)
                                    {
                                        let collectedStatus = this.getStatusFromPathName(playerCollectables[className].markers[m].pathName, className);
                                            if(collectedStatus === true)
                                            {
                                                playerCollectables[className].used++;
                                            }
                                            if(this.baseLayout.satisfactoryMap.collectableMarkers[playerCollectables[className].markers[m].pathName] !== undefined)
                                            {
                                                if(className === '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                                                {
                                                    let dataCollected   = parseInt($('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"]').attr('data-collected'));
                                                    let dataTotal       = parseInt($('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"]').attr('data-total'));
                                                    let updatedOpacity  = 1;
                                                        if(collectedStatus === true)
                                                        {
                                                            updatedOpacity = window.SCIM.collectedOpacity;
                                                            dataCollected++;
                                                        }

                                                        this.baseLayout.satisfactoryMap.collectableMarkers[playerCollectables[className].markers[m].pathName].setOpacity(updatedOpacity);

                                                        $('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"]').attr('data-collected', dataCollected);
                                                        $('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"] > .badge').html(new Intl.NumberFormat(this.baseLayout.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.baseLayout.language).format(dataTotal));
                                                }
                                                else
                                                {
                                                    if(collectedStatus === true)
                                                    {
                                                        if(this.baseLayout.satisfactoryMap.availableLayers[playerCollectables[className].layerId].hasLayer(this.baseLayout.satisfactoryMap.collectableMarkers[playerCollectables[className].markers[m].pathName]))
                                                        {
                                                            this.baseLayout.satisfactoryMap.availableLayers[playerCollectables[className].layerId].removeLayer(this.baseLayout.satisfactoryMap.collectableMarkers[playerCollectables[className].markers[m].pathName]);

                                                            let dataCollected   = parseInt($('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"]').attr('data-collected')) + 1;
                                                            let dataTotal       = parseInt($('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"]').attr('data-total'));
                                                                $('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"]').attr('data-collected', dataCollected);
                                                                $('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"] > .badge').html(new Intl.NumberFormat(this.baseLayout.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.baseLayout.language).format(dataTotal));
                                                        }
                                                    }
                                                    else
                                                    {
                                                        if(this.baseLayout.satisfactoryMap.availableLayers[playerCollectables[className].layerId].hasLayer(this.baseLayout.satisfactoryMap.collectableMarkers[playerCollectables[className].markers[m].pathName]) === false)
                                                        {
                                                            this.baseLayout.satisfactoryMap.availableLayers[playerCollectables[className].layerId].addLayer(this.baseLayout.satisfactoryMap.collectableMarkers[playerCollectables[className].markers[m].pathName]);

                                                            let dataCollected   = parseInt($('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"]').attr('data-collected')) - 1;
                                                            let dataTotal       = parseInt($('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"]').attr('data-total'));
                                                                $('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"]').attr('data-collected', dataCollected);

                                                                if(dataCollected === 0)
                                                                {
                                                                    $('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"] > .badge').html(new Intl.NumberFormat(this.baseLayout.language).format(dataTotal));
                                                                }
                                                                else
                                                                {
                                                                    $('.updateLayerState[data-id="' + playerCollectables[className].layerId + '"] > .badge').html(new Intl.NumberFormat(this.baseLayout.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.baseLayout.language).format(dataTotal));
                                                                }
                                                        }
                                                    }
                                                }
                                            }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        return playerCollectables;
    }

    parse()
    {
        $('#statisticsModalCollectables').empty();

        let html                = [];
        let playerCollectables  = this.get();

        html.push('<table class="table mb-0">');

        for(let className in playerCollectables)
        {
            let currentItem = playerCollectables[className];

            if(currentItem.markers !== undefined)
            {
                html.push('<tr>');
                html.push('<td width="74"><img src="' + currentItem.image + '" class="img-fluid img-thumbnail" /></td>');
                html.push('<td><table class="table table-borderless table-sm mb-0">');
                html.push('<tr>');
                html.push('<td>' + currentItem.name + '</td>');
                html.push('<td class="text-right" width="20%">' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.used) + ' / ' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.markers.length) + '</td>');

                if(currentItem.used > 0)
                {
                    html.push('<td class="text-right" width="20%"><button class="btn btn-danger btn-sm resetCollectables" data-id="' + className + '">Reset</button></td>');
                }
                else
                {
                    html.push('<td class="text-right" width="20%"></td>');
                }

                html.push('</tr>');
                html.push('<tr>');
                html.push('<td colspan="3" class="pt-0"><div class="progress"><div class="progress-bar bg-success" style="width: ' + (currentItem.used / currentItem.markers.length * 100) + '%"></div></div></td>');
                html.push('</table></td>');
                html.push('</tr>');
            }
        }

        html.push('</table>');

        $('#statisticsModalCollectables').html(html.join(''));

        $('.resetCollectables').on('click', function(e){
            let currentId = $(e.currentTarget).attr('data-id');
                $(e.currentTarget).parent().html('<i class="fas fa-cog fa-spin"></i>');
                setTimeout(() => {
                    this.reset(currentId);
                }, 50);
        }.bind(this));
    }

    reset(className)
    {
        let collectables        = this.baseLayout.saveGameParser.getCollectables();
        let playerCollectables  = this.baseLayout.playerStatistics.collectables;

        if(className === '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
        {
            this.baseLayout.collectedHardDrives.resetCollected();
        }

        for(let m = 0; m < playerCollectables[className].markers.length; m++)
        {
            let collectedStatus = this.getStatusFromPathName(playerCollectables[className].markers[m].pathName, className);

            if(collectedStatus === true)
            {
                if(this.baseLayout.satisfactoryMap.collectableMarkers[playerCollectables[className].markers[m].pathName] !== undefined)
                {
                    this.baseLayout.satisfactoryMap.collectableMarkers[playerCollectables[className].markers[m].pathName].setOpacity(1);
                }

                let currentObject   = this.baseLayout.saveGameParser.getTargetObject(playerCollectables[className].markers[m].pathName);

                if(currentObject !== null)
                {
                    if(className === '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                    {
                        for(let i = currentObject.properties.length - 1; i >= 0; i--)
                        {
                            if(currentObject.properties[i].name === 'mHasBeenOpened')
                            {
                                currentObject.properties[i].value = 0;
                                break;
                            }
                        }
                    }
                    else
                    {
                        if(playerCollectables[className].markers[m].defaultValue !== undefined)
                        {
                            let defaultProperty = {
                                name: "mPickupItems",
                                type: "StructProperty",
                                value: {
                                    type: "InventoryStack",
                                    values: [
                                        {
                                            name: "NumItems",
                                            type: "IntProperty",
                                            value: playerCollectables[className].markers[m].defaultValue
                                        }
                                    ]
                                }
                            };

                            for(let i = currentObject.properties.length - 1; i >= 0; i--)
                            {
                                if(currentObject.properties[i].name === 'mPickupItems')
                                {
                                    currentObject.properties[i] = defaultProperty;
                                    break;
                                }
                            }
                        }
                        else
                        {
                            for(let i = currentObject.properties.length - 1; i >= 0; i--)
                            {
                                if(currentObject.properties[i].name === 'mPickupItems')
                                {
                                    currentObject.properties.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
                else
                {
                    for(let i = collectables.length - 1; i >= 0; i--)
                    {
                        if(playerCollectables[className].markers[m].pathName === collectables[i].pathName)
                        {
                            //TODO

                            // Removes from collectables...
                            collectables.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }

        return this.parse();
    }

    getStatusFromPathName(pathName, className = null)
    {
        let currentObject       = this.baseLayout.saveGameParser.getTargetObject(pathName);

        if(currentObject !== null)
        {
            if(currentObject.properties.length > 0)
            {
                for(let n = 0; n < currentObject.properties.length; n++)
                {
                    if(currentObject.properties[n].name === 'mHasBeenOpened')
                    {
                        if(currentObject.properties[n].value === 1)
                        {
                            this.baseLayout.collectedHardDrives.setCollected(currentObject.pathName);
                            return true;
                        }
                        else
                        {
                            return false;
                        }
                    }

                    if(currentObject.properties[n].name === 'mPickupItems')
                    {
                        let intValue = null;

                        switch(currentObject.properties[n].value.values[0].type)
                        {
                            case 'IntProperty':
                                intValue = currentObject.properties[n].value.values[0].value;
                                break;
                            case 'StructProperty':
                                if(currentObject.properties[n].value.values[0].value.properties[0] === null)
                                {
                                    intValue = 0;
                                }
                                else
                                {
                                    intValue = currentObject.properties[n].value.values[0].value.properties[0].value;
                                }
                                break;
                            default:
                                console.log('BaseLayout_Statistics_Collectables::getStatusFromPathName', currentObject.properties[n].value.values[0]);
                                break;
                        }

                        if(intValue === 0)
                        {
                            return true;
                        }

                        return false;
                    }

                    if(currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C' && currentObject.properties[n].name === 'mIsEmptied')
                    {
                        if(currentObject.properties[n].value === 1)
                        {
                            return true;
                        }
                    }
                }
            }
        }
        else // Object don't exists, use the old collectable
        {
            if(className !== null)
            {
                let collectables    = this.baseLayout.saveGameParser.getCollectables();

                for(let n = 0; n < collectables.length; n++)
                {
                    if(pathName === collectables[n].pathName)
                    {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}