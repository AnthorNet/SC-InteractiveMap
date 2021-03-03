import BaseLayout_CircuitSubsystem              from '../BaseLayout/CircuitSubsystem.js';

export default class Building_PowerStorage
{
    static capacityCharge(baseLayout, currentObject)
    {
        return 100;
    }

    static storedCharge(baseLayout, currentObject)
    {
        return baseLayout.getObjectProperty(currentObject, 'mPowerStore', 0);
    }

    static timeUntilFull(baseLayout, currentObject)
    {
        let circuitSubsytem     = new BaseLayout_CircuitSubsystem({baseLayout: baseLayout});
        let objectCircuit       = circuitSubsytem.getObjectCircuit(currentObject);

        let chargeRate          = circuitSubsytem.getPowerStorageChargeRate(objectCircuit.circuitId);
            if(chargeRate > 0)
            {
                let storedCharge    = Building_PowerStorage.storedCharge(baseLayout, currentObject);
                let capacityCharge  = Building_PowerStorage.capacityCharge(baseLayout, currentObject);

                    return (3600 * (capacityCharge / chargeRate)) - (3600 * (capacityCharge / chargeRate) * (storedCharge / capacityCharge));
            }

        return null;
    }
}