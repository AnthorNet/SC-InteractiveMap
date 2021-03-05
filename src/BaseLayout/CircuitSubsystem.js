import Building_PowerStorage                    from '../Building/PowerStorage.js';

export default class BaseLayout_CircuitSubsystem
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.circuitSubSystem   = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.CircuitSubsystem');
    }

    getObjectCircuit(currentObject, powerConnection = 'PowerConnection')
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
                                        if(mComponents.values[j].pathName === currentObject.pathName + '.' + powerConnection)
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

    getCircuitsComponents(circuitID, excludeCircuits = [])
    {
        let currentCircuit  = this.getCircuitByID(circuitID);
        let components      = [];
            excludeCircuits.push(circuitID);

            if(currentCircuit !== null)
            {
                let mComponents = this.baseLayout.getObjectProperty(currentCircuit, 'mComponents');
                    if(mComponents !== null)
                    {
                        for(let i = 0; i < mComponents.values.length; i++)
                        {
                                let currentComponentPowerConnection = this.baseLayout.saveGameParser.getTargetObject(mComponents.values[i].pathName);
                                    if(currentComponentPowerConnection !== null && currentComponentPowerConnection.outerPathName !== undefined)
                                    {
                                        components.push(currentComponentPowerConnection.outerPathName);

                                        // Do we need to link another circuit?
                                        if(mComponents.values[i].pathName.startsWith('Persistent_Level:PersistentLevel.Build_PowerSwitch_C_'))
                                        {
                                            let currentSwitch    = this.baseLayout.saveGameParser.getTargetObject(currentComponentPowerConnection.outerPathName);
                                                if(currentSwitch !== null)
                                                {
                                                    let mIsSwitchOn      = this.baseLayout.getObjectProperty(currentSwitch, 'mIsSwitchOn');
                                                        if(mIsSwitchOn !== null && mIsSwitchOn === 1)
                                                        {
                                                            let usedPowerConnection         = currentComponentPowerConnection.pathName.split('.').pop();
                                                            let currentSwitchOtherCircuit   = this.getObjectCircuit(currentSwitch, ((usedPowerConnection === 'PowerConnection1') ? 'PowerConnection2' : 'PowerConnection1'));

                                                                if(currentSwitchOtherCircuit !== null)
                                                                {
                                                                    if(excludeCircuits.includes(currentSwitchOtherCircuit.circuitId) === false)
                                                                    {
                                                                        let mergeComponents = this.getCircuitsComponents(currentSwitchOtherCircuit.circuitId, excludeCircuits);
                                                                            for(let j = 0; j < mergeComponents.length; j++)
                                                                            {
                                                                                components.push(mergeComponents[j]);
                                                                            }
                                                                    }
                                                                }
                                                        }
                                                }
                                        }
                                    }
                        }
                    }
                }

        return components;
    }

    getStatistics(circuitID)
    {
        let statistics      = {
                capacity                    : 0,
                production                  : 0,
                consumption                 : 0,
                maxConsumption              : 0,

                powerStored                 : 0,
                powerStoredCapacity         : 0,

                powerStorageChargeRate      : 0,
                powerStoredTimeUntilFull    : null,

                powerStorageDrainRate       : 0,
                powerStoredTimeUntilEmpty   : null,
            };

        let components                      = this.getCircuitsComponents(circuitID);
        let availablePowerStorageForCharge  = [];
        let availablePowerStorageForDrain   = [];

            for(let i = 0; i < components.length; i++)
            {
                let currentComponent    = this.baseLayout.saveGameParser.getTargetObject(components[i], false, true);
                    if(currentComponent !== null)
                    {
                        let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(currentComponent.pathName + '.powerInfo', false, true);
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

                                if(currentComponent.className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorBiomass.Build_GeneratorBiomass_C')
                                {

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
                                    let powerStored                         = Building_PowerStorage.storedCharge(this.baseLayout, currentComponent);
                                    let powerStoredCapacity                 = Building_PowerStorage.capacityCharge(this.baseLayout, currentComponent);

                                        statistics.powerStored             += powerStored;
                                        statistics.powerStoredCapacity     += powerStoredCapacity;

                                    if(powerStored < powerStoredCapacity)
                                    {
                                        availablePowerStorageForCharge.push({powerStored: powerStored, powerStoredCapacity, powerStoredCapacity});
                                    }
                                    if(powerStored > 0)
                                    {
                                        availablePowerStorageForDrain.push({powerStored: powerStored, powerStoredCapacity, powerStoredCapacity});
                                    }
                                }
                            }
                    }
            }

            if(availablePowerStorageForCharge.length > 0 && statistics.production > statistics.consumption)
            {
                statistics.powerStorageChargeRate   = (statistics.production - statistics.consumption) / availablePowerStorageForCharge.length;
                statistics.powerStoredTimeUntilFull = 0;

                for(let i = 0; i < availablePowerStorageForCharge.length; i++)
                {
                    statistics.powerStoredTimeUntilFull = Math.max(
                        statistics.powerStoredTimeUntilFull,
                        (3600 * (availablePowerStorageForCharge[i].powerStoredCapacity / statistics.powerStorageChargeRate)) - (3600 * (availablePowerStorageForCharge[i].powerStoredCapacity / statistics.powerStorageChargeRate) * (availablePowerStorageForCharge[i].powerStored / availablePowerStorageForCharge[i].powerStoredCapacity))
                    );
                }
            }

            // Can't have more consumption if we don't have stored power!
            if(statistics.powerStored === 0)
            {
                statistics.consumption = Math.min(statistics.consumption, statistics.production);
            }

            return statistics;
    }
}