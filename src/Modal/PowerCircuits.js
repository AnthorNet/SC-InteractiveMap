/* global Intl, gtag */

import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

import SubSystem_Circuit                        from '../SubSystem/Circuit.js';

export default class Modal_PowerCircuits
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.circuitSubSystem   = new SubSystem_Circuit({baseLayout: this.baseLayout});
        this.requiredCircuits   = [];
        this.requiredComponents = [];

        if(options.markers === undefined)
        {
            this.markers = [];
            for(let layerId in this.baseLayout.playerLayers)
            {
                if([
                    'playerRadioactivityLayer', 'playerLightsHaloLayer', 'playerFoundationsLayer', 'playerWallsLayer', 'playerCratesLayer',
                    'playerProductorsLayer', 'playerPillarsLayer', 'playerWalkwaysLayer', 'playerOrientationLayer',
                    'playerStatuesLayer', 'playerHUBTerminalLayer',

                    'playerVehiculesLayer', 'playerDronesLayer', 'playerBeltsLayer', 'playerPipesLayer', 'playerPipesHyperLayer',
                    'playerTracksLayer', 'playerTrainsLayer',
                    'playerResourceDepositsLayer', 'playerItemsPickupLayer', 'playerPositionLayer', 'playerSpaceRabbitLayer', 'playerFaunaLayer', 'playerFogOfWar'
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
            this.markers =  options.markers;
        }

        let markersLength = this.markers.length;
            for(let i = 0; i < markersLength; i++)
            {
                let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);
                    if(currentObject !== null)
                    {
                        if(this.requiredComponents.includes(currentObject.pathName) === false)
                        {
                            this.requiredComponents.push(currentObject.pathName);
                        }

                        let objectCircuit = this.circuitSubSystem.getObjectCircuit(currentObject);
                            if(objectCircuit !== null && this.requiredCircuits.includes(objectCircuit.circuitId) === false)
                            {
                                this.requiredCircuits.push(objectCircuit.circuitId)
                            }
                    }
            }
            this.requiredCircuits.sort((a, b) => a - b);

        if(typeof gtag === 'function')
        {
            gtag('event', 'PowerCircuits', {event_category: 'Statistics'});
        }
    }

    parse()
    {
        let header  = [];
            header.push('<ul class="nav nav-tabs nav-fill card-header-tabs mb-n3 w-100" style="font-size: 12px;">');
            for(let i = 0; i < this.requiredCircuits.length; i++)
            {
                header.push('<li class="nav-item">');
                    header.push('<a class="nav-link ' + ((i === 0) ? 'active' : '') + '" data-toggle="tab" href="#modalPowerCircuits_' + i + '" style="padding: 0.5rem;">#' + this.requiredCircuits[i] + '</a>')
                header.push('</li>');
            }
            header.push('</ul>');

            $('#genericModal .modal-title').empty().html('Power Circuits' + header.join(''));

        let html    = [];
            html.push('<div class="tab-content">');

            for(let i = 0; i < this.requiredCircuits.length; i++)
            {
                html.push('<div class="tab-pane fade ' + ((i === 0) ? 'show active' : '') + '" id="modalPowerCircuits_' + i + '">');

                // CIRCUIT GRAPHICS
                html.push('<div style="margin: 0 auto;width: 630px;height: 130px;color: #5b5b5b;text-shadow: none;' + BaseLayout_Tooltip.genericUIBackgroundStyle(this.baseLayout) + '">');
                let circuitStatistics = this.circuitSubSystem.getStatistics(this.requiredCircuits[i]);
                    html.push(BaseLayout_Tooltip.setCircuitStatisticsGraph(this.baseLayout, circuitStatistics, 630));
                html.push('</div>');

                // COMPONENTS
                let circuitComponents   = this.circuitSubSystem.getCircuitsComponents(this.requiredCircuits[i]);
                let playerFuel          = {};

                    for(let j = 0; j < circuitComponents.length; j++)
                    {
                        if(this.requiredComponents.includes(circuitComponents[j]))
                        {
                            let currentObject = this.baseLayout.saveGameParser.getTargetObject(circuitComponents[j]);
                                if(currentObject !== null)
                                {
                                    let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                                        if(buildingData !== null && buildingData.category === 'generator')
                                        {
                                            let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.powerInfo');

                                                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
                                                {
                                                    let mBaseProduction  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mBaseProduction');
                                                        if(mBaseProduction !== null)
                                                        {
                                                            if(playerFuel[buildingData.className] === undefined)
                                                            {
                                                                playerFuel[buildingData.className] = {
                                                                    name            : buildingData.name,
                                                                    buildingName    : null,
                                                                    buildingCount   : 1,
                                                                    image           : buildingData.image,
                                                                    powerGenerated  : mBaseProduction,
                                                                    consumed        : 0
                                                                };
                                                            }
                                                            else
                                                            {
                                                                playerFuel[buildingData.className].buildingCount++;
                                                                playerFuel[buildingData.className].powerGenerated += mBaseProduction;
                                                            }
                                                        }

                                                    continue;
                                                }

                                            let fuelClass           = this.baseLayout.getObjectProperty(currentObject, 'mCurrentFuelClass');

                                                if(fuelClass !== null && this.baseLayout.getObjectProperty(currentObject, 'mIsProductionPaused') === null)
                                                {
                                                    let fuelItem = this.baseLayout.getItemDataFromClassName(fuelClass.pathName);
                                                        if(fuelItem !== null && fuelItem.energy !== undefined)
                                                        {
                                                            let mDynamicProductionCapacity  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mDynamicProductionCapacity');
                                                                if(mDynamicProductionCapacity !== null)
                                                                {
                                                                    if(playerFuel[fuelItem.className] === undefined)
                                                                    {
                                                                        playerFuel[fuelItem.className] = {
                                                                            name            : fuelItem.name,
                                                                            buildingName    : buildingData.name,
                                                                            buildingCount   : 1,
                                                                            image           : fuelItem.image,
                                                                            category        : fuelItem.category,
                                                                            powerGenerated  : mDynamicProductionCapacity,
                                                                            consumed        : (60 / (fuelItem.energy / mDynamicProductionCapacity))
                                                                        };
                                                                    }
                                                                    else
                                                                    {
                                                                        playerFuel[fuelItem.className].buildingCount++;
                                                                        playerFuel[fuelItem.className].consumed += (60 / (fuelItem.energy / mDynamicProductionCapacity));
                                                                        playerFuel[fuelItem.className].powerGenerated += mDynamicProductionCapacity;
                                                                    }
                                                                }
                                                        }
                                                }
                                        }
                                }
                        }
                    }
                html.push('<table class="table mt-3 mb-0 table-borderless">');

                let maxFuel             = 0;
                let sortedFuel          = Object.keys(playerFuel)
                                                .sort(function(a,b){
                                                    return playerFuel[b].powerGenerated - playerFuel[a].powerGenerated;
                                                });

                    for(let i = 0; i < sortedFuel.length; i++)
                    {
                        maxFuel += playerFuel[sortedFuel[i]].powerGenerated;
                    }

                    for(let i = 0; i < sortedFuel.length; i++)
                    {
                        let currentItem = playerFuel[sortedFuel[i]];

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
                        html.push('<td colspan="3" class="pt-0"><div class="progress"><div class="progress-bar bg-secondary" style="width: ' + (currentItem.powerGenerated / maxFuel * 100) + '%"></div></div></td>');
                        html.push('</table></td>');
                        html.push('</tr>');
                    }

                html.push('</table>');
                html.push('</div>');
            }

            html.push('</div>');


        $('#genericModal .modal-body').empty().html(html.join(''));
        setTimeout(function(){
            $('#genericModal').modal('show').modal('handleUpdate');
        }, 250);
    }
}