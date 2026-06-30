import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import Modal_Node_SpawnAround                   from '../Modal/Node/SpawnAround.js';

export default class Building_ResourceNode
{
    /*
     * ADD
     */
    static add(baseLayout, currentObject, updateRadioactivityLayer = false)
    {
        if(baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName] !== undefined)
        {
            baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options.pathName = currentObject.pathName;
            baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].bindContextMenu(baseLayout);

            if(baseLayout.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName] !== undefined && baseLayout.useRadioactivity === true)
            {
                delete baseLayout.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName];
                baseLayout.radioactivityLayerNeedsUpdate = true;

                if(updateRadioactivityLayer === true)
                {
                    baseLayout.updateRadioactivityLayer();
                }
            }

            let mResourceClassOverride  = baseLayout.getObjectProperty(currentObject, 'mResourceClassOverride');
            let mPurityOverride         = baseLayout.getObjectProperty(currentObject, 'mPurityOverride');
                if(mResourceClassOverride !== null || mPurityOverride !== null)
                {
                    let markerOptions           = JSON.parse(JSON.stringify(baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options));
                    let customType              = markerOptions.type;

                        markerOptions.lastCheck = baseLayout.saveGameParser.header.buildVersion;
                        baseLayout.satisfactoryMap.availableLayers[markerOptions.layerId].removeLayer(baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName]);

                    let oldButton       = $('.updateLayerState[data-type="' + markerOptions.type + '"][data-purity="' + markerOptions.purity + '"]');
                        oldButton.attr('data-total', parseInt(oldButton.attr('data-total')) - 1);
                        oldButton.find('.badge').html(new Intl.NumberFormat(baseLayout.language).format(parseInt(oldButton.attr('data-total'))));

                        //if()

                    if(mResourceClassOverride !== null)
                    {
                        let newmResourceClassOverride   = mResourceClassOverride.pathName.split('.');
                            customType                  = newmResourceClassOverride.pop();
                            if(currentObject.className === '/Game/FactoryGame/Resource/BP_FrackingSatellite.BP_FrackingSatellite_C' && customType === 'Desc_LiquidOil_C')
                            {
                                customType  = 'Desc_LiquidOilWell_C';
                            }

                            markerOptions.type          = customType;
                    }

                    if(mPurityOverride !== null)
                    {
                        markerOptions.purity    = mPurityOverride.valueName;
                    }

                    if(baseLayout.satisfactoryMap.mapColors[customType] !== undefined && baseLayout.satisfactoryMap.mapColors[customType][markerOptions.purity] !== undefined)
                    {
                        markerOptions.layerId   = baseLayout.satisfactoryMap.mapColors[customType][markerOptions.purity].layerId;
                        markerOptions.name      = baseLayout.satisfactoryMap.mapColors[customType][markerOptions.purity].name;
                        markerOptions.color     = baseLayout.satisfactoryMap.mapColors[customType][markerOptions.purity].outsideColor;
                        markerOptions.fillColor = baseLayout.satisfactoryMap.mapColors[customType][markerOptions.purity].insideColor;
                        markerOptions.icon      = baseLayout.satisfactoryMap.mapColors[customType][markerOptions.purity].icon;
                    }

                    let newButton       = $('.updateLayerState[data-type="' + customType + '"][data-purity="' + markerOptions.purity + '"]');
                        newButton.attr('data-total', parseInt(newButton.attr('data-total')) + 1);
                        newButton.find('.badge').html(new Intl.NumberFormat(baseLayout.language).format(parseInt(newButton.attr('data-total'))));

                    let newMarker       = L.mapMarker(baseLayout.satisfactoryMap.unproject([markerOptions.x, markerOptions.y]), markerOptions);
                        newMarker.on('mouseover', (e) => { baseLayout.satisfactoryMap.showTooltip(e); })
                                 .on('mouseout', (e) => { baseLayout.satisfactoryMap.closeTooltip(e); })
                                 .addTo(baseLayout.satisfactoryMap.availableLayers[markerOptions.layerId]);

                    baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName] = newMarker;
                    baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].bindContextMenu(baseLayout);
                }

            if(baseLayout.useRadioactivity === true && baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options.type === 'Desc_OreUranium_C')
            {
                let currentItemData = baseLayout.getItemDataFromClassName('Desc_OreUranium_C', false);
                    if(currentItemData !== null)
                    {
                        if(currentItemData.radioactiveDecay !== undefined)
                        {
                            baseLayout.addRadioactivityDot(currentObject, [{
                                qty                 : 96,
                                radioactiveDecay    : currentItemData.radioactiveDecay
                            }]);

                            if(updateRadioactivityLayer === true)
                            {
                                baseLayout.updateRadioactivityLayer();
                            }
                        }
                    }
            }
        }
    }

    static addModded(baseLayout, currentObject)
    {
        if(baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName] === undefined)
        {
            $('#mods_resource_nodes').show();

            let nodeType    = currentObject.className.split('.').pop();
            let nodePurity  = 'RP_Inpure';
            let mNodePurity = baseLayout.getObjectProperty(currentObject, 'mNodePurity');
                if(mNodePurity !== null)
                {
                    nodePurity = mNodePurity.valueName;
                }
            let layerId     = nodeType + '_' + nodePurity.charAt(0).toUpperCase() + nodePurity.slice(1);
                if(baseLayout.satisfactoryMap.availableLayers[layerId] === undefined)
                {
                    baseLayout.satisfactoryMap.availableLayers[layerId] = L.layerGroup();
                }

            let button      = $('.updateLayerState[data-type="' + nodeType + '"][data-purity="' + nodePurity + '"]');
                button.attr('data-total', parseInt(button.attr('data-total')) + 1);
                button.find('.badge').html(new Intl.NumberFormat(baseLayout.language).format(parseInt(button.attr('data-total'))));
                button.parent().parent().parent().show();

            let currentMarkerOptions    = {
                    pathName    : currentObject.pathName,
                    color       : button.attr('data-outside'),
                    fillColor   : button.attr('data-inside'),
                    icon        : button.attr('data-image')
                };
            let tooltip                 = '<div class="d-flex" style="border: 25px solid #7f7f7f;border-image: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/genericTooltipBackground.png) 25 repeat;background: #7f7f7f;margin: -7px;color: #FFFFFF;text-shadow: 1px 1px 1px #000000;line-height: 16px;font-size: 12px;">\
                                            <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                                                ' + ((button.attr('data-original-title') !== undefined) ? button.attr('data-original-title') : button.attr('title')) + '\
                                            </div>\
                                        </div>';
            let currentMarker           = L.mapMarker(baseLayout.satisfactoryMap.unproject(currentObject.transform.translation), currentMarkerOptions)
                                            .bindTooltip(tooltip)
                                            .addTo(baseLayout.satisfactoryMap.availableLayers[layerId]);

                baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName]                     = currentMarker;
                baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId     = layerId;
                baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options.pathName    = currentObject.pathName;
                baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options.purity      = nodePurity;
        }

        baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].bindContextMenu(baseLayout);
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-portal-exit',
            text        : 'Teleport player',
            callback    : baseLayout.teleportPlayer
        });

        if(baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName] !== undefined)
        {
            if(currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C')
            {
                contextMenu.push('-');
                contextMenu.push({
                    text    : ((baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options.type === 'Desc_LiquidOil_C') ? 'Spawn an Oil Extractor' : 'Spawn a Miner'),
                    callback: Modal_Node_SpawnAround.getHTML
                });
            }
            if(currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C')
            {
                contextMenu.push('-');
                contextMenu.push({
                    text    : 'Spawn a Geothermal Generator',
                    callback: Modal_Node_SpawnAround.getHTML
                });
            }
        }

        if(baseLayout.saveGameParser.header.saveVersion >= 58)
        {
            contextMenu.push('-');

            if(currentObject.className !== '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C')
            {
                contextMenu.push({
                    text    : 'Update resource type',
                    callback: Building_ResourceNode.updateResource
                });
            }

            contextMenu.push({
                text    : 'Update resource purity',
                callback: Building_ResourceNode.updatePurity
            });
        }

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateResource(marker)
    {
        let baseLayout              = marker.baseLayout;
        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mResourceClassOverride  = baseLayout.getObjectProperty(currentObject, 'mResourceClassOverride');
            if(mResourceClassOverride === null)
            {
                let itemType = baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options.type;
                    if(itemType === 'Desc_LiquidOilWell_C')
                    {
                        itemType = 'Desc_LiquidOil_C';
                    }
                mResourceClassOverride = { levelName: '', pathName: baseLayout.itemsData[itemType].className};
            }

        let availableResources = [];
            for(let itemId in baseLayout.itemsData)
            {
                if(
                        itemId === 'Desc_LiquidOil_C'
                     || (baseLayout.itemsData[itemId].category === 'ore' && currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C')
                     || ((itemId === 'Desc_Water_C' || itemId === 'Desc_NitrogenGas_C') && currentObject.className === '/Game/FactoryGame/Resource/BP_FrackingSatellite.BP_FrackingSatellite_C')
                )
                {
                    availableResources.push({
                        dataContent : '<img src="' + baseLayout.itemsData[itemId].image + '" style="width: 24px;" class="mr-1" />  ' + baseLayout.itemsData[itemId].name,
                        value       : baseLayout.itemsData[itemId].className,
                        text        : baseLayout.itemsData[itemId].name
                    });
                }
            }

            BaseLayout_Modal.form({
                title       : 'Update resource type',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mResourceClassOverride',
                    inputType   : 'selectPicker',
                    inputOptions: availableResources,
                    value       : mResourceClassOverride.pathName
                }],
                callback    : function(values)
                {
                    baseLayout.deleteObjectProperty(currentObject, 'mResourceClassOverride');
                    currentObject.properties.push({
                        name    : 'mResourceClassOverride',
                        type    : 'Object',
                        value   : {levelName: '', pathName: values.mResourceClassOverride}
                    });

                    return Building_ResourceNode.add(baseLayout, currentObject, true);
                }
            });
    }

    static updatePurity(marker)
    {
        let baseLayout              = marker.baseLayout;
        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mPurityOverride         = baseLayout.getObjectProperty(currentObject, 'mPurityOverride');
            if(mPurityOverride === null)
            {
                mPurityOverride = { valueName: baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options.purity};
            }

        BaseLayout_Modal.form({
            title       : 'Update resource purity',
            container   : '#leafletMap',
            inputs      : [{
                name        : 'mPurityOverride',
                inputType   : 'selectPicker',
                inputOptions: [
                    { value: 'RP_Inpure', text: 'Impure' },
                    { value: 'RP_Normal', text: 'Normal' },
                    { value: 'RP_Pure', text: 'Pure' }
                ],
                value       : mPurityOverride.valueName
            }],
            callback    : function(values)
            {
                baseLayout.deleteObjectProperty(currentObject, 'mPurityOverride');
                currentObject.properties.push({
                    name    : 'mPurityOverride',
                    type    : 'Byte',
                    value   : {
                        enumName        : 'EResourcePurity',
                        enumPackageName : { packageName: '/Script/FactoryGame' },
                        valueName       : values.mPurityOverride
                    }
                });

                return Building_ResourceNode.add(baseLayout, currentObject);
            }
        });
    }

    /**
     * TOOLTIP
     */
    static getExtractionTable(options)
    {
        let tooltip         = [];
        let purityModifier  = 1;
            if(options.purity === 'RP_Inpure')
            {
                purityModifier = 0.5;
            }
            if(options.purity === 'RP_Pure')
            {
                purityModifier = 2;
            }

        tooltip.push('<table class="table table-bordered table-sm mt-3 mb-0 border-0"><thead><tr><th class="border-top-0 border-left-0"></th><th>50%</th><th>100%</th><th>150%</th><th>200%</th><th>250%</th></tr></thead><tbody>');
        if(['Desc_LiquidOil_C', 'Desc_LiquidOilWell_C', 'Desc_Water_C', 'Desc_NitrogenGas_C'].includes(options.type))
        {
            let defaultSpeed    = 120;
            let buildingName    = 'Oil Extractor';

                if(['Desc_Water_C', 'Desc_NitrogenGas_C', 'Desc_LiquidOilWell_C'].includes(options.type))
                {
                    defaultSpeed    = 60;
                    buildingName    = 'Resource Well Extractor';
                }

            tooltip.push('<tr>');
            tooltip.push('<td>' + buildingName + '</td>');

            for(let clockSpeed = 50; clockSpeed <= 250; clockSpeed += 50)
            {
                tooltip.push('<td>' + new Intl.NumberFormat(this.language).format(Math.round(purityModifier * defaultSpeed * (clockSpeed / 100))) + 'm³ / min</td>');
            }

            tooltip.push('</tr>');
        }
        else
        {
            for(let mk = 1; mk <= 3; mk++)
            {
                let defaultSpeed = mk * 60;
                    if(mk === 3)
                    {
                        defaultSpeed = 240;
                    }

                tooltip.push('<tr>');
                tooltip.push('<td>Miner Mk' + mk + '</td>');

                for(let clockSpeed = 50; clockSpeed <= 250; clockSpeed += 50)
                {
                    tooltip.push('<td>' + new Intl.NumberFormat(this.language).format(Math.round(purityModifier * defaultSpeed * (clockSpeed / 100))) + ' / min</td>');
                }

                tooltip.push('</tr>');
            }
        }
        tooltip.push('</tbody></table>');

        return tooltip.join('');
    }
}