/* global Intl, gtag */
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
            circuits['GLOBAL']      = {
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
                            let objectCircuitID     = this.baseLayout.getObjectCircuitID(currentObject);
                                if(objectCircuitID !== null && circuits[objectCircuitID] === undefined)
                                {
                                    circuits[objectCircuitID] = {
                                        playerPowerUsed         : 0,
                                        playerPowerUsedMax      : 0,
                                        playerPowerGenerated    : 0,

                                        playerPowerShards       : 0,

                                        playerFuel              : {}
                                    };
                                }

                            if(buildingData.powerUsed !== undefined && buildingData.powerUsed > 0)
                            {
                                if(buildingData.category === 'vehicle' && buildingData.mapLayer !== undefined && buildingData.mapLayer === 'playerVehiculesLayer')
                                {

                                }
                                else
                                {

                                    let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.powerInfo');
                                    let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
                                    let maxPowerUser        = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);

                                    if(buildingPowerInfo !== null)
                                    {
                                        let buildingConsumption     = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mTargetConsumption', maxPowerUser);
                                            circuits['GLOBAL'].playerPowerUsed        += buildingConsumption;

                                            if(objectCircuitID !== null)
                                            {
                                                circuits[objectCircuitID].playerPowerUsed += buildingConsumption;
                                            }
                                    }

                                    circuits['GLOBAL'].playerPowerUsedMax += maxPowerUser;

                                    if(objectCircuitID !== null)
                                    {
                                        circuits[objectCircuitID].playerPowerUsedMax += maxPowerUser;
                                    }
                                }
                            }

                            if(buildingData.category === 'generator')
                            {
                                let fuelEnergyValue     = null;
                                let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
                                let powerGenerated      = buildingData.powerGenerated * Math.pow(clockSpeed, 1/1.3);

                                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorIntegratedBiomass.Build_GeneratorIntegratedBiomass_C')
                                    {
                                        powerGenerated = 20 * Math.pow(clockSpeed, 1/1.3);
                                    }
                                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorNuclear/Build_GeneratorNuclear.Build_GeneratorNuclear_C')
                                    {
                                        powerGenerated = buildingData.powerGenerated * Math.pow(clockSpeed, 1/1.321928);
                                    }

                                let fuelClass           = this.baseLayout.getObjectProperty(currentObject, 'mCurrentFuelClass');
                                    if(fuelClass !== null && this.baseLayout.getObjectProperty(currentObject, 'mIsProductionPaused') === null)
                                    {
                                        let fuelItem = this.baseLayout.getItemDataFromClassName(fuelClass.pathName);

                                        if(fuelItem !== null && fuelItem.energy !== undefined)
                                        {
                                            fuelEnergyValue = fuelItem.energy;

                                            if(circuits['GLOBAL'].playerFuel[fuelItem.className] === undefined)
                                            {
                                                circuits['GLOBAL'].playerFuel[fuelItem.className] = {
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
                                                circuits['GLOBAL'].playerFuel[fuelItem.className].buildingCount++;
                                                circuits['GLOBAL'].playerFuel[fuelItem.className].consumed += (60 / (fuelEnergyValue / powerGenerated));
                                                circuits['GLOBAL'].playerFuel[fuelItem.className].powerGenerated += powerGenerated;
                                            }

                                            if(objectCircuitID !== null)
                                            {
                                                if(circuits[objectCircuitID].playerFuel[fuelItem.className] === undefined)
                                                {
                                                    circuits[objectCircuitID].playerFuel[fuelItem.className] = {
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
                                                    circuits[objectCircuitID].playerFuel[fuelItem.className].buildingCount++;
                                                    circuits[objectCircuitID].playerFuel[fuelItem.className].consumed += (60 / (fuelEnergyValue / powerGenerated));
                                                    circuits[objectCircuitID].playerFuel[fuelItem.className].powerGenerated += powerGenerated;
                                                }
                                            }

                                            circuits['GLOBAL'].playerPowerGenerated += powerGenerated;

                                            if(objectCircuitID !== null)
                                            {
                                                circuits[objectCircuitID].playerPowerGenerated += powerGenerated;
                                            }
                                        }
                                    }

                                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
                                {
                                    if(circuits['GLOBAL'].playerFuel[buildingData.className] === undefined)
                                    {
                                        circuits['GLOBAL'].playerFuel[buildingData.className] = {
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
                                        circuits['GLOBAL'].playerFuel[buildingData.className].buildingCount++;
                                        circuits['GLOBAL'].playerFuel[buildingData.className].powerGenerated += powerGenerated;
                                    }

                                    if(objectCircuitID !== null)
                                    {
                                        if(circuits[objectCircuitID].playerFuel[buildingData.className] === undefined)
                                        {
                                            circuits[objectCircuitID].playerFuel[buildingData.className] = {
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
                                            circuits[objectCircuitID].playerFuel[buildingData.className].buildingCount++;
                                            circuits[objectCircuitID].playerFuel[buildingData.className].powerGenerated += powerGenerated;
                                        }
                                    }

                                    circuits['GLOBAL'].playerPowerGenerated += powerGenerated;

                                    if(objectCircuitID !== null)
                                    {
                                        circuits[objectCircuitID].playerPowerGenerated += powerGenerated;
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
                                            circuits['GLOBAL'].playerPowerShards++;

                                            if(objectCircuitID !== null)
                                            {
                                                circuits[objectCircuitID].playerPowerShards++;
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
            if(circuitId === 'GLOBAL')
            {
                html.push('<h5 class="text-warning">All power circuits</h5>');
            }
            else
            {
                html.push('<h5 class="text-warning">Power circuit #' + circuitId.split('_').pop() + '</h5>');
            }

            html.push('<table class="table table-borderless">');

            html.push('<tr><td>Maximum available power</td><td class="text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(circuits[circuitId].playerPowerGenerated) + 'MW</td></tr>');
            html.push('<tr><td>Power currently generated</td><td class="text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(circuits[circuitId].playerPowerUsed)) + 'MW</td></tr>');
            html.push('<tr><td>Power used at maximum production</td><td class="text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(circuits[circuitId].playerPowerUsedMax)) + 'MW</td></tr>');
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

                // Update liquids to m3
                if(currentItem.category !== undefined && currentItem.category === 'liquid')
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