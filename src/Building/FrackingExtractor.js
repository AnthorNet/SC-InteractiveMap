/* global Intl */
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_FrackingExtractor
{
    static getSmasher(baseLayout, currentObject)
    {
        let mExtractableResource = baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
            if(mExtractableResource !== null)
            {
                if(baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName] !== undefined && baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName].options.core !== undefined)
                {
                    if(baseLayout.frackingSmasherCores[baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName].options.core] !== undefined)
                    {
                        return baseLayout.saveGameParser.getTargetObject(baseLayout.frackingSmasherCores[baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName].options.core]);
                    }
                }
            }

        return null;
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let extractResourceNode     = baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
        let itemType                = null;
        let purity                  = 'normal';

            if(extractResourceNode !== null && baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
            {
                if(baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity !== undefined)
                {
                    purity = baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity;
                }

                if(baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type !== undefined)
                {
                    itemType = baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type;
                    if(itemType === 'Desc_LiquidOilWell_C')
                    {
                        itemType = 'Desc_LiquidOil_C';
                    }
                }
            }

        let craftingTime        = 60 / buildingData.extractionRate[purity];
        let clockSpeed          = baseLayout.overclockingSubSystem.getClockSpeed(currentObject);
        let productionRatio     = buildingData.extractionRate[purity] * clockSpeed;

        // VOLUME
        let currentFluid        = 0;
        let maxFluid            = (buildingData.maxFluid !== undefined) ? buildingData.maxFluid : 50000;
        let inventoryOut        = baseLayout.getObjectInventory(currentObject, 'mOutputInventory');

            for(let i = 0; i < inventoryOut.length; i++)
            {
                if(inventoryOut[i] !== null && baseLayout.itemsData[itemType] !== undefined && inventoryOut[i].className === baseLayout.itemsData[itemType].className)
                {
                    currentFluid = inventoryOut[i].qty;
                    break;
                }
            }

            currentFluid        = Math.min(currentFluid, maxFluid);
            currentFluid        = +(Math.round((currentFluid / 1000) * 100) / 100);
            maxFluid            = +(Math.round((maxFluid / 1000) * 100) / 100);

        let content     = [];

            // TOP
            content.push('<div style="position: absolute;margin-top: 6px;margin-left: 8px; width: 155px;height: 110px;border-radius: 10px;color: #FFFFFF;padding-bottom: 10px;' + BaseLayout_Tooltip.uiGradient + '">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
                content.push('<strong class="small">' + buildingData.name + '</strong>');

                let currentProgress = Math.min(100, Math.round(baseLayout.getObjectProperty(currentObject, 'mCurrentExtractProgress', 0) * 10000) / 100);
                    content.push('<div class="progress rounded-sm mx-3 mt-2" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + currentProgress + '%"></div></div>');
                    content.push('<span style="font-size: 10px;" class="d-block mb-2">Extracting - <span class="text-warning">' + currentProgress + '%</span></span>');

            content.push(BaseLayout_Tooltip.setTooltipFooter({baseLayout: baseLayout, craftingTime: craftingTime, clockSpeed: clockSpeed, singleLine: true}));
            content.push('</div></div>');
            content.push('</div>');

            // BOTTOM
            content.push('<div style="position: absolute;margin-top: 130px;margin-left: 8px; width: 155px;height: 90px;background: #FFFFFF;border: 2px solid #373737;border-radius: 10px;line-height: 1;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

                if(extractResourceNode !== null && itemType !== null)
                {
                    content.push('<div class="text-center"><table class="mx-auto mb-2"><tr><td><div class="d-flex flex-row" style="position:relative;margin: 1px;width: 36px;height: 36px;border: 1px solid #000000;border-radius:50%;padding: 5px;background-color: #FFFFFF;"><img src="' + baseLayout.itemsData[itemType].image + '" class="img-fluid" /></div></td></tr></table></div>');
                    content.push('<div><strong>' + baseLayout.itemsData[itemType].name + '</strong></div>');
                    content.push('<span class="small"><strong class="text-warning">' + +(Math.round((productionRatio / 1000) * 100) / 100) + 'm³</strong> per minute</span>');
                }

            content.push('</div></div>');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: 111px;margin-left: 75px; width: 24px;height: 24px;color: #FFFFFF;background: #404040;border-radius: 50%;line-height: 24px;text-align: center;font-size: 14px;box-shadow: 0 0 2px 0px rgba(0,0,0,0.75);"><i class="fas fa-arrow-alt-down"></i></div>');

        // DOME
        if(extractResourceNode !== null && itemType !== null && baseLayout.itemsData[itemType].color !== undefined)
        {
            content.push('<div style="position: absolute;margin-top: 9px;margin-left: 358px;">');
                if(baseLayout.itemsData[itemType].category === 'gas')
                {
                    content.push(BaseLayout_Tooltip.setGasDome(baseLayout, 112, currentFluid, maxFluid, baseLayout.itemsData[itemType].color));
                }
                else
                {
                    content.push(BaseLayout_Tooltip.setLiquidDome(baseLayout, 112, currentFluid, maxFluid, baseLayout.itemsData[itemType].color));
                }
            content.push('</div>');
        }

        // AMOUNT
        content.push('<div style="position: absolute;margin-top: 140px;margin-left: 365px;width: 104px;color: #FFFFFF;text-align: center;font-size: 13px;">');
        content.push('<span class="small">Current amount:</span><br /><strong><strong class="text-info">' + currentFluid + '</strong> / ' + maxFluid + ' m³</strong>');
        content.push('</div>');

        if(buildingData.maxFlowRate !== undefined)
        {
            content.push('<div style="position: absolute;margin-top: 135px;margin-left: 218px;width: 65px;text-align: center;font-size: 11px;color: #5b5b5b;">');
            content.push('<span class="small">Flow Rate</span><br /><i class="fas fa-chevron-right"></i><br /><strong><strong class="text-info">???</strong> m³/min</strong>');
            content.push('</div>');
            content.push('<div style="position: absolute;margin-top: 135px;margin-left: 280px;width: 65px;text-align: center;font-size: 11px;color: #5b5b5b;border-left: 1px solid #5b5b5b;">');
            content.push('<span class="small">Max Flow Rate</span><br /><i class="fas fa-chevron-double-right"></i><br /><strong><strong class="text-info">' + buildingData.maxFlowRate / 1000 + '</strong> m³/min</strong>');
            content.push('</div>');
        }

        // Flow indicator
        content.push('<div style="position: absolute;margin-top: 13px;margin-left: 231px;width: 102px;height: 102px;"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/flowIndicator.png?v=' + baseLayout.scriptVersion + '" style="width: 102px;height: 102px;transform: rotate(-135deg);" /></div>');
        content.push('<div style="position: absolute;margin-top: 13px;margin-left: 231px;width: 102px;height: 102px;"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/flowGlass.png?v=' + baseLayout.scriptVersion + '" style="width: 102px;height: 102px;" /></div>');

        return '<div style="width: 500px;height: 235px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/Fracker_Extractor_BG.png?v=' + baseLayout.scriptVersion + ');margin: -7px;">' + content.join('') + '</div>';
    }
}