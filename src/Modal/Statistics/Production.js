/* global Intl, gtag */
export default class Modal_Statistics_Production
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;

        if(options.markers === undefined)
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
            this.markers =  options.markers;
        }

        if(typeof gtag === 'function')
        {
            gtag('event', 'Production', {event_category: 'Statistics'});
        }
    }

    parse()
    {
        let html = [];
            html.push('<table class="table mb-0">');

        let playerProduction    = {};

        let markersLength = this.markers.length;
        for(let i = 0; i < markersLength; i++)
        {
            let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);
                if(currentObject !== null)
                {
                    let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                        if(buildingData !== null)
                        {
                            let buildingIsOn = this.baseLayout.getBuildingIsPowered(currentObject);
                                if(buildingIsOn === true)
                                {
                                    buildingIsOn = this.baseLayout.getBuildingIsOn(currentObject);
                                }

                            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Holiday/Build_TreeGiftProducer/Build_TreeGiftProducer.Build_TreeGiftProducer_C')
                            {
                                if(playerProduction['/Game/FactoryGame/Events/Christmas/Parts/Desc_Gift.Desc_Gift_C'] === undefined)
                                {
                                    playerProduction['/Game/FactoryGame/Events/Christmas/Parts/Desc_Gift.Desc_Gift_C'] = {
                                        name        : this.baseLayout.itemsData.Desc_Gift_C.name,
                                        image       : this.baseLayout.itemsData.Desc_Gift_C.image,
                                        category    : this.baseLayout.itemsData.Desc_Gift_C.category,
                                        produced    : 15,
                                        offProduced : 0,
                                        consumed    : 0,
                                        offConsumed : 0
                                    };
                                }
                                else
                                {
                                    playerProduction['/Game/FactoryGame/Events/Christmas/Parts/Desc_Gift.Desc_Gift_C'].produced    += 15;
                                }
                            }

                            if(buildingData.category === 'extraction')
                            {
                                let extractResourceNode     = this.baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
                                let purity                  = 'normal';

                                if(extractResourceNode !== null)
                                {
                                    let itemClassName   = null;
                                    let itemType        = null;

                                    if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
                                    {
                                        if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity !== undefined)
                                        {
                                            purity = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity;
                                        }

                                        if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type !== undefined)
                                        {
                                            itemType = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type;
                                            if(itemType === 'Desc_LiquidOilWell_C')
                                            {
                                                itemType = 'Desc_LiquidOil_C';
                                            }

                                            itemClassName   = this.baseLayout.itemsData[itemType].className;
                                        }
                                    }

                                    if(itemClassName === null && currentObject.className === '/Game/FactoryGame/Buildable/Factory/WaterPump/Build_WaterPump.Build_WaterPump_C')
                                    {
                                        itemClassName   = '/Game/FactoryGame/Resource/RawResources/Water/Desc_Water.Desc_Water_C';
                                        itemType        = 'Desc_Water_C';
                                    }

                                    let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
                                    let productionRatio     = 0;
                                    let offProductionRatio  = 0;

                                    if(buildingIsOn === true)
                                    {
                                        productionRatio = 60 * clockSpeed;
                                        if(buildingData.extractionRate !== undefined && buildingData.extractionRate[purity] !== undefined)
                                        {
                                            productionRatio = buildingData.extractionRate[purity] * clockSpeed;
                                        }
                                    }
                                    else
                                    {
                                        offProductionRatio = 60 * clockSpeed;
                                        if(buildingData.extractionRate !== undefined && buildingData.extractionRate[purity] !== undefined)
                                        {
                                            offProductionRatio = buildingData.extractionRate[purity] * clockSpeed;
                                        }
                                    }


                                    if(itemClassName !== null && itemType !== null)
                                    {
                                        if(this.baseLayout.itemsData[itemType].category === 'liquid' || this.baseLayout.itemsData[itemType].category === 'gas')
                                        {
                                            productionRatio     = Math.min(600000, productionRatio);
                                            offProductionRatio  = Math.min(600000, offProductionRatio);
                                        }
                                        else
                                        {
                                            productionRatio     = Math.min(780, productionRatio);
                                            offProductionRatio  = Math.min(780, offProductionRatio);
                                        }

                                        if(playerProduction[itemClassName] === undefined)
                                        {
                                            playerProduction[itemClassName] = {
                                                name        : this.baseLayout.itemsData[itemType].name,
                                                image       : this.baseLayout.itemsData[itemType].image,
                                                category    : this.baseLayout.itemsData[itemType].category,
                                                produced    : productionRatio,
                                                offProduced : offProductionRatio,
                                                consumed    : 0,
                                                offConsumed : 0
                                            };
                                        }
                                        else
                                        {
                                            playerProduction[itemClassName].produced    += productionRatio;
                                            playerProduction[itemClassName].offProduced += offProductionRatio;
                                        }
                                    }
                                }
                            }

                            if(buildingData.category === 'production')
                            {
                                let recipeItem          = this.baseLayout.getItemDataFromRecipe(currentObject);

                                if(recipeItem !== null)
                                {
                                    let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
                                    let craftingTime        = (recipeItem !== null) ? recipeItem.mManufactoringDuration : 4;
                                        craftingTime       /= clockSpeed; // Overclocking...

                                    for(let className in recipeItem.produce)
                                    {
                                        let productionRatio     = 0;
                                        let offProductionRatio  = 0;

                                        if(buildingIsOn === true)
                                        {
                                            productionRatio = 60 / craftingTime * recipeItem.produce[className];
                                        }
                                        else
                                        {
                                            offProductionRatio = 60 / craftingTime * recipeItem.produce[className];
                                        }

                                        if(playerProduction[className] === undefined)
                                        {
                                            let currentItem     = this.baseLayout.getItemDataFromClassName(className);
                                                if(currentItem !== null)
                                                {
                                                    playerProduction[className] = {
                                                        name        : currentItem.name,
                                                        image       : currentItem.image,
                                                        category    : currentItem.category,
                                                        produced    : productionRatio,
                                                        offProduced : offProductionRatio,
                                                        consumed    : 0,
                                                        offConsumed : 0
                                                    };
                                                }
                                        }
                                        else
                                        {
                                            playerProduction[className].produced    += productionRatio;
                                            playerProduction[className].offProduced += offProductionRatio;
                                        }
                                    }

                                    for(let className in recipeItem.ingredients)
                                    {
                                        let recipeConsumed     = 0;
                                        let offRecipeConsumed  = 0;

                                        if(buildingIsOn === true)
                                        {
                                            recipeConsumed = (60 / craftingTime * recipeItem.ingredients[className]);
                                        }
                                        else
                                        {
                                            offRecipeConsumed = (60 / craftingTime * recipeItem.ingredients[className]);
                                        }

                                        if(playerProduction[className] === undefined)
                                        {
                                            let currentItem     = this.baseLayout.getItemDataFromClassName(className);
                                                if(currentItem !== null)
                                                {
                                                    playerProduction[className] = {
                                                        name        : currentItem.name,
                                                        image       : currentItem.image,
                                                        category    : currentItem.category,
                                                        produced    : 0,
                                                        offProduced : 0,
                                                        consumed    : recipeConsumed,
                                                        offConsumed : offRecipeConsumed
                                                    };
                                                }
                                        }
                                        else
                                        {
                                            playerProduction[className].consumed    += recipeConsumed;
                                            playerProduction[className].offConsumed += offRecipeConsumed;
                                        }
                                    }
                                }
                            }

                            if(buildingData.category === 'generator')
                            {
                                let clockSpeed                  = this.baseLayout.getClockSpeed(currentObject);
                                let mPowerProductionExponent    = buildingData.powerProductionExponent || 1.3;
                                let fuelClass                   = this.baseLayout.getObjectProperty(currentObject, 'mCurrentFuelClass');

                                if(fuelClass !== null)
                                {
                                    let fuelItem = this.baseLayout.getItemDataFromClassName(fuelClass.pathName);

                                    if(fuelItem !== null && fuelItem.energy !== undefined)
                                    {
                                        let fuelConsumed        = (60 / (fuelItem.energy / buildingData.powerGenerated) * Math.pow(clockSpeed, 1 / mPowerProductionExponent));
                                        let onFuelConsumed      = 0;
                                        let offFuelConsumed     = 0;
                                            if(buildingIsOn === true)
                                            {
                                                onFuelConsumed = fuelConsumed;
                                            }
                                            else
                                            {
                                                offFuelConsumed = fuelConsumed;
                                            }

                                        if(playerProduction[fuelItem.className] === undefined)
                                        {
                                            playerProduction[fuelItem.className] = {
                                                name        : fuelItem.name,
                                                image       : fuelItem.image,
                                                category    : fuelItem.category,
                                                produced    : 0,
                                                offProduced : 0,
                                                consumed    : onFuelConsumed,
                                                offConsumed : offFuelConsumed
                                            };
                                        }
                                        else
                                        {
                                            playerProduction[fuelItem.className].consumed       += onFuelConsumed;
                                            playerProduction[fuelItem.className].offConsumed    += offFuelConsumed;
                                        }

                                        if(buildingData.supplementalLoadType !== undefined && buildingData.supplementalLoadRatio !== undefined)
                                        {
                                            let supplementalLoadConsumed        = 60 * (buildingData.powerGenerated * Math.pow(clockSpeed, 1 / mPowerProductionExponent)) * buildingData.supplementalLoadRatio;
                                            let onSupplementalLoadConsumed      = 0;
                                            let offSupplementalLoadConsumed     = 0;
                                                if(buildingIsOn === true)
                                                {
                                                    onSupplementalLoadConsumed = supplementalLoadConsumed;
                                                }
                                                else
                                                {
                                                    offSupplementalLoadConsumed = supplementalLoadConsumed;
                                                }

                                            let supplementalLoadClassName   = this.baseLayout.itemsData[buildingData.supplementalLoadType].className;
                                                if(playerProduction[supplementalLoadClassName] === undefined)
                                                {
                                                    playerProduction[supplementalLoadClassName] = {
                                                        name        : this.baseLayout.itemsData[buildingData.supplementalLoadType].name,
                                                        image       : this.baseLayout.itemsData[buildingData.supplementalLoadType].image,
                                                        category    : this.baseLayout.itemsData[buildingData.supplementalLoadType].category,
                                                        produced    : 0,
                                                        offProduced : 0,
                                                        consumed    : onSupplementalLoadConsumed,
                                                        offConsumed : offSupplementalLoadConsumed
                                                    };
                                                }
                                                else
                                                {
                                                    playerProduction[supplementalLoadClassName].consumed       += onSupplementalLoadConsumed;
                                                    playerProduction[supplementalLoadClassName].offConsumed    += offSupplementalLoadConsumed;
                                                }
                                        }
                                    }
                                }
                            }
                        }
                }
        }

        for(let itemClassName in playerProduction)
        {
            // Update liquids/gas to m3
            if(playerProduction[itemClassName].category !== undefined && (playerProduction[itemClassName].category === 'liquid' || playerProduction[itemClassName].category === 'gas'))
            {
                playerProduction[itemClassName].produced    = Math.round(Math.round(playerProduction[itemClassName].produced) / 1000);
                playerProduction[itemClassName].consumed    = Math.round(Math.round(playerProduction[itemClassName].consumed) / 1000);
                playerProduction[itemClassName].offProduced = Math.round(Math.round(playerProduction[itemClassName].offProduced) / 1000);
                playerProduction[itemClassName].offConsumed = Math.round(Math.round(playerProduction[itemClassName].offConsumed) / 1000);
                playerProduction[itemClassName].unit        = 'm³';
                playerProduction[itemClassName].style       = 'border-radius: 50%;';
            }
            else
            {
                playerProduction[itemClassName].unit        = ' units';
                playerProduction[itemClassName].style       = '';
            }
        }

        let sortedProduction    = Object.keys(playerProduction).sort(function(a,b){ return playerProduction[b].produced - playerProduction[a].produced; });

        for(let i = 0; i < sortedProduction.length; i++)
        {
            let currentItem     = playerProduction[sortedProduction[i]];
            let totalProduction = (currentItem.produced + currentItem.offProduced + currentItem.consumed + currentItem.offConsumed);

            html.push('<tr>');
            html.push('<td width="74"><img src="' + currentItem.image + '" class="img-fluid img-thumbnail" style="' + currentItem.style + '" /></td>');
            html.push('<td><table class="table table-borderless table-sm mb-0">');
            html.push('<tr>');
            html.push('<td>' + ( (currentItem.produced >= currentItem.consumed) ? '<i class="fas fa-thumbs-up mr-1 text-success"></i>' : '<i class="fas fa-thumbs-down mr-1 text-danger"></i>' ) + ' ' + currentItem.name + '</td>');

            if(currentItem.offProduced > 0)
            {
                html.push('<td class="text-right" width="20%">' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.produced) + currentItem.unit + '/' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.produced + currentItem.offProduced) + currentItem.unit + ' per minute <i class="fas fa-cloud-upload ml-1 text-success"></i></td>');
            }
            else
            {
                html.push('<td class="text-right" width="20%">' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.produced) + currentItem.unit + ' per minute <i class="fas fa-cloud-upload ml-1 text-success"></i></td>');
            }
            if(currentItem.offConsumed > 0)
            {
                html.push('<td class="text-right" width="20%">' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.consumed) + currentItem.unit + '/' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.consumed + currentItem.offConsumed) + currentItem.unit + ' per minute <i class="fas fa-cloud-download ml-1 text-danger"></i></td>');
            }
            else
            {
                html.push('<td class="text-right" width="20%">' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.consumed) + currentItem.unit + ' per minute <i class="fas fa-cloud-download ml-1 text-danger"></i></td>');
            }

            html.push('</tr>');
            html.push('<tr>');
            html.push('<td colspan="3" class="pt-0"><div class="progress" style="position: relative;">');
            html.push('<div style="position: absolute;width: 1px;margin-right:-2px;border-right: 1px dashed #000;height: 1.4rem;left: 50%;margin-top: -0.2rem;"></div>');
            html.push('<div class="progress-bar bg-success" style="width: ' + (currentItem.produced / totalProduction * 100) + '%"></div>');
            html.push('<div class="progress-bar bg-success" style="opacity: 0.2;width: ' + (currentItem.offProduced / totalProduction * 100) + '%"></div>');
            html.push('<div class="progress-bar bg-danger" style="opacity: 0.2;width: ' + (currentItem.offConsumed / totalProduction * 100) + '%"></div>');
            html.push('<div class="progress-bar bg-danger" style="width: ' + (currentItem.consumed / totalProduction * 100) + '%"></div>');
            html.push('</div></td>');
            html.push('</table></td>');
            html.push('</tr>');
        }

        html.push('</table>');

        return html.join('');
    }
}