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

    getStatistics(circuitID, includeFilter = null)
    {
        let statistics      = {
                capacity            : 0,
                production          : 0,
                consumption         : 0,
                maxConsumption      : 0,

                powerStored         : 0,
                powerStoredCapacity : 0,
        };
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
                                            // PRODUCTION
                                            let mIsFullBlast                = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mIsFullBlast');
                                            let mDynamicProductionCapacity  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mDynamicProductionCapacity');
                                                if(mDynamicProductionCapacity !== null)
                                                {
                                                    if(mIsFullBlast !== null && mIsFullBlast === 1)
                                                    {
                                                        statistics.production += mDynamicProductionCapacity;
                                                    }

                                                    statistics.capacity += mDynamicProductionCapacity;
                                                }
                                                else
                                                {
                                                    let mBaseProduction             = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mBaseProduction');
                                                        if(mBaseProduction !== null)
                                                        {
                                                            if(mIsFullBlast !== null && mIsFullBlast === 1)
                                                            {
                                                                statistics.production += mBaseProduction;
                                                            }

                                                            statistics.capacity += mBaseProduction;
                                                        }
                                                }

                                            // CONSUMPTION
                                            let mTargetConsumption  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mTargetConsumption');
                                                if(mTargetConsumption !== null)
                                                {
                                                    statistics.consumption += mTargetConsumption;
                                                }

                                            // MAX CONSUMPTION
                                            let buildingData        = this.baseLayout.getBuildingDataFromClassName(currentComponent.className);
                                                if(buildingData !== null && buildingData.powerUsed !== undefined)
                                                {
                                                    statistics.maxConsumption += buildingData.powerUsed;
                                                }

                                            // POWER STORAGE
                                            if(currentComponent.className === '/Game/FactoryGame/Buildable/Factory/PowerStorage/Build_PowerStorageMk1.Build_PowerStorageMk1_C')
                                            {
                                                statistics.powerStored         += Building_PowerStorage.storedCharge(this.baseLayout, currentComponent);
                                                statistics.powerStoredCapacity += Building_PowerStorage.capacityCharge(this.baseLayout, currentComponent);
                                            }
                                        }
                                }
                        }
                    }
            }

            console.log(statistics);
            return statistics;
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
                        let statistics  = this.getStatistics(circuitID);
                            if(statistics.production > statistics.consumption)
                            {
                                return (statistics.production - statistics.consumption) / availablePowerStorageForCharge;
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
                let statistics  = this.getStatistics(circuitID);
                    if(statistics.production < statistics.consumption)
                    {
                        return Math.min(100, (statistics.production - statistics.consumption) / nbPowerStorage.length);
                    }
            }

        return 0;
    }
}