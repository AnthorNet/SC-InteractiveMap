/* global L, Promise, bootbox, Infinity, Intl, Sentry */

import BaseLayout_Spawn_Circle                  from './BaseLayout/SpawnCircle.js';
//import BaseLayout_Spawn_CorkScrew               from './BaseLayout/SpawnCorkScrew.js';
import BaseLayout_Spawn_Rectangle               from './BaseLayout/SpawnRectangle.js';
import BaseLayout_Spawn_Polygon                 from './BaseLayout/SpawnPolygon.js';
import BaseLayout_Spawn_Blueprint               from './BaseLayout/SpawnBlueprint.js';
import BaseLayout_Spawn_Text                    from './BaseLayout/SpawnText.js';

import BaseLayout_Selection_Offset              from './BaseLayout/SelectionOffset.js';
import BaseLayout_Selection_Rotate              from './BaseLayout/SelectionRotate.js';
import BaseLayout_Selection_Delete              from './BaseLayout/SelectionDelete.js';
import BaseLayout_Selection_Copy                from './BaseLayout/SelectionCopy.js';

import BaseLayout_ContextMenu                   from './BaseLayout/ContextMenu.js';
import BaseLayout_Tooltip                       from './BaseLayout/Tooltip.js';
import BaseLayout_History                       from './BaseLayout/History.js';
import BaseLayout_Math                          from './BaseLayout/Math.js';

import BaseLayout_Statistics_Player_Inventory   from './BaseLayout/StatisticsPlayerInventory.js';
import BaseLayout_Statistics_Player_Hotbars     from './BaseLayout/StatisticsPlayerHotbars.js';
import BaseLayout_Statistics_Production         from './BaseLayout/StatisticsProduction.js';
import BaseLayout_Statistics_Storage            from './BaseLayout/StatisticsStorage.js';
import BaseLayout_Statistics_Power              from './BaseLayout/StatisticsPower.js';
import BaseLayout_Statistics_Collectables       from './BaseLayout/StatisticsCollectables.js';
import BaseLayout_Statistics_Schematics         from './BaseLayout/StatisticsSchematics.js';

import BaseLayout_Modal_Buildings               from './BaseLayout/ModalBuildings.js';
import BaseLayout_Modal_Trains                  from './BaseLayout/ModalTrains.js';

import BaseLayout_Map_ColorSlots                from './BaseLayout/MapColorSlots.js';
import BaseLayout_Map_Options                   from './BaseLayout/MapOptions.js';

export default class BaseLayout
{
    constructor(options)
    {
        this.useDebug                           = (options.debug !== undefined) ? options.debug : false;
        this.useBuild                           = (options.build !== undefined) ? options.build : 'EarlyAccess';
        this.scriptVersion                      = (options.version !== undefined) ? options.version : Math.floor(Math.random() * Math.floor(9999999999));
        this.staticUrl                          = options.staticUrl;

        this.satisfactoryMap                    = options.satisfactoryMap;
        this.saveGameParser                     = options.saveGameParser;

        this.saveGameInternalPointer            = {};
        this.saveGameSigns                      = [];
        this.saveGamePipeNetworks               = {};
        this.saveGameRailSwitches               = {};
        this.saveGameRailVehicles               = [];
        this.gameState                          = [];
        this.gameMode                           = [];
        this.playersState                       = [];
        this.playersInventory                   = [];
        this.buildingDataClassNameHashTable     = {};
        this.radioactivityLayerNeedsUpdate      = false;

        this.updateAltitudeLayersIsRunning      = false;
        this.altitudeSliderControl              = null;
        this.lassoControl                       = null;
        this.clipboard                          = null;
        this.clipboardControl                   = null;
        this.history                            = null;

        this.dataUrl                            = options.dataUrl;
        this.buildingsData                      = null;
        this.itemsData                          = null;
        this.toolsData                          = null;
        this.recipesData                        = null;
        this.schematicsData                     = null;

        this.modsData                           = null;
        this.modsUrl                            = options.modsUrl;

        this.language                           = options.language;

        this.collectedHardDrives                = new HardDrives({language: options.language});
        this.collectedSchematics                = new Schematics({language: options.language});
        this.localStorage                       = this.collectedHardDrives.getLocaleStorage();

        this.useRadioactivity                   = (this.localStorage !== null && this.localStorage.getItem('mapUseRadioactivity') !== null) ? (this.localStorage.getItem('mapUseRadioactivity') === 'true') : true;
        this.useFogOfWar                        = (this.localStorage !== null && this.localStorage.getItem('mapUseFogOfWar') !== null) ? (this.localStorage.getItem('mapUseFogOfWar') === 'true') : true;
        this.useDetailedModels                  = (this.localStorage !== null && this.localStorage.getItem('mapUseDetailedModels') !== null) ? (this.localStorage.getItem('mapUseDetailedModels') === 'true') : true;
        this.useSmoothFactor                    = (this.localStorage !== null && this.localStorage.getItem('mapUseSmoothFactor') !== null) ? parseInt(this.localStorage.getItem('mapUseSmoothFactor')) : 1;

        this.availablePowerConnection           = ['.PowerInput', '.PowerConnection', '.PowerConnection1', '.PowerConnection2', '.FGPowerConnection', '.SlidingShoe'];
        this.availableBeltConnection            = ['.ConveyorAny0', '.ConveyorAny1', '.Input0', '.Input1', '.Input2', '.Input3', '.InPut3', '.Input4', '.Input5', '.Input6', '.Output0', '.Output1', '.Output2', '.Output3'];
        this.availableRailwayConnection         = ['.TrackConnection0', '.TrackConnection1'];
        this.availablePlatformConnection        = ['.PlatformConnection0', '.PlatformConnection1'];
        this.availablePipeConnection            = ['.PipeInputFactory', '.PipeOutputFactory', '.PipelineConnection0', '.PipelineConnection1', '.FGPipeConnectionFactory', '.Connection0', '.Connection1', '.Connection2', '.Connection3', '.ConnectionAny0', '.ConnectionAny1'];
        this.availableHyperPipeConnection       = ['.PipeHyperConnection0', '.PipeHyperConnection1', '.PipeHyperStartConnection'];

        this.availableBelts                     = [
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk1/Build_ConveyorBeltMk1.Build_ConveyorBeltMk1_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk2/Build_ConveyorBeltMk2.Build_ConveyorBeltMk2_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk3/Build_ConveyorBeltMk3.Build_ConveyorBeltMk3_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk4/Build_ConveyorBeltMk4.Build_ConveyorBeltMk4_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk5/Build_ConveyorBeltMk5.Build_ConveyorBeltMk5_C'
        ];
        this.availableLifts                     = [
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk1/Build_ConveyorLiftMk1.Build_ConveyorLiftMk1_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk2/Build_ConveyorLiftMk2.Build_ConveyorLiftMk2_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk3/Build_ConveyorLiftMk3.Build_ConveyorLiftMk3_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk4/Build_ConveyorLiftMk4.Build_ConveyorLiftMk4_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk5/Build_ConveyorLiftMk5.Build_ConveyorLiftMk5_C'
        ];
        this.availablePowerPoles                = [
            '/Game/FactoryGame/Buildable/Factory/PowerPoleMk1/Build_PowerPoleMk1.Build_PowerPoleMk1_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleMk2/Build_PowerPoleMk2.Build_PowerPoleMk2_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleMk3/Build_PowerPoleMk3.Build_PowerPoleMk3_C'
        ];
        this.availablePowerPolesWall            = [
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall.Build_PowerPoleWall_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall_Mk2.Build_PowerPoleWall_Mk2_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall_Mk3.Build_PowerPoleWall_Mk3_C'
        ];
        this.availablePowerPolesWallDouble      = [
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble.Build_PowerPoleWallDouble_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble_Mk2.Build_PowerPoleWallDouble_Mk2_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble_Mk3.Build_PowerPoleWallDouble_Mk3_C'
        ];

        this.detailedModels                     = {};
        this.pipeLetters                        = null;

        this.setDefaultLayers();
    }

