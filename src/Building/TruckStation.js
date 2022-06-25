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

export default class Building_TruckStation
{
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

    static getSign(baseLayout, currentObject)
    {
        let mInfo = Building_TruckStation.getInformation(baseLayout, currentObject);
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
            callback    : Building_TruckStation.updateSign
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
        let currentSign     = Building_TruckStation.getSign(baseLayout, currentObject);

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
                        let mInfo = Building_TruckStation.getInformation(baseLayout, currentObject);
                            if(mInfo !== null)
                            {
                                baseLayout.setObjectProperty(mInfo, 'mBuildingTag', values.mBuildingTag, 'Str');
                            }
                    }
                }
            });
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content         = [];
        let mIsInLoadMode   = baseLayout.getObjectProperty(currentObject, 'mIsInLoadMode');

        // HEADER
        let mBuildingTag    = Building_TruckStation.getSign(baseLayout, currentObject);
            content.push('<div style="position: absolute;margin-top: 15px;margin-left: 20px;width: 390px;font-size: 10px;line-height: 16px;" class="text-warning">');
            if(mBuildingTag !== null)
            {
                content.push('<strong>' + mBuildingTag + '</strong> ');
            }
            content.push('<span class="small">(' + buildingData.name + ')</span></div>');

        // VEHICLE STATION DATA
        content.push('<div style="position: absolute;margin-top: 100px;margin-left: 20px;width: 180px;text-align: center;' + BaseLayout_Tooltip.defaultTextStyle + '">');
        content.push('VEHICLE STATION DATA:<br />');

        content.push('<table class="mb-1 w-100"><tr>');

                content.push('<td>');
                content.push('<i style="font-size: 22px;line-height: 24px;" class="fas fa-battery-bolt"></i><br />');
                //content.push('<span class="small text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.ceil(batteryPerTrip)) + ' per trip</span>');
                content.push('</td>');
                content.push('<td>');
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
                content.push('</td>');

            content.push('</tr></table>');
        content.push('</div>');


        content.push('<div style="position: absolute;margin-top: 220px;margin-left: 20px;width: 180px;text-align: center;" class="text-warning">');
            content.push('<i style="font-size: 28px;line-height: 36px;" class="fas fa-exclamation-triangle"></i><br />');
            content.push('<span>OPERATIONAL</span>');
        content.push('</div>');


        // STATION INFORMATION
        let mInfo                   = Building_TruckStation.getInformation(baseLayout, currentObject);
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

            content.push('<div style="position: absolute;margin-top: 96px;margin-left: 245px;color: #FFFFFF;font-size: 20px;line-height: 24px;"><i class="fas fa-angle-double-right"></i></div>');
            content.push('<div style="position: absolute;margin-top: 96px;margin-left: 277px;color: #FFFFFF;font-size: 10px;line-height: 12px;">');
            content.push('Maximum Transfer Rate:<br /><span class="text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(maximumTransferRate * 100) / 100) + ' stacks per minute</span>');
            content.push('</div>');

            if(mIsInLoadMode !== null && mIsInLoadMode === 0)
            {
                content.push('<div style="position: absolute;margin-top: 130px;margin-left: 245px;color: #FFFFFF;font-size: 20px;line-height: 24px;"><i class="fas fa-sign-in"></i></div>');
                content.push('<div style="position: absolute;margin-top: 130px;margin-left: 277px;color: #FFFFFF;font-size: 10px;line-height: 12px;">');
                content.push('Incoming Transfer Rate:<br /><span class="text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(incomingTransferRate)) + ' items per minute</span>');
                content.push('</div>');
            }
            else
            {
                content.push('<div style="position: absolute;margin-top: 130px;margin-left: 245px;color: #FFFFFF;font-size: 20px;line-height: 24px;"><i class="fas fa-sign-out"></i></div>');
                content.push('<div style="position: absolute;margin-top: 130px;margin-left: 277px;color: #FFFFFF;font-size: 10px;line-height: 12px;">');
                content.push('Outgoing Transfer Rate:<br /><span class="text-warning">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(outgoingTransferRate)) + ' items per minute</span>');
                content.push('</div>');
            }

        // FUEL
        content.push('<div style="position: absolute;margin-top: 448px;margin-left:88px;">');
            content.push(baseLayout.setInventoryTableSlot(baseLayout.getObjectInventory(currentObject, 'mFuelInventory'), 1, 42));
        content.push('</div>');
        content.push('<div style="position: absolute;margin-top: 499px;margin-left: 79px; width: 60px;' + BaseLayout_Tooltip.styleLabels + 'color: #FFFFFF;background: #5b5b5b;"><strong>FUEL</strong></div>');

        // INVENTORY
        content.push('<div style="position: absolute;margin-top: 170px;margin-left: 238px;color: #FFFFFF;font-size: 12px;line-height: 20px;">');
        content.push(baseLayout.setInventoryTableSlot(baseLayout.getObjectInventory(currentObject, 'mInventory'), ((buildingData.maxSlot !== undefined) ? buildingData.maxSlot : null), 28, 'small', null, 8));
        content.push('</div>');

        // STAND BY
        //content.push(BaseLayout_Tooltip.getStandByPanel(baseLayout, currentObject, 354, 413, 381, 343));

        // LOAD MODE
        let imageFile       = 'stationLoadMode.png';
            if(mIsInLoadMode !== null && mIsInLoadMode === 0)
            {
                imageFile = 'stationUnloadMode.png';
            }

            content.push('<div style="position: absolute;margin-top: 460px;margin-left: 280px;width: 153px;height: 106px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/' + imageFile + '?v=' + baseLayout.scriptVersion + ') no-repeat;"></div>');

        return '<div style="width: 500px;height: 566px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_TruckStationBG.png?v=' + baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }
}