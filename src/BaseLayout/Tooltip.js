/* global Intl, Sentry, parseFloat */
import BaseLayout_Math                          from '../BaseLayout/Math.js';

import SubSystem_Circuit                        from '../SubSystem/Circuit.js';
import SubSystem_Fauna                          from '../SubSystem/Fauna.js';
import SubSystem_Unlock                         from '../SubSystem/Unlock.js';

import Building_AwesomeSink                     from '../Building/AwesomeSink.js';
import Building_Beacon                          from '../Building/Beacon.js';
import Building_Conveyor                        from '../Building/Conveyor.js';
import Building_DroneStation                    from '../Building/DroneStation.js';
import Building_FrackingSmasher                 from '../Building/FrackingSmasher.js';
import Building_GeneratorGeoThermal             from '../Building/GeneratorGeoThermal.js';
import Building_Locomotive                      from '../Building/Locomotive.js';
import Building_Pipeline                        from '../Building/Pipeline.js';
import Building_PowerStorage                    from '../Building/PowerStorage.js';
import Building_PowerSwitch                     from '../Building/PowerSwitch.js';
import Building_RadarTower                      from '../Building/RadarTower.js';
import Building_Sign                            from '../Building/Sign.js';
import Building_SmartSplitter                   from '../Building/SmartSplitter.js';
import Building_SpaceElevator                   from '../Building/SpaceElevator.js';
import Building_TrainStation                    from '../Building/TrainStation.js';

export default class BaseLayout_Tooltip
{
    static get styleLabels(){ return 'height: 11px;color: #5b5b5b;background: #e6e6e4;border-radius: 4px;line-height: 11px;text-align: center;font-size: 10px;'; }
    static get defaultTextStyle(){ return 'color: #FFFFFF;text-shadow: 1px 1px 1px #000000;line-height: 16px;font-size: 12px;'; }
    static get uiGradient(){ return 'background: #0f0f0f;background: linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 18%, rgba(15,15,15,1) 20%, rgba(15,15,15,1) 40%, rgba(0,0,0,1) 42%, rgba(0,0,0,1) 58%, rgba(15,15,15,1) 60%, rgba(15,15,15,1) 80%, rgba(0,0,0,1) 82%, rgba(0,0,0,1) 100%);'; }

    constructor(options)
    {
        this.baseLayout                             = options.baseLayout;
        this.target                                 = options.target;

        this.genericTooltipBackgroundStyle          = 'border: 25px solid #7f7f7f;border-image: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/genericTooltipBackground.png?v=' + this.baseLayout.scriptVersion + ') 25 repeat;background: #7f7f7f;margin: -7px;' + BaseLayout_Tooltip.defaultTextStyle;
        this.genericStorageBackgroundStyle          = 'border: 19px solid #373737;border-image: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/UI_Storage.png?v=' + this.baseLayout.scriptVersion + ') 20 repeat;background: #373737;background-clip: padding-box;';
        this.genericFluidStorageBackgroundStyle     = 'width: 270px;height: 474px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/fluidStorageBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;';
        this.genericPowerStorageBackgroundStyle     = 'width: 212px;height: 450px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_PowerStorage_BG.png?v=' + this.baseLayout.scriptVersion + ');margin: -7px;';
        this.genericPowerSwicthBackgroundStyle      = 'width: 500px;height: 322px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_PowerSwitch_BG.png?v=' + this.baseLayout.scriptVersion + ');margin: -7px;';
        this.genericProductionBackgroundStyle       = 'width: 500px;height: 510px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_Manufacturer_BG.png?v=' + this.baseLayout.scriptVersion + ');margin: -7px;';
        this.genericExtractionBackgroundStyle       = 'width: 500px;height: 470px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/Extractor_BG.png?v=' + this.baseLayout.scriptVersion + ');margin: -7px;';
        this.genericFrackerSmasherBackgroundStyle   = 'width: 500px;height: 380px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/Fracker_Smasher_BG.png?v=' + this.baseLayout.scriptVersion + ');margin: -7px;';
        this.genericFrackerExtractorBackgroundStyle = 'width: 500px;height: 235px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/Fracker_Extractor_BG.png?v=' + this.baseLayout.scriptVersion + ');margin: -7px;';
        this.genericGeneratorBackgroundStyle        = 'width: 500px;height: 470px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/generatorBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;';
        this.fluidGeneratorBackgroundStyle          = 'width: 500px;height: 470px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/generatorFluidBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;';
        this.genericPumpBackground                  = 'width: 500px;height: 370px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/pumpBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;';
    }

    getTooltip(currentObject)
    {
        let faunaData = this.baseLayout.faunaSubsystem.getDataFromClassName(currentObject.className);

            if(faunaData !== null)
            {
                faunaData.health = this.baseLayout.faunaSubsystem.getCurrentHealth(currentObject);

                return this.setBuildingTooltipContent(currentObject, faunaData);
            }
            else
            {
                if(Building_Conveyor.isConveyorBelt(currentObject) || currentObject.className.includes('/Build_ConveyorLiftMk'))
                {
                    return this.setBeltTooltipContent(currentObject);
                }
                if(Building_Pipeline.isPipeline(currentObject))
                {
                    return Building_Pipeline.getTooltip(this.baseLayout, this, currentObject);
                }

                switch(currentObject.className)
                {
                    case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                        if(this.baseLayout.players[currentObject.pathName] !== undefined)
                        {
                            let emotes = [
                                    '/img/signIcons/IconDesc_EmoteWave_256.png', '/img/signIcons/IconDesc_EmoteScissors_256.png', '/img/signIcons/IconDesc_EmoteRock_256.png', '/img/signIcons/IconDesc_EmotePoint_256.png',
                                    '/img/signIcons/IconDesc_EmotePaper_256.png', '/img/signIcons/IconDesc_EmoteHeart_256.png', '/img/signIcons/IconDesc_EmoteFingerGuns_256.png', '/img/signIcons/IconDesc_EmoteFacepalm_256.png',
                                    '/img/signIcons/Emote_Clap_256.png', '/img/signIcons/Emote_BuildGunSpin_256.png'
                                ];
                                return this.setBuildingTooltipContent(currentObject, {
                                    name    : this.baseLayout.players[currentObject.pathName].getDisplayName(),
                                    image   : this.baseLayout.staticUrl + emotes[Math.floor(Math.random() * emotes.length)],
                                    health  : this.baseLayout.players[currentObject.pathName].getCurrentHealth()
                                });
                        }
                        break;
                    case '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C':
                        let mDecorationDescriptor = this.baseLayout.getObjectProperty(currentObject, 'mDecorationDescriptor');
                            if(mDecorationDescriptor !== null)
                            {
                                let currentItemData = this.baseLayout.getItemDataFromClassName(mDecorationDescriptor.pathName);
                                    if(currentItemData !== null)
                                    {
                                        return this.setBuildingTooltipContent(currentObject, currentItemData);
                                    }
                            }
                        break;
                    case '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C':
                    case '/Script/FactoryGame.FGItemPickup_Spawnable':
                    case '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_SpitterParts.BP_SpitterParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaSpitterParts.BP_AlphaSpitterParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_HogParts.BP_HogParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_CrabEggParts.BP_CrabEggParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaHogParts.BP_AlphaHogParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_StingerParts.BP_StingerParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaStingerParts.BP_AlphaStingerParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_EliteStingerParts.BP_EliteStingerParts_C':
                        let currentItemData = null;
                            if(this.baseLayout.itemsData[this.target.options.itemId] !== undefined)
                            {
                                currentItemData = JSON.parse(JSON.stringify(this.baseLayout.itemsData[this.target.options.itemId]));
                            }
                            if(this.baseLayout.toolsData[this.target.options.itemId] !== undefined)
                            {
                                currentItemData = JSON.parse(JSON.stringify(this.baseLayout.toolsData[this.target.options.itemId]));
                            }
                            if(currentItemData !== null && currentItemData !== undefined)
                            {
                                let currentContent  = '';
                                    currentContent += new Intl.NumberFormat(this.baseLayout.language).format(this.target.options.itemQty) + 'x ' + currentItemData.name + '<br />';
                                    currentContent += 'Altitude: ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentObject.transform.translation[2] / 100)) + 'm';
                                    currentItemData.name = currentContent;

                                    return this.setBuildingTooltipContent(currentObject, currentItemData);
                            }
                        break;
                    case '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C':
                        return this.setBuildingStorageTooltipContent(currentObject, {name: 'Loot Crate', category: 'storage'});
                    case '/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C':
                        return Building_Beacon.getTooltip(this.baseLayout, currentObject, this.genericTooltipBackgroundStyle);
                    case '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C':
                        return this.setBuildingExtractionTooltipContent(currentObject, this.baseLayout.toolsData.BP_ItemDescriptorPortableMiner_C);
                    case '/Game/FactoryGame/Buildable/Factory/PowerSwitch/Build_PowerSwitch.Build_PowerSwitch_C':
                        return this.setBuildingPowerSwitchTooltipContent(currentObject);
                    default:
                        let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                            if(buildingData !== null)
                            {
                                switch(currentObject.className)
                                {
                                    case '/Game/FactoryGame/Buildable/Factory/OilPump/Build_OilPump.Build_OilPump_C':
                                    case '/Game/FactoryGame/Buildable/Factory/WaterPump/Build_WaterPump.Build_WaterPump_C':
                                        return this.setBuildingPumpTooltipContent(currentObject, buildingData);
                                    case '/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C':
                                    case '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C':
                                        return this.setBuildingFluidStorageTooltipContent(currentObject, buildingData);
                                    case '/Game/FactoryGame/Buildable/Factory/PowerStorage/Build_PowerStorageMk1.Build_PowerStorageMk1_C':
                                        return this.setBuildingPowerStorageTooltipContent(currentObject, buildingData);
                                    case '/Game/FactoryGame/Buildable/Factory/FrackingSmasher/Build_FrackingSmasher.Build_FrackingSmasher_C':
                                        return this.setBuildingFrackerSmasherTooltipContent(currentObject, buildingData);
                                    case '/Game/FactoryGame/Buildable/Factory/FrackingExtractor/Build_FrackingExtractor.Build_FrackingExtractor_C':
                                        return this.setBuildingFrackerExtractorTooltipContent(currentObject, buildingData);
                                    case '/Game/FactoryGame/Buildable/Factory/DroneStation/Build_DroneStation.Build_DroneStation_C':
                                        return Building_DroneStation.getTooltip(this.baseLayout, currentObject, buildingData);
                                    case '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C':
                                        return Building_GeneratorGeoThermal.getTooltip(this.baseLayout, currentObject, buildingData);
                                    case '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C':
                                        return Building_Locomotive.getTooltip(this.baseLayout, currentObject, buildingData, this.genericTooltipBackgroundStyle);
                                    case '/Game/FactoryGame/Buildable/Factory/RadarTower/Build_RadarTower.Build_RadarTower_C':
                                        return Building_RadarTower.getTooltip(this.baseLayout, currentObject, buildingData);
                                    case '/Game/FactoryGame/Buildable/Factory/ResourceSink/Build_ResourceSink.Build_ResourceSink_C':
                                        return Building_AwesomeSink.getTooltip(this.baseLayout, currentObject, buildingData);
                                    case '/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C':
                                        return Building_SpaceElevator.getTooltip(this.baseLayout, currentObject, buildingData);
                                }
                                switch(buildingData.category)
                                {
                                    case 'powerPole':
                                        return this.setPowerPoleTooltipContent(currentObject, buildingData);
                                    case 'sign':
                                        return Building_Sign.getTooltip(this.baseLayout, currentObject, buildingData);;
                                    case 'extraction':
                                        return this.setBuildingExtractionTooltipContent(currentObject, buildingData);
                                    case 'production':
                                        return this.setBuildingProductionTooltipContent(currentObject, buildingData);
                                    case 'generator':
                                        return this.setBuildingGeneratorTooltipContent(currentObject, buildingData);
                                    case 'storage':
                                    case 'dockstation':
                                    case 'vehicle':
                                        return this.setBuildingStorageTooltipContent(currentObject, buildingData);
                                    default:
                                        return this.setBuildingTooltipContent(currentObject, buildingData);
                                }
                            }
                }
            }

        return null;
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
        let splineData      = BaseLayout_Math.extractSplineData(this.baseLayout, currentObject);
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
            if(beltData !== null)
            {
                content.push('<div><strong>' + beltData.name + distance + '</strong></div>');
            }
            else
            {
                content.push('<div><strong>' + currentObject.className + distance + '</strong></div>');
            }

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
            powerUsed           = buildingData.powerUsed * clockSpeed;
                //if(this.baseLayout.saveGameParser.header.saveVersion < 29)
                //{
                    powerUsed = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
                //}

            extractionRate     *= clockSpeed;
        }

