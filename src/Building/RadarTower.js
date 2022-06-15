/* global parseFloat */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

import Modal_Map_Collectables                   from '../Modal/Map/Collectables.js';

export default class Building_RadarTower
{
    static getCurrentCoverageRadius(baseLayout, currentObject)
    {
        let mCurrentExpansionStep   = Building_RadarTower.getCurrentExpansionStep(baseLayout, currentObject);
        let currentCoverage         = ((2.86 * (currentObject.transform.translation[2] / 100)) + 920) * (mCurrentExpansionStep / 100);

        return Math.min(2120, currentCoverage) * 100;
    }

    static getCollectablesInCoverageRadius(baseLayout, currentObject)
    {
        let statisticsCollectables  = new Modal_Map_Collectables({baseLayout: baseLayout});
        let playerCollectables      = baseLayout.satisfactoryMap.collectableMarkers;
        let collectablesInRadius    = {};
        let currentRadius           = Building_RadarTower.getCurrentCoverageRadius(baseLayout, currentObject);

            for(let pathName in playerCollectables)
            {
                let currentCollectableMarker    = playerCollectables[pathName];
                    if(['smallRocks', 'largeRocks', 'sporeFlowers', 'pillars'].includes(currentCollectableMarker.options.type) === false)
                    {

                        let collectableObject           = baseLayout.saveGameParser.getTargetObject(pathName);
                            if(collectableObject !== null)
                            {
                                let currentDistance = BaseLayout_Math.getDistance(currentObject.transform.translation, collectableObject.transform.translation);
                                    if(currentDistance <= currentRadius)
                                    {
                                        switch(collectableObject.className)
                                        {
                                            case '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C':
                                                if(currentCollectableMarker.options.extractorPathName === undefined)
                                                {
                                                    let className = collectableObject.className + '|' + currentCollectableMarker.options.type + '|' + currentCollectableMarker.options.purity;
                                                        if(collectablesInRadius[className] === undefined)
                                                        {
                                                            collectablesInRadius[className] = {
                                                                type    : currentCollectableMarker.options.type,
                                                                purity  : currentCollectableMarker.options.purity,
                                                                qty     : 0
                                                            };
                                                        }

                                                        collectablesInRadius[className].qty++;
                                                }
                                                break;
                                            case '/Game/FactoryGame/Resource/BP_FrackingSatellite.BP_FrackingSatellite_C':
                                            case '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C':
                                                //console.log(collectableObject, currentCollectableMarker);
                                                break;
                                            default:
                                                let collectedStatus = statisticsCollectables.getStatusFromPathName(pathName, collectableObject.className);
                                                    if(collectedStatus === false)
                                                    {
                                                        if(collectablesInRadius[collectableObject.className] === undefined)
                                                        {
                                                            collectablesInRadius[collectableObject.className] = {qty: 0};
                                                        }

                                                        collectablesInRadius[collectableObject.className].qty++;
                                                    }
                                        }

                                    }
                            }
                    }
            }

        //console.log('collectablesInRadius', collectablesInRadius);
        return collectablesInRadius;
    }

    static getCurrentExpansionStep(baseLayout, currentObject)
    {
        let mCurrentExpansionStep = baseLayout.getObjectProperty(currentObject, 'mCurrentExpansionStep');
            if(mCurrentExpansionStep !== null)
            {
                return Math.min(100, (mCurrentExpansionStep * 5) + 50);
            }

        return 50;
    }

    static getTimeToNextExpansion(baseLayout, currentObject)
    {
        let mTimeToNextExpansion = baseLayout.getObjectProperty(currentObject, 'mTimeToNextExpansion');
            if(mTimeToNextExpansion !== null)
            {
                return mTimeToNextExpansion;
            }

        return 0;
    }

