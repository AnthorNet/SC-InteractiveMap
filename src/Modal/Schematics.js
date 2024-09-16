/* global Intl */

export default class Modal_Schematics
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;

        // Cache
        this.availableSchematics    = null;
        this.purchasedSchematics    = null;
    }

    parseSchematics(selectedTier = 0)
    {
        $('#statisticsModalSchematics').empty();

        let purchased   = this.baseLayout.schematicSubSystem.getPurchasedSchematics();
        let unkModded   = [];
        let html        = [];
            html.push('<div class="card-body text-center">You can click on the status of the schematic to update its current state.</div>');

        let maxTier = 0;
            for(let schematicId in this.baseLayout.schematicsData)
            {
                if(schematicId.startsWith('Schematic_') || schematicId.startsWith('Schem_') || schematicId.startsWith('/SS_Mod/Schematics/'))
                {
                    if(this.baseLayout.schematicsData[schematicId].tier !== undefined)
                    {
                        maxTier = Math.max(maxTier, this.baseLayout.schematicsData[schematicId].tier);
                    }
                }
            }

            // Find unknown modded schematics
            for(let i = 0; i < purchased.length; i++)
            {
                let wasFound = false;
                    for(let schematicId in this.baseLayout.schematicsData)
                    {
                        if(this.baseLayout.schematicsData[schematicId].className === purchased[i])
                        {
                            wasFound = true;
                            break;
                        }
                    }

                    if(wasFound === false && purchased[i].startsWith('/Game/FactoryGame/') === false)
                    {
                        unkModded.push(purchased[i]);
                    }
            }

        html.push('<ul class="nav nav-tabs nav-fill">');
        for(let i = 0; i <= maxTier; i++)
        {
            html.push('<li class="nav-item"><span class="nav-link ' + ( (selectedTier === i) ? 'active' : '' ) + '" data-toggle="tab" href="#playerUnlockedSchematics-' + i + '" style="cursor:pointer;">Tier ' + i + '</span></li>');
        }
        if(unkModded.length > 0)
        {
            html.push('<li class="nav-item"><span class="nav-link ' + ( (selectedTier === 'unkModded') ? 'active' : '' ) + '" data-toggle="tab" href="#playerUnlockedSchematics-unkModded" style="cursor:pointer;">???</span></li>');
        }
        html.push('</ul>');

        html.push('<div class="tab-content p-0 border border-top-0">');
        for(let i = 0; i <= (maxTier + 1); i++)
        {
            let htmlData        = [];
            let unlocked        = 0;
            let total           = 0;

            let currentData     = {};
                if(unkModded.length > 0 && i === (maxTier + 1))
                {
                    for(let j = 0; j < unkModded.length; j++)
                    {
                        currentData[unkModded[j]] = {
                            className   : unkModded[j],
                            name        : unkModded[j].split('.').pop(),
                            image       : 'https://static.satisfactory-calculator.com/img/mapUnknownIcon.png'
                        };
                    }
                }
                else
                {
                    for(let schematicId in this.baseLayout.schematicsData)
                    {
                        if(this.baseLayout.schematicsData[schematicId].tier !== undefined && this.baseLayout.schematicsData[schematicId].tier === i && (schematicId.startsWith('Schematic_') || schematicId.startsWith('Schem_') || schematicId.startsWith('/SS_Mod/Schematics/')))
                        {
                            currentData[schematicId] = this.baseLayout.schematicsData[schematicId];
                        }
                    }
                }

            let schematicsDataKey = Object.keys(currentData).sort((a, b) => { return a.localeCompare(b); });

            for(let j = 0; j < schematicsDataKey.length; j++)
            {
                let schematicId      = schematicsDataKey[j];
                let currentSchematic = currentData[schematicId];
                    total++;

                if(currentSchematic.tier !== undefined || (unkModded.length > 0 && i === (maxTier + 1)))
                {
                    htmlData.push('<tr>');
                    htmlData.push('<td class="align-middle" width="88">');
                        htmlData.push('<img src="' + currentSchematic.image + '" class="img-fluid" style="width: 64px;">');
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle">');
                        htmlData.push('<strong style="font-size: 120%;">' + currentSchematic.name + '</strong>');
                        htmlData.push(this.baseLayout.schematicSubSystem.getSchematicsUnlocks(currentSchematic));
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle text-right">' + this.parseSchematicCost(currentSchematic) + '</td>');

                    if(currentSchematic.className !== undefined && purchased.includes(currentSchematic.className))
                    {
                        htmlData.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + schematicId + '" data-status="none" data-tier="' + ((unkModded.length > 0 && i === (maxTier + 1)) ? 'unkModded' : currentSchematic.tier) + '"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                        unlocked++;
                    }
                    else
                    {
                        if(currentSchematic.className !== undefined)
                        {
                            htmlData.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + schematicId + '" data-status="available" data-tier="' + currentSchematic.tier + '"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                        }
                        else
                        {
                            htmlData.push('<td></td>');
                        }
                    }

                    htmlData.push('</tr>');
                }
            }

            html.push('<div class="tab-pane fade ' + ( (selectedTier === i || (unkModded.length > 0 && i === (maxTier + 1) && selectedTier === 'unkModded')) ? 'show active' : '' ) + '" id="playerUnlockedSchematics-' + ((unkModded.length > 0 && i === (maxTier + 1)) ? 'unkModded' : i) + '">');
            html.push('<table class="table mb-0"><tr>');
            html.push('<td class="align-middle" height="60">You have <strong>' + new Intl.NumberFormat(this.language).format(unlocked) + '/' + new Intl.NumberFormat(this.language).format(total) + '</strong> schematics unlocked.</td>');

            if(unlocked < total && i !== (maxTier + 1))
            {
                html.push('<td class="text-right"><button class="btn btn-sm btn-success updateAllAlternativeStatus" data-status="available" data-tier="' + i + '"><i class="fas fa-lock-open-alt"></i> Unlock all</button></td>');
            }

            html.push('</tr></table>');
            html.push('<table class="table mb-0">');
            html.push(htmlData.join(''));
            html.push('</table>');
            html.push('</div>');
        }
        html.push('</div>');

        $('#statisticsModalSchematics').html(html.join(''));

        $('#statisticsModalSchematics .updateAllAlternativeStatus').on('click', (e) => {
            $('#statisticsModalSchematics .updateAlternativeStatus[data-status=' + $(e.currentTarget).attr('data-status') + '][data-tier=' + $(e.currentTarget).attr('data-tier') + ']')
                .each((i, el) => {
                    this.baseLayout.schematicSubSystem.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseSchematics(parseInt($(e.currentTarget).attr('data-tier')));
        }).css('cursor', 'pointer');

        $('#statisticsModalSchematics .updateAlternativeStatus').on('click', (e) => {
            this.baseLayout.schematicSubSystem.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            let currentTier = $(e.currentTarget).attr('data-tier');
                $(e.currentTarget).find('i').tooltip('dispose');
                this.parseSchematics(((currentTier === 'unkModded') ? currentTier : parseInt(currentTier)));
        }).css('cursor', 'pointer');
    }

    parseAlternateRecipes()
    {
        $('#statisticsModalAlternateRecipes').empty();

        let purchased   = this.baseLayout.schematicSubSystem.getPurchasedSchematics();
        let unlocked    = 0;
        let total       = 0;
        let htmlData    = [];

        let schematicsDataKey = Object.keys(this.baseLayout.schematicsData).sort((a, b) => {
                return this.baseLayout.schematicsData[a].name.localeCompare(this.baseLayout.schematicsData[b].name);
            });

        for(let i = 0; i < schematicsDataKey.length; i++)
        {
            if(schematicsDataKey[i].includes('Schematic_Alternate_'))
            {
                let className           = schematicsDataKey[i];
                let currentSchematic    = this.baseLayout.schematicsData[className];
                    total++;

                htmlData.push('<tr>');

                if(currentSchematic.recipes !== undefined)
                {
                    let currentRecipe       = this.baseLayout.getRecipeFromClassName(currentSchematic.recipes[0]);

                        if(currentRecipe !== null)
                        {
                            htmlData.push('<td width="' + ((Object.keys(currentRecipe.produce).length * 48) + 10) + '" class="text-center">');
                            htmlData.push('<div class="d-flex flex-row justify-content-center">');

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

                                    htmlData.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 48px;height: 48px;border: 1px solid #000000;' + itemStyle + 'padding: 5px;background-color: #FFFFFF;" data-hover="tooltip" title="' + itemData.name + '">');
                                    htmlData.push('<img src="' + itemData.image + '" class="img-fluid" />');
                                    htmlData.push('<span class="badge badge-warning align-middle" style="position: absolute;bottom: -1px; right: -1px;">' + new Intl.NumberFormat(this.language).format(itemProduced) + itemUnits + '</span>');
                                    htmlData.push('</div>');
                                }
                            }

                            htmlData.push('</div>');
                            htmlData.push('</td>');
                        }
                        else
                        {
                            htmlData.push('<td></td>');
                        }
                }
                else
                {
                    if(currentSchematic.slots !== undefined)
                    {
                        htmlData.push('<td>');
                        htmlData.push('<div class="d-flex flex-row justify-content-center">');
                        htmlData.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 48px;height: 48px;border: 1px solid #000000;border-radius: 5px;padding: 5px;background-color: #FFFFFF;" data-hover="tooltip" title="Inventory Slots">');
                        htmlData.push('<img src="' + this.baseLayout.staticUrl + '/img/gameUpdate5/ThumbsUp_256.png?v=' + this.baseLayout.scriptVersion + '" class="img-fluid" />');
                        htmlData.push('<span class="badge badge-warning align-middle" style="position: absolute;bottom: -1px; right: -1px;">' + new Intl.NumberFormat(this.language).format(currentSchematic.slots) + '</span>');
                        htmlData.push('</div>');
                        htmlData.push('</div>');
                        htmlData.push('</td>');
                    }
                    else
                    {
                        htmlData.push('<td></td>');
                    }
                }


                htmlData.push('<td class="align-middle"><strong style="font-size: 120%;">' + currentSchematic.name + '</strong></td>');

                if(currentSchematic.className !== undefined && purchased.includes(currentSchematic.className))
                {
                    htmlData.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="purchased"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                    unlocked++;
                }
                else
                {
                    if(currentSchematic.className !== undefined)
                    {
                        htmlData.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="available"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                    }
                    else
                    {
                        htmlData.push('<td></td>');
                    }
                }

                htmlData.push('</tr>');
            }
        }

        let html = [];
            html.push('<div class="card-body text-center">You can click on the status of the recipe to update its current state.</div>');
            html.push('<table class="table mb-0"><tr>');
            html.push('<td class="align-middle" height="60">You have <strong>' + new Intl.NumberFormat(this.language).format(unlocked) + '/' + new Intl.NumberFormat(this.language).format(total) + '</strong> alternative recipes unlocked.</td>');

            if(unlocked < total)
            {
                html.push('<td class="text-right"><button class="btn btn-sm btn-success updateAllAlternativeStatus" data-status="available"><i class="fas fa-lock-open-alt"></i> Unlock all</button></td>');
            }

            html.push('</tr></table>');

            html.push('<table class="table mb-0">');
            html.push(htmlData.join(''));
            html.push('</table>');

        $('#statisticsModalAlternateRecipes').html(html.join(''));

        $('#statisticsModalAlternateRecipes .updateAllAlternativeStatus').on('click', (e) => {
            $('#statisticsModalAlternateRecipes .updateAlternativeStatus[data-status=' + $(e.currentTarget).attr('data-status') + ']')
                .each((i, el) => {
                    this.baseLayout.schematicSubSystem.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseAlternateRecipes();
        }).css('cursor', 'pointer');

        $('#statisticsModalAlternateRecipes .updateAlternativeStatus').on('click', (e) => {
            this.baseLayout.schematicSubSystem.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseAlternateRecipes();
        }).css('cursor', 'pointer');
    }

    parseMAM(selectedCategory = null)
    {
        $('#statisticsModalMAM').empty();

        let purchased   = this.baseLayout.schematicSubSystem.getPurchasedSchematics();
        let categories  = [];
            for(let schematicId in this.baseLayout.schematicsData)
            {
                if(this.baseLayout.schematicsData[schematicId].category !== undefined && schematicId.startsWith('Research_') && categories.includes(this.baseLayout.schematicsData[schematicId].category) === false)
                {
                    categories.push(this.baseLayout.schematicsData[schematicId].category);
                }
            }
            categories.sort((a, b) => { return a.localeCompare(b); });
            if(selectedCategory === null){ selectedCategory = categories[0]; }

        let html        = [];
            html.push('<div class="card-body text-center">You can click on the status of the schematic to update its current state.</div>');
            html.push('<ul class="nav nav-tabs nav-fill">');
            for(let i = 0; i < categories.length; i++)
            {
                html.push('<li class="nav-item"><span class="nav-link px-3 ' + ( (selectedCategory === categories[i]) ? 'active' : '' ) + '" data-toggle="tab" href="#playerUnlockedMAM-' + i + '" style="cursor:pointer;">' + categories[i] + '</span></li>');
            }
            html.push('</ul>');

        html.push('<div class="tab-content p-0 border border-top-0">');
        for(let i = 0; i < categories.length; i++)
        {
            let htmlData    = [];
            let unlocked    = 0;
            let total       = 0;

            let currentData = {};
                for(let schematicId in this.baseLayout.schematicsData)
                {
                    if(schematicId.startsWith('Research_'))
                    {
                        if(this.baseLayout.schematicsData[schematicId].category !== undefined && this.baseLayout.schematicsData[schematicId].category === categories[i])
                        {
                            currentData[schematicId] = this.baseLayout.schematicsData[schematicId];
                        }
                    }
                }

            let schematicsDataKey = Object.keys(currentData).sort((a, b) => { return a.localeCompare(b); });

            for(let j = 0; j < schematicsDataKey.length; j++)
            {
                let className        = schematicsDataKey[j];
                let currentSchematic = this.baseLayout.schematicsData[className];
                    total++;

                if(currentSchematic.category !== undefined)
                {
                    htmlData.push('<tr>');
                    htmlData.push('<td class="align-middle" width="88">');
                        htmlData.push('<img src="' + currentSchematic.image + '" class="img-fluid" style="width: 64px;">');
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle">');
                        htmlData.push('<strong style="font-size: 120%;">' + currentSchematic.name + '</strong>');
                        htmlData.push(this.baseLayout.schematicSubSystem.getSchematicsUnlocks(currentSchematic));
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle text-right">' + this.parseSchematicCost(currentSchematic) + '</td>');

                    if(currentSchematic.className !== undefined && purchased.includes(currentSchematic.className))
                    {
                        htmlData.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="purchased" data-tier="' + currentSchematic.category + '"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                        unlocked++;
                    }
                    else
                    {
                        if(currentSchematic.className !== undefined)
                        {
                            htmlData.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="available" data-tier="' + currentSchematic.category + '"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                        }
                        else
                        {
                            htmlData.push('<td></td>');
                        }
                    }

                    htmlData.push('</tr>');
                }
            }

            html.push('<div class="tab-pane fade ' + ( (selectedCategory === categories[i]) ? 'show active' : '' ) + '" id="playerUnlockedMAM-' + i + '">');
            html.push('<table class="table mb-0"><tr>');
            html.push('<td class="align-middle" height="60">You have <strong>' + new Intl.NumberFormat(this.language).format(unlocked) + '/' + new Intl.NumberFormat(this.language).format(total) + '</strong> schematics unlocked.</td>');

            if(unlocked < total)
            {
                html.push('<td class="text-right"><button class="btn btn-sm btn-success updateAllAlternativeStatus" data-status="available" data-tier="' + categories[i] + '"><i class="fas fa-lock-open-alt"></i> Unlock all</button></td>');
            }

            html.push('</tr></table>');
            html.push('<table class="table mb-0">');
            html.push(htmlData.join(''));
            html.push('</table>');
            html.push('</div>');
        }
        html.push('</div>');

        $('#statisticsModalMAM').html(html.join(''));

        $('#statisticsModalMAM .updateAllAlternativeStatus').on('click', (e) => {
            $('#statisticsModalMAM .updateAlternativeStatus[data-status=' + $(e.currentTarget).attr('data-status') + '][data-tier="' + $(e.currentTarget).attr('data-tier') + '"]')
                .each((i, el) => {
                    this.baseLayout.schematicSubSystem.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseMAM($(e.currentTarget).attr('data-tier'));
        }).css('cursor', 'pointer');

        $('#statisticsModalMAM .updateAlternativeStatus').on('click', (e) => {
            this.baseLayout.schematicSubSystem.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseMAM($(e.currentTarget).attr('data-tier'));
        }).css('cursor', 'pointer');
    }

    parseAwesomeSink(selectedCategory = null)
    {
        $('#statisticsModalAwesomeSink').empty();

        let purchased   = this.baseLayout.schematicSubSystem.getPurchasedSchematics();
        let categories  = [];
            for(let schematicId in this.baseLayout.schematicsData)
            {
                if(this.baseLayout.schematicsData[schematicId].category !== undefined && (schematicId.startsWith('ResourceSink_') || ['Schematic_AbsoluteFicsit_C', 'Schematic_Goat_C', 'Schematic_JoelSyntholm_C', 'Schematic_LeMichael_C', 'Schematic_Sanctum_C', 'Schematic_Sanctum2_C'].includes(schematicId)) && categories.includes(this.baseLayout.schematicsData[schematicId].category) === false)
                {
                    categories.push(this.baseLayout.schematicsData[schematicId].category);
                }
            }
            categories.sort((a, b) => { return a.localeCompare(b); });
            if(selectedCategory === null){ selectedCategory = categories[0]; }

        let html        = [];
            html.push('<div class="card-body text-center">You can click on the status of the schematic to update its current state.</div>');
            html.push('<ul class="nav nav-tabs nav-fill">');
            for(let i = 0; i < categories.length; i++)
            {
                html.push('<li class="nav-item"><span class="nav-link px-3 ' + ( (selectedCategory === categories[i]) ? 'active' : '' ) + '" data-toggle="tab" href="#playerUnlockedAwesomeSink-' + i + '" style="cursor:pointer;">' + categories[i] + '</span></li>');
            }
            html.push('</ul>');

        html.push('<div class="tab-content p-0 border border-top-0">');
        for(let i = 0; i < categories.length; i++)
        {
            let htmlData    = [];
            let unlocked    = 0;
            let total       = 0;

            let currentData = {};
                for(let schematicId in this.baseLayout.schematicsData)
                {
                    if(schematicId.startsWith('ResourceSink_') || ['Schematic_AbsoluteFicsit_C', 'Schematic_Goat_C', 'Schematic_JoelSyntholm_C', 'Schematic_LeMichael_C', 'Schematic_Sanctum_C', 'Schematic_Sanctum2_C'].includes(schematicId))
                    {
                        if(this.baseLayout.schematicsData[schematicId].category !== undefined && this.baseLayout.schematicsData[schematicId].category === categories[i])
                        {
                            currentData[schematicId] = this.baseLayout.schematicsData[schematicId];
                        }
                    }
                }

            let schematicsDataKey = Object.keys(currentData).sort((a, b) => { return a.localeCompare(b); });

            for(let j = 0; j < schematicsDataKey.length; j++)
            {
                let className        = schematicsDataKey[j];
                let currentSchematic = this.baseLayout.schematicsData[className];
                    total++;

                if(currentSchematic.category !== undefined)
                {
                    htmlData.push('<tr>');
                    htmlData.push('<td class="align-middle" width="88">');
                        htmlData.push('<img src="' + currentSchematic.image + '" class="img-fluid" style="width: 64px;">');
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle">');
                        htmlData.push('<strong style="font-size: 120%;">' + currentSchematic.name + '</strong>');
                        htmlData.push(this.baseLayout.schematicSubSystem.getSchematicsUnlocks(currentSchematic));
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle text-right">' + this.parseSchematicCost(currentSchematic) + '</td>');

                    if(currentSchematic.className !== undefined && purchased.includes(currentSchematic.className))
                    {
                        htmlData.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="purchased" data-tier="' + currentSchematic.category + '"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                        unlocked++;
                    }
                    else
                    {
                        if(currentSchematic.className !== undefined)
                        {
                            htmlData.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="available" data-tier="' + currentSchematic.category + '"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                        }
                        else
                        {
                            htmlData.push('<td></td>');
                        }
                    }

                    htmlData.push('</tr>');
                }
            }

            html.push('<div class="tab-pane fade ' + ( (selectedCategory === categories[i]) ? 'show active' : '' ) + '" id="playerUnlockedAwesomeSink-' + i + '">');
            html.push('<table class="table mb-0"><tr>');
            html.push('<td class="align-middle" height="60">You have <strong>' + new Intl.NumberFormat(this.language).format(unlocked) + '/' + new Intl.NumberFormat(this.language).format(total) + '</strong> schematics unlocked.</td>');

            if(unlocked < total)
            {
                html.push('<td class="text-right"><button class="btn btn-sm btn-success updateAllAlternativeStatus" data-status="available" data-tier="' + categories[i] + '"><i class="fas fa-lock-open-alt"></i> Unlock all</button></td>');
            }

            html.push('</tr></table>');
            html.push('<table class="table mb-0">');
            html.push(htmlData.join(''));
            html.push('</table>');
            html.push('</div>');
        }
        html.push('</div>');

        $('#statisticsModalAwesomeSink').html(html.join(''));

        $('#statisticsModalAwesomeSink .updateAllAlternativeStatus').on('click', (e) => {
            $('#statisticsModalAwesomeSink .updateAlternativeStatus[data-status=' + $(e.currentTarget).attr('data-status') + '][data-tier="' + $(e.currentTarget).attr('data-tier') + '"]')
                .each((i, el) => {
                    this.baseLayout.schematicSubSystem.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseAwesomeSink($(e.currentTarget).attr('data-tier'));
        }).css('cursor', 'pointer');

        $('#statisticsModalAwesomeSink .updateAlternativeStatus').on('click', (e) => {
            this.baseLayout.schematicSubSystem.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseAwesomeSink($(e.currentTarget).attr('data-tier'));
        }).css('cursor', 'pointer');
    }

    parseSpecial()
    {
        $('#statisticsModalSpecial').empty();

        let purchased   = this.baseLayout.schematicSubSystem.getPurchasedSchematics();
        let unlocked    = 0;
        let total       = 0;

        let html        = [];
            html.push('<div class="card-body text-center">You can click on the status of the schematic to update its current state.</div>');

        html.push('<div class="tab-content p-0 border border-top-0">');
            let htmlData    = [];
            let currentData = {};
                for(let schematicId in this.baseLayout.schematicsData)
                {
                    if(
                            schematicId.startsWith('Ficsmas_Schematic_')
                         || schematicId.startsWith('Schematic_Skin_Buildgun_')
                         || schematicId.startsWith('Schematic_Helmet_')
                         || schematicId.startsWith('Schematic_Trinket_')
                         || schematicId.startsWith('Schematic_XMassTree_')
                         || ['Schematic_DeepRockGalactic_C', 'Schematic_Huntdown_C', 'Schematic_SongsOfConquest_C'].includes(schematicId)
                    )
                    {
                        currentData[schematicId] = this.baseLayout.schematicsData[schematicId];
                    }
                }

            let schematicsDataKey = Object.keys(currentData).sort((a, b) => { return a.localeCompare(b); });

            for(let j = 0; j < schematicsDataKey.length; j++)
            {
                let className        = schematicsDataKey[j];
                let currentSchematic = this.baseLayout.schematicsData[className];
                    total++;

                if(currentSchematic.category !== undefined)
                {
                    htmlData.push('<tr>');
                    htmlData.push('<td class="align-middle" width="88">');
                        htmlData.push('<img src="' + currentSchematic.image + '" class="img-fluid" style="width: 64px;">');
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle">');
                        htmlData.push('<strong style="font-size: 120%;">' + currentSchematic.name + '</strong>');
                        htmlData.push(this.baseLayout.schematicSubSystem.getSchematicsUnlocks(currentSchematic));
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle text-right">' + this.parseSchematicCost(currentSchematic) + '</td>');

                    if(currentSchematic.className !== undefined && purchased.includes(currentSchematic.className))
                    {
                        htmlData.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="purchased"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                        unlocked++;
                    }
                    else
                    {
                        if(currentSchematic.className !== undefined)
                        {
                            htmlData.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="available"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                        }
                        else
                        {
                            htmlData.push('<td></td>');
                        }
                    }

                    htmlData.push('</tr>');
                }
            }

            html.push('<table class="table mb-0"><tr>');
            html.push('<td class="align-middle" height="60">You have <strong>' + new Intl.NumberFormat(this.language).format(unlocked) + '/' + new Intl.NumberFormat(this.language).format(total) + '</strong> schematics unlocked.</td>');

            if(unlocked < total)
            {
                html.push('<td class="text-right"><button class="btn btn-sm btn-success updateAllAlternativeStatus" data-status="available"><i class="fas fa-lock-open-alt"></i> Unlock all</button></td>');
            }

            html.push('</tr></table>');
            html.push('<table class="table mb-0">');
            html.push(htmlData.join(''));
            html.push('</table>');
        html.push('</div>');

        $('#statisticsModalSpecial').html(html.join(''));

        $('#statisticsModalSpecial .updateAllAlternativeStatus').on('click', (e) => {
            $('#statisticsModalSpecial .updateAlternativeStatus[data-status=' + $(e.currentTarget).attr('data-status') + ']')
                .each((i, el) => {
                    this.baseLayout.schematicSubSystem.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseAlternateRecipes();
        }).css('cursor', 'pointer');

        $('#statisticsModalSpecial .updateAlternativeStatus').on('click', (e) => {
            this.baseLayout.schematicSubSystem.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseSpecial();
        }).css('cursor', 'pointer');
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
}
