/* global Intl, gtag */
import SubSystem_Statistics                     from '../../SubSystem/Statistics.js';

export default class Modal_Statistics_Game
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.statisticsSubSystem    = new SubSystem_Statistics({baseLayout: this.baseLayout});

        if(typeof gtag === 'function')
        {
            gtag('event', 'Game', {event_category: 'Statistics'});
        }
    }

    parseConsumables()
    {
        let html        = [];
        let consumables = this.statisticsSubSystem.getConsumablesConsumedCount();
            if(consumables !== null)
            {
                let sorted = Object.keys(consumables).sort(function(a,b){ return consumables[b] - consumables[a]; });

                    html.push('<div class="row">');
                    for(let i = 0; i < sorted.length; i++)
                    {
                        let currentItem = this.baseLayout.getItemDataFromClassName(sorted[i]);
                            if(currentItem !== null)
                            {
                                let total       = consumables[sorted[i]];
                                    html.push('<div class="col-6 col-sm-4 col-md-3 col-lg-2 flex-column d-flex text-center mb-3">');
                                        html.push('<span class="badge badge-warning" style="position: absolute;right: 0.4em;font-size: 16px;">' + new Intl.NumberFormat(this.baseLayout.language).format(total) + '</span>');
                                        html.push('<img src="' + currentItem.image + '" class="img-fluid m-3">');
                                        html.push('<h6><strong>' + currentItem.name + '</strong>');
                                    html.push('</div>');
                            }
                    }
                    html.push('</div>');
            }
            else
            {
                html.push('<div class="text-center">No statistics found...</div>');
            }

        return html.join('');
    }

    parseCreatures()
    {
        let html        = [];
        let creatures   = this.statisticsSubSystem.getCreaturesKilledCount();
            if(creatures !== null)
            {
                let sorted = Object.keys(creatures).sort(function(a,b){ return creatures[b] - creatures[a]; });

                    html.push('<div class="row">');
                    for(let i = 0; i < sorted.length; i++)
                    {
                        let currentFauna = this.baseLayout.faunaSubsystem.getDataFromClassName(sorted[i]);
                            if(currentFauna !== null)
                            {
                                let total       = creatures[sorted[i]];
                                    html.push('<div class="col-6 col-sm-4 col-md-3 col-lg-2 flex-column d-flex text-center mb-3">');
                                        html.push('<span class="badge badge-warning" style="position: absolute;right: 0.4em;font-size: 16px;">' + new Intl.NumberFormat(this.baseLayout.language).format(total) + '</span>');
                                        html.push('<img src="' + currentFauna.image + '" class="img-fluid m-3">');
                                        html.push('<h6><strong>' + currentFauna.name + '</strong>');
                                    html.push('</div>');
                            }
                    }
                    html.push('</div>');
            }
            else
            {
                html.push('<div class="text-center">No statistics found...</div>');
            }

        return html.join('');
    }

    parseCrafting()
    {
        let html        = [];
        let crafting    = this.statisticsSubSystem.getItemsManuallyCraftedCount();
            if(crafting !== null)
            {
                let sorted = Object.keys(crafting).sort(function(a,b){ return crafting[b] - crafting[a]; });

                    html.push('<div class="row">');
                    for(let i = 0; i < sorted.length; i++)
                    {
                        let currentItem = this.baseLayout.getItemDataFromClassName(sorted[i]);
                            if(currentItem !== null)
                            {
                                let total       = crafting[sorted[i]];
                                    html.push('<div class="col-6 col-sm-4 col-md-3 col-lg-2 flex-column d-flex text-center mb-3">');
                                        html.push('<span class="badge badge-warning" style="position: absolute;right: 0.4em;font-size: 16px;">' + new Intl.NumberFormat(this.baseLayout.language).format(total) + '</span>');
                                        html.push('<img src="' + currentItem.image + '" class="img-fluid m-3">');
                                        html.push('<h6><strong>' + currentItem.name + '</strong>');
                                    html.push('</div>');
                            }
                    }
                    html.push('</div>');
            }
            else
            {
                html.push('<div class="text-center">No statistics found...</div>');
            }

        return html.join('');
    }

    parseBuilt()
    {
        let html        = [];
        let built       = this.statisticsSubSystem.getActorsBuiltCount();
            if(built !== null)
            {
                let sorted = Object.keys(built).sort(function(a,b){ return built[b].Total - built[a].Total; });

                    html.push('<div class="row">');
                    for(let i = 0; i < sorted.length; i++)
                    {
                        let currentBuilding = this.baseLayout.getBuildingDataFromClassName(sorted[i]);
                            if(currentBuilding !== null)
                            {
                                html.push('<div class="col-6 col-sm-4 col-md-3 col-lg-2 flex-column d-flex text-center mb-3">');
                                    html.push('<span class="badge badge-warning" style="position: absolute;right: 0.4em;font-size: 16px;">' + new Intl.NumberFormat(this.baseLayout.language).format(built[sorted[i]].Total) + '</span>');
                                    html.push('<img src="' + currentBuilding.image + '" class="img-fluid m-3">');
                                    html.push('<h6><strong>' + currentBuilding.name + '</strong><br /><small><em class="text-muted">Dismantled: ' +  new Intl.NumberFormat(this.baseLayout.language).format(built[sorted[i]].TotalDismantled) + '</em></small></h6>');
                                html.push('</div>');
                            }
                    }
                    html.push('</div>');
            }
            else
            {
                html.push('<div class="text-center">No statistics found...</div>');
            }

        return html.join('');
    }

    parsePartsUsed()
    {
        let html        = [];
        let built       = this.statisticsSubSystem.getActorsBuiltCount();
            if(built !== null)
            {
                // Loop built and create a new parts consumed from the recipes...
                let used = {};
                    for(let className in built)
                    {
                        let currentRecipe = this.baseLayout.getRecipeDataFromProducedClassName(className);
                            if(currentRecipe !== null)
                            {
                                if(currentRecipe.ingredients !== undefined)
                                {
                                    for(let ingredientClassName in currentRecipe.ingredients)
                                    {
                                        if(used[ingredientClassName] === undefined)
                                        {
                                            used[ingredientClassName] = 0;
                                        }

                                        used[ingredientClassName] += currentRecipe.ingredients[ingredientClassName] * built[className].Total;
                                    }
                                }
                            }
                    }

                let sorted = Object.keys(used).sort(function(a,b){ return used[b] - used[a]; });

                    html.push('<div class="row">');
                    for(let i = 0; i < sorted.length; i++)
                    {
                        let currentItem = this.baseLayout.getItemDataFromClassName(sorted[i]);
                            if(currentItem !== null)
                            {
                                html.push('<div class="col-6 col-sm-4 col-md-3 col-lg-2 flex-column d-flex text-center mb-3">');
                                    html.push('<span class="badge badge-warning" style="position: absolute;right: 0.4em;font-size: 16px;">' + new Intl.NumberFormat(this.baseLayout.language).format(used[sorted[i]]) + '</span>');
                                    html.push('<img src="' + currentItem.image + '" class="img-fluid m-3">');
                                    html.push('<h6><strong>' + currentItem.name + '</strong></h6>');
                                html.push('</div>');
                            }
                    }
                    html.push('</div>');
            }
            else
            {
                html.push('<div class="text-center">No statistics found...</div>');
            }

        return html.join('');
    }
}