    setDefaultLayers()
    {
        this.ownPlayerPath                      = null;
        this.delayedBadgeCount                  = null;

        this.playerLayers                       = {
            playerRadioactivityLayer                : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: {}},

            playerFoundationsLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerDecorationsLayer', elements: [], useAltitude: true, filters: []},
            playerPillarsLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerDecorationsLayer', elements: [], useAltitude: true, filters: []},
            playerWallsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerDecorationsLayer', elements: [], useAltitude: true, filters: []},
            playerWalkwaysLayer                     : {layerGroup: null, subLayer: null, mainDivId: '#playerDecorationsLayer', elements: [], useAltitude: true, filters: []},
            playerStatuesLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerDecorationsLayer', elements: [], useAltitude: true},

            playerHUBTerminalLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: [], useAltitude: true},
            playerUnknownLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: [], useAltitude: true},
            playerOrientationLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: [], count: 0, useAltitude: true},

            playerCratesLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: [], count: 0, useAltitude: true},
            playerMinersLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], useAltitude: true, filters: []},
            playerProductorsLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], useAltitude: true, filters: []},
            playerPadsLayer                         : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], useAltitude: true, filters: []},

            playerBiomassGeneratorsLayer            : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: [], useAltitude: true},
            playerCoalGeneratorsLayer               : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: [], useAltitude: true},
            playerFuelGeneratorsLayer               : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: [], useAltitude: true},
            playerNuclearGeneratorsLayer            : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: [], useAltitude: true},
            playerGeoThermalGeneratorsLayer         : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: [], useAltitude: true},

            playerStoragesLayer                     : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], useAltitude: true, filters: []},

            playerVehiculesLayer                    : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], count: 0, useAltitude: true, filters: []},
            playerBeltsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], distance: 0, useAltitude: true, filters: []},
            playerPipesLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], distance: 0, useAltitude: true, filters: []},
            playerPipesHyperLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], distance: 0, useAltitude: true, filters: []},

            playerTracksLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], distance: 0, useAltitude: true},
            playerTrainsLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], useAltitude: true},

            playerPowerGridLayer                    : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: [], count: 0, distance: 0, useAltitude: true},

            // Last...
            playerResourceDepositsLayer             : {layerGroup: null, subLayer: null, elements: [], useAltitude: true},
            playerItemsPickupLayer                  : {layerGroup: null, subLayer: null, elements: [], useAltitude: true},
            playerPositionLayer                     : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer'},
            playerSpaceRabbitLayer                  : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer', count: 0, useAltitude: true},
            playerFaunaLayer                        : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer', useAltitude: true},
            playerFogOfWar                          : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer'}
        };

        // Reset mods layer...
        for(let modId in this.modsData)
        {
            if(this.modsData[modId].isLoaded !== undefined && this.modsData[modId].isLoaded === true)
            {
                let layerId                     = 'playerMods' + modId + 'Layer';
                this.setupModSubLayer(modId, layerId);
            }
        }

        this.playerStatistics                   = {
            collectables                            : {
                '/Game/FactoryGame/World/Benefit/NutBush/BP_NutBush.BP_NutBush_C': {items: [], layerId: 'berylNut'},
                '/Game/FactoryGame/World/Benefit/BerryBush/BP_BerryBush.BP_BerryBush_C': {items: [], layerId: 'paleBerry'},
                '/Game/FactoryGame/World/Benefit/Mushroom/BP_Shroom_01.BP_Shroom_01_C': {items: [], layerId: 'baconAgaric'},

                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal.BP_Crystal_C': {items: [], layerId: 'greenSlugs'},
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk2.BP_Crystal_mk2_C': {items: [], layerId: 'yellowSlugs'},
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk3.BP_Crystal_mk3_C': {items: [], layerId: 'purpleSlugs'},

                '/Game/FactoryGame/Prototype/WAT/BP_WAT1.BP_WAT1_C': {items: [], layerId: 'somersloops'},
                '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C': {items: [], layerId: 'mercerSpheres'},

                '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C': {items: [], layerId: 'hardDrives'}
            }
        };

        $('.setBaseLayer').show();
    }

    reset()
    {
        console.time('resetBaseLayout');

        $('#downloadSaveGame').off('click');
        $('.updatePlayerLayerState').off('click');
        $('.updatePlayerLayerFilter').off('click');
        $('#playerModsLayer .col-12').empty();
        $('#statisticsModal').off('show.bs.modal');
        $('#statisticsModal').off('hide.bs.modal');
        $('#statisticsModal a[data-toggle="tab"]').off('shown.bs.tab');
        $('#researchModal').off('show.bs.modal');
        $('#optionsModal').off('show.bs.modal');
        $('#buildingsModal').off('show.bs.modal');

        for(let pathName in this.satisfactoryMap.collectableMarkers)
        {
            this.satisfactoryMap.collectableMarkers[pathName].setOpacity(1);
        }

        for(let layerId in this.playerLayers)
        {
            $('.updatePlayerLayerState[data-id=' + layerId + ']').removeClass(window.SCIM.outlineClass).hide();
            $(this.playerLayers[layerId].mainDivId).hide();
            $('.updatePlayerLayerState[data-id=' + layerId + '] .badge-layer').empty();

            if(this.playerLayers[layerId].subLayer !== null)
            {
                this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer);
                this.playerLayers[layerId].subLayer = null;
                this.satisfactoryMap.leafletMap.removeLayer(this.playerLayers[layerId].layerGroup);
            }
            if(this.playerLayers[layerId].filters !== undefined)
            {
                this.playerLayers[layerId].filters      = [];
                this.playerLayers[layerId].filtersCount = {};

                $('.updatePlayerLayerFilter[data-id=' + layerId + ']').hide();
            }
        }

        this.satisfactoryMap.leafletMap.removeControl(this.altitudeSliderControl);
        this.altitudeSliderControl  = null;

        this.satisfactoryMap.leafletMap.removeControl(this.lassoControl);
        this.lassoControl           = null;

        this.satisfactoryMap.leafletMap.removeControl(this.clipboardControl);
        this.clipboardControl       = null;

        if(this.history !== null)
        {
            this.history.removeControl();
            this.history = null;
        }


        $('#saveGameInformation').empty();

        $('#statisticsModalProduction').empty();
        $('#statisticsModalStorage').empty();
        $('#statisticsModalPower').empty();

        $('#statisticsModalSchematics').empty();
        $('#statisticsModalAlternateRecipes').empty();
        $('#statisticsModalMAM').empty();
        $('#statisticsModalAwesomeSink').empty();

        $('#statisticsPlayerInventory').empty();
        $('#statisticsPlayerHotBars').empty();
        $('#statisticsModalCollectables').empty();
        $('#statisticsModalColorSlots').empty();
        $('#statisticsModalOptions').empty();

        $('#buildingsModalExtraction').empty();
        $('#buildingsModalProduction').empty();
        $('#buildingsModalGenerators').empty();
        $('#buildingsModalStorage').empty();
        $('#buildingsModalDockstation').empty();

        $('#statisticsModalTrains').empty();

        $('#genericModal .modal-title').empty();
        $('#genericModal .modal-body').empty();

        $('#buildingsButton').hide();
        $('#trainsButton').hide();
        $('#statisticsButton').hide();
        $('#researchButton').hide();
        $('#optionsButton').hide();
        $('#altitudeSliderInputs').hide();

        this.detailedModels = {};

        console.timeEnd('resetBaseLayout');
    }

    draw()
    {
        this.collectedHardDrives.resetCollected();
        this.collectedSchematics.resetCollected();

        this.saveGameParser.load(function(){
            if(this.buildingsData === null)
            {
                return new Promise(function(resolve){
                    $('#loaderProgressBar .progress-bar').css('width', '47.5%');
                    $('.loader h6').html('Loading game data...');
                    setTimeout(resolve, 50);
                }.bind(this)).then(function(){
                    $.getJSON(this.dataUrl + '?v=' + this.scriptVersion, function(data)
                    {
                        this.modsData       = data.modsData;
                        this.buildingsData  = data.buildingsData;
                        this.itemsData      = data.itemsData;
                        this.toolsData      = data.toolsData;
                        this.recipesData    = data.recipesData;
                        this.schematicsData = data.schematicsData;

                        for(let recipeId in this.recipesData)
                        {
                            if(this.recipesData[recipeId].className !== undefined && this.recipesData[recipeId].className.startsWith('/Game/FactoryGame/') === false)
                            {
                                this.recipesData[recipeId].className = '/Game/FactoryGame/Recipes/' + this.recipesData[recipeId].className;
                            }
                        }

                        for(let schematicId in this.schematicsData)
                        {
                            if(this.schematicsData[schematicId].className !== undefined && this.schematicsData[schematicId].className.startsWith('/Game/FactoryGame/Schematics/') === false)
                            {
                                this.schematicsData[schematicId].className = '/Game/FactoryGame/Schematics/' + this.schematicsData[schematicId].className;
                            }
                        }

                        this.loadDetailedModels();
                    }.bind(this));
                }.bind(this));
            }
            else
            {
                this.loadDetailedModels();
            }
        }.bind(this));
    }

    loadMod(modId, resolve)
    {
        // Check if the modId exists...
        if(this.modsData[modId] !== undefined)
        {
            if(this.modsData[modId].loading === undefined)
            {
                this.modsData[modId].loading = true;
                console.time('Loading mod: ' + this.modsData[modId].name);

                $.getJSON(this.modsUrl + '/id/' + modId, function(data){
                    if(data.Buildings !== undefined)
                    {
                        let layerId = 'playerMods' + modId + 'Layer';
                            this.setupModSubLayer(modId, layerId);

                        for(let building in data.Buildings)
                        {
                            this.buildingsData[building]            = data.Buildings[building];
                            this.buildingsData[building].mapLayer   = layerId;

                            if(this.buildingsData[building].detailedModel !== undefined)
                            {
                                if(this.detailedModels[this.buildingsData[building].className] === undefined)
                                {
                                    this.detailedModels[this.buildingsData[building].className] = JSON.parse(this.buildingsData[building].detailedModel);
                                }

                                delete this.buildingsData[building].detailedModel;
                            }

                            // Add radial button
                            let htmlButton = '<button class="btn btn-warning updatePlayerLayerFilter m-1 p-1" style="display: none;" data-id="' + layerId + '" data-filter="' + this.buildingsData[building].className + '" data-hover="tooltip" title="' + this.buildingsData[building].name + '">\
                                                  <span class="badge badge-secondary badge-layer"></span><img src="' + this.buildingsData[building].image + '" style="width: 40px;" />\
                                              </button>';
                            $('#playerModsLayer .updatePlayerLayerState[data-id="' + layerId + '"] .radial div').append(htmlButton);
                        }
                    }
                    if(data.Items !== undefined)
                    {
                        for(let item in data.Items)
                        {
                            this.itemsData[item]                    = data.Items[item];
                        }
                    }
                    if(data.Tools !== undefined)
                    {
                        for(let tool in data.Tools)
                        {
                            this.toolsData[tool]                    = data.Tools[tool];
                        }
                    }
                    if(data.Recipes !== undefined)
                    {
                        for(let recipe in data.Recipes)
                        {
                            this.recipesData[recipe]                = data.Recipes[recipe];
                        }
                    }
                    if(data.Schematics !== undefined)
                    {
                        for(let schematic in data.Schematics)
                        {
                            this.schematicsData[schematic]          = data.Schematics[schematic];
                        }
                    }

                    // Mod is loaded, add object waiting in queue...
                    this.modsData[modId].loading = false;
                    if(this.modsData[modId].queue !== undefined)
                    {
                        while(this.modsData[modId].queue.length > 0)
                        {
                            this.modsData[modId].queue.shift()();
                        }
                    }

                    console.timeEnd('Loading mod: ' + this.modsData[modId].name);
                    return resolve();
                }.bind(this));

                return;
            }
            else
            {
                // Add object to queue until the mod is fully loaded...
                if(this.modsData[modId].loading === true)
                {
                    if(this.modsData[modId].queue === undefined)
                    {
                        this.modsData[modId].queue = [];
                    }

                    this.modsData[modId].queue.push(resolve);
                    return;
                }
            }
        }

        return resolve();
    }

    loadDetailedModels()
    {
        if(this.useDetailedModels)
        {
            return new Promise(function(resolve){
                $('#loaderProgressBar .progress-bar').css('width', '50%');
                $('.loader h6').html('Loading detailed models...');
                setTimeout(resolve, 50);
            }.bind(this)).then(function(){
                $.getJSON(this.staticUrl + '/js/InteractiveMap/build/detailedModels.json?v=' + this.scriptVersion, function(data)
                {
                    for(let className in data)
                    {
                        this.detailedModels[className] = data[className];
                    }

                    // Duplicates
                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x1_01.Build_Foundation_8x1_01_C']                                                        = this.detailedModels['/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x4_01.Build_Foundation_8x4_01_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x2_01.Build_Foundation_8x2_01_C']                                                        = this.detailedModels['/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x4_01.Build_Foundation_8x4_01_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x1_01.Build_Ramp_8x1_01_C']                                                                          = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x4_01.Build_Ramp_8x4_01_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble_8x1.Build_RampDouble_8x1_C']                                                                    = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x4_01.Build_Ramp_8x4_01_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_RampInverted_8x1.Build_RampInverted_8x1_C']                                                                = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x4_01.Build_Ramp_8x4_01_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x2_01.Build_Ramp_8x2_01_C']                                                                          = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x4_01.Build_Ramp_8x4_01_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble.Build_RampDouble_C']                                                                            = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x4_01.Build_Ramp_8x4_01_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_RampInverted_8x2_01.Build_RampInverted_8x2_01_C']                                                          = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x4_01.Build_Ramp_8x4_01_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x4_Inverted_01.Build_Ramp_8x4_Inverted_01_C']                                                        = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x4_01.Build_Ramp_8x4_01_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x8x8.Build_Ramp_8x8x8_C']                                                                            = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x4_01.Build_Ramp_8x4_01_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal_8x4_01.Build_Ramp_Diagonal_8x4_01_C']                                                        = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal_8x2_01.Build_Ramp_Diagonal_8x2_01_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal_8x1_02.Build_Ramp_Diagonal_8x1_02_C']                                                        = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal_8x2_02.Build_Ramp_Diagonal_8x2_02_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_RampInverted_8x1_Corner_01.Build_RampInverted_8x1_Corner_01_C']                                            = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal_8x2_02.Build_Ramp_Diagonal_8x2_02_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_RampInverted_8x2_Corner_01.Build_RampInverted_8x2_Corner_01_C']                                            = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal_8x2_02.Build_Ramp_Diagonal_8x2_02_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_RampInverted_8x4_Corner_01.Build_RampInverted_8x4_Corner_01_C']                                            = this.detailedModels['/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal_8x2_02.Build_Ramp_Diagonal_8x2_02_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/CA_SplitterSmart/Build_ConveyorAttachmentSplitterSmart.Build_ConveyorAttachmentSplitterSmart_C']                       = this.detailedModels['/Game/FactoryGame/Buildable/Factory/CA_Splitter/Build_ConveyorAttachmentSplitter.Build_ConveyorAttachmentSplitter_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/CA_SplitterProgrammable/Build_ConveyorAttachmentSplitterProgrammable.Build_ConveyorAttachmentSplitterProgrammable_C']  = this.detailedModels['/Game/FactoryGame/Buildable/Factory/CA_Splitter/Build_ConveyorAttachmentSplitter.Build_ConveyorAttachmentSplitter_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/MinerMk2/Build_MinerMk2.Build_MinerMk2_C']                                                                             = this.detailedModels['/Game/FactoryGame/Buildable/Factory/MinerMK1/Build_MinerMk1.Build_MinerMk1_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/MinerMk3/Build_MinerMk3.Build_MinerMk3_C']                                                                             = this.detailedModels['/Game/FactoryGame/Buildable/Factory/MinerMK1/Build_MinerMk1.Build_MinerMk1_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/StorageContainerMk2/Build_StorageContainerMk2.Build_StorageContainerMk2_C']                                            = this.detailedModels['/Game/FactoryGame/Buildable/Factory/StorageContainerMk1/Build_StorageContainerMk1.Build_StorageContainerMk1_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainPlatformEmpty.Build_TrainPlatformEmpty_C']                                                    = this.detailedModels['/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C']                                                  = this.detailedModels['/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C']                                      = this.detailedModels['/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall_Mk2.Build_PowerPoleWall_Mk2_C']                                                      = this.detailedModels['/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall.Build_PowerPoleWall_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall_Mk3.Build_PowerPoleWall_Mk3_C']                                                      = this.detailedModels['/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall.Build_PowerPoleWall_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble_Mk2.Build_PowerPoleWallDouble_Mk2_C']                                    = this.detailedModels['/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble.Build_PowerPoleWallDouble_C'];
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble_Mk3.Build_PowerPoleWallDouble_Mk3_C']                                    = this.detailedModels['/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble.Build_PowerPoleWallDouble_C'];

                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C']                                                 = JSON.parse(JSON.stringify(this.detailedModels['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C']));
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].scale                                           = 2.25;

                    /*
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/ResourceSink/Build_ResourceSink.Build_ResourceSink_C'] = {
                        "scale": 1,
                        "forms": [
                            {
                                "points": [
                                    [-520, 600], [-520, -700],
                                    [900, -700], [900, 135],
                                    [510, 135], [510, 600]
                                ]
                            }
                        ]
                    }
                    */

                    this.renderObjects();
                }.bind(this));
            }.bind(this));
        }
        else
        {
            this.renderObjects();
        }
    }

    renderObjects()
    {
        return new Promise(function(resolve){
            let header                  = this.saveGameParser.getHeader();
            let pad                     = function(num, size) { return ('000' + num).slice(size * -1); },
                time                    = parseFloat(header.playDurationSeconds).toFixed(3),
                hours                   = Math.floor(time / 60 / 60),
                minutes                 = Math.floor(time / 60) % 60,
                seconds                 = Math.floor(time - minutes * 60);

                $('#saveGameInformation').html('<strong>' + header.sessionName + '</strong> <em><small>(' + hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's)</small></em>');

            $('#loaderProgressBar .progress-bar').css('width', '50%');
            $('.loader h6').html('Rendering objects...');
            console.time('renderObjects');
            setTimeout(resolve, 50);
        }.bind(this)).then(function(){
            this.parsingObjects = this.parseObjects();
        }.bind(this));
    }

    parseObjects(i = 0)
    {
        let objects                 = this.saveGameParser.getObjects();
        let countObjects            = objects.length;
        let parseObjectsProgress    = Math.round(i / countObjects * 100);
        let promises                = [];

        if(countObjects > 500000)
        {
            this.useDetailedModels = false;
        }

        for(i; i < countObjects; i++)
        {
            let currentObject = objects[i];

            // Skip
            if([
                '/Script/FactoryGame.FGWorldSettings',
                '/Script/FactoryGame.FGFoundationSubsystem',
                '/Game/FactoryGame/-Shared/Blueprint/BP_BuildableSubsystem.BP_BuildableSubsystem_C',
                '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C',
                '/Game/FactoryGame/-Shared/Blueprint/BP_RailroadSubsystem.BP_RailroadSubsystem_C',
                '/Script/FactoryGame.FGPipeSubsystem',
                '/Script/FactoryGame.FGResourceSinkSubsystem', //TODO: Handle...

                '/Game/FactoryGame/Buildable/Factory/TradingPost/BP_StartingPod.BP_StartingPod_C',

                '/Script/FactoryGame.FGRecipeManager',
                '/Game/FactoryGame/Schematics/Progression/BP_SchematicManager.BP_SchematicManager_C',
                '/Game/FactoryGame/Recipes/Research/BP_ResearchManager.BP_ResearchManager_C',
                '/Game/FactoryGame/Unlocks/BP_UnlockSubsystem.BP_UnlockSubsystem_C',
                '/Game/FactoryGame/Events/BP_EventSubsystem.BP_EventSubsystem_C',

                '/Game/FactoryGame/Schematics/Progression/BP_GamePhaseManager.BP_GamePhaseManager_C',
                '/Game/FactoryGame/-Shared/Blueprint/BP_StorySubsystem.BP_StorySubsystem_C',
                '/Game/FactoryGame/-Shared/Blueprint/BP_TimeOfDaySubsystem.BP_TimeOfDaySubsystem_C',
                '/Game/FactoryGame/-Shared/Blueprint/BP_TutorialIntroManager.BP_TutorialIntroManager_C',
                '/Game/FactoryGame/-Shared/Blueprint/BP_TutorialSubsystem.BP_TutorialSubsystem_C',

                '/Script/FactoryGame.FGFactoryConnectionComponent',
                '/Script/FactoryGame.FGFactoryLegsComponent',
                '/Script/FactoryGame.FGPipeConnectionFactory',
                '/Script/FactoryGame.FGPipeConnectionComponent',
                '/Game/FactoryGame/Buildable/Factory/PipeHyper/FGPipeConnectionComponentHyper.FGPipeConnectionComponentHyper_C',
                '/Script/FactoryGame.FGInventoryComponent',
                '/Script/FactoryGame.FGInventoryComponentEquipment',
                '/Script/FactoryGame.FGInventoryComponentTrash',
                '/Script/FactoryGame.FGPowerInfoComponent',
                '/Script/FactoryGame.FGRecipeShortcut',
                '/Script/FactoryGame.FGHealthComponent',

                '/Script/FactoryGame.FGRailroadTimeTable',
                '/Script/FactoryGame.FGRailroadTrackConnectionComponent',
                '/Script/FactoryGame.FGTrainPlatformConnection',

                '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C',
                '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C',

                '/Game/FactoryGame/World/Hazard/SporeCloudPlant/BP_SporeFlower.BP_SporeFlower_C',

                '/Script/FactoryGame.FGFoliageRemoval',
                '/Game/FactoryGame/Equipment/C4Dispenser/BP_DestructibleSmallRock.BP_DestructibleSmallRock_C',
                '/Game/FactoryGame/Equipment/C4Dispenser/BP_DestructibleLargeRock.BP_DestructibleLargeRock_C',

                '/Game/FactoryGame/Character/Creature/BP_CreatureSpawner.BP_CreatureSpawner_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_SpitterParts.BP_SpitterParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaSpitterParts.BP_AlphaSpitterParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_EliteStingerParts.BP_EliteStingerParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_HogParts.BP_HogParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_CrabEggParts.BP_CrabEggParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaHogParts.BP_AlphaHogParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_StingerParts.BP_StingerParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaStingerParts.BP_AlphaStingerParts_C',

                '/Game/FactoryGame/Buildable/Factory/WorkBench/Build_WorkBenchIntegrated.Build_WorkBenchIntegrated_C',
                '/Game/FactoryGame/Buildable/Factory/Mam/Build_MamIntegrated.Build_MamIntegrated_C',
                '/Game/FactoryGame/Buildable/Factory/HubTerminal/Build_HubTerminal.Build_HubTerminal_C',

                // MODS
                '/Game/EfficiencyCheckerMod/Buildings/EfficiencyChecker/Build_Pipeline_Stub.Build_Pipeline_Stub_C'
            ].includes(currentObject.className))
            {
                continue;
            }

            // Keep track of className max number
            if(this.saveGameInternalPointer[currentObject.className] === undefined)
            {
                this.saveGameInternalPointer[currentObject.className] = 0;
            }
            let currentObjectMax = currentObject.pathName.split('_').pop();
            if(isNaN(currentObjectMax) === true)
            {
                currentObjectMax = currentObject.pathName.match(/\d+$/);

                if(currentObjectMax !== null)
                {
                    this.saveGameInternalPointer[currentObject.className] = Math.max(this.saveGameInternalPointer[currentObject.className], parseInt(currentObjectMax[0]) + 1);
                }
            }
            else
            {
                // Specific case for when the mPipeNetworkID don't have the same id as the pathName...
                if(currentObject.className === '/Script/FactoryGame.FGPipeNetwork')
                {
                    let mPipeNetworkID = this.getObjectProperty(currentObject, 'mPipeNetworkID');
                        if(mPipeNetworkID !== null)
                        {
                            Math.max(parseInt(mPipeNetworkID), parseInt(currentObjectMax));
                        }
                }

                this.saveGameInternalPointer[currentObject.className] = Math.max(this.saveGameInternalPointer[currentObject.className], parseInt(currentObjectMax) + 1);
            }

            if(currentObject.className === '/Script/FactoryGame.FGPipeNetwork')
            {
                let mPipeNetworkID = this.getObjectProperty(currentObject, 'mPipeNetworkID');
                    if(mPipeNetworkID !== null)
                    {
                        this.saveGamePipeNetworks[mPipeNetworkID] = currentObject.pathName;
                    }
            }

            // Skip after keeping track of max ID
            if([
                '/Script/FactoryGame.FGPowerCircuit',
                '/Script/FactoryGame.FGPipeNetwork',
                '/Script/FactoryGame.FGPowerConnectionComponent',
                '/Script/FactoryGame.FGTargetPointLinkedList',
                '/Game/FactoryGame/Buildable/Vehicle/BP_VehicleTargetPoint.BP_VehicleTargetPoint_C'
            ].includes(currentObject.className))
            {
                continue;
            }

            // Store collectables total
            if([
                '/Game/FactoryGame/World/Benefit/NutBush/BP_NutBush.BP_NutBush_C',
                '/Game/FactoryGame/World/Benefit/BerryBush/BP_BerryBush.BP_BerryBush_C',
                '/Game/FactoryGame/World/Benefit/Mushroom/BP_Shroom_01.BP_Shroom_01_C',
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal.BP_Crystal_C',
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk2.BP_Crystal_mk2_C',
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk3.BP_Crystal_mk3_C',
                '/Game/FactoryGame/Prototype/WAT/BP_WAT1.BP_WAT1_C',
                '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C',
                '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C'
            ].includes(currentObject.className))
            {
                this.playerStatistics.collectables[currentObject.className].items.push(currentObject.pathName);
                continue;
            }

            if(currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C')
            {
                this.addResourceDeposit(currentObject);
                continue;
            }

            // Extract player own path and use it to grab player position...
            if(currentObject.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
            {
                this.gameState.push(currentObject);
                this.ownPlayerPath = currentObject.extra.game[0].pathName;
                continue;
            }
            if(currentObject.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C')
            {
                this.gameMode.push(currentObject);
                continue;
            }
            if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C')
            {
                this.playersState.push(currentObject);
                continue;
            }
            if(currentObject.className === '/Game/FactoryGame/Character/Player/Char_Player.Char_Player_C')
            {
                this.playersInventory.push(currentObject);
                continue;
            }
            if(currentObject.className === '/Script/FactoryGame.FGTrainStationIdentifier' || currentObject.className === '/Script/FactoryGame.FGTrain')
            {
                this.saveGameSigns.push(currentObject);
                continue;
            }

            if(currentObject.className === '/Script/FactoryGame.FGMapManager')
            {
                if(this.useFogOfWar === true)
                {
                    this.addFogOfWar(currentObject);
                }

                continue;
            }

            promises.push(new Promise(function(resolve){
                this.parseObject(currentObject, resolve);
            }.bind(this)));

            // Wait for promise to complete before launching next batch!
            let progress    = Math.round(i / countObjects * 100);
                if(progress > parseObjectsProgress)
                {
                    return Promise.all(promises).then(function(){
                        $('#loaderProgressBar .progress-bar').css('width', (50 + progress * 0.4) + '%');
                        $('.loader h6').html('Rendering objects (' + progress + '%)...');
                        setTimeout(function(){ this.parseObjects((i + 1)); }.bind(this), 5);
                    }.bind(this));
                }
        }

        console.timeEnd('renderObjects');

        this.minAltitude = Number.MAX_SAFE_INTEGER;
        this.maxAltitude = Number.MIN_SAFE_INTEGER;

        console.time('addMapLayers');

        return this.addLayers();
    }

    parseObject(currentObject, resolve = false, skipMod = false)
    {
        if(currentObject.className.startsWith('/Game/FactoryGame/') === false)
        {
            for(let modId in this.modsData)
            {
                if(currentObject.className.startsWith('/Game/' + modId) === true)
                {
                    if(this.modsData[modId] !== undefined)
                    {
                        if(this.modsData[modId].queuedPathName === undefined)
                        {
                            this.modsData[modId].queuedPathName = [];
                        }

                        if(this.modsData[modId].queuedPathName.includes(currentObject.pathName) === false)
                        {
                            this.modsData[modId].queuedPathName.push(currentObject.pathName);

                            return this.loadMod(modId, function(){
                                return this.parseObject(currentObject, resolve, skipMod);
                            }.bind(this));
                        }
                    }
                }
            }

            //TODO: Sentry new mod?
        }

        if(currentObject.className === '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C')
        {
            return this.addDecoration(currentObject, resolve, skipMod);
        }
        if(currentObject.className === '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
        {
            return this.addPortableMiner(currentObject, resolve, skipMod);
        }

        if(currentObject.className === '/Script/FactoryGame.FGItemPickup_Spawnable' || currentObject.className === '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C')
        {
            let building = this.addItemPickup(currentObject);
                if(resolve === false)
                {
                    return {layer: 'playerItemsPickupLayer', marker: building};
                }

            return resolve();
        }

        if(currentObject.className === '/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C')
        {
            let building = this.addPlayerBeacon(currentObject);
                if(resolve === false)
                {
                    return {layer: 'playerOrientationLayer', marker: building};
                }

            return resolve();
        }

        if(currentObject.className === '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C')
        {
            let building = this.addPlayerLootCrate(currentObject);
                if(resolve === false)
                {
                    return {layer: 'playerCratesLayer', marker: building};
                }

            return resolve();
        }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C')
        {
            this.saveGameRailSwitches[currentObject.pathName] = currentObject;
        }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C' || currentObject.className === '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C')
        {
            let building = this.addPlayerPowerLine(currentObject);
                if(resolve === false)
                {
                    return {layer: 'playerPowerGridLayer', marker: building};
                }

            return resolve();
        }

        if(
                currentObject.className === '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C'
             || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C'
             || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipeHyper/Build_PipeHyper.Build_PipeHyper_C'
             // Mods
             || currentObject.className === '/Game/InfiniteLogistics/Buildable/InfinitePipeHyper/Build_InfinitePipeHyper.Build_InfinitePipeHyper_C'
             || currentObject.className === '/Game/InfiniteLogistics/Buildable/InfinitePipeline/Build_InfinitePipeline.Build_InfinitePipeline_C'
             // Belts
             || currentObject.className.search('/Build_ConveyorBeltMk') !== -1
        )
        {
            let building = this.addPlayerBelt(currentObject);
                if(resolve === false && building !== false)
                {
                    return building;
                }

            return resolve();
        }
        if(currentObject.className.search('Train/Track/Build_RailroadTrack') !== -1)
        {
            let building = this.addPlayerTrack(currentObject);
                if(resolve === false)
                {
                    return {layer: 'playerTracksLayer', marker: building};
                }

            return resolve();
        }

        if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C')
        {
            let playerState = this.addPlayerPosition(currentObject, ((this.ownPlayerPath === currentObject.pathName) ? true : false));
                if(resolve === false)
                {
                    return {layer: 'playerPositionLayer', marker: playerState};
                }

            return resolve();
        }

        // Add fauna
        if(currentObject.className.search('/Game/FactoryGame/Character/Creature/Wildlife/') !== -1 || currentObject.className.search('/Game/FactoryGame/Character/Creature/Enemy/') !== -1)
        {
            let building = this.addPlayerFauna(currentObject);
                if(resolve === false)
                {
                    if(currentObject.className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
                    {
                        return {layer: 'playerSpaceRabbitLayer', marker: building};
                    }
                    else
                    {
                        return {layer: 'playerFaunaLayer', marker: building};
                    }
                }

            return resolve();
        }

        // Add buildings data...
        let isCurrentObjectBuilding = this.getBuildingDataFromClassName(currentObject.className);
            if(isCurrentObjectBuilding !== null)
            {
                return this.addGenericBuilding(currentObject, isCurrentObjectBuilding, resolve, skipMod);
            }
            else
            {
                if(currentObject.className.indexOf('Build_') !== -1)
                {
                    if(typeof Sentry !== 'undefined' && this.useDebug === true)
                    {
                        Sentry.setContext('className', {className: currentObject.className});
                        Sentry.setContext('mBuiltWithRecipe', this.getObjectProperty(currentObject, 'mBuiltWithRecipe'));
                        Sentry.captureMessage('Missing building className: ' + currentObject.className);
                    }

                    console.log('Missing building className', currentObject.className);

                    // Create a dummy data...
                    let newBuildingData = {
                        mapLayer        : 'playerUnknownLayer',
                        className       : currentObject.className,
                        name            : currentObject.className.split('/').pop(),
                        category        : 'unknown',
                        mapColor        : '#FFFFFF',
                        mapWeight       : 3
                    };
                        this.buildingsData[currentObject.className] = newBuildingData;

                    return this.addGenericBuilding(currentObject, newBuildingData, resolve, skipMod);
                }
                else
                {
                    if(this.useDebug === true)
                    {
                        console.log('Unknown?', currentObject);
                    }
                }
            }

        if(resolve !== false)
        {
            return resolve();
        }
    }

    addLayers(i = 0)
    {
        let layersKeys = Object.keys(this.playerLayers);
            for(i; i < layersKeys.length; i++)
            {
                let layerId = layersKeys[i];

                if(layerId !== 'playerRadioactivityLayer' && layerId !== 'playerFogOfWar' && layerId !== 'playerPositionLayer' && this.playerLayers[layerId].elements !== undefined)
                {
                    let currentLayerLength = this.playerLayers[layerId].elements.length;
                        for(let j = 0; j < currentLayerLength; j++)
                        {
                            this.addElementToLayer(layerId, this.playerLayers[layerId].elements[j]);
                        }

                    this.setBadgeLayerCount(layerId);

                    let progress = Math.round(i / layersKeys.length * 100);
                        return new Promise(function(resolve){
                            $('#loaderProgressBar .progress-bar').css('width', (90 + progress * 0.1) + '%');
                            $('.loader h6').html('Adding map layers (' + $('.updatePlayerLayerState[data-id=' + layerId + ']').attr('title') + ')...');
                            setTimeout(resolve, 5);
                        }.bind(this)).then(function(){ this.addLayers((i + 1)); }.bind(this));
                }
            }

        console.timeEnd('addMapLayers');

        return new Promise(function(resolve){
            $('#loaderProgressBar .progress-bar').css('width', '100%');
            $('.loader h6').html('Finalize statistics and controls...');
            setTimeout(resolve, 25);
        }.bind(this)).then(function(){
            // Altitude slider
            this.altitudeSliderControl = L.control.sliderControl({
                baseLayout  : this,
                minAltitude : Math.floor(this.minAltitude),
                maxAltitude : Math.ceil(this.maxAltitude)
            });
            this.satisfactoryMap.leafletMap.addControl(this.altitudeSliderControl);
            this.altitudeSliderControl.startSlider();

            // Collectables
            let statisticsCollectables = new BaseLayout_Statistics_Collectables({baseLayout: this});
                statisticsCollectables.get();

            // Player position
            if(this.ownPlayerPath !== null)
            {
                for(let i = 0; i < this.playersState.length; i++)
                {
                    this.addPlayerPosition(this.playersState[i], ((this.ownPlayerPath === this.playersState[i].pathName) ? true : false));
                }
            }

            // Global modals
            $('#statisticsModal').on('show.bs.modal', function(){
                $('#statisticsModal a.nav-link[href="#statisticsModalProduction"]').removeClass('active').click();
            }.bind(this));
            $('#statisticsModal').on('hide.bs.modal', function(){
                $('#statisticsModalProduction').html('');
                $('#statisticsModalStorage').html('');
                $('#statisticsModalPower').html('');
            }.bind(this));
            $('#statisticsModal a[data-toggle="tab"]').on('shown.bs.tab', function(e){
                let newTab = $(e.target).attr('href');

                    switch(newTab)
                    {
                        case '#statisticsModalProduction':
                            if($('#statisticsModalProduction').html() === '')
                            {
                                let statisticsProduction = new BaseLayout_Statistics_Production({
                                    baseLayout      : this
                                });
                                $('#statisticsModalProduction').html(statisticsProduction.parse());
                            }
                            break;
                        case '#statisticsModalStorage':
                            if($('#statisticsModalStorage').html() === '')
                            {
                                let statisticsStorage = new BaseLayout_Statistics_Storage({
                                    baseLayout      : this
                                });
                                $('#statisticsModalStorage').html(statisticsStorage.parse());
                            }
                            break;
                        case '#statisticsModalPower':
                            if($('#statisticsModalPower').html() === '')
                            {
                                let statisticsPower = new BaseLayout_Statistics_Power({
                                    baseLayout      : this
                                });
                                $('#statisticsModalPower').html(statisticsPower.parse());
                            }
                            break;
                    }
            }.bind(this));
            $('#researchModal').on('show.bs.modal', function(){
                let statisticsSchematics = new BaseLayout_Statistics_Schematics({
                        baseLayout      : this
                    });
                    statisticsSchematics.parseSchematics();
                    statisticsSchematics.parseAlternateRecipes();
                    statisticsSchematics.parseMAM();
                    statisticsSchematics.parseAwesomeSink();
            }.bind(this));
            $('#optionsModal').on('show.bs.modal', function(){
                let statisticsInventory = new BaseLayout_Statistics_Player_Inventory({
                        baseLayout      : this
                    });
                    statisticsInventory.parse();
                let statisticsHotbars = new BaseLayout_Statistics_Player_Hotbars({
                        baseLayout      : this
                    });
                    statisticsHotbars.parse();
                let statisticsCollectables = new BaseLayout_Statistics_Collectables({
                        baseLayout      : this
                    });
                    statisticsCollectables.parse();

                let mapColorSlots = new BaseLayout_Map_ColorSlots({
                        baseLayout      : this
                    });
                    mapColorSlots.parse();

                let mapOptions = new BaseLayout_Map_Options({
                        baseLayout      : this
                    });
                    mapOptions.parse();
            }.bind(this));
            $('#buildingsModal').on('show.bs.modal', function(){
                let modalBuildings = new BaseLayout_Modal_Buildings({
                        baseLayout      : this
                    });
                    modalBuildings.parse();
            }.bind(this));
            $('#trainsModal').on('show.bs.modal', function(){
                let modalTrains = new BaseLayout_Modal_Trains({
                        baseLayout      : this
                    });
                    modalTrains.parse();
            }.bind(this));

            $('#buildingsButton').show();
            $('#trainsButton').show();
            $('#statisticsButton').show();
            $('#researchButton').show();
            $('#optionsButton').show();

            // Delay radioactivity to avoid canvas error when map isn't fully loaded...
            setTimeout(function(){
                this.updateRadioactivityLayer();
            }.bind(this), 1000);

            this.history = new BaseLayout_History({
                baseLayout      : this
            });

            // End...
            window.SCIM.hideLoader();

            $('.updatePlayerLayerState').on('click', function(e){
                this.updatePlayerLayerState($(e.currentTarget), $(e.currentTarget).attr('data-id'));
            }.bind(this));
            $('.updatePlayerLayerFilter').on('click', function(e){
                e.stopPropagation(); // Prevent update layer state...
                this.updatePlayerLayerFilter($(e.currentTarget), $(e.currentTarget).attr('data-id'), $(e.currentTarget).attr('data-filter'));
            }.bind(this));

            // Add download event
            $('#downloadSaveGame').on('click', function(){
                window.SCIM.showLoader();
                $('.loader h6').html('Saving...');
                this.saveGameParser.save();
            }.bind(this));

            // Clipboard control
            this.clipboardControl = new L.Control.ClipboardControl({baseLayout: this});
            this.satisfactoryMap.leafletMap.addControl(this.clipboardControl);

            // Lasso control
            this.lassoControl = new L.Control.SelectAreaFeature({baseLayout: this});
            this.satisfactoryMap.leafletMap.addControl(this.lassoControl);
        }.bind(this));
    }

    updateRadioactivityLayer()
    {
        if(this.radioactivityLayerNeedsUpdate === true)
        {
            console.time('updateRadioactiveData');
            this.setupSubLayer('playerRadioactivityLayer');
            this.playerLayers.playerRadioactivityLayer.subLayer.setData({data: this.playerLayers.playerRadioactivityLayer.elements});
            this.radioactivityLayerNeedsUpdate = false;
            console.timeEnd('updateRadioactiveData');
        }
    }

    addElementToLayer(layerId, element, updateAltitudeSlider = false)
    {
        element.addTo(this.playerLayers[layerId].subLayer);

        if(this.playerLayers[layerId].useAltitude !== undefined && this.playerLayers[layerId].useAltitude === true && element.options.altitude !== undefined)
        {
            this.minAltitude = Math.min(this.minAltitude, Math.floor(element.options.altitude));
            this.maxAltitude = Math.max(this.maxAltitude, Math.ceil(element.options.altitude));

            if(updateAltitudeSlider === true)
            {
                this.altitudeSliderControl.updateSliderAltitudes(this.minAltitude, this.maxAltitude);
            }
        }
    }

    // Player function
    addPlayerPosition(currentObject, isOwnPlayer = false)
    {
        // Find target
        let currentObjectTarget = null;
        for(let j = 0; j < currentObject.properties.length; j++)
        {
            if(currentObject.properties[j].name === 'mOwnedPawn')
            {
                currentObjectTarget = this.saveGameParser.getTargetObject(currentObject.properties[j].value.pathName);
                break;
            }
        }

        if(currentObjectTarget !== null)
        {
            this.setupSubLayer('playerPositionLayer');

            let position        = this.satisfactoryMap.unproject(currentObjectTarget.transform.translation);
            let playerMarker    = L.marker(
                    position,
                    {
                        pathName: currentObject.pathName,
                        icon: this.getMarkerIcon('#FFFFFF', ((isOwnPlayer === true) ? '#b3b3b3' : '#666666'), this.staticUrl + '/img/mapPlayerIcon.png'),
                        riseOnHover: true,
                        zIndexOffset: 1000
                    }
                );

            this.playerLayers.playerPositionLayer.elements.push(playerMarker);
            playerMarker.addTo(this.playerLayers.playerPositionLayer.subLayer);

            if(isOwnPlayer === true)
            {
                this.satisfactoryMap.leafletMap.setView(position, 7);
            }

            return playerMarker;
        }
        else
        {
            console.log('mOwnedPawn not found...', currentObject);
            return null;
        }
    }

    addPlayerFauna(currentObject)
    {
        let layerId     = (currentObject.className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C') ? 'playerSpaceRabbitLayer' : 'playerFaunaLayer';
        let iconColor   = '#b34848';
        let iconImage   = this.staticUrl + '/img/mapMonstersIcon.png';

        this.setupSubLayer(layerId);

        let faunaData = this.getFaunaDataFromClassName(currentObject.className);
            if(faunaData !== null)
            {
                iconColor = faunaData.iconColor;
                iconImage = faunaData.iconImage;
            }

        if(currentObject.className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
        {
            let isSpaceRabbitPersistent = this.getObjectProperty(currentObject, 'mIsPersistent');
                if(isSpaceRabbitPersistent !== null)
                {
                    iconColor = '#b3ffb3';
                    this.playerLayers[layerId].count++;
                }
        }

        let position    = this.satisfactoryMap.unproject(currentObject.transform.translation);
        let spaceRabbit = L.marker(
                position,
                {
                    pathName: currentObject.pathName,
                    icon: this.getMarkerIcon('#FFFFFF', iconColor, iconImage),
                    riseOnHover: true,
                    zIndexOffset: 900
                }
            );

        this.autoBindTooltip(spaceRabbit);
        spaceRabbit.bindContextMenu(this);
        this.playerLayers[layerId].elements.push(spaceRabbit);
        return spaceRabbit;
    }

    spawnFauna(marker, className)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let layerId         = 'playerFaunaLayer';
        let faunaData       = this.getFaunaDataFromClassName(className);

        let newFaunaId      = this.getIncrementalIdFromInternalPointer(className);
        let pathName        = faunaData.pathName + newFaunaId;

        let newFauna = {
            children: [{levelName: 'Persistent_Level', pathName: pathName + '.HealthComponent'}],
            className: className,
            levelName: 'Persistent_Level', pathName: pathName,
            entityLevelName: '', entityPathName: '',
            properties: [{name: 'mHealthComponent', type: 'ObjectProperty', index: 0, value: {levelName: 'Persistent_Level', pathName: pathName + '.HealthComponent'}}],
            needTransform: 1,
            transform: {
                rotation: [0, -0, currentObject.transform.rotation[2], currentObject.transform.rotation[3]],
                scale3d: [1, 1, 1],
                translation: [
                    currentObject.transform.translation[0] + (Math.floor(Math.random() * (800 + 1)) - 400),
                    currentObject.transform.translation[1] + (Math.floor(Math.random() * (800 + 1)) - 400),
                    currentObject.transform.translation[2] + 450 + ( (faunaData.zOffset !== undefined) ? faunaData.zOffset : 0 )
                ]
            },
            type: 1, wasPlacedInLevel: 0
        };

        if(className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
        {
            layerId = 'playerSpaceRabbitLayer';

            newFauna.children.unshift({levelName: 'Persistent_Level', pathName: pathName + '.mInventory'});

            newFauna.properties.push({name: 'mFriendActor', type: 'ObjectProperty', index: 0, value: {levelName: 'Persistent_Level', pathName: this.ownPlayerPath.replace('Persistent_Level:PersistentLevel.BP_PlayerState_C_', 'Persistent_Level:PersistentLevel.Char_Player_C_')}});
            newFauna.properties.push({name: 'mLootTableIndex', type: 'IntProperty', index: 0, value: 0});
            newFauna.properties.push({name: 'mLootTimerHandle', type: 'StructProperty', index: 0, value: {handle: 'None', type: 'TimerHandle'}});
            newFauna.properties.push({name: 'mIsPersistent', type: 'BoolProperty', index: 0, value: 1});

            let newSpaceRabbitInventory = {
                children: [],
                className: '/Script/FactoryGame.FGInventoryComponent',
                levelName: 'Persistent_Level',
                outerPathName: pathName, pathName: pathName + '.mInventory',
                properties: [
                    {
                        index: 0, name: "mInventoryStacks", propertyGuid1: 0,propertyGuid2: 0,propertyGuid3: 0,propertyGuid4: 0,
                        structureName: "mInventoryStacks", structureSize: 138, structureSubType: "InventoryStack", structureType: "StructProperty",
                        type: "ArrayProperty",
                        value: {
                            type: "StructProperty",
                            values: [[{
                                index: 0, name: "Item", type: "StructProperty",
                                value: {
                                    itemName: "", levelName: "", pathName: "",
                                    type: "InventoryItem",
                                    unk1: 0,
                                    properties: [{index: 0, name: "NumItems", type: "IntProperty", value: 0}]
                                }
                            }]]
                        }
                    },
                    { name: '"mArbitrarySlotSizes', type: 'ArrayProperty', index: 0, value: {type: 'IntProperty', values: [0]} },
                    { name: 'mAllowedItemDescriptors', type: 'ArrayProperty', index: 0, value: {type: 'ObjectProperty', values: [{levelName: '', pathName: ''}]} }
                ],
                type: 0
            };

            this.saveGameParser.addObject(newSpaceRabbitInventory);
        }

        this.saveGameParser.addObject({
            className: '/Script/FactoryGame.FGHealthComponent', levelName: 'Persistent_Level',
            outerPathName: pathName, pathName: pathName + '.HealthComponent',
            children: [], properties: [], type: 0
        });

        let newCreatureSpawnerId = "Persistent_Exploration_2:PersistentLevel.BP_CreatureSpawner432";
        newFauna.properties.push({name: "mOwningSpawner", type: "ObjectProperty", index: 0, value: {levelName: "Persistent_Exploration_2", pathName: newCreatureSpawnerId}});

        this.saveGameParser.addObject(newFauna);
        this.addElementToLayer(layerId, this.addPlayerFauna(newFauna));
        this.setBadgeLayerCount(layerId);
    }

    deleteFauna(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let layerId         = 'playerFaunaLayer';

        if(currentObject.className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
        {
                layerId                 = 'playerSpaceRabbitLayer';
            let isSpaceRabbitPersistent = this.getObjectProperty(currentObject, 'mIsPersistent');

            if(isSpaceRabbitPersistent !== null)
            {
                this.playerLayers.playerCratesLayer.count--;
            }
        }

        this.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
        this.deleteMarkerFromElements(layerId, marker.relatedTarget);
        this.setBadgeLayerCount(layerId);
    }

    addResourceDeposit(currentObject)
    {
        let mResourceDepositTableIndex  = this.getObjectProperty(currentObject, 'mResourceDepositTableIndex');
        let mResourcesLeft              = this.getObjectProperty(currentObject, 'mResourcesLeft');
        let mIsEmptied                  = this.getObjectProperty(currentObject, 'mIsEmptied');

            if(mIsEmptied === null && mResourcesLeft !== null && mResourceDepositTableIndex !== null)
            {
                let itemId = null;

                switch(mResourceDepositTableIndex)
                {
                    case 0:
                        itemId = 'Desc_Stone_C';
                        break;
                    case 1:
                        itemId = 'Desc_OreIron_C';
                        break;
                    case 2:
                        itemId = 'Desc_OreCopper_C';
                        break;
                    case 3:
                        itemId = 'Desc_Coal_C';
                        break;
                    case 4:
                        itemId = 'Desc_OreGold_C';
                        break;
                    case 5:
                        itemId = 'Desc_Sulfur_C';
                        break;
                    case 6:
                        itemId = 'Desc_RawQuartz_C';
                        break;
                    case 7:
                        itemId = 'Desc_OreBauxite_C';
                        break;
                    case 8:
                        itemId = 'Desc_SAM_C';
                        break;
                    case 9:
                        itemId = 'Desc_OreUranium_C';
                        break;
                    default:
                        console.log('Unknown mResourceDepositTableIndex', currentObject);
                        break;
                }

                if(itemId !== null)
                {
                    this.setupSubLayer('playerResourceDepositsLayer', false);

                    let position    = this.satisfactoryMap.unproject(currentObject.transform.translation);
                    let iconType    = 'playerResourceDepositsLayer_' + itemId;
                        if(this.satisfactoryMap.availableIcons[iconType] === undefined)
                        {
                            if(this.itemsData[itemId] !== undefined)
                            {
                                this.satisfactoryMap.availableIcons[iconType] = L.divIcon({
                                    className   : "leaflet-data-marker",
                                    html        : this.satisfactoryMap.availableIcons['playerResourceDepositsLayer'].options.html.replace(this.itemsData.Desc_OreIron_C.image, this.itemsData[itemId].image),
                                    iconAnchor  : [48, 78],
                                    iconSize    : [50, 80]
                                });
                            }
                        }

                    let depositMarker = L.marker(
                            position,
                            {
                                pathName    : currentObject.pathName,
                                itemId      : itemId,
                                itemQty     : mResourcesLeft,
                                icon        : this.satisfactoryMap.availableIcons[iconType], riseOnHover: true
                            }
                        );
                        depositMarker.bindContextMenu(this);
                        this.autoBindTooltip(depositMarker);

                    this.playerLayers.playerResourceDepositsLayer.elements.push(depositMarker);
                    depositMarker.addTo(this.playerLayers.playerResourceDepositsLayer.subLayer);
                }
            }
    }

    deleteResourceDeposit(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mIsEmptied      = this.getObjectProperty(currentObject, 'mIsEmptied');

            if(mIsEmptied === null)
            {
                currentObject.properties.push({name: "mIsEmptied", type: "BoolProperty", value: 1});
            }

            this.deleteObjectProperty(currentObject, 'mResourcesLeft');

        this.deleteMarkerFromElements('playerResourceDepositsLayer', marker.relatedTarget);
        this.setBadgeLayerCount('playerResourceDepositsLayer');
    }

    addItemPickup(currentObject)
    {
        let mPickupItems = this.getObjectProperty(currentObject, 'mPickupItems');

            if(mPickupItems !== null && mPickupItems.values[0].value.properties[0].value > 0)
            {
                let itemId = this.getItemDataFromClassName(mPickupItems.values[0].value.itemName);
                    if(itemId !== null)
                    {
                        itemId = itemId.id;

                        this.setupSubLayer('playerItemsPickupLayer', false);

                        let position    = this.satisfactoryMap.unproject(currentObject.transform.translation);
                        let iconType    = 'playerItemsPickupLayer' + itemId;
                            if(this.satisfactoryMap.availableIcons[iconType] === undefined)
                            {
                                if(this.itemsData[itemId] !== undefined)
                                {
                                    this.satisfactoryMap.availableIcons[iconType] = L.divIcon({
                                        className   : "leaflet-data-marker",
                                        html        : this.satisfactoryMap.availableIcons.playerItemsPickupLayer.options.html.replace(this.itemsData.Desc_Cable_C.image, this.itemsData[itemId].image),
                                        iconAnchor  : [48, 78],
                                        iconSize    : [50, 80]
                                    });
                                }
                                else
                                {
                                    if(this.toolsData[itemId] !== undefined)
                                    {
                                        this.satisfactoryMap.availableIcons[iconType] = L.divIcon({
                                            className   : "leaflet-data-marker",
                                            html        : this.satisfactoryMap.availableIcons.playerItemsPickupLayer.options.html.replace(this.itemsData.Desc_Cable_C.image, this.toolsData[itemId].image),
                                            iconAnchor  : [48, 78],
                                            iconSize    : [50, 80]
                                        });
                                    }
                                    else
                                    {
                                        this.satisfactoryMap.availableIcons[iconType] = L.divIcon({
                                            className   : "leaflet-data-marker",
                                            html        : this.satisfactoryMap.availableIcons.playerItemsPickupLayer.options.html.replace(this.itemsData.Desc_Cable_C.image, 'https://static.satisfactory-calculator.com/img/mapUnknownIcon.png'),
                                            iconAnchor  : [48, 78],
                                            iconSize    : [50, 80]
                                        });
                                    }
                                }
                            }

                        let itemMarker = L.marker(
                                position,
                                {
                                    pathName: currentObject.pathName,
                                    itemId: itemId,
                                    itemQty: mPickupItems.values[0].value.properties[0].value,
                                    icon: this.satisfactoryMap.availableIcons[iconType], riseOnHover: true
                                }
                            );
                            itemMarker.bindContextMenu(this);
                            this.autoBindTooltip(itemMarker);

                        this.playerLayers.playerItemsPickupLayer.elements.push(itemMarker);
                        itemMarker.addTo(this.playerLayers.playerItemsPickupLayer.subLayer);

                        return itemMarker;
                    }
            }
    }

    deleteItemPickUp(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

            // User dropped items...
            if(currentObject.className === '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C')
            {
                this.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
            }
            // Game droppped items...
            else
            {
                let mPickupItems    = this.getObjectProperty(currentObject, 'mPickupItems');

                    if(mPickupItems !== null && mPickupItems.values[0].value.properties[0].value > 0)
                    {
                        mPickupItems.values[0].value.properties[0].value = 0;
                    }
            }

        this.deleteMarkerFromElements('playerItemsPickupLayer', marker.relatedTarget);
        this.setBadgeLayerCount('playerItemsPickupLayer');
    }

    addPlayerBeacon(currentObject)
    {
        this.setupSubLayer('playerOrientationLayer');

        let beaconColor     = '#b3b3b3';
            //console.log([currentObject.transform.translation[0], currentObject.transform.translation[1]]);

        let mCompassColor   = this.getObjectProperty(currentObject, 'mCompassColor');
            if(mCompassColor !== null)
            {
                beaconColor = 'rgb(' + BaseLayout_Math.linearColorToRGB(mCompassColor.values.r) + ', ' + BaseLayout_Math.linearColorToRGB(mCompassColor.values.g) + ', ' + BaseLayout_Math.linearColorToRGB(mCompassColor.values.b) + ')';
            }

        let beacon          = L.marker(
            this.satisfactoryMap.unproject(currentObject.transform.translation),
            {
                pathName: currentObject.pathName,
                icon: this.getMarkerIcon('#FFFFFF', beaconColor, this.staticUrl + '/img/mapBeaconIcon.png'),
                riseOnHover: true,
                zIndexOffset: 900,
                altitude: currentObject.transform.translation[2]
            }
        );

        beacon.bindContextMenu(this);
        this.playerLayers.playerOrientationLayer.count++;
        this.autoBindTooltip(beacon);
        this.playerLayers.playerOrientationLayer.elements.push(beacon);

        return beacon;
    }

    deletePlayerBeacon(marker)
    {
        this.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
        this.deleteMarkerFromElements('playerOrientationLayer', marker.relatedTarget);
        this.playerLayers.playerOrientationLayer.count--;
        this.setBadgeLayerCount('playerOrientationLayer');
    }

    addPlayerLootCrate(currentObject)
    {
        this.setupSubLayer('playerCratesLayer');

        let crate = L.marker(
            this.satisfactoryMap.unproject(currentObject.transform.translation),
            {
                pathName: currentObject.pathName,
                icon: this.getMarkerIcon('#FFFFFF', '#b3b3b3', this.staticUrl + '/img/mapLootCrateIcon.png'),
                riseOnHover: true,
                zIndexOffset: 900,
                altitude: currentObject.transform.translation[2]
            }
        );

        crate.bindContextMenu(this);
        this.playerLayers.playerCratesLayer.count++;
        this.autoBindTooltip(crate);
        this.playerLayers.playerCratesLayer.elements.push(crate);

        return crate;
    }

    deletePlayerLootCrate(marker)
    {
        this.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
        this.deleteMarkerFromElements('playerCratesLayer', marker.relatedTarget);
        this.playerLayers.playerCratesLayer.count--;
        this.setBadgeLayerCount('playerCratesLayer');
    }

    spawnNewLootCrateNearPlayer()
    {
        let playerPosition  = [0, 0, 0];
        let playerRotation  = [-0, 0, -0.4999995529651642, 0.8660256862640381];

        for(let i = 0; i < this.playersState.length; i++)
        {
            // Find target
            let currentObject       = this.playersState[i];
            let currentObjectTarget = null;
            for(let j = 0; j < currentObject.properties.length; j++)
            {
                if(currentObject.properties[j].name === 'mOwnedPawn')
                {
                    currentObjectTarget = this.saveGameParser.getTargetObject(currentObject.properties[j].value.pathName);
                    break;
                }
            }

            if(currentObjectTarget !== null)
            {
                playerPosition = currentObjectTarget.transform.translation;
                playerRotation = currentObjectTarget.transform.rotation;

                if(this.ownPlayerPath !== null && this.ownPlayerPath === this.playersState[i].pathName)
                {
                    break;
                }
            }
        }

        let crateID = this.getIncrementalIdFromInternalPointer('/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C');

        let newLootCrate = {
            type: 1,
            className: "/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C",
            levelName: "Persistent_Level",
            pathName: "Persistent_Level:PersistentLevel.BP_Crate_C_" + crateID,
            needTransform: 1,
            transform: {
                rotation: playerRotation,
                translation: [
                    playerPosition[0] + (Math.floor(Math.random() * (1600 + 1)) - 400),
                    playerPosition[1] + (Math.floor(Math.random() * (1600 + 1)) - 400),
                    playerPosition[2] + Math.floor(Math.random() * (800 + 1))
                ],
                scale3d: [1, 1, 1]
            },
            wasPlacedInLevel: 0,
            children: [{levelName: "Persistent_Level", pathName: "Persistent_Level:PersistentLevel.BP_Crate_C_" + crateID + ".inventory"}],
            properties: [{
                name: "mInventory",
                type: "ObjectProperty",
                index: 0,
                value: {levelName: "Persistent_Level", pathName: "Persistent_Level:PersistentLevel.BP_Crate_C_" + crateID + ".inventory"}
            }],
            entityLevelName: "",
            entityPathName: ""
        };
        this.saveGameParser.addObject(newLootCrate);

        let newLootCrateInventory = {
            type: 0,
            className: "/Script/FactoryGame.FGInventoryComponent",
            levelName: "Persistent_Level",
            pathName: "Persistent_Level:PersistentLevel.BP_Crate_C_" + crateID + ".inventory",
            outerPathName: "Persistent_Level:PersistentLevel.BP_Crate_C_" + crateID,
            children: [],
            properties: [
                {
                    name: "mInventoryStacks",
                    type: "ArrayProperty",
                    index: 0,
                    value: {type: "StructProperty", values: []}, // Push items
                    structureName: "mInventoryStacks",
                    structureType: "StructProperty",
                    structureSubType: "InventoryStack",
                    propertyGuid1: 0,
                    propertyGuid2: 0,
                    propertyGuid3: 0,
                    propertyGuid4: 0
                },
                {
                    name: "mArbitrarySlotSizes",
                    type: "ArrayProperty",
                    index: 0,
                    value: {type: "IntProperty", values: []} // Push 0 value for each slot used
                },
                {
                    name: "mAllowedItemDescriptors",
                    type: "ArrayProperty",
                    index: 0,
                    value: {type: "ObjectProperty", values: [{levelName: "", pathName: ""}]}
                }
            ]
        };
        this.saveGameParser.addObject(newLootCrateInventory);

        this.addElementToLayer('playerCratesLayer', this.addPlayerLootCrate(newLootCrate));

        return newLootCrateInventory;
    }

    rotationPlayerFoundation(marker, angle = 90)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(this.history !== null)
            {
                this.history.add({
                    name: 'Undo: Rotate by ' + angle + '°',
                    values: [{
                        pathName: marker.relatedTarget.options.pathName,
                        callback: 'refreshMarkerPosition',
                        properties: {transform: JSON.parse(JSON.stringify(currentObject.transform))}
                    }]
                });
            }

        currentObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(currentObject.transform.rotation, angle);

        this.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
    }

    pivotPlayerFoundation(marker)
    {
        this.pauseMap();

        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = this.getBuildingDataFromClassName(currentObject.className);

        bootbox.form({
            title       : 'Pivot "' + buildingData.name + '" from the top-left corner',
            container   : '#leafletMap', backdrop: false,
            centerVertical: true,
            inputs: [
                {
                    label: 'Angle (Between -180° and 180°)',
                    name: 'angle',
                    inputType: 'text'
                }
            ],
            callback: function(form)
            {
                if(form === null || form.angle === null)
                {
                    this.unpauseMap();
                    return;
                }

                let angle  = Math.min(180, Math.max(-180, parseInt(form.angle)));

                if(this.history !== null)
                {
                    this.history.add({
                        name: 'Undo: Pivot by ' + angle + '°',
                        values: [{
                            pathName: marker.relatedTarget.options.pathName,
                            callback: 'refreshMarkerPosition',
                            properties: {transform: JSON.parse(JSON.stringify(currentObject.transform))}
                        }]
                    });
                }

                let center          = [currentObject.transform.translation[0], currentObject.transform.translation[1]];
                let topLeftCorner   = BaseLayout_Math.getPointRotation(
                        [center[0] - 400, center[1] - 400],
                        center,
                        currentObject.transform.rotation
                    );

                currentObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(currentObject.transform.rotation, angle);

                let newCenter       = BaseLayout_Math.getPointRotation(
                        [topLeftCorner[0] + 400, topLeftCorner[1] + 400],
                        topLeftCorner,
                        currentObject.transform.rotation
                    );

                currentObject.transform.translation[0] = newCenter[0];
                currentObject.transform.translation[1] = newCenter[1];

                this.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});

                this.unpauseMap();
                return;
            }.bind(this)
        });
    }

    refreshMarkerPosition(properties)
    {
        let refreshSliderBoundaries     = (properties.transform.translation[2] !== properties.object.transform.translation[2]);
            properties.object.transform = properties.transform;

        // Delete and add again!
        let result                      = this.parseObject(properties.object);
            if(properties.marker.options.extraMarker !== undefined)
            {
                this.playerLayers[result.layer].subLayer.removeLayer(properties.marker.options.extraMarker);
            }
            this.deleteMarkerFromElements(result.layer, properties.marker);
            this.addElementToLayer(result.layer, result.marker, refreshSliderBoundaries);

            for(let j = 0; j < properties.object.children.length; j++)
            {
                let currentObjectChildren = this.saveGameParser.getTargetObject(properties.object.children[j].pathName);

                // Grab wires for redraw...
                for(let k = 0; k < this.availablePowerConnection.length; k++)
                {
                    if(currentObjectChildren.pathName.endsWith(this.availablePowerConnection[k]))
                    {
                        for(let m = 0; m < currentObjectChildren.properties.length; m++)
                        {
                            if(currentObjectChildren.properties[m].name === 'mWires')
                            {
                                for(let n = 0; n < currentObjectChildren.properties[m].value.values.length; n++)
                                {
                                    let currentWire     = this.saveGameParser.getTargetObject(currentObjectChildren.properties[m].value.values[n].pathName);
                                    let result          = this.parseObject(currentWire);
                                    let oldMarker       = this.getMarkerFromPathName(currentWire.pathName, result.layer);
                                        this.deleteMarkerFromElements(result.layer, oldMarker);
                                        this.addElementToLayer(result.layer, result.marker);
                                }

                                break;
                            }
                        }
                    }
                }
            }

        return;
    }

    updateObjectPosition(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let currentRotation = BaseLayout_Math.getQuaternionToEuler(currentObject.transform.rotation);

        this.pauseMap();

        bootbox.form({
            title       : "Position",
            message     : 'Negative offset will move X to the West, Y to the North, and Z down.<br /><strong>NOTE:</strong> A foundation is 800 wide.',
            container   : '#leafletMap', backdrop: false,
            centerVertical: true,
            inputs: [
                {
                    label: 'X',
                    name: 'x',
                    inputType: 'text',
                    value: currentObject.transform.translation[0]
                },
                {
                    label: 'Y',
                    name: 'y',
                    inputType: 'text',
                    value: currentObject.transform.translation[1]
                },
                {
                    label: 'Z',
                    name: 'z',
                    inputType: 'text',
                    value: currentObject.transform.translation[2]
                },
                {
                    label: 'Pitch (Angle between 0 and 360 degrees)',
                    name: 'pitch',
                    inputType: 'text',
                    value: Math.round(BaseLayout_Math.clampEulerAxis(currentRotation.pitch) * 1000) / 1000
                },
                {
                    label: 'Roll (Angle between -180 and 180 degrees)',
                    name: 'roll',
                    inputType: 'text',
                    value: Math.round(BaseLayout_Math.normalizeEulerAxis(currentRotation.roll) * 1000) / 1000
                },
                {
                    label: 'Rotation (Angle between 0 and 360 degrees)',
                    name: 'yaw',
                    inputType: 'text',
                    value: Math.round(BaseLayout_Math.clampEulerAxis(currentRotation.yaw) * 1000) / 1000
                }
            ],
            callback: function(form)
            {
                if(form === null || form.x === null || form.y === null || form.z === null || form.pitch === null || form.roll === null || form.yaw === null)
                {
                    this.unpauseMap();
                    return;
                }

                form.x                                  = parseFloat(form.x);
                form.y                                  = parseFloat(form.y);
                form.z                                  = parseFloat(form.z);
                form.pitch                              = parseFloat(form.pitch);
                form.roll                               = parseFloat(form.roll);
                form.yaw                                = parseFloat(form.yaw);

                if(this.history !== null)
                {
                    this.history.add({
                        name: 'Undo: Update position',
                        values: [{
                            pathName: marker.relatedTarget.options.pathName,
                            callback: 'refreshMarkerPosition',
                            properties: {transform: JSON.parse(JSON.stringify(currentObject.transform))}
                        }]
                    });
                }

                    let newTransform = JSON.parse(JSON.stringify(currentObject.transform));
                        if(isNaN(form.x) === false)
                        {
                            newTransform.translation[0] = form.x;
                        }
                        if(isNaN(form.y) === false)
                        {
                            newTransform.translation[1] = form.y;
                        }
                        if(isNaN(form.z) === false)
                        {
                            newTransform.translation[2] = form.z;
                        }
                        if(isNaN(form.roll) === false && isNaN(form.pitch) === false && isNaN(form.yaw) === false)
                        {
                            newTransform.rotation = BaseLayout_Math.getEulerToQuaternion({roll: form.roll, pitch: form.pitch, yaw: form.yaw});
                        }

                this.refreshMarkerPosition({marker: marker.relatedTarget, transform: JSON.parse(JSON.stringify(newTransform)), object: currentObject});
                this.unpauseMap();
                this.updateRadioactivityLayer();

                return;
            }.bind(this)
        });
    }

    teleportPlayer(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let selectOptions   = [];

        for(let i = 0; i < this.playersState.length; i++)
        {
            if(this.ownPlayerPath === this.playersState[i].pathName)
            {
                selectOptions.push({text: 'Host', value: this.playersState[i].pathName});
            }
            else
            {
                selectOptions.push({text: 'Guest #' + this.playersState[i].pathName.replace('Persistent_Level:PersistentLevel.BP_PlayerState_C_', ''), value: this.playersState[i].pathName});
            }
        }

        this.pauseMap();

        bootbox.form({
            title: "Teleport player",
            container: '#leafletMap', backdrop: false,
            centerVertical: true,
            inputs: [
                {
                    name: 'playerPathName',
                    inputType: 'select',
                    inputOptions: selectOptions
                }
            ],
            callback: function(form)
            {
                if(form === null || form.playerPathName === null)
                {
                    this.unpauseMap();
                    return;
                }

                let mOwnedPawn                                      = this.getObjectProperty(this.saveGameParser.getTargetObject(form.playerPathName), 'mOwnedPawn');

                if(mOwnedPawn !== null)
                {
                    let currentPlayerPosition                           = this.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                        currentPlayerPosition.transform.translation     = JSON.parse(JSON.stringify(currentObject.transform.translation));
                        currentPlayerPosition.transform.translation[2]  += 400;

                    let currentPlayerMarker                             = this.getMarkerFromPathName(form.playerPathName, 'playerPositionLayer');
                        currentPlayerMarker.setLatLng(this.satisfactoryMap.unproject(currentPlayerPosition.transform.translation));
                }
                else
                {
                    alert('Cannot teleport that player!');
                }

                this.unpauseMap();

                return;
            }.bind(this)
        });
    }

    spawnAroundFoundation(marker)
    {
        this.pauseMap();

        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = this.getBuildingDataFromClassName(currentObject.className);
        let allFauna        = this.getFaunaDataFromClassName();

        let inputOptions = [];
            if(this.clipboard !== null && this.clipboard.originalLocationOnly === undefined)
            {
                inputOptions.push({group: 'Clipboard', text: 'Paste ' + this.clipboard.data.length + ' items', value: 'paste'});
            }

            inputOptions.push({group: 'Geometric form', text: 'Plain circle', value: 'plainCircle'});
            inputOptions.push({group: 'Geometric form', text: 'Hollow circle', value: 'hollowCirle'});
            inputOptions.push({group: 'Geometric form', text: 'Plain rectangle', value: 'plainRectangle'});
            inputOptions.push({group: 'Geometric form', text: 'Hollow rectangle', value: 'hollowRectangle'});
            inputOptions.push({group: 'Geometric form', text: 'Plain regular polygon', value: 'plainPolygon'});
            inputOptions.push({group: 'Geometric form', text: 'Hollow regular polygon', value: 'hollowPolygon'});
            inputOptions.push({group: 'Geometric form', text: 'Road', value: 'road'});

            /*
            if(currentObject.className.search('/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble') !== -1)
            {
                inputOptions.push({group: 'Geometric form', text: 'Corkscrew road', value: 'corkScrew'});
            }
            */

            inputOptions.push({group: 'Geometric form', text: 'Pipe Text', value: 'pipeText'});

            for(let faunaClassName in allFauna)
            {
                if(faunaClassName.search('/Game/FactoryGame/Character/Creature/Wildlife/') !== -1)
                {
                    inputOptions.push({group: 'Fauna', text: allFauna[faunaClassName].name, value: faunaClassName});
                }
            }

            for(let faunaClassName in allFauna)
            {
                if(faunaClassName.search('/Game/FactoryGame/Character/Creature/Enemy/') !== -1)
                {
                    inputOptions.push({group: 'Offensive Fauna', text: allFauna[faunaClassName].name, value: faunaClassName});
                }
            }

        bootbox.form({
            title: 'Spawn around "' + buildingData.name + '"',
            container: '#leafletMap', backdrop: false,
            centerVertical: true,
            inputs: [
                {
                    name: 'form',
                    inputType: 'select',
                    inputOptions: inputOptions
                },
                {
                    label: 'Use materials from your containers? (Not suitable for pasting blueprints)',
                    name: 'useOwnMaterials',
                    inputType: 'select',
                    inputOptions: [
                        {
                            text: 'Yes',
                            value: '1'
                        },
                        {
                            text: 'No',
                            value: '0'
                        }
                    ]
                }
            ],
            callback: function(form)
            {
                if(form === null || form.form === null || form.useOwnMaterials === null)
                {
                    this.unpauseMap();
                    return;
                }

                form.useOwnMaterials = parseInt(form.useOwnMaterials);

                if(allFauna[form.form] !== undefined)
                {
                    return this.spawnFauna(marker, form.form);
                }
                else
                {
                    switch(form.form)
                    {
                        case 'paste':
                            let colorSlotOptions = [];
                                colorSlotOptions.push({text: 'No foundation helper', value: 'NONE'});
                                for(let slotIndex = 0; slotIndex < BaseLayout_Map_ColorSlots.getTotalColorSlots(); slotIndex++)
                                {
                                    colorSlotOptions.push({text: 'Slot #' + (slotIndex + 1), value: slotIndex});
                                }

                            bootbox.form({
                                title: "Offset clipboard center",
                                message: "Most of the time, the clipboard calculate the center of your selection correctly. If not you can use the offset to move it.",
                                container: '#leafletMap', backdrop: false,
                                centerVertical: true,
                                inputs: [
                                    {
                                        label: 'X offset',
                                        name: 'xOffset',
                                        inputType: 'text',
                                        value: 0
                                    },
                                    {
                                        label: 'Y offset',
                                        name: 'yOffset',
                                        inputType: 'text',
                                        value: 0
                                    },
                                    {
                                        label: 'Colored foundation helper',
                                        name: 'colorSlotHelper',
                                        inputType: 'select',
                                        inputOptions: colorSlotOptions
                                    }
                                ],
                                callback: function(values)
                                {
                                    if(values === null || values.xOffset === null || values.yOffset === null || values.colorSlotHelper === null)
                                    {
                                        return;
                                    }

                                    return new BaseLayout_Spawn_Blueprint({
                                        baseLayout          : this,
                                        marker              : marker,
                                        clipboard           : this.clipboard,
                                        xOffset             : parseFloat(values.xOffset),
                                        yOffset             : parseFloat(values.yOffset),
                                        colorSlotHelper     : values.colorSlotHelper
                                    });
                                }.bind(this)
                            });
                            break;
                        case 'plainCircle':
                        case 'hollowCirle':
                            let circleOptions = [];
                                circleOptions.push({
                                    label: 'Outer radius <em class="small">(Between 3 and 256)</em>',
                                    name: 'maxRadius',
                                    inputType: 'number',
                                    value: 6
                                });

                            if(form.form === 'hollowCirle')
                            {
                                circleOptions.push({
                                    label: 'Inner radius <em class="small">(Between 3 and 255)</em>',
                                    name: 'minRadius',
                                    inputType: 'number'
                                });
                            }

                            circleOptions.push({
                                label: 'Arc angle <em class="small">(From 0 to 360°, clockwise)</em>',
                                name: 'arcAngle',
                                inputType: 'number',
                                value: 360
                            });

                            bootbox.form({
                                title: "Circle options",
                                container: '#leafletMap', backdrop: false,
                                centerVertical: true,
                                inputs: circleOptions,
                                callback: function(values)
                                {
                                    if(values === null || values.maxRadius === null || values.arcAngle === null)
                                    {
                                        return;
                                    }

                                    if(form.form === 'hollowCirle')
                                    {
                                        if(values.minRadius === null)
                                        {
                                            return;
                                        }

                                        values.minRadius = Math.max(3, Math.min(values.minRadius, values.maxRadius - 1));
                                    }
                                    else
                                    {
                                        values.minRadius = 1;
                                    }

                                    return new BaseLayout_Spawn_Circle({
                                        baseLayout      : this,
                                        marker          : marker,
                                        minRadius       : values.minRadius,
                                        maxRadius       : values.maxRadius,
                                        arcAngle        : values.arcAngle,
                                        useOwnMaterials : form.useOwnMaterials
                                    });
                                }.bind(this)
                            });
                            break;
                        case 'corkScrew':
                            let corkScrewOptions = [];
                                corkScrewOptions.push({
                                    label: 'Outer radius <em class="small">(Between 3 and 256)</em>',
                                    name: 'maxRadius',
                                    inputType: 'number',
                                    value: 6
                                });
                                corkScrewOptions.push({
                                    label: 'Inner radius <em class="small">(Between 3 and 255)</em>',
                                    name: 'minRadius',
                                    inputType: 'number',
                                    value: 5
                                });
                                corkScrewOptions.push({
                                    label: 'Height <em class="small">(Number of foundations)</em>',
                                    name: 'height',
                                    inputType: 'number',
                                    value: 5
                                });
                                corkScrewOptions.push({
                                    label: 'Direction',
                                    name: 'direction',
                                    inputType: 'select',
                                    inputOptions: [
                                        {text: 'Up', value: 'UP'},
                                        {text: 'Down', value: 'DOWN'}
                                    ]
                                });

                            bootbox.form({
                                title: "Corkscrew options",
                                container: '#leafletMap', backdrop: false,
                                centerVertical: true,
                                inputs: corkScrewOptions,
                                callback: function(values)
                                {
                                    if(values === null || values.maxRadius === null || values.minRadius === null || values.height === null || values.direction === null)
                                    {
                                        return;
                                    }

                                    values.minRadius = Math.max(3, Math.min(values.minRadius, values.maxRadius - 1));

                                    return new BaseLayout_Spawn_CorkScrew({
                                        baseLayout      : this,
                                        marker          : marker,
                                        minRadius       : values.minRadius,
                                        maxRadius       : values.maxRadius,
                                        height          : values.height,
                                        direction       : values.direction,
                                        useOwnMaterials : form.useOwnMaterials
                                    });
                                }.bind(this)
                            });
                            break;
                        case 'plainRectangle':
                        case 'hollowRectangle':
                            let rectangleOptions = [];
                                rectangleOptions.push({
                                    label: 'Outer width <em class="small">(Between 3 and 65)</em>',
                                    name: 'maxWidth',
                                    inputType: 'number',
                                    value: 6
                                });
                                rectangleOptions.push({
                                    label: 'Outer length <em class="small">(Between 3 and 65)</em>',
                                    name: 'maxHeight',
                                    inputType: 'number',
                                    value: 6
                                });

                            if(form.form === 'hollowRectangle')
                            {
                                rectangleOptions.push({
                                    label: 'Inner width <em class="small">(Between 3 and 63)</em>',
                                    name: 'minWidth',
                                    inputType: 'number'
                                });
                                rectangleOptions.push({
                                    label: 'Inner length <em class="small">(Between 3 and 63)</em>',
                                    name: 'minHeight',
                                    inputType: 'number'
                                });
                            }

                            bootbox.form({
                                title: "Rectangle options",
                                container: '#leafletMap', backdrop: false,
                                centerVertical: true,
                                inputs: rectangleOptions,
                                callback: function(values)
                                {
                                    if(values === null || values.maxWidth === null || values.maxHeight === null)
                                    {
                                        return;
                                    }

                                    if(form.form === 'hollowRectangle')
                                    {
                                        if(values.minWidth === null || values.minHeight === null)
                                        {
                                            return;
                                        }

                                        values.minWidth     = Math.max(1, Math.min(values.minWidth, values.maxWidth - 2));
                                        values.minHeight    = Math.max(1, Math.min(values.minHeight, values.maxHeight - 2));
                                    }
                                    else
                                    {
                                        values.minWidth     = 1;
                                        values.minHeight    = 1;
                                    }

                                    return new BaseLayout_Spawn_Rectangle({
                                        baseLayout      : this,
                                        marker          : marker,
                                        minWidth        : values.minWidth,
                                        maxWidth        : values.maxWidth,
                                        minHeight       : values.minHeight,
                                        maxHeight       : values.maxHeight,
                                        useDirection    : false,
                                        useOwnMaterials : form.useOwnMaterials
                                    });
                                }.bind(this)
                            });
                            break;
                        case 'plainPolygon':
                        case 'hollowPolygon':
                            let polygonOptions  = [];
                            let inputOptions    = [];
                                inputOptions.push({text: 'Pentagon - 5 sides', value: 5});
                                inputOptions.push({text: 'Hexagon - 6 sides', value: 6});
                                inputOptions.push({text: 'Heptagon - 7 sides', value: 7});
                                inputOptions.push({text: 'Octagon - 8 sides', value: 8});
                                inputOptions.push({text: 'Nonagon - 9 sides', value: 9});
                                inputOptions.push({text: 'Decagon - 10 sides', value: 10});
                                inputOptions.push({text: 'Hendecagon - 11 sides', value: 11});
                                inputOptions.push({text: 'Dodecagon - 12 sides', value: 12});

                                polygonOptions.push({
                                    label: 'Number of sides',
                                    name: 'numberOfSides',
                                    inputType: 'select',
                                    inputOptions: inputOptions,
                                    value: 6
                                });
                                polygonOptions.push({
                                    label: 'Apothem length <em class="small">(Between 3 and 65)</em>',
                                    name: 'maxSize',
                                    inputType: 'number',
                                    value: 6
                                });

                                if(form.form === 'hollowPolygon')
                                {
                                    polygonOptions.push({
                                        label: 'Inner apothem length <em class="small">(Between 3 and 63)</em>',
                                        name: 'minSize',
                                        inputType: 'number'
                                    });
                                }

                                polygonOptions.push({
                                    label: 'Minimize grid overlapping',
                                    name: 'gridOverlapping',
                                    inputType: 'select',
                                    inputOptions: [
                                        {
                                            text: 'Yes',
                                            value: '1'
                                        },
                                        {
                                            text: 'No',
                                            value: '0'
                                        }
                                    ]
                                });

                            bootbox.form({
                                title: "Polygon options",
                                container: '#leafletMap', backdrop: false,
                                centerVertical: true,
                                inputs: polygonOptions,
                                callback: function(values)
                                {
                                    if(values === null || values.numberOfSides === null || values.minSize === null || values.maxSize === null || values.gridOverlapping === null)
                                    {
                                        return;
                                    }

                                    if(form.form !== 'hollowPolygon')
                                    {
                                        values.minSize = 1;
                                    }

                                    return new BaseLayout_Spawn_Polygon({
                                        baseLayout      : this,
                                        marker          : marker,

                                        numberOfSides   : values.numberOfSides,
                                        minSize         : values.minSize,
                                        maxSize         : values.maxSize,
                                        gridOverlapping : values.gridOverlapping,

                                        useOwnMaterials : form.useOwnMaterials
                                    });
                                }.bind(this)
                            });
                            break;
                        case 'road':
                            let roadOptions = [];
                                roadOptions.push({
                                    label: 'Width <em class="small">(Between 1 and 65)</em>',
                                    name: 'maxWidth',
                                    inputType: 'number'
                                });
                                roadOptions.push({
                                    label: 'Length <em class="small">(Between 1 and 65)</em>',
                                    name: 'maxHeight',
                                    inputType: 'number'
                                });

                            bootbox.form({
                                title: "Road options",
                                container: '#leafletMap', backdrop: false,
                                centerVertical: true,
                                inputs: roadOptions,
                                callback: function(values)
                                {
                                    if(values === null || values.maxWidth === null || values.maxHeight === null)
                                    {
                                        return;
                                    }

                                    return new BaseLayout_Spawn_Rectangle({
                                        baseLayout      : this,
                                        marker          : marker,
                                        minWidth        : 1,
                                        maxWidth        : values.maxWidth,
                                        minHeight       : 1,
                                        maxHeight       : values.maxHeight,
                                        useDirection    : true,
                                        useOwnMaterials : form.useOwnMaterials
                                    });
                                }.bind(this)
                            });
                            break;
                        case 'pipeText':
                            let pipeTextOptions = [];
                                pipeTextOptions.push({
                                    label: 'Line 1',
                                    name: 'line1',
                                    inputType: 'text',
                                    value: 'Default text'
                                });
                                pipeTextOptions.push({
                                    label: 'Line 2',
                                    name: 'line2',
                                    inputType: 'text'
                                });
                                pipeTextOptions.push({
                                    label: 'Line 3',
                                    name: 'line3',
                                    inputType: 'text'
                                });
                                pipeTextOptions.push({
                                    label: 'Line 4',
                                    name: 'line4',
                                    inputType: 'text'
                                });
                                pipeTextOptions.push({
                                    label: 'Line 5',
                                    name: 'line5',
                                    inputType: 'text'
                                });
                                pipeTextOptions.push({
                                    label: 'Letter spacing',
                                    name: 'letterSpacing',
                                    inputType: 'number',
                                    value: 100
                                });
                                pipeTextOptions.push({
                                    label: 'Font',
                                    name: 'font',
                                    inputType: 'select',
                                    inputOptions: [
                                        {text: 'Default font (By dontpokejosh)', value: 'dontpokejosh'},
                                        {text: 'Default font (By ShinoHarvest)', value: 'ShinoHarvest'}
                                    ],
                                    value: 'dontpokejosh'
                                });
                                pipeTextOptions.push({
                                    label: 'Text alignment from foundation',
                                    name: 'textAlign',
                                    inputType: 'select',
                                    inputOptions: [
                                        {text: 'Left', value: 'left'},
                                        {text: 'Center', value: 'center'},
                                        {text: 'Right', value: 'right'}
                                    ],
                                    value: 'center'
                                });
                                pipeTextOptions.push({
                                    label: 'Depth alignment from foundation',
                                    name: 'depthAlign',
                                    inputType: 'select',
                                    inputOptions: [
                                        {text: 'Foreground', value: 300},
                                        {text: 'Middle', value: 0},
                                        {text: 'Background', value: -300}
                                    ],
                                    value: 0
                                });

                            bootbox.form({
                                title: "Pipe text options",
                                message: '<div class="alert alert-danger text-center">Work in progress...</div>',
                                container: '#leafletMap', backdrop: false,
                                centerVertical: true,
                                inputs: pipeTextOptions,
                                callback: function(values)
                                {
                                    if(values === null || values.line1 === null || values.line2 === null || values.line3 === null || values.line4 === null || values.line5 === null || values.font === null || values.letterSpacing === null || values.textAlign === null || values.depthAlign === null)
                                    {
                                        return;
                                    }

                                    return new BaseLayout_Spawn_Text({
                                        baseLayout      : this,
                                        marker          : marker,

                                        line1           : values.line1,
                                        line2           : values.line2,
                                        line3           : values.line3,
                                        line4           : values.line4,
                                        line5           : values.line5,

                                        font            : values.font,
                                        letterSpacing   : values.letterSpacing,
                                        textAlign       : values.textAlign,
                                        depthAlign      : values.depthAlign,

                                        useOwnMaterials : form.useOwnMaterials
                                    });

                                }.bind(this)
                            });
                            break;
                        default:
                            return;
                    }
                }
            }.bind(this)
        });
    }

    rotationPlayerWall180(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(this.history !== null)
            {
                this.history.add({
                    name: 'Undo: Rotate by 180°',
                    values: [{
                        pathName: marker.relatedTarget.options.pathName,
                        callback: 'refreshMarkerPosition',
                        properties: {transform: JSON.parse(JSON.stringify(currentObject.transform))}
                    }]
                });
            }

        currentObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(currentObject.transform.rotation, 180);

        this.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
    }

    editPlayerStorageBuildingInventory(marker, inventoryProperty = 'mStorageInventory')
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
        {
            inventoryProperty   = 'mInventory';
        }

        let inventory           = this.getObjectInventory(currentObject, inventoryProperty);
        let inventoryOptions    = [];
        let selectOptions       = this.generateInventoryOptions();
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

        for(let i = 0; i < buildingData.maxSlot; i++)
        {
            let newInventorySlot = {
                prependLabel: true,
                label: '#' + (i + 1),
                name: 'slot' + (i + 1),
                inputType: 'select',
                inputOptions: selectOptions,
                class: 'selectpicker'
            };

            if(inventory[i] !== undefined && inventory[i] !== null)
            {
                newInventorySlot.value  = inventory[i].className;
                newInventorySlot.qty    = inventory[i].qty;
            }
            else
            {
                newInventorySlot.value = 'NULL';
                newInventorySlot.qty    = 0;
            }

            inventoryOptions.push(newInventorySlot);
        }

        bootbox.form({
            title: '"<strong>' + buildingData.name + '</strong>" Inventory',
            //container: '#leafletMap', backdrop: false,
            centerVertical: true,
            scrollable: true,
            inputs: inventoryOptions,
            callback: function(values)
            {
                if(values === null)
                {
                    return;
                }

                let oldInventory = this.getObjectInventory(currentObject, inventoryProperty, true);

                for(let i = 0; i < oldInventory.properties.length; i++)
                {
                    if(oldInventory.properties[i].name === 'mInventoryStacks')
                    {
                        oldInventory = oldInventory.properties[i].value.values;

                        for(let j = 0; j < buildingData.maxSlot; j++)
                        {
                            if(oldInventory[j] !== undefined)
                            {
                                if(oldInventory[j][0].value.itemName !== '/Game/FactoryGame/Resource/Parts/NuclearWaste/Desc_NuclearWaste.Desc_NuclearWaste_C' || this.useDebug === true)
                                {
                                    if(values['slot' + (j + 1)] === 'NULL')
                                    {
                                        oldInventory[j][0].value.itemName = "";
                                        this.setObjectProperty(oldInventory[j][0].value, 'NumItems', 0, 'IntProperty');
                                    }
                                    else
                                    {
                                        oldInventory[j][0].value.itemName = values['slot' + (j + 1)];
                                        this.setObjectProperty(oldInventory[j][0].value, 'NumItems', Math.max(1, parseInt(values['QTY_slot' + (j + 1)])), 'IntProperty');
                                    }
                                }
                                else
                                {
                                    if(this.ficsitRadioactiveAlert === undefined)
                                    {
                                        this.ficsitRadioactiveAlert = true;
                                        bootbox.alert("Nuclear Waste cannot be destoyed.<br />FICSIT does not waste.");
                                    }
                                }
                            }

                        }
                        break;
                    }
                }

                this.ficsitRadioactiveAlert = undefined;
            }.bind(this)
        });
    }

    fillPlayerStorageBuildingInventory(marker, inventoryProperty = 'mStorageInventory')
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
        {
            inventoryProperty   = 'mInventory';
        }

        let selectOptions       = this.generateInventoryOptions(false);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

        bootbox.form({
            title: 'Fill "<strong>' + buildingData.name + '</strong>" Inventory',
            container: '#leafletMap', backdrop: false,
            centerVertical: true,
            scrollable: true,
            inputs: [{
                name: 'fillWith',
                inputType: 'select',
                inputOptions: selectOptions,
                class: 'selectpicker'
            }],
            callback: function(values)
            {
                if(values === null)
                {
                    return;
                }

                let currentItem = this.getItemDataFromClassName(values.fillWith);
                let stack       = (currentItem !== null && currentItem.stack !== undefined) ? currentItem.stack : 100;

                let oldInventory = this.getObjectInventory(currentObject, inventoryProperty, true);

                for(let i = 0; i < oldInventory.properties.length; i++)
                {
                    if(oldInventory.properties[i].name === 'mInventoryStacks')
                    {
                        oldInventory = oldInventory.properties[i].value.values;

                        for(let j = 0; j < buildingData.maxSlot; j++)
                        {
                            if(oldInventory[j] !== undefined)
                            {
                                if(oldInventory[j][0].value.itemName !== '/Game/FactoryGame/Resource/Parts/NuclearWaste/Desc_NuclearWaste.Desc_NuclearWaste_C')
                                {
                                    oldInventory[j][0].value.itemName = values.fillWith;
                                    this.setObjectProperty(oldInventory[j][0].value, 'NumItems', stack, 'IntProperty');
                                }
                                else
                                {
                                    if(this.ficsitRadioactiveAlert === undefined)
                                    {
                                        this.ficsitRadioactiveAlert = true;
                                        bootbox.alert("Nuclear Waste cannot be destoyed.<br />FICSIT does not waste.");
                                    }
                                }
                            }

                        }
                        break;
                    }
                }

                this.ficsitRadioactiveAlert = undefined;
            }.bind(this)
        });
    }

    generateInventoryOptions(addNULL = true)
    {
        let selectOptions   = [];
        let itemsCategories = {
            ore                 : 'Ores',
            material            : 'Materials',
            component           : 'Components',
            fuel                : 'Fuels',
            ammo                : 'Ammos',
            special             : 'Special',
            ficsmas             : 'FICSMAS Holiday Event',
            waste               : 'Waste',
            mods                : 'Modded items'
        };

        for(let category in itemsCategories)
        {
            let categoryOptions = [];
                for(let i in this.itemsData)
                {
                    if(this.itemsData[i].className !== undefined && this.itemsData[i].className !== null && this.itemsData[i].category !== 'liquid' && this.itemsData[i].category === category)
                    {
                        categoryOptions.push({
                            group: itemsCategories[category],
                            dataContent: '<img src="' + this.itemsData[i].image + '" style="width: 24px;" /> ' + this.itemsData[i].name,
                            value: this.itemsData[i].className,
                            text: this.itemsData[i].name
                        });
                    }
                }
                categoryOptions.sort((a, b) => a.text.localeCompare(b.text));
                selectOptions = selectOptions.concat(categoryOptions);
        }

        let toolsOptions = [];
            for(let i in this.toolsData)
            {
                if(this.toolsData[i].className !== undefined && this.toolsData[i].className !== null)
                {
                    toolsOptions.push({
                        group: 'Tools',
                        dataContent: '<img src="' + this.toolsData[i].image + '" style="width: 24px;" /> ' + this.toolsData[i].name,
                        value: this.toolsData[i].className,
                        text: this.toolsData[i].name
                    });
                }
            }
            toolsOptions.sort((a, b) => a.text.localeCompare(b.text));
            selectOptions = selectOptions.concat(toolsOptions);

        if(addNULL === true)
        {
            selectOptions.unshift({
                value: 'NULL',
                text: '-----'
            });
        }

        return selectOptions;
    }

    addDecoration(currentObject, resolve = false, skipMod = false)
    {
        let mDecorationDescriptor = this.getObjectProperty(currentObject, 'mDecorationDescriptor');
            if(mDecorationDescriptor !== null)
            {
                let currentItemData = this.getItemDataFromClassName(mDecorationDescriptor.pathName);
                    if(currentItemData !== null)
                    {
                        currentItemData.width       = 4;
                        currentItemData.length      = 4;
                        currentItemData.mapLayer    = 'playerStatuesLayer';
                        return this.addGenericBuilding(currentObject, currentItemData, resolve, skipMod);
                    }
            }

        // If not found resolve if needed...
        if(resolve !== false)
        {
            return resolve();
        }
    }

    addPortableMiner(currentObject, resolve = false, skipMod = false)
    {
        let currentItemData = this.getItemDataFromClassName(currentObject.className);
            if(currentItemData !== null)
            {
                currentItemData.width       = 1;
                currentItemData.length      = 1;
                currentItemData.category    = 'extractor';
                currentItemData.mapLayer    = 'playerMinersLayer';
                return this.addGenericBuilding(currentObject, currentItemData, resolve, skipMod);
            }
    }

    addGenericBuilding(currentObject, buildingData, resolve = false, skipMod = false)
    {
        let layerId         = (buildingData.mapLayer !== undefined) ? buildingData.mapLayer : 'playerUnknownLayer';
            this.setupSubLayer(layerId);

            if(this.playerLayers[layerId].filtersCount !== undefined)
            {
                if(this.playerLayers[layerId].filtersCount[currentObject.className] === undefined)
                {
                    this.playerLayers[layerId].filtersCount[currentObject.className] = 0;
                }
                this.playerLayers[layerId].filtersCount[currentObject.className]++;
            }

        // Check building options
        let offset          = (buildingData.mapOffset !== undefined) ? buildingData.mapOffset : 0;
        let weight          = (buildingData.mapWeight !== undefined) ? buildingData.mapWeight : 1;
        let widthSize       = (buildingData.width !== undefined) ? (buildingData.width * 100) : 800;
        let lenghtSize      = (buildingData.length !== undefined) ? (buildingData.length * 100) : 800;
        let haveWaste       = false;

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorIntegratedBiomass.Build_GeneratorIntegratedBiomass_C')
        {
            offset = 500;
        }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipePump/Build_PipelinePump.Build_PipelinePump_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipePumpMk2/Build_PipelinePumpMK2.Build_PipelinePumpMk2_C')
        {
            let pumpAngle = BaseLayout_Math.getQuaternionToEuler(currentObject.transform.rotation);

                //if(pumpAngle.roll <= -90 || pumpAngle.roll >= 90)
                if(Math.round(pumpAngle.pitch) === 90 || Math.round(pumpAngle.pitch) === 270)
                {
                    widthSize      = (buildingData.height !== undefined) ? (buildingData.height * 100) : 800;
                }
        }

        // Update nodes used by extraction building
        if(buildingData.category === 'extraction')
        {
            let extractResourceNode     = this.getObjectProperty(currentObject, 'mExtractableResource');
                if(extractResourceNode !== null)
                {
                    if(this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
                    {
                        this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].setOpacity(window.SCIM.collectedOpacity);
                    }
                }

            this.getObjectRadioactivity(currentObject, 'mOutputInventory');
        }

        // Calculate production statistics
        if(buildingData.category === 'production' && skipMod === false)
        {
            this.getObjectRadioactivity(currentObject, 'mInputInventory');
            this.getObjectRadioactivity(currentObject, 'mOutputInventory');
        }

        // Calculate generator statistics
        if(buildingData.category === 'generator')
        {
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
            {
                // Update geothermal status
                let extractResourceNode = this.getObjectProperty(currentObject, 'mExtractableResource');

                if(extractResourceNode !== null)
                {
                    if(this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
                    {
                        this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].setOpacity(window.SCIM.collectedOpacity);
                    }
                }
            }
        }

        // Add conveyor lift distance...
        if(currentObject.className.search('/Build_ConveyorLiftMk') !== -1)
        {
            let mTopTransform = this.getObjectProperty(currentObject, 'mTopTransform');
                if(mTopTransform !== null)
                {
                    for(let i = 0; i < mTopTransform.values.length; i++)
                    {
                        if(mTopTransform.values[i].name === 'Translation')
                        {
                            let height      = Math.abs(mTopTransform.values[i].value.values.z) / 100;
                                this.playerLayers[layerId].distance += height;
                        }
                    }
                }
        }

        // Do we have radioactivity that should prevent a deletion!? ;)
        if((buildingData.maxSlot !== undefined && buildingData.maxSlot > 0) || buildingData.category === 'generator')
        {
            let buildingInventoryProperty = 'mStorageInventory';
                if(buildingData.category === 'dockstation'){ buildingInventoryProperty = 'mInventory'; }
                if(buildingData.category === 'generator'){ buildingInventoryProperty = 'mFuelInventory'; }

            haveWaste = this.getObjectRadioactivity(currentObject, buildingInventoryProperty);
        }

        // Create building instance
        let markerOptions   = {weight: weight};
            if(haveWaste === true)
            {
                markerOptions.haveWaste = true;
            }

        // Add vehicle tracks
        if(buildingData.category === 'vehicle')
        {
            let vehicleTrack   = this.getVehicleTrack(currentObject);
                if(vehicleTrack.length > 0)
                {
                    let vehicleTrackData     = [];
                        for(let k = 0; k < vehicleTrack.length; k++)
                        {
                            vehicleTrackData.push(this.satisfactoryMap.unproject(vehicleTrack[k]));
                        }

                    let vehicleTrackMarker = L.polyline(
                        vehicleTrackData,
                        {
                            pathName: currentObject.pathName + '_vehicleTrackData',
                            originPathName: currentObject.pathName,
                            color: '#FFC0CB',
                            weight: 2,
                            dashArray: '15 5',
                            altitude: currentObject.transform.translation[2]
                        }
                    );

                    vehicleTrackMarker.on('mouseover', function(marker){
                        let markerSource = this.getMarkerFromPathName(marker.sourceTarget.options.originPathName);
                            this.setBuildingMouseOverStyle(markerSource, buildingData);
                    }.bind(this));
                    vehicleTrackMarker.on('mouseout', function(marker){
                        let markerSource = this.getMarkerFromPathName(marker.sourceTarget.options.originPathName);
                            this.setBuildingMouseOutStyle(markerSource, buildingData);
                    }.bind(this));

                    markerOptions.vehicleTrackDataPathName = currentObject.pathName + '_vehicleTrackData';

                    this.playerLayers[layerId].elements.push(vehicleTrackMarker);

                    if(this.playerLayers[layerId].filtersCount !== undefined)
                    {
                        if(this.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData'] === undefined)
                        {
                            this.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData'] = 0;
                        }
                        this.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData']++;
                    }
                }

            if(layerId === 'playerTrainsLayer')
            {
                this.saveGameRailVehicles.push(currentObject);
            }
        }

        // Extra marker?
        if(buildingData.mapIconImage !== undefined)
        {
            let position = this.satisfactoryMap.unproject(currentObject.transform.translation);
                markerOptions.extraMarker = L.marker(
                    position,
                    {originPathName: currentObject.pathName}
                ).addTo(this.playerLayers[layerId].subLayer);

                //TODO: Mouseout not working?
                /*
                markerOptions.extraMarker.on('mouseover', function(marker){
                    let markerSource = this.getMarkerFromPathName(marker.sourceTarget.options.originPathName);
                        this.setBuildingMouseOverStyle(markerSource, buildingData);
                }.bind(this));
                markerOptions.extraMarker.on('mouseout', function(marker){
                    console.log('out?');
                    let markerSource = this.getMarkerFromPathName(marker.sourceTarget.options.originPathName);
                        this.setBuildingMouseOutStyle(markerSource, buildingData);
                }.bind(this));
                */
        }

        let building = this.createBuildingPolygon(currentObject, markerOptions, [widthSize, lenghtSize], offset);
            building.on('mouseover', function(marker){
                this.setBuildingMouseOverStyle(marker.sourceTarget, buildingData);
            }.bind(this));
            building.on('mouseout', function(marker){
                this.setBuildingMouseOutStyle(marker.sourceTarget, buildingData);
            }.bind(this));
            this.setBuildingMouseOutStyle(building, buildingData, currentObject);

        if(this.playerLayers[layerId].count !== undefined && buildingData.mapUseCount !== undefined && buildingData.mapUseCount === true)
        {
            this.playerLayers[layerId].count++;
        }
        this.playerLayers[layerId].elements.push(building);

        if(resolve === false)
        {
            return {layer: layerId, marker: building};
        }

        return resolve();
    }

    setBuildingMouseOverStyle(marker, buildingData)
    {
        let hoverColor      = '#999999';

            if(buildingData.category === 'unknown' || buildingData.category === 'pad' || buildingData.category === 'walkway' || buildingData.category === 'stair' || (buildingData.mapUseSlotColor !== undefined && buildingData.mapUseSlotColor === false && buildingData.className !== '/Game/FactoryGame/Buildable/Building/Foundation/Build_FoundationGlass_01.Build_FoundationGlass_01_C'))
            {
                marker.setStyle({
                    color: hoverColor,
                    fillColor: buildingData.mapColor,
                    fillOpacity: 0.9
                });
            }
            else
            {
                marker.setStyle({
                    fillColor: hoverColor,
                    fillOpacity: 0.9
                });
            }

            if(marker.options.extraMarker !== undefined)
            {
                marker.options.extraMarker.setIcon(this.getMarkerIcon('#BF0020', '#b3b3b3', buildingData.mapIconImage));
            }

            if(marker.options.vehicleTrackDataPathName !== undefined)
            {
                let vehicleTrackDataMarker = this.getMarkerFromPathName(marker.options.vehicleTrackDataPathName, 'playerVehiculesLayer');
                    if(vehicleTrackDataMarker !== null)
                    {
                        vehicleTrackDataMarker.setStyle({color: '#BF0020'});
                    }
            }
    }

    setBuildingMouseOutStyle(marker, buildingData, currentObject = null)
    {
        if(currentObject === null)
        {
            currentObject       = this.saveGameParser.getTargetObject(marker.options.pathName);
        }

        let mapOpacity = (buildingData !== null && buildingData.mapOpacity !== undefined) ? buildingData.mapOpacity : 0.2;

        if(buildingData !== null && buildingData.mapUseSlotColor !== undefined && buildingData.mapUseSlotColor === false)
        {
            marker.setStyle({
                color: buildingData.mapColor,
                fillColor: ((buildingData.mapFillColor !== undefined) ? buildingData.mapFillColor : buildingData.mapColor),
                fillOpacity: mapOpacity
            });
        }
        else
        {
            if(buildingData !== null && buildingData.mapUseSlotColorDefault !== undefined && buildingData.mapUseSlotColorDefault === false)
            {
                let haveDefaulColorSlot = this.getObjectPrimaryColorSlot(currentObject, true);
                    if(haveDefaulColorSlot === null)
                    {
                        marker.setStyle({
                            color: buildingData.mapColor,
                            fillColor: ((buildingData.mapFillColor !== undefined) ? buildingData.mapFillColor : buildingData.mapColor),
                            fillOpacity: mapOpacity
                        });
                        return;
                    }
            }

            let slotColor = this.getObjectPrimaryColor(currentObject);
                switch(buildingData.category)
                {
                    case 'pad':
                    case 'walkway':
                    case 'stair':
                        marker.setStyle({
                            color: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                            fillColor: ((buildingData.mapFillColor !== undefined) ? buildingData.mapFillColor : buildingData.mapColor),
                            fillOpacity: mapOpacity
                        });
                        break;
                    case 'wall':
                        marker.setStyle({
                            color: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                            fillColor: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                            fillOpacity: mapOpacity
                        });
                        break;
                    default:
                        marker.setStyle({
                            color: buildingData.mapColor,
                            fillColor: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                            fillOpacity: mapOpacity
                        });
                        break;
                }
        }

        if(marker.options.extraMarker !== undefined)
        {
            marker.options.extraMarker.setIcon(this.getMarkerIcon('#FFFFFF', '#b3b3b3', buildingData.mapIconImage));
        }

        if(marker.options.vehicleTrackDataPathName !== undefined)
        {
            let vehicleTrackDataMarker = this.getMarkerFromPathName(marker.options.vehicleTrackDataPathName, 'playerVehiculesLayer');
                if(vehicleTrackDataMarker !== null)
                {
                    vehicleTrackDataMarker.setStyle({color: '#FFC0CB'});
                }
        }
    }

    editPlayerProductionBuildingRecipe(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);
        let mCurrentRecipe      = this.getObjectProperty(currentObject, 'mCurrentRecipe');
        let selectedRecipes     = [];
        let selectOptions       = [];

        let statisticsSchematics = new BaseLayout_Statistics_Schematics({
                baseLayout      : this
            });
        let purchasedSchematics = statisticsSchematics.getPurchasedSchematics();

        for(let recipeId in this.recipesData)
        {
            if(this.recipesData[recipeId].mProducedIn !== undefined && this.recipesData[recipeId].mProducedIn.includes(currentObject.className))
            {
                selectedRecipes.push(recipeId);
            }
        }

        selectedRecipes.sort(function(a, b){
            return this.recipesData[a].name.localeCompare(this.recipesData[b].name);
        }.bind(this));

        for(let i = 0; i < selectedRecipes.length; i++)
        {
            if(this.recipesData[selectedRecipes[i]].className !== undefined)
            {
                let isUnlocked = false;

                    for(let schematicId in this.schematicsData)
                    {
                        if(this.schematicsData[schematicId].className !== undefined && purchasedSchematics.includes(this.schematicsData[schematicId].className))
                        {
                            if(this.schematicsData[schematicId].recipes !== undefined && this.schematicsData[schematicId].recipes.includes(this.recipesData[selectedRecipes[i]].className))
                            {
                                isUnlocked = true;
                            }
                        }
                    }

                    if(isUnlocked === true)
                    {
                        selectOptions.push({text: this.recipesData[selectedRecipes[i]].name, value: this.recipesData[selectedRecipes[i]].className});
                    }
            }
        }

        selectOptions.unshift({text: 'None', value: 'NULL'});

        this.pauseMap();

        bootbox.form({
            title       : 'Update "' + buildingData.name + '" recipe',
            container   : '#leafletMap', backdrop: false,
            centerVertical: true,
            inputs: [
                {
                    name: 'recipe',
                    inputType: 'select',
                    inputOptions: selectOptions,
                    value: ((mCurrentRecipe !== null) ? mCurrentRecipe.pathName : 'NULL')
                }
            ],
            callback: function(form)
            {
                if(form === null || form.recipe === null)
                {
                    this.unpauseMap();
                    return;
                }

                if(form.recipe === 'NULL')
                {
                    this.deleteObjectProperty(currentObject, 'mCurrentRecipe');
                }
                else
                {
                    if(mCurrentRecipe === null)
                    {
                         currentObject.properties.push({name: "mCurrentRecipe", type: "ObjectProperty", value: {levelName: "", pathName: form.recipe}});
                    }
                    else
                    {
                        mCurrentRecipe.pathName = form.recipe;
                    }
                }

                //TODO: Clean output inventories...

                this.unpauseMap();
                return;
            }.bind(this)
        });
    }

    deleteGenericBuilding(marker, updateRadioactivity = true, fast = false)
    {
        let pathName        = marker.relatedTarget.options.pathName;
        let currentObject   = this.saveGameParser.getTargetObject(pathName);
        let buildingData    = this.getBuildingDataFromClassName(currentObject.className);

            if(currentObject.className === '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C')
            {
                let mDecorationDescriptor   = this.getObjectProperty(currentObject, 'mDecorationDescriptor');
                    buildingData            = this.getItemDataFromClassName(mDecorationDescriptor.pathName);
                    buildingData.mapLayer   = 'playerStatuesLayer';
            }

        let layerId         = (buildingData !== null && buildingData.mapLayer !== undefined) ? buildingData.mapLayer : 'playerHUBTerminalLayer';

            if(this.playerLayers[layerId].filtersCount !== undefined)
            {
                if(this.playerLayers[layerId].filtersCount[currentObject.className] !== undefined)
                {
                    if(this.playerLayers[layerId].filtersCount[currentObject.className].distance !== undefined)
                    {
                        if(this.playerLayers[layerId].distance !== undefined)
                        {
                            let splineData = this.extractSplineData(currentObject);
                            if(splineData !== null)
                            {
                                this.playerLayers[layerId].filtersCount[currentObject.className].distance -= splineData.distance;

                                if(this.playerLayers[layerId].filtersCount[currentObject.className].distance <= 0)
                                {
                                    this.playerLayers[layerId].filtersCount[currentObject.className].distance = 0;
                                    $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((currentObject.className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : currentObject.className) + '"]').hide();
                                }
                            }
                        }
                    }
                    else
                    {
                        this.playerLayers[layerId].filtersCount[currentObject.className]--;

                        if(this.playerLayers[layerId].filtersCount[currentObject.className] === 0)
                        {
                            $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((currentObject.className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : currentObject.className) + '"]').hide();
                        }
                    }
                }
            }

        // Check all known power connection in children and delete wires when needed!
        for(let i = 0; i < currentObject.children.length; i++)
        {
            let childrenPathName    = currentObject.children[i].pathName;
            let childrenType        = '.' + childrenPathName.split('.').pop();

            if(this.availablePowerConnection.indexOf(childrenType) !== -1)
            {
                let currentObjectChildren = this.saveGameParser.getTargetObject(pathName + childrenType);
                    if(currentObjectChildren !== null)
                    {
                        this.deletePlayerWiresFromPowerConnection(currentObjectChildren);
                    }
            }
        }

        // Remove belt/track connection if needed
        this.unlinkObjectComponentConnection(currentObject);

        // Does the layer have a distance field to update?
        if(this.playerLayers[layerId].distance !== undefined)
        {
            let splineData = this.extractSplineData(currentObject);
            if(splineData !== null)
            {
                this.playerLayers[layerId].distance -= splineData.distance;
            }
        }

        //MOD: Efficiency Checker
        let innerPipelineAttachment = this.getObjectProperty(currentObject, 'innerPipelineAttachment');
            if(innerPipelineAttachment !== null)
            {
                this.saveGameParser.deleteObject(innerPipelineAttachment.pathName);
            }

        // Extraction buildings need to release the connected node!
        if((buildingData !== null && buildingData.category === 'extraction') || currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
        {
            let resourceNode     = this.getObjectProperty(currentObject, 'mExtractableResource');

            if(resourceNode !== null)
            {
                resourceNode    = this.saveGameParser.getTargetObject(resourceNode.pathName);

                if(resourceNode !== null) // Prevent water volumes ^^
                {
                    if(this.satisfactoryMap.collectableMarkers !== undefined && this.satisfactoryMap.collectableMarkers[resourceNode.pathName] !== undefined)
                    {
                        this.satisfactoryMap.collectableMarkers[resourceNode.pathName].setOpacity(1);
                    }

                    for(let i = 0; i < resourceNode.properties.length; i++)
                    {
                        if(resourceNode.properties[i].name === 'mIsOccupied')
                        {
                            resourceNode.properties[i].value = 0;
                            break;
                        }
                    }
                }
            }
        }

        // Delete vehicles waypoints
        if(buildingData !== null && buildingData.category === 'vehicle')
        {
            let currentTargetNodeLinkedList = this.getObjectProperty(currentObject, 'mTargetNodeLinkedList');

            if(currentTargetNodeLinkedList !== null)
            {
                let targetNode = this.saveGameParser.getTargetObject(currentTargetNodeLinkedList.pathName);

                if(targetNode.properties.length > 0)
                {
                    let firstNode   = null;
                    let lastNode    = null;

                    for(let j = 0; j < targetNode.properties.length; j++)
                    {
                        if(targetNode.properties[j].name === 'mFirst')
                        {
                            firstNode = this.saveGameParser.getTargetObject(targetNode.properties[j].value.pathName);
                        }
                        if(targetNode.properties[j].name === 'mLast')
                        {
                            lastNode = this.saveGameParser.getTargetObject(targetNode.properties[j].value.pathName);
                        }
                        if(firstNode !== null && lastNode !== null)
                        {
                            break;
                        }
                    }

                    if(firstNode !== null && lastNode !== null)
                    {
                        let checkCurrentNode = firstNode;

                        while(checkCurrentNode !== null && checkCurrentNode.pathName !== lastNode.pathName)
                        {
                            let checkCurrentNodeProperties  = checkCurrentNode.properties;
                                this.saveGameParser.deleteObject(checkCurrentNode.pathName);
                                checkCurrentNode            = null;

                            for(let k = 0; k < checkCurrentNodeProperties.length; k++)
                            {
                                if(checkCurrentNodeProperties[k].name === 'mNext')
                                {
                                    checkCurrentNode = this.saveGameParser.getTargetObject(checkCurrentNodeProperties[k].value.pathName);
                                    break;
                                }
                            }
                        }

                        this.saveGameParser.deleteObject(lastNode.pathName);
                    }

                    let vehicleTrackData = this.getMarkerFromPathName(marker.relatedTarget.options.pathName + '_vehicleTrackData', 'playerVehiculesLayer');
                        if(vehicleTrackData !== null)
                        {
                            this.deleteMarkerFromElements('playerVehiculesLayer', vehicleTrackData, fast);

                            this.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData']--;

                            if(this.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData'] === 0)
                            {
                                $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hide();
                            }
                        }
                }
            }

            for(let n = this.saveGameRailVehicles.length - 1; n >= 0; n--)
            {
                if(this.saveGameRailVehicles[n].pathName === currentObject.pathName)
                {
                    this.saveGameRailVehicles.splice(n, 1);
                }
            }
        }

        // Delete trains on tracks!
        if(
               currentObject.className !== '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C'
            || currentObject.className !== '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C'
        )
        {
            for(let n = this.saveGameRailVehicles.length - 1; n >= 0; n--)
            {
                let mTrackPosition = this.getObjectProperty(this.saveGameRailVehicles[n], 'mTrackPosition');

                if(mTrackPosition !== null)
                {
                    if(mTrackPosition.pathName === currentObject.pathName)
                    {
                        this.saveGameParser.deleteObject(this.saveGameRailVehicles[n].pathName);
                        this.deleteMarkerFromElements('playerTrainsLayer', this.getMarkerFromPathName(this.saveGameRailVehicles[n].pathName, 'playerTrainsLayer'), fast);
                        this.saveGameRailVehicles.splice(n, 1);
                    }
                }
            }
        }

        // Delete underlying railway track + Game sign
        if(
               currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C'
            || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C'
            || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'
            || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainPlatformEmpty.Build_TrainPlatformEmpty_C'
            || layerId === 'playerTrainsLayer'
        )
        {
            let mRailroadTrack = this.getObjectProperty(currentObject, 'mRailroadTrack');
            if(mRailroadTrack !== null)
            {
                let railroadTrackMarker = this.getMarkerFromPathName(mRailroadTrack.pathName, layerId);
                if(railroadTrackMarker !== null)
                {
                    this.deleteGenericBuilding({relatedTarget: railroadTrackMarker});
                }
            }

            this.deleteSaveGameSign(currentObject);
        }

        // Delete extra marker!
        if(marker.relatedTarget.options.extraMarker !== undefined)
        {
            this.playerLayers[layerId].subLayer.removeLayer(marker.relatedTarget.options.extraMarker);
        }

        // Delete current object
        if(this.playerLayers[layerId].count !== undefined && buildingData.mapUseCount !== undefined && buildingData.mapUseCount === true)
        {
            this.playerLayers[layerId].count--;
        }
        this.saveGameParser.deleteObject(pathName);
        this.deleteMarkerFromElements(layerId, marker.relatedTarget, fast);

        // Refresh radioactivity
        if(currentObject.className.search('/Build_ConveyorBeltMk') !== -1)
        {
            if(this.useRadioactivity && currentObject.extra !== undefined && currentObject.extra.items.length > 0)
            {
                for(let i = 0; i < currentObject.extra.items.length; i++)
                {
                    let currentItemData = this.getItemDataFromClassName(currentObject.extra.items[i].name);

                    if(currentItemData !== null)
                    {
                        if(currentItemData.radioactiveDecay !== undefined)
                        {
                            delete this.playerLayers.playerRadioactivityLayer.elements[pathName + '_' + i];
                        }
                    }
                }
            }
        }
        else
        {
            delete this.playerLayers.playerRadioactivityLayer.elements[pathName];
        }

        this.radioactivityLayerNeedsUpdate = true;

        if(updateRadioactivity === true)
        {
            this.updateRadioactivityLayer();
        }
    }

    //TODO: Advanced debug edition...
    advancedDebugObject(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let html                = [];
        let htmlChildren        = [];
        let childrenPathName    = [];
        let extraPathName       = [];

        //html.push('<div class="alert alert-danger">Be aware that manually editing the save can lead to unexpected errors.</div>');

        for(let i = 0; i < currentObject.children.length; i++)
        {
            childrenPathName.push(currentObject.children[i].pathName);
        }
        let mOwningSpawner = this.getObjectProperty(currentObject, 'mOwningSpawner');
            if(mOwningSpawner !== null)
            {
                extraPathName.push(mOwningSpawner.pathName);
            }
        let objectCircuitID = this.getObjectCircuitID(currentObject);
            if(objectCircuitID !== null)
            {
                extraPathName.push(objectCircuitID);
            }

            html.push('<ul class="nav nav-tabs nav-fill" role="tablist">');
            html.push('<li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#advancedDebugObject-MAIN" role="tab">Main object</a></li>');
            for(let i = 0; i < currentObject.children.length; i++)
            {
                html.push('<li class="nav-item"><a class="nav-link" style="text-transform: none;" data-toggle="tab" href="#advancedDebugObject-' + currentObject.children[i].pathName.split('.').pop() + '" role="tab">.' + currentObject.children[i].pathName.split('.').pop() + '</a></li>');

                let currentChildren = this.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                    if(currentChildren !== null)
                    {
                        htmlChildren.push('<div class="tab-pane fade" id="advancedDebugObject-' + currentObject.children[i].pathName.split('.').pop() + '">');
                        htmlChildren.push('<textarea class="form-control updateObject" style="height: 75vh;" data-pathName="' + currentObject.children[i].pathName + '">' + JSON.stringify(currentChildren, null, 4) + '</textarea>');
                        //htmlChildren.push('<button class="btn btn-warning w-100" data-pathName="' + currentObject.children[i].pathName + '" disabled>Update</button>');
                        htmlChildren.push('</div>');

                        let mHiddenConnections = this.getObjectProperty(currentChildren, 'mHiddenConnections');
                            if(mHiddenConnections !== null)
                            {
                                for(let j = 0; j < mHiddenConnections.values.length; j++)
                                {
                                    if(childrenPathName.includes(mHiddenConnections.values[j].pathName) === false && extraPathName.includes(mHiddenConnections.values[j].pathName) === false)
                                    {
                                        extraPathName.push(mHiddenConnections.values[j].pathName);
                                    }
                                }
                            }

                        let mPipeNetworkID = this.getObjectProperty(currentChildren, 'mPipeNetworkID');
                            if(mPipeNetworkID !== null && this.saveGamePipeNetworks[mPipeNetworkID] !== undefined)
                            {
                                if(childrenPathName.includes(this.saveGamePipeNetworks[mPipeNetworkID]) === false && extraPathName.includes(this.saveGamePipeNetworks[mPipeNetworkID]) === false)
                                {
                                    extraPathName.push(this.saveGamePipeNetworks[mPipeNetworkID]);
                                }
                            }
                    }
                    else
                    {
                        console.log('Missing children: ' + currentObject.children[i].pathName);
                    }
            }
            for(let j = 0; j < extraPathName.length; j++)
            {
                html.push('<li class="nav-item"><a class="nav-link" style="text-transform: none;" data-toggle="tab" href="#advancedDebugObject-' + extraPathName[j].replace(':', '-').replace('.', '-').replace('.', '-') + '" role="tab">' + extraPathName[j].replace('Persistent_Level:', '') + '</a></li>');
            }

            html.push('</ul>');

            html.push('<div class="tab-content">');
            html.push('<div class="tab-pane fade show active" id="advancedDebugObject-MAIN">');
            html.push('<textarea class="form-control updateObject" style="height: 75vh;" data-pathName="' + currentObject.pathName + '">' + JSON.stringify(currentObject, null, 4) + '</textarea>');
            //html.push('<button class="btn btn-warning w-100" data-pathName="' + currentObject.pathName + '" disabled>Update</button>');
            html.push('</div>');
            html.push(htmlChildren.join(''));

            for(let j = 0; j < extraPathName.length; j++)
            {
                let currentExtraObject = this.saveGameParser.getTargetObject(extraPathName[j]);
                    html.push('<div class="tab-pane fade" id="advancedDebugObject-' + extraPathName[j].replace(':', '-').replace('.', '-').replace('.', '-') + '">');
                    html.push('<textarea class="form-control updateObject" style="height: 75vh;" data-pathName="' + extraPathName[j] + '">' + JSON.stringify(currentExtraObject, null, 4) + '</textarea>');
                    //html.push('<button class="btn btn-warning w-100" data-pathName="' + extraPathName[j] + '" disabled>Update</button>');
                    html.push('</div>');
            }

            html.push('</div>');

        $('#genericModal .modal-title').empty().html('Advanced Debug - ' + marker.relatedTarget.options.pathName);
        $('#genericModal .modal-body').empty().html(html.join(''));
        setTimeout(function(){
            $('#genericModal').modal('show').modal('handleUpdate');
            $('textarea.updateObject').on('keyup', function(){
                $(this).next('button').attr('disabled', false);
            });
        }, 250);
    }

    addPlayerBelt(currentObject)
    {
        let buildingData            = this.getBuildingDataFromClassName(currentObject.className);

            if(buildingData !== null)
            {
                this.setupSubLayer(buildingData.mapLayer);
                let splineData              = this.extractSplineData(currentObject);

                if(this.useRadioactivity && currentObject.extra !== undefined && currentObject.extra.items.length > 0)
                {
                    let radioactiveInventory    = [];

                    for(let i = 0; i < currentObject.extra.items.length; i++)
                    {
                        let currentItemData = this.getItemDataFromClassName(currentObject.extra.items[i].name, false);
                            if(currentItemData !== null)
                            {
                                if(currentItemData.radioactiveDecay !== undefined)
                                {
                                    currentObject.extra.items[i].currentItemData = currentItemData;
                                    radioactiveInventory.push(currentObject.extra.items[i]);
                                }
                            }
                    }

                    if(radioactiveInventory.length > 0)
                    {
                        for(let i = 0; i < radioactiveInventory.length; i++)
                        {
                            let currentItemData         = radioactiveInventory[i].currentItemData;
                            let currentObjectPosition   = radioactiveInventory[i].position;
                            let currentBeltDistance     = 0;

                            // Loop each belt segments trying to figure if the item is in
                            for(let s = 1; s < splineData.originalData.length; s++)
                            {
                                let segmentDistance = Math.sqrt(
                                    ((splineData.originalData[s][0] - splineData.originalData[s-1][0]) * (splineData.originalData[s][0] - splineData.originalData[s-1][0]))
                                  + ((splineData.originalData[s][1] - splineData.originalData[s-1][1]) * (splineData.originalData[s][1] - splineData.originalData[s-1][1]))
                                );

                                if(currentObjectPosition >= currentBeltDistance && currentObjectPosition <= (currentBeltDistance + segmentDistance))
                                {
                                    let radioactivePointData = [
                                        splineData.originalData[s-1][0] + (splineData.originalData[s][0] - splineData.originalData[s-1][0]) * ((currentObjectPosition - currentBeltDistance) / segmentDistance),
                                        splineData.originalData[s-1][1] + (splineData.originalData[s][1] - splineData.originalData[s-1][1]) * ((currentObjectPosition - currentBeltDistance) / segmentDistance),
                                        currentObject.transform.translation[2]
                                    ];
                                    this.addRadioactivityDot({
                                        pathName: currentObject.pathName + '_' + i,
                                        transform:{translation: radioactivePointData}
                                    }, [{qty: 1, radioactiveDecay: currentItemData.radioactiveDecay}]);

                                    break;
                                }

                                currentBeltDistance += segmentDistance;
                            }
                        }
                    }
                }

                let beltCorridor    = L.corridor(
                        splineData.data,
                        {
                            pathName: currentObject.pathName,
                            corridor: 135,
                            weight: 1,
                            altitude: currentObject.transform.translation[2]
                        }
                );

                beltCorridor.bindContextMenu(this);
                beltCorridor.on('mouseover', function(marker){
                    let currentObject       = this.saveGameParser.getTargetObject(marker.sourceTarget.options.pathName);
                    let slotColor           = this.getObjectPrimaryColor(currentObject);
                        marker.sourceTarget.setStyle({color: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')', opacity: 0.5});
                }.bind(this));
                beltCorridor.on('mouseout', function(marker){
                    let mouseOutStyle       = {opacity: 0.9};
                    let currentObject       = this.saveGameParser.getTargetObject(marker.sourceTarget.options.pathName);
                        if(currentObject !== null)
                        {
                            let buildingData        = this.getBuildingDataFromClassName(currentObject.className);
                                if(buildingData !== null)
                                {
                                    mouseOutStyle.color = buildingData.mapColor;
                                }
                        }

                    marker.sourceTarget.setStyle(mouseOutStyle);
                }.bind(this));
                beltCorridor.fire('mouseout');

                this.autoBindTooltip(beltCorridor);
                this.playerLayers[buildingData.mapLayer].distance += splineData.distance;
                this.playerLayers[buildingData.mapLayer].elements.push(beltCorridor);

                if(this.playerLayers[buildingData.mapLayer].filtersCount !== undefined)
                {
                    if(this.playerLayers[buildingData.mapLayer].filtersCount[currentObject.className] === undefined)
                    {
                        this.playerLayers[buildingData.mapLayer].filtersCount[currentObject.className] = {distance: 0};
                    }
                    this.playerLayers[buildingData.mapLayer].filtersCount[currentObject.className].distance += splineData.distance;
                }

                return {layer: buildingData.mapLayer, marker: beltCorridor};
            }

        return false;
    }

    downgradeBelt(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let usePool         = this.availableBelts;
            if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/ConveyorLift') !== -1)
            {
                usePool = this.availableLifts;
            }
        let poolIndex       = usePool.indexOf(currentObject.className);

        if(poolIndex > 0)
        {
            currentObject.className = usePool[poolIndex - 1];
        }
    }

    upgradeBelt(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let usePool         = this.availableBelts;
            if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/ConveyorLift') !== -1)
            {
                usePool = this.availableLifts;
            }
        let poolIndex       = usePool.indexOf(currentObject.className);

        if(poolIndex < (usePool.length - 1))
        {
            currentObject.className = usePool[poolIndex + 1];
        }
    }

    unlinkObjectComponentConnection(currentObject)
    {
        for(let i = 0; i < currentObject.children.length; i++)
        {
            let connectedComponent = this.saveGameParser.getTargetObject(currentObject.children[i].pathName);

            if(connectedComponent !== null)
            {
                // Belt/Pipe/Hyperpipe connection
                if(
                       connectedComponent.className === '/Script/FactoryGame.FGFactoryConnectionComponent' // Belt
                    || connectedComponent.className === '/Script/FactoryGame.FGPipeConnectionFactory' // Pipe to factory
                    || connectedComponent.className === '/Script/FactoryGame.FGPipeConnectionComponent' // Pipe to pipe
                    || connectedComponent.className === '/Game/FactoryGame/Buildable/Factory/PipeHyper/FGPipeConnectionComponentHyper.FGPipeConnectionComponentHyper_C' // Hyper tubes
                )
                {
                    let targetConnectedComponent = this.getObjectProperty(connectedComponent, 'mConnectedComponent');

                    if(targetConnectedComponent !== null)
                    {
                        let currentConnectedComponent = this.saveGameParser.getTargetObject(targetConnectedComponent.pathName);

                        if(currentConnectedComponent !== null)
                        {
                            for(let j = 0; j < currentConnectedComponent.properties.length; j++)
                            {
                                if(currentConnectedComponent.properties[j].name === 'mConnectedComponent' && currentConnectedComponent.properties[j].value.pathName === connectedComponent.pathName)
                                {
                                    currentConnectedComponent.properties.splice(j, 1);
                                }
                            }
                        }
                    }
                }

                // Railway connection
                if(connectedComponent.className === '/Script/FactoryGame.FGRailroadTrackConnectionComponent')
                {
                    let targetConnectedComponent = this.getObjectProperty(connectedComponent, 'mConnectedComponents');

                    if(targetConnectedComponent !== null)
                    {
                        for(let j = 0; j < targetConnectedComponent.values.length; j++)
                        {
                            let currentConnectedComponent = this.saveGameParser.getTargetObject(targetConnectedComponent.values[j].pathName);

                            for(let k = 0; k < currentConnectedComponent.properties.length; k++)
                            {
                                if(currentConnectedComponent.properties[k].name === 'mConnectedComponents')
                                {
                                    for(let m = 0; m < currentConnectedComponent.properties[k].value.values.length; m++)
                                    {
                                        if(currentConnectedComponent.properties[k].value.values[m].pathName === connectedComponent.pathName)
                                        {
                                            currentConnectedComponent.properties[k].value.values.splice(m, 1);
                                        }
                                    }

                                    if(currentConnectedComponent.properties[k].value.values.length === 0)
                                    {
                                        currentConnectedComponent.properties = [];
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    // Remove rails connected switches!
                    for(let switchPathName in this.saveGameRailSwitches)
                    {
                        let mControlledConnection = this.getObjectProperty(this.saveGameRailSwitches[switchPathName], 'mControlledConnection');

                        if(mControlledConnection !== null)
                        {
                            if(mControlledConnection.pathName === connectedComponent.pathName)
                            {
                                this.saveGameParser.deleteObject(switchPathName);
                                this.deleteMarkerFromElements('playerTracksLayer', this.getMarkerFromPathName(switchPathName, 'playerTracksLayer'));
                                delete this.saveGameRailSwitches[switchPathName];
                            }
                        }
                    }
                }

                // Platform connection
                if(connectedComponent.className === '/Script/FactoryGame.FGTrainPlatformConnection')
                {
                    let targetConnectedComponent = this.getObjectProperty(connectedComponent, 'mConnectedTo');

                    if(targetConnectedComponent !== null)
                    {
                        let currentConnectedComponent = this.saveGameParser.getTargetObject(targetConnectedComponent.pathName);

                        for(let j = 0; j < currentConnectedComponent.properties.length; j++)
                        {
                            if(currentConnectedComponent.properties[j].name === 'mConnectedTo' && currentConnectedComponent.properties[j].value.pathName === connectedComponent.pathName)
                            {
                                currentConnectedComponent.properties.splice(j, 1);
                            }
                        }
                    }
                }
            }
        }

        // Trains connection
        if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C' || currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
        {
            let previousTrain   = null;
            let nextTrain       = null;

            if(currentObject.extra !== undefined && currentObject.extra.previousPathName !== '')
            {
                let previousObject = this.saveGameParser.getTargetObject(currentObject.extra.previousPathName);

                if(previousObject !== null)
                {
                    if(previousObject.extra.previousPathName === currentObject.pathName)
                    {
                        previousObject.extra.previousLevelName  = '';
                        previousObject.extra.previousPathName   = '';
                    }
                    if(previousObject.extra.nextPathName === currentObject.pathName)
                    {
                        previousObject.extra.nextLevelName      = '';
                        previousObject.extra.nextPathName       = '';
                    }

                    previousTrain                           = this.getMarkerFromPathName(currentObject.extra.previousPathName, 'playerTrainsLayer');
                }

                currentObject.extra.previousLevelName   = '';
                currentObject.extra.previousPathName    = '';
            }
            if(currentObject.extra !== undefined && currentObject.extra.nextPathName !== '')
            {
                let nextObject = this.saveGameParser.getTargetObject(currentObject.extra.nextPathName);

                if(nextObject !== null)
                {
                    if(nextObject.extra.previousPathName === currentObject.pathName)
                    {
                        nextObject.extra.previousLevelName      = '';
                        nextObject.extra.previousPathName       = '';
                    }
                    if(nextObject.extra.nextPathName === currentObject.pathName)
                    {
                        nextObject.extra.nextLevelName          = '';
                        nextObject.extra.nextPathName           = '';
                    }

                    nextTrain = this.getMarkerFromPathName(currentObject.extra.nextPathName, 'playerTrainsLayer');
                }

                currentObject.extra.nextLevelName       = '';
                currentObject.extra.nextPathName        = '';
            }

            if(previousTrain !== null)
            {
                this.deleteGenericBuilding({relatedTarget: previousTrain});
            }
            if(nextTrain !== null)
            {
                this.deleteGenericBuilding({relatedTarget: nextTrain});
            }
        }
    }

    addPlayerTrack(currentObject)
    {
        this.setupSubLayer('playerTracksLayer');
        let splineData  = this.extractSplineData(currentObject);

        let trackCorridor = L.corridor(
                splineData.data,
                {
                    pathName: currentObject.pathName,
                    corridor: 600,
                    color: '#ff69b4',
                    weight: 1,
                    altitude: currentObject.transform.translation[2]
                }
        );

        trackCorridor.bindContextMenu(this);
        trackCorridor.on('mouseover', function(){ this.setStyle({color: '#bf4e87', opacity: 0.7}); });
        trackCorridor.on('mouseout', function(){ this.setStyle({color: '#ff69b4', opacity: 0.9}); });
        trackCorridor.fire('mouseout');

        this.autoBindTooltip(trackCorridor);

        this.playerLayers.playerTracksLayer.distance += splineData.distance;
        this.playerLayers.playerTracksLayer.elements.push(trackCorridor);

        return trackCorridor;
    }

    extractSplineData(currentObject)
    {
        for(let j = 0; j < currentObject.properties.length; j++)
        {
            if(currentObject.properties[j].name === 'mSplineData')
            {
                let center              = [currentObject.transform.translation[0], currentObject.transform.translation[1], currentObject.transform.translation[2]];
                let splineData          = currentObject.properties[j].value.values;
                let splineDataLength    = splineData.length;
                let splineDistance      = 0;
                let currentSplineData   = [];
                let originalSplineData  = [];

                for(let k = 0; k < splineDataLength; k++)
                {
                    let currentSpline = splineData[k];

                    let currentLocation = [
                        center[0] + currentSpline[0].value.values.x,
                        center[1] + currentSpline[0].value.values.y,
                        center[2] + currentSpline[0].value.values.z
                    ];
                    currentSplineData.push(this.satisfactoryMap.unproject(currentLocation));
                    originalSplineData.push(currentLocation);

                    if(k > 0)
                    {
                        splineDistance += Math.sqrt(
                            ((originalSplineData[k][0] - originalSplineData[k-1][0]) * (originalSplineData[k][0] - originalSplineData[k-1][0])) // X
                          + ((originalSplineData[k][1] - originalSplineData[k-1][1]) * (originalSplineData[k][1] - originalSplineData[k-1][1])) // Y
                          + ((originalSplineData[k][2] - originalSplineData[k-1][2]) * (originalSplineData[k][2] - originalSplineData[k-1][2])) // Z
                        ) / 100;
                    }
                }

                // Distance only using start/end as used by pipes in game... :D
                let altDistance = Math.sqrt(
                    ((originalSplineData[splineDataLength - 1][0] - originalSplineData[0][0]) * (originalSplineData[splineDataLength - 1][0] - originalSplineData[0][0])) // X
                    + ((originalSplineData[splineDataLength - 1][1] - originalSplineData[0][1]) * (originalSplineData[splineDataLength - 1][1] - originalSplineData[0][1])) // Y
                    + ((originalSplineData[splineDataLength - 1][2] - originalSplineData[0][2]) * (originalSplineData[splineDataLength - 1][2] - originalSplineData[0][2])) // Z
                  ) / 100;

                return {
                    distance        : splineDistance,
                    distanceAlt     : altDistance,
                    data            : currentSplineData,
                    originalData    : originalSplineData
                };
            }
        }

        return null;
    }

    addPlayerPowerLine(currentObject)
    {
        this.setupSubLayer('playerPowerGridLayer');

        // Orphaned power lines from Area Action?
        if(currentObject.extra.sourcePathName === '' || currentObject.extra.targetPathName === '')
        {
            return false;
        }

        let currentObjectSource = this.saveGameParser.getTargetObject(currentObject.extra.sourcePathName);
        let currentObjectTarget = this.saveGameParser.getTargetObject(currentObject.extra.targetPathName);

            if(currentObjectSource !== null && currentObjectTarget !== null)
            {
                let currentObjectSourceOuterPath    = this.saveGameParser.getTargetObject(currentObjectSource.outerPathName);
                let currentObjectTargetOuterPath    = this.saveGameParser.getTargetObject(currentObjectTarget.outerPathName);

                    if(currentObjectSourceOuterPath !== null && currentObjectSourceOuterPath.transform !== undefined && currentObjectTargetOuterPath !== null && currentObjectTargetOuterPath.transform !== undefined)
                    {
                        let powerline = L.polyline([
                            this.satisfactoryMap.unproject(currentObjectSourceOuterPath.transform.translation),
                            this.satisfactoryMap.unproject(currentObjectTargetOuterPath.transform.translation)
                        ], {pathName: currentObject.pathName, color: ((currentObject.className === '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C') ? '#00ff00' : '#0000ff'), weight: 1, interactive: false, altitude: ((currentObjectSourceOuterPath.transform.translation[2] + currentObjectTargetOuterPath.transform.translation[2]) / 2)});

                        this.playerLayers.playerPowerGridLayer.elements.push(powerline);

                        this.playerLayers.playerPowerGridLayer.distance += Math.sqrt(
                            ((currentObjectSourceOuterPath.transform.translation[0] - currentObjectTargetOuterPath.transform.translation[0]) * (currentObjectSourceOuterPath.transform.translation[0] - currentObjectTargetOuterPath.transform.translation[0]))
                          + ((currentObjectSourceOuterPath.transform.translation[1] - currentObjectTargetOuterPath.transform.translation[1]) * (currentObjectSourceOuterPath.transform.translation[1] - currentObjectTargetOuterPath.transform.translation[1]))
                        ) / 100;

                        return powerline;
                    }
                    else
                    {
                        console.log('addPlayerPowerLine', currentObjectSource, currentObjectSourceOuterPath, currentObjectTarget, currentObjectTargetOuterPath);
                    }

                    return false;
            }
    }

    downgradePowerPole(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let usePool         = this.availablePowerPoles;
            if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_') !== -1)
            {
                usePool = this.availablePowerPolesWall;
            }
            if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_') !== -1)
            {
                usePool = this.availablePowerPolesWallDouble;
            }
        let poolIndex       = usePool.indexOf(currentObject.className);

        if(poolIndex > 0)
        {
            currentObject.className = usePool[poolIndex - 1];
        }
    }

    upgradePowerPole(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let usePool         = this.availablePowerPoles;
            if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_') !== -1)
            {
                usePool = this.availablePowerPolesWall;
            }
            if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_') !== -1)
            {
                usePool = this.availablePowerPolesWallDouble;
            }
        let poolIndex       = usePool.indexOf(currentObject.className);

        if(poolIndex < (usePool.length - 1))
        {
            currentObject.className = usePool[poolIndex + 1];
        }
    }

    deletePlayerWiresFromPowerConnection(currentObjectPowerConnection)
    {
        let currentObjectWires              = this.getObjectProperty(currentObjectPowerConnection, 'mWires');

        if(currentObjectWires !== null)
        {
            let wires = [];

            for(let i = 0; i < currentObjectWires.values.length; i++)
            {
                let wireMarker = this.getMarkerFromPathName(currentObjectWires.values[i].pathName, 'playerPowerGridLayer');

                if(wireMarker !== null)
                {
                    wires.push(wireMarker);
                }
            }

            if(wires.length > 0)
            {
                for(let i = 0; i < wires.length; i++)
                {
                    this.deletePlayerPowerLine(wires[i]);
                }
            }
        }
    }

    deletePlayerPowerLine(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.options.pathName);
        let currentObjectSource = this.saveGameParser.getTargetObject(currentObject.extra.sourcePathName);

        // Unlink source power connection
        if(currentObjectSource !== null)
        {
            this.unlinkPowerConnection(currentObjectSource, currentObject);
        }

        // Unlink target power connection
        let currentObjectTarget = this.saveGameParser.getTargetObject(currentObject.extra.targetPathName);
        if(currentObjectTarget !== null)
        {
            this.unlinkPowerConnection(currentObjectTarget, currentObject);
        }

        if(currentObjectSource !== null && currentObjectTarget !== null)
        {
            let currentObjectSourceOuterPath    = this.saveGameParser.getTargetObject(currentObjectSource.outerPathName);
            let currentObjectTargetOuterPath    = this.saveGameParser.getTargetObject(currentObjectTarget.outerPathName);

            if(currentObjectSourceOuterPath !== null && currentObjectTargetOuterPath !== null)
            {
                this.playerLayers.playerPowerGridLayer.distance -= Math.sqrt(
                    ((currentObjectSourceOuterPath.transform.translation[0] - currentObjectTargetOuterPath.transform.translation[0]) * (currentObjectSourceOuterPath.transform.translation[0] - currentObjectTargetOuterPath.transform.translation[0]))
                  + ((currentObjectSourceOuterPath.transform.translation[1] - currentObjectTargetOuterPath.transform.translation[1]) * (currentObjectSourceOuterPath.transform.translation[1] - currentObjectTargetOuterPath.transform.translation[1]))
                ) / 100;
            }
        }

        // Delete
        this.saveGameParser.deleteObject(marker.options.pathName);
        this.deleteMarkerFromElements('playerPowerGridLayer', marker);
    }

    unlinkPowerConnection(currentObjectPowerConnection, targetObject)
    {
        let connectedWires  = Infinity;
        let keepCircuitId   = false;

        for(let i = 0; i < currentObjectPowerConnection.properties.length; i++)
        {
            if(currentObjectPowerConnection.properties[i].name === 'mWires')
            {
                for(let j = 0; j < currentObjectPowerConnection.properties[i].value.values.length; j++)
                {
                    if(currentObjectPowerConnection.properties[i].value.values[j].pathName === targetObject.pathName)
                    {
                        currentObjectPowerConnection.properties[i].value.values.splice(j, 1);
                        break;
                    }
                }

                connectedWires = currentObjectPowerConnection.properties[i].value.values.length;
            }

            if(currentObjectPowerConnection.properties[i].name === 'mHiddenConnections')
            {
                keepCircuitId = true;
            }
        }

        // Empty properties...
        if(connectedWires <= 0)
        {
            currentObjectPowerConnection.properties = currentObjectPowerConnection.properties.filter(property => property.name !== 'mWires');

            if(keepCircuitId === false) // Train station have "mHiddenConnections" property so we need to keep "mCircuitID"
            {
                currentObjectPowerConnection.properties = [];
                this.saveGameParser.cleanCircuitSubSystems.push(currentObjectPowerConnection.pathName);
            }
        }
    }

    addRadioactivityDot(currentObject, radioactivityItems)
    {
        let radioactivityPosition   = currentObject.transform.translation;
        let maxDistance             = 0;
        let maxIntensity            = 0;

        for(let distance = 0.5; distance <= 9999; distance += 0.1)
        {
            let intensity = 0;

            for(let p = 0; p < radioactivityItems.length; p++)
            {
                intensity += (radioactivityItems[p].qty * radioactivityItems[p].radioactiveDecay) / (4 * Math.PI * distance * distance) * Math.pow(Math.E, -0.0125 * distance);
            }

            if(intensity > 45)
            {
                intensity = 45;
            }
            else
            {
                if(intensity < 0.2)
                {
                    intensity = 0;
                }
            }

            // Percent!
            if(intensity > 0)
            {
                maxDistance     = distance;
                intensity       = (intensity - 0.2) * 100 / 44.8;
                maxIntensity    = Math.max(maxIntensity, intensity);
            }

            if(intensity === 0)
            {
                break;
            }
        }

        if(maxDistance > 0)
        {
            let coordinates = this.satisfactoryMap.unproject([radioactivityPosition[0], radioactivityPosition[1]]);

            this.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName] = {
                lat: coordinates.lat,
                lng: coordinates.lng,
                count: maxIntensity,
                maxDistance: maxDistance,
                radius: maxDistance / 25,
                altitude: radioactivityPosition[2]
            };

            this.radioactivityLayerNeedsUpdate = true;
        }
    }



    // General functions
    //TODO: Use map cache?
    getMarkerIcon(outsideColor, insideColor, iconImage)
    {
        let icon = this.satisfactoryMap.svgIconMarker.replace(/{outsideColor}/g, outsideColor)
                                                     .replace(/{insideColor}/g, insideColor)
                                                     .replace(/{iconImage}/g, iconImage);

        return L.divIcon({
            className   : "leaflet-data-marker",
            html        : icon,
            iconAnchor  : [48, 78],
            iconSize    : [50, 80]
        });
    }

    createBuildingPolygon(currentObject, options, size, offset = 0)
    {
        let center          = [currentObject.transform.translation[0], currentObject.transform.translation[1]];
        let forms           = [];

        options.pathName    = currentObject.pathName;
        options.altitude    = currentObject.transform.translation[2];

        if(this.useDetailedModels === true && this.detailedModels !== null && this.detailedModels[currentObject.className] !== undefined)
        {
                options.smoothFactor    = this.useSmoothFactor;
            let currentModel            = this.detailedModels[currentObject.className];
            let currentModelScale       = currentModel.scale;

            if(currentModel.formsLength === undefined)
            {
                currentModel.formsLength = currentModel.forms.length;
            }

            for(let i = 0; i < currentModel.formsLength; i++)
            {
                let currentForm         = [];
                let currentPoints       = [];

                if(currentModel.forms[i].pointsLength === undefined)
                {
                    currentModel.forms[i].pointsLength = currentModel.forms[i].points.length;
                }

                for(let j = 0; j < currentModel.forms[i].pointsLength; j++)
                {
                    currentPoints.push(this.satisfactoryMap.unproject(
                        BaseLayout_Math.getPointRotation(
                            [
                                center[0] + (currentModel.forms[i].points[j][0] * currentModelScale),
                                center[1] + (currentModel.forms[i].points[j][1] * currentModelScale)
                            ],
                            center,
                            currentObject.transform.rotation
                        )
                    ));
                }

                currentForm.push(currentPoints);

                if(currentModel.forms[i].holes !== undefined)
                {
                    if(currentModel.forms[i].holesLength === undefined)
                    {
                        currentModel.forms[i].holesLength = currentModel.forms[i].holes.length;
                    }

                    for(let j = 0; j < currentModel.forms[i].holesLength; j++)
                    {
                        let currentHole = [];

                        if(currentModel.forms[i].holes[j].holeLength === undefined)
                        {
                            currentModel.forms[i].holes[j].holeLength = currentModel.forms[i].holes[j].length;
                        }

                        for(let k = 0; k < currentModel.forms[i].holes[j].holeLength; k++)
                        {
                            currentHole.push(this.satisfactoryMap.unproject(
                                BaseLayout_Math.getPointRotation(
                                    [
                                        center[0] + (currentModel.forms[i].holes[j][k][0] * currentModelScale),
                                        center[1] + (currentModel.forms[i].holes[j][k][1] * currentModelScale)
                                    ],
                                    center,
                                    currentObject.transform.rotation
                                )
                            ));
                        }

                        currentForm.push(currentHole);
                    }
                }

                forms.push(currentForm);
            }
        }
        else
        {
            let currentPoints = [];
                currentPoints.push(this.satisfactoryMap.unproject(
                    BaseLayout_Math.getPointRotation(
                        [center[0] - ((size[0] - offset) / 2), center[1] - ((size[1] - offset) / 2)],
                        center,
                        currentObject.transform.rotation
                    )
                ));
                currentPoints.push(this.satisfactoryMap.unproject(
                    BaseLayout_Math.getPointRotation(
                        [center[0] + ((size[0] - offset) / 2), center[1] - ((size[1] - offset) / 2)],
                        center,
                        currentObject.transform.rotation
                    )
                ));
                currentPoints.push(this.satisfactoryMap.unproject(
                    BaseLayout_Math.getPointRotation(
                        [center[0] + ((size[0] - offset) / 2), center[1] + ((size[1] - offset) / 2)],
                        center,
                        currentObject.transform.rotation
                    )
                ));
                currentPoints.push(this.satisfactoryMap.unproject(
                    BaseLayout_Math.getPointRotation(
                        [center[0] - ((size[0] - offset) / 2), center[1] + ((size[1] - offset) / 2)],
                        center,
                        currentObject.transform.rotation
                    )
                ));

            forms.push([currentPoints]);
        }

        let polygon         = L.polygon(forms, options);
            this.autoBindTooltip(polygon);
            polygon.bindContextMenu(this);

        return polygon;
    }

    // Layers
    setupSubLayer(layerId, show = true)
    {
        if(this.playerLayers[layerId] === undefined)
        {
            throw new Error('Undefined layerId `' + layerId + '`');
            //this.playerLayers[layerId] = {layerGroup: L.layerGroup().addTo(this.satisfactoryMap.leafletMap), subLayer: null, mainDivId: '#playerModsLayer', elements: [], useAltitude: true};
        }

        if(this.playerLayers[layerId].layerGroup === null)
        {
            this.playerLayers[layerId].layerGroup = L.layerGroup().addTo(this.satisfactoryMap.leafletMap);

            if(layerId === 'playerFogOfWar')
            {
                this.satisfactoryMap.leafletMap.createPane(layerId);
                this.satisfactoryMap.leafletMap.getPane(layerId).style.zIndex = 450;
                this.satisfactoryMap.leafletMap.getPane(layerId).style.pointerEvents = 'none';
                this.playerLayers[layerId].renderer = L.canvas({ pane: layerId });
            }
        }

        if(this.playerLayers[layerId].subLayer === null)
        {
            if(layerId === 'playerRadioactivityLayer')
            {
                this.playerLayers[layerId].subLayer = new HeatmapOverlay({
                    maxOpacity: .8,
                    scaleRadius: true,
                    useLocalExtrema: false,
                    //gradient: { 0.33: "rgb(0,255,0)", 0.90: "yellow", 1.0: "rgb(255,0,0)"}
                    gradient: { 0.40: "rgb(0,0,255)", 0.80: "rgb(0,255,0)", 0.90: "yellow", 1.0: "rgb(255,0,0)"}
                });
            }
            else
            {
                this.playerLayers[layerId].subLayer = L.layerGroup();
            }


            if(show === true)
            {
                this.playerLayers[layerId].subLayer.addTo(this.playerLayers[layerId].layerGroup);
                $('.updatePlayerLayerState[data-id=' + layerId + ']').addClass(window.SCIM.outlineClass);
            }

            $('.updatePlayerLayerState[data-id=' + layerId + ']').show();
            $(this.playerLayers[layerId].mainDivId).show();

            if(this.playerLayers[layerId].filters !== undefined)
            {
                this.playerLayers[layerId].filtersCount = {};
            }
        }
    }

    setupModSubLayer(modId, layerId)
    {
        $('#playerModsLayer').show()
                            .find('.col-12')
                            .append('<div class="btn btn-active updatePlayerLayerState m-1 p-1 radialMenu" data-id="'
                                    + layerId
                                    + '" data-hover="tooltip" title="'
                                    + this.modsData[modId].name + '"><span class="badge badge-secondary badge-layer"></span><img src="'
                                    + this.modsData[modId].image + '" style="width: 40px;" /><div class="radial"><div class="btn bg-secondary btn-outline-warning active focus p-0"></div></div></div>');

       this.playerLayers[layerId] = {layerGroup: L.layerGroup().addTo(this.satisfactoryMap.leafletMap), subLayer: null, mainDivId: '#playerModsLayer', elements: [], useAltitude: true, filters: []};
       this.setupSubLayer(layerId);
    }

    updatePlayerLayerState($this, updateLayerId)
    {
        let isHiding = $this.hasClass(window.SCIM.outlineClass); // Don't need to redraw if we're just removing the layer...

        for(let layerId in this.playerLayers)
        {
            if(this.playerLayers[layerId].subLayer !== null)
            {
                if(layerId === updateLayerId)
                {
                    if(this.playerLayers[layerId].layerGroup.hasLayer(this.playerLayers[layerId].subLayer))
                    {
                        this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer);
                        $this.removeClass(window.SCIM.outlineClass);
                    }
                    else
                    {
                        this.playerLayers[layerId].layerGroup.addLayer(this.playerLayers[layerId].subLayer);
                        $this.addClass(window.SCIM.outlineClass);
                    }
                }
                else
                {
                    // Redraw to keep layer order...
                    if(isHiding === false && updateLayerId !== 'playerFogOfWar')
                    {
                        if(this.playerLayers[layerId].layerGroup.hasLayer(this.playerLayers[layerId].subLayer))
                        {
                            this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer)
                                                                 .addLayer(this.playerLayers[layerId].subLayer);
                        }
                    }
                }
            }
        }
    }

    updatePlayerLayerFilter($this, updateLayerId, className)
    {
        let isHiding = $this.hasClass('btn-warning'); // Don't need to redraw if we're just removing the layer...
                       $this.tooltip('hide');

            for(let layerId in this.playerLayers)
            {
                if(this.playerLayers[layerId].subLayer !== null)
                {
                    if(layerId === updateLayerId)
                    {
                        if(this.playerLayers[layerId].filters !== undefined)
                        {
                            if(isHiding === false)
                            {
                                this.playerLayers[layerId].filters = this.playerLayers[layerId].filters.filter(value => value !== className);
                                $this.removeClass('btn-secondary').addClass('btn-warning');
                            }
                            else
                            {
                                this.playerLayers[layerId].filters.push(className);
                                $this.removeClass('btn-warning').addClass('btn-secondary');
                            }

                            let currentSubLayer     = this.playerLayers[layerId].subLayer;
                            let currentLayerLength  = this.playerLayers[layerId].elements.length;

                            for(let i = 0; i < currentLayerLength; i++)
                            {
                                let currentMarker           = this.playerLayers[layerId].elements[i];
                                let currentObject           = this.saveGameParser.getTargetObject(currentMarker.options.pathName);

                                    if(className === '/Game/SCIM/Buildable/Vehicle/TrackData' && currentObject === null && currentMarker.options.pathName.endsWith('_vehicleTrackData'))
                                    {
                                        if(isHiding === false)
                                        {
                                            let parentPathName  = currentMarker.options.pathName.replace('_vehicleTrackData', '');
                                            let parentMarker    = this.getMarkerFromPathName(parentPathName, 'playerVehiculesLayer');

                                                if(parentMarker !== null)
                                                {
                                                    if(currentSubLayer.hasLayer(parentMarker))
                                                    {
                                                        currentSubLayer.addLayer(currentMarker);
                                                    }
                                                }
                                        }
                                        else
                                        {
                                            currentSubLayer.removeLayer(currentMarker);
                                        }
                                    }
                                    else
                                    {
                                        if(currentObject !== null)
                                        {
                                            if(currentSubLayer.hasLayer(currentMarker) && this.playerLayers[layerId].filters.includes(currentObject.className))
                                            {
                                                currentSubLayer.removeLayer(currentMarker);

                                                if(currentMarker.options.extraMarker !== undefined)
                                                {
                                                    currentSubLayer.removeLayer(currentMarker.options.extraMarker);

                                                    let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', 'playerVehiculesLayer');
                                                        if(vehicleTrackData !== null)
                                                        {
                                                            currentSubLayer.removeLayer(vehicleTrackData);
                                                        }
                                                }
                                            }
                                            else
                                            {
                                                if(currentSubLayer.hasLayer(currentMarker) === false && this.playerLayers[layerId].filters.includes(currentObject.className) === false)
                                                {
                                                    if(this.playerLayers[layerId].useAltitude !== undefined && this.playerLayers[layerId].useAltitude === true)
                                                    {
                                                        if(currentMarker.options.altitude >= $('#altitudeSliderInputs input[name=minAltitude]').val() * 100 && currentMarker.options.altitude <= $('#altitudeSliderInputs input[name=maxAltitude]').val() * 100)
                                                        {
                                                            currentSubLayer.addLayer(currentMarker);

                                                            if(currentMarker.options.extraMarker !== undefined)
                                                            {
                                                                currentSubLayer.addLayer(currentMarker.options.extraMarker);

                                                                let trackDataFilterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hasClass("btn-warning");
                                                                    if(trackDataFilterStatus)
                                                                    {
                                                                        let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', 'playerVehiculesLayer');
                                                                            if(vehicleTrackData !== null)
                                                                            {
                                                                                currentSubLayer.addLayer(vehicleTrackData);
                                                                            }
                                                                    }
                                                            }
                                                        }
                                                    }
                                                    else
                                                    {
                                                        currentSubLayer.addLayer(currentMarker);

                                                        if(currentMarker.options.extraMarker !== undefined)
                                                        {
                                                            currentSubLayer.addLayer(currentMarker.options.extraMarker);

                                                            let trackDataFilterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hasClass("btn-warning");
                                                                if(trackDataFilterStatus)
                                                                {
                                                                    let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', 'playerVehiculesLayer');
                                                                        if(vehicleTrackData !== null)
                                                                        {
                                                                            currentSubLayer.addLayer(vehicleTrackData);
                                                                        }
                                                                }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                            }
                        }
                    }

                    // Redraw to keep layer order...
                    if(isHiding === false)
                    {
                        if(this.playerLayers[layerId].layerGroup.hasLayer(this.playerLayers[layerId].subLayer))
                        {
                            this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer)
                                                                 .addLayer(this.playerLayers[layerId].subLayer);
                        }
                    }
                }
            }
    }

    updateAltitudeLayers(minAltitude, maxAltitude)
    {
        for(let layerId in this.playerLayers)
        {
            if(this.playerLayers[layerId].subLayer !== null && this.playerLayers[layerId].useAltitude !== undefined && this.playerLayers[layerId].useAltitude === true)
            {
                let currentSubLayer     = this.playerLayers[layerId].subLayer;
                let currentLayerLength  = this.playerLayers[layerId].elements.length;

                for(let i = 0; i < currentLayerLength; i++)
                {
                    let currentMarker = this.playerLayers[layerId].elements[i];

                    if(currentMarker.options.altitude !== undefined)
                    {
                        if(currentSubLayer.hasLayer(currentMarker) && (currentMarker.options.altitude < minAltitude || currentMarker.options.altitude > maxAltitude))
                        {
                            currentSubLayer.removeLayer(currentMarker);

                            if(currentMarker.options.extraMarker !== undefined)
                            {
                                currentSubLayer.removeLayer(currentMarker.options.extraMarker);
                            }
                        }
                        else
                        {
                            if(currentSubLayer.hasLayer(currentMarker) === false && currentMarker.options.altitude >= minAltitude && currentMarker.options.altitude <= maxAltitude)
                            {
                                if(this.playerLayers[layerId].filtersCount !== undefined && currentMarker.options.pathName !== undefined)
                                {
                                    let currentObject = this.saveGameParser.getTargetObject(currentMarker.options.pathName);
                                        if(currentObject !== null)
                                        {
                                            let filterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((currentObject.className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : currentObject.className) + '"]').hasClass("btn-warning");
                                                if(filterStatus)
                                                {
                                                    currentSubLayer.addLayer(currentMarker);

                                                    if(currentMarker.options.extraMarker !== undefined)
                                                    {
                                                        currentSubLayer.addLayer(currentMarker.options.extraMarker);

                                                        let trackDataFilterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hasClass("btn-warning");
                                                            if(trackDataFilterStatus)
                                                            {
                                                                let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', 'playerVehiculesLayer');
                                                                    if(vehicleTrackData !== null)
                                                                    {
                                                                        currentSubLayer.addLayer(vehicleTrackData);
                                                                    }
                                                            }
                                                    }
                                                }
                                        }
                                }
                                else
                                {
                                    currentSubLayer.addLayer(currentMarker);

                                    if(currentMarker.options.extraMarker !== undefined)
                                    {
                                        currentSubLayer.addLayer(currentMarker.options.extraMarker);

                                        let trackDataFilterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hasClass("btn-warning");
                                            if(trackDataFilterStatus)
                                            {
                                                let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', 'playerVehiculesLayer');
                                                    if(vehicleTrackData !== null)
                                                    {
                                                        currentSubLayer.addLayer(vehicleTrackData);
                                                    }
                                            }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if(layerId === 'playerRadioactivityLayer')
            {
                if(this.playerLayers.playerRadioactivityLayer.subLayer !== null)
                {
                    let allElements         = this.playerLayers[layerId].elements;
                    let radioActiveElements = {};

                    for(let pathName in allElements)
                    {
                        let currentElement = allElements[pathName];
                        if(currentElement.altitude >= (minAltitude - (currentElement.maxDistance * 100)) && currentElement.altitude <= (maxAltitude + (currentElement.maxDistance * 100)))
                        {
                            //TODO: Update intensity based on altitude...
                            /*
                            if(currentElement.altitude < minAltitude)
                            {
                                let ratio = Math.abs(currentElement.altitude - minAltitude) / (Math.abs(currentElement.altitude) + (currentElement.maxDistance * 100));
                                console.log(ratio);

                                //currentElement.radius *= ratio;
                            }
                            if(currentElement.altitude > maxAltitude)
                            {
                                console.log('MAX', minAltitude, currentElement);
                            }
                            */

                            radioActiveElements[pathName] = currentElement;
                        }
                    }

                    this.playerLayers.playerRadioactivityLayer.subLayer.setData({data: radioActiveElements});
                }
            }
        }
    }

    addFogOfWar(currentObject)
    {
        this.setupSubLayer('playerFogOfWar');
        let rawData = this.getObjectProperty(currentObject, 'mFogOfWarRawData');

        if(rawData !== null && rawData.values !== undefined)
        {
            console.time('fogOfWar');
            $.getJSON(this.staticUrl + '/img/depthMap' + this.useBuild + '.json', function(depthMapData){
                let polygonPositions    = [];
                let rawDataIndex        = 0;
                let depthMapIndex       = 0;
                    rawData             = rawData.values;

                let maxRow              = 512;
                let maxColumn           = 512;
                let fogSize             = 750000 / 512;

                let topLeft             = null;
                let bottomLeft          = null;
                let rowCenter           = 0;
                let columnCenter        = 0;

                for(let row = 0; row < maxRow; row++)
                {
                    if(topLeft !== null && bottomLeft !== null)
                    {
                        polygonPositions.push([
                            topLeft,
                            this.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter - (fogSize / 2)]),
                            this.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter + (fogSize / 2)]),
                            bottomLeft
                        ]);

                        topLeft     = null;
                        bottomLeft  = null;
                    }

                    rowCenter   = (row * fogSize) + (fogSize / 2) + this.satisfactoryMap.mappingBoundNorth + this.satisfactoryMap.northOffset;

                    for(let column = 0; column < maxColumn; column++)
                    {
                        columnCenter    = (column * fogSize) + (fogSize / 2) + this.satisfactoryMap.mappingBoundWest + this.satisfactoryMap.westOffset;

                        //alpha = mSavedData[pixel].b >= mDepthMap[pixel] ? 255 : 0;
                        if(rawData[rawDataIndex + 2] < depthMapData[depthMapIndex])
                        {
                            if(topLeft === null)
                            {
                                topLeft = this.satisfactoryMap.unproject([columnCenter - (fogSize / 2), rowCenter - (fogSize / 2)]);
                            }
                            if(bottomLeft === null)
                            {
                                bottomLeft = this.satisfactoryMap.unproject([columnCenter - (fogSize / 2), rowCenter + (fogSize / 2)]);
                            }
                        }
                        else
                        {
                            if(topLeft !== null && bottomLeft !== null)
                            {
                                polygonPositions.push([
                                    topLeft,
                                    this.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter - (fogSize / 2)]),
                                    this.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter + (fogSize / 2)]),
                                    bottomLeft
                                ]);

                                topLeft         = null;
                                bottomLeft      = null;
                            }
                        }

                        rawDataIndex += 4;
                        depthMapIndex++;
                    }
                }

                let fogOfWarPolygon = L.polygon(polygonPositions, {
                        smoothFactor: 0,
                        fillColor: '#000000',
                        fillOpacity: 1,
                        weight: 0,
                        interactive: false,
                        renderer: this.playerLayers.playerFogOfWar.renderer
                    });

                this.playerLayers.playerFogOfWar.elements.push(fogOfWarPolygon);
                fogOfWarPolygon.addTo(this.playerLayers.playerFogOfWar.subLayer);

                console.timeEnd('fogOfWar');
            }.bind(this));
        }
    }

    resetFogOfWar()
    {
        if(this.useFogOfWar === true)
        {
            let currentObject   = this.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.MapManager');
            let rawData         = this.getObjectProperty(currentObject, 'mFogOfWarRawData');

            if(rawData !== null && rawData.values !== undefined)
            {
                let rawDataLength = rawData.values.length;

                // Update fog
                for(let i = 2; i < rawDataLength; i += 4)
                {
                    rawData.values[i] = 0;
                }

                // Delete old polygons
                for(let i = 0; i < this.playerLayers.playerFogOfWar.elements.length; i++)
                {
                    this.playerLayers.playerFogOfWar.subLayer.removeLayer(this.playerLayers.playerFogOfWar.elements[i]);
                }
                this.playerLayers.playerFogOfWar.elements = [];

                // Refresh
                this.addFogOfWar(currentObject);
            }
        }
    }

    clearFogOfWar()
    {
        if(this.useFogOfWar === true)
        {
            let currentObject   = this.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.MapManager');
            let rawData         = this.getObjectProperty(currentObject, 'mFogOfWarRawData');

            if(rawData !== null && rawData.values !== undefined)
            {
                let rawDataLength = rawData.values.length;

                // Update fog
                for(let i = 2; i < rawDataLength; i += 4)
                {
                    rawData.values[i] = 255;
                }

                // Delete old polygons
                for(let i = 0; i < this.playerLayers.playerFogOfWar.elements.length; i++)
                {
                    this.playerLayers.playerFogOfWar.subLayer.removeLayer(this.playerLayers.playerFogOfWar.elements[i]);
                }
                this.playerLayers.playerFogOfWar.elements = [];

                // Refresh
                this.addFogOfWar(currentObject);
            }
        }
    }

    // Inventory
    getObjectInventory(currentObject, inventoryPropertyName = 'mInventory', raw = false)
    {
        for(let i = 0; i < currentObject.properties.length; i++)
        {
            if(currentObject.properties[i].name === inventoryPropertyName)
            {
                let inventoryObject = this.saveGameParser.getTargetObject(currentObject.properties[i].value.pathName);

                if(inventoryObject !== null)
                {
                    if(raw === false)
                    {
                        return this.getObjectTargetInventory(inventoryObject);
                    }
                    else
                    {
                        return inventoryObject;
                    }
                }
            }
        }

        if(raw === false)
        {
            return [];
        }
        else
        {
            return null;
        }
    }
    getObjectRadioactivity(currentObject, inventoryPropertyName = 'mInventory')
    {
        let haveWaste = false;

        if(this.useRadioactivity === true)
        {
            for(let i = 0; i < currentObject.properties.length; i++)
            {
                if(currentObject.properties[i].name === inventoryPropertyName)
                {
                    let inventoryObject = this.saveGameParser.getTargetObject(currentObject.properties[i].value.pathName);

                    if(inventoryObject !== null)
                    {
                        let radioactivityItems  = [];

                        if(inventoryObject.properties !== undefined)
                        {
                            for(let j = 0; j < inventoryObject.properties.length; j++)
                            {
                                if(inventoryObject.properties[j].name === 'mInventoryStacks')
                                {
                                    let currentInventory = inventoryObject.properties[j].value.values;

                                    for(let k = 0; k < currentInventory.length; k++)
                                    {
                                        if(currentInventory[k][0].value.itemName !== '')
                                        {
                                            // Rename item
                                            let currentItemData = this.getItemDataFromClassName(currentInventory[k][0].value.itemName, false);
                                                if(currentItemData !== null)
                                                {
                                                    if(currentItemData.radioactiveDecay !== undefined)
                                                    {
                                                        if(currentItemData.className === '/Game/FactoryGame/Resource/Parts/NuclearWaste/Desc_NuclearWaste.Desc_NuclearWaste_C')
                                                        {
                                                            haveWaste = true;
                                                        }

                                                        radioactivityItems.push({
                                                            qty                 : currentInventory[k][0].value.properties[0].value,
                                                            radioactiveDecay    : currentItemData.radioactiveDecay
                                                        });
                                                    }
                                                }
                                        }
                                    }

                                    if(radioactivityItems.length > 0)
                                    {
                                        this.addRadioactivityDot(currentObject, radioactivityItems);
                                    }

                                    return haveWaste;
                                }
                            }
                        }
                    }
                }
            }
        }

        return false;
    }
    getObjectTargetInventory(inventoryObject)
    {
        let inventoryArray      = [];

        if(inventoryObject.properties !== undefined)
        {
            for(let j = 0; j < inventoryObject.properties.length; j++)
            {
                if(inventoryObject.properties[j].name === 'mInventoryStacks')
                {
                    let currentInventory = inventoryObject.properties[j].value.values;

                    for(let k = 0; k < currentInventory.length; k++)
                    {
                        if(currentInventory[k][0].value.itemName !== '')
                        {
                            // Rename item
                            let currentItemData = this.getItemDataFromClassName(currentInventory[k][0].value.itemName);
                                if(currentItemData !== null)
                                {
                                    inventoryArray.push({
                                        rawClassName    : currentInventory[k][0].value.itemName,
                                        className       : currentItemData.className,
                                        category        : currentItemData.category,
                                        name            : currentItemData.name,
                                        image           : currentItemData.image,
                                        qty             : currentInventory[k][0].value.properties[0].value
                                    });
                                }
                        }
                        else
                        {
                            inventoryArray.push(null);
                        }
                    }

                    return inventoryArray;
                }
            }
        }

        return inventoryArray;
    }

    setInventoryTableSlot(inventory, maxSlot = null, cellWidth = 48, extraClass = '', nullItemImage = null, maxInLine = 8)
    {
        let html        = '';

        if(maxSlot === null)
        {
            maxSlot = inventory.length;
        }

        for(let i = 0; i < maxSlot; i++)
        {
            if(i === 0)
            {
                html += '<div class="d-flex flex-row ' + extraClass + '">';
            }

            if(inventory[i] !== undefined)
            {
                if(inventory[i] !== null)
                {
                    html += this.getInventoryImage(inventory[i], cellWidth);
                }
                else
                {
                    if(nullItemImage !== null)
                    {
                        html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 5px;padding: 5px;background-color: #FFFFFF;">';
                        html += '<img src="' + nullItemImage + '" class="img-fluid" style="opacity: 0.2;" />';
                        html += '</div>';
                    }
                    else
                    {
                        html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 5px;padding: 5px;background-color: #FFFFFF;"></div>';
                    }
                }
            }
            else
            {
                html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 5px;padding: 5px;background-color: #FFFFFF;"></div>';
            }

            if((i+1) % maxInLine === 0 || (i + 1) === maxSlot)
            {
                html += '</div>';

                if((i + 1) !== maxSlot)
                {
                    html += '<div class="d-flex flex-row ' + extraClass + '">';
                }
            }
        }

        return html;
    }

    getInventoryImage(inventory, cellWidth = 48, badgeClass = 'badge-warning')
    {
        if(inventory === null || inventory === undefined)
        {
            return '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 5px;padding: 5px;background-color: #FFFFFF;"></div>';
        }

        let itemQty     = (inventory.qty !== undefined) ? inventory.qty : null;
        let itemUnits   = '';
        let itemStyle   = 'border-radius: 5px;';

        if(itemQty !== null && inventory.category !== undefined && inventory.category === 'liquid')
        {
            itemQty     = Math.round(Math.round(itemQty) / 1000);
            itemUnits   = 'm³';
            itemStyle   = 'border-radius: 50%;';
        }

        let html = '';
            html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;' + itemStyle + 'padding: 5px;background-color: #FFFFFF;"';

            if(inventory.name !== undefined)
            {
                html += ' data-hover="tooltip" title="' + inventory.name + '"';
            }

            html += '>';
            html += '<img src="' + inventory.image + '" class="img-fluid" />';
            if(itemQty !== null)
            {
                html += '<span class="badge ' + badgeClass + ' align-middle" style="position: absolute;bottom: -2px; right: -2px;">' + new Intl.NumberFormat(this.language).format(itemQty) + itemUnits + '</span>';
            }
            html += '</div>';

        return html;
    }

    setBadgeLayerCount(layerId)
    {
        let currentLayerLength = this.playerLayers[layerId].elements.length;
        let currentLayerSuffix  = '';

        if(this.playerLayers[layerId].count !== undefined)
        {
            currentLayerLength = this.playerLayers[layerId].count;
        }
        if(this.playerLayers[layerId].distance !== undefined)
        {
            if(this.playerLayers[layerId].distance < 1000)
            {
                currentLayerLength  = Math.round(this.playerLayers[layerId].distance);
                currentLayerSuffix  = '<small><em>m</em></small>';
            }
            else
            {
                currentLayerLength  = Math.round((this.playerLayers[layerId].distance / 1000) * 100) / 100;
                currentLayerSuffix  = '<small><em>km</em></small>';
            }
        }

        $('.updatePlayerLayerState[data-id=' + layerId + '] > .badge-layer').html(
            new Intl.NumberFormat(this.language)
                    .format(currentLayerLength) + currentLayerSuffix
        );

        if(this.playerLayers[layerId].filtersCount !== undefined)
        {
            for(let className in this.playerLayers[layerId].filtersCount)
            {
                $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : className) + '"]').show();

                if(this.playerLayers[layerId].filtersCount[className].distance !== undefined)
                {
                    if(this.playerLayers[layerId].filtersCount[className].distance < 1000)
                    {
                        currentLayerLength  = Math.round(this.playerLayers[layerId].filtersCount[className].distance);
                        currentLayerSuffix  = '<small><em>m</em></small>';
                    }
                    else
                    {
                        currentLayerLength  = Math.round((this.playerLayers[layerId].filtersCount[className].distance / 1000) * 100) / 100;
                        currentLayerSuffix  = '<small><em>km</em></small>';
                    }

                    $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : className) + '"] > .badge-layer').html(
                        new Intl.NumberFormat(this.language)
                                .format(currentLayerLength) + currentLayerSuffix
                    );
                }
                else
                {
                    $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : className) + '"] > .badge-layer').html(
                        new Intl.NumberFormat(this.language)
                                .format(this.playerLayers[layerId].filtersCount[className])// + currentLayerSuffix
                    );
                }
            }

            let currentLength = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter:visible').length;
                $('.updatePlayerLayerState[data-id=' + layerId + '] .radial').css('width', ((currentLength * 60) + 10) + 'px');
                $('.updatePlayerLayerState[data-id=' + layerId + '] .radial > div').css('width', ((currentLength * 60) + 10) + 'px');
        }
    }
    updateDelayedBadgeCount()
    {
        if(this.delayedBadgeCount !== null)
        {
            for(let i = 0; i < this.delayedBadgeCount.length; i++)
            {
                this.setBadgeLayerCount(this.delayedBadgeCount[i]);
            }

            this.delayedBadgeCount = null;
        }
    }

    // Overclocking
    getClockSpeed(currentObject)
    {
        let currentPotential = this.getObjectProperty(currentObject, 'mCurrentPotential');

        if(currentPotential !== null)
        {
            return currentPotential;
        }

        let pendingPotential = this.getObjectProperty(currentObject, 'mPendingPotential');

        if(pendingPotential !== null)
        {
            return pendingPotential;
        }

       return 1;
    }

    setInventoryPotential(currentObject)
    {
        let html = '';

        let potentialInventory = this.getObjectInventory(currentObject, 'mInventoryPotential');

        if(potentialInventory !== null)
        {
            html += '<div class="text-center"><table class="mr-auto ml-auto mt-3"><tr><td>';
            html += this.setInventoryTableSlot(potentialInventory, null, 48, '', this.itemsData.Desc_CrystalShard_C.image);
            html += '</td></tr></table></div>';
        }

        return html;
    }

    updateObjectProductionPausedStatus(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        for(let i = 0; i < currentObject.properties.length; i++)
        {
            if(currentObject.properties[i].name === 'mIsProductionPaused')
            {
                currentObject.properties.splice(i, 1);
                return;
            }
        }

        // Property didn't exists, so we're pushing it inside properties to turning the machine OFF.
        currentObject.properties.push({
            index: 0,
            name: 'mIsProductionPaused',
            type: 'BoolProperty',
            value: 1
        });
        /*
        currentObject.properties.push({
            index: 0,
            name: 'mTimeSinceStartStopProducing',
            type: 'FloatProperty',
            value: 0
        });
        */
    }

    updateObjectClockSpeed(marker)
    {
        this.pauseMap();

        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

        bootbox.form({
            title: 'Update "<strong>' + buildingData.name + '</strong>" clock speed',
            container: '#leafletMap', backdrop: false,
            centerVertical: true,
            inputs: [
                {
                    name: 'clockSpeed',
                    inputType: 'number',
                    value: this.getClockSpeed(currentObject) * 100
                },
                {
                    label: 'Use power shards from your containers?',
                    name: 'useOwnPowershards',
                    inputType: 'select',
                    inputOptions: [
                        {
                            text: 'Yes',
                            value: '1'
                        },
                        {
                            text: 'No',
                            value: '0'
                        }
                    ]
                }
            ],
            callback: function(form)
            {
                if(form === null || form.clockSpeed === null || form.useOwnPowershards === null)
                {
                    this.unpauseMap();
                    return;
                }

                let clockSpeed          = Math.max(1, Math.min(Math.round(form.clockSpeed), 250));
                let totalPowerShards    = Math.ceil((clockSpeed - 100) / 50);

                if(totalPowerShards > 0)
                {
                    let potentialInventory = this.getObjectInventory(currentObject, 'mInventoryPotential', true);
                        for(let i = 0; i < potentialInventory.properties.length; i++)
                        {
                            if(potentialInventory.properties[i].name === 'mInventoryStacks')
                            {
                                for(let j = 0; j < totalPowerShards; j++)
                                {
                                    if(parseInt(form.useOwnPowershards) === 1)
                                    {
                                        let result = this.removeFromStorage('/Game/FactoryGame/Resource/Environment/Crystal/Desc_CrystalShard.Desc_CrystalShard_C');
                                            if(result === false)
                                            {
                                                clockSpeed = Math.min(clockSpeed, 100 + (j * 50)); // Downgrade...
                                                break;
                                            }
                                    }

                                    potentialInventory.properties[i].value.values[j][0].value.itemName = '/Game/FactoryGame/Resource/Environment/Crystal/Desc_CrystalShard.Desc_CrystalShard_C';
                                    this.setObjectProperty(potentialInventory.properties[i].value.values[j][0].value, 'NumItems', 1, 'IntProperty');
                                }
                            }
                        }
                }

                this.setObjectProperty(currentObject, 'mCurrentPotential', clockSpeed / 100, 'FloatProperty');
                this.setObjectProperty(currentObject, 'mPendingPotential', clockSpeed / 100, 'FloatProperty');

                this.unpauseMap();
            }.bind(this)
        });
    }
    updateMultipleObjectClockSpeed(offset, useOwnPowershards)
    {
        if(this.markersSelected)
        {
            console.time('updateMultipleObjectClockSpeed');

            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let contextMenu = this.getContextMenu(this.markersSelected[i]);

                if(contextMenu !== false)
                {
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name.search('updateObjectClockSpeed') !== -1)
                        {
                            let currentObject       = this.saveGameParser.getTargetObject(this.markersSelected[i].options.pathName);
                            let currentClockSpeed   = this.getClockSpeed(currentObject) * 100;
                            let newClockSpeed       = currentClockSpeed + parseFloat(offset);
                            let clockSpeed          = Math.max(1, Math.min(Math.round(newClockSpeed), 250));

                            if(currentClockSpeed !== clockSpeed)
                            {
                                let totalPowerShards    = Math.ceil((clockSpeed - 100) / 50);

                                    if(totalPowerShards > 0 && clockSpeed > currentClockSpeed)
                                    {
                                        let potentialInventory = this.getObjectInventory(currentObject, 'mInventoryPotential', true);
                                        for(let k = 0; k < potentialInventory.properties.length; k++)
                                        {
                                            if(potentialInventory.properties[k].name === 'mInventoryStacks')
                                            {
                                                for(let m = 0; m < totalPowerShards; m++)
                                                {
                                                    if(useOwnPowershards === 1)
                                                    {
                                                        let result = this.removeFromStorage('/Game/FactoryGame/Resource/Environment/Crystal/Desc_CrystalShard.Desc_CrystalShard_C');

                                                        if(result === false)
                                                        {
                                                            clockSpeed = Math.min(clockSpeed, 100 + (m * 50)); // Downgrade...
                                                            break;
                                                        }
                                                    }

                                                    potentialInventory.properties[k].value.values[m][0].value.itemName = '/Game/FactoryGame/Resource/Environment/Crystal/Desc_CrystalShard.Desc_CrystalShard_C';
                                                    this.setObjectProperty(potentialInventory.properties[k].value.values[m][0].value, 'NumItems', 1, 'IntProperty');
                                                }
                                            }
                                        }
                                    }

                                this.setObjectProperty(currentObject, 'mCurrentPotential', clockSpeed / 100, 'FloatProperty');
                                this.setObjectProperty(currentObject, 'mPendingPotential', clockSpeed / 100, 'FloatProperty');
                            }
                        }
                    }
                }
            }

            console.timeEnd('updateMultipleObjectClockSpeed');
        }

        this.cancelSelectMultipleMarkers();
    }

    /*
     * VEHICLES
     */
    getVehicleTrack(currentObject)
    {
        let currentTrack                = [];
        let currentTargetNodeLinkedList = this.getObjectProperty(currentObject, 'mTargetNodeLinkedList');

            if(currentTargetNodeLinkedList !== null)
            {
                let targetNode = this.saveGameParser.getTargetObject(currentTargetNodeLinkedList.pathName);

                if(targetNode.properties !== undefined && targetNode.properties.length > 0)
                {
                    let firstNode   = null;
                    let lastNode    = null;

                    for(let j = 0; j < targetNode.properties.length; j++)
                    {
                        if(targetNode.properties[j].name === 'mFirst')
                        {
                            firstNode = this.saveGameParser.getTargetObject(targetNode.properties[j].value.pathName);
                        }
                        if(targetNode.properties[j].name === 'mLast')
                        {
                            lastNode = this.saveGameParser.getTargetObject(targetNode.properties[j].value.pathName);
                        }
                    }

                    if(firstNode !== null && lastNode !== null)
                    {
                        let checkCurrentNode = firstNode;

                        while(checkCurrentNode !== null && checkCurrentNode.pathName !== lastNode.pathName)
                        {
                            currentTrack.push(checkCurrentNode.transform.translation);

                            let checkCurrentNodeProperties  = checkCurrentNode.properties;
                                checkCurrentNode            = null;

                                for(let k = 0; k < checkCurrentNodeProperties.length; k++)
                                {
                                    if(checkCurrentNodeProperties[k].name === 'mNext')
                                    {
                                        checkCurrentNode = this.saveGameParser.getTargetObject(checkCurrentNodeProperties[k].value.pathName);
                                    }
                                }
                        }

                        currentTrack.push(lastNode.transform.translation);
                    }
                }
            }

        return currentTrack;
    }

    getSaveGameSign(currentObject, propertyName)
    {
        let saveGameSignsLength = this.saveGameSigns.length;

        for(let iSign = 0; iSign < saveGameSignsLength; iSign++)
        {
            let currentSign                 = this.saveGameSigns[iSign];
            let isCurrentObject             = false;
            let currentName                 = null;
            let currentSignPropertyLength   = currentSign.properties.length;

            for(let iSignProperties = 0; iSignProperties < currentSignPropertyLength; iSignProperties++)
            {
                if(currentSign.properties[iSignProperties].type === 'ObjectProperty')
                {
                    if(currentSign.properties[iSignProperties].value.pathName === currentObject.pathName)
                    {
                        isCurrentObject = true;
                    }
                }
                if(currentSign.properties[iSignProperties].name === propertyName)
                {
                    currentName = currentSign.properties[iSignProperties].value;
                }
            }

            if(currentName !== null && isCurrentObject === true)
            {
                return currentName;
            }
        }

        return null;
    }
    deleteSaveGameSign(currentObject)
    {
        let saveGameSignsLength = this.saveGameSigns.length;
        let deleteSaveGameSigns = [];

        for(let i = 0; i < saveGameSignsLength; i++)
        {
            let currentSign                 = this.saveGameSigns[i];
            let isCurrentObject             = false;
            let currentTimetable            = null;
            let currentSignPropertyLength   = currentSign.properties.length;

            for(let iSignProperties = 0; iSignProperties < currentSignPropertyLength; iSignProperties++)
            {
                if(currentSign.properties[iSignProperties].type === 'ObjectProperty')
                {
                    if(currentSign.properties[iSignProperties].value.pathName === currentObject.pathName)
                    {
                        isCurrentObject = true;
                        deleteSaveGameSigns.push(currentSign.pathName);
                    }
                }

                // Timetable?
                if(currentSign.properties[iSignProperties].name === 'TimeTable')
                {
                    currentTimetable = currentSign.properties[iSignProperties];
                }
            }

            // Timetable?
            if(currentTimetable !== null && isCurrentObject === true)
            {
                this.saveGameParser.deleteObject(currentTimetable.value.pathName);
            }
        }

        for(let i = 0; i < deleteSaveGameSigns; i++)
        {
            this.saveGameParser.deleteObject(deleteSaveGameSigns[i]);
        }
    }



    getColorSlots(createIfNotExisting)
    {
        let totalColorSlot                  = BaseLayout_Map_ColorSlots.getTotalColorSlots();
        let playerColors                    = [];
        let buildableSubsystem              = this.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.BuildableSubsystem');
        let mColorSlotsPrimary_Linear       = null;
        let mColorSlotsSecondary_Linear     = null;

            if(buildableSubsystem !== null)
            {
                mColorSlotsPrimary_Linear       = this.getObjectProperty(buildableSubsystem, 'mColorSlotsPrimary_Linear');
                mColorSlotsSecondary_Linear     = this.getObjectProperty(buildableSubsystem, 'mColorSlotsSecondary_Linear');

                if(createIfNotExisting !== undefined && createIfNotExisting === true)
                {
                    if(mColorSlotsPrimary_Linear === null)
                    {
                        mColorSlotsPrimary_Linear = {
                            name                    : "mColorSlotsPrimary_Linear",
                            propertyGuid1           : 0,
                            propertyGuid2           : 0,
                            propertyGuid3           : 0,
                            propertyGuid4           : 0,
                            structureName           : "mColorSlotsPrimary_Linear",
                            structureSubType        : "LinearColor",
                            structureType           : "StructProperty",
                            type                    : "ArrayProperty",
                            value                   : {type: "StructProperty", values: []}
                        };

                        for(let slotIndex = 0; slotIndex < totalColorSlot; slotIndex++)
                        {
                            mColorSlotsPrimary_Linear.value.values[slotIndex]     = JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)));
                            mColorSlotsPrimary_Linear.value.values[slotIndex].a   = 1;
                        }

                        mColorSlotsPrimary_Linear.value.values.push({r: 0.1882353127002716, g: 0.1882353127002716, b: 0.1882353127002716, a: 1});
                        mColorSlotsPrimary_Linear.value.values.push({r: 1, g: 0, b: 0.9294118285179138, a: 1});

                        buildableSubsystem.properties.push(mColorSlotsPrimary_Linear);
                    }

                    if(mColorSlotsSecondary_Linear === null)
                    {
                        mColorSlotsSecondary_Linear = {
                            name                    : "mColorSlotsSecondary_Linear",
                            propertyGuid1           : 0,
                            propertyGuid2           : 0,
                            propertyGuid3           : 0,
                            propertyGuid4           : 0,
                            structureName           : "mColorSlotsSecondary_Linear",
                            structureSubType        : "LinearColor",
                            structureType           : "StructProperty",
                            type                    : "ArrayProperty",
                            value                   : {type: "StructProperty", values: []}
                        };

                        for(let slotIndex = 0; slotIndex < totalColorSlot; slotIndex++)
                        {
                            mColorSlotsSecondary_Linear.value.values[slotIndex]     = JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)));
                            mColorSlotsSecondary_Linear.value.values[slotIndex].a   = 1;
                        }

                        mColorSlotsSecondary_Linear.value.values.push({r: 0.1098039299249649, g: 0.1098039299249649, b: 0.1098039299249649, a: 1});
                        mColorSlotsSecondary_Linear.value.values.push({r: 0.9529412388801575, g: 0.3019607961177826, b: 0.06666667014360428, a: 1});

                        buildableSubsystem.properties.push(mColorSlotsSecondary_Linear);
                    }
                }
            }

        for(let slotIndex = 0; slotIndex < totalColorSlot; slotIndex++)
        {
            playerColors.push({
                primaryColor    : this.getDefaultPrimaryColorSlot(slotIndex),
                secondaryColor  : this.getDefaultSecondaryColorSlot(slotIndex)
            });
            playerColors[slotIndex].primaryColor.a      = 1;
            playerColors[slotIndex].secondaryColor.a    = 1;

            if(mColorSlotsPrimary_Linear !== null && mColorSlotsPrimary_Linear.values[slotIndex] !== undefined)
            {
                playerColors[slotIndex].primaryColor    = {
                    r : BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[slotIndex].r),
                    g : BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[slotIndex].g),
                    b : BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[slotIndex].b)
                };
            }
            if(mColorSlotsSecondary_Linear !== null && mColorSlotsSecondary_Linear.values[slotIndex] !== undefined)
            {
                playerColors[slotIndex].secondaryColor  = {
                    r: BaseLayout_Math.linearColorToRGB(mColorSlotsSecondary_Linear.values[slotIndex].r),
                    g: BaseLayout_Math.linearColorToRGB(mColorSlotsSecondary_Linear.values[slotIndex].g),
                    b: BaseLayout_Math.linearColorToRGB(mColorSlotsSecondary_Linear.values[slotIndex].b),
                };
            }
        }

        return playerColors;
    }

    getDefaultPrimaryColorSlot(index, raw = false)
    {
        let defaultColors    = [
            {r: 0.9529411764705882, g: 0.30196078431372547, b: 0.06666666666666667},
            {r: 0.14901960784313725, g: 0.39215686274509803, b: 0.6549019607843137},
            {r: 0.8, g: 0.20392156862745098, b: 0.07450980392156863},
            {r: 0.12549019607843137, g: 0.12941176470588237, b: 0.1843137254901961},

            {r: 0.7450980392156863, g: 0.7647058823529411, b: 0.807843137254902},
            {r: 0.4980392156862745, g: 0.7294117647058823, b: 0.28627450980392155},
            {r: 1, g: 0.34901960784313724, b: 0.792156862745098},
            {r: 0.45098039215686275, g: 0.8745098039215686, b: 0.8431372549019608},

            {r: 0.49019607843137253, g: 0.32941176470588235, b: 0.10196078431372549},
            {r: 0.9568627450980393, g: 0.8431372549019608, b: 0.6823529411764706},
            {r: 0.5843137254901961, g: 0.32941176470588235, b: 0.9803921568627451},
            {r: 0.2, g: 0.6392156862745098, b: 0.48627450980392156, a: 0.9803921568627451},

            {r: 0.9254901960784314, g: 0.8431372549019608, b: 0.3215686274509804},
            {r: 0.3058823529411765, g: 0.30980392156862746, b: 0.26666666666666666},
            {r: 0.47058823529411764, g: 0.09803921568627451, b: 0.41568627450980394},
            {r: 0.22352942824363708, g: 0.22352942824363708, b: 0.22352942824363708},

            // Hidden slots
            {r: 0.1882353127002716, g: 0.1882353127002716, b: 0.1882353127002716},
            {r: 1, g: 0, b: 0.9294118285179138}
        ];

        let returnColor = (defaultColors[index] !== undefined) ? defaultColors[index] : defaultColors[0];

            if(raw === true)
            {
                return returnColor;
            }

            return {
                r: BaseLayout_Math.linearColorToRGB(returnColor.r),
                g: BaseLayout_Math.linearColorToRGB(returnColor.g),
                b: BaseLayout_Math.linearColorToRGB(returnColor.b)
            };
    }

    getDefaultSecondaryColorSlot(index, raw = false)
    {
        let defaultColors    = [
            {r: 0.11372549019607843, g: 0.13333333333333333, b: 0.2627450980392157},
            {r: 0.33725490196078434, g: 0.25098039215686274, b: 0.12156862745098039},
            {r: 0.3058823529411765, g: 0.3137254901960784, b: 0.3803921568627451},
            {r: 0.23921568627450981, g: 0.3607843137254902, b: 0.29411764705882354},

            {r: 0.11372549019607843, g: 0.13333333333333333, b: 0.2627450980392157},
            {r: 0.11372549019607843, g: 0.13333333333333333, b: 0.2627450980392157},
            {r: 0.11372549019607843, g: 0.13333333333333333, b: 0.2627450980392157},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256},

            {r: 0.3254901960784314, g: 0.34509803921568627, b: 0.34509803921568627},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256},

            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256},
            {r: 0.7843137979507446, g: 0.7921569347381592, b: 0.874509871006012},

            // Hidden slots
            {r: 0.1098039299249649, g: 0.1098039299249649, b: 0.1098039299249649},
            {r: 0.9529412388801575, g: 0.3019607961177826, b: 0.06666667014360428}
        ];

        let returnColor = (defaultColors[index] !== undefined) ? defaultColors[index] : defaultColors[0];

            if(raw === true)
            {
                return returnColor;
            }

            return {
                r: BaseLayout_Math.linearColorToRGB(returnColor.r),
                g: BaseLayout_Math.linearColorToRGB(returnColor.g),
                b: BaseLayout_Math.linearColorToRGB(returnColor.b)
            };
    }

    getObjectPrimaryColorSlot(currentObject, raw = false)
    {
        let colorSlot = null;

            if(currentObject !== null)
            {
                colorSlot = this.getObjectProperty(currentObject, 'mColorSlot');
            }

            if(raw === true)
            {
                return colorSlot;
            }

            if(colorSlot !== null)
            {
                return parseInt(colorSlot.value);
            }

        return 0;
    }

    getObjectPrimaryColor(currentObject)
    {
        let colorSlot = this.getObjectPrimaryColorSlot(currentObject);

        let buildableSubsystem = this.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.BuildableSubsystem');
            if(buildableSubsystem !== null)
            {
                let mColorSlotsPrimary_Linear       = this.getObjectProperty(buildableSubsystem, 'mColorSlotsPrimary_Linear');
                    if(mColorSlotsPrimary_Linear !== null && mColorSlotsPrimary_Linear.values[colorSlot] !== undefined)
                    {
                        return {
                            r: BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[colorSlot].r),
                            g: BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[colorSlot].g),
                            b: BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[colorSlot].b)
                        };
                    }
            }

        return this.getDefaultPrimaryColorSlot(colorSlot);
    }

    updateObjectColorSlot(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);
        let slotIndex           = this.getObjectPrimaryColorSlot(currentObject);
        let playerColors        = this.getColorSlots();
        let selectOptions       = [];

        for(let slotIndex = 0; slotIndex < BaseLayout_Map_ColorSlots.getTotalColorSlots(); slotIndex++)
        {
            selectOptions.push({
                primaryColor    : 'rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ')',
                value           : slotIndex,
                text            : (slotIndex + 1)
            });
        }

        bootbox.form({
            title: 'Update "<strong>' + buildingData.name + '</strong>" color slot',
            container: '#leafletMap', backdrop: false,
            centerVertical: true,
            scrollable: true,
            inputs: [{
                name: 'slotIndex',
                inputType: 'select',
                inputOptions: selectOptions,
                replaceWith: 'colorSlots',
                value: slotIndex
            }],
            callback: function(values)
            {
                if(values === null)
                {
                    return;
                }

                let colorSlot       = this.getObjectProperty(currentObject, 'mColorSlot');
                let newSlotIndex    = parseInt(values.slotIndex);

                if(colorSlot === null && newSlotIndex > 0)
                {
                    currentObject.properties.push({
                        index: 0,
                        name: 'mColorSlot',
                        type: 'ByteProperty',
                        value: {
                            enumName: 'None',
                            value: newSlotIndex
                        }
                    });
                }
                else
                {
                    for(let i = 0; i < currentObject.properties.length; i++)
                    {
                        if(currentObject.properties[i].name === 'mColorSlot')
                        {
                            if(newSlotIndex > 0)
                            {
                                currentObject.properties[i].value.value = newSlotIndex;
                            }
                            else
                            {
                                currentObject.properties.splice(i, 1);
                            }

                            break;
                        }
                    }
                }

                marker.relatedTarget.fire('mouseout'); // Trigger a redraw
            }.bind(this)
        });
    }



    getObjectProperty(currentObject, propertyName, defaultPropertyValue = null)
    {
        if(currentObject.properties !== undefined)
        {
            let currentObjectPropertiesLength   = currentObject.properties.length;
            for(let j = 0; j < currentObjectPropertiesLength; j++)
            {
                if(currentObject.properties[j].name === propertyName)
                {
                    return currentObject.properties[j].value;
                }
            }
        }

        return defaultPropertyValue;
    }

    setObjectProperty(currentObject, propertyName, propertyValue, propertyType = null)
    {
        let currentObjectPropertiesLength = currentObject.properties.length;

        for(let j = 0; j < currentObjectPropertiesLength; j++)
        {
            if(currentObject.properties[j].name === propertyName)
            {
                currentObject.properties[j].value = propertyValue;
                return;
            }
        }

        // Property not found, add it!
        if(propertyType !== null)
        {
            currentObject.properties.push({
                name: propertyName,
                type: propertyType,
                index: 0,
                value: propertyValue
            });
        }

        return;
    }

    deleteObjectProperty(currentObject, propertyName)
    {
        let currentObjectPropertiesLength = currentObject.properties.length;

        for(let j = 0; j < currentObjectPropertiesLength; j++)
        {
            if(currentObject.properties[j].name === propertyName)
            {
                currentObject.properties.splice(j, 1);
                return;
            }
        }

        return;
    }

    getObjectCircuitID(currentObject)
    {
        let circuitSubSystem = this.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.CircuitSubsystem');
            if(circuitSubSystem !== null && circuitSubSystem.extra.circuits !== undefined)
            {
                for(let i = 0; i < circuitSubSystem.extra.circuits.length; i++)
                {
                    let currentSubCircuit = this.saveGameParser.getTargetObject(circuitSubSystem.extra.circuits[i].pathName);
                        if(currentSubCircuit !== null)
                        {
                            let mComponents = this.getObjectProperty(currentSubCircuit, 'mComponents');
                                if(mComponents !== null)
                                {
                                    let componentsArray = [];
                                        for(let j = 0; j < mComponents.values.length; j++)
                                        {
                                            if(mComponents.values[j].pathName === currentObject.pathName)
                                            {
                                                return circuitSubSystem.extra.circuits[i].pathName;
                                            }

                                            componentsArray.push(mComponents.values[j].pathName);
                                        }

                                        for(let j = 0; j < currentObject.children.length; j++)
                                        {
                                            if(componentsArray.includes(currentObject.children[j].pathName))
                                            {
                                                return circuitSubSystem.extra.circuits[i].pathName;
                                            }
                                        }
                                }
                        }
                }
            }

        return null;
    }

    getItemDataFromRecipe(currentObject, propertyName = 'mCurrentRecipe')
    {
        let recipe              = this.getObjectProperty(currentObject, propertyName);

        if(recipe !== null)
        {
            // Extract recipe name
            let recipeName = recipe.pathName.split('.')[1];
                if(this.recipesData[recipeName] !== undefined)
                {
                    return this.recipesData[recipeName];
                }
                else
                {
                    let fromClassName =  this.getItemDataFromRecipeClassName(recipe.pathName);
                        if(fromClassName !== null)
                        {
                            return fromClassName;
                        }

                    console.log('Recipe not found?', recipeName, currentObject);
                }
        }

        return null;
    }
    getItemDataFromRecipeClassName(className)
    {
        for(let recipeId in this.recipesData)
        {
            if(this.recipesData[recipeId].className !== undefined && this.recipesData[recipeId].className === className)
            {
                return this.recipesData[recipeId];
            }
        }

        if(typeof Sentry !== 'undefined' && this.useDebug === true)
        {
            Sentry.setContext('className', {className: className});
            Sentry.captureMessage('Missing recipe className: ' + className);
        }

        console.log('Missing recipe className', className);

        return null;
    }

    getItemDataFromClassName(className, debugToConsole = true)
    {
        if(className === '/Game/FactoryGame/Resource/RawResources/CrudeOil/Desc_CrudeOil.Desc_CrudeOil_C'){ className = '/Game/FactoryGame/Resource/RawResources/CrudeOil/Desc_LiquidOil.Desc_LiquidOil_C'; }
        if(className === '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C'){ className = '/Game/FactoryGame/Resource/Equipment/PortableMiner/BP_ItemDescriptorPortableMiner.BP_ItemDescriptorPortableMiner_C'; }
        if(className === '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaSpitterParts.BP_AlphaSpitterParts_C'){ className = '/Game/FactoryGame/Resource/Parts/AnimalParts/Desc_SpitterParts.Desc_SpitterParts_C'; }

        for(let i in this.itemsData)
        {
            if(this.itemsData[i].className !== undefined && this.itemsData[i].className === className)
            {
                this.itemsData[i].id = i;
                return this.itemsData[i];
            }
        }
        for(let i in this.toolsData)
        {
            if(this.toolsData[i].className !== undefined && this.toolsData[i].className === className)
            {
                this.toolsData[i].id = i;
                return this.toolsData[i];
            }
        }

        // Add fake mod object...
        let moddedItem = {
                className   : className,
                name        : className.split('/').pop(),
                category    : 'mods',
                image       : 'https://static.satisfactory-calculator.com/img/mapUnknownIcon.png'
        };

        this.itemsData[className.split('.').pop()] = moddedItem;

        if(debugToConsole === true)
        {
            if(typeof Sentry !== 'undefined' && this.useDebug === true)
            {
                Sentry.captureMessage('Missing item className: ' + className);
            }

            console.log('Missing item className', className);
        }

        return moddedItem;
    }
    getItemDataFromId(itemId)
    {
        for(let i in this.itemsData)
        {
            if(i === itemId)
            {
                return this.itemsData[i];
            }
        }
        for(let i in this.toolsData)
        {
            if(i === itemId)
            {
                return this.toolsData[i];
            }
        }

        console.log('Missing item itemId', itemId);

        return null;
    }


    getBuildingDataFromClassName(className)
    {
        if(className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorIntegratedBiomass.Build_GeneratorIntegratedBiomass_C'){ className = '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorBiomass.Build_GeneratorBiomass_C'; }
        if(className === '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageIntegrated.Build_StorageIntegrated_C'){ className = '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StoragePlayer.Build_StoragePlayer_C'; }
        if(className === '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C'){ className = '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C'; }
        if(className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C'){ className = '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Tractor/Desc_Tractor.Desc_Tractor_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Truck/Desc_Truck.Desc_Truck_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Explorer/Desc_Explorer.Desc_Explorer_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/Desc_Locomotive.Desc_Locomotive_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/Desc_FreightWagon.Desc_FreightWagon_C'; }

        if(className === '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C' && this.buildingsData['Desc_GolfCart_C'] === undefined)
        {
            this.buildingsData['Desc_GolfCart_C'] = {
                className         : className,
                name              : 'FICSIT Factory Cart™',
                category          : 'vehicle',
                maxSlot           : 1,

                width             : 1,
                length            : 1,
                height            : 2,

                image             : this.toolsData.Desc_GolfCart_C.image,

                mapLayer          : 'playerVehiculesLayer',
                mapUseCount       : true,
                mapColor          : '#bf4e87',
                mapOpacity        : 0.75,
                mapUseSlotColor   : false,
                mapIconImage      : this.toolsData.Desc_GolfCart_C.image
            };
        }

        // Update 3 conversion
        //if(className === '/Game/FactoryGame/Buildable/Factory/OilPump/Build_OilPump.Build_OilPump_C'){ className = '/Game/FactoryGame/Buildable/Factory/OilPump/Build_OilPump.Build_OilPump_C'; }

        // Mods
        if(className === '/Game/InfiniteLogistics/Buildable/InfinitePipeHyper/Build_InfinitePipeHyper.Build_InfinitePipeHyper_C'){ className = '/Game/FactoryGame/Buildable/Factory/PipeHyper/Build_PipeHyper.Build_PipeHyper_C'; }
        if(className === '/Game/InfiniteLogistics/Buildable/InfinitePipeline/Build_InfinitePipeline.Build_InfinitePipeline_C'){ className = '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C'; }

        if(this.buildingDataClassNameHashTable[className] !== undefined)
        {
            return this.buildingsData[this.buildingDataClassNameHashTable[className]];
        }

        for(let i in this.buildingsData)
        {
            if(this.buildingsData[i].className !== undefined && this.buildingsData[i].className === className)
            {
                this.buildingDataClassNameHashTable[className] = i;
                return this.buildingsData[i];
            }
        }

        return null;
    }

    getBuildingIsOn(currentObject)
    {
        if(this.getObjectProperty(currentObject, 'mIsProductionPaused') !== null)
        {
            return false;
        }

        return true;
    }

    getBuildingIsPowered(currentObject)
    {
        for(let i = 0; i < currentObject.children.length; i++)
        {
            let currentChildren = currentObject.children[i];
                for(let k = 0; k < this.availablePowerConnection.length; k++)
                {
                    if(currentChildren.pathName.endsWith(this.availablePowerConnection[k]))
                    {
                        currentChildren = this.saveGameParser.getTargetObject(currentChildren.pathName);

                        if(currentChildren !== null)
                        {
                            let mWires = this.getObjectProperty(currentChildren, 'mWires');
                                if(mWires !== null)
                                {
                                    return true;
                                }
                        }
                    }
                }
        }

        return false;
    }

    getFaunaDataFromClassName(className = null)
    {
        let defaultIconColor    = '#b34848';
        let availableFauna      = {
            '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C': {
                name        : 'Lizard Doggo',
                iconColor   :'#b3b3b3',
                iconImage   : this.staticUrl + '/img/mapLizardDoggoIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_SpaceRabbit_C_'
            },
            '/Game/FactoryGame/Character/Creature/Wildlife/SpaceGiraffe/Char_SpaceGiraffe.Char_SpaceGiraffe_C': {
                name        : 'Space Giraffe-Tick-Penguin-Whale Thing',
                iconColor   : '#b3b3b3',
                iconImage   : this.staticUrl + '/img/mapSpaceGiraffeIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_SpaceGiraffe_C_'
            },
            '/Game/FactoryGame/Character/Creature/Wildlife/NonFlyingBird/Char_NonFlyingBird.Char_NonFlyingBird_C': {
                name        : 'Non Flying Bird',
                iconColor   : '#b3b3b3',
                iconImage   : this.staticUrl + '/img/mapNonFlyingBirdIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_NonFlyingBird_C_'
            },

            '/Game/FactoryGame/Character/Creature/Enemy/Spitter/SmallSpitter/Char_Spitter_Small.Char_Spitter_Small_C': {
                name        : 'Spitter',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapSpitterIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_Spitter_Small_C_'
            },
            '/Game/FactoryGame/Character/Creature/Enemy/Spitter/Char_Spitter.Char_Spitter_C': {
                name        : 'Alpha Spitter (Red)',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapSpitterIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_Spitter_C_'
            },
            '/Game/FactoryGame/Character/Creature/Enemy/Spitter/AlternativeSpitter/Char_Spitter_Alternative.Char_Spitter_Alternative_C': {
                name        : 'Alpha Spitter (Green)',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapSpitterIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_Spitter_Alternative_C_'
            },

            '/Game/FactoryGame/Character/Creature/Enemy/Stinger/Char_CaveStinger.Char_CaveStinger_C': {
                name        : 'Stinger (Size?)',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapStingerIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_CaveStinger_C_'
            },
            '/Game/FactoryGame/Character/Creature/Enemy/Stinger/SmallStinger/Char_Stinger_Child.Char_Stinger_Child_C': {
                name        : 'Stinger (Size?)',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapStingerIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_Stinger_Child_C_'
            },
            '/Game/FactoryGame/Character/Creature/Enemy/Stinger/SmallStinger/Char_CaveStinger_Child.Char_CaveStinger_Child_C': {
                name        : 'Stinger (Size?)',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapStingerIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_CaveStinger_Child_C_'
            },
            '/Game/FactoryGame/Character/Creature/Enemy/Hog/Char_Hog.Char_Hog_C': {
                name        : 'Fluffy-tailed Hog',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapHogIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_Hog_C_'
            },
            '/Game/FactoryGame/Character/Creature/Enemy/Hog/AlphaHog/Char_AlphaHog.Char_AlphaHog_C': {
                name        : 'Alpha Hog',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapHogIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_AlphaHog_C_'
            },

            '/Game/FactoryGame/Character/Creature/Enemy/CrabHatcher/Char_CrabHatcher.Char_CrabHatcher_C': {
                name        : 'Flying Crab Hatcher',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapCrabHatcherIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_CrabHatcher_C_',
                zOffset     : -400
            },
            '/Game/FactoryGame/Character/Creature/Enemy/Crab/BabyCrab/Char_BabyCrab.Char_BabyCrab_C': {
                name        : 'Flying Crab',
                iconColor   : defaultIconColor,
                iconImage   : this.staticUrl + '/img/mapCrabIcon.png',
                pathName    : 'Persistent_Level:PersistentLevel.Char_BabyCrab_C_'
            }
        };

        if(className === null)
        {
            return availableFauna;
        }
        else
        {
            if(availableFauna[className] !== undefined)
            {
                return availableFauna[className];
            }
        }

        return null;
    }

    getIncrementalIdFromInternalPointer(className)
    {
        if(this.saveGameInternalPointer[className] === undefined)
        {
            this.saveGameInternalPointer[className] = 1;
        }
        else
        {
            this.saveGameInternalPointer[className]++;
        }

        return parseInt((' ' + this.saveGameInternalPointer[className]).slice(1));
    }

    generateNewPathName(currentObject)
    {
        let newId       = this.getIncrementalIdFromInternalPointer(currentObject.className);
        let pathName    = JSON.parse(JSON.stringify(currentObject.pathName.split('_')));
            pathName.pop();
            pathName.push(newId);

        //return ' ' + pathName.join('_').slice(1);
        return pathName.join('_');
    }

    // CONTEXT MENU
    getContextMenu(marker)
    {
        if(marker.options.pathName !== undefined)
        {
            let currentObject   = this.saveGameParser.getTargetObject(marker.options.pathName);
            let contextMenu     = new BaseLayout_ContextMenu({
                        baseLayout      : this,
                        marker          : marker
                    });

                return contextMenu.getContextMenu(currentObject);
        }

        return false;
    }


    /*
     * TOOLTIP FUNCTIONS
     */
    autoBindTooltip(marker)
    {
        if(marker.options.pathName !== undefined)
        {
            marker.on('mouseover', this.showTooltip.bind(this));
            marker.on('mouseout', this.closeTooltip);

            if(L.Browser.touch)
            {
                marker.on('click', this.showTooltip.bind(this));
            }
        }
    }
    showTooltip(e)
    {
        let content         = null;
        let currentObject   = this.saveGameParser.getTargetObject(e.target.options.pathName);

        if(currentObject !== null)
        {
            let tooltip = new BaseLayout_Tooltip({
                baseLayout      : this,
                target          : e.target
            });
                content = tooltip.getTooltip(currentObject);
        }

        if(content !== null)
        {
            e.target.closeTooltip(); // Prevent double tooltip...
            e.target._tooltip = new L.tooltip({}, e.target);
            e.target._tooltip.setContent(content);
            e.target.openTooltip();
        }
    }
    closeTooltip(e)
    {
        e.target.unbindTooltip();
        //e.target.closeTooltip();
	//e.target._tooltip = null;
    }

    setColorLuminance(hex, lum = 0)
    {
	let rgb = "#", c, i;
	for(i = 0; i < 3; i++)
        {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
    }


    // EDIT/DELETE FUNCTIONS
    getMarkerFromPathName(pathName, filterLayerId = null)
    {
        for(let layerId in this.playerLayers)
        {
            if(filterLayerId === null || layerId === filterLayerId)
            {
                let layerLength = this.playerLayers[layerId].elements.length;

                for(let i = 0; i < layerLength; i++)
                {
                    if(this.playerLayers[layerId].elements[i].options.pathName !== undefined && this.playerLayers[layerId].elements[i].options.pathName === pathName)
                    {
                        return this.playerLayers[layerId].elements[i];
                    }
                }
            }
        }

        return null;
    }

    deleteMarkerFromElements(layerId, marker, fast = false)
    {
        if(this.playerLayers[layerId] !== undefined)
        {
            let layerLength = this.playerLayers[layerId].elements.length;

                for(let i = 0; i < layerLength; i++)
                {
                    if(this.playerLayers[layerId].elements[i] === marker)
                    {
                        this.playerLayers[layerId].elements.splice(i, 1);
                        this.playerLayers[layerId].subLayer.removeLayer(marker);

                        if(fast === false)
                        {
                            this.setBadgeLayerCount(layerId);
                        }
                        else
                        {
                            if(this.delayedBadgeCount === null)
                            {
                                this.delayedBadgeCount = [];
                            }
                            if(this.delayedBadgeCount.includes(layerId) === false)
                            {
                                this.delayedBadgeCount.push(layerId);
                            }
                        }

                        return;
                    }
                }

                return;
        }
    }

    removeFromStorage(currentObject)
    {
        let storages    = this.playerLayers.playerStoragesLayer.elements;
        let recipe      = [];

        if(typeof currentObject === 'object')
        {
            for(let k = 0; k < currentObject.properties.length; k++)
            {
                if(currentObject.properties[k].name === 'mBuiltWithRecipe')
                {
                    let recipeName = currentObject.properties[k].value.pathName.split('.')[1];
                        if(this.recipesData[recipeName] !== undefined)
                        {
                            for(let ingredient in this.recipesData[recipeName].ingredients)
                            {
                                for(let i = 0; i < this.recipesData[recipeName].ingredients[ingredient]; i++)
                                {
                                    recipe.push(ingredient);
                                }
                            }

                            break;
                        }
                }

                // Before update 3
                if(currentObject.properties[k].name === 'mDismantleRefund')
                {
                    let dismantleRefund = currentObject.properties[k].value.values;

                        for(let m = 0; m < dismantleRefund.length; m++)
                        {
                            let currentClass    = null;
                            let currentAmount   = null;

                            for(let n = 0; n < dismantleRefund[m].length; n++)
                            {
                                if(dismantleRefund[m][n].name === 'ItemClass')
                                {
                                    currentClass    = dismantleRefund[m][n].value.pathName;
                                }
                                if(dismantleRefund[m][n].name === 'amount')
                                {
                                    currentAmount   = dismantleRefund[m][n].value;
                                }
                            }

                            if(currentClass !== null && currentAmount !== null)
                            {
                                for(let i = 0; i < currentAmount; i++)
                                {
                                    recipe.push(currentClass);
                                }
                            }
                        }

                    break;
                }
            }
        }
        else
        {
            // Simple string is 1 item :)
            recipe.push(currentObject);
        }

        for(let i = storages.length - 1; i >= 0; i--)
        {
            if(storages[i].options.pathName !== undefined)
            {
                let currentStorage      = this.saveGameParser.getTargetObject(storages[i].options.pathName);

                if(currentStorage !== null)
                {
                    let storageInventory    = this.getObjectInventory(currentStorage, 'mStorageInventory', true);

                    if(storageInventory !== null)
                    {
                        for(let j = 0; j < storageInventory.properties.length; j++)
                        {
                            if(storageInventory.properties[j].name === 'mInventoryStacks')
                            {
                                for(let k = 0; k < storageInventory.properties[j].value.values.length; k++)
                                {
                                    if(storageInventory.properties[j].value.values[k][0].value.itemName !== '')
                                    {
                                        while(recipe.includes(storageInventory.properties[j].value.values[k][0].value.itemName))
                                        {
                                            let currentIndex = recipe.indexOf(storageInventory.properties[j].value.values[k][0].value.itemName);
                                                if(currentIndex !== -1)
                                                {
                                                    recipe.splice(currentIndex, 1);
                                                    storageInventory.properties[j].value.values[k][0].value.properties[0].value--;

                                                    if(storageInventory.properties[j].value.values[k][0].value.properties[0].value === 0)
                                                    {
                                                        storageInventory.properties[j].value.values[k][0].value.itemName    = '';

                                                        break;
                                                    }
                                                }
                                        }

                                        if(recipe.length === 0) // We found everything!
                                        {
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if(recipe.length === 0) // We found everything!
                {
                    return true;
                }
            }
        }

        // Apparently we couldn't find all the current recipe...
        return false;
    }

    selectMultipleMarkers(markers)
    {
        let selectedMarkersLength   = markers.length;
        let markersSelected         = [];
        let message                 = '';
        let buildings               = {};

        this.pauseMap();

        for(let i = 0; i < selectedMarkersLength; i++)
        {
            if(markers[i].options.pathName !== undefined)
            {
                let currentObject       = this.saveGameParser.getTargetObject(markers[i].options.pathName);
                let currentObjectKey    = this.saveGameParser.getTargetObjectKey(markers[i].options.pathName);

                if(currentObject !== null)
                {
                    markersSelected.push({
                        children: currentObject.children.length,
                        key: currentObjectKey,
                        marker: markers[i]
                    }); // Used to sort selection in order...

                    if(buildings[currentObject.className] === undefined)
                    {
                        if(currentObject.className === '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C')
                        {
                            buildings[currentObject.className] = {name: 'Loot Crate', total: 1};
                        }
                        else
                        {
                            let buildingData    = this.getBuildingDataFromClassName(currentObject.className);

                            if(buildingData !== null)
                            {
                                buildings[currentObject.className] = {name: buildingData.name, total: 1};
                            }
                        }
                    }
                    else
                    {
                        buildings[currentObject.className].total++;
                    }
                }
                else
                {
                    if(markers[i].options.pathName.search('_vehicleTrackData') === -1)
                    {
                        console.log('MARKER FOR DELETE DO NOT EXISTS', markers[i]);
                    }
                }
            }
        }

        // Sort in reverse order, that way we can slice before remapping!
        markersSelected.sort((a, b) => (a.children > b.children) ? 1 : (a.children === b.children) ? ((a.key > b.key) ? -1 : 1) : -1 );
        this.markersSelected = [];
        for(let i = 0; i < markersSelected.length; i++)
        {
            this.markersSelected.push(markersSelected[i].marker);
        }

        message += '<ul style="flex-wrap: wrap;display: flex;">';

        let buildingsList   = [];
        for(let className in buildings)
        {
            buildingsList.push(buildings[className]);
        }
        buildingsList.sort((a, b) => (a.total > b.total) ? -1 : 1);
        for(let i = 0; i < buildingsList.length; i++)
        {
            message += '<li style="flex: 1 0 50%;">' + buildingsList[i].total + ' ' + buildingsList[i].name + '</li>';
        }
        message += '</ul>';

        let inputOptions = [];
            inputOptions.push({text: 'Delete selected items', value: 'delete'});
            inputOptions.push({text: 'Update selected items color', value: 'color'});

            inputOptions.push({group: 'Positioning', text: 'Offset selected items position', value: 'offset'});
            inputOptions.push({group: 'Positioning', text: 'Rotate selected items position', value: 'rotate'});

            inputOptions.push({group: 'Blueprints', text: 'Add "Foundation 8m x 2m" helpers on selection boundaries', value: 'helpers'});
            inputOptions.push({group: 'Blueprints', text: 'Copy selected items', value: 'copy'});

            inputOptions.push({group: 'Downgrade/Upgrade', text: 'Offset selected items clock speed', value: 'updateClockSpeed'});
            inputOptions.push({group: 'Downgrade/Upgrade', text: 'Downgrade selected belts/lifts', value: 'downgradeBelts'});
            inputOptions.push({group: 'Downgrade/Upgrade', text: 'Upgrade selected belts/lifts', value: 'upgradeBelts'});
            inputOptions.push({group: 'Downgrade/Upgrade', text: 'Downgrade selected power poles', value: 'downgradePowerPoles'});
            inputOptions.push({group: 'Downgrade/Upgrade', text: 'Upgrade selected power poles', value: 'upgradePowerPoles'});

            inputOptions.push({group: 'Foundations', text: 'Convert "Glass Foundation 8m x 1m" to "Foundation 8m x 1m"', value: 'upgradeGlass8x1ToFoundation8x1'});

            inputOptions.push({group: 'Statistics', text: 'Show selected items production statistics', value: 'productionStatistics'});
            inputOptions.push({group: 'Statistics', text: 'Show selected items storage statistics', value: 'storageStatistics'});
            inputOptions.push({group: 'Statistics', text: 'Show selected items power statistics', value: 'powerStatistics'});

        bootbox.form({
            title       : 'You have selected ' + selectedMarkersLength + ' items',
            message     : message,
            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
            container: '#leafletMap', backdrop: false,
            centerVertical: true,
            inputs: [{
                name: 'form',
                inputType: 'select',
                inputOptions: inputOptions
            }],
            callback: function(form)
            {
                if(form === null || form.form === null)
                {
                    this.cancelSelectMultipleMarkers();
                    return;
                }

                switch(form.form)
                {
                    case 'delete':
                        bootbox.confirm({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            message     : 'Do you want a doggy bag with your mass-dismantling?<br /><em>(You\'ll just get a nice loot crate next to you)</em>',
                            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
                            container   : '#leafletMap', backdrop: false,
                            closeButton : false,
                            centerVertical: true,
                            buttons: {
                                confirm: {
                                    label: 'Yes',
                                    className: 'btn-success'
                                },
                                cancel: {
                                    label: 'No',
                                    className: 'btn-danger'
                                }
                            },
                            callback: function(result){
                                return new BaseLayout_Selection_Delete({
                                    baseLayout      : this,
                                    markersSelected : this.markersSelected,
                                    keepDeleted     : result
                                });
                            }.bind(this)
                        });
                        return;

                    case 'offset':
                        bootbox.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            message     : 'Negative offset will move X to the West, Y to the North, and Z down.<br /><strong>NOTE:</strong> A foundation is 800 wide.',
                            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
                            container: '#leafletMap', backdrop: false,
                            centerVertical: true,
                            inputs: [{
                                label: 'X',
                                name: 'offsetX',
                                inputType: 'text',
                                value: 0
                            },
                            {
                                label: 'Y',
                                name: 'offsetY',
                                inputType: 'text',
                                value: 0
                            },
                            {
                                label: 'Z',
                                name: 'offsetZ',
                                inputType: 'text',
                                value: 0
                            }],
                            callback: function(form)
                            {
                                if(form === null || form.offsetX === null || form.offsetY === null || form.offsetZ === null)
                                {
                                    this.cancelSelectMultipleMarkers();
                                    return;
                                }

                                return new BaseLayout_Selection_Offset({
                                    baseLayout      : this,
                                    markersSelected : this.markersSelected,
                                    offsetX         : form.offsetX,
                                    offsetY         : form.offsetY,
                                    offsetZ         : form.offsetZ
                                });
                            }.bind(this)
                        });
                        return;

                    case 'rotate':
                        bootbox.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
                            container: '#leafletMap', backdrop: false,
                            centerVertical: true,
                            inputs: [{
                                label: 'Rotation (Angle between 0 and 360 degrees)',
                                name: 'angle',
                                inputType: 'text',
                                value: 0
                            }],
                            callback: function(form)
                            {
                                if(form === null || form.angle === null)
                                {
                                    this.cancelSelectMultipleMarkers();
                                    return;
                                }

                                return new BaseLayout_Selection_Rotate({
                                    baseLayout      : this,
                                    markersSelected : this.markersSelected,
                                    angle           : form.angle
                                });
                            }.bind(this)
                        });
                        return;

                    case 'color':
                        let playerColors        = this.getColorSlots();
                        let selectOptionsColors = [];

                        for(let slotIndex = 0; slotIndex < BaseLayout_Map_ColorSlots.getTotalColorSlots(); slotIndex++)
                        {
                            selectOptionsColors.push({
                                primaryColor: 'rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ')',
                                secondaryColor: 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ')',
                                value: slotIndex,
                                text: (slotIndex + 1)
                            });
                        }

                        bootbox.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            container: '#leafletMap', backdrop: false,
                            centerVertical: true,
                            scrollable: true,
                            inputs: [{
                                name: 'slotIndex',
                                inputType: 'select',
                                inputOptions: selectOptionsColors,
                                replaceWith: 'colorSlots'
                            }],
                            callback: function(form)
                            {
                                if(form === null || form.slotIndex === null)
                                {
                                    this.cancelSelectMultipleMarkers();
                                    return;
                                }

                                return this.updateMultipleObjectColorSlot(form.slotIndex);
                            }.bind(this)
                        });
                        return;

                    case 'helpers':
                        let playerColorsHelpers = this.getColorSlots();
                        let selectOptions       = [];

                        for(let slotIndex = 0; slotIndex < BaseLayout_Map_ColorSlots.getTotalColorSlots(); slotIndex++)
                        {
                            selectOptions.push({
                                primaryColor: 'rgb(' + playerColorsHelpers[slotIndex].primaryColor.r + ', ' + playerColorsHelpers[slotIndex].primaryColor.g + ', ' + playerColorsHelpers[slotIndex].primaryColor.b + ')',
                                secondaryColor: 'rgb(' + playerColorsHelpers[slotIndex].secondaryColor.r + ', ' + playerColorsHelpers[slotIndex].secondaryColor.g + ', ' + playerColorsHelpers[slotIndex].secondaryColor.b + ')',
                                value: slotIndex,
                                text: (slotIndex + 1)
                            });
                        }

                        bootbox.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            container: '#leafletMap', backdrop: false,
                            centerVertical: true,
                            scrollable: true,
                            inputs: [{
                                name: 'slotIndex',
                                inputType: 'select',
                                inputOptions: selectOptions,
                                replaceWith: 'colorSlots'
                            }],
                            callback: function(form)
                            {
                                if(form === null || form.slotIndex === null)
                                {
                                    this.cancelSelectMultipleMarkers();
                                    return;
                                }

                                return this.helpersSelection(form.slotIndex);
                            }.bind(this)
                        });
                        return;
                    case 'copy':
                        return new BaseLayout_Selection_Copy({
                                baseLayout      : this,
                                markersSelected : this.markersSelected
                            });

                    case 'downgradeBelts':
                        return this.downgradeBeltsSelection();
                    case 'upgradeBelts':
                        return this.upgradeBeltsSelection();

                    case 'downgradePowerPoles':
                        return this.downgradePowerPolesSelection();
                    case 'upgradePowerPoles':
                        return this.upgradePowerPolesSelection();

                    case 'updateClockSpeed':
                        bootbox.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
                            container: '#leafletMap', backdrop: false,
                            centerVertical: true,
                            inputs: [
                                {
                                    label: 'Offset clock speed (Percentage)',
                                    name: 'offset',
                                    inputType: 'text',
                                    value: 0
                                },
                                {
                                    label: 'Use power shards from your containers?',
                                    name: 'useOwnPowershards',
                                    inputType: 'select',
                                    inputOptions: [
                                        {
                                            text: 'Yes',
                                            value: '1'
                                        },
                                        {
                                            text: 'No',
                                            value: '0'
                                        }
                                    ]
                                }
                            ],
                            callback: function(form)
                            {
                                if(form === null || form.offset === null || form.useOwnPowershards === null)
                                {
                                    this.cancelSelectMultipleMarkers();
                                    return;
                                }

                                return this.updateMultipleObjectClockSpeed(form.offset, parseInt(form.useOwnPowershards));
                            }.bind(this)
                        });
                        return;

                    case 'upgradeGlass8x1ToFoundation8x1':
                        return this.selectionGlass8x1ToFoundation8x1();

                    case 'productionStatistics':
                        return this.showSelectionProductionStatistics();
                    case 'storageStatistics':
                        return this.showSelectionStorageStatistics();
                    case 'powerStatistics':
                        return this.showSelectionPowerStatistics();
                }
            }.bind(this)
        });
    }

    downgradeBeltsSelection()
    {
        if(this.markersSelected)
        {
            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let contextMenu = this.getContextMenu(this.markersSelected[i]);

                if(contextMenu !== false)
                {
                    // Search for a downgrade callback in contextmenu...
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name.search('downgradeBelt') !== -1)
                        {
                            contextMenu[j].callback({relatedTarget: this.markersSelected[i]});
                        }
                    }
                }
            }
        }

        this.cancelSelectMultipleMarkers();
    }

    upgradeBeltsSelection()
    {
        if(this.markersSelected)
        {
            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let contextMenu = this.getContextMenu(this.markersSelected[i]);

                if(contextMenu !== false)
                {
                    // Search for a downgrade callback in contextmenu...
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name.search('upgradeBelt') !== -1)
                        {
                            contextMenu[j].callback({relatedTarget: this.markersSelected[i]});
                        }
                    }
                }
            }
        }

        this.cancelSelectMultipleMarkers();
    }

    downgradePowerPolesSelection()
    {
        if(this.markersSelected)
        {
            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let contextMenu = this.getContextMenu(this.markersSelected[i]);

                if(contextMenu !== false)
                {
                    // Search for a downgrade callback in contextmenu...
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name.search('downgradePowerPole') !== -1)
                        {
                            contextMenu[j].callback({relatedTarget: this.markersSelected[i]});
                        }
                    }
                }
            }
        }

        this.cancelSelectMultipleMarkers();
    }

    upgradePowerPolesSelection()
    {
        if(this.markersSelected)
        {
            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let contextMenu = this.getContextMenu(this.markersSelected[i]);

                if(contextMenu !== false)
                {
                    // Search for a downgrade callback in contextmenu...
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name.search('upgradePowerPole') !== -1)
                        {
                            contextMenu[j].callback({relatedTarget: this.markersSelected[i]});
                        }
                    }
                }
            }
        }

        this.cancelSelectMultipleMarkers();
    }

    selectionGlass8x1ToFoundation8x1()
    {
        if(this.markersSelected)
        {
            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let currentObject = this.saveGameParser.getTargetObject(this.markersSelected[i].options.pathName);
                    if(currentObject !== null)
                    {
                        if(currentObject.className === '/Game/FactoryGame/Buildable/Building/Foundation/Build_FoundationGlass_01.Build_FoundationGlass_01_C')
                        {
                            currentObject.className = '/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x1_01.Build_Foundation_8x1_01_C';

                            let result = this.parseObject(currentObject);
                                this.deleteMarkerFromElements(result.layer, this.markersSelected[i], true);
                                this.addElementToLayer(result.layer, result.marker);
                        }
                    }
            }

            this.updateDelayedBadgeCount();
        }

        this.cancelSelectMultipleMarkers();
    }

    showSelectionProductionStatistics()
    {
        if(this.markersSelected)
        {
            let statisticsProduction = new BaseLayout_Statistics_Production({
                    baseLayout      : this,
                    markersSelected : this.markersSelected
                });

            $('#genericModal .modal-title').empty().html('Statistics - Prodution');
            $('#genericModal .modal-body').empty().html(statisticsProduction.parse());
            setTimeout(function(){
                $('#genericModal').modal('show').modal('handleUpdate');
            }, 250);
        }

        this.cancelSelectMultipleMarkers();
    }

    showSelectionStorageStatistics()
    {
        if(this.markersSelected)
        {
            let statisticsStorage = new BaseLayout_Statistics_Storage({
                    baseLayout      : this,
                    markersSelected : this.markersSelected
                });

            $('#genericModal .modal-title').empty().html('Statistics - Storage');
            $('#genericModal .modal-body').empty().html(statisticsStorage.parse());
            setTimeout(function(){
                $('#genericModal').modal('show').modal('handleUpdate');
            }, 250);
        }

        this.cancelSelectMultipleMarkers();
    }

    showSelectionPowerStatistics()
    {
        if(this.markersSelected)
        {
            let statisticsPower = new BaseLayout_Statistics_Power({
                    baseLayout      : this,
                    markersSelected : this.markersSelected
                });

            $('#genericModal .modal-title').empty().html('Statistics - Power');
            $('#genericModal .modal-body').empty().html(statisticsPower.parse());

            setTimeout(function(){
                $('#genericModal').modal('show').modal('handleUpdate');
            }, 250);
        }

        this.cancelSelectMultipleMarkers();
    }

    updateMultipleObjectColorSlot(slotIndex)
    {
        slotIndex    = parseInt(slotIndex);

        if(this.markersSelected)
        {
            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let contextMenu = this.getContextMenu(this.markersSelected[i]);

                if(contextMenu !== false)
                {
                    // Search for a delete callback in contextmenu...
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name.search('updateObjectColorSlot') !== -1)
                        {
                            //contextMenu[j].callback({relatedTarget: this.markersSelected[i]});
                            /**/
                            let currentObject   = this.saveGameParser.getTargetObject(this.markersSelected[i].options.pathName);
                            let colorSlot       = this.getObjectProperty(currentObject, 'mColorSlot');

                            if(colorSlot === null && slotIndex > 0)
                            {
                                currentObject.properties.push({
                                    name: 'mColorSlot',
                                    type: 'ByteProperty',
                                    value: {
                                        enumName: 'None',
                                        value: slotIndex
                                    }
                                });
                            }
                            else
                            {
                                for(let i = 0; i < currentObject.properties.length; i++)
                                {
                                    if(currentObject.properties[i].name === 'mColorSlot')
                                    {
                                        if(slotIndex > 0)
                                        {
                                            currentObject.properties[i].value.value = slotIndex;
                                        }
                                        else
                                        {
                                            currentObject.properties.splice(i, 1);
                                        }

                                        break;
                                    }
                                }
                            }

                            this.markersSelected[i].fire('mouseout'); // Trigger a redraw
                            /**/
                        }
                    }
                }
            }
        }

        this.cancelSelectMultipleMarkers();
    }

    helpersSelection(colorSlotHelper)
    {
        if(this.markersSelected)
        {
            let selectionBoundaries = this.getSelectionBoundaries(this.markersSelected);
            let centerX             = ((selectionBoundaries.minX + selectionBoundaries.maxX) / 2);
            let centerY             = ((selectionBoundaries.minY + selectionBoundaries.maxY) / 2);
            let minZ                = Infinity;

                // Try to find the minZ
                for(let i = 0; i < this.markersSelected.length; i++)
                {
                    let currentObject       = this.saveGameParser.getTargetObject(this.markersSelected[i].options.pathName);
                    let currentObjectData   = this.getBuildingDataFromClassName(currentObject.className);

                        if(currentObjectData !== null && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C' && currentObject.className !== '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C')
                        {
                            if(
                                    currentObject.className.search('/Game/FactoryGame/Buildable/Building/Ramp/Build_') !== - 1
                                 || currentObject.className.search('/Game/FactoryGame/Buildable/Building/Foundation/Build_') !== -1
                            )
                            {
                                minZ = Math.min(minZ, currentObject.transform.translation[2] - (currentObjectData.height * 100 / 2)); // GROUND BUILDING USE HALF AS CENTER
                            }
                            else
                            {
                                minZ = Math.min(minZ, currentObject.transform.translation[2]); // OTHER ARE PLACED FROM BOTTOM
                            }
                        }
                }


            let fakeFoundation      = {
                    type: 1,
                    className: "/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x2_01.Build_Foundation_8x2_01_C",
                    levelName: "Persistent_Level", pathName: "Persistent_Level:PersistentLevel.Build_Foundation_8x2_01_C_XXX",
                    needTransform: 1,
                    transform: {
                        rotation: [0, 0, 0, 1],
                        translation: [centerX, centerY, minZ + 100],
                        scale3d: [1, 1, 1]
                    },
                    wasPlacedInLevel: 0, children: [],
                    properties: [
                        { name: "mPrimaryColor", type: "StructProperty", value: { type: "LinearColor", values: { r: 0.10946200042963028, g: 0.10946200042963028, b: 0.10946200042963028, a: 1 } } },
                        { name: "mSecondaryColor", type: "StructProperty", value: { type: "LinearColor", values: { r: 0.10946200042963028, g: 0.10946200042963028, b: 0.10946200042963028, a: 1 } } },
                        {name: "mColorSlot", type: "ByteProperty", index: 0, value: {enumName: "None", value: parseFloat(colorSlotHelper)}},
                        { name: "mBuildingID", type: "IntProperty", value: 25 },
                        { name: "mBuiltWithRecipe", type: "ObjectProperty", value: { levelName: "", pathName: "/Game/FactoryGame/Recipes/Buildings/Foundations/Recipe_Foundation_8x2_01.Recipe_Foundation_8x2_01_C" } },
                        { name: "mBuildTimeStamp", type: "FloatProperty", value: 0 }
                    ],
                    entityLevelName: "Persistent_Level", entityPathName: "Persistent_Level:PersistentLevel.BuildableSubsystem"
                };
                fakeFoundation.pathName = this.generateNewPathName(fakeFoundation);

            this.saveGameParser.addObject(fakeFoundation);
            let resultCenter = this.parseObject(fakeFoundation);
                this.addElementToLayer(resultCenter.layer, resultCenter.marker);

            let newFoundationTopLeft                    = JSON.parse(JSON.stringify(fakeFoundation));
                newFoundationTopLeft.pathName           = this.generateNewPathName(fakeFoundation);
            let translationRotationTopLeft              = BaseLayout_Math.getPointRotation(
                    [
                        (fakeFoundation.transform.translation[0] - (centerX - selectionBoundaries.minX) - 800),
                        (fakeFoundation.transform.translation[1] - (centerY - selectionBoundaries.minY) - 800)
                    ], fakeFoundation.transform.translation, fakeFoundation.transform.rotation
                );
                newFoundationTopLeft.transform.translation[0]  = translationRotationTopLeft[0];
                newFoundationTopLeft.transform.translation[1]  = translationRotationTopLeft[1];

                this.saveGameParser.addObject(newFoundationTopLeft);

                let resultTopLeft = this.parseObject(newFoundationTopLeft);
                    this.addElementToLayer(resultTopLeft.layer, resultTopLeft.marker);

            let newFoundationTopRight                   = JSON.parse(JSON.stringify(fakeFoundation));
                newFoundationTopRight.pathName          = this.generateNewPathName(fakeFoundation);
            let translationRotationTopRight             = BaseLayout_Math.getPointRotation(
                    [
                        (fakeFoundation.transform.translation[0] + (selectionBoundaries.maxX - centerX) + 800),
                        (fakeFoundation.transform.translation[1] - (centerY - selectionBoundaries.minY) - 800)
                    ], fakeFoundation.transform.translation, fakeFoundation.transform.rotation
                );
                newFoundationTopRight.transform.translation[0] = translationRotationTopRight[0];
                newFoundationTopRight.transform.translation[1] = translationRotationTopRight[1];

                this.saveGameParser.addObject(newFoundationTopRight);

                let resultTopRight = this.parseObject(newFoundationTopRight);
                    this.addElementToLayer(resultTopRight.layer, resultTopRight.marker);

            let newFoundationBottomLeft                 = JSON.parse(JSON.stringify(fakeFoundation));
                newFoundationBottomLeft.pathName        = this.generateNewPathName(fakeFoundation);
            let translationRotationBottomLeft           = BaseLayout_Math.getPointRotation(
                    [
                        (fakeFoundation.transform.translation[0] - (centerX - selectionBoundaries.minX) - 800),
                        (fakeFoundation.transform.translation[1] + (selectionBoundaries.maxY - centerY) + 800)
                    ], fakeFoundation.transform.translation, fakeFoundation.transform.rotation
                );
                newFoundationBottomLeft.transform.translation[0]    = translationRotationBottomLeft[0];
                newFoundationBottomLeft.transform.translation[1]    = translationRotationBottomLeft[1];

                this.saveGameParser.addObject(newFoundationBottomLeft);

                let resultBottomLeft = this.parseObject(newFoundationBottomLeft);
                    this.addElementToLayer(resultBottomLeft.layer, resultBottomLeft.marker);


            let newFoundationBottomRight                = JSON.parse(JSON.stringify(fakeFoundation));
                newFoundationBottomRight.pathName       = this.generateNewPathName(fakeFoundation);
            let translationRotationBottomRight          = BaseLayout_Math.getPointRotation(
                    [
                        (fakeFoundation.transform.translation[0] + (selectionBoundaries.maxX - centerX) + 800),
                        (fakeFoundation.transform.translation[1] + (selectionBoundaries.maxY - centerY) + 800)
                    ], fakeFoundation.transform.translation, fakeFoundation.transform.rotation
                );
                newFoundationBottomRight.transform.translation[0]   = translationRotationBottomRight[0];
                newFoundationBottomRight.transform.translation[1]   = translationRotationBottomRight[1];

                this.saveGameParser.addObject(newFoundationBottomRight);

                let resultBottomRight = this.parseObject(newFoundationBottomRight);
                    this.addElementToLayer(resultBottomRight.layer, resultBottomRight.marker);
        }

        this.cancelSelectMultipleMarkers();
    }

    cancelSelectMultipleMarkers()
    {
        this.markersSelected = undefined;
        this.satisfactoryMap.leafletMap.selectAreaFeature.removeSelectedArea();

        this.unpauseMap();
    }

    getSelectionBoundaries(markersSelected)
    {
        let minX        = Infinity;
        let maxX        = -Infinity;
        let minY        = Infinity;
        let maxY        = -Infinity;
            for(let i = 0; i < markersSelected.length; i++)
            {
                let currentObject   = this.saveGameParser.getTargetObject(markersSelected[i].options.pathName);
                let mSplineData     = this.getObjectProperty(currentObject, 'mSplineData');

                if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C' || currentObject.className === '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C')
                {
                    continue;
                }

                if(mSplineData !== null)
                {
                    let splineMinX = Infinity;
                    let splineMaxX = -Infinity;
                    let splineMinY = Infinity;
                    let splineMaxY = -Infinity;

                    for(let j = 0; j < mSplineData.values.length; j++)
                    {
                        for(let k = 0; k < mSplineData.values[j].length; k++)
                        {
                            let currentValue    = mSplineData.values[j][k];

                                if(currentValue.name === 'Location')
                                {
                                    splineMinX            = Math.min(splineMinX, currentObject.transform.translation[0] + currentValue.value.values.x);
                                    splineMaxX            = Math.max(splineMaxX, currentObject.transform.translation[0] + currentValue.value.values.x);
                                    splineMinY            = Math.min(splineMinY, currentObject.transform.translation[1] + currentValue.value.values.y);
                                    splineMaxY            = Math.max(splineMaxY, currentObject.transform.translation[1] + currentValue.value.values.y);
                                }
                        }
                    }

                    minX    = Math.min(minX, ((splineMinX + splineMaxX) / 2));
                    maxX    = Math.max(maxX, ((splineMinX + splineMaxX) / 2));
                    minY    = Math.min(minY, ((splineMinY + splineMaxY) / 2));
                    maxY    = Math.max(maxY, ((splineMinY + splineMaxY) / 2));
                }
                else
                {
                    minX            = Math.min(minX, currentObject.transform.translation[0]);
                    maxX            = Math.max(maxX, currentObject.transform.translation[0]);
                    minY            = Math.min(minY, currentObject.transform.translation[1]);
                    maxY            = Math.max(maxY, currentObject.transform.translation[1]);
                }
            }

        return {
            minX    : minX,
            maxX    : maxX,
            minY    : minY,
            maxY    : maxY,
            centerX : (minX + maxX) / 2,
            centerY : (minY + maxY) / 2
        };
    }

    pauseMap()
    {
        this.satisfactoryMap.leafletMap.dragging.disable();
        this.satisfactoryMap.leafletMap.keyboard.disable();
        this.satisfactoryMap.leafletMap.doubleClickZoom.disable();
    }

    unpauseMap()
    {
        this.satisfactoryMap.leafletMap.dragging.enable();
        this.satisfactoryMap.leafletMap.keyboard.enable();
        this.satisfactoryMap.leafletMap.doubleClickZoom.enable();
    }
}