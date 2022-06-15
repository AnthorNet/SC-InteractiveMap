/* global Intl, Sentry */
import Modal_Map_Players                         from '../Modal/Map/Players.js';

import Building_MAM                             from '../Building/MAM.js';

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

        let purchased   = this.getPurchasedSchematics();
        let html        = [];
            html.push('<div class="card-body text-center">You can click on the status of the schematic to update its current state.</div>');

        let maxTier = 0;
            for(let schematicId in this.baseLayout.schematicsData)
            {
                if(this.baseLayout.schematicsData[schematicId].tier !== undefined && (schematicId.startsWith('Schematic_') || schematicId.startsWith('Schem_') || schematicId.startsWith('/SS_Mod/Schematics/')))
                {
                    maxTier = Math.max(maxTier, this.baseLayout.schematicsData[schematicId].tier);
                }
            }

        html.push('<ul class="nav nav-tabs nav-fill">');
        for(let i = 0; i <= maxTier; i++)
        {
            html.push('<li class="nav-item"><span class="nav-link ' + ( (selectedTier === i) ? 'active' : '' ) + '" data-toggle="tab" href="#playerUnlockedSchematics-' + i + '" style="cursor:pointer;">Tier ' + i + '</span></li>');
        }
        html.push('</ul>');

        html.push('<div class="tab-content p-0 border border-top-0">');
        for(let i = 0; i <= maxTier; i++)
        {
            let htmlData        = [];
            let unlocked        = 0;
            let total           = 0;

            let currentData     = {};
                for(let schematicId in this.baseLayout.schematicsData)
                {
                    if(this.baseLayout.schematicsData[schematicId].tier !== undefined && this.baseLayout.schematicsData[schematicId].tier === i && (schematicId.startsWith('Schematic_') || schematicId.startsWith('Schem_') || schematicId.startsWith('/SS_Mod/Schematics/')))
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

                if(currentSchematic.tier !== undefined)
                {
                    htmlData.push('<tr>');
                    htmlData.push('<td class="align-middle" width="88">');
                        htmlData.push('<img src="' + currentSchematic.image + '" class="img-fluid" style="width: 64px;">');
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle">');
                        htmlData.push('<strong style="font-size: 120%;">' + currentSchematic.name + '</strong>');
                        htmlData.push(this.getSchematicsUnlocks(currentSchematic));
                    htmlData.push('</td>');
                    htmlData.push('<td class="align-middle text-right">' + this.parseSchematicCost(currentSchematic) + '</td>');

                    if(currentSchematic.className !== undefined && purchased.includes(currentSchematic.className))
                    {
                        htmlData.push('<td class="align-middle text-center text-success updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="none" data-tier="' + currentSchematic.tier + '"><i class="fas fa-lock-open-alt" data-hover="tooltip" title="Available"></i></td>');
                        unlocked++;
                    }
                    else
                    {
                        if(currentSchematic.className !== undefined)
                        {
                            htmlData.push('<td class="align-middle text-center text-info updateAlternativeStatus" width="30" data-schematic="' + className + '" data-status="available" data-tier="' + currentSchematic.tier + '"><i class="fas fa-times" data-hover="tooltip" title="Not available yet"></i></td>');
                        }
                        else
                        {
                            htmlData.push('<td></td>');
                        }
                    }

                    htmlData.push('</tr>');
                }
            }

            html.push('<div class="tab-pane fade ' + ( (selectedTier === i) ? 'show active' : '' ) + '" id="playerUnlockedSchematics-' + i + '">');
            html.push('<table class="table mb-0"><tr>');
            html.push('<td class="align-middle" height="60">You have <strong>' + new Intl.NumberFormat(this.language).format(unlocked) + '/' + new Intl.NumberFormat(this.language).format(total) + '</strong> schematics unlocked.</td>');

            if(unlocked < total)
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
                    this.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseSchematics(parseInt($(e.currentTarget).attr('data-tier')));
        }).css('cursor', 'pointer');

        $('#statisticsModalSchematics .updateAlternativeStatus').on('click', (e) => {
            this.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseSchematics(parseInt($(e.currentTarget).attr('data-tier')));
        }).css('cursor', 'pointer');
    }

    parseAlternateRecipes()
    {
        $('#statisticsModalAlternateRecipes').empty();
        this.baseLayout.collectedSchematics.resetCollected();

        let purchased   = this.getPurchasedSchematics();
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
                    this.baseLayout.collectedSchematics.addCollected(className);
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
                    this.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseAlternateRecipes();
        }).css('cursor', 'pointer');

        $('#statisticsModalAlternateRecipes .updateAlternativeStatus').on('click', (e) => {
            this.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseAlternateRecipes();
        }).css('cursor', 'pointer');
    }

    parseMAM(selectedCategory = null)
    {
        $('#statisticsModalMAM').empty();

        let purchased   = this.getPurchasedSchematics();
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
                        htmlData.push(this.getSchematicsUnlocks(currentSchematic));
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
                    this.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseMAM($(e.currentTarget).attr('data-tier'));
        }).css('cursor', 'pointer');

        $('#statisticsModalMAM .updateAlternativeStatus').on('click', (e) => {
            this.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseMAM($(e.currentTarget).attr('data-tier'));
        }).css('cursor', 'pointer');
    }

    parseAwesomeSink(selectedCategory = null)
    {
        $('#statisticsModalAwesomeSink').empty();

        let purchased   = this.getPurchasedSchematics();
        let categories  = [];
            for(let schematicId in this.baseLayout.schematicsData)
            {
                if(this.baseLayout.schematicsData[schematicId].category !== undefined && schematicId.startsWith('ResourceSink_') && categories.includes(this.baseLayout.schematicsData[schematicId].category) === false)
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
                    if(schematicId.startsWith('ResourceSink_'))
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
                        htmlData.push(this.getSchematicsUnlocks(currentSchematic));
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
                    this.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseAwesomeSink($(e.currentTarget).attr('data-tier'));
        }).css('cursor', 'pointer');

        $('#statisticsModalAwesomeSink .updateAlternativeStatus').on('click', (e) => {
            this.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseAwesomeSink($(e.currentTarget).attr('data-tier'));
        }).css('cursor', 'pointer');
    }

    parseSpecial()
    {
        $('#statisticsModalSpecial').empty();

        let purchased   = this.getPurchasedSchematics();
        let unlocked    = 0;
        let total       = 0;

        let html        = [];
            html.push('<div class="card-body text-center">You can click on the status of the schematic to update its current state.</div>');

        html.push('<div class="tab-content p-0 border border-top-0">');
            let htmlData    = [];
            let currentData = {};
                for(let schematicId in this.baseLayout.schematicsData)
                {
                    if(schematicId.startsWith('Ficsmas_Schematic_') || schematicId.startsWith('Schematic_XMassTree_'))
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
                        htmlData.push(this.getSchematicsUnlocks(currentSchematic));
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
                    this.switchSchematic($(el).attr('data-schematic'), $(e.currentTarget).attr('data-status'));
                });

            // Reset status
            this.parseAlternateRecipes();
        }).css('cursor', 'pointer');

        $('#statisticsModalSpecial .updateAlternativeStatus').on('click', (e) => {
            this.switchSchematic($(e.currentTarget).attr('data-schematic'), $(e.currentTarget).attr('data-status'));

            // Reset status
            $(e.currentTarget).find('i').tooltip('dispose');
            this.parseSpecial();
        }).css('cursor', 'pointer');
    }

    getSchematicsUnlocks(currentSchematic)
    {
        let unlocks = [];
            if(currentSchematic.recipes !== undefined)
            {
                for(let k = 0; k < currentSchematic.recipes.length; k++)
                {
                    if(
                            currentSchematic.recipes[k].startsWith('/Game/FactoryGame/Buildable/-Shared/Customization/') === false
                         && currentSchematic.recipes[k] !== '/Game/FactoryGame/Schematics/ResourceSink/Patterns/CBG_PatternRemoval.CBG_PatternRemoval_C'
                    )
                    {
                        let currentRecipe = this.baseLayout.getRecipeFromClassName(currentSchematic.recipes[k]);
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
            }
            if(currentSchematic.schematics !== undefined)
            {
                for(let k = 0; k < currentSchematic.schematics.length; k++)
                {
                    if(
                            currentSchematic.schematics[k].startsWith('/Game/FactoryGame/Schematics/ResourceSink/Customizer_Background/') === false
                         && currentSchematic.schematics[k] !== '/Game/FactoryGame/Schematics/Progression/CustomizerUnlock_PipelineSwatch.CustomizerUnlock_PipelineSwatch_C'
                    )
                    {
                        let schematicId = currentSchematic.schematics[k].split('.');
                            schematicId = schematicId.pop();
                        if(this.baseLayout.schematicsData[schematicId] !== undefined)
                        {
                            unlocks.push(this.baseLayout.schematicsData[schematicId].name);
                        }
                        else
                        {
                            unlocks.push(currentSchematic.schematics[k]);
                        }
                    }
                }
            }
            if(currentSchematic.scannerPairs !== undefined)
            {
                for(let k = 0; k < currentSchematic.scannerPairs.length; k++)
                {
                    if(currentSchematic.scannerPairs[k] === '/Game/FactoryGame/Resource/RawResources/Geyser/Desc_Geyser.Desc_Geyser_C')
                    {
                        unlocks.push('Resource Scanner: Geyser');
                    }
                    else
                    {
                        let currentRecipe = this.baseLayout.getItemDataFromClassName(currentSchematic.scannerPairs[k]);
                            if(currentRecipe !== null)
                            {
                                unlocks.push('Resource Scanner: ' + currentRecipe.name);
                            }
                            else
                            {
                                unlocks.push('Resource Scanner: ' + currentSchematic.scannerPairs[k]);
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
                return '<br /><u>Unlocks:</u> <em>' + unlocks.join(', ') + '</em>';
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
                        if(mPurchasedSchematics === null)
                        {
                            schematicManager.properties.push({
                                name    : "mPurchasedSchematics",
                                type    : "ArrayProperty",
                                value   : {
                                    type    : "ObjectProperty",
                                    values  : [],
                                }
                            });
                            mPurchasedSchematics    = this.baseLayout.getObjectProperty(schematicManager, 'mPurchasedSchematics');
                        }
                        if(mPurchasedSchematics !== null)
                        {
                            for(let i = (mPurchasedSchematics.values.length - 1); i >= 0; i--)
                            {
                                if(purchasedAlternate.includes(mPurchasedSchematics.values[i].pathName) === false)
                                {
                                    purchasedAlternate.push(mPurchasedSchematics.values[i].pathName);

                                    let schematicId = mPurchasedSchematics.values[i].pathName.split('.').pop();
                                        if(
                                               this.baseLayout.schematicsData[schematicId] === undefined
                                            && [
                                                    'Research_HardDrive_0_C',
                                                    'Research_FlowerPetals_1_C', 'Research_FlowerPetals_2_C', 'Research_FlowerPetals_3_C',
                                                    'Research_Sulfur_4_2_1_C', 'Research_Sulfur_3_2_1_C', 'Research_Sulfur_2_C',
                                                    'Research_Quartz_3_C', 'Research_Quartz_3_3_C', 'Research_Quartz_3_2_C',
                                                    'Research_AOrgans_1_C', 'Research_AOrgans_0_C', 'Research_AOrganisms_1_C', 'Research_AOrgans_0_C', 'Research_AOrganisms_1_C', 'Research_ACarapace_2_1_C', 'Research_ACarapace_1_C', 'Research_ACarapace_0_C'
                                                ].includes(schematicId) === false
                                            && mPurchasedSchematics.values[i].pathName.startsWith('/Game/FactoryGame/Schematics/ResourceSink/Parts/') === false
                                            && mPurchasedSchematics.values[i].pathName.startsWith('/Game/FactoryGame/Schematics/ResourceSink/ResourceSink_Statue') === false
                                            && mPurchasedSchematics.values[i].pathName.startsWith('/Game/FactoryGame/Schematics/ResourceSink/Customizer_Background/') === false
                                            && mPurchasedSchematics.values[i].pathName !== '/Game/FactoryGame/Schematics/Progression/CustomizerUnlock_PipelineSwatch.CustomizerUnlock_PipelineSwatch_C'
                                            && mPurchasedSchematics.values[i].pathName !== '/Game/FactoryGame/Schematics/ResourceSink/Patterns/CBG_PatternRemoval.CBG_PatternRemoval_C'
                                            && mPurchasedSchematics.values[i].pathName.startsWith('/Game/FactoryGame/Events/Christmas/Buildings/TreeDecor/') === false
                                            && mPurchasedSchematics.values[i].pathName.startsWith('/Game/FactoryGame/Events/Christmas/Calendar_Schematics/Ficsmas_Schematic_SkinBundle_') === false
                                            && mPurchasedSchematics.values[i].pathName !== '/Game/FactoryGame/Events/Christmas/Calendar_Schematics/Ficsmas_Schematic_FingerGun_Emote.Ficsmas_Schematic_FingerGun_Emote_C'
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
                                else
                                {
                                    // Remove duplicates...
                                    mPurchasedSchematics.values.splice(i, 1);
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
            let currentSchematic    = this.baseLayout.schematicsData[schematicId];
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
                                        for(let j = (mAvailableSchematics.length - 1); j >= 0; j--)
                                        {
                                            if(mAvailableSchematics[j].pathName === currentSchematic.className)
                                            {
                                                mAvailableSchematics.splice(j, 1);
                                            }
                                        }
                                }

                                if(schematicManager.properties[i].name === 'mPurchasedSchematics')
                                {
                                    let mPurchasedSchematics = schematicManager.properties[i].value.values;
                                        for(let j = (mPurchasedSchematics.length - 1); j >= 0; j--)
                                        {
                                            if(mPurchasedSchematics[j].pathName === currentSchematic.className)
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
                                        for(let j = (mAvailableSchematics.length - 1); j >= 0; j--)
                                        {
                                            if(mAvailableSchematics[j].pathName === currentSchematic.className)
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
                                            if(mPurchasedSchematics[j].pathName === currentSchematic.className)
                                            {
                                                preventDuplicate = true;
                                                break;
                                            }
                                        }

                                        if(preventDuplicate === false)
                                        {
                                            mPurchasedSchematics.push({levelName: "", pathName: currentSchematic.className});
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
                                            if(mAvailableSchematics[j].pathName === currentSchematic.className)
                                            {
                                                preventDuplicate = true;
                                                break;
                                            }
                                        }

                                        if(preventDuplicate === false)
                                        {
                                            mAvailableSchematics.push({levelName: "", pathName: currentSchematic.className});
                                        }
                                }

                                if(schematicManager.properties[i].name === 'mPurchasedSchematics')
                                {
                                    let mPurchasedSchematics = schematicManager.properties[i].value.values;
                                        for(let j = (mPurchasedSchematics.length - 1); j >= 0; j--)
                                        {
                                            if(mPurchasedSchematics[j].pathName === currentSchematic.className)
                                            {
                                                mPurchasedSchematics.splice(j, 1);
                                            }
                                        }
                                }
                            }
                            break;
                    }

                    // Handle player slots
                    let mapPlayers = new Modal_Map_Players({baseLayout: this.baseLayout});
                        switch(currentStatus)
                        {
                            case 'none': // Go to available state
                            case 'purchased': // Go to none state
                                if(currentStatus !== 'none' && currentSchematic.equipmentSlots !== undefined)
                                {
                                    mapPlayers.removeEquipmentSlot(currentSchematic.equipmentSlots);
                                }
                                if(currentStatus !== 'none' && currentSchematic.slots !== undefined)
                                {
                                    mapPlayers.removeInventorySlot(currentSchematic.slots);
                                }
                                break;
                            case 'available': // Go to purchased state
                                if(currentSchematic.equipmentSlots !== undefined)
                                {
                                    mapPlayers.addEquipmentSlot(currentSchematic.equipmentSlots);
                                }
                                if(currentSchematic.slots !== undefined)
                                {
                                    mapPlayers.addInventorySlot(currentSchematic.slots);
                                }
                                break;
                        }

                    // Handle MAM tree unlocks
                    let researchManager = Building_MAM.getManager(this.baseLayout);
                        if(researchManager !== null)
                        {
                            let currentResearch = currentSchematic.className.split('.');
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

                    // Handle unlocked recipes
                    if(currentSchematic.recipes !== undefined)
                    {
                        let recipeManager = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.recipeManager');
                            if(recipeManager !== null)
                            {
                                let mAvailableRecipes               = this.baseLayout.getObjectProperty(recipeManager, 'mAvailableRecipes');
                                let mAvailableCustomizationRecipes  = this.baseLayout.getObjectProperty(recipeManager, 'mAvailableCustomizationRecipes');

                                    switch(currentStatus)
                                    {
                                        case 'purchased': // Go to none state
                                        case 'none': // Go to available state
                                            if(mAvailableRecipes !== null)
                                            {
                                                for(let j = (mAvailableRecipes.values.length - 1); j >= 0; j--)
                                                {
                                                    if(currentSchematic.recipes.includes(mAvailableRecipes.values[j].pathName))
                                                    {
                                                        mAvailableRecipes.values.splice(j, 1);
                                                    }
                                                }
                                            }
                                            if(mAvailableCustomizationRecipes !== null)
                                            {
                                                for(let j = (mAvailableCustomizationRecipes.values.length - 1); j >= 0; j--)
                                                {
                                                    if(currentSchematic.recipes.includes(mAvailableCustomizationRecipes.values[j].pathName))
                                                    {
                                                        mAvailableCustomizationRecipes.values.splice(j, 1);
                                                    }
                                                }
                                            }
                                            break;
                                        case 'available': // Go to purchased state
                                            // Let the game fills the proper recipes...
                                            break;
                                    }
                            }
                    }

                    // Handle emotes
                    if(currentSchematic.emotes !== undefined)
                    {
                        let unlockSubSystem = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.UnlockSubsystem');
                            if(unlockSubSystem !== null)
                            {
                                let mUnlockedEmotes  = this.baseLayout.getObjectProperty(unlockSubSystem, 'mUnlockedEmotes');

                                    switch(currentStatus)
                                    {
                                        case 'purchased': // Go to none state
                                        case 'none': // Go to available state
                                            if(mUnlockedEmotes !== null)
                                            {
                                                for(let j = (mUnlockedEmotes.values.length - 1); j >= 0; j--)
                                                {
                                                    if(currentSchematic.emotes.includes(mUnlockedEmotes.values[j].pathName))
                                                    {
                                                        mUnlockedEmotes.values.splice(j, 1);
                                                    }
                                                }
                                            }
                                            break;
                                        case 'available': // Go to purchased state
                                            // Let the game fills the proper recipes...
                                            break;
                                    }
                            }
                    }
                }
        }
    }
}
