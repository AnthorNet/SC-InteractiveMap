/* global Intl */

import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

import Modal_Train_Timetable                    from '../Modal/Train/Timetable.js';

export default class Building_Locomotive
{
    static getTrainName(baseLayout, currentObject, defaultName = null)
    {

        let trainIdentifier = baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let mTrainName      = baseLayout.getObjectProperty(trainIdentifier, 'mTrainName');
                    if(mTrainName !== null)
                    {
                        return mTrainName;
                    }
            }

            if(defaultName !== null)
            {
                return defaultName;
            }

        return null;
    }

    static getFreightWagons(baseLayout, currentObject)
    {
        let includedPathName    = [currentObject.pathName];
        let freightWagons       = [];

        if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
        {
            if(currentObject.extra !== undefined)
            {
                if(currentObject.extra.previous !== undefined && currentObject.extra.previous.pathName !== undefined && currentObject.extra.previous.pathName !== '')
                {
                    let adjacentPreviousWagon   = baseLayout.saveGameParser.getTargetObject(currentObject.extra.previous.pathName);
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
                if(currentObject.extra.next !== undefined && currentObject.extra.next.pathName !== undefined && currentObject.extra.next.pathName !== '')
                {
                    let adjacentNextWagon       = baseLayout.saveGameParser.getTargetObject(currentObject.extra.next.pathName);
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
            if(currentObject.extra.previous !== undefined && currentObject.extra.previous.pathName !== undefined && currentObject.extra.previous.pathName !== '' && includedPathName.includes(currentObject.extra.previous.pathName) === false)
            {
                return baseLayout.saveGameParser.getTargetObject(currentObject.extra.previous.pathName);
            }
            if(currentObject.extra.next !== undefined && currentObject.extra.next.pathName !== undefined && currentObject.extra.next.pathName !== '' && includedPathName.includes(currentObject.extra.next.pathName) === false)
            {
                return baseLayout.saveGameParser.getTargetObject(currentObject.extra.next.pathName);
            }
        }

        return null;
    }

    static isAutoPilotOn(baseLayout, currentObject)
    {
        let trainIdentifier = baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let mIsSelfDrivingEnabled   = baseLayout.getObjectProperty(trainIdentifier, 'mIsSelfDrivingEnabled');
                    if(mIsSelfDrivingEnabled !== null && mIsSelfDrivingEnabled === 1)
                    {
                        return true;
                    }
            }

        return false;
    }

    static isDerailed(baseLayout, currentObject)
    {
        let trainIdentifier = baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let mIsDerailed   = baseLayout.getObjectProperty(trainIdentifier, 'mIsDerailed');
                    if(mIsDerailed !== null && mIsDerailed === 1)
                    {
                        return true;
                    }
            }

        return false;
    }

    static getVelocity(baseLayout, currentObject)
    {
        let trainIdentifier = baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let mSimulationData = baseLayout.getObjectProperty(trainIdentifier, 'mSimulationData');
                    if(mSimulationData !== null)
                    {
                        for(let i = 0; i < mSimulationData.values.length; i++)
                        {
                            if(mSimulationData.values[i].name === 'Velocity')
                            {
                                return mSimulationData.values[i].value / 27.778;
                            }
                        }
                    }
            }

        return null;
    }

    static getTimeTable(baseLayout, currentObject)
    {
        let trainIdentifier = baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let TimeTable       = baseLayout.getObjectProperty(trainIdentifier, 'TimeTable');
                    if(TimeTable !== null)
                    {
                        return baseLayout.saveGameParser.getTargetObject(TimeTable.pathName);
                    }
            }

        return null;
    }

    static getNextStop(baseLayout, currentObject, specificStop = null)
    {
        let timeTable       = Building_Locomotive.getTimeTable(baseLayout, currentObject);
            if(timeTable !== null)
            {
                let mStops          = baseLayout.getObjectProperty(timeTable, 'mStops');
                let mCurrentStop    = baseLayout.getObjectProperty(timeTable, 'mCurrentStop', 0);
                    if(specificStop !== null)
                    {
                        mCurrentStop = specificStop;
                    }

                    if(mStops !== null && mCurrentStop !== null)
                    {
                        if(mStops.values[mCurrentStop] !== undefined)
                        {
                            let nextStop = mStops.values[mCurrentStop];
                                for(let i = 0; i < nextStop.length; i++)
                                {
                                    if(nextStop[i].name === 'Station')
                                    {
                                        let nextStation = baseLayout.saveGameParser.getTargetObject(nextStop[i].value.pathName);
                                            if(nextStation !== null)
                                            {
                                                return nextStation;
                                            }
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
        contextMenu.push({
            icon        : 'fa-pen',
            text        : 'Update name',
            callback    : Building_Locomotive.updateSign
        });
        contextMenu.push({
            text        : 'Turn auto-pilot ' + ((Building_Locomotive.isAutoPilotOn(baseLayout, currentObject)) ? '<strong class="text-danger">Off</strong>' : '<strong class="text-success">On</strong>'),
            callback    : Building_Locomotive.updateAutoPilot
        });
        contextMenu.push('-');

        let timeTable = Building_Locomotive.getTimeTable(baseLayout, currentObject);
            if(timeTable !== null)
            {
                let mStops = baseLayout.getObjectProperty(timeTable, 'mStops');
                    if(mStops !== null)
                    {
                        contextMenu.push({
                            icon        : 'fa-train',
                            text        : 'See timetable',
                            callback    : function(){
                                let modalTimetable = new Modal_Train_Timetable({baseLayout: baseLayout, locomotive: currentObject});
                                    modalTimetable.parse();
                            }
                        });
                        contextMenu.push('-');
                    }
            }

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

        let trainIdentifier = baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let mTrainName      = baseLayout.getObjectProperty(trainIdentifier, 'mTrainName');

                    BaseLayout_Modal.form({
                        title       : 'Update "<strong>' + buildingData.name + '</strong>" sign',
                        container   : '#leafletMap',
                        inputs      : [{
                            name        : 'mTrainName',
                            inputType   : 'text',
                            value       : mTrainName
                        }],
                        callback    : function(values)
                        {
                            if(values.mTrainName !== '')
                            {
                                if(mTrainName !== null)
                                {
                                    baseLayout.setObjectProperty(trainIdentifier, 'mTrainName', values.mTrainName);
                                }
                                else
                                {
                                    trainIdentifier.properties.push({
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
                                baseLayout.deleteObjectProperty(trainIdentifier, 'mTrainName');
                            }
                        }
                    });
            }
    }

    static updateAutoPilot(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let trainIdentifier     = baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let isAutoPilotOn   = Building_Locomotive.isAutoPilotOn(baseLayout, currentObject);
                    if(isAutoPilotOn === true)
                    {
                        baseLayout.deleteObjectProperty(trainIdentifier, 'mIsSelfDrivingEnabled');
                    }
                    else
                    {
                        baseLayout.setObjectProperty(trainIdentifier, 'mIsSelfDrivingEnabled', 1, 'BoolProperty');
                    }
            }
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData, genericTooltipBackgroundStyle)
    {
        let content         = [];

        let mTrainName      = Building_Locomotive.getTrainName(baseLayout, currentObject);
            if(mTrainName !== null)
            {
                content.push('<div><strong>' + mTrainName + ' <em class="small">(' + buildingData.name + ')</em></strong></div>');
            }
            else
            {
                content.push('<div><strong>' + buildingData.name + '</strong></div>');
            }

            content.push('<table class="pt-3"><tr>');
                if(buildingData.image !== undefined)
                {
                    content.push('<td class="pr-3"><img src="' + buildingData.image + '" style="width: 128px;height: 128px;" /></td>');
                }

                content.push('<td><table class="text-left">');

                let mIsDerailed     = Building_Locomotive.isDerailed(baseLayout, currentObject);
                    if(mIsDerailed === true)
                    {
                        content.push('<tr><td colspan="2" class="text-center text-danger blink pb-3" style="font-size: 115%;"><i class="fas fa-engine-warning"></i> <strong>DERAILED</strong> <i class="fas fa-engine-warning"></i></td></tr>');
                    }

                let velocity = Building_Locomotive.getVelocity(baseLayout, currentObject);
                    if(velocity !== null)
                    {
                        content.push('<tr><td>Speed:</td><td class="pl-3 text-right">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(velocity)) + ' km/h</td></tr>');
                    }

                let isAutoPilotOn   = Building_Locomotive.isAutoPilotOn(baseLayout, currentObject);
                    if(isAutoPilotOn === true)
                    {
                        content.push('<tr><td>Auto-pilot:</td><td class="pl-3 text-right text-success">On</td></tr>');

                        let nextStop = Building_Locomotive.getNextStop(baseLayout, currentObject);
                            if(nextStop !== null)
                            {
                                let mStationName = baseLayout.getObjectProperty(nextStop, 'mStationName');
                                    if(mStationName !== null)
                                    {
                                        content.push('<tr><td>Next stop:</td><td class="pl-3 text-right">' + mStationName + '</td></tr>');
                                    }
                            }
                    }
                    else
                    {
                        content.push('<tr><td>Auto-pilot:</td><td class="pl-3 text-right text-danger">Off</td></tr>');
                    }

                let freightWagons   = Building_Locomotive.getFreightWagons(baseLayout, currentObject);
                    if(freightWagons.length > 0)
                    {
                        content.push('<tr><td>Freight wagons:</td><td class="pl-3 text-right">' + new Intl.NumberFormat(baseLayout.language).format(freightWagons.length) + ' </td></tr>');
                    }


                content.push('</table></td>');

            content.push('</tr></table>');

        return '<div class="d-flex" style="' + genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }
}