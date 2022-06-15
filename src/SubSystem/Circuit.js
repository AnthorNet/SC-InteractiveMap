import Building_PowerStorage                    from '../Building/PowerStorage.js';
import Building_PowerSwitch                     from '../Building/PowerSwitch.js';

export default class SubSystem_Circuit
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.circuitSubSystem   = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.CircuitSubsystem');
    }



    add(currentObject)
    {
        let mCircuitID = this.baseLayout.getObjectProperty(currentObject, 'mCircuitID');
            if(mCircuitID !== null)
            {
                this.circuitSubSystem.extra.circuits.push({
                    circuitId   : mCircuitID,
                    levelName   : ((currentObject.levelName !== undefined) ? currentObject.levelName : 'Persistent_Level'),
                    pathName    : currentObject.pathName
                });
            }
    }



    getNextId()
    {
        let maxId = 0;
            for(let i = 0; i < this.circuitSubSystem.extra.circuits.length; i++)
            {
                maxId = Math.max(maxId, this.circuitSubSystem.extra.circuits[i].circuitId);
            }

        return maxId + 1;
    }



    getObjectCircuit(currentObject, powerConnection = '.PowerConnection')
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
                                        if(mComponents.values[j].pathName === currentObject.pathName + powerConnection)
                                        {
                                            return this.circuitSubSystem.extra.circuits[i];
                                        }

                                        componentsArray.push(mComponents.values[j].pathName);
                                    }

                                    if(currentObject.children !== undefined && powerConnection === '.PowerConnection')
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
                                                    let mIsSwitchOn      = Building_PowerSwitch.isOn(this.baseLayout, currentSwitch);
                                                        if(mIsSwitchOn === true)
                                                        {
                                                            let usedPowerConnection         = '.' + currentComponentPowerConnection.pathName.split('.').pop();
                                                            let currentSwitchOtherCircuit   = this.getObjectCircuit(currentSwitch, ((usedPowerConnection === '.PowerConnection1') ? '.PowerConnection2' : '.PowerConnection1'));

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
                powerStoredTimeUntilCharged : null,

                powerStorageDrainRate       : 0,
                powerStoredTimeUntilDrained : null,
            };
            if(circuitID === null)
            {
                return statistics;
            }

        let components                      = this.getCircuitsComponents(circuitID);
        let availablePowerStorageForCharge  = [];
        let availablePowerStorageForDrain   = [];

            for(let i = 0; i < components.length; i++)
            {
                let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(components[i] + '.powerInfo');
                    if(buildingPowerInfo !== null)
                    {
                        let currentComponent            = this.baseLayout.saveGameParser.getTargetObject(components[i]);
                        let buildingData                = this.baseLayout.getBuildingDataFromClassName(currentComponent.className);

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

                        if(currentComponent !== null && currentComponent.className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorBiomass.Build_GeneratorBiomass_C')
                        {
                            //TODO:
                        }

                        if(currentComponent !== null && currentComponent.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
                        {
                            let mBaseProduction  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mBaseProduction');
                                if(mBaseProduction !== null)
                                {
                                    statistics.production += mBaseProduction;

                                    // Check max production based on purity
                                    let resourceNode     = this.baseLayout.getObjectProperty(currentComponent, 'mExtractableResource');
                                        if(resourceNode !== null)
                                        {
                                            if(this.baseLayout.satisfactoryMap.collectableMarkers !== undefined && this.baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName] !== undefined)
                                            {
                                                if(this.baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity !== undefined)
                                                {
                                                    if(buildingData !== null && buildingData.powerGenerated[this.baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity] !== undefined)
                                                    {
                                                        statistics.capacity += buildingData.powerGenerated[this.baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity][1];
                                                    }
                                                }
                                            }
                                        }
                                }
                        }

                        // CONSUMPTION
                        let mTargetConsumption  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mTargetConsumption');
                            if(mTargetConsumption !== null)
                            {
                                statistics.consumption += mTargetConsumption;
                            }

                        // MAX CONSUMPTION
                        if(buildingData !== null && buildingData.powerUsed !== undefined)
                        {
                            let clockSpeed                  = this.baseLayout.getClockSpeed(currentComponent);

                                //if(this.baseLayout.saveGameParser.header.saveVersion < 29)
                                //{
                                    statistics.maxConsumption  += buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
                                //}
                                //else
                                //{
                                //    statistics.maxConsumption  += buildingData.powerUsed * clockSpeed;
                                //}
                        }

                        // POWER STORAGE
                        if(currentComponent !== null && currentComponent.className === '/Game/FactoryGame/Buildable/Factory/PowerStorage/Build_PowerStorageMk1.Build_PowerStorageMk1_C')
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

            if(availablePowerStorageForCharge.length > 0)
            {
                if(statistics.production > statistics.consumption)
                {
                    statistics.powerStorageChargeRate       = (statistics.production - statistics.consumption) / availablePowerStorageForCharge.length;
                    statistics.powerStoredTimeUntilCharged  = 0;

                    for(let i = 0; i < availablePowerStorageForCharge.length; i++)
                    {
                        statistics.powerStoredTimeUntilCharged = Math.max(
                            statistics.powerStoredTimeUntilCharged,
                            (3600 * (availablePowerStorageForCharge[i].powerStoredCapacity / statistics.powerStorageChargeRate)) - (3600 * (availablePowerStorageForCharge[i].powerStoredCapacity / statistics.powerStorageChargeRate) * (availablePowerStorageForCharge[i].powerStored / availablePowerStorageForCharge[i].powerStoredCapacity))
                        );
                    }
                }
            }

            if(availablePowerStorageForDrain.length > 0)
            {
                if(statistics.production < statistics.consumption)
                {
                    statistics.powerStorageDrainRate        = (statistics.consumption - statistics.production) / availablePowerStorageForDrain.length;
                    statistics.powerStoredTimeUntilDrained  = 0;

                    for(let i = 0; i < availablePowerStorageForDrain.length; i++)
                    {
                        statistics.powerStoredTimeUntilDrained = Math.max(
                            statistics.powerStoredTimeUntilDrained,
                            (3600 * (availablePowerStorageForDrain[i].powerStoredCapacity / statistics.powerStorageDrainRate) * (availablePowerStorageForDrain[i].powerStored / availablePowerStorageForDrain[i].powerStoredCapacity))
                        );
                    }
                }
            }

            // Can't have more consumption if we don't have stored power!
            if(statistics.powerStored === 0)
            {
                statistics.consumption = Math.min(statistics.consumption, statistics.production);
            }

            return statistics;
    }

    /*
     * DELETE NULLED OBJECTS
     */
    cleanCircuits()
    {
        for(let i = 0; i < this.circuitSubSystem.extra.circuits.length; i++)
        {
            let currentCiruitSubSystem = this.baseLayout.saveGameParser.getTargetObject(this.circuitSubSystem.extra.circuits[i].pathName);

            for(let j = 0; j < currentCiruitSubSystem.properties.length; j++)
            {
                if(currentCiruitSubSystem.properties[j].name === 'mComponents')
                {
                    for(let k = (currentCiruitSubSystem.properties[j].value.values.length - 1); k >= 0; k--)
                    {
                        let currentObject = this.baseLayout.saveGameParser.getTargetObject(currentCiruitSubSystem.properties[j].value.values[k].pathName);
                            if(currentObject === null)
                            {
                                currentCiruitSubSystem.properties[j].value.values.splice(k, 1);
                            }
                    }
                }
            }
        }
    }
}