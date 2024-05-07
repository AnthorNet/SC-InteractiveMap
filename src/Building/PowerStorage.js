import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_PowerStorage
{
    static capacityCharge(baseLayout, currentObject)
    {
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
            if(buildingData !== null && buildingData.powerStored !== undefined)
            {
                return buildingData.powerStored;
            }

        return 100;
    }

    static storedCharge(baseLayout, currentObject)
    {
        return baseLayout.getObjectProperty(currentObject, 'mPowerStore', 0);
    }

    static timeUntilCharged(baseLayout, currentObject)
    {
        let objectCircuit       = baseLayout.circuitSubSystem.getObjectCircuit(currentObject);
        let circuitStatistics   = baseLayout.circuitSubSystem.getStatistics(objectCircuit.circuitId);

            if(circuitStatistics.powerStorageChargeRate > 0)
            {
                let storedCharge    = Building_PowerStorage.storedCharge(baseLayout, currentObject);
                let capacityCharge  = Building_PowerStorage.capacityCharge(baseLayout, currentObject);

                    return (3600 * (capacityCharge / circuitStatistics.powerStorageChargeRate)) - (3600 * (capacityCharge / circuitStatistics.powerStorageChargeRate) * (storedCharge / capacityCharge));
            }

        return null;
    }

    static timeUntilDrained(baseLayout, currentObject)
    {
        let objectCircuit       = baseLayout.circuitSubSystem.getObjectCircuit(currentObject);
        let circuitStatistics   = baseLayout.circuitSubSystem.getStatistics(objectCircuit.circuitId);

            if(circuitStatistics.powerStorageDrainRate > 0)
            {
                let storedCharge    = Building_PowerStorage.storedCharge(baseLayout, currentObject);
                let capacityCharge  = Building_PowerStorage.capacityCharge(baseLayout, currentObject);

                    return (3600 * (capacityCharge / circuitStatistics.powerStorageDrainRate) * (storedCharge / capacityCharge));
            }

        return null;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-battery-half',
            text        : 'Update stored power',
            callback    : Building_PowerStorage.updatePowerStored
        });
        contextMenu.push('-');

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updatePowerStored(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let storedCharge    = Building_PowerStorage.storedCharge(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" stored power',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPowerStore',
                    inputType   : 'number',
                    min         : 0,
                    max         : 100,
                    value       : Math.round(storedCharge)
                }],
                callback    : function(values)
                {
                    baseLayout.setObjectProperty(currentObject, 'mPowerStore', parseFloat(values.mPowerStore), 'Float');
                }
            });
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content             = [];

        let objectCircuit       = baseLayout.circuitSubSystem.getObjectCircuit(currentObject);
        let circuitStatistics   = baseLayout.circuitSubSystem.getStatistics(((objectCircuit !== null) ? objectCircuit.circuitId : null));

        let storedCharge        = Building_PowerStorage.storedCharge(baseLayout, currentObject);
        let capacityCharge      = Building_PowerStorage.capacityCharge(baseLayout, currentObject);
        let percentageCharge    = storedCharge / capacityCharge * 100;
        let chargeRate          = Math.min(capacityCharge, circuitStatistics.powerStorageChargeRate);

        // HEADER
        content.push('<div style="position: absolute;margin-top: 30px;width: 100%;text-align: center;font-size: 16px;" class="text-warning">');
        content.push('<strong class="small">' + buildingData.name + '</strong>');
        content.push('</div>');

        // PROGRESS
        content.push('<div style="position: absolute;margin-top: 55px;margin-left: 22px; width: 60px;height: 175px;border:3px solid #FFFFFF;border-radius: 4px;">');

            content.push('<div style="position: absolute;margin-top: 2px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 80) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge > 80 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 2px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ff33;"' + ((percentageCharge > 80 && percentageCharge < 100) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 80)
            {
                content.push('<div style="position: absolute;margin-top: 2px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 80 && percentageCharge <= 100) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 31px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 60) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge > 60 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 31px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ff66;"' + ((percentageCharge > 60 && percentageCharge <= 80) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 60)
            {
                content.push('<div style="position: absolute;margin-top: 31px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 60 && percentageCharge <= 80) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 60px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 40) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge > 40 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 60px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ff99;"' + ((percentageCharge > 40 && percentageCharge <= 60) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 40)
            {
                content.push('<div style="position: absolute;margin-top: 60px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 40 && percentageCharge <= 60) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 89px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 20) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge > 20 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 89px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ffcc;"' + ((percentageCharge > 20 && percentageCharge <= 40) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 20)
            {
                content.push('<div style="position: absolute;margin-top: 89px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 20 && percentageCharge <= 40) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 118px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 0) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 118px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ffff;"' + ((percentageCharge > 0 && percentageCharge <= 20) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0)
            {
                content.push('<div style="position: absolute;margin-top: 118px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 0 && percentageCharge <= 20) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 147px;width: 56px;height: 24px;background: #FFFFFF;line-height: 24px;text-align: center;" class="small"><strong>' + Math.floor(percentageCharge) + '%</strong></div>');

        content.push('</div>');

        // STATE
        content.push('<div style="position: absolute;margin-top: 55px;margin-left: 90px; width: 100px;height: 175px;color: #FFFFFF;">');
        content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center small" style="line-height: 1;">');

        if(chargeRate >= 0 && circuitStatistics.powerStorageDrainRate === 0 && percentageCharge < 100)
        {
            content.push('<i class="fas fa-stopwatch"></i><br /><span class="small">Time until full</span><br />');

            if(chargeRate > 0)
            {
                let pad                 = function(num, size) { return ('000' + num).slice(size * -1); },
                    time                = parseFloat(Building_PowerStorage.timeUntilCharged(baseLayout, currentObject)).toFixed(3),
                    hours               = Math.floor(time / 60 / 60),
                    minutes             = Math.floor(time / 60) % 60,
                    seconds             = Math.floor(time - minutes * 60);

                    content.push(hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's');
            }
            else
            {
                content.push('-');
            }
            content.push('<br /><br />');
        }
        else
        {
            if(circuitStatistics.powerStorageDrainRate > 0)
            {
                let pad                 = function(num, size) { return ('000' + num).slice(size * -1); },
                    time                = parseFloat(Building_PowerStorage.timeUntilDrained(baseLayout, currentObject)).toFixed(3),
                    hours               = Math.floor(time / 60 / 60),
                    minutes             = Math.floor(time / 60) % 60,
                    seconds             = Math.floor(time - minutes * 60);

                    content.push('<i class="fas fa-stopwatch"></i><br /><span class="small">Time until drained</span><br />');
                    content.push(hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's');
                    content.push('<br /><br />');
            }
        }

        content.push('<i class="fas fa-battery-full"></i><br /><span class="small">Stored Charge</span><br />' + (Math.floor(storedCharge * 10) / 10) + ' / ' + capacityCharge + ' MWh<br /><br />');

        if(chargeRate > 0 && percentageCharge < 100)
        {
            content.push('<i class="fas fa-tachometer-alt-fast"></i><br /><span class="small">Charge Rate</span><br />' + (Math.floor(chargeRate * 10) / 10) + ' MW');
        }
        if(circuitStatistics.powerStorageDrainRate > 0)
        {
            content.push('<i class="fas fa-tachometer-alt-fast"></i><br /><span class="small">Drain Rate</span><br />' + (Math.floor(circuitStatistics.powerStorageDrainRate * 10) / 10) + ' MW');
        }


        content.push('</div></div>');
        content.push('</div>');
        content.push('<div style="position: absolute;margin-top: 240px;margin-left: 46px; width: 120px;' + BaseLayout_Tooltip.styleLabels + '"><strong>POWER STORAGE INFO</strong></div>');

        return '<div style="width: 212px;height: 450px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_PowerStorage_BG.png?v=' + baseLayout.scriptVersion + ');margin: -7px;">' + content.join('') + '</div>';
    }
}