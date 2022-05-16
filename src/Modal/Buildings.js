/* global gtag, Intl */
import SubSystem_Circuit                        from '../SubSystem/Circuit.js';

export default class Modal_Buildings
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
                    'playerPillarsLayer', 'playerWalkwaysLayer', 'playerUnknownLayer', 'playerOrientationLayer',
                    'playerStatuesLayer', 'playerHUBTerminalLayer', 'playerLightsLayer'
                ].includes(layerId))
                {
                    continue;
                }

                let layerLength = this.baseLayout.playerLayers[layerId].elements.length;
                    if(layerLength > 0)
                    {
                        for(let i = 0; i < layerLength; i++)
                        {
                            if(this.baseLayout.playerLayers[layerId].elements[i].options.pathName !== undefined)
                            {
                                this.markers.push(this.baseLayout.playerLayers[layerId].elements[i]);
                            }
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
            gtag('event', 'Buildings', {event_category: 'Modal'});
        }
    }

    parse()
    {
        // Build categories holders...
        let buildingsTabs   = $('#buildingsModal .tab-content > div');
        let buildingsList   = {};
            buildingsTabs.each(function(){
                let currentCategory = $(this).attr('data-category');

                    if(currentCategory !== undefined)
                    {
                        buildingsList[currentCategory] = {id: $(this).attr('id'), buildings: {}};
                    }
                    else
                    {
                        let currentClassName = $(this).attr('data-classname');
                            if(currentClassName !== undefined)
                            {
                                buildingsList[currentClassName] = {id: $(this).attr('id'), buildings: {}};
                            }
                    }
            });
            for(let currentCategory in buildingsList)
            {
                for(let i in this.baseLayout.buildingsData)
                {
                    if(this.baseLayout.buildingsData[i].category === currentCategory && this.baseLayout.buildingsData[i].className !== undefined)
                    {
                        buildingsList[currentCategory].buildings[this.baseLayout.buildingsData[i].className] = [];
                    }
                    if(this.baseLayout.buildingsData[i].className !== undefined && this.baseLayout.buildingsData[i].className === currentCategory)
                    {
                        buildingsList[currentCategory].buildings[this.baseLayout.buildingsData[i].className] = [];
                    }
                }
            }

        let markersLength = this.markers.length;
            for(let i = 0; i < markersLength; i++)
            {
                let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);
                    if(currentObject !== null)
                    {
                        for(let currentCategory in buildingsList)
                        {
                            for(let className in buildingsList[currentCategory].buildings)
                            {
                                if(className === currentObject.className)
                                {
                                    buildingsList[currentCategory].buildings[className].push(currentObject);
                                    break;
                                }
                            }
                        }
                    }
            }

        for(let currentCategory in buildingsList)
        {
            let html    = [];
            let htmlTab = [];

            html.push('<table class="table"><tr>');
            htmlTab.push('<div class="tab-content">');
            for(let className in buildingsList[currentCategory].buildings)
            {
                if(buildingsList[currentCategory].buildings[className].length > 0)
                {
                    let buildingData = this.baseLayout.getBuildingDataFromClassName(className);
                        if(buildingData !== null)
                        {
                            html.push('<td class="border-top-0 text-center">');
                                html.push('<button class="btn btn-active" style="position: relative;">');
                                html.push('<span class="badge badge-warning" style="position: absolute;right: -4px;top: -4px;font-size: 100%;">' + new Intl.NumberFormat(this.baseLayout.language).format(buildingsList[currentCategory].buildings[className].length) + '</span>');
                                html.push('<img src="' + buildingData.image + '" class="img-fluid" style="width: 64px;" /><br />');
                                html.push('<strong>' + buildingData.name + '</strong>');
                                html.push('</button>');
                            html.push('</td>');
                        }

                    htmlTab.push('<div class="tab-pane fade">');
                    htmlTab.push('<table class="table">');
                    htmlTab.push('<thead><th></th><th></th><th></th><th></th><th class="text-center">Clock speed</th><th></th><th></th></thead>');
                    htmlTab.push('<tbody>');

                    let htmlRows = [];
                    for(let i = 0; i < buildingsList[currentCategory].buildings[className].length; i++)
                    {
                        let htmlRow         = [];
                        let currentObject   = buildingsList[currentCategory].buildings[className][i];

                            htmlRow.push('<tr>');
                            if(this.baseLayout.getBuildingIsOn(currentObject) === false)
                            {
                                htmlRow.push('<td width="1"><i class="fas fa-power-off text-danger"></i></td>');
                            }
                            else
                            {
                                htmlRow.push('<td width="1"><i class="fas fa-power-off text-success"></i></td>');
                            }
                            if(this.baseLayout.getBuildingIsPowered(currentObject) === false)
                            {
                                htmlRow.push('<td width="1"><i class="fas fa-plug text-danger"></i></td>');
                            }
                            else
                            {
                                htmlRow.push('<td width="1"><i class="fas fa-plug text-success"></i></td>');
                            }

                            htmlRow.push('<td>#' + (i + 1) + '</td>');

                            htmlRow.push('<td>');

                            switch(currentCategory)
                            {
                                case 'extraction':
                                    let extractResourceNode     = this.baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
                                    let itemType                = null;
                                    let purity                  = 'normal';

                                        if(extractResourceNode !== null && this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
                                        {
                                            if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity !== undefined)
                                            {
                                                purity      = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity;
                                            }
                                            if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type !== undefined)
                                            {
                                                itemType    = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type;
                                                if(itemType === 'Desc_LiquidOilWell_C')
                                                {
                                                    itemType = 'Desc_LiquidOil_C';
                                                }
                                            }
                                        }

                                        if(itemType !== null)
                                        {
                                            if(this.baseLayout.itemsData[itemType] === undefined)
                                            {
                                                console.log(itemType, this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options);
                                            }

                                            htmlRow.push('<strong>' + this.baseLayout.itemsData[itemType].name + ' (' + (purity && purity[0].toUpperCase() + purity.slice(1)) + ')</strong><br />');
                                        }
                                    break;
                                default:
                                    let recipe              = this.baseLayout.getObjectProperty(currentObject, 'mCurrentRecipe');
                                        if(recipe !== null)
                                        {
                                            // Extract recipe name
                                            let recipeName = recipe.pathName.split('.')[1];
                                                if(this.baseLayout.recipesData[recipeName] !== undefined)
                                                {
                                                    htmlRow.push('<strong>' + this.baseLayout.recipesData[recipeName].name + '</strong><br />');
                                                }
                                                else
                                                {
                                                    for(let recipeId in this.baseLayout.recipesData)
                                                    {
                                                        if(this.baseLayout.recipesData[recipeId].className !== undefined && this.baseLayout.recipesData[recipeId].className === recipe.pathName)
                                                        {
                                                            htmlRow.push('<strong>' + this.baseLayout.recipesData[recipeName].name + '</strong><br />');
                                                            break;
                                                        }
                                                    }
                                                }
                                        }
                                    break;
                            }

                                let mBuildTimeStamp = this.baseLayout.getObjectProperty(currentObject, 'mBuildTimeStamp');
                                    if(mBuildTimeStamp !== null)
                                    {
                                        htmlRow.push('<small><em>Built ' + new Date(1000 * -mBuildTimeStamp).toISOString().substr(11, 8) + ' ago</em></small>');
                                    }
                            htmlRow.push('</td>');

                            let clockSpeed      = this.baseLayout.getClockSpeed(currentObject);
                                htmlRow.push('<td class="text-center">' + Math.round(clockSpeed * 1000) / 10 + '%</td>');

                            let circuitSubSystem    = new SubSystem_Circuit({baseLayout: this.baseLayout});
                            let objectCircuit       = circuitSubSystem.getObjectCircuit(currentObject);
                                if(objectCircuit !== null)
                                {
                                    htmlRow.push('<td class="text-center">#' + objectCircuit.circuitId + '</td>');
                                }
                                else
                                {
                                    htmlRow.push('<td></td>');
                                }

                            htmlRow.push('<td class="text-right"><i class="fas fa-search-location" style="cursor: pointer;font-size: 24px;" data-x="' + currentObject.transform.translation[0] + '" data-y="' + currentObject.transform.translation[1] + '"></i></td>');
                            htmlRow.push('</tr>');

                            htmlRows.push(htmlRow.join(''));
                    }
                    htmlTab.push(htmlRows.join(''));
                    htmlTab.push('</tbody></table>');
                    htmlTab.push('</div>');
                }
            }
            htmlTab.push('</div>');
            html.push('</tr></table>');
            html.push(htmlTab.join(''));

            $('#' + buildingsList[currentCategory].id).html(html.join(''));
            $('#' + buildingsList[currentCategory].id + ' button:eq(0)').addClass('btn-outline-warning focus');
            $('#' + buildingsList[currentCategory].id + ' .tab-content > .tab-pane:eq(0)').addClass('show active');

            $('#' + buildingsList[currentCategory].id + ' button').click(function(){
                $('#' + buildingsList[currentCategory].id + ' button').removeClass('btn-outline-warning focus');
                $(this).addClass('btn-outline-warning focus');

                $('#' + buildingsList[currentCategory].id + ' .tab-content > .tab-pane').removeClass('show active');
                $('#' + buildingsList[currentCategory].id + ' .tab-content > .tab-pane:eq(' + $('#' + buildingsList[currentCategory].id + ' button').index(this) + ')').addClass('show active');
            });

            $('#' + buildingsList[currentCategory].id + ' .fa-search-location').on('click', (e) => {
                let x = parseFloat($(e.currentTarget).attr('data-x'));
                let y = parseFloat($(e.currentTarget).attr('data-y'));

                let position    = this.baseLayout.satisfactoryMap.unproject([x, y]);
                    this.baseLayout.satisfactoryMap.leafletMap.setView(position, 9);
            });
        }
    }
}