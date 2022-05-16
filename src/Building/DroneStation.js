/* global Intl, parseFloat */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

/*
    /Script/FactoryGame.FGDroneStationInfo
    /Script/FactoryGame.FGDroneAction_TakeoffSequence
    /Script/FactoryGame.FGDroneAction_DockingSequence
    /Script/FactoryGame.FGDroneAction_RequestDocking
    /Script/FactoryGame.FGDroneAction_TraversePath
*/

export default class Building_DroneStation
{
    static get getMinBatteryUsage(){ return 4; }
    static get getBatteryUsagePerKilometer(){ return 1; }

    /**
     * STATE
     */
    static getInformation(baseLayout, currentObject)
    {
        let mInfo = baseLayout.getObjectProperty(currentObject, 'mInfo');
            if(mInfo !== null)
            {
                let stationInfo = baseLayout.saveGameParser.getTargetObject(mInfo.pathName);
                    if(stationInfo !== null)
                    {
                        return stationInfo;
                    }
            }

        return null;
    }

    static getDrone(baseLayout, currentObject)
    {
        let mStationDrone = baseLayout.getObjectProperty(currentObject, 'mStationDrone');
            if(mStationDrone !== null)
            {
                let stationDrone = baseLayout.saveGameParser.getTargetObject(mStationDrone.pathName);
                    if(stationDrone !== null)
                    {
                        return stationDrone;
                    }
            }

        return null;
    }

    static getPairedStationInformation(baseLayout, currentObject)
    {
        let mInfo = Building_DroneStation.getInformation(baseLayout, currentObject);
            if(mInfo !== null)
            {
                let mPairedStation = baseLayout.getObjectProperty(mInfo, 'mPairedStation');
                    if(mPairedStation !== null)
                    {
                        let stationInfo = baseLayout.saveGameParser.getTargetObject(mPairedStation.pathName);
                            if(stationInfo !== null)
                            {
                                return stationInfo;
                            }
                    }
            }

        return null;
    }

    static getPairedStationDistance(baseLayout, currentObject)
    {
        let mPairedStation = Building_DroneStation.getPairedStationInformation(baseLayout, currentObject);
            if(mPairedStation !== null)
            {
                let mStation = baseLayout.getObjectProperty(mPairedStation, 'mStation');
                    if(mStation !== null)
                    {
                        let mStationObject  = baseLayout.saveGameParser.getTargetObject(mStation.pathName);
                            if(mStationObject !== null)
                            {
                                return BaseLayout_Math.getDistance(mStationObject.transform.translation, currentObject.transform.translation) / 100;
                            }
                    }
            }

        return null;
    }

