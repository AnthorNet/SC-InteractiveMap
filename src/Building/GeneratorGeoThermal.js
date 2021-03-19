import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

import SubSystem_Circuit                        from '../SubSystem/Circuit.js';

export default class Building_GeneratorGeoThermal
{
    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content             = [];
        let circuitSubSystem    = new SubSystem_Circuit({baseLayout: baseLayout});
        let objectCircuit       = null;
        let powerConnection     = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.PowerConnection');
            if(powerConnection !== null)
            {
                objectCircuit = circuitSubSystem.getObjectCircuit(powerConnection);
            }

        // HEADER
        if(objectCircuit !== null)
        {
            content.push('<div style="position: absolute;width: 315px;text-align: center;margin-left: 166px;margin-top: 15px;' + BaseLayout_Tooltip.defaultTextStyle + '">' + buildingData.name + ' (Circuit #' + objectCircuit.circuitId + ')</div>');
        }
        else
        {
            content.push('<div style="position: absolute;width: 315px;text-align: center;margin-left: 166px;margin-top: 15px;' + BaseLayout_Tooltip.defaultTextStyle + '">' + buildingData.name + '</div>');
        }

        // STATE
        content.push('<div style="position: absolute;margin-top: 75px;margin-left: 21px;width: 110px;height: 115px;border-radius: 10px;color: #FFFFFF;padding-bottom: 10px;' + BaseLayout_Tooltip.uiGradient + '">');
            let powerInfo       = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.powerInfo');
            let mBaseProduction = baseLayout.getObjectProperty(powerInfo, 'mBaseProduction', 0);
                content.push('<div style="position: absolute;margin-top: 50px;margin-left: 30px;width: 50px;text-align: center;font-size: 25px;"><i class="fas fa-bolt"></i></div>');
                content.push('<div style="position: absolute;margin-top: 85px;margin-left: 5px;width: 100px;text-align: center;font-size: 15px;" class="text-warning"><strong>' + Math.round(mBaseProduction * 100) / 100 + ' MW</strong></div>');

            let minBaseProduction   = mBaseProduction;
            let maxBaseProduction   = mBaseProduction;

            let resourceNode     = baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
                if(resourceNode !== null)
                {
                    if(baseLayout.satisfactoryMap.collectableMarkers !== undefined && baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName] !== undefined)
                    {
                        if(baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity !== undefined)
                        {
                            if(buildingData !== null && buildingData.powerGenerated[baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity] !== undefined)
                            {
                                minBaseProduction   = buildingData.powerGenerated[baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity][0];
                                maxBaseProduction   = buildingData.powerGenerated[baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity][1];
                            }
                        }
                    }
                }

            content.push('<div style="position: absolute;margin-top: 35px;left: 0px;width: 40px;text-align: center;font-size: 10px;">' + minBaseProduction + '</div>');
            content.push('<div style="position: absolute;margin-top: 35px;right: 0px;width: 40px;text-align: center;font-size: 10px;">' + maxBaseProduction + '</div>');

            if(minBaseProduction < maxBaseProduction)
            {
                let percent = Math.max(0, (mBaseProduction - minBaseProduction)) / (maxBaseProduction - minBaseProduction) * 100;
                    content.push('<div style="position: absolute;margin-top: 15px;margin-left: 15px;width: 80px;">');
                    content.push('<div class="progress"><div class="progress-bar bg-warning" style="width: ' + percent + '%"></div></div>');
                    content.push('</div>');
            }

        content.push('</div>');


        // IMAGE
        if(buildingData.image !== undefined)
        {
            content.push('<div style="position: absolute;margin-top: 185px;margin-left: 175px;"><img src="' + buildingData.image + '" style="width: 96px;height: 96px;" /></div>');
        }

        // CIRCUIT
        content.push('<div style="position: absolute;margin-top: 40px;margin-left: 166px; width: 315px;height: 130px;color: #5b5b5b;text-shadow: none;' + BaseLayout_Tooltip.genericUIBackgroundStyle(baseLayout) + '">');
        if(objectCircuit !== null)
        {
            let circuitStatistics = circuitSubSystem.getStatistics(objectCircuit.circuitId);
                content.push(BaseLayout_Tooltip.setCircuitStatisticsGraph(baseLayout, circuitStatistics));
        }
        else
        {

        }
        content.push('</div>');

        // STAND BY
        content.push(BaseLayout_Tooltip.getStandByPanel(baseLayout, currentObject, 217, 415, 244, 345));

        return '<div style="width: 500px;height: 308px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_GeothermalBG.png?v=' + baseLayout.scriptVersion + ') no-repeat;margin: -7px;">' + content.join('') + '</div>';
    }
}