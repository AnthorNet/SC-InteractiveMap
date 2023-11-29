/* global Intl */
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_FrackingSmasher
{
    static getSatellites(baseLayout, currentObject)
    {
        let currentObjectSatellites = [];
        let extractedCore           = baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
            if(extractedCore !== null)
            {
                for(let pathName in baseLayout.satisfactoryMap.collectableMarkers)
                {
                    if(pathName.startsWith('Persistent_Exploration_2:PersistentLevel.BP_FrackingSatellite') === true || pathName.startsWith('Persistent_Level:PersistentLevel.BP_FrackingSatellite') === true)
                    {
                        if(baseLayout.satisfactoryMap.collectableMarkers[pathName].options.core !== undefined && baseLayout.satisfactoryMap.collectableMarkers[pathName].options.core === extractedCore.pathName)
                        {
                            currentObjectSatellites.push(baseLayout.satisfactoryMap.collectableMarkers[pathName]);
                        }
                    }
                }
            }

        return currentObjectSatellites;
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let clockSpeed  = baseLayout.getClockSpeed(currentObject);
        let powerUsed   = buildingData.powerUsed * clockSpeed;
            if(baseLayout.saveGameParser.header.saveVersion >= 33)
            {
                powerUsed = buildingData.powerUsed * Math.pow(clockSpeed, 1.321929);
            }
            else
            {
                powerUsed = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
            }

        let satellites  = Building_FrackingSmasher.getSatellites(baseLayout, currentObject);
        let potential   = 0;

        let content     = [];

            // TOP
            content.push('<div style="position: absolute;margin-top: 25px;margin-left: 90px; width: 195px;height: 110px;border-radius: 10px;color: #FFFFFF;padding-bottom: 10px;' + BaseLayout_Tooltip.uiGradient + '">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
                content.push('<strong style="white-space: normal;">' + buildingData.name + '</strong>');

                let objectCircuit = baseLayout.circuitSubSystem.getObjectCircuit(currentObject);
                    content.push(BaseLayout_Tooltip.setTooltipFooter({baseLayout: baseLayout, circuit: objectCircuit, powerUsed: powerUsed, singleLine: true}));

                content.push('<ins class="small">Extractors connected:</ins>');
                content.push('<div class="small text-warning">');

                let connectedContent    = [];
                let unconnectedContent  = [];
                let extractorRates      = {impure: 30000, normal: 60000, pure: 120000};
                    if(baseLayout.buildingsData.Build_FrackingExtractor_C !== undefined)
                    {
                        extractorRates = baseLayout.buildingsData.Build_FrackingExtractor_C.extractionRate;
                    }

                    for(let i = 0; i < satellites.length; i++)
                    {
                        if(satellites[i].options.extractorPathName !== undefined)
                        {
                            connectedContent.push('<i class="fas fa-circle"></i>');
                        }
                        else
                        {
                            unconnectedContent.push('<i class="far fa-circle"></i>');
                        }

                        if(satellites[i].options.purity !== undefined && extractorRates[satellites[i].options.purity] !== undefined)
                        {
                            potential += extractorRates[satellites[i].options.purity];
                        }
                        else
                        {
                            potential += 60000;
                        }
                    }
                    content.push(connectedContent.join('') + unconnectedContent.join(''));

                content.push('</div>');

            content.push('</div></div>');
            content.push('</div>');

            // BOTTOM
            content.push('<div style="position: absolute;margin-top: 140px;margin-left: 90px; width: 195px;height: 50px;line-height: 1;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

                content.push('<ins class="small">Resource Well Potential</ins><br />');
                content.push('<strong class="small"><span class="text-info">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(potential * clockSpeed / 100) / 10) + '</span> m³ per minute</strong>');

            content.push('</div></div>');
            content.push('</div>');

            // FOOTER
            content.push(BaseLayout_Tooltip.getOverclockingPanel(baseLayout, currentObject, 256, 12));
            content.push(BaseLayout_Tooltip.getStandByPanel(baseLayout, currentObject, 265, 385, 334, 387));

        return '<div style="width: 500px;height: 380px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/Fracker_Smasher_BG.png?v=' + baseLayout.scriptVersion + ');margin: -7px;">' + content.join('') + '</div>';
    }
}