    static getSign(baseLayout, currentObject)
    {
        let mInfo = Building_DroneStation.getInformation(baseLayout, currentObject);
            if(mInfo !== null)
            {
                let mBuildingTag = baseLayout.getObjectProperty(mInfo, 'mBuildingTag');
                    if(mBuildingTag !== null && mBuildingTag !== '')
                    {
                        return mBuildingTag;
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
            callback    : Building_DroneStation.updateSign
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
        let currentSign     = Building_DroneStation.getSign(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" sign',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mBuildingTag',
                    inputType   : 'text',
                    value       : currentSign
                }],
                callback    : function(values)
                {
                    if(values.mBuildingTag !== '')
                    {
                        let mInfo = Building_DroneStation.getInformation(baseLayout, currentObject);
                            if(mInfo !== null)
                            {
                                baseLayout.setObjectProperty(mInfo, 'mBuildingTag', values.mBuildingTag, 'StrProperty');
                            }
                    }
                }
            });
    }

    /**
     * TOOLTIP
     */
    static getTooltipDroneStatus(baseLayout, currentObject)
    {
        let content         = [];
        let mStationDrone   = Building_DroneStation.getDrone(baseLayout, currentObject);

            if(mStationDrone !== null)
            {
                let mCurrentDockingState    = baseLayout.getObjectProperty(mStationDrone, 'mCurrentDockingState');
                    if(mCurrentDockingState !== null)
                    {
                        for(let i = 0; i < mCurrentDockingState.values.length; i++)
                        {
                            if(mCurrentDockingState.values[i].name === 'State')
                            {
                                switch(mCurrentDockingState.values[i].value.value)
                                {
                                    case 'EDroneDockingState::DS_UNDOCKED':
                                        content.push('<i style="font-size: 28px;line-height: 36px;" class="fas fa-check"></i><br />');
                                        content.push('<span class="text-warning">Undocked</span>');
                                        break;
                                    case 'EDroneDockingState::DS_DOCKING':
                                        content.push('<i style="font-size: 28px;line-height: 36px;" class="fas fa-check"></i><br />');
                                        content.push('<span class="text-warning">Docking</span>');
                                        break;
                                    case 'EDroneDockingState::DS_DOCKED':
                                        content.push('<i style="font-size: 28px;line-height: 36px;" class="fas fa-check"></i><br />');
                                        content.push('<span class="text-warning">Docked</span>');
                                        break;
                                    case 'EDroneDockingState::DS_TAKEOFF':
                                        content.push('<i style="font-size: 28px;line-height: 36px;" class="fas fa-check"></i><br />');
                                        content.push('<span class="text-warning">Takeoff</span>');
                                        break;
                                }

                                break;
                            }
                        }
                    }
                    else
                    {
                        let mCurrentAction = baseLayout.getObjectProperty(mStationDrone, 'mCurrentAction');
                            if(mCurrentAction !== null)
                            {
                                if(mCurrentAction.pathName.includes('FGDroneAction_TraversePath'))
                                {
                                    content.push('<i style="font-size: 28px;line-height: 36px;" class="fas fa-angle-double-right"></i><br />');
                                    content.push('<span class="text-warning">EDS_EN_ROUTE</span>');
                                }
                                if(mCurrentAction.pathName.includes('FGDroneAction_TakeoffSequence'))
                                {
                                    content.push('<i style="font-size: 28px;line-height: 36px;" class="fas fa-check"></i><br />');
                                    content.push('<span class="text-warning">Takeoff</span>');
                                }
                                if(mCurrentAction.pathName.includes('FGDroneAction_DockingSequence'))
                                {
                                    content.push('<i style="font-size: 28px;line-height: 36px;" class="fas fa-check"></i><br />');
                                    content.push('<span class="text-warning">Docking</span>');
                                }
                            }
                    }
            }
            else
            {
                content.push('<i style="font-size: 28px;line-height: 36px;" class="fas fa-exclamation-triangle"></i><br />');
                content.push('<span class="text-warning">No Drone</span>');

            }

        return content.join('');
    }

    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content         = [];

        // HEADER
        let mBuildingTag    = Building_DroneStation.getSign(baseLayout, currentObject);
            content.push('<div style="position: absolute;margin-top: 21px;margin-left: 200px;width: 390px;font-size: 10px;line-height: 16px;" class="text-warning">');
            if(mBuildingTag !== null)
            {
                content.push('<strong>' + mBuildingTag + '</strong> ');
            }
            content.push('<span class="small">(' + buildingData.name + ')</span></div>');

        // DRONE STATUS
        content.push('<div style="position: absolute;margin-top: 16px;margin-left: 20px;width: 140px;text-align: center;' + BaseLayout_Tooltip.defaultTextStyle + '">');
        content.push('DRONE STATUS:<br />');
        content.push(Building_DroneStation.getTooltipDroneStatus(baseLayout, currentObject));
        content.push('</div>');

        // TARGET
        let mPairedStation          = Building_DroneStation.getPairedStationInformation(baseLayout, currentObject);
        let mPairedStationDistance  = Building_DroneStation.getPairedStationDistance(baseLayout, currentObject);
            content.push('<div style="position: absolute;margin-top: 100px;margin-left: 20px;width: 140px;text-align: center;' + BaseLayout_Tooltip.defaultTextStyle + '">');
            content.push('TARGET:');
            if(mPairedStation !== null)
            {
                let mPairedBuildingTag = baseLayout.getObjectProperty(mPairedStation, 'mBuildingTag');
                    if(mPairedBuildingTag !== null)
                    {
                        content.push('<div style="line-height: 13px;">');
                        content.push('<span class="small text-warning">' + mPairedBuildingTag + '</span>');
                        if(mPairedStationDistance !== null)
                        {
                            content.push('<br />');

                            if(mPairedStationDistance > 1000)
                            {
                                content.push('<span class="small text-warning">(' + new Intl.NumberFormat(baseLayout.language).format(Math.round(mPairedStationDistance / 10) / 100) + ' km)</span>');
                            }
                            else
                            {
                                content.push('<span class="small text-warning">(' + new Intl.NumberFormat(baseLayout.language).format(Math.round(mPairedStationDistance)) + ' m)</span>');
                            }
                        }
                        content.push('</div>');
                    }
            }
            else
            {
                content.push('<div><span class="small text-warning">No Destination Set</span></div>');
            }

            content.push('</div>');

        // STATION INFORMATION
        let mInfo                   = Building_DroneStation.getInformation(baseLayout, currentObject);
        let maximumTransferRate     = 0;
        let outgoingTransferRate    = 0;
        let incomingTransferRate    = 0;
        let tripDuration            = 0;
            if(mInfo !== null)
            {
                let mLatestDroneTrips = baseLayout.getObjectProperty(mInfo, 'mLatestDroneTrips');
                    if(mLatestDroneTrips !== null)
                    {
                        let mLatestDroneTripsNumbers = {};
                            for(let i = 0; i < mLatestDroneTrips.values[0].length; i++)
                            {
                                mLatestDroneTripsNumbers[mLatestDroneTrips.values[0][i].name] = mLatestDroneTrips.values[0][i].value;
                            }

                            if(mLatestDroneTripsNumbers.TripDuration !== undefined && mLatestDroneTripsNumbers.TripDuration > 0)
                            {
                                tripDuration = mLatestDroneTripsNumbers.TripDuration;

                                if(mLatestDroneTripsNumbers.OutgoingItemCount !== undefined)
                                {
                                    outgoingTransferRate = mLatestDroneTripsNumbers.OutgoingItemCount * 60 / mLatestDroneTripsNumbers.TripDuration;
                                }
                                if(mLatestDroneTripsNumbers.IncomingItemCount !== undefined)
                                {
                                    incomingTransferRate = mLatestDroneTripsNumbers.IncomingItemCount * 60 / mLatestDroneTripsNumbers.TripDuration;
                                }

                                //TODO: Wrong number?!
                                if(mLatestDroneTripsNumbers.IncomingItemStacks !== undefined || mLatestDroneTripsNumbers.OutgoingItemStacks !== undefined)
                                {
                                    maximumTransferRate = Math.max(mLatestDroneTripsNumbers.IncomingItemStacks, mLatestDroneTripsNumbers.OutgoingItemStacks) * 60 / mLatestDroneTripsNumbers.TripDuration;
                                }
                            }
                    }
            }

            content.push('<div style="position: absolute;margin-top: 74px;margin-left: 205px;color: #FFFFFF;font-size: 20px;line-height: 24px;"><i class="fas fa-angle-double-right"></i></div>');
            content.push('<div style="position: absolute;margin-top: 74px;margin-left: 237px;color: #FFFFFF;font-size: 10px;line-height: 12px;">');
            content.push('Maximum Transfer Rate:<br /><span class="text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(maximumTransferRate * 100) / 100) + ' stacks per minute</span>');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: 108px;margin-left: 205px;color: #FFFFFF;font-size: 20px;line-height: 24px;"><i class="fas fa-sign-out"></i></div>');
            content.push('<div style="position: absolute;margin-top: 108px;margin-left: 237px;color: #FFFFFF;font-size: 10px;line-height: 12px;">');
            content.push('Outgoing Transfer Rate:<br /><span class="text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(outgoingTransferRate)) + ' items per minute</span>');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: 108px;margin-left: 400px;color: #FFFFFF;font-size: 20px;line-height: 24px;"><i class="fas fa-sign-in"></i></div>');
            content.push('<div style="position: absolute;margin-top: 108px;margin-left: 432px;color: #FFFFFF;font-size: 10px;line-height: 12px;">');
            content.push('Incoming Transfer Rate:<br /><span class="text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(incomingTransferRate)) + ' items per minute</span>');
            content.push('</div>');

        // TRIP INFORMATION
        content.push('<div style="position: absolute;margin-top: 160px;margin-left: 10px;width: 160px;text-align: center;' + BaseLayout_Tooltip.defaultTextStyle + '">');
            if(mPairedStation !== null)
            {
                let batteryPerTrip          = Building_DroneStation.getMinBatteryUsage;
                let batteryPerMinute        = 0;

                    if(mPairedStationDistance !== null && mPairedStationDistance > 0)
                    {
                        batteryPerTrip += (Building_DroneStation.getBatteryUsagePerKilometer * mPairedStationDistance / 1000) * 2; // Round trip!
                    }
                    if(tripDuration > 0)
                    {
                        batteryPerMinute    = batteryPerTrip / tripDuration * 60;
                    }

                content.push('<table class="mb-1 w-100"><tr>');

                    content.push('<td>');
                    content.push('<i style="font-size: 22px;line-height: 24px;" class="fas fa-battery-bolt"></i><br />');
                    content.push('<span class="small text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.ceil(batteryPerTrip)) + ' per trip</span>');
                    content.push('</td>');
                    content.push('<td>');
                    content.push('<i style="font-size: 22px;line-height: 24px;" class="fas fa-stopwatch"></i><br />');
                    content.push('<span class="small text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(batteryPerMinute * 100) / 100) + ' per min</span>');
                    content.push('</td>');
                    content.push('<td>');
                    content.push('<i style="font-size: 22px;line-height: 24px;" class="fas fa-sync-alt"></i><br />');

                    let pad                 = function(num, size) { return ('000' + num).slice(size * -1); },
                        time                = parseFloat(tripDuration).toFixed(3),
                        minutes             = Math.floor(time / 60) % 60,
                        seconds             = Math.floor(time - minutes * 60);
                    content.push('<span class="small text-warning">' + pad(minutes, 2) + ':' + pad(seconds, 2) + ' min</span>');
                    content.push('</td>');

                content.push('</tr></table>');
            }

            let powerInfo = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.powerInfo');
                if(powerInfo !== null)
                {
                    let mTargetConsumption = baseLayout.getObjectProperty(powerInfo, 'mTargetConsumption');
                        if(mTargetConsumption !== null)
                        {
                            content.push('<i style="font-size: 22px;line-height: 24px;" class="fas fa-bolt"></i><br />');
                            content.push('<span class="small text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(mTargetConsumption * 10) / 10) + ' MW</span>');
                        }
                }
        content.push('</div>');

        // BATTERY
        content.push('<div style="position: absolute;margin-top: 291px;margin-left:118px;">');
            content.push(baseLayout.setInventoryTableSlot(baseLayout.getObjectInventory(currentObject, 'mBatteryInventory'), 1, 42));
        content.push('</div>');
        content.push('<div style="position: absolute;margin-top: 342px;margin-left: 109px; width: 60px;' + BaseLayout_Tooltip.styleLabels + '"><strong>BATTERY</strong></div>');

        // INPUT INVENTORY
        content.push('<div style="position: absolute;margin-top: 155px;margin-left: 205px;color: #FFFFFF;font-size: 12px;line-height: 20px;">');
        content.push('Outgoing:');
        content.push(baseLayout.setInventoryTableSlot(baseLayout.getObjectInventory(currentObject, 'mInputInventory'), ((buildingData.maxSlot !== undefined) ? buildingData.maxSlot : null), 28, 'small', null, 6));
        content.push('</div>');

        // OUTPUT INVENTORY
        content.push('<div style="position: absolute;margin-top: 155px;margin-left: 400px;color: #FFFFFF;font-size: 12px;line-height: 20px;">');
        content.push('Incoming:');
        content.push(baseLayout.setInventoryTableSlot(baseLayout.getObjectInventory(currentObject, 'mOutputInventory'), ((buildingData.maxSlot !== undefined) ? buildingData.maxSlot : null), 28, 'small', null, 6));
        content.push('</div>');

        // STAND BY
        content.push(BaseLayout_Tooltip.getStandByPanel(baseLayout, currentObject, 322, 525, 349, 455));

        return '<div style="width: 600px;height: 397px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_DroneStation_BG.png?v=' + baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }
}