        if(buildingData.mManufacturingSpeedMultiplier !== undefined)
        {
            extractionRate *= buildingData.mManufacturingSpeedMultiplier;
        }

        let content     = [];

            // TOP
            content.push('<div style="position: absolute;margin-top: 10px;margin-left: 213px; width: 175px;height: 135px;border-radius: 10px;color: #FFFFFF;padding-bottom: 10px;' + BaseLayout_Tooltip.uiGradient + '">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
                content.push('<strong>' + buildingData.name + '</strong>');

                let currentProgress = Math.min(100, Math.round(this.baseLayout.getObjectProperty(currentObject, 'mCurrentExtractProgress', 0) * 10000) / 100);
                    content.push('<div class="progress rounded-sm mx-3 mt-2" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + currentProgress + '%"></div></div>');
                    content.push('<span style="font-size: 10px;" class="d-block mb-3">Mining - <span class="text-warning">' + currentProgress + '%</span></span>');

                if(currentObject.className !== '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
                {
                    let circuitSubSystem    = new SubSystem_Circuit({baseLayout: this.baseLayout});
                    let objectCircuit       = circuitSubSystem.getObjectCircuit(currentObject);
                        content.push(this.setTooltipFooter({circuit: objectCircuit, craftingTime: craftingTime, clockSpeed: clockSpeed, powerUsed: powerUsed, singleLine: true}));
                }

            content.push('</div></div>');
            content.push('</div>');

            // BOTTOM
            content.push('<div style="position: absolute;margin-top: 160px;margin-left: 213px; width: 175px;height: 125px;background: #FFFFFF;border: 2px solid #373737;border-radius: 10px;line-height: 1;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

                if(extractResourceNode !== null && itemType !== null)
                {
                    let inventoryOut    = this.baseLayout.getObjectInventory(currentObject, 'mOutputInventory');
                        content.push('<div class="text-center"><table class="mx-auto mb-2"><tr><td>' + this.baseLayout.setInventoryTableSlot(inventoryOut, 1, 64, 'justify-content-center') + '</td></tr></table></div>');

                    content.push('<div><strong>' + this.baseLayout.itemsData[itemType].name + '</strong></div>');
                    content.push('<span class="small"><strong class="text-warning">' + +(Math.round(extractionRate * 100) / 100) + '</strong> per minute</span>');
                }

            content.push('</div></div>');
            content.push('</div>');
            content.push('<div style="position: absolute;margin-top: 290px;margin-left: 270px; width: 60px;' + BaseLayout_Tooltip.styleLabels + '"><strong>OUTPUT</strong></div>');

            content.push('<div style="position: absolute;margin-top: 136px;margin-left: 284px; width: 32px;height: 32px;color: #FFFFFF;background: #404040;border-radius: 50%;line-height: 32px;text-align: center;font-size: 18px;box-shadow: 0 0 2px 0px rgba(0,0,0,0.75);"><i class="fas fa-arrow-alt-down"></i></div>');


        if(currentObject.className !== '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
        {
            // HANDLE
            content.push('<div style="position: absolute;margin-top: 15px;margin-left: 102px; width: 96px;height: 310px;overflow: hidden;">');
            content.push('<img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/minerHandle.jpg" id="mapTooltipMinerHandle" style="transform: translate3d(0, 0, 0);animation: loop 1s linear infinite;" />');
            content.push('<style type="text/css">@keyframes loop {0% {transform: translateY(-303px);} 100% {transform: translateY(0);}}</style>');
            content.push('</div>');

            // FOOTER
            content.push(this.getOverclockingPanel(currentObject, 356, 12));
            content.push(BaseLayout_Tooltip.getStandByPanel(this.baseLayout, currentObject, 365, 385, 434, 387));
        }

        return '<div style="' + this.genericExtractionBackgroundStyle + '">' + content.join('') + '</div>';
    }

    setBuildingFrackerSmasherTooltipContent(currentObject, buildingData)
    {
        let clockSpeed  = this.baseLayout.getClockSpeed(currentObject);
        let powerUsed   = buildingData.powerUsed * clockSpeed;
            //if(this.baseLayout.saveGameParser.header.saveVersion < 29)
            //{
                powerUsed = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
            //}

        let satellites  = Building_FrackingSmasher.getSatellites(this.baseLayout, currentObject);
        let potential   = 0;

        let content     = [];

            // TOP
            content.push('<div style="position: absolute;margin-top: 25px;margin-left: 90px; width: 195px;height: 110px;border-radius: 10px;color: #FFFFFF;padding-bottom: 10px;' + BaseLayout_Tooltip.uiGradient + '">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
                content.push('<strong style="white-space: normal;">' + buildingData.name + '</strong>');

                let circuitSubSystem    = new SubSystem_Circuit({baseLayout: this.baseLayout});
                let objectCircuit       = circuitSubSystem.getObjectCircuit(currentObject);
                    content.push(this.setTooltipFooter({circuit: objectCircuit, powerUsed: powerUsed, singleLine: true}));

                content.push('<ins class="small">Extractors connected:</ins>');
                content.push('<div class="small text-warning">');

                let connectedContent    = [];
                let unconnectedContent  = [];
                let extractorRates      = {impure: 30000, normal: 60000, pure: 120000};
                    if(this.baseLayout.buildingsData.Build_FrackingExtractor_C !== undefined)
                    {
                        extractorRates = this.baseLayout.buildingsData.Build_FrackingExtractor_C.extractionRate;
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
                content.push('<strong class="small"><span class="text-info">' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(potential * clockSpeed / 100) / 10) + '</span> m³ per minute</strong>');

            content.push('</div></div>');
            content.push('</div>');

            // FOOTER
            content.push(this.getOverclockingPanel(currentObject, 256, 12));
            content.push(BaseLayout_Tooltip.getStandByPanel(this.baseLayout, currentObject, 265, 385, 334, 387));

        return '<div style="' + this.genericFrackerSmasherBackgroundStyle + '">' + content.join('') + '</div>';
    }

    setBuildingFrackerExtractorTooltipContent(currentObject, buildingData)
    {
        let extractResourceNode     = this.baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
        let itemType                = null;
        let purity                  = 'normal';

            if(extractResourceNode !== null && this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
            {
                if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity !== undefined)
                {
                    purity = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.purity;
                }

                if(this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type !== undefined)
                {
                    itemType = this.baseLayout.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.type;
                    if(itemType === 'Desc_LiquidOilWell_C')
                    {
                        itemType = 'Desc_LiquidOil_C';
                    }
                }
            }

        let craftingTime        = 60 / buildingData.extractionRate[purity];
        let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
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

            // TOP
            content.push('<div style="position: absolute;margin-top: 6px;margin-left: 8px; width: 155px;height: 110px;border-radius: 10px;color: #FFFFFF;padding-bottom: 10px;' + BaseLayout_Tooltip.uiGradient + '">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
                content.push('<strong class="small">' + buildingData.name + '</strong>');

                let currentProgress = Math.min(100, Math.round(this.baseLayout.getObjectProperty(currentObject, 'mCurrentExtractProgress', 0) * 10000) / 100);
                    content.push('<div class="progress rounded-sm mx-3 mt-2" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + currentProgress + '%"></div></div>');
                    content.push('<span style="font-size: 10px;" class="d-block mb-2">Extracting - <span class="text-warning">' + currentProgress + '%</span></span>');

            content.push(this.setTooltipFooter({craftingTime: craftingTime, clockSpeed: clockSpeed, singleLine: true}));
            content.push('</div></div>');
            content.push('</div>');

            // BOTTOM
            content.push('<div style="position: absolute;margin-top: 130px;margin-left: 8px; width: 155px;height: 90px;background: #FFFFFF;border: 2px solid #373737;border-radius: 10px;line-height: 1;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

                if(extractResourceNode !== null && itemType !== null)
                {
                    content.push('<div class="text-center"><table class="mx-auto mb-2"><tr><td><div class="d-flex flex-row" style="position:relative;margin: 1px;width: 36px;height: 36px;border: 1px solid #000000;border-radius:50%;padding: 5px;background-color: #FFFFFF;"><img src="' + this.baseLayout.itemsData[itemType].image + '" class="img-fluid" /></div></td></tr></table></div>');
                    content.push('<div><strong>' + this.baseLayout.itemsData[itemType].name + '</strong></div>');
                    content.push('<span class="small"><strong class="text-warning">' + +(Math.round((productionRatio / 1000) * 100) / 100) + 'm³</strong> per minute</span>');
                }

            content.push('</div></div>');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: 111px;margin-left: 75px; width: 24px;height: 24px;color: #FFFFFF;background: #404040;border-radius: 50%;line-height: 24px;text-align: center;font-size: 14px;box-shadow: 0 0 2px 0px rgba(0,0,0,0.75);"><i class="fas fa-arrow-alt-down"></i></div>');

        // DOME
        if(extractResourceNode !== null && itemType !== null && this.baseLayout.itemsData[itemType].color !== undefined)
        {
            content.push('<div style="position: absolute;margin-top: 9px;margin-left: 358px;">');
                if(this.baseLayout.itemsData[itemType].category === 'gas')
                {
                    content.push(this.setGasDome(112, currentFluid, maxFluid, this.baseLayout.itemsData[itemType].color));
                }
                else
                {
                    content.push(this.setLiquidDome(112, currentFluid, maxFluid, this.baseLayout.itemsData[itemType].color));
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
        content.push('<div style="position: absolute;margin-top: 13px;margin-left: 231px;width: 102px;height: 102px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/flowIndicator.png?v=' + this.baseLayout.scriptVersion + '" style="width: 102px;height: 102px;transform: rotate(-135deg);" /></div>');
        content.push('<div style="position: absolute;margin-top: 13px;margin-left: 231px;width: 102px;height: 102px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/flowGlass.png?v=' + this.baseLayout.scriptVersion + '" style="width: 102px;height: 102px;" /></div>');

        return '<div style="' + this.genericFrackerExtractorBackgroundStyle + '">' + content.join('') + '</div>';
    }

    setBuildingPumpTooltipContent(currentObject, buildingData)
    {
        let extractResourceNode     = this.baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
        let itemType                = null;
        let purity                  = 'normal';

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

            if(itemType === null && currentObject.className === '/Game/FactoryGame/Buildable/Factory/WaterPump/Build_WaterPump.Build_WaterPump_C')
            {
                itemType        = 'Desc_Water_C';
            }

        let craftingTime        = 60 / buildingData.extractionRate[purity];
        let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
        let powerUsed           = buildingData.powerUsed * clockSpeed;
            //if(this.baseLayout.saveGameParser.header.saveVersion < 29)
            //{
                powerUsed = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
            //}
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

            // TOP
            content.push('<div style="position: absolute;margin-top: 6px;margin-left: 8px; width: 135px;height: 110px;border-radius: 10px;color: #FFFFFF;padding-bottom: 10px;' + BaseLayout_Tooltip.uiGradient + '">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
                content.push('<strong>' + buildingData.name + '</strong>');

                let currentProgress = Math.min(100, Math.round(this.baseLayout.getObjectProperty(currentObject, 'mCurrentExtractProgress', 0) * 10000) / 100);
                    content.push('<div class="progress rounded-sm mx-3 mt-2" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + currentProgress + '%"></div></div>');
                    content.push('<span style="font-size: 10px;" class="d-block mb-3">Extracting - <span class="text-warning">' + currentProgress + '%</span></span>');

                let circuitSubSystem    = new SubSystem_Circuit({baseLayout: this.baseLayout});
                let objectCircuit       = circuitSubSystem.getObjectCircuit(currentObject);
                    content.push(this.setTooltipFooter({circuit: objectCircuit, craftingTime: craftingTime, clockSpeed: clockSpeed, powerUsed: powerUsed, singleLine: true}));
            content.push('</div></div>');
            content.push('</div>');

            // BOTTOM
            content.push('<div style="position: absolute;margin-top: 130px;margin-left: 8px; width: 135px;height: 100px;background: #FFFFFF;border: 2px solid #373737;border-radius: 10px;line-height: 1;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

                if(extractResourceNode !== null && itemType !== null)
                {
                    content.push('<div class="text-center"><table class="mx-auto mb-2"><tr><td><div class="d-flex flex-row" style="position:relative;margin: 1px;width: 48px;height: 48px;border: 1px solid #000000;border-radius:50%;padding: 5px;background-color: #FFFFFF;"><img src="' + this.baseLayout.itemsData[itemType].image + '" class="img-fluid" /></div></td></tr></table></div>');
                    content.push('<div><strong>' + this.baseLayout.itemsData[itemType].name + '</strong></div>');
                    content.push('<span class="small"><strong class="text-warning">' + +(Math.round((productionRatio / 1000) * 100) / 100) + 'm³</strong> per minute</span>');
                }

            content.push('</div></div>');
            content.push('</div>');
            content.push('<div style="position: absolute;margin-top: 232px;margin-left: 47px; width: 60px;' + BaseLayout_Tooltip.styleLabels + '"><strong>OUTPUT</strong></div>');

            content.push('<div style="position: absolute;margin-top: 111px;margin-left: 65px; width: 24px;height: 24px;color: #FFFFFF;background: #404040;border-radius: 50%;line-height: 24px;text-align: center;font-size: 14px;box-shadow: 0 0 2px 0px rgba(0,0,0,0.75);"><i class="fas fa-arrow-alt-down"></i></div>');

        // DOME
        if(extractResourceNode !== null && itemType !== null && this.baseLayout.itemsData[itemType].color !== undefined && currentFluid > 0)
        {
            let volumeHeight = Math.round(currentFluid / maxFluid * 104);

                content.push('<div style="position: absolute;margin-top: 20px;margin-left: 355px;">');
                    content.push('<div style="position: relative;width: 104px;height: 104px;border-radius: 50%;overflow: hidden;">');
                        content.push('<div style="margin-top: ' + (104 - volumeHeight) + 'px;height: ' + volumeHeight + 'px;position: relative;">');
                            content.push('<div class="liquidDome" style="background-color:' + this.baseLayout.itemsData[itemType].color + ';height: ' + (104 * 2) + 'px;top: -' + (104 / 2) + 'px"></div>');
                        content.push('</div>');
                    content.push('</div>');
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
        content.push('<div style="position: absolute;margin-top: 22px;margin-left: 211px;width: 102px;height: 102px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/flowIndicator.png?v=' + this.baseLayout.scriptVersion + '" style="width: 102px;height: 102px;transform: rotate(-135deg);" /></div>');
        content.push('<div style="position: absolute;margin-top: 22px;margin-left: 211px;width: 102px;height: 102px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/flowGlass.png?v=' + this.baseLayout.scriptVersion + '" style="width: 102px;height: 102px;" /></div>');

        // FOOTER
        content.push(this.getOverclockingPanel(currentObject, 256, 12));
        content.push(BaseLayout_Tooltip.getStandByPanel(this.baseLayout, currentObject, 265, 385, 334, 387));

        return '<div style="' + this.genericPumpBackground + '">' + content.join('') + '</div>';
    }

    setBuildingStorageTooltipContent(currentObject, buildingData)
    {
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

            if(buildingData.category === 'vehicle' && currentObject.className.includes('/Game/FactoryGame/Buildable/Vehicle/Train/') === false && currentObject.className !== '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C')
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

                    if(buildingData.category === 'dockstation')
                    {
                        content.push('<div class="' + colSize + '">');
                            content.push(this.setStationLoadMode(currentObject));
                        content.push('</div>');
                    }

                content.push('</div>');

                if(inventoryType === 'liquid')
                {
                    let maxFluid        = buildingData.maxFluid; // Use straight calculation
                    let inventory       = this.baseLayout.getObjectInventory(currentObject, inventoryKey);

                    content.push('<div style="width: 230px;height: 240px;">');
                    if(inventory !== null && inventory.length > 0 && inventory[0] !== null)
                    {
                        let itemType        = this.baseLayout.getItemDataFromClassName(inventory[0].className);
                        let currentFluid    = inventory[0].qty;

                        if(itemType !== null)
                        {
                            content.push('<div style="position: absolute;padding-top: 230px;width: 230px;text-align: center;"><strong>' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentFluid / 100) / 10) + ' m³ of ' + itemType.name + '</strong></div>');
                        }

                        if(itemType !== null && itemType.color !== undefined)
                        {
                            if(itemType.category === 'gas')
                            {
                                content.push(this.setGasDome(230, currentFluid, maxFluid, itemType.color));
                            }
                            else
                            {
                                content.push(this.setLiquidDome(230, currentFluid, maxFluid, itemType.color));
                            }
                        }
                    }
                    else
                    {
                        content.push(this.setLiquidDome(230, 0, maxFluid, '#000'));
                    }
                    content.push('</div>');
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

        let fluidBox        = this.baseLayout.getObjectProperty(currentObject, 'mFluidBox');
            if(fluidBox === null)
            {
                fluidBox = {value: 0};
            }
            currentFluid    = Math.min(maxFluid, fluidBox.value * 1000);

        // Get fluid type
        let currentPipeNetwork = this.baseLayout.pipeNetworkSubSystem.getObjectPipeNetwork(currentObject);
            if(currentPipeNetwork !== null)
            {
                let mFluidDescriptor = this.baseLayout.getObjectProperty(currentPipeNetwork, 'mFluidDescriptor');
                    if(mFluidDescriptor !== null)
                    {
                        itemType = mFluidDescriptor.pathName;
                    }
            }

        if(itemType !== null)
        {
            itemType = this.baseLayout.getItemDataFromClassName(itemType);

            if(itemType !== null && itemType.color !== undefined)
            {
                content.push('<div style="position: absolute;margin-top: 25px;margin-left: 20px;">');
                    if(itemType.category === 'gas')
                    {
                        content.push(this.setGasDome(230, currentFluid, maxFluid, itemType.color));
                    }
                    else
                    {
                        content.push(this.setLiquidDome(230, currentFluid, maxFluid, itemType.color));
                    }
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
            content.push('<span class="small">Current amount:</span><br /><strong><strong class="text-info">' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentFluid / 100) / 10) + '</strong> / ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(maxFluid / 100) / 10) + ' m³</strong>');
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

        return '<div style="' + this.genericFluidStorageBackgroundStyle + '">' + content.join('') + '</div>';
    }

    setBuildingPowerStorageTooltipContent(currentObject, buildingData)
    {
        let content             = [];

        let circuitSubSystem    = new SubSystem_Circuit({baseLayout: this.baseLayout});
        let objectCircuit       = circuitSubSystem.getObjectCircuit(currentObject);
        let circuitStatistics   = circuitSubSystem.getStatistics(((objectCircuit !== null) ? objectCircuit.circuitId : null));

        let storedCharge        = Building_PowerStorage.storedCharge(this.baseLayout, currentObject);
        let capacityCharge      = Building_PowerStorage.capacityCharge(this.baseLayout, currentObject);
        let percentageCharge    = storedCharge / capacityCharge * 100;
        let chargeRate          = Math.min(capacityCharge, circuitStatistics.powerStorageChargeRate);

        // HEADER
        content.push('<div style="position: absolute;margin-top: 30px;width: 100%;text-align: center;font-size: 16px;" class="text-warning">');
        content.push('<strong class="small">' + buildingData.name + '</strong>');
        content.push('</div>');

        // PROGRESS
        content.push('<div style="position: absolute;margin-top: 55px;margin-left: 22px; width: 60px;height: 175px;border:3px solid #FFFFFF;border-radius: 4px;">');

            content.push('<div style="position: absolute;margin-top: 2px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 80) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge > 80 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 2px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ff33;"' + ((percentageCharge > 80 && percentageCharge < 100) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 80)
            {
                content.push('<div style="position: absolute;margin-top: 2px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 80 && percentageCharge <= 100) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 31px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 60) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge > 60 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 31px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ff66;"' + ((percentageCharge > 60 && percentageCharge <= 80) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 60)
            {
                content.push('<div style="position: absolute;margin-top: 31px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 60 && percentageCharge <= 80) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 60px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 40) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge > 40 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 60px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ff99;"' + ((percentageCharge > 40 && percentageCharge <= 60) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 40)
            {
                content.push('<div style="position: absolute;margin-top: 60px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 40 && percentageCharge <= 60) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 89px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 20) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge > 20 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 89px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ffcc;"' + ((percentageCharge > 20 && percentageCharge <= 40) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 20)
            {
                content.push('<div style="position: absolute;margin-top: 89px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 20 && percentageCharge <= 40) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 118px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: ' + ((percentageCharge > 0) ? '#666666' : '#313131') + ';"></div>');
            if(chargeRate > 0 && percentageCharge < 100)
            {
                content.push('<div style="position: absolute;margin-top: 118px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #00ffff;"' + ((percentageCharge > 0 && percentageCharge <= 20) ? ' class="blink"' : '') + '></div>');
            }
            if(circuitStatistics.powerStorageDrainRate > 0)
            {
                content.push('<div style="position: absolute;margin-top: 118px;margin-left: 2px; width: 50px;height: 27px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 0 && percentageCharge <= 20) ? ' class="blink"' : '') + '></div>');
            }

            content.push('<div style="position: absolute;margin-top: 147px;width: 56px;height: 24px;background: #FFFFFF;line-height: 24px;text-align: center;" class="small"><strong>' + Math.floor(percentageCharge) + '%</strong></div>');

        content.push('</div>');

        // STATE
        content.push('<div style="position: absolute;margin-top: 55px;margin-left: 90px; width: 100px;height: 175px;color: #FFFFFF;">');
        content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center small" style="line-height: 1;">');

        if(chargeRate >= 0 && circuitStatistics.powerStorageDrainRate === 0 && percentageCharge < 100)
        {
            content.push('<i class="fas fa-stopwatch"></i><br /><span class="small">Time until full</span><br />');

            if(chargeRate > 0)
            {
                let pad                 = function(num, size) { return ('000' + num).slice(size * -1); },
                    time                = parseFloat(Building_PowerStorage.timeUntilCharged(this.baseLayout, currentObject)).toFixed(3),
                    hours               = Math.floor(time / 60 / 60),
                    minutes             = Math.floor(time / 60) % 60,
                    seconds             = Math.floor(time - minutes * 60);

                    content.push(hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's');
            }
            else
            {
                content.push('-');
            }
            content.push('<br /><br />');
        }
        else
        {
            if(circuitStatistics.powerStorageDrainRate > 0)
            {
                let pad                 = function(num, size) { return ('000' + num).slice(size * -1); },
                    time                = parseFloat(Building_PowerStorage.timeUntilDrained(this.baseLayout, currentObject)).toFixed(3),
                    hours               = Math.floor(time / 60 / 60),
                    minutes             = Math.floor(time / 60) % 60,
                    seconds             = Math.floor(time - minutes * 60);

                    content.push('<i class="fas fa-stopwatch"></i><br /><span class="small">Time until drained</span><br />');
                    content.push(hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's');
                    content.push('<br /><br />');
            }
        }

        content.push('<i class="fas fa-battery-full"></i><br /><span class="small">Stored Charge</span><br />' + (Math.floor(storedCharge * 10) / 10) + ' / ' + capacityCharge + ' MWh<br /><br />');

        if(chargeRate > 0 && percentageCharge < 100)
        {
            content.push('<i class="fas fa-tachometer-alt-fast"></i><br /><span class="small">Charge Rate</span><br />' + (Math.floor(chargeRate * 10) / 10) + ' MW');
        }
        if(circuitStatistics.powerStorageDrainRate > 0)
        {
            content.push('<i class="fas fa-tachometer-alt-fast"></i><br /><span class="small">Drain Rate</span><br />' + (Math.floor(circuitStatistics.powerStorageDrainRate * 10) / 10) + ' MW');
        }


        content.push('</div></div>');
        content.push('</div>');
        content.push('<div style="position: absolute;margin-top: 240px;margin-left: 46px; width: 120px;' + BaseLayout_Tooltip.styleLabels + '"><strong>POWER STORAGE INFO</strong></div>');

        return '<div style="' + this.genericPowerStorageBackgroundStyle + '">' + content.join('') + '</div>';
    }

    setPowerPoleTooltipContent(currentObject, buildingData)
    {
        let content             = [];
        let circuitSubSystem    = new SubSystem_Circuit({baseLayout: this.baseLayout});
        let objectCircuit       = null;
        let powerConnection     = this.baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.PowerConnection');
            if(powerConnection === null)
            {
                powerConnection = this.baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.PowerConnection1');
            }
            if(powerConnection !== null)
            {
                objectCircuit = circuitSubSystem.getObjectCircuit(powerConnection);
            }

            if(objectCircuit !== null)
            {
                content.push('<div style="position: absolute;width: 100%;text-align: center;">' + buildingData.name + ' (Circuit #' + objectCircuit.circuitId + ')</div>');
            }
            else
            {
                content.push('<div style="position: absolute;width: 100%;text-align: center;">' + buildingData.name + '</div>');
            }

        if(buildingData.image !== undefined)
        {
            content.push('<div style="position: absolute;margin-top: 25px;"><img src="' + buildingData.image + '" style="width: 128px;height: 128px;" /></div>');
        }

        content.push('<div style="position: absolute;margin-top: 25px;margin-left: 145px; width: 315px;height: 130px;color: #5b5b5b;text-shadow: none;' + BaseLayout_Tooltip.genericUIBackgroundStyle(this.baseLayout) + '">');
        if(objectCircuit !== null)
        {
            let circuitStatistics = circuitSubSystem.getStatistics(objectCircuit.circuitId);
                content.push(BaseLayout_Tooltip.setCircuitStatisticsGraph(this.baseLayout, circuitStatistics));
        }
        else
        {

        }
        content.push('</div>');

        return '<div class="d-flex" style="' + this.genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        <div style="color: #FFFFFF;line-height: 16px;font-size: 12px;width:450px;height: 155px;position: relative;" >\
                            ' + content.join('') + '\
                        </div>\
                    </div>\
                </div>';
    }

    setBuildingPowerSwitchTooltipContent(currentObject)
    {
        let content             = [];
        let circuitSubSystem    = new SubSystem_Circuit({baseLayout: this.baseLayout});
        let objectCircuitA      = null;
        let objectCircuitB      = null;

        let powerConnection1    = this.baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.PowerConnection1');
            if(powerConnection1 !== null)
            {
                objectCircuitA = circuitSubSystem.getObjectCircuit(powerConnection1);
            }
        let powerConnection2    = this.baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.PowerConnection2');
            if(powerConnection2 !== null)
            {
                objectCircuitB = circuitSubSystem.getObjectCircuit(powerConnection2);
            }

        // SIGN
        let mBuildingTag = Building_PowerSwitch.getSign(this.baseLayout, currentObject);
            if(mBuildingTag !== null)
            {
                content.push('<div style="position: absolute;margin-top: 5px;margin-left: 15px;width: 390px;font-size: 10px;line-height: 16px;" class="text-warning">' + mBuildingTag + '</div>');
                content.push('<div style="position: absolute;margin-top: 1px;margin-left: 450px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_OnOffSwitch_On.png?v=' + this.baseLayout.scriptVersion + '" /></div>');
            }

        // HANDLE
        let mIsSwitchOn = Building_PowerSwitch.isOn(this.baseLayout, currentObject);
            if(mIsSwitchOn === true)
            {
                content.push('<div style="position: absolute;margin-top: 220px;margin-left: 13px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_PowerSwitch_HandleOn.png?v=' + this.baseLayout.scriptVersion + '" /></div>');
            }
            else
            {
                content.push('<div style="position: absolute;margin-top: 130px;margin-left: 13px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_PowerSwitch_HandleOff.png?v=' + this.baseLayout.scriptVersion + '" /></div>');
            }

        // LIGHT / STATE
        if(mIsSwitchOn === true)
        {
            content.push('<div style="position: absolute;margin-top: 46px;margin-left: 50px; width: 70px;height: 30px;color: #FFFFFF;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center" style="line-height: 1;font-size: 9px;">');
            content.push('<strong>OPERATIONAL</strong>');
            content.push('</div></div>');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: 35px;margin-left: 5px;" class="flash"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_IndicatorPanel_Light_Operational.png?v=' + this.baseLayout.scriptVersion + '" /></div>');
        }
        else
        {
            content.push('<div style="position: absolute;margin-top: 46px;margin-left: 50px; width: 70px;height: 30px;color: #FFFFFF;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center" style="line-height: 1;font-size: 8px;">');
            content.push('POWER SWITCH<br />IS OFF');
            content.push('</div></div>');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: 35px;margin-left: 5px;" class="flash"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_IndicatorPanel_Light_Caution.png?v=' + this.baseLayout.scriptVersion + '" /></div>');
        }

        // CIRCUIT A
        content.push('<div style="position: absolute;margin-top: 81px;margin-left: 114px;color: #FFFFFF;transform: rotate(-90deg);-webkit-transform-origin: 50%  51%;width: 100px;line-height: 20px;text-align: right;font-size: 14px;">');
            if(objectCircuitA !== null)
            {
                content.push('<strong>Circuit A (#' + objectCircuitA.circuitId + ')</strong>');
            }
            else
            {
                content.push('<strong>Circuit A</strong>');
            }
        content.push('</div>');
        content.push('<div style="position: absolute;margin-top: 35px;margin-left: 175px; width: 315px;height: 130px;color: #5b5b5b;' + BaseLayout_Tooltip.genericUIBackgroundStyle(this.baseLayout) + '">');
        if(objectCircuitA !== null)
        {
            let circuitStatisticsA = circuitSubSystem.getStatistics(objectCircuitA.circuitId);
                content.push(BaseLayout_Tooltip.setCircuitStatisticsGraph(this.baseLayout, circuitStatisticsA));
        }
        else
        {

        }
        content.push('</div>');

        // CIRCUIT B
        content.push('<div style="position: absolute;margin-top: 234px;margin-left: 115px;color: #FFFFFF;transform: rotate(-90deg);-webkit-transform-origin: 50%  51%;width: 100px;line-height: 20px;font-size: 14px;">');
            if(objectCircuitB !== null)
            {
                content.push('<strong>Circuit B (#' + objectCircuitB.circuitId + ')</strong>');
            }
            else
            {
                content.push('<strong>Circuit B</strong>');
            }
        content.push('</div>');
        content.push('<div style="position: absolute;margin-top: 173px;margin-left: 175px; width: 315px;height: 130px;color: #5b5b5b;' + BaseLayout_Tooltip.genericUIBackgroundStyle(this.baseLayout) + '">');
        if(objectCircuitB !== null)
        {
            let circuitStatisticsB  = circuitSubSystem.getStatistics(objectCircuitB.circuitId);
                content.push(BaseLayout_Tooltip.setCircuitStatisticsGraph(this.baseLayout, circuitStatisticsB));
        }
        else
        {

        }
        content.push('</div>');

        return '<div style="' + this.genericPowerSwicthBackgroundStyle + '">' + content.join('') + '</div>';
    }

    setBuildingProductionTooltipContent(currentObject, buildingData)
    {
        let recipeItem          = this.baseLayout.getItemDataFromRecipe(currentObject);
        let craftingTime        = (recipeItem !== null) ? recipeItem.mManufactoringDuration : 4;

        let clockSpeed          = this.baseLayout.getClockSpeed(currentObject);
        let powerUsed           = 0;
            if(buildingData.powerUsed !== undefined)
            {
                powerUsed = buildingData.powerUsed * clockSpeed;
                //if(this.baseLayout.saveGameParser.header.saveVersion < 29)
                //{
                    powerUsed = buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
                //}
            }
            else
            {
                let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.powerInfo');
                    if(buildingPowerInfo !== null)
                    {
                        let mTargetConsumption  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mTargetConsumption');
                            if(mTargetConsumption !== null)
                            {
                                powerUsed = Math.round(mTargetConsumption);
                            }
                    }
            }

            craftingTime       /= clockSpeed; // Overclocking...

            if(buildingData.mManufacturingSpeedMultiplier !== undefined)
            {
                craftingTime /= buildingData.mManufacturingSpeedMultiplier;
            }

        let content     = [];

            // HEADER
            content.push('<div style="position: absolute;margin-top: 10px;width: 100%;text-align: center;font-size: 16px;" class="text-warning">');
            content.push('<strong>' + buildingData.name + '</strong> ' + ( (recipeItem !== null) ? '<em class="small">(' + recipeItem.name + ')</em>' : '' ));
            content.push('</div>');


            // INPUT
            content.push('<div style="position: absolute;margin-top: 45px;margin-left: 3px; width: 196px;height: 240px;color: #5b5b5b;' + BaseLayout_Tooltip.genericUIBackgroundStyle(this.baseLayout) + '">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

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

                            content.push('<div style="border-top: 1px solid #e7e7e7;border-bottom: 1px solid #e7e7e7;height: 50px;padding-top: 3px;font-size: 12px;line-height: 1;margin-top: -1px;" class="d-block">');
                            content.push('<table><tr><td>');
                                content.push(this.baseLayout.getInventoryImage(currentInventoryIn, 40));
                            content.push('</td><td class="align-middle pl-2 text-left">');

                                let consumptionRatio = 60 / craftingTime * recipeItem.ingredients[itemClassName];

                                    if(currentItem.category === 'liquid' || currentItem.category === 'gas')
                                    {
                                        content.push('<strong style="white-space: normal;">' + +(Math.round((recipeItem.ingredients[itemClassName] / 1000) * 100) / 100) + 'm³ ' + currentItem.name + '</strong><br />');
                                        content.push('<span class="small"><strong class="text-warning">' + +(Math.round(consumptionRatio / 1000 * 100) / 100) + 'm³</strong> per minute</span>');
                                    }
                                    else
                                    {
                                        content.push('<strong style="white-space: normal;">' + recipeItem.ingredients[itemClassName] + ' ' + currentItem.name + '</strong><br />');
                                        content.push('<span class="small"><strong class="text-warning">' + +(Math.round(consumptionRatio * 100) / 100) + '</strong> per minute</span>');
                                    }

                            content.push('</td></tr></table>');
                            content.push('</div>');
                        }
                }

            content.push('</div></div>');
            content.push('</div>');
            content.push('<div style="position: absolute;margin-top: 286px;margin-left: 71px; width: 60px;' + BaseLayout_Tooltip.styleLabels + '"><strong>INPUT</strong></div>');

            // MIDDLE
            content.push('<div style="position: absolute;margin-top: 75px;margin-left: 215px; width: 75px;height: 170px;color: #FFFFFF;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

                if(recipeItem !== null && recipeItem.produce !== undefined)
                {
                    content.push('<div style="height: 60px;width: 70px;position: relative;" class="mx-auto">');
                    let mainItem = true;
                        for(let className in recipeItem.produce)
                        {
                            let currentItem     = this.baseLayout.getItemDataFromClassName(className);
                                if(currentItem !== null)
                                {
                                    if(mainItem === true)
                                    {
                                        content.push('<img src="' + currentItem.image + '" class="img-fluid" style="width: 48px;" />');
                                        mainItem = false;
                                    }
                                    else
                                    {
                                        content.push('<div style="position: absolute; bottom: 0; right: 0;"><img src="' + currentItem.image + '" class="img-fluid" style="width: 28px;" /></div>');
                                    }
                                }
                        }
                    content.push('</div>');
                }

                let currentProgress = Math.round(this.baseLayout.getObjectProperty(currentObject, 'mCurrentManufacturingProgress', 0) * 100);
                    content.push('<div class="progress rounded-sm mx-2 mt-2" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + currentProgress + '%"></div></div>');

                    if(currentProgress === 0)
                    {
                        content.push('<span style="font-size: 8px;" class="d-block mb-3">Idle - <span class="text-warning">' + currentProgress + '%</span></span>');
                    }
                    else
                    {
                        content.push('<span style="font-size: 8px;" class="d-block mb-3">Constructing - <span class="text-warning">' + currentProgress + '%</span></span>');
                    }

                let circuitSubSystem    = new SubSystem_Circuit({baseLayout: this.baseLayout});
                let objectCircuit       = circuitSubSystem.getObjectCircuit(currentObject);
                    content.push(this.setTooltipFooter({circuit: objectCircuit, craftingTime: craftingTime, clockSpeed: clockSpeed, powerUsed: powerUsed}));

            content.push('</div></div>');
            content.push('</div>');

            // OUTPUT
            content.push('<div style="position: absolute;margin-top: 45px;margin-left: 302px; width: 196px;height: 240px;color: #5b5b5b;' + BaseLayout_Tooltip.genericUIBackgroundStyle(this.baseLayout) + '">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

                if(recipeItem !== null && recipeItem.produce !== undefined)
                {
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

                            content.push('<div style="border-top: 1px solid #e7e7e7;border-bottom: 1px solid #e7e7e7;height: 50px;padding-top: 3px;font-size: 12px;line-height: 1;margin-top: -1px;" class="d-block">');
                            content.push('<table><tr><td>');
                                content.push(this.baseLayout.getInventoryImage(currentInventoryOut, 40));
                            content.push('</td><td class="align-middle pl-2 text-left">');

                            let productionRatio = 60 / craftingTime * recipeItem.produce[itemClassName];

                                if(currentItem.category === 'liquid' || currentItem.category === 'gas')
                                {
                                    content.push('<strong style="white-space: normal;">' + +(Math.round((recipeItem.produce[itemClassName] / 1000) * 100) / 100) + 'm³ ' + currentItem.name + '</strong><br />');
                                    content.push('<span class="small"><strong class="text-warning">' + +(Math.round(productionRatio / 1000 * 100) / 100) + 'm³</strong> per minute</span>');
                                }
                                else
                                {
                                    content.push('<strong style="white-space: normal;">' + recipeItem.produce[itemClassName] + ' ' + currentItem.name + '</strong><br />');
                                    content.push('<span class="small"><strong class="text-warning">' + +(Math.round(productionRatio * 100) / 100) + '</strong> per minute</span>');
                                }

                            content.push('</td></tr></table>');
                            content.push('</div>');
                        }
                }

            content.push('</div></div>');
            content.push('</div>');
            content.push('<div style="position: absolute;margin-top: 286px;margin-left: 370px; width: 60px;' + BaseLayout_Tooltip.styleLabels + '"><strong>OUTPUT</strong></div>');

            // FOOTER
            content.push(this.getOverclockingPanel(currentObject));
            content.push(BaseLayout_Tooltip.getStandByPanel(this.baseLayout, currentObject));

        let footerBackground = this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_Manufacturer_BG_Constructor.png';
            switch(currentObject.className)
            {
                case '/Game/FactoryGame/Buildable/Factory/SmelterMk1/Build_SmelterMk1.Build_SmelterMk1_C':
                    footerBackground = this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_Manufacturer_BG_Smelter.png';
                    break;
                case '/Game/FactoryGame/Buildable/Factory/OilRefinery/Build_OilRefinery.Build_OilRefinery_C':
                    footerBackground = this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_Manufacturer_BG_Refinery.png';
                    break;
                case '/Game/FactoryGame/Buildable/Factory/Blender/Build_Blender.Build_Blender_C':
                    footerBackground = this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_Manufacturer_BG_Blender.png';
                    break;
            }

        return '<div style="' + this.genericProductionBackgroundStyle + '"><div style="background: url(' + footerBackground + '?v=' + this.baseLayout.scriptVersion + ') bottom no-repeat;width: 100%; height: 510px;">' + content.join('') + '</div></div>';
    }

    setBuildingGeneratorTooltipContent(currentObject, buildingData)
    {
        let recipeItem                  = this.baseLayout.getItemDataFromRecipe(currentObject);
        let craftingTime                = (recipeItem !== null) ? recipeItem.mManufactoringDuration : 4;

        let clockSpeed                  = this.baseLayout.getClockSpeed(currentObject);
        let mPowerProductionExponent    = buildingData.powerProductionExponent || 1.3;
        let fuelClass                   = this.baseLayout.getObjectProperty(currentObject, 'mCurrentFuelClass');

            craftingTime               /= clockSpeed; // Overclocking...

        let inventoryIn                 = this.baseLayout.getObjectInventory(currentObject, 'mFuelInventory');

        let currentFluid                = 0;
        let maxFluid                    = (buildingData.maxFluid !== undefined) ? buildingData.maxFluid : 50000;

        // VOLUME
        if(buildingData.supplementalLoadType !== undefined)
        {
                for(let i = 0; i < inventoryIn.length; i++)
                {
                    if(inventoryIn[i] !== null && inventoryIn[i].className === this.baseLayout.itemsData[buildingData.supplementalLoadType].className)
                    {
                        currentFluid = inventoryIn[i].qty;
                        break;
                    }
                }

                currentFluid        = Math.min(currentFluid, maxFluid);
                currentFluid        = +(Math.round((currentFluid / 1000) * 100) / 100);
                maxFluid            = +(Math.round((maxFluid / 1000) * 100) / 100);
        }

        let content                 = [];
        let circuitSubSystem        = new SubSystem_Circuit({baseLayout: this.baseLayout});
        let objectCircuit           = circuitSubSystem.getObjectCircuit(currentObject);
        let tooltipFooterOptions    = {circuit: objectCircuit, clockSpeed: clockSpeed, powerGenerated: buildingData.powerGenerated, singleLine: true, mPowerProductionExponent: mPowerProductionExponent};

            // BOTTOM
            content.push('<div style="position: absolute;margin-top: 176px;margin-left: 315px; width: 165px;height: 125px;background: #FFFFFF;border: 2px solid #373737;border-radius: 10px;line-height: 1;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');

                if(fuelClass !== null)
                {
                    let fuelItem = this.baseLayout.getItemDataFromClassName(fuelClass.pathName);
                        if(fuelItem !== null && fuelItem.energy !== undefined)
                        {
                            content.push('<strong>' + fuelItem.name + '</strong><br />');

                            if(fuelItem.energy !== null)
                            {
                                let consumptionRatio = (60 / (fuelItem.energy / buildingData.powerGenerated) * Math.pow(clockSpeed, 1 / mPowerProductionExponent));

                                    if(fuelItem.category === 'liquid' || fuelItem.category === 'gas')
                                    {
                                        content.push('<span class="small"><strong class="text-warning">' + +(Math.round((consumptionRatio / 1000) * 100) / 100) + 'm³</strong> per minute</span><br />');
                                        tooltipFooterOptions.burningTime = 60 / (consumptionRatio / 1000);
                                    }
                                    else
                                    {
                                        content.push('<span class="small"><strong class="text-warning">' + +(Math.round(consumptionRatio * 100) / 100) + '</strong> Parts per minute</span><br />');
                                        tooltipFooterOptions.burningTime = 60 / consumptionRatio;
                                    }
                            }
                        }
                }

                content.push('<table class="w-100 mt-2"><tr>');

                content.push('<td class="text-center"><div class="small">Fuel</div>');
                    content.push('<table class="mx-auto"><tr><td>' + this.baseLayout.getInventoryImage(inventoryIn[0], 48) + '</td></tr></table>');
                content.push('</td>');

                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorNuclear/Build_GeneratorNuclear.Build_GeneratorNuclear_C')
                {
                    let inventoryOut    = this.baseLayout.getObjectInventory(currentObject, 'mOutputInventory');

                        content.push('<td class="text-center"><i class="fas fa-arrow-alt-right"></i></td>');
                        content.push('<td class="text-center"><div class="small">' + this.baseLayout.translate._('MAP\\TOOLTIP\\Waste') + '</div>');
                            content.push('<table class="mx-auto"><tr><td>' + this.baseLayout.getInventoryImage(inventoryOut[0], 48) + '</td></tr></table>');
                        content.push('</td>');
                }

                content.push('</tr></table>');

            content.push('</div></div>');
            content.push('</div>');

            // TOP
            content.push('<div style="position: absolute;margin-top: 26px;margin-left: 315px; width: 165px;height: 135px;border-radius: 10px;color: #FFFFFF;padding-bottom: 10px;' + BaseLayout_Tooltip.uiGradient + '">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center">');
                content.push('<strong>' + buildingData.name + '</strong>');

                if(fuelClass !== null)
                {
                    let fuelItem = this.baseLayout.getItemDataFromClassName(fuelClass.pathName);
                        if(fuelItem !== null && fuelItem.energy !== undefined)
                        {
                            tooltipFooterOptions.fuelEnergyValue = fuelItem.energy;

                            let currentProgress = Math.round(this.baseLayout.getObjectProperty(currentObject, 'mCurrentFuelAmount', 0) / fuelItem.energy * 100);
                                if(fuelItem.category === 'liquid' || fuelItem.category === 'gas')
                                {
                                    currentProgress = Math.round(currentProgress / 100) / 10;
                                }

                                content.push('<div class="progress rounded-sm mx-3 mt-2" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + currentProgress + '%"></div></div>');

                                if(currentProgress === 0) // TODO: Check fuel + supplemental
                                {
                                    content.push('<span class="small d-block mb-3">Idle - <span class="text-warning">' + currentProgress + '%</span></span>');
                                }
                                else
                                {
                                    content.push('<span class="small d-block mb-3">Burning Fuel - <span class="text-warning">' + currentProgress + '%</span></span>');
                                }
                        }
                }

                content.push(this.setTooltipFooter(tooltipFooterOptions));

            content.push('</div></div>');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: 306px;margin-left: 367px; width: 60px;' + BaseLayout_Tooltip.styleLabels + '"><strong>INPUT</strong></div>');
            content.push('<div style="position: absolute;margin-top: 152px;margin-left: 381px; width: 32px;height: 32px;color: #FFFFFF;background: #404040;border-radius: 50%;line-height: 32px;text-align: center;font-size: 18px;box-shadow: 0 0 2px 0px rgba(0,0,0,0.75);"><i class="fas fa-arrow-alt-down"></i></div>');

            // VOLUME
            if(buildingData.supplementalLoadType !== undefined && buildingData.supplementalLoadRatio !== undefined)
            {
                // DOME
                if(this.baseLayout.itemsData[buildingData.supplementalLoadType].color !== undefined && currentFluid > 0)
                {
                    let volumeHeight = Math.round(currentFluid / maxFluid * 96);

                        content.push('<div style="position: absolute;margin-top: 41px;margin-left: 107px;">');
                        content.push('<div style="position: relative;width: 96px;height: 96px;border-radius: 50%;overflow: hidden;"><div style="margin-top: ' + (96 - volumeHeight) + 'px;height: ' + volumeHeight + 'px;background-color:' + this.baseLayout.itemsData[buildingData.supplementalLoadType].color + ';"></div></div>');
                        content.push('</div>');
                }
                content.push('<div style="position: absolute;margin-top: 41px;margin-left: 107px;width: 96px;height: 96px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/liquidDome.png?v=' + this.baseLayout.scriptVersion + '" width="96" height="96" /></div>');

                // AMOUNT
                content.push('<div style="position: absolute;margin-top: 175px;margin-left: 107px;width: 96px;color: #FFFFFF;text-align: center;font-size: 13px;">');
                content.push('<span class="small">Current amount:</span><br /><strong>' + currentFluid + ' / ' + maxFluid + 'm³</strong>');
                content.push('</div>');

                // CONSUMPTION
                let supplementalLoadConsumed   = 60 * (buildingData.powerGenerated * Math.pow(clockSpeed, 1 / mPowerProductionExponent)) * buildingData.supplementalLoadRatio;
                    content.push('<div style="position: absolute;margin-top: 245px;margin-left: 107px;width: 96px;text-align: center;font-size: 13px;color: #5b5b5b;">');
                    content.push('<span class="small">Consumption:</span><br /><i class="fas fa-industry-alt"></i><br /><strong>' + +(Math.round((supplementalLoadConsumed / 1000) * 100) / 100) + 'm³</strong>');
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
            content.push(this.getOverclockingPanel(currentObject, 356, 12));
            content.push(BaseLayout_Tooltip.getStandByPanel(this.baseLayout, currentObject, 365, 385, 434, 387));

        if(buildingData.supplementalLoadType !== undefined)
        {
            return '<div style="' + this.fluidGeneratorBackgroundStyle + '">' + content.join('') + '</div>';
        }

        return '<div style="' + this.genericGeneratorBackgroundStyle + '">' + content.join('') + '</div>';
    }

    setBuildingTooltipContent(currentObject, buildingData)
    {
        let content     = [];
        let direction   = '';
        let inverted    = '';

        if(buildingData.category === 'frame' || buildingData.category === 'foundation' || buildingData.category === 'wall')
        {
            let rotation  = BaseLayout_Math.getQuaternionToEuler(currentObject.transform.rotation);
            let angle     = rotation.yaw - 45;
                if(buildingData.mapCorrectedAngle !== undefined)
                {
                    angle += buildingData.mapCorrectedAngle;
                }

                direction = '<i class="fas fa-location-arrow" style="transform: rotate(' + angle + 'deg)"></i>&nbsp;&nbsp;&nbsp;';
        }

        switch(currentObject.className)
        {
            case '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C':
                let trainStationIdentifier  = this.baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
                    if(trainStationIdentifier !== null)
                    {
                        let mStationName    = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStationName');
                            if(mStationName !== null)
                            {
                                content.push('<div><strong>' + direction + inverted + mStationName + ' <em class="small">(' + buildingData.name + ')</em></strong></div>');
                                break;
                            }
                    }
            default:
                content.push('<div><strong>' + direction + inverted +  buildingData.name + '</strong></div>');
        }

        if(buildingData.category === 'wall' && (currentObject.className.includes('_Door_') || currentObject.className.includes('_CDoor_') || currentObject.className.includes('_SDoor_') || currentObject.className.includes('_Gate_Automated_')))
        {
            let mDoorConfiguration = this.baseLayout.getObjectProperty(currentObject, 'mDoorConfiguration');
                if(mDoorConfiguration !== null)
                {
                    switch(mDoorConfiguration.value)
                    {
                        case 'EDoorConfiguration::DC_Closed':
                            content.push('<div>Status: <strong class="text-danger">Always Close</strong></div>');
                            break;
                        case 'EDoorConfiguration::DC_Open':
                            content.push('<div>Status: <strong class="text-success">Always Open</strong></div>');
                            break;
                    }
                }
                else
                {
                    content.push('<div>Status: <strong class="text-warning">Automatic</strong></div>');
                }
        }

        if(buildingData.category === 'frame' || buildingData.category === 'foundation' || buildingData.category === 'wall' || buildingData.category === 'roof' || buildingData.category === 'walkway')
        {
            content.push('Altitude: ' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(currentObject.transform.translation[2] / 100)) + 'm');
        }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/CA_SplitterSmart/Build_ConveyorAttachmentSplitterSmart.Build_ConveyorAttachmentSplitterSmart_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/CA_SplitterProgrammable/Build_ConveyorAttachmentSplitterProgrammable.Build_ConveyorAttachmentSplitterProgrammable_C')
        {
            let leftOutput      = Building_SmartSplitter.getSortRule(this.baseLayout, currentObject, 2);
            let rightOutput     = Building_SmartSplitter.getSortRule(this.baseLayout, currentObject, 1);
            let centerOutput    = Building_SmartSplitter.getSortRule(this.baseLayout, currentObject, 0);

                content.push('<table class="table table-sm mt-3">');

                    if(leftOutput !== null)
                    {
                        content.push('<tr><td class="text-left pr-3"><i class="fas fa-arrow-alt-left mr-1"></i>Left output:</td><td class="text-right">');
                        let outputContent = [];
                            for(let j = 0; j < leftOutput.length; j++)
                            {
                                outputContent.push(Building_SmartSplitter.getSortRuleLabel(this.baseLayout, leftOutput[j]));
                            }
                        content.push(outputContent.join('<br />'));
                        content.push('</td></tr>');
                    }
                    if(centerOutput !== null)
                    {
                        content.push('<tr><td class="text-left pr-3"><i class="fas fa-arrow-alt-up mr-1"></i>Center output:</td><td class="text-right">');
                        let outputContent = [];
                            for(let j = 0; j < centerOutput.length; j++)
                            {
                                outputContent.push(Building_SmartSplitter.getSortRuleLabel(this.baseLayout, centerOutput[j]));
                            }
                        content.push(outputContent.join('<br />'));
                        content.push('</td></tr>');
                    }
                    if(rightOutput !== null)
                    {
                        content.push('<tr><td class="text-left pr-3"><i class="fas fa-arrow-alt-right mr-1"></i>Right output:</td><td class="text-right">');
                        let outputContent = [];
                            for(let j = 0; j < rightOutput.length; j++)
                            {
                                outputContent.push(Building_SmartSplitter.getSortRuleLabel(this.baseLayout, rightOutput[j]));
                            }
                        content.push(outputContent.join('<br />'));
                        content.push('</td></tr>');
                    }

                content.push('</table>');
        }

        if(buildingData.image !== undefined)
        {
            content.push('<div class="pt-3"><img src="' + buildingData.image + '" style="width: 128px;height: 128px;" /></div>');
        }

        if(buildingData.health !== undefined)
        {
            content.push('<div class="pt-3">');
                content.push('<div style="background: url(' + this.baseLayout.staticUrl + '/img/bar_health_empty_straight.png?v=' + this.baseLayout.scriptVersion + ') left no-repeat;height: 28px;width: 201px;">');
                    content.push('<div style="background: url(' + this.baseLayout.staticUrl + '/img/bar_health_full_straight.png?v=' + this.baseLayout.scriptVersion + ') left no-repeat;height: 28px;width: ' + buildingData.health + '%;">');

                    content.push('</div>');
                content.push('</div>');
            content.push('</div>');
        }

        return '<div class="d-flex" style="' + this.genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }

    getOverclockingPanel(currentObject, top = 312, left = 89)
    {
        let content                         = [];
        let unlockSubSystem                 = new SubSystem_Unlock({baseLayout: this.baseLayout});
            if(unlockSubSystem.haveOverclocking() === true)
            {
                let clockSpeed              = this.baseLayout.getClockSpeed(currentObject);
                let potentialInventory      = this.baseLayout.getObjectInventory(currentObject, 'mInventoryPotential');

                    content.push('<div style="position: absolute;margin-top: ' + top + 'px;margin-left: ' + (parseInt(left) + 2) + 'px; width: 318px;height: 97px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/ManufacutringMenu_OverclockBackground.png?v=' + this.baseLayout.scriptVersion + ')">');
                    content.push('<table style="margin: 10px;width: 298px;"><tr>');
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
                    content.push('<td><div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + Math.min(100, (clockSpeed * 10000) / 100) + '%"></div></div></td>');

                    if(potentialInventory !== null)
                    {
                        for(let i = 0; i < potentialInventory.length; i++)
                        {
                            let potentialProgress = Math.min(100, ((clockSpeed * 10000) / 100 - (100 + (i * 50))) * 2);
                                content.push('<td><div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + potentialProgress + '%"></div></div></td>');
                        }
                    }

                    content.push('</tr></table>');
                    content.push('</div>');

                return content.join('');
            }

        return '<div style="position: absolute;margin-top: ' + top + 'px;margin-left: ' + left + 'px; width: 322px;height: 105px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/OverclockPanelLocked.png?v=' + this.baseLayout.scriptVersion + ');"></div>';
    }

    setInventoryFuel(currentObject)
    {
        let content         = [];
        let inventoryKey    = 'mFuelInventory';
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C')
            {
                inventoryKey = 'mBatteryInventory';
            }

            content.push('<div style="margin: 0 auto;width: 115px;height: 106px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/vehicleFuelBackground.png?v=' + this.baseLayout.scriptVersion + ') no-repeat;padding: 38px;">');
                content.push(this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectInventory(currentObject, inventoryKey), 1, 40));
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

    setGasDome(backgroundImageSize, currentFluid, maxFluid, color)
    {
        let content             = [];
            backgroundImageSize = Math.min(backgroundImageSize, 230);
        let imageRatio          = backgroundImageSize / 230
        let domeImageSize       = 164 * imageRatio;

        let volumeOpacity       = Math.round(currentFluid / maxFluid * 100) / 100;

            content.push('<div style="position: absolute;margin-top: ' + 32 * imageRatio + 'px;margin-left: ' + 32 * imageRatio + 'px;width: ' + domeImageSize + 'px;height: ' + domeImageSize + 'px;background-color: ' + color + ';border-radius: 50%;opacity: ' + volumeOpacity + ';"></div>');
            content.push('<div style="position: absolute;margin-top: ' + 32 * imageRatio + 'px;margin-left: ' + 32 * imageRatio + 'px;width: ' + domeImageSize + 'px;height: ' + domeImageSize + 'px;border-radius: 50%;overflow: hidden;">');
                content.push('<img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/PROT_TX_Gas_01.png?v=' + this.baseLayout.scriptVersion + '" style="position: absolute;width: ' + domeImageSize + 'px;height: ' + domeImageSize + 'px;animation: loader-clockwise 40s infinite linear;" />');
                content.push('<img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/PROT_TX_Gas_01.png?v=' + this.baseLayout.scriptVersion + '" style="width: ' + domeImageSize + 'px;height: ' + domeImageSize + 'px;animation: loader-counter-clockwise 60s infinite linear;" />');
            content.push('</div>');
            content.push('<div style="position: absolute;width: ' + backgroundImageSize + 'px;height: ' + backgroundImageSize + 'px;"><img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_GasModule_Small.png?v=' + this.baseLayout.scriptVersion + '" style="width: ' + backgroundImageSize + 'px;height: ' + backgroundImageSize + 'px;" /></div>');

        return content.join('');
    }

    setLiquidDome(backgroundImageSize, currentFluid, maxFluid, color)
    {
        let content             = [];
            backgroundImageSize = Math.min(backgroundImageSize, 230);
        let imageRatio          = backgroundImageSize / 230
        let domeImageSize       = 196 * imageRatio;

        let volumeHeight        = Math.round(currentFluid / maxFluid * domeImageSize);

            content.push('<div style="height: ' + backgroundImageSize + 'px;width:' + backgroundImageSize + 'px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/liquidBackground.png?v=' + this.baseLayout.scriptVersion + ');background-size: cover;" class="d-inline-block">');
                content.push('<div style="position: absolute;margin-top: ' + 12 * imageRatio + 'px;margin-left: ' + 17 * imageRatio + 'px;width: ' + domeImageSize + 'px;height: ' + domeImageSize + 'px;border-radius: 50%;overflow: hidden;">');

                    if(currentFluid > 0)
                    {
                        content.push('<div style="margin-top: ' + (domeImageSize - volumeHeight) + 'px;height: ' + volumeHeight + 'px;position: relative;">');
                            content.push('<div class="liquidDome" style="background-color:' + color + ';height: ' + (domeImageSize * 2) + 'px;top: -' + (domeImageSize / 2) + 'px"></div>');
                        content.push('</div>');
                    }

                content.push('</div>');
                content.push('<div style="position: absolute;margin-top: ' + 12 * imageRatio + 'px;margin-left: ' + 17 * imageRatio + 'px;">');
                    content.push('<img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/liquidDome.png?v=' + this.baseLayout.scriptVersion + '" width="' + domeImageSize + '" height="' + domeImageSize + '" />');
                content.push('</div>');
            content.push('</div>');

        return content.join('');
    }

    setTooltipFooter(options)
    {
        let header1                     = [];
        let header2                     = [];
        let content1                    = [];
        let content2                    = [];
        let mPowerProductionExponent    = options.mPowerProductionExponent || 1.3;

            // FIRST LINE
            if(options.circuit !== undefined && options.circuit !== null)
            {
                header1.push('<td class="text-center mb-1 px-1"><i class="fas fa-plug"></td>');
            }
            if(options.powerUsed !== undefined || options.powerGenerated !== undefined)
            {
                header1.push('<td class="text-center mb-1 px-1"><i class="fas fa-bolt"></td>');
            }

            if(options.circuit !== undefined && options.circuit !== null)
            {
                content1.push('<td class="text-center text-warning small px-1">#' + options.circuit.circuitId + '</td>');
            }
            if(options.powerUsed !== undefined)
            {
                content1.push('<td class="text-center text-warning small px-1">' + +(Math.round(options.powerUsed * 100) / 100) + 'MW</td>');
            }
            if(options.powerGenerated !== undefined && options.clockSpeed !== undefined)
            {
                content1.push('<td class="text-center text-warning small px-1">' + +(Math.round((options.powerGenerated * Math.pow(options.clockSpeed, 1 / mPowerProductionExponent)) * 100) / 100) + 'MW</td>');
            }

            // SECOND LINE
            if(options.craftingTime !== undefined && options.clockSpeed !== undefined)
            {
                header2.push('<td class="text-center mb-1 px-1"><i class="fas fa-stopwatch"></i></td>');
            }
            if(options.burningTime !== undefined)
            {
                header2.push('<td class="text-center mb-1 px-1"><i class="fas fa-stopwatch"></i></td>');
            }

            if(options.craftingTime !== undefined && options.clockSpeed !== undefined)
            {
                content2.push('<td class="text-center text-warning small px-1">' + +(Math.round(options.craftingTime * options.clockSpeed * 100) / 100) + 's</td>');
            }
            if(options.burningTime !== undefined)
            {
                content2.push('<td class="text-center text-warning small px-1">' + +(Math.round(options.burningTime * 100) / 100) + 's</td>');
            }

        if(options.singleLine !== undefined && options.singleLine === true)
        {
            return '<div class="mt-1"><table class="mr-auto ml-auto" style="font-size: 12px;line-height: 1;"><tr>' + header1.join('') + header2.join('') + '</tr><tr>' + content1.join('') + content2.join('') + '</tr></table></div>';
        }

        return '<div class="mt-1"><table class="mr-auto ml-auto" style="font-size: 12px;line-height: 1;"><tr>' + header1.join('') + '</tr><tr>' + content1.join('') + '</tr></table></div>'
             + '<div class="mt-1"><table class="mr-auto ml-auto" style="font-size: 12px;line-height: 1;"><tr>' + header2.join('') + '</tr><tr>' + content2.join('') + '</tr></table></div>';
    }

    /*
     * SHARED PARTS
     */
    static genericUIBackgroundStyle(baseLayout)
    {
        return 'border: 19px solid #ffffff;border-image: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/UI_Screen.png?v=' + baseLayout.scriptVersion + ') 20 repeat;background: #ffffff;background-clip: padding-box;';
    }

    static getStandByPanel(baseLayout, currentObject, top = 435, left = 420, topLabel = 460, leftLabel = 355)
    {
        let content             = [];
        let imageFile           = 'StandbyButtonPressed.png';
            if(baseLayout.getBuildingIsOn(currentObject) === false)
            {
                imageFile = 'StandbyButtonUnpressed.png';
            }

            content.push('<div style="position: absolute;margin-top: ' + top + 'px;margin-left: ' + left + 'px;">');
                content.push('<img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/' + imageFile + '?v=' + baseLayout.scriptVersion + '" />');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: ' + topLabel + 'px;margin-left: ' + leftLabel + 'px; width: 60px;' + BaseLayout_Tooltip.styleLabels + '"><strong>STANDBY</strong></div>');

        return content.join('');
    }

    static setCircuitStatisticsGraph(baseLayout, circuitStatistics, width = 315)
    {
        let content     = [];
        let maxValue    = Math.max(circuitStatistics.consumption, circuitStatistics.production, circuitStatistics.capacity, circuitStatistics.maxConsumption);

            content.push('<div class="d-flex" style="margin: -9px;margin-top: -11px;height: 113px;">');
                content.push('<div class="justify-content-center align-self-center h-100 text-center" style="width: ' + ((circuitStatistics.powerStoredCapacity > 0) ? (width - 89) : (width - 19)) + 'px;">');
                    content.push('<div style="height: 75px;padding-top: 5px;position: relative;">');
                        content.push('<hr style="position: absolute;width: 100%;margin-top: ' + Math.round(65 - (circuitStatistics.consumption / maxValue * 65)) + 'px;background-color: #e59344;" />')
                        content.push('<hr style="position: absolute;width: 100%;margin-top: ' + Math.round(65 - (circuitStatistics.production / maxValue * 65)) + 'px;background-color: #717172;" />')
                        content.push('<hr style="position: absolute;width: 100%;margin-top: ' + Math.round(65 - (circuitStatistics.capacity / maxValue * 65)) + 'px;background-color: #cccbcb;" />')
                        content.push('<hr style="position: absolute;width: 100%;margin-top: ' + Math.round(65 - (circuitStatistics.maxConsumption / maxValue * 65)) + 'px;background-color: #62aac7;" />')
                    content.push('</div>');

                    content.push('<div style="border-top: 1px solid #666666;height: 30px;padding-top: 3px;">');
                        content.push('<table style="line-height: 12px;font-size: 9px;" class="w-100">');
                            content.push('<tr>');
                                content.push('<td style="color: #e59344;">Consum. <strong>' + new Intl.NumberFormat(baseLayout.language).format(Math.round(circuitStatistics.consumption * 10) / 10) + 'MW</strong></td>');
                                content.push('<td style="color: #717172;">Production <strong>' + new Intl.NumberFormat(baseLayout.language).format(Math.round(circuitStatistics.production * 10) / 10) + 'MW</strong></td>');
                            content.push('</tr>');

                            content.push('<tr>');
                                content.push('<td style="color: #cccbcb;">Capacity <strong>' + new Intl.NumberFormat(baseLayout.language).format(Math.round(circuitStatistics.capacity * 10) / 10) + 'MW</strong></td>');
                                content.push('<td style="color: #62aac7;">Max. Cons. <strong>' + new Intl.NumberFormat(baseLayout.language).format(Math.round(circuitStatistics.maxConsumption * 10) / 10) + 'MW</strong></td>');
                            content.push('</tr>');
                    content.push('</table>');
                    content.push('</div>');
                content.push('</div>');

                if(circuitStatistics.powerStoredCapacity > 0)
                {
                    let percentageCharge = circuitStatistics.powerStored / circuitStatistics.powerStoredCapacity * 100;
                        content.push('<div class="h-100 text-center" style="width: 70px;background-color: #151515;margin-right: -1px;">');

                            // PROGRESS
                            content.push('<div style="position: absolute;margin-top: 3px;margin-left: 5px; width: 60px;height: 89px;border:2px solid #FFFFFF;border-radius: 4px;">');

                                content.push('<div style="position: absolute;margin-top: 1px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 80) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge > 80 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 1px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ff33;"' + ((percentageCharge > 80 && percentageCharge < 100) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 80)
                                {
                                    content.push('<div style="position: absolute;margin-top: 1px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 80 && percentageCharge <= 100) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 15px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 60) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge > 60 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 15px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ff66;"' + ((percentageCharge > 60 && percentageCharge <= 80) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 60)
                                {
                                    content.push('<div style="position: absolute;margin-top: 15px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 60 && percentageCharge <= 80) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 29px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 40) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge > 40 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 29px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ff99;"' + ((percentageCharge > 40 && percentageCharge <= 60) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 40)
                                {
                                    content.push('<div style="position: absolute;margin-top: 29px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 40 && percentageCharge <= 60) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 43px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 20) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge > 20 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 43px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ffcc;"' + ((percentageCharge > 20 && percentageCharge <= 40) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0 && percentageCharge > 20)
                                {
                                    content.push('<div style="position: absolute;margin-top: 43px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 20 && percentageCharge <= 40) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 57px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: ' + ((percentageCharge > 0) ? '#666666' : '#313131') + ';"></div>');
                                if(circuitStatistics.powerStorageChargeRate > 0 && percentageCharge < 100)
                                {
                                    content.push('<div style="position: absolute;margin-top: 57px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #00ffff;"' + ((percentageCharge > 0 && percentageCharge <= 20) ? ' class="blink"' : '') + '></div>');
                                }
                                if(circuitStatistics.powerStorageDrainRate > 0)
                                {
                                    content.push('<div style="position: absolute;margin-top: 57px;margin-left: 1px; width: 54px;height: 13px;border-radius: 4px;background: #F39C12;"' + ((percentageCharge > 0 && percentageCharge <= 20) ? ' class="blink"' : '') + '></div>');
                                }

                                content.push('<div style="position: absolute;margin-top: 71px;width: 56px;height: 15px;background: #FFFFFF;line-height: 15px;text-align: center;" class="small ' + ((circuitStatistics.powerStorageDrainRate > 0) ? 'text-warning' : '') + '"><strong>' + Math.floor(percentageCharge) + '%</strong></div>');

                                if(circuitStatistics.powerStoredTimeUntilCharged !== null)
                                {
                                    let pad                 = function(num, size) { return ('000' + num).slice(size * -1); },
                                        time                = parseFloat(circuitStatistics.powerStoredTimeUntilCharged).toFixed(3),
                                        hours               = Math.floor(time / 60 / 60),
                                        minutes             = Math.floor(time / 60) % 60,
                                        seconds             = Math.floor(time - minutes * 60);

                                        content.push('<div style="position: absolute;margin-top: 90px;width: 56px;height: 15px;color: #FFFFFF;line-height: 15px;text-align: center;font-size: 9px;"><strong>' + hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's</strong></div>');
                                }
                                if(circuitStatistics.powerStoredTimeUntilDrained !== null)
                                {
                                    let pad                 = function(num, size) { return ('000' + num).slice(size * -1); },
                                        time                = parseFloat(circuitStatistics.powerStoredTimeUntilDrained).toFixed(3),
                                        hours               = Math.floor(time / 60 / 60),
                                        minutes             = Math.floor(time / 60) % 60,
                                        seconds             = Math.floor(time - minutes * 60);

                                        content.push('<div style="position: absolute;margin-top: 90px;width: 56px;height: 15px;color: #FFFFFF;line-height: 15px;text-align: center;font-size: 9px;"><strong>' + hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's</strong></div>');
                                }

                            content.push('</div>');

                        content.push('</div>');
                }
            content.push('</div>');

        return content.join('');
    }
}