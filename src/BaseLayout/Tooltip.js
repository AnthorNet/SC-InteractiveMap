/* global Intl, Sentry */
import BaseLayout_Math from '../BaseLayout/Math.js';

export default class BaseLayout_Tooltip
{
    constructor(options)
    {
        this.baseLayout                     = options.baseLayout;
        this.target                         = options.target;

        this.defaultTextStyle               = 'color: #FFFFFF;text-shadow: 1px 1px 1px #000000;line-height: 16px;font-size: 12px;';
        this.genericTooltipBackgroundStyle  = 'border: 25px solid #7f7f7f;border-image: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/genericTooltipBackground.png?v=' + this.baseLayout.scriptVersion + ') 25 repeat;background: #7f7f7f;margin: -7px;' + this.defaultTextStyle;
        this.genericStorageBackgroundStyle  = 'border: 19px solid #373737;border-image: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/genericStorageBackground.png?v=' + this.baseLayout.scriptVersion + ') 20 repeat;background: #373737;background-clip: padding-box;';
    }

    getTooltip(currentObject)
    {
        let isFauna = this.baseLayout.getFaunaDataFromClassName(currentObject.className);

            if(isFauna !== null)
            {
                return this.setBuildingTooltipContent(currentObject, {name: isFauna.name});
            }
            else
            {
                if(currentObject.className.search('/Build_ConveyorBeltMk') !== -1 || currentObject.className.search('/Build_ConveyorLiftMk') !== -1)
                {
                    return this.setBeltTooltipContent(currentObject);
                }
                else
                {
                    switch(currentObject.className)
                    {
                        case '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C':
                            let mDecorationDescriptor = this.baseLayout.getObjectProperty(currentObject, 'mDecorationDescriptor');
                                if(mDecorationDescriptor !== null)
                                {
                                    let currentItemData = this.baseLayout.getItemDataFromClassName(mDecorationDescriptor.pathName);
                                        if(currentItemData !== null)
                                        {
                                            let currentContent  = '';
                                                currentContent += currentItemData.name + '<br />';
                                                currentContent += 'Altitude: ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentObject.transform.translation[2] / 100)) + 'm';

                                            return this.setBuildingTooltipContent(currentObject, {name: currentContent});
                                        }
                                }
                            break;
                        case '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C':
                        case '/Script/FactoryGame.FGItemPickup_Spawnable':
                        case '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C':
                            let currentContent  = '';

                                if(this.baseLayout.itemsData[this.target.options.itemId] !== undefined)
                                {
                                    currentContent += new Intl.NumberFormat(this.baseLayout.language).format(this.target.options.itemQty) + 'x ' + this.baseLayout.itemsData[this.target.options.itemId].name + '<br />';
                                }

                                currentContent += 'Altitude: ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentObject.transform.translation[2] / 100)) + 'm';

                            return this.setBuildingTooltipContent(currentObject, {name: currentContent});
                        case '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C':
                            return this.setBuildingStorageTooltipContent(currentObject, {name: 'Loot Crate', category: 'storage'});
                        case '/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C':
                            return this.setBeaconTooltipContent(currentObject);
                        case '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C':
                            return this.setBuildingExtractionTooltipContent(currentObject, this.baseLayout.toolsData.BP_ItemDescriptorPortableMiner_C);
                        case '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C':
                        case '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C':
                        case '/Game/InfiniteLogistics/Buildable/InfinitePipeline/Build_InfinitePipeline.Build_InfinitePipeline_C':
                            return this.setPipelineTooltipContent(currentObject);
                        default:
                            let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                                if(buildingData !== null)
                                {
                                    switch(buildingData.category)
                                    {
                                        case 'extraction':
                                            return this.setBuildingExtractionTooltipContent(currentObject, buildingData);
                                        case 'production':
                                            return this.setBuildingProductionTooltipContent(currentObject, buildingData);
                                        case 'generator':
                                            return this.setBuildingGeneratorTooltipContent(currentObject, buildingData);
                                        case 'storage':
                                        case 'dockstation':
                                        case 'vehicle':
                                            if(currentObject.className !== '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
                                            {
                                                return this.setBuildingStorageTooltipContent(currentObject, buildingData);
                                            }
                                        default:
                                            return this.setBuildingTooltipContent(currentObject, buildingData);
                                    }
                                }
                    }
                }
            }

        return null;
    }

    setBeaconTooltipContent(currentObject)
    {
        let content         = [];
        let mCompassText    = this.baseLayout.getObjectProperty(currentObject, 'mCompassText');
            if(mCompassText !== null)
            {
                content.push('Beacon: <strong>' + mCompassText + '</strong>');
            }
            else
            {
                content.push('<strong>Beacon</strong>');
            }

        content.push('<div class="text-small">' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentObject.transform.translation[0])) + ' / ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentObject.transform.translation[1])) + '</div>');
        content.push('<div class="text-small">Altitude: ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentObject.transform.translation[2] / 100)) + 'm</div>');

        return '<div class="d-flex" style="' + this.genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        <div style="color: #FFFFFF;text-shadow: 2px 2px 2px #000000;line-height: 16px;font-size: 12px;" >\
                            ' + content.join('') + '\
                        </div>\
                    </div>\
                </div>';
    }

    setPipelineTooltipContent(currentObject)
    {
        let content         = [];
        let distance        = '';
        let pipelineData    = this.baseLayout.getBuildingDataFromClassName(currentObject.className);

        if(pipelineData !== null)
        {
            let splineData      = this.baseLayout.extractSplineData(currentObject);
                if(splineData !== null)
                {
                    distance = ' (' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(splineData.distance * 10) / 10) + 'm)';
                }

            // HEADER
            content.push('<div style="position: absolute;margin-top: 5px;width: 350px;text-align: center;color: #FFFFFF;text-shadow: 2px 2px 2px #000000;">');
            content.push('<strong>' + pipelineData.name + distance + '</strong>');
            content.push('</div>');

            // VOLUME
            let maxFluid        = Math.PI * Math.pow((1.3 / 2), 2) * splineData.distanceAlt * 1000; // Use straigth calculation
            let currentFluid    = maxFluid; //TODO: Until we get fluidBox method working!
            let itemType        = null;

            let fluidBox        = this.baseLayout.getObjectProperty(currentObject, 'mFluidBox');
                if(fluidBox === null)
                {
                    fluidBox = {value: 0};
                }

            // Get fluid type
            let pipeNetworkId   = null;

                for(let i = 0; i < currentObject.children.length; i++)
                {
                    let currentChildren = this.baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                        if(currentChildren !== null)
                        {
                            let mPipeNetworkID = this.baseLayout.getObjectProperty(currentChildren, 'mPipeNetworkID');
                                if(mPipeNetworkID !== null)
                                {
                                    pipeNetworkId = mPipeNetworkID;
                                    break;
                                }
                        }
                }

                if(pipeNetworkId !== null && this.baseLayout.saveGamePipeNetworks[pipeNetworkId] !== undefined)
                {
                    let currentPipeNetwork = this.baseLayout.saveGameParser.getTargetObject(this.baseLayout.saveGamePipeNetworks[pipeNetworkId]);
                        if(currentPipeNetwork !== null)
                        {
                            for(let n = currentPipeNetwork.properties.length - 1; n >= 0; n--)
                            {
                                if(currentPipeNetwork.properties[n].name === 'mFluidDescriptor')
                                {
                                    itemType = currentPipeNetwork.properties[n].value.pathName;
                                }
                            }
                        }
                }

            if(itemType !== null)
            {
                itemType = this.baseLayout.getItemDataFromClassName(itemType);

                if(itemType !== null && itemType.color !== undefined && currentFluid > 0)
                {
                    let imageSize       = 120;
                    let volumeHeight    = Math.round(currentFluid / maxFluid * imageSize);

                        content.push('<div style="position: absolute;margin-top: 40px;margin-left: 198px;">');
                            content.push('<div style="position: relative;width: ' + imageSize + 'px;height: ' + imageSize + 'px;border-radius: 50%;overflow: hidden;"><div style="margin-top: ' + (imageSize - volumeHeight) + 'px;height: ' + volumeHeight + 'px;background-color:' + itemType.color + ';"></div></div>');
                        content.push('</div>');
                        content.push('<div style="position: absolute;margin-top: 40px;margin-left: 198px;width: ' + imageSize + 'px;height: ' + imageSize + 'px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/liquidDome.png?v=' + this.baseLayout.scriptVersion + '" style="width: ' + imageSize + 'px;height: ' + imageSize + 'px;" /></div>');
                }

                if(itemType !== null && itemType.color !== undefined)
                {
                    content.push('<div style="position: absolute;margin-top: 185px;margin-left: 11px;width: 160px;color: #5b5b5b;text-align: center;font-size: 13px;">');
                    content.push('<strong>' + itemType.name + '</strong>');
                    content.push('</div>');
                }
            }

            // AMOUNT
            content.push('<div style="position: absolute;margin-top: 200px;margin-left: 200px;width: 120px;color: #FFFFFF;text-align: center;font-size: 13px;">');
            content.push('<span class="small">Current amount:</span><br /><strong>??? / ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(maxFluid / 100) / 10) + 'm³</strong>');
            content.push('</div>');

            if(pipelineData.maxFlowRate !== undefined)
            {
                content.push('<div style="position: absolute;margin-top: 205px;margin-left: 11px;width: 80px;text-align: center;font-size: 11px;color: #5b5b5b;">');
                content.push('<span class="small">Flow Rate</span><br /><i class="fas fa-chevron-right"></i><br /><strong><strong class="text-info">???</strong> m³/min</strong>');
                content.push('</div>');
                content.push('<div style="position: absolute;margin-top: 205px;margin-left: 93px;width: 80px;text-align: center;font-size: 11px;color: #5b5b5b;border-left: 1px solid #5b5b5b;">');
                content.push('<span class="small">Max Flow Rate</span><br /><i class="fas fa-chevron-double-right"></i><br /><strong><strong class="text-info">' + pipelineData.maxFlowRate / 1000 + '</strong> m³/min</strong>');
                content.push('</div>');
            }

            // Flow indicator
            content.push('<div style="position: absolute;margin-top: 42px;margin-left: 32px;width: 118px;height: 118px;"><img src="' + this.baseLayout.staticUrl + '/img/mapTooltip/flowIndicator.png?v=' + this.baseLayout.scriptVersion + '" style="width: 118px;height: 118px;transform: rotate(-135deg);" /></div>');
            content.push('<div style="position: absolute;margin-top: 42px;margin-left: 32px;width: 118px;height: 118px;"><img src="' + this.baseLayout.staticUrl + '/img/mapTooltip/flowGlass.png?v=' + this.baseLayout.scriptVersion + '" style="width: 118px;height: 118px;" /></div>');

        }

        return '<div style="position: relative;width: 350px;height: 270px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/pipelineBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }

    setBeltTooltipContent(currentObject)
    {
        let beltInventory = [];

        if(currentObject.extra !== undefined && currentObject.extra.items.length > 0)
        {
            for(let i = 0; i < currentObject.extra.items.length; i++)
            {
                let currentItemData = this.baseLayout.getItemDataFromClassName(currentObject.extra.items[i].name);

                if(currentItemData !== null)
                {
                    currentObject.extra.items[i].currentItemData = currentItemData;

                    beltInventory.push({
                        className   : currentItemData.className,
                        name        : currentItemData.name,
                        image       : currentItemData.image,
                        qty         : 1
                    });
                }
            }
        }

        let beltData        = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
        let distance        = '';

        // Belt
        let splineData      = this.baseLayout.extractSplineData(currentObject);
            if(splineData !== null)
            {
                distance = ' (' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(splineData.distance * 10) / 10) + 'm)';
            }

        // Conveyor lift
        let mTopTransform = this.baseLayout.getObjectProperty(currentObject, 'mTopTransform');
            if(mTopTransform !== null)
            {
                for(let i = 0; i < mTopTransform.values.length; i++)
                {
                    if(mTopTransform.values[i].name === 'Translation')
                    {
                        let height      = Math.abs(mTopTransform.values[i].value.values.z) / 100;
                            distance    = ' (' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(height * 10) / 10) + 'm)';
                    }
                }
            }

        let content         = [];

            // HEADER
            content.push('<div><strong>' + beltData.name + distance + '</strong></div>');

            // INVENTORY
            content.push('<div style="' + this.genericStorageBackgroundStyle + '" class="mt-3">');
                content.push('<div style="margin: 0 auto;width: 400px;">');
                    if(beltInventory.length > 0)
                    {
                        content.push(this.baseLayout.setInventoryTableSlot(beltInventory));
                    }
                content.push('</div>');
            content.push('</div>');

        return '<div class="d-flex" style="' + this.genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }

    setBuildingExtractionTooltipContent(currentObject, buildingData)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/OilPump/Build_OilPump.Build_OilPump_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/WaterPump/Build_WaterPump.Build_WaterPump_C')
        {
            return this.setBuildingPumpTooltipContent(currentObject, buildingData);
        }

        let itemType                = null;
        let purity                  = 'normal';
        let extractionRate          = 60;
        let extractResourceNode     = this.baseLayout.getObjectProperty(currentObject, 'mExtractableResource');

            if(currentObject.className === '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
            {
                extractResourceNode     = this.baseLayout.getObjectProperty(currentObject, 'mExtractResourceNode');
            }

            if(extractResourceNode !== null && this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
            {
                if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity !== undefined)
                {
                    purity = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity;
                }

                if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type !== undefined)
                {
                    itemType = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type;
                }
            }

            if(buildingData.extractionRate !== undefined && buildingData.extractionRate[purity] !== undefined)
            {
                extractionRate      = buildingData.extractionRate[purity];
            }

        let clockSpeed          = null;
        let powerUsed           = null;

        let craftingTime        = 60 / extractionRate;

        if(currentObject.className !== '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
        {
            clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
            powerUsed           = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
            extractionRate     *= clockSpeed;
        }

        if(buildingData.mManufacturingSpeedMultiplier !== undefined)
        {
            extractionRate *= buildingData.mManufacturingSpeedMultiplier;
        }

        let content     = [];

            // HEADER
            content.push('<div style="position: absolute;margin-top: 5px;width: 100%;text-align: center;color: #FFFFFF;text-shadow: 2px 2px 2px #000000;">');
            content.push('<strong>' + buildingData.name + '</strong>');
            content.push('</div>');

            // OUTPUT
            content.push('<div style="position: absolute;margin-top: 52px;margin-left: 234px; width: 121px;height: 233px;">');

            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

                if(extractResourceNode !== null && itemType !== null)
                {
                    content.push('<div style="border-bottom: 1px solid #e7e7e7;line-height: 1;font-size: 13px;letter-spacing: -0.05em;" class="pb-2 mb-2">');
                    content.push('<div><strong>' + this.baseLayout.itemsData[itemType].name + '</strong></div>');
                    content.push('<span class="small"><strong class="text-warning">' + +(Math.round(extractionRate * 100) / 100) + '</strong> per minute</span>');
                    content.push('</div>');

                    let inventoryOut    = this.baseLayout.getObjectInventory(currentObject, 'mOutputInventory');
                        content.push('<div class="text-center"><table class="mx-auto mb-2"><tr><td>' + this.baseLayout.setInventoryTableSlot(inventoryOut, 1, 64, 'justify-content-center') + '</td></tr></table></div>');
                }

                let currentProgress = Math.min(100, Math.round(this.baseLayout.getObjectProperty(currentObject, 'mCurrentExtractProgress', 0) * 10000) / 100);
                    content.push('<div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" role="progressbar" style="width: ' + currentProgress + '%"></div></div>');
                    content.push('<span class="small">Producing - <span class="text-warning">' + currentProgress + '%</span></span>');

                if(currentObject.className !== '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
                {
                    content.push(this.setTooltipFooter({circuitId: this.baseLayout.getObjectCircuitID(currentObject), craftingTime: craftingTime, clockSpeed: clockSpeed, powerUsed: powerUsed}));
                }

            content.push('</div></div>');
            content.push('</div>');


        if(currentObject.className !== '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
        {
            // HANDLE
            content.push('<div style="position: absolute;margin-top: 25px;margin-left: 104px; width: 95px;height: 303px;overflow: hidden;">');
            content.push('<img src="' + this.baseLayout.staticUrl + '/img/mapTooltip/minerHandle.jpg" id="mapTooltipMinerHandle" style="transform: translate3d(0, 0, 0);animation: loop 1s linear infinite;" />');
            content.push('<style type="text/css">@keyframes loop {0% {transform: translateY(-303px);} 100% {transform: translateY(0);}}</style>');
            content.push('</div>');

            // FOOTER
            content.push(this.getOverclockingPanel(currentObject));
            content.push(this.getStandByPanel(currentObject));
        }

        return '<div style="position: relative;width: 500px;height: 490px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/minerBackground.png) no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }

    setBuildingPumpTooltipContent(currentObject, buildingData)
    {
        let extractResourceNode     = this.baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
        let itemType                = null;
        let purity                  = 'normal';

            if(extractResourceNode !== null && this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
            {
                //this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].setOpacity(collectedOpacity);

                if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity !== undefined)
                {
                    purity = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity;
                }

                if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type !== undefined)
                {
                    itemType = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type;
                }
            }

            if(itemType === null && currentObject.className === '/Game/FactoryGame/Buildable/Factory/WaterPump/Build_WaterPump.Build_WaterPump_C')
            {
                itemType        = 'Desc_Water_C';
            }

        let craftingTime        = 60 / buildingData.extractionRate[purity];
        let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
        let powerUsed           = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
        let productionRatio     = buildingData.extractionRate[purity] * clockSpeed;

        // VOLUME
        let currentFluid        = 0;
        let maxFluid            = (buildingData.maxFluid !== undefined) ? buildingData.maxFluid : 50000;
        let inventoryOut        = this.baseLayout.getObjectInventory(currentObject, 'mOutputInventory');

            for(let i = 0; i < inventoryOut.length; i++)
            {
                if(inventoryOut[i] !== null && this.baseLayout.itemsData[itemType] !== undefined && inventoryOut[i].className === this.baseLayout.itemsData[itemType].className)
                {
                    currentFluid = inventoryOut[i].qty;
                    break;
                }
            }

            currentFluid        = Math.min(currentFluid, maxFluid);
            currentFluid        = +(Math.round((currentFluid / 1000) * 100) / 100);
            maxFluid            = +(Math.round((maxFluid / 1000) * 100) / 100);

        let content     = [];

            // HEADER
            content.push('<div style="position: absolute;margin-top: 3px;width: 150px;text-align: center;color: #FFFFFF;text-shadow: 2px 2px 2px #000000;">');
            content.push('<strong>' + buildingData.name + '</strong>');
            content.push('</div>');

            // OUTPUT
            content.push('<div style="position: absolute;margin-top: 40px;margin-left: 30px; width: 90px;height: 186px;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center" style="color: #5b5b5b;">');

                if(extractResourceNode !== null && itemType !== null)
                {
                    content.push('<div style="border-bottom: 1px solid #e7e7e7;line-height: 1;font-size: 13px;letter-spacing: -0.05em;" class="pb-2 mb-2">');
                    content.push('<div><strong>' + this.baseLayout.itemsData[itemType].name + '</strong></div>');
                    content.push('<span class="small"><strong class="text-warning">' + +(Math.round((productionRatio / 1000) * 100) / 100) + 'm³</strong> per minute</span>');

                    content.push('</div>');

                    content.push('<div class="text-center"><table class="mx-auto mb-2"><tr><td><div class="d-flex flex-row" style="position:relative;margin: 1px;width: 64px;height: 64px;border: 1px solid #000000;border-radius:50%;padding: 5px;background-color: #FFFFFF;"><img src="' + this.baseLayout.itemsData[itemType].image + '" class="img-fluid" /></div></td></tr></table></div>');
                }

                let currentProgress = Math.min(100, Math.round(this.baseLayout.getObjectProperty(currentObject, 'mCurrentExtractProgress', 0) * 10000) / 100);
                    content.push('<div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" role="progressbar" style="width: ' + currentProgress + '%"></div></div>');
                    content.push('<span class="small">Producing - <span class="text-warning">' + currentProgress + '%</span></span>');

                content.push(this.setTooltipFooter({circuitId: this.baseLayout.getObjectCircuitID(currentObject), craftingTime: craftingTime, clockSpeed: clockSpeed, powerUsed: powerUsed}));

            content.push('</div></div>');
            content.push('</div>');

        // DOME
        if(extractResourceNode !== null && itemType !== null && this.baseLayout.itemsData[itemType].color !== undefined && currentFluid > 0)
        {
            let volumeHeight = Math.round(currentFluid / maxFluid * 104);

                content.push('<div style="position: absolute;margin-top: 20px;margin-left: 355px;">');
                content.push('<div style="position: relative;width: 104px;height: 104px;border-radius: 50%;overflow: hidden;"><div style="margin-top: ' + (104 - volumeHeight) + 'px;height: ' + volumeHeight + 'px;background-color:' + this.baseLayout.itemsData[itemType].color + ';"></div></div>');
                content.push('</div>');
        }
        content.push('<div style="position: absolute;margin-top: 20px;margin-left: 355px;width: 104px;height: 104px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/liquidDome.png?v=' + this.baseLayout.scriptVersion + '" style="width: 104px;height: 104px;" /></div>');

        // AMOUNT
        content.push('<div style="position: absolute;margin-top: 155px;margin-left: 355px;width: 104px;color: #FFFFFF;text-align: center;font-size: 13px;">');
        content.push('<span class="small">Current amount:</span><br /><strong><strong class="text-info">' + currentFluid + '</strong> / ' + maxFluid + ' m³</strong>');
        content.push('</div>');

        if(buildingData.maxFlowRate !== undefined)
        {
            content.push('<div style="position: absolute;margin-top: 150px;margin-left: 193px;width: 70px;text-align: center;font-size: 11px;color: #5b5b5b;">');
            content.push('<span class="small">Flow Rate</span><br /><i class="fas fa-chevron-right"></i><br /><strong><strong class="text-info">???</strong> m³/min</strong>');
            content.push('</div>');
            content.push('<div style="position: absolute;margin-top: 150px;margin-left: 263px;width: 70px;text-align: center;font-size: 11px;color: #5b5b5b;border-left: 1px solid #5b5b5b;">');
            content.push('<span class="small">Max Flow Rate</span><br /><i class="fas fa-chevron-double-right"></i><br /><strong><strong class="text-info">' + buildingData.maxFlowRate / 1000 + '</strong> m³/min</strong>');
            content.push('</div>');
        }

        // Flow indicator
        content.push('<div style="position: absolute;margin-top: 22px;margin-left: 211px;width: 102px;height: 102px;"><img src="' + this.baseLayout.staticUrl + '/img/mapTooltip/flowIndicator.png?v=' + this.baseLayout.scriptVersion + '" style="width: 102px;height: 102px;transform: rotate(-135deg);" /></div>');
        content.push('<div style="position: absolute;margin-top: 22px;margin-left: 211px;width: 102px;height: 102px;"><img src="' + this.baseLayout.staticUrl + '/img/mapTooltip/flowGlass.png?v=' + this.baseLayout.scriptVersion + '" style="width: 102px;height: 102px;" /></div>');

        // FOOTER
        content.push(this.getOverclockingPanel(currentObject, 270));
        content.push(this.getStandByPanel(currentObject, 260));

        return '<div style="position: relative;width: 500px;height: 390px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/pumpBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }

    setBuildingStorageTooltipContent(currentObject, buildingData)
    {
        if([
            '/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C',
            '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'
        ].includes(currentObject.className) === true)
        {
            return this.setBuildingFluidStorageTooltipContent(currentObject, buildingData);
        }

        let inventoryType   = 'solid';
        let inventoryKey    = 'mStorageInventory';
        let content         = [];

        if(buildingData.category === 'dockstation' || currentObject.className === '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C')
        {
            inventoryKey = 'mInventory';
        }
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C')
        {
            inventoryType = 'liquid';
        }
        if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
        {
            let storage           = this.baseLayout.getObjectProperty(currentObject, inventoryKey);
                if(storage !== null)
                {
                    let storageObject = this.baseLayout.saveGameParser.getTargetObject(storage.pathName);
                        if(storageObject !== null)
                        {
                            let mAdjustedSizeDiff = this.baseLayout.getObjectProperty(storageObject, 'mAdjustedSizeDiff');
                                if(mAdjustedSizeDiff !== null && mAdjustedSizeDiff === -31)
                                {
                                    inventoryType = 'liquid';
                                }
                        }

                }
        }

            // HEADER
            content.push('<div><strong>' + buildingData.name + '</strong></div>');

            if(currentObject.className === '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C' || buildingData.category === 'vehicle')
            {
                content.push('<div>Altitude: ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentObject.transform.translation[2] / 100)) + 'm</div>');
            }

            if(buildingData.category === 'vehicle' && currentObject.className.search('/Game/FactoryGame/Buildable/Vehicle/Train/') === -1 && currentObject.className !== '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C')
            {
                content.push(this.setInventoryFuel(currentObject));
            }

            if(buildingData.category === 'dockstation' || inventoryType === 'liquid')
            {
                let colSize = 'col-12';

                content.push('<div class="row">');

                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/TruckStation/Build_TruckStation.Build_TruckStation_C')
                    {
                        colSize = 'col-6';

                        content.push('<div class="' + colSize + '">');
                            content.push(this.setInventoryFuel(currentObject));
                        content.push('</div>');
                    }

                    content.push('<div class="' + colSize + '">');
                        content.push(this.setStationLoadMode(currentObject));
                    content.push('</div>');

                content.push('</div>');

                if(inventoryType === 'liquid')
                {
                    let maxFluid        = buildingData.maxFluid; // Use straigth calculation
                    let inventory       = this.baseLayout.getObjectInventory(currentObject, inventoryKey);

                    if(inventory !== null && inventory.length > 0)
                    {
                        let itemType        = this.baseLayout.getItemDataFromClassName(inventory[0].className);
                        let currentFluid    = inventory[0].qty;

                        if(itemType !== null && itemType.color !== undefined && currentFluid > 0)
                        {
                            content.push(this.setLiquidDome(230, currentFluid, maxFluid, itemType.color));
                        }

                        if(itemType !== null)
                        {
                            content.push('<div class="pt-3"><strong>' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentFluid / 100) / 10) + ' m³ of ' + itemType.name + '</strong></div>');
                        }
                    }
                }
            }

            if(inventoryType === 'solid')
            {
                // INVENTORY
                content.push('<div style="' + this.genericStorageBackgroundStyle + '" class="mt-3">');
                    content.push('<div style="margin: 0 auto;width: 400px;">');
                        content.push(this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectInventory(currentObject, inventoryKey), ((buildingData.maxSlot !== undefined) ? buildingData.maxSlot : null)));
                    content.push('</div>');
                content.push('</div>');
            }

        return '<div class="d-flex" style="' + this.genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }

    setBuildingFluidStorageTooltipContent(currentObject, buildingData)
    {
        let content = [];

        // HEADER
        content.push('<div style="position: absolute;margin-top: 2px;width: 270px;text-align: center;color: #FFFFFF;text-shadow: 1px 1px 1px #000000;">');
        content.push('<strong>' + buildingData.name + '</strong>');
        content.push('</div>');

        // VOLUME
        let maxFluid        = buildingData.maxFluid; // Use straigth calculation
        let currentFluid    = maxFluid; //TODO: Until we get fluidBox method working!
        let itemType        = null;

        /*
        let fluidBox        = this.baseLayout.getObjectProperty(currentObject, 'mFluidBox');
            if(fluidBox === null)
            {
                fluidBox = {value: 0};
            }
        */

        // Get fluid type
        let pipeNetworkId   = null;

            for(let i = 0; i < currentObject.children.length; i++)
            {
                let currentChildren = this.baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                    if(currentChildren !== null)
                    {
                        let mPipeNetworkID = this.baseLayout.getObjectProperty(currentChildren, 'mPipeNetworkID');
                            if(mPipeNetworkID !== null)
                            {
                                pipeNetworkId = mPipeNetworkID;
                                break;
                            }
                    }
            }

            if(pipeNetworkId !== null && this.baseLayout.saveGamePipeNetworks[pipeNetworkId] !== undefined)
            {
                let currentPipeNetwork = this.baseLayout.saveGameParser.getTargetObject(this.baseLayout.saveGamePipeNetworks[pipeNetworkId]);
                    if(currentPipeNetwork !== null)
                    {
                        for(let n = currentPipeNetwork.properties.length - 1; n >= 0; n--)
                        {
                            if(currentPipeNetwork.properties[n].name === 'mFluidDescriptor')
                            {
                                itemType = currentPipeNetwork.properties[n].value.pathName;
                            }
                        }
                    }
            }

        if(itemType !== null)
        {
            itemType = this.baseLayout.getItemDataFromClassName(itemType);

            if(itemType !== null && itemType.color !== undefined && currentFluid > 0)
            {
                content.push('<div style="position: absolute;margin-top: 25px;margin-left: 20px;">');
                    content.push(this.setLiquidDome(230, currentFluid, maxFluid, itemType.color));
                content.push('</div>');
            }

            if(itemType !== null)
            {
                content.push('<div style="position: absolute;margin-top: 355px;margin-left: 10px;width: 250px;color: #5b5b5b;text-align: center;font-size: 13px;">');
                    content.push('<strong>' + itemType.name + '</strong>');
                content.push('</div>');
            }
        }

        // AMOUNT
        content.push('<div style="position: absolute;margin-top: 270px;margin-left: 40px;width: 210px;color: #FFFFFF;text-align: center;font-size: 13px;">');
            content.push('<span class="small">Current amount:</span><br /><strong><strong class="text-info">???</strong> / ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(maxFluid / 100) / 10) + ' m³</strong>');
        content.push('</div>');

        if(buildingData.maxFlowRate !== undefined)
        {
            content.push('<div style="position: absolute;margin-top: 390px;margin-left: 0px;width: 135px;text-align: center;font-size: 11px;color: #5b5b5b;">');
            content.push('<span class="small">Flow Rate</span><br /><i class="fas fa-chevron-right"></i><br /><strong><strong class="text-info">???</strong> m³/min</strong>');
            content.push('</div>');
            content.push('<div style="position: absolute;margin-top: 390px;margin-left: 135px;width: 135px;text-align: center;font-size: 11px;color: #5b5b5b;border-left: 1px solid #5b5b5b;">');
            content.push('<span class="small">Max Flow Rate</span><br /><i class="fas fa-chevron-double-right"></i><br /><strong><strong class="text-info">' + buildingData.maxFlowRate / 1000 + '</strong> m³/min</strong>');
            content.push('</div>');
        }

        return '<div style="width: 270px;height: 474px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/fluidStorageBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">\
                ' + content.join('') + '\
                </div>';
    }

    setBuildingProductionTooltipContent(currentObject, buildingData)
    {
        let recipeItem          = this.baseLayout.getItemDataFromRecipe(currentObject);
        let craftingTime        = (recipeItem !== null) ? recipeItem.mManufactoringDuration : 4;

        let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
        let powerUsed           = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);

            craftingTime       /= clockSpeed; // Overclocking...

            if(buildingData.mManufacturingSpeedMultiplier !== undefined)
            {
                craftingTime /= buildingData.mManufacturingSpeedMultiplier;
            }

        let content     = [];

            // HEADER
            content.push('<div style="position: absolute;margin-top: 5px;width: 100%;text-align: center;color: #FFFFFF;text-shadow: 2px 2px 2px #000000;">');
            content.push('<strong>' + buildingData.name + '</strong> ' + ( (recipeItem !== null) ? '<em class="small">(' + recipeItem.name + ')</em>' : '' ));
            content.push('</div>');


            // INPUT
            content.push('<div style="position: absolute;margin-top: 19px;margin-left: 22px; width: 253px;height: 305px;color: #5b5b5b;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
            content.push('<div style="height: 16px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/inputTop.png?v=' + this.baseLayout.scriptVersion + ') no-repeat;"></div>');
            content.push('<div style="padding: 0 16px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/inputMiddle.png?v=' + this.baseLayout.scriptVersion + ') repeat-y;height: 232px;" class="d-flex"><div class="justify-content-center align-self-center w-100">');

            if(recipeItem !== null && recipeItem.ingredients !== undefined)
            {
                let inventoryIn     = this.baseLayout.getObjectInventory(currentObject, 'mInputInventory');

                for(let itemClassName in recipeItem.ingredients)
                {
                    let currentItem         = this.baseLayout.getItemDataFromClassName(itemClassName);
                    let currentInventoryIn  = null;
                        for(let i = 0; i < inventoryIn.length; i++)
                        {
                            if(inventoryIn[i] !== null && inventoryIn[i].className === itemClassName)
                            {
                                currentInventoryIn = inventoryIn[i];
                                break;
                            }
                        }

                    content.push('<div style="border-top: 1px solid #e7e7e7;border-bottom: 1px solid #e7e7e7;height: 58px;padding-top: 3px;" class="d-block">');
                    content.push('<table><tr><td>');
                        content.push(this.baseLayout.getInventoryImage(currentInventoryIn, 48));
                    content.push('</td><td class="align-middle pl-2 text-left">');

                    let consumptionRatio = 60 / craftingTime * recipeItem.ingredients[itemClassName];

                        if(currentItem.category === 'liquid')
                        {
                            content.push('<strong>' + +(Math.round((recipeItem.ingredients[itemClassName] / 1000) * 100) / 100) + 'm³ ' + currentItem.name + '</strong><br />');
                            content.push('<span class="small"><strong class="text-warning">' + +(Math.round(consumptionRatio / 1000 * 100) / 100) + 'm³</strong> per minute</span>');
                        }
                        else
                        {
                            content.push('<strong>' + recipeItem.ingredients[itemClassName] + ' ' + currentItem.name + '</strong><br />');
                            content.push('<span class="small"><strong class="text-warning">' + +(Math.round(consumptionRatio * 100) / 100) + '</strong> per minute</span>');
                        }

                    content.push('</td></tr></table>');
                    content.push('</div>');
                }
            }

            content.push('</div></div>');
            content.push('<div style="height: 37px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/inputBottom.png?v=' + this.baseLayout.scriptVersion + ') no-repeat;padding-top: 18px;"><strong style="font-size: 12px;">INPUT</strong></div>');
            content.push('</div></div>');
            content.push('</div>');

            // OUTPUT
            content.push('<div style="position: absolute;margin-top: 19px;margin-left: 324px; width: 154px;height: 305px;color: #5b5b5b;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
            content.push('<div style="height: 16px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/outputTop.png?v=' + this.baseLayout.scriptVersion + ') no-repeat;"></div>');
            content.push('<div style="padding: 0 16px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/outputMiddle.png?v=' + this.baseLayout.scriptVersion + ') repeat-y;">');

                content.push('<div style="border-bottom: 1px solid #e7e7e7;line-height: 1;font-size: 13px;letter-spacing: -0.05em;" class="pb-2 mb-2">');
                if(recipeItem !== null && recipeItem.produce !== undefined)
                {
                    for(let className in recipeItem.produce)
                    {
                        let currentItem     = this.baseLayout.getItemDataFromClassName(className);

                        if(currentItem !== null)
                        {
                            if(currentItem.category === 'liquid')
                            {
                                content.push('<strong>' + +(Math.round((recipeItem.produce[className] / 1000) * 100) / 100) + 'm³ ' + currentItem.name + '</strong><br />');
                            }
                            else
                            {
                                content.push('<strong>' + recipeItem.produce[className] + ' ' + currentItem.name + '</strong><br />');
                            }
                        }
                    }
                    for(let className in recipeItem.produce)
                    {
                        let currentItem     = this.baseLayout.getItemDataFromClassName(className);

                        if(currentItem !== null)
                        {
                            let productionRatio = 60 / craftingTime * recipeItem.produce[className];

                            if(currentItem.category === 'liquid')
                            {
                                content.push('<span class="small"><strong class="text-warning">' + +(Math.round((productionRatio / 1000) * 100) / 100) + 'm³</strong> per minute</span><br />');
                            }
                            else
                            {
                                content.push('<span class="small"><strong class="text-warning">' + +(Math.round(productionRatio * 100) / 100) + '</strong> Parts per minute</span><br />');
                            }
                        }
                    }
                }
                content.push('</div>');

                if(recipeItem !== null && recipeItem.produce !== undefined)
                {
                    content.push('<table class="w-100 mb-3"><tr>');

                    let inventoryOut    = this.baseLayout.getObjectInventory(currentObject, 'mOutputInventory');

                    for(let itemClassName in recipeItem.produce)
                    {
                        let currentItem         = this.baseLayout.getItemDataFromClassName(itemClassName);
                        let currentInventoryOut = null;
                            for(let i = 0; i < inventoryOut.length; i++)
                            {
                                if(inventoryOut[i] !== null && inventoryOut[i].className === itemClassName)
                                {
                                    currentInventoryOut = inventoryOut[i];
                                    break;
                                }
                            }

                        if(currentItem.category === 'liquid') //TODO: Refinery by-product?!
                        {
                            content.push('<td class="text-center"><div class="small">Fluid</div>');
                                content.push('<table class="mx-auto"><tr><td>' + this.baseLayout.getInventoryImage(currentInventoryOut, 48, 'badge-primary') + '</td></tr></table>');
                            content.push('</td>');
                        }
                        else
                        {
                            content.push('<td class="text-center"><div class="small">Output</div>');
                                content.push('<table class="mx-auto"><tr><td>' + this.baseLayout.getInventoryImage(currentInventoryOut, 48) + '</td></tr></table>');
                            content.push('</td>');
                        }
                    }

                    content.push('</tr></table>');
                }

                let currentProgress = Math.round(this.baseLayout.getObjectProperty(currentObject, 'mCurrentManufacturingProgress', 0) * 100);
                    content.push('<div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" role="progressbar" style="width: ' + currentProgress + '%"></div></div>');
                    content.push('<span class="small">Producing - <span class="text-warning">' + currentProgress + '%</span></span>');

                content.push(this.setTooltipFooter({circuitId: this.baseLayout.getObjectCircuitID(currentObject), craftingTime: craftingTime, clockSpeed: clockSpeed, powerUsed: powerUsed}));

            content.push('</div>');
            content.push('<div style="height: 37px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/outputBottom.png?v=' + this.baseLayout.scriptVersion + ') no-repeat;padding-top: 18px;"><strong style="font-size: 12px;">OUTPUT</strong></div>');
            content.push('</div></div>');
            content.push('</div>');

            // FOOTER
            content.push(this.getOverclockingPanel(currentObject));
            content.push(this.getStandByPanel(currentObject));


        return '<div style="position: relative;width: 500px;height: 490px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/manufacturingBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }

    setBuildingGeneratorTooltipContent(currentObject, buildingData)
    {
        let recipeItem          = this.baseLayout.getItemDataFromRecipe(currentObject);
        let craftingTime        = (recipeItem !== null) ? recipeItem.mManufactoringDuration : 4;

        let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
        let fuelEnergyValue     = null;
        let powerGenerated      = buildingData.powerGenerated * Math.pow(clockSpeed, 1/1.3);

            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorNuclear/Build_GeneratorNuclear.Build_GeneratorNuclear_C')
            {
                powerGenerated = buildingData.powerGenerated * Math.pow(clockSpeed, 1/1.321928);
            }

        let fuelClass           = this.baseLayout.getObjectProperty(currentObject, 'mCurrentFuelClass');

            craftingTime       /= clockSpeed; // Overclocking...

        let inventoryIn         = this.baseLayout.getObjectInventory(currentObject, 'mFuelInventory');

        let currentFluid        = 0;
        let maxFluid            = (buildingData.maxFluid !== undefined) ? buildingData.maxFluid : 50000;

        // VOLUME
        if(buildingData.waterUsed !== undefined)
        {
                for(let i = 0; i < inventoryIn.length; i++)
                {
                    if(inventoryIn[i] !== null && inventoryIn[i].className === this.baseLayout.itemsData.Desc_Water_C.className)
                    {
                        currentFluid = inventoryIn[i].qty;
                        break;
                    }
                }

                currentFluid        = Math.min(currentFluid, maxFluid);
                currentFluid        = +(Math.round((currentFluid / 1000) * 100) / 100);
                maxFluid            = +(Math.round((maxFluid / 1000) * 100) / 100);
        }

        /*
        if(buildingData.category === 'generator')
        {
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorNuclear/Build_GeneratorNuclear.Build_GeneratorNuclear_C')
            {
                let inventoryOut    = this.baseLayout.getObjectInventory(currentObject, 'mOutputInventory');
                    content        += '<div class="text-center"><table class="mr-auto ml-auto mb-3"><tr><td>' + this.baseLayout.setInventoryTableSlot(inventoryIn, 2, 64) + '</td><td><i class="fas fa-arrow-alt-right"></i></td><td>' + this.baseLayout.setInventoryTableSlot(inventoryOut, 1, 64) + '</td></tr></table></div>';
            }
            else
            {
                if(buildingData.waterUsed !== undefined)
                {
                    content        += '<div class="mt-3 mb-3">' + this.baseLayout.setInventoryTableSlot(inventoryIn, 2, 64, 'justify-content-center') + '</div>';
                }
                else
                {
                    content        += '<div class="mt-3 mb-3">' + this.baseLayout.setInventoryTableSlot(inventoryIn, 1, 64, 'justify-content-center') + '</div>';
                }
            }


        }
        */

        let content     = [];

            // HEADER
            content.push('<div style="position: absolute;margin-top: 5px;width: 100%;text-align: center;color: #FFFFFF;text-shadow: 2px 2px 2px #000000;">');
            content.push('<strong>' + buildingData.name + '</strong>');
            content.push('</div>');

            // INPUT
            content.push('<div style="position: absolute;margin-top: 19px;margin-left: 324px; width: 154px;height: 305px;color: #5b5b5b;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
            content.push('<div style="height: 16px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/outputTop.png?v=' + this.baseLayout.scriptVersion + ') no-repeat;"></div>');
            content.push('<div style="padding: 0 16px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/outputMiddle.png?v=' + this.baseLayout.scriptVersion + ') repeat-y;">');

                content.push('<div style="border-bottom: 1px solid #e7e7e7;line-height: 1;font-size: 13px;letter-spacing: -0.05em;" class="pb-2 mb-2">');

                if(fuelClass !== null)
                {
                    let fuelItem = this.baseLayout.getItemDataFromClassName(fuelClass.pathName);

                        if(fuelItem !== null && fuelItem.energy !== undefined)
                        {
                            fuelEnergyValue = fuelItem.energy;

                            content.push('<strong>' + fuelItem.name + '</strong><br />');
                        }

                        if(fuelEnergyValue !== null)
                        {
                            let consumptionRatio = (60 / (fuelEnergyValue / powerGenerated) * Math.pow(clockSpeed, -1/1.3));

                            if(fuelItem.category === 'liquid')
                            {
                                content.push('<span class="small"><strong class="text-warning">' + +(Math.round((consumptionRatio / 1000) * 100) / 100) + 'm³</strong> per minute</span><br />');
                            }
                            else
                            {
                                content.push('<span class="small"><strong class="text-warning">' + +(Math.round(consumptionRatio * 100) / 100) + '</strong> Parts per minute</span><br />');
                            }
                        }
                }

                content.push('</div>');

                content.push('<table class="w-100 mb-3"><tr>');

                content.push('<td class="text-center"><div class="small">Fuel</div>');
                    content.push('<table class="mx-auto"><tr><td>' + this.baseLayout.getInventoryImage(inventoryIn[0], 48) + '</td></tr></table>');
                content.push('</td>');

                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorNuclear/Build_GeneratorNuclear.Build_GeneratorNuclear_C')
                {
                    let inventoryOut    = this.baseLayout.getObjectInventory(currentObject, 'mOutputInventory');

                        content.push('<td class="text-center"><i class="fas fa-arrow-alt-right"></i></td>');
                        content.push('<td class="text-center"><div class="small">Waste</div>');
                            content.push('<table class="mx-auto"><tr><td>' + this.baseLayout.getInventoryImage(inventoryOut[0], 48) + '</td></tr></table>');
                        content.push('</td>');
                }

                content.push('</tr></table>');

                if(fuelClass !== null)
                {
                    let fuelItem = this.baseLayout.getItemDataFromClassName(fuelClass.pathName);

                    if(fuelItem !== null && fuelItem.energy !== undefined)
                    {
                        fuelEnergyValue = fuelItem.energy;

                        let currentProgress = Math.round(this.baseLayout.getObjectProperty(currentObject, 'mCurrentFuelAmount', 0) / fuelEnergyValue * 100);
                            content.push('<div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" role="progressbar" style="width: ' + currentProgress + '%"></div></div>');
                            content.push('<span class="small">Producing - <span class="text-warning">' + currentProgress + '%</span></span>');
                    }
                }

                let tooltipFooterOptions = {circuitId: this.baseLayout.getObjectCircuitID(currentObject), clockSpeed: clockSpeed, powerGenerated: powerGenerated, fuelEnergyValue: fuelEnergyValue};
                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorNuclear/Build_GeneratorNuclear.Build_GeneratorNuclear_C')
                    {
                        tooltipFooterOptions.mPowerProductionExponent = 1.321928;
                    }
                    content.push(this.setTooltipFooter(tooltipFooterOptions));

            content.push('</div>');
            content.push('<div style="height: 37px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/outputBottom.png?v=' + this.baseLayout.scriptVersion + ') no-repeat;padding-top: 18px;"><strong style="font-size: 12px;">INPUT</strong></div>');
            content.push('</div></div>');
            content.push('</div>');

            // VOLUME
            if(buildingData.waterUsed !== undefined)
            {
                // DOME
                if(this.baseLayout.itemsData.Desc_Water_C.color !== undefined && currentFluid > 0)
                {
                    let volumeHeight = Math.round(currentFluid / maxFluid * 96);

                        content.push('<div style="position: absolute;margin-top: 41px;margin-left: 107px;">');
                        content.push('<div style="position: relative;width: 96px;height: 96px;border-radius: 50%;overflow: hidden;"><div style="margin-top: ' + (96 - volumeHeight) + 'px;height: ' + volumeHeight + 'px;background-color:' + this.baseLayout.itemsData.Desc_Water_C.color + ';"></div></div>');
                        content.push('</div>');
                }
                content.push('<div style="position: absolute;margin-top: 41px;margin-left: 107px;width: 96px;height: 96px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/liquidDome.png?v=' + this.baseLayout.scriptVersion + '" width="96" height="96" /></div>');

                // AMOUNT
                content.push('<div style="position: absolute;margin-top: 175px;margin-left: 107px;width: 96px;color: #FFFFFF;text-align: center;font-size: 13px;">');
                content.push('<span class="small">Current amount:</span><br /><strong>' + currentFluid + ' / ' + maxFluid + 'm³</strong>');
                content.push('</div>');

                // CONSUMPTION
                let waterConsumed   = buildingData.waterUsed * Math.pow(clockSpeed, -1/1.3);
                    content.push('<div style="position: absolute;margin-top: 245px;margin-left: 107px;width: 96px;text-align: center;font-size: 13px;color: #5b5b5b;">');
                    content.push('<span class="small">Consumption:</span><br /><i class="fas fa-industry-alt"></i><br /><strong>' + waterConsumed + 'm³</strong>');
                    content.push('</div>');
            }
            else
            {
                if(buildingData.image !== undefined)
                {
                    content.push('<div style="position: absolute;margin-top: 41px;margin-left: 32px;">');
                    content.push('<img src="' + buildingData.image + '" class="img-fluid mx-auto" style="width: 256px;" />');
                    content.push('</div>');
                }
            }

            // FOOTER
            content.push(this.getOverclockingPanel(currentObject));
            content.push(this.getStandByPanel(currentObject));

        if(buildingData.waterUsed !== undefined)
        {
            return '<div style="position: relative;width: 500px;height: 490px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/generatorWaterBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
        }

        return '<div style="position: relative;width: 500px;height: 490px;background: url(' + this.baseLayout.staticUrl + '/img/mapTooltip/generatorBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }

    setBuildingTooltipContent(currentObject, buildingData)
    {
        let content     = [];
        let direction   = '';
        let inverted    = '';

        if(currentObject.className.search('Building/Foundation/Build_Foundation') !== -1 || currentObject.className.search('Building/Ramp/Build_Ramp') !== -1)
        {
            let rotation  = BaseLayout_Math.getQuaternionToEuler(currentObject.transform.rotation);
            let angle     = rotation.yaw - 45;

                if(currentObject.className.search('Building/Ramp/Build_Ramp_') !== -1)
                {
                    angle -= 90;
                }

                direction = '<i class="fas fa-location-arrow" style="transform: rotate(' + angle + 'deg)"></i>&nbsp;&nbsp;&nbsp;';
        }

        content.push('<div><strong>' + direction + inverted +  buildingData.name + '</strong></div>');

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/RadarTower/Build_RadarTower.Build_RadarTower_C')
        {
            for(let j = 0; j < currentObject.properties.length; j++)
            {
                if(currentObject.properties[j].name === 'mMapText')
                {
                    if(currentObject.properties[j].historyType === 3)
                    {
                        let mapText     = currentObject.properties[j].sourceFmt.value;
                            content.push(mapText.replace('{Name}', currentObject.properties[j].arguments[0].argumentValue.value));
                    }
                }
            }
        }

        if(buildingData.category === 'foundation' || buildingData.category === 'wall' || buildingData.category === 'walkway')
        {
            content.push('Altitude: ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentObject.transform.translation[2] / 100)) + 'm');
        }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C')
        {
            let buildingName = this.baseLayout.getSaveGameSign(currentObject, 'mStationName');
                if(buildingName !== null)
                {
                    content.push('<div><em>' + buildingName + '</em></div>');
                }
        }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
        {
            let locomotiveName  = this.baseLayout.getSaveGameSign(currentObject, 'mTrainName');
                if(locomotiveName !== null)
                {
                    content.push('<div><em>' + locomotiveName + '</em></div>');
                }
        }

        if(buildingData.image !== undefined)
        {
            content.push('<div class="pt-3"><img src="' + buildingData.image + '" style="width: 128px;height: 128px;" /></div>');
        }

        return '<div class="d-flex" style="' + this.genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }

    getOverclockingPanel(currentObject, top = 370, left = 32)
    {
        let content             = [];
        let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
        let potentialInventory  = this.baseLayout.getObjectInventory(currentObject, 'mInventoryPotential');

            content.push('<div style="position: absolute;margin-top: ' + top + 'px;margin-left: ' + left + 'px; width: 325px;height: 80px;">');
            content.push('<table class="w-100"><tr>');
            content.push('<td><span class="text-small">Clockspeed:</span><br /><strong class="lead text-warning">' + +(Math.round(clockSpeed * 10000) / 100) + ' %</strong></td>');

            if(potentialInventory !== null)
            {
                for(let i = 0; i < potentialInventory.length; i++)
                {
                    content.push('<td width="62">');
                    content.push('<div class="text-center"><table class="mr-auto ml-auto"><tr><td>' + this.baseLayout.setInventoryTableSlot([potentialInventory[i]], null, 56, '', this.baseLayout.itemsData.Desc_CrystalShard_C.image) + '</td></tr></table></div>');
                    content.push('</td>');
                }
            }

            content.push('</tr><tr>');
            content.push('<td><div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" role="progressbar" style="width: ' + Math.min(100, (clockSpeed * 10000) / 100) + '%"></div></div></td>');

            if(potentialInventory !== null)
            {
                for(let i = 0; i < potentialInventory.length; i++)
                {
                    let potentialProgress = Math.min(100, ((clockSpeed * 10000) / 100 - (100 + (i * 50))) * 2);
                        content.push('<td><div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" role="progressbar" style="width: ' + potentialProgress + '%"></div></div></td>');
                }
            }

            content.push('</tr></table>');
            content.push('</div>');

        return content.join('');
    }

    getStandByPanel(currentObject, top = 360, left = 415)
    {
        let content             = [];
        let imageFile           = 'standByOn.png';
            if(this.baseLayout.getBuildingIsOn(currentObject) === false)
            {
                imageFile = 'standByOff.png';
            }

            content.push('<div style="position: absolute;margin-top: ' + top + 'px;margin-left: ' + left + 'px;">');
                content.push('<img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/' + imageFile + '?v=' + this.baseLayout.scriptVersion + '" />');
            content.push('</div>');

        return content.join('');
    }

    setInventoryFuel(currentObject)
    {
        let content = [];
            content.push('<div style="margin: 0 auto;width: 115px;height: 106px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/vehicleFuelBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat;padding: 38px;">');
                content.push(this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectInventory(currentObject, 'mFuelInventory'), 1, 40));
            content.push('</div>');

        return content.join('');
    }

    setStationLoadMode(currentObject)
    {
        let mIsInLoadMode   = this.baseLayout.getObjectProperty(currentObject, 'mIsInLoadMode');
        let imageFile       = 'stationLoadMode.png';
            if(mIsInLoadMode !== null && mIsInLoadMode === 0)
            {
                imageFile = 'stationUnloadMode.png';
            }

        return '<div style="margin: 0 auto;width: 153px;height: 106px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/' + imageFile + '?v=' + this.baseLayout.scriptVersion + ') no-repeat;"></div>';
    }

    setLiquidDome(backgroundImageSize, currentFluid, maxFluid, color)
    {
        let content             = [];
            backgroundImageSize = Math.min(backgroundImageSize, 230);
        let imageRatio          = backgroundImageSize / 230
        let domeImageSize       = 196 * imageRatio;

        let volumeHeight        = Math.round(currentFluid / maxFluid * domeImageSize);

            content.push('<div style="height: ' + backgroundImageSize + 'px;width:' + backgroundImageSize + 'px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/liquidBackground.png?v=' + this.baseLayout.scriptVersion + ');" class="d-inline-block">');
                content.push('<div style="position: absolute;margin-top: ' + 12 * imageRatio + 'px;margin-left: ' + 17 * imageRatio + 'px;width: ' + domeImageSize + 'px;height: ' + domeImageSize + 'px;border-radius: 50%;overflow: hidden;">');
                    content.push('<div style="margin-top: ' + (domeImageSize - volumeHeight) + 'px;height: ' + volumeHeight + 'px;background-color:' + color + ';"></div>');
                content.push('</div>');
                content.push('<div style="position: absolute;margin-top: ' + 12 * imageRatio + 'px;margin-left: ' + 17 * imageRatio + 'px;">');
                    content.push('<img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/liquidDome.png?v=' + this.baseLayout.scriptVersion + '" width="' + domeImageSize + '" height="' + domeImageSize + '" />');
                content.push('</div>');
            content.push('</div>');

        return content.join('');
    }

    setTooltipFooter(options)
    {
        let content = [];
            content.push('<div class="mt-1"><table class="mr-auto ml-auto"><tr>');

                if(options.circuitId !== undefined && options.circuitId !== null)
                {
                    content.push('<td class="text-center mb-1 px-1"><i class="fas fa-plug"></td>');
                }
                if(options.powerUsed !== undefined || options.powerGenerated !== undefined)
                {
                    content.push('<td class="text-center mb-1 px-1"><i class="fas fa-bolt"></td>');
                }
                if(options.craftingTime !== undefined && options.clockSpeed !== undefined)
                {
                    content.push('<td class="text-center mb-1 px-1"><i class="fas fa-stopwatch"></i></td>');
                }
                if(options.fuelEnergyValue !== undefined && options.fuelEnergyValue !== null && options.powerGenerated !== undefined && options.clockSpeed !== undefined)
                {
                    content.push('<td class="text-center mb-1 px-1"><i class="fas fa-stopwatch"></i></td>');
                }

            content.push('</tr><tr>');

                if(options.circuitId !== undefined && options.circuitId !== null)
                {
                    content.push('<td class="text-center text-warning small px-1">#' + options.circuitId.split('_').pop() + '</td>');
                }
                if(options.powerUsed !== undefined)
                {
                    content.push('<td class="text-center text-warning small px-1">' + +(Math.round(options.powerUsed * 100) / 100) + 'MW</td>');
                }
                if(options.powerGenerated !== undefined)
                {
                    content.push('<td class="text-center text-warning small px-1">' + +(Math.round(options.powerGenerated * 100) / 100) + 'MW</td>');
                }
                if(options.craftingTime !== undefined && options.clockSpeed !== undefined)
                {
                    content.push('<td class="text-center text-warning small px-1">' + +(Math.round(options.craftingTime * options.clockSpeed * 100) / 100) + 's</td>');
                }
                if(options.fuelEnergyValue !== undefined && options.fuelEnergyValue !== null && options.powerGenerated !== undefined && options.clockSpeed !== undefined)
                {
                    let mPowerProductionExponent = 1.3;
                        if(options.mPowerProductionExponent !== undefined)
                        {
                            mPowerProductionExponent = options.mPowerProductionExponent;
                        }

                    content.push('<td class="text-center text-warning small px-1">' + +(Math.round((options.fuelEnergyValue / options.powerGenerated) * Math.pow(options.clockSpeed, -1/mPowerProductionExponent) * 100) / 100) + 's</td>');
                }

            content.push('</tr></table></div>');

        return content.join('');
    }
}