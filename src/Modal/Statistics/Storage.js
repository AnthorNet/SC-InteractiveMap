/* global Intl, gtag */
export default class Modal_Statistics_Storage
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;

        if(options.markers === undefined)
        {
            this.markers = [];
            for(let layerId in this.baseLayout.playerLayers)
            {
                if([
                    'playerRadioactivityLayer', 'playerFoundationsLayer', 'playerWallsLayer', 'playerCratesLayer',
                    'playerPillarsLayer', 'playerWalkwaysLayer', 'playerOrientationLayer',
                    'playerStatuesLayer', 'playerHUBTerminalLayer'
                ].includes(layerId))
                {
                    continue;
                }

                let layerLength = this.baseLayout.playerLayers[layerId].elements.length;

                    for(let i = 0; i < layerLength; i++)
                    {
                        if(this.baseLayout.playerLayers[layerId].elements[i].options.pathName !== undefined)
                        {
                            this.markers.push(this.baseLayout.playerLayers[layerId].elements[i]);
                        }
                    }
            }
        }
        else
        {
            this.markers =  options.markers;
        }

        if(typeof gtag === 'function')
        {
            gtag('event', 'Storage', {event_category: 'Statistics'});
        }
    }

    parse()
    {
        let html = [];
            html.push('<table class="table mb-0">');

        let playerStorage       = {};

        let markersLength = this.markers.length;
        for(let i = 0; i < markersLength; i++)
        {
            let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);
                if(currentObject !== null)
                {
                    let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                        if(buildingData !== null)
                        {
                            if(buildingData.category === 'storage' && buildingData.maxSlot !== undefined)
                            {
                                let inventory = this.baseLayout.getObjectInventory(currentObject, 'mStorageInventory');

                                if(inventory.length > 0)
                                {
                                    for(let i = 0; i < inventory.length; i++)
                                    {
                                        if(inventory[i] !== undefined && inventory[i] !== null)
                                        {
                                            if(playerStorage[inventory[i].className] === undefined)
                                            {
                                                playerStorage[inventory[i].className] = inventory[i];
                                            }
                                            else
                                            {
                                                playerStorage[inventory[i].className].qty += inventory[i].qty;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                }
        }

        let maxInventory        = 0;
        let sortedInventory     = Object.keys(playerStorage)
                                      .sort(function(a,b){
                                          return playerStorage[b].qty - playerStorage[a].qty;
                                      });

        for(let i = 0; i < sortedInventory.length; i++)
        {
            maxInventory += playerStorage[sortedInventory[i]].qty;
        }

        for(let i = 0; i < sortedInventory.length; i++)
        {
            let currentItem = playerStorage[sortedInventory[i]];

            html.push('<tr>');
            html.push('<td width="74"><img src="' + currentItem.image + '" class="img-fluid img-thumbnail" /></td>');
            html.push('<td><table class="table table-borderless table-sm mb-0">');
            html.push('<tr>');
            html.push('<td>' + currentItem.name + '</td>');
            html.push('<td class="text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.qty) + ' units</td>');
            html.push('</tr>');
            html.push('<tr>');
            html.push('<td colspan="2" class="pt-0"><div class="progress"><div class="progress-bar bg-secondary" style="width: ' + (currentItem.qty / maxInventory * 100) + '%"></div></div></td>');
            html.push('</table></td>');
            html.push('</tr>');
        }

        html.push('</table>');

        return html.join('');
    }
}