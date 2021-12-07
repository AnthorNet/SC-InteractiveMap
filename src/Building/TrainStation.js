/* global Intl, parseFloat */
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

import SubSystem_Railroad                       from '../SubSystem/Railroad.js';

export default class Building_TrainStation
{
    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-pen',
            text        : 'Update name',
            callback    : Building_TrainStation.updateSign
        });
        contextMenu.push('-');

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateSign(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let railroadSubSystem       = new SubSystem_Railroad({baseLayout: baseLayout});
        let trainStationIdentifier  = railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainStationIdentifier !== null)
            {
                let mStationName    = baseLayout.getObjectProperty(trainStationIdentifier, 'mStationName');

                    BaseLayout_Modal.form({
                        title       : 'Update "<strong>' + buildingData.name + '</strong>" sign',
                        container   : '#leafletMap',
                        inputs      : [{
                            name        : 'mStationName',
                            inputType   : 'text',
                            value       : mStationName
                        }],
                        callback    : function(values)
                        {
                            if(values !== null)
                            {
                                if(values.mStationName !== '')
                                {
                                    if(mStationName !== null)
                                    {
                                        baseLayout.setObjectProperty(trainStationIdentifier, 'mStationName', values.mStationName);
                                    }
                                    else
                                    {
                                        trainStationIdentifier.properties.push({
                                            flags                       : 18,
                                            hasCultureInvariantString   : 1,
                                            historyType                 : 255,
                                            name                        : "mStationName",
                                            type                        : "TextProperty",
                                            value                       : values.mStationName
                                        });
                                    }
                                }
                            }
                        }
                    });
            }
    }
}