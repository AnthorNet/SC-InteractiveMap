import Building_PowerStorage                    from '../Building/PowerStorage.js';

export default class BaseLayout_CircuitSubsystem
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.circuitSubSystem   = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.CircuitSubsystem');
    }

    getObjectCircuit(currentObject)
    {
        if(this.circuitSubSystem !== null && this.circuitSubSystem.extra.circuits !== undefined)
        {
            for(let i = 0; i < this.circuitSubSystem.extra.circuits.length; i++)
            {
                let currentSubCircuit = this.baseLayout.saveGameParser.getTargetObject(this.circuitSubSystem.extra.circuits[i].pathName);
                    if(currentSubCircuit !== null)
                    {
                        let mComponents = this.baseLayout.getObjectProperty(currentSubCircuit, 'mComponents');
                            if(mComponents !== null)
                            {
                                let componentsArray = [];
                                    for(let j = 0; j < mComponents.values.length; j++)
                                    {
                                        if(mComponents.values[j].pathName === currentObject.pathName)
                                        {
                                            return this.circuitSubSystem.extra.circuits[i];
                                        }

                                        componentsArray.push(mComponents.values[j].pathName);
                                    }

                                    if(currentObject.children !== undefined)
                                    {
                                        for(let j = 0; j < currentObject.children.length; j++)
                                        {
                                            if(componentsArray.includes(currentObject.children[j].pathName))
                                            {
                                                return this.circuitSubSystem.extra.circuits[i];
                                            }
                                        }
                                    }
                            }
                    }
            }
        }

        return null;
    }

    getCircuitByID(circuitID)
    {
        if(this.circuitSubSystem !== null && this.circuitSubSystem.extra.circuits !== undefined)
        {
            for(let i = 0; i < this.circuitSubSystem.extra.circuits.length; i++)
            {
                if(this.circuitSubSystem.extra.circuits[i].circuitId === circuitID)
                {
                    return this.baseLayout.saveGameParser.getTargetObject(this.circuitSubSystem.extra.circuits[i].pathName);
                }
            }
        }

        return null;
    }

    getProduction(circuitID, includeFilter = null)
    {
        let production      = 0;
        let currentCircuit  = this.getCircuitByID(circuitID);

            if(currentCircuit !== null)
            {
                let mComponents = this.baseLayout.getObjectProperty(currentCircuit, 'mComponents');
                    if(mComponents !== null)
                    {
                        for(let j = 0; j < mComponents.values.length; j++)
                        {
                            let currentComponentPowerConnection = this.baseLayout.saveGameParser.getTargetObject(mComponents.values[j].pathName);
                                if(currentComponentPowerConnection !== null && currentComponentPowerConnection.outerPathName !== undefined && (includeFilter === null || includeFilter.includes(currentComponentPowerConnection.outerPathName)))
                                {
                                    let currentComponent    = this.baseLayout.saveGameParser.getTargetObject(currentComponentPowerConnection.outerPathName);
                                    let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(currentComponent.pathName + '.powerInfo');
                                        if(buildingPowerInfo !== null)
                                        {
                                            let mDynamicProductionCapacity  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mDynamicProductionCapacity');
                                                if(mDynamicProductionCapacity !== null)
                                                {
                                                    production += mDynamicProductionCapacity;
                                                }
                                                else
                                                {
                                                    let mBaseProduction             = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mBaseProduction');
                                                        if(mBaseProduction !== null)
                                                        {
                                                            production += mBaseProduction;
                                                        }
                                                }
                                        }
                                }
                        }
                    }
            }

            return production;
    }

    getConsumption(circuitID, includeFilter = null)
    {
        let consumption = 0;
        let currentCircuit  = this.getCircuitByID(circuitID);

            if(currentCircuit !== null)
            {
                let mComponents = this.baseLayout.getObjectProperty(currentCircuit, 'mComponents');
                    if(mComponents !== null)
                    {
                        for(let j = 0; j < mComponents.values.length; j++)
                        {
                            let currentComponentPowerConnection = this.baseLayout.saveGameParser.getTargetObject(mComponents.values[j].pathName);
                                if(currentComponentPowerConnection !== null && currentComponentPowerConnection.outerPathName !== undefined && (includeFilter === null || includeFilter.includes(currentComponentPowerConnection.outerPathName)))
                                {
                                    let currentComponent    = this.baseLayout.saveGameParser.getTargetObject(currentComponentPowerConnection.outerPathName);
                                    let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(currentComponent.pathName + '.powerInfo');
                                        if(buildingPowerInfo !== null)
                                        {
                                            let mTargetConsumption  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mTargetConsumption');
                                                if(mTargetConsumption !== null)
                                                {
                                                    consumption += mTargetConsumption;
                                                }
                                        }
                                }
                        }
                    }
            }

            return consumption;
    }

    /*
     * POWER SWITCH
     */
    getLinkedCircuits(circuitID)
    {

        return null;
    }

    /*
     * POWER STORAGE
     */
    getAvailablePowerStorage(circuitID)
    {
        let availablePowerStorage   = [];
        let currentCircuit          = this.getCircuitByID(circuitID);

            if(currentCircuit !== null)
            {
                let mComponents = this.baseLayout.getObjectProperty(currentCircuit, 'mComponents');
                    if(mComponents !== null)
                    {
                        for(let j = 0; j < mComponents.values.length; j++)
                        {
                            if(mComponents.values[j].pathName.startsWith('Persistent_Level:PersistentLevel.Build_PowerStorageMk'))
                            {
                                let powerStoragePowerConnection = this.baseLayout.saveGameParser.getTargetObject(mComponents.values[j].pathName);
                                    if(powerStoragePowerConnection !== null && powerStoragePowerConnection.outerPathName !== undefined)
                                    {
                                        availablePowerStorage.push(powerStoragePowerConnection.outerPathName);
                                    }
                            }
                        }
                    }
            }

        return availablePowerStorage;
    }

    getPowerStorageChargeRate(circuitID)
    {
        let availablePowerStorage  = this.getAvailablePowerStorage(circuitID);
            if(availablePowerStorage.length > 0)
            {
                let availablePowerStorageForCharge  = 0;
                    for(let i = 0; i < availablePowerStorage.length; i++)
                    {
                        let powerStorage = this.baseLayout.saveGameParser.getTargetObject(availablePowerStorage[i]);
                            if(powerStorage !== null)
                            {
                                let storedCharge = Building_PowerStorage.storedCharge(this.baseLayout, powerStorage);
                                    if(storedCharge < Building_PowerStorage.capacityCharge(this.baseLayout, powerStorage));
                                    {
                                        availablePowerStorageForCharge++;
                                    }
                            }
                    }

                    if(availablePowerStorageForCharge > 0)
                    {
                        let production  = this.getProduction(circuitID);
                        let consumption = this.getConsumption(circuitID);

                            if(production > consumption)
                            {
                                return Math.min(100, (production - consumption) / availablePowerStorageForCharge);
                            }
                    }
            }

        return 0;
    }

    getPowerStorageDrainRate(circuitID)
    {
        let nbPowerStorage  = this.getAvailablePowerStorage(circuitID);
            if(nbPowerStorage.length > 0)
            {
                let production  = this.getProduction(circuitID);
                let consumption = this.getConsumption(circuitID);

                    if(production < consumption)
                    {
                        return Math.min(100, (production - consumption) / nbPowerStorage.length);
                    }
            }

        return 0;
    }
}