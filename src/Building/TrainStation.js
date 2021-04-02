/* global Intl, parseFloat */
import Modal                                    from '../Modal.js';

import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_TrainStation
{
    /**
     * STATE
     */
    static getInformation(baseLayout, currentObject)
    {
        for(let i = 0; i < baseLayout.saveGameParser.trainIdentifiers.length; i++)
        {
            let currentIdentifier = baseLayout.saveGameParser.getTargetObject(baseLayout.saveGameParser.trainIdentifiers[i]);
                if(currentIdentifier !== null)
                {
                    for(let j = 0; j < currentIdentifier.properties.length; j++)
                    {
                        if(currentIdentifier.properties[j].type === 'ObjectProperty')
                        {
                            if(currentIdentifier.properties[j].value.pathName === currentObject.pathName)
                            {
                                return currentIdentifier;
                            }
                        }
                    }
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
                callback: Building_TrainStation.updateSign
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
        let mStationName    = baseLayout.getObjectProperty(information, 'mStationName');

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" sign',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mStationName',
                    inputType   : 'text',
                    value       : mStationName
                }],
                callback    : function(values)
                {
                    this.unpauseMap();

                    if(values === null)
                    {
                        return;
                    }

                    if(values.mStationName !== '')
                    {
                        if(mStationName !== null)
                        {
                            this.setObjectProperty(information, 'mStationName', values.mStationName);
                        }
                        else
                        {
                            information.properties.push({
                                flags                       : 18,
                                hasCultureInvariantString   : 1,
                                historyType                 : 255,
                                name                        : "mStationName",
                                type                        : "TextProperty",
                                value                       : values.mStationName
                            });
                        }
                    }
                }.bind(baseLayout)
            });
    }
}