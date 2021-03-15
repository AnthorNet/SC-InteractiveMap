/* global Intl, Sentry */
import BaseLayout_Statistics_Player_Inventory   from '../BaseLayout/StatisticsPlayerInventory.js';

import Building_MAM                             from '../Building/MAM.js';

export default class BaseLayout_Statistics_Schematics
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;

        // Cache
        this.availableSchematics    = null;
        this.purchasedSchematics    = null;

        if(this.baseLayout.useDebug === true)
        {
            //console.log(this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.recipeManager"));
            //console.log(this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.schematicManager"));
            //console.log(this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.ResearchManager"));
            //console.log(this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.StorySubsystem"));
            //console.log(this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem"));
        }
    }

    parseSchematics(selectedTier = 0)
    {
        $('#statisticsModalSchematics').empty();

        let purchasedAlternate      = this.getPurchasedSchematics();

        let html = [];
            html.push('<div class="card-body text-center">You can click on the status of the schematic to update its current state.</div>');

        let maxTier = 0;
            for(let schematicId in this.baseLayout.schematicsData)
            {
                if(this.baseLayout.schematicsData[schematicId].tier !== undefined && (schematicId.startsWith('Schematic_') || schematicId.startsWith('Schem_')))
                {
                    maxTier = Math.max(maxTier, this.baseLayout.schematicsData[schematicId].tier);
                }
            }

        html.push('<ul class="nav nav-tabs nav-fill" role="tablist">');
        for(let i = 0; i <= maxTier; i++)
        {
            html.push('<li class="nav-item"><a class="nav-link ' + ( (selectedTier === i) ? 'active' : '' ) + '" data-toggle="tab" href="#playerUnlockedSchematics-' + i + '" role="tab">Tier ' + i + '</a></li>');
        }
        html.push('</ul>');

        html.push('<div class="tab-content p-0 border border-top-0">');
        for(let i = 0; i <= maxTier; i++)
        {
            html.push('<div class="tab-pane fade ' + ( (selectedTier === i) ? 'show active' : '' ) + '" id="playerUnlockedSchematics-' + i + '" role="tabpanel">');
            html.push('<table class="table mb-0">');
            html.push('<tr><td class="text-right" colspan="2"><button class="btn btn-sm btn-success updateAllAlternativeStatus" data-status="available" data-tier="' + i + '"><i class="fas fa-lock-open-alt"></i> Unlock all</button></td><td></td></tr>');

            let currentTierData   = {};
                for(let schematicId in this.baseLayout.schematicsData)
                {
                    if(this.baseLayout.schematicsData[schematicId].tier !== undefined && this.baseLayout.schematicsData[schematicId].tier === i && (schematicId.startsWith('Schematic_') || schematicId.startsWith('Schem_')))
                    {
                        currentTierData[schematicId] = this.baseLayout.schematicsData[schematicId];
                    }
                }

            let schematicsDataKey = Object.keys(currentTierData).sort(function(a,b){ return a.localeCompare(b); }.bind(this));

            for(let j = 0; j < schematicsDataKey.length; j++)
            {
                let className        = schematicsDataKey[j];
                let currentSchematic = this.baseLayout.schematicsData[className];

                if(currentSchematic.tier !== undefined)
                {
                    html.push('<tr>');
                    html.push('<td class="align-middle">');
                        html.push('<strong style="font-size: 120%;">' + currentSchematic.name + '</strong>');
                        html.push(this.getSchematicsUnlocks(currentSchematic));
                    html.push('</td>');
                    html.push('<td class="align-middle text-right">' + this.parseSchematicCost(currentSchematic) + '</td>');

                    if(currentSchematic.className !== undefined && purchasedAlternate.includes(currentSchematic.className))
                    {
                        html.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="none" data-tier="' + currentSchematic.tier + '"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                    }
                    else
                    {
                        if(currentSchematic.className !== undefined)
                        {
                            html.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="available" data-tier="' + currentSchematic.tier + '"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                        }
                        else
                        {
                            html.push('<td></td>');
                        }
                    }

                    html.push('</tr>');
                }
            }

            html.push('</table>');
            html.push('</div>');
        }
        html.push('</div>');

        $('#statisticsModalSchematics').html(html.join(''));

        $('#statisticsModalSchematics .updateAllAlternativeStatus').on('click', function(e){
            $('#statisticsModalSchematics .updateAlternativeStatus[data-status=' + $(e.currentTarget).attr('data-status') + '][data-tier=' + $(e.currentTarget).attr('data-tier') + ']').each(function(index, el){
                this.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
            }.bind(this));

            // Reset status
            this.parseSchematics(parseInt($(e.currentTarget).attr('data-tier')));
        }.bind(this)).css('cursor', 'pointer');

        $('#statisticsModalSchematics .updateAlternativeStatus').on('click', function(e){
            this.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseSchematics(parseInt($(e.currentTarget).attr('data-tier')));
        }.bind(this)).css('cursor', 'pointer');
    }

    parseAlternateRecipes()
    {
        $('#statisticsModalAlternateRecipes').empty();
        this.baseLayout.collectedSchematics.resetCollected();

        let purchasedAlternate      = this.getPurchasedSchematics();

        let html = [];
            html.push('<div class="card-body text-center">You can click on the status of the recipe to update its current state.</div>');

            html.push('<table class="table mb-0">');
            html.push('<tr><td class="text-right" colspan="2"><button class="btn btn-sm btn-success updateAllAlternativeStatus" data-status="available"><i class="fas fa-lock-open-alt"></i> Unlock all</button></td><td></td></tr>');

        let schematicsDataKey = Object.keys(this.baseLayout.schematicsData).sort(function(a,b){
                return this.baseLayout.schematicsData[a].name.localeCompare(this.baseLayout.schematicsData[b].name);
            }.bind(this));

        for(let i = 0; i < schematicsDataKey.length; i++)
        {
            if(schematicsDataKey[i].search('Schematic_Alternate_') !== -1)
            {
                let className           = schematicsDataKey[i];
                let currentSchematic    = this.baseLayout.schematicsData[className];

                html.push('<tr>');

                if(currentSchematic.recipes !== undefined)
                {
                    let currentRecipe       = this.baseLayout.getItemDataFromRecipeClassName(currentSchematic.recipes[0]);

                        if(currentRecipe !== null)
                        {
                            html.push('<td width="' + ((Object.keys(currentRecipe.produce).length * 48) + 10) + '" class="text-center">');
                            html.push('<div class="d-flex flex-row justify-content-center">');

                            for(let itemClassName in currentRecipe.produce)
                            {
                                let itemData            = this.baseLayout.getItemDataFromClassName(itemClassName);
                                let itemProduced        = currentRecipe.produce[itemClassName];
                                let itemUnits           = '';
                                let itemStyle           = 'border-radius: 5px;';

                                if(itemData !== null)
                                {
                                    if(itemData.category !== undefined && (itemData.category === 'liquid' || itemData.category === 'gas'))
                                    {
                                        itemProduced    = Math.round(Math.round(itemProduced) / 1000);
                                        itemUnits       = 'm³';
                                        itemStyle       = 'border-radius: 50%;';
                                    }

                                    html.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 48px;height: 48px;border: 1px solid #000000;' + itemStyle + 'padding: 5px;background-color: #FFFFFF;" data-hover="tooltip" title="' + itemData.name + '">');
                                    html.push('<img src="' + itemData.image + '" class="img-fluid" />');
                                    html.push('<span class="badge badge-warning align-middle" style="position: absolute;bottom: -1px; right: -1px;">' + new Intl.NumberFormat(this.language).format(itemProduced) + itemUnits + '</span>');
                                    html.push('</div>');
                                }
                            }

                            html.push('</div>');
                            html.push('</td>');
                        }
                        else
                        {
                            html.push('<td></td>');
                        }
                }
                else
                {
                    if(currentSchematic.slots !== undefined)
                    {
                        html.push('<td>');
                        html.push('<div class="d-flex flex-row justify-content-center">');
                        html.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 48px;height: 48px;border: 1px solid #000000;border-radius: 5px;padding: 5px;background-color: #FFFFFF;" data-hover="tooltip" title="Inventory Slots">');
                        html.push('<img src="' + this.baseLayout.staticUrl + '/img/gameUpdate4/ThumbsUp_256.png?v=' + this.baseLayout.scriptVersion + '" class="img-fluid" />');
                        html.push('<span class="badge badge-warning align-middle" style="position: absolute;bottom: -1px; right: -1px;">' + new Intl.NumberFormat(this.language).format(currentSchematic.slots) + '</span>');
                        html.push('</div>');
                        html.push('</div>');
                        html.push('</td>');
                    }
                    else
                    {
                        html.push('<td></td>');
                    }
                }


                html.push('<td class="align-middle"><strong style="font-size: 120%;">' + currentSchematic.name + '</strong></td>');

                if(currentSchematic.className !== undefined && purchasedAlternate.includes(currentSchematic.className))
                {
                    this.baseLayout.collectedSchematics.addCollected(className);
                    html.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="purchased"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                }
                else
                {
                    if(currentSchematic.className !== undefined)
                    {
                        html.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="available"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                    }
                    else
                    {
                        html.push('<td></td>');
                    }
                }

                html.push('</tr>');
            }
        }

        html.push('</table>');

        $('#statisticsModalAlternateRecipes').html(html.join(''));

        $('#statisticsModalAlternateRecipes .updateAllAlternativeStatus').on('click', function(e){
            $('#statisticsModalAlternateRecipes .updateAlternativeStatus[data-status=' + $(e.currentTarget).attr('data-status') + ']').each(function(index, el){
                this.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
            }.bind(this));

            // Reset status
            this.parseAlternateRecipes();
        }.bind(this)).css('cursor', 'pointer');

        $('#statisticsModalAlternateRecipes .updateAlternativeStatus').on('click', function(e){
            this.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseAlternateRecipes();
        }.bind(this)).css('cursor', 'pointer');
    }

    parseMAM(selectedCategory = null)
    {
        $('#statisticsModalMAM').empty();

        let purchasedAlternate      = this.getPurchasedSchematics();

        let html = [];
            html.push('<div class="card-body text-center">You can click on the status of the schematic to update its current state.</div>');

        let categories = [];
            for(let schematicId in this.baseLayout.schematicsData)
            {
                if(this.baseLayout.schematicsData[schematicId].category !== undefined && schematicId.startsWith('Research_') && categories.includes(this.baseLayout.schematicsData[schematicId].category) === false)
                {
                    categories.push(this.baseLayout.schematicsData[schematicId].category);
                }
            }
            categories.sort(function(a,b){ return a.localeCompare(b); }.bind(this));
            if(selectedCategory === null){ selectedCategory = categories[0]; }

        html.push('<ul class="nav nav-tabs nav-fill" role="tablist">');
        for(let i = 0; i < categories.length; i++)
        {
            html.push('<li class="nav-item"><a class="nav-link px-3 ' + ( (selectedCategory === categories[i]) ? 'active' : '' ) + '" data-toggle="tab" href="#playerUnlockedMAM-' + i + '" role="tab">' + categories[i] + '</a></li>');
        }
        html.push('</ul>');

        html.push('<div class="tab-content p-0 border border-top-0">');
        for(let i = 0; i < categories.length; i++)
        {
            html.push('<div class="tab-pane fade ' + ( (selectedCategory === categories[i]) ? 'show active' : '' ) + '" id="playerUnlockedMAM-' + i + '" role="tabpanel">');
            html.push('<table class="table mb-0">');
            html.push('<tr><td class="text-right" colspan="2"><button class="btn btn-sm btn-success updateAllAlternativeStatus" data-status="available" data-tier="' + categories[i] + '"><i class="fas fa-lock-open-alt"></i> Unlock all</button></td><td></td></tr>');

            let currentTierData   = {};
                for(let schematicId in this.baseLayout.schematicsData)
                {
                    if(schematicId.startsWith('Research_'))
                    {
                        if(this.baseLayout.schematicsData[schematicId].category !== undefined && this.baseLayout.schematicsData[schematicId].category === categories[i])
                        {
                            currentTierData[schematicId] = this.baseLayout.schematicsData[schematicId];
                        }
                    }
                }

            let schematicsDataKey = Object.keys(currentTierData).sort(function(a,b){ return a.localeCompare(b); }.bind(this));

            for(let j = 0; j < schematicsDataKey.length; j++)
            {
                let className        = schematicsDataKey[j];
                let currentSchematic = this.baseLayout.schematicsData[className];

                if(currentSchematic.category !== undefined)
                {
                    html.push('<tr>');
                    html.push('<td class="align-middle">');
                        html.push('<strong style="font-size: 120%;">' + currentSchematic.name + '</strong>');
                        html.push(this.getSchematicsUnlocks(currentSchematic));
                    html.push('</td>');
                    html.push('<td class="align-middle text-right">' + this.parseSchematicCost(currentSchematic) + '</td>');

                    if(currentSchematic.className !== undefined && purchasedAlternate.includes(currentSchematic.className))
                    {
                        html.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="purchased" data-tier="' + currentSchematic.category + '"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                    }
                    else
                    {
                        if(currentSchematic.className !== undefined)
                        {
                            html.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="available" data-tier="' + currentSchematic.category + '"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                        }
                        else
                        {
                            html.push('<td></td>');
                        }
                    }

                    html.push('</tr>');
                }
            }

            html.push('</table>');
            html.push('</div>');
        }
        html.push('</div>');

        $('#statisticsModalMAM').html(html.join(''));

        $('#statisticsModalMAM .updateAllAlternativeStatus').on('click', function(e){
            $('#statisticsModalMAM .updateAlternativeStatus[data-status=' + $(e.currentTarget).attr('data-status') + '][data-tier="' + $(e.currentTarget).attr('data-tier') + '"]').each(function(index, el){
                this.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
            }.bind(this));

            // Reset status
            this.parseMAM($(e.currentTarget).attr('data-tier'));
        }.bind(this)).css('cursor', 'pointer');

        $('#statisticsModalMAM .updateAlternativeStatus').on('click', function(e){
            this.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseMAM($(e.currentTarget).attr('data-tier'));
        }.bind(this)).css('cursor', 'pointer');
    }

    parseAwesomeSink(selectedCategory = null)
    {
        $('#statisticsModalAwesomeSink').empty();

        let purchasedAlternate      = this.getPurchasedSchematics();

        let html = [];
            html.push('<div class="card-body text-center">You can click on the status of the schematic to update its current state.</div>');

        let categories = [];
            for(let schematicId in this.baseLayout.schematicsData)
            {
                if(this.baseLayout.schematicsData[schematicId].category !== undefined && schematicId.startsWith('ResourceSink_') && categories.includes(this.baseLayout.schematicsData[schematicId].category) === false)
                {
                    categories.push(this.baseLayout.schematicsData[schematicId].category);
                }
            }
            categories.sort(function(a,b){ return a.localeCompare(b); }.bind(this));
            if(selectedCategory === null){ selectedCategory = categories[0]; }

        html.push('<ul class="nav nav-tabs nav-fill" role="tablist">');
        for(let i = 0; i < categories.length; i++)
        {
            html.push('<li class="nav-item"><a class="nav-link ' + ( (selectedCategory === categories[i]) ? 'active' : '' ) + '" data-toggle="tab" href="#playerUnlockedAwesomeSink-' + i + '" role="tab">' + categories[i] + '</a></li>');
        }
        html.push('</ul>');

        html.push('<div class="tab-content p-0 border border-top-0">');
        for(let i = 0; i < categories.length; i++)
        {
            html.push('<div class="tab-pane fade ' + ( (selectedCategory === categories[i]) ? 'show active' : '' ) + '" id="playerUnlockedAwesomeSink-' + i + '" role="tabpanel">');
            html.push('<table class="table mb-0">');
            html.push('<tr><td class="text-right" colspan="2"><button class="btn btn-sm btn-success updateAllAlternativeStatus" data-status="available" data-tier="' + categories[i] + '"><i class="fas fa-lock-open-alt"></i> Unlock all</button></td><td></td></tr>');

            let currentTierData   = {};
                for(let schematicId in this.baseLayout.schematicsData)
                {
                    if(schematicId.startsWith('ResourceSink_'))
                    {
                        if(this.baseLayout.schematicsData[schematicId].category !== undefined && this.baseLayout.schematicsData[schematicId].category === categories[i])
                        {
                            currentTierData[schematicId] = this.baseLayout.schematicsData[schematicId];
                        }
                    }
                }

            let schematicsDataKey = Object.keys(currentTierData).sort(function(a,b){ return a.localeCompare(b); }.bind(this));

            for(let j = 0; j < schematicsDataKey.length; j++)
            {
                let className        = schematicsDataKey[j];
                let currentSchematic = this.baseLayout.schematicsData[className];

                if(currentSchematic.category !== undefined)
                {
                    html.push('<tr>');
                    html.push('<td class="align-middle">');
                        html.push('<strong style="font-size: 120%;">' + currentSchematic.name + '</strong>');
                        html.push(this.getSchematicsUnlocks(currentSchematic));
                    html.push('</td>');
                    html.push('<td class="align-middle text-right">' + this.parseSchematicCost(currentSchematic) + '</td>');

                    if(currentSchematic.className !== undefined && purchasedAlternate.includes(currentSchematic.className))
                    {
                        html.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="purchased" data-tier="' + currentSchematic.category + '"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                    }
                    else
                    {
                        if(currentSchematic.className !== undefined)
                        {
                            html.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="available" data-tier="' + currentSchematic.category + '"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                        }
                        else
                        {
                            html.push('<td></td>');
                        }
                    }

                    html.push('</tr>');
                }
            }

            html.push('</table>');
            html.push('</div>');
        }
        html.push('</div>');

        $('#statisticsModalAwesomeSink').html(html.join(''));

        $('#statisticsModalAwesomeSink .updateAllAlternativeStatus').on('click', function(e){
            $('#statisticsModalAwesomeSink .updateAlternativeStatus[data-status=' + $(e.currentTarget).attr('data-status') + '][data-tier="' + $(e.currentTarget).attr('data-tier') + '"]').each(function(index, el){
                this.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
            }.bind(this));

            // Reset status
            this.parseAwesomeSink($(e.currentTarget).attr('data-tier'));
        }.bind(this)).css('cursor', 'pointer');

        $('#statisticsModalAwesomeSink .updateAlternativeStatus').on('click', function(e){
            this.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseAwesomeSink($(e.currentTarget).attr('data-tier'));
        }.bind(this)).css('cursor', 'pointer');
    }

    getSchematicsUnlocks(currentSchematic)
    {
        let unlocks = [];
            if(currentSchematic.recipes !== undefined)
            {
                for(let k = 0; k < currentSchematic.recipes.length; k++)
                {
                    let currentRecipe = this.baseLayout.getItemDataFromRecipeClassName(currentSchematic.recipes[k]);
                        if(currentRecipe !== null)
                        {
                            unlocks.push(currentRecipe.name);
                        }
                        else
                        {
                            unlocks.push(currentSchematic.recipes[k]);
                        }
                }
            }
            if(currentSchematic.scannerPairs !== undefined)
            {
                for(let k = 0; k < currentSchematic.scannerPairs.length; k++)
                {
                    if(currentSchematic.scannerPairs[k] === '/Game/FactoryGame/Resource/RawResources/Geyser/Desc_Geyser.Desc_Geyser_C')
                    {
                        unlocks.push('Object Scanner: Geyser');
                    }
                    else
                    {
                        let currentRecipe = this.baseLayout.getItemDataFromClassName(currentSchematic.scannerPairs[k]);
                            if(currentRecipe !== null)
                            {
                                unlocks.push('Object Scanner: ' + currentRecipe.name);
                            }
                            else
                            {
                                unlocks.push('Object Scanner: ' + currentSchematic.scannerPairs[k]);
                            }
                    }
                }
            }
            if(currentSchematic.slots !== undefined)
            {
                unlocks.push(currentSchematic.slots + ' Inventory Slot(s)');
            }
            if(currentSchematic.equipmentSlots !== undefined)
            {
                unlocks.push(currentSchematic.equipmentSlots + ' Equipment Slot(s)');
            }


            if(unlocks.length > 0)
            {
                return '<br />Unlocks: <em>' + unlocks.join(', ') + '</em>';
            }

        return '';
    }

    getPurchasedSchematics()
    {
        if(this.purchasedSchematics === null)
        {
            let purchasedAlternate      = [];
            let schematicManager        = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.schematicManager");
                if(schematicManager !== null)
                {
                    let mPurchasedSchematics    = this.baseLayout.getObjectProperty(schematicManager, 'mPurchasedSchematics');
                        if(mPurchasedSchematics !== null)
                        {
                            for(let i = 0; i < mPurchasedSchematics.values.length; i++)
                            {
                                if(purchasedAlternate.includes(mPurchasedSchematics.values[i].pathName) === false)
                                {
                                    purchasedAlternate.push(mPurchasedSchematics.values[i].pathName);

                                    let schematicId = mPurchasedSchematics.values[i].pathName.split('.').pop();
                                        if(
                                               this.baseLayout.schematicsData[schematicId] === undefined
                                            && schematicId !== 'Research_HardDrive_0_C'
                                            && schematicId !== 'ResourceSink_CyberWagon_Unlock_C'
                                            && mPurchasedSchematics.values[i].pathName.startsWith('/Game/FactoryGame/Schematics/ResourceSink/Parts/') === false
                                            && mPurchasedSchematics.values[i].pathName.startsWith('/Game/FactoryGame/Schematics/ResourceSink/ResourceSink_Statue') === false
                                        )
                                        {
                                            if(typeof Sentry !== 'undefined' && this.baseLayout.useDebug === true)
                                            {
                                                Sentry.setContext('className', {className: mPurchasedSchematics.values[i].pathName});
                                                Sentry.captureMessage('Missing schematic className: ' + mPurchasedSchematics.values[i].pathName);
                                            }
                                            console.log('Missing schematic className: ' + mPurchasedSchematics.values[i].pathName);
                                        }
                                }
                            }
                        }
                }

            this.purchasedSchematics = purchasedAlternate;
        }

        return this.purchasedSchematics;
    }

    parseSchematicCost(currentSchematic)
    {
        let html = [];

        if(currentSchematic.cost !== undefined)
        {
            html.push('<div class="d-flex flex-row-reverse">');
            for(let itemClassName in currentSchematic.cost)
            {
                let itemData    = this.baseLayout.getItemDataFromClassName(itemClassName);
                let itemCost    = currentSchematic.cost[itemClassName];
                let itemUnits   = '';
                let itemStyle   = 'border-radius: 5px;';

                if(itemData !== null)
                {
                    if(itemData.category !== undefined && (itemData.category === 'liquid' || itemData.category === 'gas'))
                    {
                        itemCost    = Math.round(Math.round(itemCost) / 1000);
                        itemUnits   = 'm³';
                        itemStyle   = 'border-radius: 50%;';
                    }

                    html.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 48px;height: 48px;border: 1px solid #000000;' + itemStyle + 'padding: 5px;background-color: #FFFFFF;" data-hover="tooltip" title="' + itemData.name + '">');
                    html.push('<img src="' + itemData.image + '" class="img-fluid" />');
                    html.push('<span class="badge badge-warning align-middle" style="position: absolute;bottom: -1px; right: -1px;">' + new Intl.NumberFormat(this.language).format(itemCost) + itemUnits + '</span>');
                    html.push('</div>');
                }
            }
            html.push('</div>');
        }

        return html.join('');
    }

    switchSchematic(schematicId, currentStatus)
    {
        this.availableSchematics    = null;
        this.purchasedSchematics    = null;

        if(this.baseLayout.schematicsData[schematicId] !== undefined && this.baseLayout.schematicsData[schematicId].className !== undefined)
        {
            let currentSchematic    = this.baseLayout.schematicsData[schematicId].className;
            let schematicManager    = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.schematicManager");

                if(schematicManager !== null)
                {
                    switch(currentStatus)
                    {
                        case 'purchased': // Go to none state
                            for(let i = 0; i < schematicManager.properties.length; i++)
                            {
                                if(schematicManager.properties[i].name === 'mAvailableSchematics')
                                {
                                    let mAvailableSchematics = schematicManager.properties[i].value.values;
                                        for(let j = mAvailableSchematics.length - 1; j >= 0; j--)
                                        {
                                            if(mAvailableSchematics[j].pathName === currentSchematic)
                                            {
                                                mAvailableSchematics.splice(j, 1);
                                            }
                                        }
                                }

                                if(schematicManager.properties[i].name === 'mPurchasedSchematics')
                                {
                                    let mPurchasedSchematics = schematicManager.properties[i].value.values;
                                        for(let j = mPurchasedSchematics.length - 1; j >= 0; j--)
                                        {
                                            if(mPurchasedSchematics[j].pathName === currentSchematic)
                                            {
                                                mPurchasedSchematics.splice(j, 1);
                                            }
                                        }
                                }
                            }
                            break;
                        case 'available': // Go to purchased state
                            for(let i = 0; i < schematicManager.properties.length; i++)
                            {
                                if(schematicManager.properties[i].name === 'mAvailableSchematics')
                                {
                                    let mAvailableSchematics = schematicManager.properties[i].value.values;
                                        for(let j = mAvailableSchematics.length - 1; j >= 0; j--)
                                        {
                                            if(mAvailableSchematics[j].pathName === currentSchematic)
                                            {
                                                mAvailableSchematics.splice(j, 1);
                                            }
                                        }
                                }

                                if(schematicManager.properties[i].name === 'mPurchasedSchematics')
                                {
                                    let preventDuplicate        = false;
                                    let mPurchasedSchematics    = schematicManager.properties[i].value.values;
                                        for(let j = 0; j < mPurchasedSchematics.length; j++)
                                        {
                                            if(mPurchasedSchematics[j].pathName === currentSchematic)
                                            {
                                                preventDuplicate = true;
                                                break;
                                            }
                                        }

                                        if(preventDuplicate === false)
                                        {
                                            mPurchasedSchematics.push({levelName: "", pathName: currentSchematic});
                                        }
                                }
                            }
                            break;
                        case 'none': // Go to available state
                            for(let i = 0; i < schematicManager.properties.length; i++)
                            {
                                if(schematicManager.properties[i].name === 'mAvailableSchematics')
                                {
                                    let preventDuplicate        = false;
                                    let mAvailableSchematics    = schematicManager.properties[i].value.values;
                                        for(let j = 0; j < mAvailableSchematics.length; j++)
                                        {
                                            if(mAvailableSchematics[j].pathName === currentSchematic)
                                            {
                                                preventDuplicate = true;
                                                break;
                                            }
                                        }

                                        if(preventDuplicate === false)
                                        {
                                            mAvailableSchematics.push({levelName: "", pathName: currentSchematic});
                                        }
                                }

                                if(schematicManager.properties[i].name === 'mPurchasedSchematics')
                                {
                                    let mPurchasedSchematics = schematicManager.properties[i].value.values;
                                        for(let j = mPurchasedSchematics.length - 1; j >= 0; j--)
                                        {
                                            if(mPurchasedSchematics[j].pathName === currentSchematic)
                                            {
                                                mPurchasedSchematics.splice(j, 1);
                                            }
                                        }
                                }
                            }
                            break;
                    }

                    let unlockSubSystem     = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem");
                        if(unlockSubSystem !== null)
                        {
                            switch(currentStatus)
                            {
                                case 'none': // Go to available state
                                case 'purchased': // Go to none state
                                    if(currentStatus !== 'none' && this.baseLayout.schematicsData[schematicId].equipmentSlots !== undefined)
                                    {
                                        let statisticsInventory = new BaseLayout_Statistics_Player_Inventory({
                                                baseLayout      : this.baseLayout
                                            });
                                            statisticsInventory.removeEquipmentSlot(this.baseLayout.schematicsData[schematicId].equipmentSlots);
                                    }
                                    if(currentStatus !== 'none' && this.baseLayout.schematicsData[schematicId].slots !== undefined)
                                    {
                                        let statisticsInventory = new BaseLayout_Statistics_Player_Inventory({
                                                baseLayout      : this.baseLayout
                                            });
                                            statisticsInventory.removeInventorySlot(this.baseLayout.schematicsData[schematicId].slots);
                                    }
                                    break;
                                case 'available': // Go to purchased state
                                    if(this.baseLayout.schematicsData[schematicId].equipmentSlots !== undefined)
                                    {
                                        let statisticsInventory = new BaseLayout_Statistics_Player_Inventory({
                                                baseLayout      : this.baseLayout
                                            });
                                            statisticsInventory.addEquipmentSlot(this.baseLayout.schematicsData[schematicId].equipmentSlots);
                                    }
                                    if(this.baseLayout.schematicsData[schematicId].slots !== undefined)
                                    {
                                        let statisticsInventory = new BaseLayout_Statistics_Player_Inventory({
                                                baseLayout      : this.baseLayout
                                            });
                                            statisticsInventory.addInventorySlot(this.baseLayout.schematicsData[schematicId].slots);
                                    }
                                    break;
                            }
                        }

                    let researchManager = Building_MAM.getManager(this.baseLayout);
                        if(researchManager !== null)
                        {
                            let currentResearch = currentSchematic.split('.');
                                currentResearch = currentResearch.pop();
                                currentResearch = currentResearch.split('_');

                                if(currentResearch[0] === 'Research')
                                {
                                        Building_MAM.initiate(this.baseLayout);
                                    let mUnlockedResearchTrees  = this.baseLayout.getObjectProperty(researchManager, 'mUnlockedResearchTrees');
                                    let currentTree             = null;

                                        switch(currentResearch[1])
                                        {
                                            //{levelName: "", pathName: "/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_HardDrive.BPD_ResearchTree_HardDrive_C"}
                                            case 'AlienOrganisms':
                                                currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_AlienOrganisms.BPD_ResearchTree_AlienOrganisms_C';
                                                break;
                                            case 'Caterium':
                                                currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Caterium.BPD_ResearchTree_Caterium_C';
                                                break;
                                            case 'FlowerPetals':
                                                currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_FlowerPetals.BPD_ResearchTree_FlowerPetals_C';
                                                break;
                                            case 'Mycelia':
                                                currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Mycelia.BPD_ResearchTree_Mycelia_C';
                                                break;
                                            case 'Nutrients':
                                                currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Nutrients.BPD_ResearchTree_Nutrients_C';
                                                break;
                                            case 'PowerSlugs':
                                                currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_PowerSlugs.BPD_ResearchTree_PowerSlugs_C';
                                                break;
                                            case 'Quartz':
                                                currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Quartz.BPD_ResearchTree_Quartz_C';
                                                break;
                                            case 'Sulfur':
                                                currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Sulfur.BPD_ResearchTree_Sulfur_C';
                                                break;
                                            case 'XMas':
                                                currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_XMas.BPD_ResearchTree_XMas_C';
                                                break;
                                        }

                                    if(currentTree !== null)
                                    {
                                        let isUnlocked                      = false;
                                        let mUnlockedResearchTreesValues    = mUnlockedResearchTrees.values;
                                            for(let j = 0; j < mUnlockedResearchTreesValues.length; j++)
                                            {
                                                if(mUnlockedResearchTreesValues[j].pathName === currentTree)
                                                {
                                                    isUnlocked = true;
                                                    break;
                                                }
                                            }

                                            if(isUnlocked === false)
                                            {
                                                mUnlockedResearchTreesValues.push({levelName: "", pathName: currentTree});
                                            }
                                    }
                                }
                        }
                }
        }
    }
}