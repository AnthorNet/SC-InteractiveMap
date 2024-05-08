import SubSystem                                from '../SubSystem.js';

import Building_PowerStorage                    from '../Building/PowerStorage.js';
import Building_PowerSwitch                     from '../Building/PowerSwitch.js';

import Modal_Power_CircuitsBreakPriority        from '../Modal/Power/CircuitsBreakPriority.js';

export default class SubSystem_Circuit extends SubSystem
{
    static get totalPriorityGroups(){ return 8; }

    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.CircuitSubsystem';
        super(options);

        this.circuitsColor      = {};
        this.prioritySwitches   = [];

        for(let i = 0; i <= SubSystem_Circuit.totalPriorityGroups; i++)
        {
            this.prioritySwitches[i] = [];
        }
    }



    add(currentObject)
    {
        let mCircuitID = this.baseLayout.getObjectProperty(currentObject, 'mCircuitID');
            if(mCircuitID !== null)
            {
                this.subSystem.extra.circuits.push({
                    circuitId   : mCircuitID,
                    levelName   : ((currentObject.levelName !== undefined) ? currentObject.levelName : 'Persistent_Level'),
                    pathName    : currentObject.pathName
                });
            }
    }



    getNextId()
    {
        let maxId = 0;
            for(let i = 0; i < this.subSystem.extra.circuits.length; i++)
            {
                maxId = Math.max(maxId, this.subSystem.extra.circuits[i].circuitId);
            }

        return maxId + 1;
    }



    getObjectCircuit(currentObject, powerConnection = '.PowerConnection')
    {
        if(this.subSystem !== null && this.subSystem.extra.circuits !== undefined)
        {
            for(let i = 0; i < this.subSystem.extra.circuits.length; i++)
            {
                let currentSubCircuit = this.baseLayout.saveGameParser.getTargetObject(this.subSystem.extra.circuits[i].pathName);
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
                                            return this.subSystem.extra.circuits[i];
                                        }
                                        if(mComponents.values[j].pathName === currentObject.pathName + powerConnection)
                                        {
                                            return this.subSystem.extra.circuits[i];
                                        }

                                        componentsArray.push(mComponents.values[j].pathName);
                                    }

                                    if(currentObject.children !== undefined && powerConnection === '.PowerConnection')
                                    {
                                        for(let j = 0; j < currentObject.children.length; j++)
                                        {
                                            if(componentsArray.includes(currentObject.children[j].pathName))
                                            {
                                                return this.subSystem.extra.circuits[i];
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
        if(this.subSystem !== null && this.subSystem.extra.circuits !== undefined)
        {
            for(let i = 0; i < this.subSystem.extra.circuits.length; i++)
            {
                if(this.subSystem.extra.circuits[i].circuitId === circuitID)
                {
                    return this.baseLayout.saveGameParser.getTargetObject(this.subSystem.extra.circuits[i].pathName);
                }
            }
        }

        return null;
    }

    getCircuitColor(circuitID)
    {
        if(this.circuitsColor[circuitID] === undefined)
        {
            let rgb                 = [0, 0, 0];
            let seed                = 69;
            let str                 = circuitID + 'x';

            let h1                  = 0xdeadbeef ^ seed;
            let h2                  = 0x41c6ce57 ^ seed;
                for(let i = 0, ch; i < str.length; i++)
                {
                    ch = str.charCodeAt(i);
                    h1 = Math.imul(h1 ^ ch, 2654435761);
                    h2 = Math.imul(h2 ^ ch, 1597334677);
                }
            h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
            h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);

            let hash = 4294967296 * (2097151 & h2) + (h1>>>0);
                for(let i = 0; i < 3; i++)
                {
                    rgb[i] = hash >> (i * 8) & 255;
                    rgb[i] = Math.max(69, rgb[i]);
                }

            this.circuitsColor[circuitID] = rgb;
        }

        return this.circuitsColor[circuitID];
    }

    getCircuitComponents(circuitID, excludeCircuits = [])
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
                                        //TODO: Do we need to link double wall pole?
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
                                                                        let mergeComponents = this.getCircuitComponents(currentSwitchOtherCircuit.circuitId, excludeCircuits);
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
                productionBoost             : 0,
                consumption                 : 0,
                maxConsumption              : 0,

                powerStored                 : 0,
                powerStoredCapacity         : 0,

                powerStorageChargeRate      : 0,
                powerStoredTimeUntilCharged : null,

                powerStorageDrainRate       : 0,
                powerStoredTimeUntilDrained : null,

                alienPowerBuildings         : {}
            };
            if(circuitID === null)
            {
                return statistics;
            }

        let components                      = this.getCircuitComponents(circuitID);
        let availablePowerStorageForCharge  = [];
        let availablePowerStorageForDrain   = [];
        let availableAlienPowerBuilding     = [];

            for(let i = 0; i < components.length; i++)
            {
                let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(components[i] + '.powerInfo');
                    if(buildingPowerInfo !== null)
                    {
                        let currentComponent            = this.baseLayout.saveGameParser.getTargetObject(components[i]);
                        let buildingData                = this.baseLayout.getBuildingDataFromClassName(currentComponent.className);

                        if(currentComponent.className === '/Game/FactoryGame/Buildable/Factory/AlienPower/Build_AlienPowerBuilding.Build_AlienPowerBuilding_C')
                        {
                            availableAlienPowerBuilding.push(currentComponent);
                            continue;
                        }

                        // PRODUCTION
                        let fuelClass = this.baseLayout.getObjectProperty(currentComponent, 'mCurrentFuelClass');
                            if(fuelClass !== null && this.baseLayout.getObjectProperty(currentComponent, 'mIsProductionPaused') === null)
                            {
                                let mDynamicProductionCapacity  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mDynamicProductionCapacity');
                                    if(mDynamicProductionCapacity !== null)
                                    {
                                        statistics.production += mDynamicProductionCapacity;
                                    }
                                    else
                                    {
                                        let mIsFullBlast = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mIsFullBlast');
                                            if(mIsFullBlast !== null && mIsFullBlast === 1)
                                            {
                                                statistics.production += buildingData.powerGenerated;
                                            }
                                    }
                            }

                        if(buildingData !== null && buildingData.powerGenerated !== undefined)
                        {
                            statistics.capacity   += buildingData.powerGenerated;
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
                            let clockSpeed                  = this.baseLayout.overclockingSubSystem.getClockSpeed(currentComponent);
                                if(this.baseLayout.saveGameParser.header.saveVersion >= 33)
                                {
                                    let productionBoost             = this.baseLayout.overclockingSubSystem.getProductionBoost(currentComponent);
                                        statistics.maxConsumption  += buildingData.powerUsed * Math.pow(clockSpeed, 1.321929) * Math.pow(productionBoost, 2);
                                }
                                else
                                {
                                    statistics.maxConsumption  += buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
                                }
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

            if(availableAlienPowerBuilding.length > 0)
            {
                for(let i = 0; i < availableAlienPowerBuilding.length; i++)
                {
                    let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(availableAlienPowerBuilding[i].pathName + '.powerInfo');
                        if(buildingPowerInfo !== null)
                        {
                            let mBaseProduction = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mBaseProduction');
                                if(mBaseProduction !== null)
                                {
                                    statistics.production += mBaseProduction;
                                }
                        }
                }

                for(let i = 0; i < availableAlienPowerBuilding.length; i++)
                {
                    let circuitBoost            = 0.1;
                    let currentObject           = this.baseLayout.saveGameParser.getTargetObject(availableAlienPowerBuilding[i].pathName);
                        if(currentObject !== null)
                        {
                            let mCurrentFuelClass       = this.baseLayout.getObjectProperty(currentObject, 'mCurrentFuelClass');
                                if(mCurrentFuelClass !== null && mCurrentFuelClass.pathName === '/Game/FactoryGame/Resource/Parts/AlienPowerFuel/Desc_AlienPowerFuel.Desc_AlienPowerFuel_C')
                                {
                                    circuitBoost = 0.3;
                                }
                        }

                        statistics.alienPowerBuildings[availableAlienPowerBuilding[i].pathName]  = statistics.production * circuitBoost;
                        statistics.productionBoost                                              += statistics.production * circuitBoost;
                }
            }

            if(availablePowerStorageForCharge.length > 0)
            {
                if((statistics.production + statistics.productionBoost) > statistics.consumption)
                {
                    statistics.powerStorageChargeRate       = ((statistics.production + statistics.productionBoost) - statistics.consumption) / availablePowerStorageForCharge.length;
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
                if((statistics.production + statistics.productionBoost) < statistics.consumption)
                {
                    statistics.powerStorageDrainRate        = (statistics.consumption - (statistics.production + statistics.productionBoost)) / availablePowerStorageForDrain.length;
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
                statistics.consumption = Math.min(statistics.consumption, (statistics.production + statistics.productionBoost));
            }

            return statistics;
    }

    /**
     * PRIORITY SWITCH
     */
    addPrioritySwitch(currentObject)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/PriorityPowerSwitch/Build_PriorityPowerSwitch.Build_PriorityPowerSwitch_C')
        {
            this.prioritySwitches[Building_PowerSwitch.getPriorityGroup(this.baseLayout, currentObject)].push(currentObject.pathName);

            if($('#modalPowerCircuitsBreakPriority').css('display') === 'none')
            {
                $('#modalPowerCircuitsBreakPriority')
                    .show()
                    .on('click', () => {
                        let modalPowerCircuitsBreakPriority = new Modal_Power_CircuitsBreakPriority({
                                baseLayout      : this.baseLayout
                            });
                            modalPowerCircuitsBreakPriority.parse();
                    });
            }
        }
    }

    /*
     * DELETE NULLED OBJECTS
     */
    cleanCircuits()
    {
        for(let i = 0; i < this.subSystem.extra.circuits.length; i++)
        {
            let currentCiruitSubSystem  = this.baseLayout.saveGameParser.getTargetObject(this.subSystem.extra.circuits[i].pathName);
            let mComponents             = this.baseLayout.getObjectProperty(currentCiruitSubSystem, 'mComponents');
                if(mComponents !== null)
                {
                    for(let k = (mComponents.values.length - 1); k >= 0; k--)
                    {
                        let currentObject = this.baseLayout.saveGameParser.getTargetObject(mComponents.values[k].pathName);
                            if(currentObject === null)
                            {
                                mComponents.values.splice(k, 1);
                            }
                    }
                }
        }
    }

    /**
     * TOOLTIP
     */
    getStatisticsGraph(circuitID, width = 315)
    {
        let circuitStatistics   = this.getStatistics(circuitID);
        let content             = [];
        let maxValue            = Math.max(
                                    circuitStatistics.consumption,
                                    (circuitStatistics.production + circuitStatistics.productionBoost),
                                    circuitStatistics.capacity,
                                    circuitStatistics.maxConsumption
                                );

            content.push('<div class="d-flex" style="margin: -9px;margin-top: -11px;height: 113px;">');
                content.push('<div class="justify-content-center align-self-center h-100 text-center" style="width: ' + ((circuitStatistics.powerStoredCapacity > 0) ? (width - 89) : (width - 19)) + 'px;">');
                    content.push('<div style="height: 75px;padding-top: 5px;position: relative;">');
                        content.push('<hr style="position: absolute;width: 100%;margin-top: ' + Math.round(65 - (circuitStatistics.consumption / maxValue * 65)) + 'px;background-color: #e59344;" />')
                        content.push('<hr style="position: absolute;width: 100%;margin-top: ' + Math.round(65 - ((circuitStatistics.production + circuitStatistics.productionBoost) / maxValue * 65)) + 'px;background-color: #717172;" />')

                        if(circuitStatistics.productionBoost > 0)
                        {
                            content.push('<hr style="position: absolute;width: 100%;margin-top: ' + Math.round(65 - (circuitStatistics.productionBoost / maxValue * 65)) + 'px;background-color: #9f6d9f;" />')
                        }

                        content.push('<hr style="position: absolute;width: 100%;margin-top: ' + Math.round(65 - (circuitStatistics.capacity / maxValue * 65)) + 'px;background-color: #cccbcb;" />')
                        content.push('<hr style="position: absolute;width: 100%;margin-top: ' + Math.round(65 - (circuitStatistics.maxConsumption / maxValue * 65)) + 'px;background-color: #62aac7;" />')
                    content.push('</div>');

                    content.push('<div style="border-top: 1px solid #666666;height: 30px;padding-top: 3px;">');
                        content.push('<table style="line-height: ' + ((circuitStatistics.productionBoost > 0) ? 8 : 12) + 'px;font-size: 9px;" class="w-100">');

                            content.push('<tr>');
                                content.push('<td style="color: #e59344;">Consum. <strong>' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(circuitStatistics.consumption * 10) / 10) + 'MW</strong></td>');
                                content.push('<td style="color: #717172;">Production <strong>' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round((circuitStatistics.production + circuitStatistics.productionBoost) * 10) / 10) + 'MW</strong></td>');
                            content.push('</tr>');

                            content.push('<tr>');
                                content.push('<td style="color: #cccbcb;">Capacity <strong>' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(circuitStatistics.capacity * 10) / 10) + 'MW</strong></td>');
                                content.push('<td style="color: #62aac7;">Max. Cons. <strong>' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(circuitStatistics.maxConsumption * 10) / 10) + 'MW</strong></td>');
                            content.push('</tr>');

                            if(circuitStatistics.productionBoost > 0)
                            {
                                content.push('<tr>');
                                    content.push('<td colspan="2" style="color: #9f6d9f;">Production Boost <strong>' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(circuitStatistics.productionBoost * 10) / 10) + 'MW</strong></td>');
                                content.push('</tr>');
                            }

                    content.push('</table>');
                    content.push('</div>');
                content.push('</div>');

                if(circuitStatistics.powerStoredCapacity > 0)
                {
                    let percentageCharge = circuitStatistics.powerStored / circuitStatistics.powerStoredCapacity * 100;
                        content.push('<div class="h-100 text-center" style="width: 70px;background-color: #151515;margin-right: -1px;">');

                            // PROGRESS
                            content.push('<div style="position: absolute;margin-top: 3px;margin-left: 5px; width: 60px;height: 89px;border:2px solid #FFFFFF;border-radius: 4px;">');

                                content.push('<div style="position: absolute;margin-top: 1px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 80) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge > 80 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 1px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ff33;"' + ((percentageCharge > 80 && percentageCharge < 100) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 80)
                                {
                                    content.push('<div style="position: absolute;margin-top: 1px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 80 && percentageCharge <= 100) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 15px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 60) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge > 60 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 15px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ff66;"' + ((percentageCharge > 60 && percentageCharge <= 80) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 60)
                                {
                                    content.push('<div style="position: absolute;margin-top: 15px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 60 && percentageCharge <= 80) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 29px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 40) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge > 40 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 29px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ff99;"' + ((percentageCharge > 40 && percentageCharge <= 60) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 40)
                                {
                                    content.push('<div style="position: absolute;margin-top: 29px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 40 && percentageCharge <= 60) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 43px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 20) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge > 20 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 43px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ffcc;"' + ((percentageCharge > 20 && percentageCharge <= 40) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 20)
                                {
                                    content.push('<div style="position: absolute;margin-top: 43px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 20 && percentageCharge <= 40) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 57px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 0) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 57px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ffff;"' + ((percentageCharge > 0 && percentageCharge <= 20) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0)
                                {
                                    content.push('<div style="position: absolute;margin-top: 57px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 0 && percentageCharge <= 20) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 71px;width: 56px;height: 15px;background: #FFFFFF;line-height: 15px;text-align: center;" class="small ' + ((circuitStatistics.powerStorageDrainRate > 0) ? 'text-warning' : '') + '"><strong>' + Math.floor(percentageCharge) + '%</strong></div>');

                                if(circuitStatistics.powerStoredTimeUntilCharged !== null)
                                {
                                    let pad                 = function(num, size) { return ('000' + num).slice(size * -1); },
                                        time                = parseFloat(circuitStatistics.powerStoredTimeUntilCharged).toFixed(3),
                                        hours               = Math.floor(time / 60 / 60),
                                        minutes             = Math.floor(time / 60) % 60,
                                        seconds             = Math.floor(time - minutes * 60);

                                        content.push('<div style="position: absolute;margin-top: 90px;width: 56px;height: 15px;color: #FFFFFF;line-height: 15px;text-align: center;font-size: 9px;"><strong>' + hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's</strong></div>');
                                }
                                if(circuitStatistics.powerStoredTimeUntilDrained !== null)
                                {
                                    let pad                 = function(num, size) { return ('000' + num).slice(size * -1); },
                                        time                = parseFloat(circuitStatistics.powerStoredTimeUntilDrained).toFixed(3),
                                        hours               = Math.floor(time / 60 / 60),
                                        minutes             = Math.floor(time / 60) % 60,
                                        seconds             = Math.floor(time - minutes * 60);

                                        content.push('<div style="position: absolute;margin-top: 90px;width: 56px;height: 15px;color: #FFFFFF;line-height: 15px;text-align: center;font-size: 9px;"><strong>' + hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's</strong></div>');
                                }

                            content.push('</div>');

                        content.push('</div>');
                }
            content.push('</div>');

        return content.join('');
    }
}