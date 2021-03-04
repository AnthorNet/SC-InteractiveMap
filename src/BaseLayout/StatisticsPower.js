/* global Intl, gtag */
import BaseLayout_CircuitSubsystem              from '../BaseLayout/CircuitSubsystem.js';

export default class BaseLayout_Statistics_Power
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;

        if(options.markersSelected === undefined)
        {
            this.markers = [];
            for(let layerId in this.baseLayout.playerLayers)
            {
                if([
                    'playerRadioactivityLayer', 'playerFoundationsLayer', 'playerWallsLayer', 'playerCratesLayer',
                    'playerPillarsLayer', 'playerWalkwaysLayer', 'playerOrientationLayer',
                    'playerStatuesLayer', 'playerHUBTerminalLayer'
                ].includes(layerId))
                {
                    continue;
                }

                let layerLength = this.baseLayout.playerLayers[layerId].elements.length;

                    for(let i = 0; i < layerLength; i++)
                    {
                        if(this.baseLayout.playerLayers[layerId].elements[i].options.pathName !== undefined)
                        {
                            this.markers.push(this.baseLayout.playerLayers[layerId].elements[i]);
                        }
                    }
            }
        }
        else
        {
            this.markers =  options.markersSelected;
        }

        if(typeof gtag === 'function')
        {
            gtag('event', 'Power', {event_category: 'Statistics'});
        }
    }

    parse()
    {
        let circuits                = {};
            circuits['0']             = {
                                        playerPowerUsed         : 0,
                                        playerPowerUsedMax      : 0,
                                        playerPowerGenerated    : 0,

                                        playerPowerShards       : 0,

                                        playerFuel              : {}
                                    };

        let markersLength = this.markers.length;
        for(let i = 0; i < markersLength; i++)
        {
            let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);
                if(currentObject !== null)
                {
                    let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                        if(buildingData !== null)
                        {
                            let circuitSubsystem    = new BaseLayout_CircuitSubsystem({baseLayout: this.baseLayout});
                            let objectCircuit       = circuitSubsystem.getObjectCircuit(currentObject);
                                if(objectCircuit !== null && circuits[objectCircuit.circuitId] === undefined)
                                {
                                    circuits[objectCircuit.circuitId] = {
                                        playerPowerUsed         : 0,
                                        playerPowerUsedMax      : 0,
                                        playerPowerGenerated    : 0,

                                        playerPowerShards       : 0,

                                        playerFuel              : {}
                                    };
                                }

                            let powerUsed       = null;
                            let maxPowerUser    = null;
                                if(buildingData.powerUsed !== undefined && buildingData.powerUsed > 0)
                                {
                                    if(buildingData.category === 'vehicle' && buildingData.mapLayer !== undefined && buildingData.mapLayer === 'playerVehiculesLayer')
                                    {

                                    }
                                    else
                                    {
                                        let clockSpeed      = this.baseLayout.getClockSpeed(currentObject);
                                            maxPowerUser    = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
                                    }
                                }
                                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/HadronCollider/Build_HadronCollider.Build_HadronCollider_C')
                                {
                                    let clockSpeed      = this.baseLayout.getClockSpeed(currentObject);
                                        maxPowerUser    = 500 * Math.pow(clockSpeed, 1.6);
                                }

                                let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.powerInfo');
                                    if(buildingPowerInfo !== null)
                                    {
                                        let mTargetConsumption  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mTargetConsumption');
                                            if(mTargetConsumption !== null)
                                            {
                                                powerUsed = Math.round(mTargetConsumption);
                                            }
                                    }

                                if(powerUsed !== null)
                                {
                                    circuits['0'].playerPowerUsed  += powerUsed;

                                    if(objectCircuit !== null)
                                    {
                                        circuits[objectCircuit.circuitId].playerPowerUsed += powerUsed;
                                    }

                                    circuits['0'].playerPowerUsedMax += maxPowerUser;

                                    if(objectCircuit !== null)
                                    {
                                        circuits[objectCircuit.circuitId].playerPowerUsedMax += maxPowerUser;
                                    }
                                }

                            if(buildingData.category === 'generator')
                            {
                                let fuelEnergyValue     = null;
                                let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
                                let powerGenerated      = buildingData.powerGenerated * Math.pow(clockSpeed, 1/1.3);
                                let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.powerInfo');

                                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorIntegratedBiomass.Build_GeneratorIntegratedBiomass_C')
                                    {
                                        powerGenerated = 20 * Math.pow(clockSpeed, 1/1.3);
                                    }
                                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorNuclear/Build_GeneratorNuclear.Build_GeneratorNuclear_C')
                                    {
                                        powerGenerated = buildingData.powerGenerated * Math.pow(clockSpeed, 1/1.321928);
                                    }
                                    if(buildingPowerInfo !== null)
                                    {
                                        let mBaseProduction             = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mBaseProduction');
                                            if(mBaseProduction !== null)
                                            {
                                                powerGenerated = mBaseProduction;
                                            }
                                        let mDynamicProductionCapacity  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mDynamicProductionCapacity');
                                            if(mDynamicProductionCapacity !== null)
                                            {
                                                powerGenerated = mDynamicProductionCapacity;
                                            }
                                    }

                                let fuelClass           = this.baseLayout.getObjectProperty(currentObject, 'mCurrentFuelClass');
                                    if(fuelClass !== null && this.baseLayout.getObjectProperty(currentObject, 'mIsProductionPaused') === null)
                                    {
                                        let fuelItem = this.baseLayout.getItemDataFromClassName(fuelClass.pathName);
                                            if(fuelItem !== null && fuelItem.energy !== undefined)
                                            {
                                                fuelEnergyValue = fuelItem.energy;

                                                if(circuits['0'].playerFuel[fuelItem.className] === undefined)
                                                {
                                                    circuits['0'].playerFuel[fuelItem.className] = {
                                                        name            : fuelItem.name,
                                                        buildingName    : buildingData.name,
                                                        buildingCount   : 1,
                                                        image           : fuelItem.image,
                                                        category        : fuelItem.category,
                                                        powerGenerated  : powerGenerated,
                                                        consumed        : (60 / (fuelEnergyValue / powerGenerated))
                                                    };
                                                }
                                                else
                                                {
                                                    circuits['0'].playerFuel[fuelItem.className].buildingCount++;
                                                    circuits['0'].playerFuel[fuelItem.className].consumed += (60 / (fuelEnergyValue / powerGenerated));
                                                    circuits['0'].playerFuel[fuelItem.className].powerGenerated += powerGenerated;
                                                }

                                                if(objectCircuit !== null)
                                                {
                                                    if(circuits[objectCircuit.circuitId].playerFuel[fuelItem.className] === undefined)
                                                    {
                                                        circuits[objectCircuit.circuitId].playerFuel[fuelItem.className] = {
                                                            name            : fuelItem.name,
                                                            buildingName    : buildingData.name,
                                                            buildingCount   : 1,
                                                            image           : fuelItem.image,
                                                            category        : fuelItem.category,
                                                            powerGenerated  : powerGenerated,
                                                            consumed        : (60 / (fuelEnergyValue / powerGenerated))
                                                        };
                                                    }
                                                    else
                                                    {
                                                        circuits[objectCircuit.circuitId].playerFuel[fuelItem.className].buildingCount++;
                                                        circuits[objectCircuit.circuitId].playerFuel[fuelItem.className].consumed += (60 / (fuelEnergyValue / powerGenerated));
                                                        circuits[objectCircuit.circuitId].playerFuel[fuelItem.className].powerGenerated += powerGenerated;
                                                    }
                                                }

                                                circuits['0'].playerPowerGenerated += powerGenerated;

                                                if(objectCircuit !== null)
                                                {
                                                    circuits[objectCircuit.circuitId].playerPowerGenerated += powerGenerated;
                                                }
                                            }
                                    }

                                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
                                {
                                    if(circuits['0'].playerFuel[buildingData.className] === undefined)
                                    {
                                        circuits['0'].playerFuel[buildingData.className] = {
                                            name            : buildingData.name,
                                            buildingName    : null,
                                            buildingCount   : 1,
                                            image           : buildingData.image,
                                            powerGenerated  : powerGenerated,
                                            consumed        : 0
                                        };
                                    }
                                    else
                                    {
                                        circuits['0'].playerFuel[buildingData.className].buildingCount++;
                                        circuits['0'].playerFuel[buildingData.className].powerGenerated += powerGenerated;
                                    }

                                    if(objectCircuit !== null)
                                    {
                                        if(circuits[objectCircuit.circuitId].playerFuel[buildingData.className] === undefined)
                                        {
                                            circuits[objectCircuit.circuitId].playerFuel[buildingData.className] = {
                                                name            : buildingData.name,
                                                buildingName    : null,
                                                buildingCount   : 1,
                                                image           : buildingData.image,
                                                powerGenerated  : powerGenerated,
                                                consumed        : 0
                                            };
                                        }
                                        else
                                        {
                                            circuits[objectCircuit.circuitId].playerFuel[buildingData.className].buildingCount++;
                                            circuits[objectCircuit.circuitId].playerFuel[buildingData.className].powerGenerated += powerGenerated;
                                        }
                                    }

                                    circuits['0'].playerPowerGenerated += powerGenerated;

                                    if(objectCircuit !== null)
                                    {
                                        circuits[objectCircuit.circuitId].playerPowerGenerated += powerGenerated;
                                    }
                                }
                            }

                            // Update overclocking statistics
                            if(buildingData.category === 'extraction' || buildingData.category === 'generator' || buildingData.category === 'production')
                            {
                                let potentialInventory = this.baseLayout.getObjectInventory(currentObject, 'mInventoryPotential');

                                if(potentialInventory !== null)
                                {
                                    for(let i = 0; i < potentialInventory.length; i++)
                                    {
                                        if(potentialInventory[i] !== null && potentialInventory[i].className === '/Game/FactoryGame/Resource/Environment/Crystal/Desc_CrystalShard.Desc_CrystalShard_C')
                                        {
                                            circuits['0'].playerPowerShards++;

                                            if(objectCircuit !== null)
                                            {
                                                circuits[objectCircuit.circuitId].playerPowerShards++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                }
        }

        let html = [];

        for(let circuitId in circuits)
        {
            if(circuitId === '0')
            {
                html.push('<h5 class="text-warning">All power circuits</h5>');
            }
            else
            {
                html.push('<h5 class="text-warning">Power circuit #' + circuitId + '</h5>');
            }

            html.push('<table class="table table-borderless">');

            html.push('<tr><td>Capacity</td><td class="text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(circuits[circuitId].playerPowerGenerated) + 'MW</td></tr>');
            html.push('<tr><td>Consumption</td><td class="text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(circuits[circuitId].playerPowerUsed)) + 'MW</td></tr>');
            html.push('<tr><td>Max consumption</td><td class="text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(circuits[circuitId].playerPowerUsedMax)) + 'MW</td></tr>');
            html.push('<tr><td>Power shards used</td><td class="text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(circuits[circuitId].playerPowerShards) + '</td></tr>');

            html.push('</table>');

            let maxFuel             = 0;
            let sortedFuel          = Object.keys(circuits[circuitId].playerFuel)
                                          .sort(function(a,b){
                                              return circuits[circuitId].playerFuel[b].powerGenerated - circuits[circuitId].playerFuel[a].powerGenerated;
                                          });

            for(let i = 0; i < sortedFuel.length; i++)
            {
                maxFuel += circuits[circuitId].playerFuel[sortedFuel[i]].powerGenerated;
            }

            html.push('<table class="table mb-0 table-borderless">');

            for(let i = 0; i < sortedFuel.length; i++)
            {
                let currentItem = circuits[circuitId].playerFuel[sortedFuel[i]];

                let unit        = ' units';
                let style       = '';

                // Update liquids/gas to m3
                if(currentItem.category !== undefined && (currentItem.category === 'liquid' || currentItem.category === 'gas'))
                {
                    currentItem.consumed    = Math.round(Math.round(currentItem.consumed) / 1000);
                    unit                    = 'm³';
                    style                   = 'border-radius: 50%;';
                }

                html.push('<tr>');
                html.push('<td width="74"><img src="' + currentItem.image + '" class="img-fluid img-thumbnail" style="' + style + '" /></td>');
                html.push('<td><table class="table table-borderless table-sm mb-0">');
                html.push('<tr>');

                if(currentItem.buildingName !== null)
                {
                    html.push('<td>' + currentItem.name + ' <em class="text-small">(' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.buildingCount) + ' ' + currentItem.buildingName + ')</em></td>');
                }
                else
                {
                    html.push('<td>' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.buildingCount) + ' ' + currentItem.name + '</td>');
                }


                html.push('<td class="text-right" width="20%">' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.consumed) + unit + ' per minute <i class="fas fa-cloud-download ml-1 text-danger"></i></td>');
                html.push('<td class="text-right" width="20%">' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.powerGenerated) + 'MW</td>');
                html.push('</tr>');
                html.push('<tr>');
                html.push('<td colspan="3" class="pt-0"><div class="progress"><div class="progress-bar bg-secondary" role="progressbar" style="width: ' + (currentItem.powerGenerated / maxFuel * 100) + '%"></div></div></td>');
                html.push('</table></td>');
                html.push('</tr>');
            }

            html.push('</table>');

            html.push('<hr class="border-secondary" />');
        }

        return html.join('');
    }
}