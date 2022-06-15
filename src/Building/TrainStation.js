/* global Intl, parseFloat */
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_TrainStation
{
    static get availableConnections(){ return ['.PlatformConnection0', '.PlatformConnection1']; }

    static getCompleteTrainStation(baseLayout, currentObject)
    {
        let includedPathName    = [currentObject.pathName];
        let trainStations       = [currentObject];
        let platforms           = Building_TrainStation.getConnectedToStation(baseLayout, currentObject, includedPathName);
            while(platforms.length > 0)
            {
                let newPlatforms = [];
                    for(let i = 0; i < platforms.length; i++)
                    {
                        if(includedPathName.includes(platforms[i].pathName) === false)
                        {
                            includedPathName.push(platforms[i].pathName);
                            trainStations.push(platforms[i]);
                        }

                        newPlatforms = newPlatforms.concat(Building_TrainStation.getConnectedToStation(baseLayout, platforms[i], includedPathName));
                    }

                platforms = newPlatforms;
            }

        return trainStations;
    }

    static getConnectedToStation(baseLayout, currentObject, includedPathName)
    {
        let platforms = [];
            if(currentObject.children !== undefined)
            {
                for(let i = 0; i < currentObject.children.length; i++)
                {
                    let currentChildren = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                        if(currentChildren !== null && currentChildren.className === '/Script/FactoryGame.FGTrainPlatformConnection')
                        {
                            let mConnectedTo = baseLayout.getObjectProperty(currentChildren, 'mConnectedTo');
                                if(mConnectedTo !== null)
                                {
                                    let mConnectedToObject = baseLayout.saveGameParser.getTargetObject(mConnectedTo.pathName);
                                        if(mConnectedToObject !== null && includedPathName.includes(mConnectedToObject.outerPathName) === false)
                                        {
                                            platforms.push(baseLayout.saveGameParser.getTargetObject(mConnectedToObject.outerPathName));
                                        }
                                }
                        }
                }
            }

        return platforms;
    }

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

        let trainStationIdentifier = baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
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
                    });
            }
    }
}