    static getTowerName(baseLayout, currentObject)
    {
        let mMapText = baseLayout.getObjectProperty(currentObject, 'mMapText');
            return mMapText;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-pen',
            text        : 'Update label',
            callback    : Building_RadarTower.updateMapText
        });

        contextMenu.push({
            icon        : 'fa-empty-set',
            text        : 'Reset status',
            callback    : Building_RadarTower.resetStatus
        });
        contextMenu.push('-');

        return contextMenu;
    }

    static resetStatus(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(currentObject !== null)
            {
                baseLayout.deleteObjectProperty(currentObject, 'mCurrentExpansionStep');
            }
    }

    /**
     * MODALS
     */
    static updateMapText(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mMapText        = Building_RadarTower.getTowerName(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>Beacon</strong>" label',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mMapText',
                    inputType   : 'text',
                    value       : ((mMapText !== null) ? mMapText.replace('Radar Tower: ', '') : '')
                }],
                callback    : function(values)
                {
                    baseLayout.deleteObjectProperty(currentObject, 'mMapText');

                    if(values.mMapText !== '')
                    {
                        currentObject.properties.push({
                            name            : "mMapText",
                            type            : "TextProperty",
                            sourceFmt       : {
                                flags           : 8,
                                historyType     : 0,
                                namespace       : "",
                                key             : "1A1BB1E24E24B63BAEA1059177C85F97",
                                value           : "Radar Tower: {Name}"
                            },
                            flags           : 1,
                            historyType     : 3,
                            arguments       : [{
                                name            : "Name",
                                valueType       : 4,
                                argumentValue   : {
                                    flags                       : 18,
                                    hasCultureInvariantString   : 1,
                                    historyType                 : 255,
                                    type                        : "TextProperty",
                                    value                       : values.mMapText
                                }
                            }],
                            argumentsCount  : 1
                        });
                    }
                }
            });
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content = [];

        content.push('<div style="position: absolute;margin-top: 29px;margin-left: 320px; width: 150px;height: 180px;display: flex;align-items: center;">');
        content.push('<div style="width: 100%;display: block;line-height: 1;font-size: 12px;color: #5b5b5b;">');

        let mMapText = Building_RadarTower.getTowerName(baseLayout, currentObject);
            if(mMapText !== null)
            {
                content.push('<div style="padding-bottom: 10px;">');
                content.push('Tower name:<br />');
                content.push('<strong class="text-warning" style="font-size: 14px;">' + mMapText + '</strong>');
                content.push('</div>');
            }

        let mCurrentExpansionStep   = Building_RadarTower.getCurrentExpansionStep(baseLayout, currentObject);
        let isPowered               = baseLayout.getBuildingIsOn(currentObject) && baseLayout.getBuildingIsPowered(currentObject);
            if(mCurrentExpansionStep !== null)
            {
                content.push('<div style="padding-bottom: 10px;">');
                content.push('Percent scanned:<br />');

                if(isPowered === true)
                {
                    content.push('<strong class="text-warning" style="font-size: 24px;">' + mCurrentExpansionStep + '%</strong>');
                }
                else
                {
                    content.push('<strong class="text-warning" style="font-size: 24px;">NO POWER</strong>');
                }

                content.push('</div>');
            }

        let mTimeToNextExpansion = Building_RadarTower.getTimeToNextExpansion(baseLayout, currentObject);
            if(mTimeToNextExpansion !== null)
            {
                let pad                     = function(num, size) { return ('000' + num).slice(size * -1); },
                    time                    = parseFloat(mTimeToNextExpansion).toFixed(3),
                    minutes                 = Math.floor(time / 60) % 60,
                    seconds                 = Math.floor(time - minutes * 60)

                content.push('<div style="border-top: 1px solid #5b5b5b;padding-bottom: 10px;padding-top: 10px;">');
                content.push('Time until next scan:<br />');
                content.push('<strong class="text-warning" style="font-size: 24px;">' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's</strong>');
                content.push('</div>');
            }

        content.push('</div>');
        content.push('</div>');

        // RADAR
        if(mCurrentExpansionStep !== null)
        {
            let radarSize = 200;

            if(mCurrentExpansionStep < 100)
            {
                content.push('<div style="position: absolute;margin-top: 35px;margin-left: 35px; width: 80px;' + BaseLayout_Tooltip.styleLabels + 'height: 22px;background: #5f5f5f;color: #FFFFFF;"><strong>Maximum<br />Scannable Area</strong></div>');
            }
            if(isPowered === true)
            {
                content.push('<div style="position: absolute;margin-top: 110px;margin-left: 24px; width: 70px;' + BaseLayout_Tooltip.styleLabels + 'height: 22px;background: #F39C12;"><strong>Current<br />Scanned Area</strong></div>');
            }

            content.push('<div style="position: absolute;margin-top: 30px;margin-left: 100px; width: ' + radarSize + 'px;height: ' + radarSize + 'px;border-radius: 50%;background: #5f5f5f;">');

            for(let i = 100; i >= 50; i = i-5)
            {
                let currentStep = (100 - i);
                let radius      = radarSize - (currentStep * radarSize / 100);
                let background  = '#5f5f5f';
                let border      = '#333333';
                    if(mCurrentExpansionStep !== null && isPowered === true && mCurrentExpansionStep >= i)
                    {
                        background  = '#F39C12';
                        border      = '#FFFFFF';
                    }

                    content.push('<div style="position: absolute;margin-top: ' + currentStep + 'px;margin-left: ' + currentStep + 'px; width: ' + radius + 'px;height: ' + radius + 'px;border-radius: 50%;background: ' + background + ';border: 1px solid ' + border + ';">');
                    content.push('</div>');
            }

            content.push('<div style="position: absolute;margin-top: ' + ((radarSize / 2) - 20)  + 'px;margin-left: ' + ((radarSize / 2) - 20)  + 'px; width: 40px;height: 40px;border-radius: 50%;background: #FFFFFF;">');
            content.push('</div>');

            content.push('</div>');
        }

        // COLLECTABLE IN RADIUS
        let collectablesInRadius    = Building_RadarTower.getCollectablesInCoverageRadius(baseLayout, currentObject);
        let fakeInventory           = [];
            for(let className in collectablesInRadius)
            {
                if(className === '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                {
                    fakeInventory.push({
                        name    : baseLayout.toolsData.Desc_HardDrive_C.name,
                        image   : baseLayout.toolsData.Desc_HardDrive_C.image,
                        qty     : collectablesInRadius[className].qty
                    });
                }
                else
                {
                    if(collectablesInRadius[className].type !== undefined && collectablesInRadius[className].purity !== undefined)
                    {
                        let itemData = baseLayout.getItemDataFromClassName(collectablesInRadius[className].type);
                            fakeInventory.push({
                                name            : itemData.name,
                                image           : itemData.image,
                                qty             : collectablesInRadius[className].qty,
                                backgroundColor : ((collectablesInRadius[className].purity === 'pure') ? '#80b139' : ((collectablesInRadius[className].purity === 'normal') ? '#f26418' : '#d23430'))
                            });
                    }
                    else
                    {
                        let itemData = baseLayout.getItemDataFromClassName(className);
                            fakeInventory.push({
                                name    : itemData.name,
                                image   : itemData.image,
                                qty     : collectablesInRadius[className].qty
                            });
                    }
                }
            }

        content.push('<div style="position: absolute;margin-top: 243px;margin-left: 24px; width: 450px;height: 100px;font-size: 12px;align-items: center;">');
        content.push(baseLayout.setInventoryTableSlot(fakeInventory, null, 36, '', null, 12));
        content.push('</div>');

        // STAND BY
        content.push(BaseLayout_Tooltip.getStandByPanel(baseLayout, currentObject, 408, 422, 435, 352));

        content.push('<div style="position: absolute;margin-top: 371px;margin-left: 210px; width: 80px;' + BaseLayout_Tooltip.styleLabels + '"><strong>SCAN DETAILS</strong></div>');

        return '<div style="width: 500px;height: 485px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/RadarTower_Background.png?v=' + baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }

    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        //TODO: Add extra radius marker
    }
    static unbindTooltip(baseLayout, currentObject)
    {

    }
}