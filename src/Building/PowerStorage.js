import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import SubSystem_Circuit                        from '../SubSystem/Circuit.js';

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
        let circuitSubSystem    = new SubSystem_Circuit({baseLayout: baseLayout});
        let objectCircuit       = circuitSubSystem.getObjectCircuit(currentObject);
        let circuitStatistics   = circuitSubSystem.getStatistics(objectCircuit.circuitId);

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
        let circuitSubSystem    = new SubSystem_Circuit({baseLayout: baseLayout});
        let objectCircuit       = circuitSubSystem.getObjectCircuit(currentObject);
        let circuitStatistics   = circuitSubSystem.getStatistics(objectCircuit.circuitId);

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
                    baseLayout.setObjectProperty(currentObject, 'mPowerStore', parseFloat(values.mPowerStore), 'FloatProperty');
                }
            });
    }
}