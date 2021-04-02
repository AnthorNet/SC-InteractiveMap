/* global Intl */

import Modal                                    from '../Modal.js';

import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

import Building_TrainStation                    from '../Building/TrainStation.js';

export default class Building_Locomotive
{
    static getFreightWagons(baseLayout, currentObject)
    {
        let includedPathName    = [currentObject.pathName];
        let freightWagons       = [];

        if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
        {
            if(currentObject.extra !== undefined)
            {
                if(currentObject.extra.previousPathName !== undefined && currentObject.extra.previousPathName !== '')
                {
                    let adjacentPreviousWagon   = baseLayout.saveGameParser.getTargetObject(currentObject.extra.previousPathName);
                        while(adjacentPreviousWagon !== null)
                        {
                            includedPathName.push(adjacentPreviousWagon.pathName);

                            if(adjacentPreviousWagon.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
                            {
                                freightWagons.push(adjacentPreviousWagon);
                            }

                            adjacentPreviousWagon = Building_Locomotive.getAdjacentWagon(baseLayout, adjacentPreviousWagon, includedPathName);
                        }
                }
                if(currentObject.extra.nextPathName !== undefined && currentObject.extra.nextPathName !== '')
                {
                    let adjacentNextWagon       = baseLayout.saveGameParser.getTargetObject(currentObject.extra.nextPathName);
                        while(adjacentNextWagon !== null)
                        {
                            includedPathName.push(adjacentNextWagon.pathName);

                            if(adjacentNextWagon.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
                            {
                                freightWagons.push(adjacentNextWagon);
                            }

                            adjacentNextWagon = Building_Locomotive.getAdjacentWagon(baseLayout, adjacentNextWagon, includedPathName);
                        }
                }
            }
        }

        return freightWagons;
    }

    static getAdjacentWagon(baseLayout, currentObject, includedPathName)
    {
        if(currentObject.extra !== undefined)
        {
            if(currentObject.extra.previousPathName !== undefined && currentObject.extra.previousPathName !== '' && includedPathName.includes(currentObject.extra.previousPathName) === false)
            {
                return baseLayout.saveGameParser.getTargetObject(currentObject.extra.previousPathName);
            }
            if(currentObject.extra.nextPathName !== undefined && currentObject.extra.nextPathName !== '' && includedPathName.includes(currentObject.extra.nextPathName) === false)
            {
                return baseLayout.saveGameParser.getTargetObject(currentObject.extra.nextPathName);
            }
        }

        return null;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let buildingData = baseLayout.getBuildingDataFromClassName(currentObject.className);

            contextMenu.push({
                text: 'Update "' + buildingData.name + '" sign',
                callback: Building_Locomotive.updateSign
            });
            contextMenu.push({separator: true});

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateSign(marker)
    {
        let baseLayout      = marker.baseLayout;
            baseLayout.pauseMap();
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let information     = Building_TrainStation.getInformation(baseLayout, currentObject);
        let mTrainName      = baseLayout.getObjectProperty(information, 'mTrainName');

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" sign',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mTrainName',
                    inputType   : 'text',
                    value       : mTrainName
                }],
                callback    : function(values)
                {
                    this.unpauseMap();

                    if(values === null)
                    {
                        return;
                    }

                    if(values.mTrainName !== '')
                    {
                        if(mTrainName !== null)
                        {
                            this.setObjectProperty(information, 'mTrainName', values.mTrainName);
                        }
                        else
                        {
                            information.properties.push({
                                flags                       : 18,
                                hasCultureInvariantString   : 1,
                                historyType                 : 255,
                                name                        : "mTrainName",
                                type                        : "TextProperty",
                                value                       : values.mTrainName
                            });
                        }
                    }
                    else
                    {
                        this.deleteObjectProperty(information, 'mTrainName');
                    }
                }.bind(baseLayout)
            });
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content         = [];

        let information     = Building_TrainStation.getInformation(baseLayout, currentObject);
        let mTrainName      = baseLayout.getObjectProperty(information, 'mTrainName');
            if(mTrainName !== null)
            {
                content.push('<div><strong>' + mTrainName + ' <em class="small">(' + buildingData.name + ')</em></strong></div>');
            }
            else
            {
                content.push('<div><strong>' + buildingData.name + '</strong></div>');
            }

        let freightWagons   = Building_Locomotive.getFreightWagons(baseLayout, currentObject);
            if(freightWagons.length > 0)
            {
                content.push('<div>' + new Intl.NumberFormat(baseLayout.language).format(freightWagons.length) + ' freight wagons</div>');
            }

        if(buildingData.image !== undefined)
        {
            content.push('<div class="pt-3"><img src="' + buildingData.image + '" style="width: 128px;height: 128px;" /></div>');
        }

        return '<div class="d-flex" style="border: 25px solid #7f7f7f;border-image: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/genericTooltipBackground.png?v=' + baseLayout.scriptVersion + ') 25 repeat;background: #7f7f7f;margin: -7px;' + BaseLayout_Tooltip.defaultTextStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }
}