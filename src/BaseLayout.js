/* global L, Promise, Infinity, Intl, Sentry, parseFloat */
import SaveParser_FicsIt                        from './SaveParser/FicsIt.js';

import BaseLayout_ContextMenu                   from './BaseLayout/ContextMenu.js';
import BaseLayout_History                       from './BaseLayout/History.js';
import BaseLayout_Math                          from './BaseLayout/Math.js';
import BaseLayout_Modal                         from './BaseLayout/Modal.js';
import BaseLayout_Polygon                       from './BaseLayout/Polygon.js';
import BaseLayout_Tooltip                       from './BaseLayout/Tooltip.js';

import SubSystem_Buildable                      from './SubSystem/Buildable.js';
import SubSystem_Circuit                        from './SubSystem/Circuit.js';
import SubSystem_GameState                      from './SubSystem/GameState.js';
import SubSystem_Player                         from './SubSystem/Player.js';
import SubSystem_Railroad                       from './SubSystem/Railroad.js';
import SubSystem_Map                            from './SubSystem/Map.js';
import SubSystem_Unlock                         from './SubSystem/Unlock.js';
import SubSystem_Time                           from './SubSystem/Time.js';

import Modal_Map_Collectables                   from './Modal/Map/Collectables.js';
import Modal_Map_Hotbars                        from './Modal/Map/Hotbars.js';
import Modal_Map_Players                        from './Modal/Map/Players.js';
import Modal_Map_Presets                        from './Modal/Map/Presets.js';
import Modal_Map_Options                        from './Modal/Map/Options.js';

import Modal_Statistics_Game                    from './Modal/Statistics/Game.js';
import Modal_Statistics_Production              from './Modal/Statistics/Production.js';
import Modal_Statistics_Storage                 from './Modal/Statistics/Storage.js';

import Modal_Buildings                          from './Modal/Buildings.js';
import Modal_ColorSlots                         from './Modal/ColorSlots.js';
import Modal_LightColorSlots                    from './Modal/LightColorSlots.js';
import Modal_PowerCircuits                      from './Modal/PowerCircuits.js';
import Modal_Schematics                         from './Modal/Schematics.js';
import Modal_Selection                          from './Modal/Selection.js';
import Modal_Trains                             from './Modal/Trains.js';

import Building_FrackingExtractor               from './Building/FrackingExtractor.js';
import Building_FrackingSmasher                 from './Building/FrackingSmasher.js';
import Building_Locomotive                      from './Building/Locomotive.js';
import Building_Light                           from './Building/Light.js';
import Building_RailroadSwitchControl           from './Building/RailroadSwitchControl.js';
import Building_RailroadTrack                   from './Building/RailroadTrack.js';
import Building_Vehicle                         from './Building/Vehicle.js';

import { translate }                            from './Translate.js';

export default class BaseLayout
{
    constructor(options)
    {
        this.useDebug                           = (options.debug !== undefined) ? options.debug : false;
        this.useBuild                           = (options.build !== undefined) ? options.build : 'EarlyAccess';
        this.scriptVersion                      = (options.version !== undefined) ? options.version : Math.floor(Math.random() * Math.floor(9999999999));
        this.staticUrl                          = options.staticUrl;
        this.tetrominoUrl                       = options.tetrominoUrl;
        this.usersUrl                           = options.usersUrl;

        this.satisfactoryMap                    = options.satisfactoryMap;
        this.saveGameParser                     = options.saveGameParser;

        this.saveGamePipeNetworks               = {};

        this.saveGameRailVehicles               = [];
        this.frackingSmasherCores               = {};

        this.gameMode                           = [];
        this.players                            = {};
        this.buildingDataClassNameHashTable     = {};
        this.radioactivityLayerNeedsUpdate      = false;
        this.tooltipsEnabled                    = true;

        this.updateAltitudeLayersIsRunning      = false;
        this.altitudeSliderControl              = null;
        this.selectionControl                   = null;
        this.clipboard                          = null;
        this.clipboardControl                   = null;
        this.history                            = null;

        this.dataUrl                            = options.dataUrl;
        this.buildingsData                      = null;
        this.buildingsCategories                = {};
        this.itemsData                          = null;
        this.itemsCategories                    = {};
        this.toolsData                          = null;
        this.toolsCategories                    = {};
        this.faunaData                          = null;
        this.faunaCategories                    = {};
        this.recipesData                        = null;
        this.schematicsData                     = null;

        this.modsData                           = null;
        this.modsUrl                            = options.modsUrl;

        this.language                           = options.language.split('_')[0]; // Handle pt_BR locales

        this.collectedHardDrives                = new HardDrives({language: options.language});
        this.collectedSchematics                = new Schematics({language: options.language});
        this.localStorage                       = this.collectedHardDrives.getLocaleStorage();

        this.showStructuresOnLoad               = (this.localStorage !== null && this.localStorage.getItem('mapShowStructuresOnLoad') !== null) ? (this.localStorage.getItem('mapShowStructuresOnLoad') === 'true') : true;
        this.showBuildingsOnLoad                = (this.localStorage !== null && this.localStorage.getItem('mapShowBuildingsOnLoad') !== null) ? (this.localStorage.getItem('mapShowBuildingsOnLoad') === 'true') : true;
        this.showGeneratorsOnLoad               = (this.localStorage !== null && this.localStorage.getItem('mapShowGeneratorsOnLoad') !== null) ? (this.localStorage.getItem('mapShowGeneratorsOnLoad') === 'true') : true;
        this.showTransportationOnLoad           = (this.localStorage !== null && this.localStorage.getItem('mapShowTransportationOnLoad') !== null) ? (this.localStorage.getItem('mapShowTransportationOnLoad') === 'true') : true;
        this.showNodesOnMiners                  = (this.localStorage !== null && this.localStorage.getItem('mapShowNodesOnMiners') !== null) ? (this.localStorage.getItem('mapShowNodesOnMiners') === 'true') : false;
        this.showCollected                      = (this.localStorage !== null && this.localStorage.getItem('mapShowCollected') !== null) ? (this.localStorage.getItem('mapShowCollected') === 'true') : false;

        this.showPatterns                       = (this.localStorage !== null && this.localStorage.getItem('mapShowPatterns') !== null) ? (this.localStorage.getItem('mapShowPatterns') === 'true') : true;
        this.showVehicleExtraMarker             = (this.localStorage !== null && this.localStorage.getItem('mapShowVehicleExtraMarker') !== null) ? (this.localStorage.getItem('mapShowVehicleExtraMarker') === 'true') : false;

        this.useRadioactivity                   = (this.localStorage !== null && this.localStorage.getItem('mapUseRadioactivity') !== null) ? (this.localStorage.getItem('mapUseRadioactivity') === 'true') : true;
        this.useFogOfWar                        = (this.localStorage !== null && this.localStorage.getItem('mapUseFogOfWar') !== null) ? (this.localStorage.getItem('mapUseFogOfWar') === 'true') : true;
        this.mapModelsQuality                   = (this.localStorage !== null && this.localStorage.getItem('mapModelsQuality') !== null) ? this.localStorage.getItem('mapModelsQuality') : 'high';

        this.availablePowerConnection           = ['.PowerInput', '.PowerConnection', '.PowerConnection1', '.PowerConnection2', '.FGPowerConnection', '.FGPowerConnection1', '.SlidingShoe', '.UpstreamConnection', '.DownstreamConnection'];
        this.availableBeltConnection            = ['.ConveyorAny0', '.ConveyorAny1', '.Input0', '.Input1', '.Input2', '.Input3', '.InPut3', '.Input4', '.Input5', '.Input6', '.Output0', '.Output1', '.Output2', '.Output3'];
        this.availableRailwayConnection         = ['.TrackConnection0', '.TrackConnection1'];
        this.availablePlatformConnection        = ['.PlatformConnection0', '.PlatformConnection1'];
        this.availablePipeConnection            = ['.PipeInputFactory', '.PipeOutputFactory', '.PipelineConnection0', '.PipelineConnection1', '.FGPipeConnectionFactory', '.Connection0', '.Connection1', '.Connection2', '.Connection3', '.ConnectionAny0', '.ConnectionAny1'];
        this.availableHyperPipeConnection       = ['.PipeHyperConnection0', '.PipeHyperConnection1', '.PipeHyperStartConnection'];

        this.detailedModels                     = {};

        this.playerLayersNotUsingAltitude       = ['playerRadioactivityLayer', 'playerLightsHaloLayer', 'playerPositionLayer', 'playerFogOfWar', 'playerResourceDepositsLayer', 'playerItemsPickupLayer'];

        this.setDefaultLayers();
    }

    setDefaultLayers()
    {
        this.delayedBadgeCount                  = null;

        this.playerLayers                       = {
            playerRadioactivityLayer                : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: {}},
            playerLightsHaloLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: []},

            playerFoundationsLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerRoofsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerLightsLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerPillarsLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerBeamsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerWallsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerWalkwaysLayer                     : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerSignsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerStatuesLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: []},

            playerHUBTerminalLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: []},
            playerFicsmasLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: []},
            playerUnknownLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: []},
            playerOrientationLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: [], count: 0},

            playerCratesLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: [], count: 0},
            playerMinersLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], filters: []},
            playerProductorsLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], filters: []},
            playerPadsLayer                         : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], filters: []},

            playerBiomassGeneratorsLayer            : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerCoalGeneratorsLayer               : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerFuelGeneratorsLayer               : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerNuclearGeneratorsLayer            : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerGeoThermalGeneratorsLayer         : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerStorageGeneratorsLayer            : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},

            playerStoragesLayer                     : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], filters: []},

            playerVehiculesLayer                    : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], count: 0, filters: []},
            playerDronesLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], count: 0/*, filters: []*/},
            playerBeltsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], distance: 0, filters: []},
            playerPipesLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], distance: 0, filters: []},
            playerPipesHyperLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], distance: 0, filters: []},

            playerTracksLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], distance: 0, filters: []},
            playerTrainsLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: []},

            playerPowerGridLayer                    : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: [], count: 0, distance: 0},

            // Last...
            playerResourceDepositsLayer             : {layerGroup: null, subLayer: null, elements: [], filters: []},
            playerItemsPickupLayer                  : {layerGroup: null, subLayer: null, elements: []},
            playerPositionLayer                     : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer'},
            playerSpaceRabbitLayer                  : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer', count: 0},
            playerFaunaLayer                        : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer', filters: []},
            playerFogOfWar                          : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer'}
        };

        // Reset mods layer...
        for(let modId in this.modsData)
        {
            if(this.modsData[modId].isLoaded !== undefined && this.modsData[modId].isLoaded === true)
            {
                let layerId = 'playerMods' + modId + 'Layer';
                    this.setupModSubLayer(modId, layerId);
            }
        }

        this.playerStatistics = {
            collectables : {
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
        $('.updateTitleLayerState').off('click');
        $('.updatePlayerLayerState').off('click');
        $('.updatePlayerLayerFilter').off('click');
        $('#playerModsLayer .col-12').empty();
        $('#statisticsModal').off('show.bs.modal');
        $('#statisticsModal').off('hide.bs.modal');
        $('#statisticsModal span[data-toggle="tab"]').off('shown.bs.tab');
        $('#researchModal').off('show.bs.modal');
        $('#optionsModal').off('show.bs.modal');
        $('#buildingsModal').off('show.bs.modal');
        $('#colorSlotsModal').off('click');
        $('#lightSlotsModal').off('click');
        $('#modalPowerCircuits').off('click');

        for(let pathName in this.satisfactoryMap.collectableMarkers)
        {
            if(['sporeFlowers', 'smallRocks', 'largeRocks'].includes(this.satisfactoryMap.collectableMarkers[pathName].options.layerId))
            {
                if(this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[pathName].options.layerId].hasLayer(this.satisfactoryMap.collectableMarkers[pathName]) === false)
                {
                    this.satisfactoryMap.collectableMarkers[pathName].addTo(
                        this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[pathName].options.layerId]
                    );
                }
            }
            else
            {
                if(this.satisfactoryMap.collectableMarkers[pathName] instanceof L.Circle === false)
                {
                    this.satisfactoryMap.collectableMarkers[pathName].setOpacity(1);
                }
            }

            delete this.satisfactoryMap.collectableMarkers[pathName].options.extractorPathName;
        }
        $('.updateLayerState[data-collected]').each(function(i, el){
            let total = $(el).attr('data-total');
                $(el).attr('data-collected', 0);
                $(el).find('.badge').html(new Intl.NumberFormat(this.language).format(total));
        }.bind(this));

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

                $('.updatePlayerLayerFilter[data-id=' + layerId + ']').hide().addClass('btn-warning');
            }
        }

        this.satisfactoryMap.leafletMap.removeControl(this.altitudeSliderControl);
        this.altitudeSliderControl  = null;

        this.satisfactoryMap.leafletMap.removeControl(this.selectionControl);
        this.selectionControl       = null;

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

        $('#statisticsModalSchematics').empty();
        $('#statisticsModalAlternateRecipes').empty();
        $('#statisticsModalMAM').empty();
        $('#statisticsModalAwesomeSink').empty();
        $('#statisticsModalSpecial').empty();

        $('#statisticsPlayerInventory').empty();
        $('#statisticsPlayerHotBars').empty();
        $('#statisticsModalCollectables').empty();
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
        $('#mods_resource_nodes').hide();

        this.detailedModels = {};

        console.timeEnd('resetBaseLayout');
    }

    draw()
    {
        this.collectedHardDrives.resetCollected();
        this.collectedSchematics.resetCollected();

        this.saveGameParser.load(() => {
            // Hold sub system to get better performance
            this.buildableSubSystem = new SubSystem_Buildable({baseLayout: this});
            this.gameStateSubSystem = new SubSystem_GameState({baseLayout: this});
            this.railroadSubSystem  = new SubSystem_Railroad({baseLayout: this});
            this.mapSubSystem       = new SubSystem_Map({baseLayout: this});
            this.unlockSubSystem    = new SubSystem_Unlock({baseLayout: this});
            this.timeSubSystem      = new SubSystem_Time({baseLayout: this});

            if(this.buildingsData === null)
            {
                return new Promise(function(resolve){
                    $('#loaderProgressBar .progress-bar').css('width', '47.5%');
                    $('.loader h6').html(translate('MAP\\LOADER\\Loading game data...'));
                    setTimeout(resolve, 50);
                }.bind(this)).then(() => {
                    $.getJSON(this.dataUrl + '?v=' + this.scriptVersion, function(data)
                    {
                        this.buildingsData          = data.buildingsData;
                        this.buildingsCategories    = data.buildingsCategories;
                        this.itemsData              = data.itemsData;
                        this.itemsCategories        = data.itemsCategories;
                        this.toolsData              = data.toolsData;
                        this.toolsCategories        = data.toolsCategories;
                        this.faunaData              = data.faunaData;
                        this.faunaCategories        = data.faunaCategories;

                        this.recipesData            = data.recipesData;
                        this.schematicsData         = data.schematicsData;
                        this.modsData               = data.modsData;

                        this.loadDetailedModels();
                    }.bind(this));
                });
            }
            else
            {
                this.loadDetailedModels();
            }
        });
    }

    loadMod(modId, resolve)
    {
        if(modId === 'KLib'){ modId = 'SatisfactoryPlus'; }

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
                            this.itemsData[item] = data.Items[item];
                        }
                    }
                    if(data.Tools !== undefined)
                    {
                        for(let tool in data.Tools)
                        {
                            this.toolsData[tool] = data.Tools[tool];
                        }
                    }
                    if(data.Recipes !== undefined)
                    {
                        for(let recipe in data.Recipes)
                        {
                            if(this.recipesData[recipe] !== undefined && this.recipesData[recipe].className !== data.Recipes[recipe].className)
                            {
                                this.recipesData[modId + '|#|' + recipe] = data.Recipes[recipe];
                            }
                            else
                            {
                                this.recipesData[recipe] = data.Recipes[recipe];
                            }
                        }
                    }
                    if(data.Schematics !== undefined)
                    {
                        for(let schematic in data.Schematics)
                        {
                            this.schematicsData[schematic] = data.Schematics[schematic];
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
        return new Promise(function(resolve){
            $('#loaderProgressBar .progress-bar').css('width', '50%');
            $('.loader h6').html(translate('MAP\\LOADER\\Loading detailed models...'));
            setTimeout(resolve, 50);
        }.bind(this)).then(() => {
            $.getJSON(this.staticUrl + '/js/InteractiveMap/build/detailedModels.json?v=' + this.scriptVersion, function(data)
            {
                for(let className in data)
                {
                    this.detailedModels[className] = data[className];

                    // Special case
                    if(className === '/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C')
                    {
                        this.detailedModels['/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C']         = JSON.parse(JSON.stringify(data[className]));
                        this.detailedModels['/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].scale   = 2.3;
                    }
                }

                this.renderObjects();
            }.bind(this));
        });
    }

    renderObjects()
    {
        // Switch some collectables to 0 opacity
        for(let pathName in this.satisfactoryMap.collectableMarkers)
        {
            if(['sporeFlowers', 'smallRocks', 'largeRocks'].includes(this.satisfactoryMap.collectableMarkers[pathName].options.layerId))
            {
                this.satisfactoryMap.collectableMarkers[pathName].removeFrom(
                    this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[pathName].options.layerId]
                );
            }
        }

        return new Promise(function(resolve){
            let header                  = this.saveGameParser.getHeader();
            let pad                     = function(num, size) { return ('000' + num).slice(size * -1); },
                time                    = parseFloat(header.playDurationSeconds).toFixed(3),
                hours                   = Math.floor(time / 60 / 60),
                minutes                 = Math.floor(time / 60) % 60,
                seconds                 = Math.floor(time - minutes * 60);

                $('#saveGameInformation').html('<strong>' + header.sessionName + '</strong> <em><small>(' + hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's)</small></em>');

            $('#loaderProgressBar .progress-bar').css('width', '50%');
            $('.loader h6').html(translate('MAP\\LOADER\\Rendering objects (%1$s%)...', 0));
            console.time('renderObjects');
            setTimeout(resolve, 50);
        }.bind(this)).then(() => {
            this.parsingObjects = this.parseObjects();
        });
    }

    parseObjects(i = 0, objectsKeys = null)
    {
        if(objectsKeys === null)
        {
            let objects             = this.saveGameParser.getObjects();
                objectsKeys         = Object.keys(objects);

                // Performance warning!!!
                if(objectsKeys.length > 500000)  { this.mapModelsQuality   = 'medium'; }
                if(objectsKeys.length > 750000)  { this.showPatterns       = false; }
                if(objectsKeys.length > 1000000) { this.mapModelsQuality   = 'low'; }
        }

        let countObjects            = objectsKeys.length;
        let parseObjectsProgress    = Math.round(i / countObjects * 100);
        let promises                = [];

        for(i; i < countObjects; i++)
        {
            let currentObject = this.saveGameParser.getTargetObject(objectsKeys[i]);
                if(currentObject === null)
                {
                    continue;
                }

            // Add menu to nodes and collectables...
            if([
                '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C',
                '/Game/FactoryGame/Resource/BP_FrackingSatellite.BP_FrackingSatellite_C',
                '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C',

                '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C',

                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal.BP_Crystal_C',
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk2.BP_Crystal_mk2_C',
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk3.BP_Crystal_mk3_C',

                '/Game/FactoryGame/Prototype/WAT/BP_WAT1.BP_WAT1_C',
                '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C',

                '/Game/FactoryGame/World/Hazard/SporeCloudPlant/BP_SporeFlower.BP_SporeFlower_C',
                '/Game/FactoryGame/Equipment/C4Dispenser/BP_DestructibleSmallRock.BP_DestructibleSmallRock_C',
                '/Game/FactoryGame/Equipment/C4Dispenser/BP_DestructibleLargeRock.BP_DestructibleLargeRock_C'
            ].includes(currentObject.className))
            {
                //console.log(this.satisfactoryMap.collectableMarkers);
                if(this.satisfactoryMap.collectableMarkers[currentObject.pathName] !== undefined)
                {
                    this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.pathName = currentObject.pathName;
                    this.satisfactoryMap.collectableMarkers[currentObject.pathName].bindContextMenu(this);

                    if(['sporeFlowers', 'smallRocks', 'largeRocks'].includes(this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId))
                    {
                        let mHasBeenFractured = this.getObjectProperty(currentObject, 'mHasBeenFractured');
                            if(mHasBeenFractured === null || this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId === 'sporeFlowers')
                            {
                                this.satisfactoryMap.collectableMarkers[currentObject.pathName].addTo(
                                    this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId]
                                );
                            }
                            else
                            {
                                let layerId         = this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId;
                                let dataCollected   = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected')) + 1;
                                let dataTotal       = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-total'));

                                $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);
                                $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(this.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.language).format(dataTotal));
                            }
                    }
                }

                if(currentObject.className !== '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                {
                    continue;
                }
                else
                {
                    let haveDropPod = this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId].hasLayer(this.satisfactoryMap.collectableMarkers[currentObject.pathName]);
                        if(haveDropPod === false)
                        {
                            this.satisfactoryMap.collectableMarkers[currentObject.pathName].addTo(
                                this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId]
                            );
                        }
                }
            }

            // Mod nodes
            if([
                '/RefinedPower/World/ResourceNodes/Element65/BP_Element65_Impure.BP_Element65_Impure_C',
                '/RefinedPower/World/ResourceNodes/Element65/BP_Element65_Normal.BP_Element65_Normal_C',
                '/RefinedPower/World/ResourceNodes/Element65/BP_Element65_Pure.BP_Element65_Pure_C'
            ].includes(currentObject.className))
            {
                if(this.satisfactoryMap.collectableMarkers[currentObject.pathName] === undefined)
                {
                    $('#mods_resource_nodes').show();

                    let layoutId    = currentObject.className.split('.').pop();
                        if(this.satisfactoryMap.availableLayers[layoutId] === undefined)
                        {
                            this.satisfactoryMap.availableLayers[layoutId] = L.layerGroup();
                        }

                    let button      = $('.updateLayerState[data-id="' + layoutId + '"]');
                        button.attr('data-total', parseInt(button.attr('data-total')) + 1);
                        button.find('.badge').html(new Intl.NumberFormat(this.language).format(parseInt(button.attr('data-total'))));
                        button.parent().parent().show();

                    let currentMarkerOptions    = {
                            pathName: currentObject.pathName,
                            icon: this.getMarkerIcon(button.attr('data-outside'), button.attr('data-inside'), button.attr('data-image')),
                            riseOnHover: true,
                            zIndexOffset: 1000
                        };
                    let tooltip                 = '<div class="d-flex" style="border: 25px solid #7f7f7f;border-image: url(' + this.staticUrl + '/js/InteractiveMap/img/genericTooltipBackground.png) 25 repeat;background: #7f7f7f;margin: -7px;color: #FFFFFF;text-shadow: 1px 1px 1px #000000;line-height: 16px;font-size: 12px;">\
                                                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                                                        ' + ((button.attr('data-original-title') !== undefined) ? button.attr('data-original-title') : button.attr('title')) + '\
                                                    </div>\
                                                </div>';
                    let currentMarker           = L.marker(this.satisfactoryMap.unproject(currentObject.transform.translation), currentMarkerOptions)
                                                    .bindTooltip(tooltip)
                                                    .addTo(this.satisfactoryMap.availableLayers[layoutId]);

                        this.satisfactoryMap.collectableMarkers[currentObject.pathName]                     = currentMarker;
                        this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId     = layoutId;
                        this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.pathName    = currentObject.pathName;
                }

                this.satisfactoryMap.collectableMarkers[currentObject.pathName].bindContextMenu(this);

                continue;
            }



            if(currentObject.className === '/Script/FactoryGame.FGPipeNetwork')
            {
                let mPipeNetworkID = this.getObjectProperty(currentObject, 'mPipeNetworkID');
                    if(mPipeNetworkID !== null)
                    {
                        this.saveGamePipeNetworks[mPipeNetworkID] = currentObject.pathName;
                    }
                    else
                    {
                        // IF the mPipeNetworkID don't exists, try to find it from one of the children
                        let mFluidIntegrantScriptInterfaces = this.getObjectProperty(currentObject, 'mFluidIntegrantScriptInterfaces');
                            mFluidIntegrantScriptInterfacesLoop:
                            for(let j = 0; j < mFluidIntegrantScriptInterfaces.values.length; j++)
                            {
                                let currentInterface = this.saveGameParser.getTargetObject(mFluidIntegrantScriptInterfaces.values[j].pathName);
                                    if(currentInterface !== null && currentInterface.children !== undefined)
                                    {
                                        for(let k = 0; k < currentInterface.children.length; k++)
                                        {
                                            let currentInterfaceChildren    = this.saveGameParser.getTargetObject(currentInterface.children[k].pathName);
                                                mPipeNetworkID              = this.getObjectProperty(currentInterfaceChildren, 'mPipeNetworkID');
                                                if(mPipeNetworkID !== null)
                                                {
                                                    this.saveGamePipeNetworks[mPipeNetworkID] = currentObject.pathName;
                                                    break mFluidIntegrantScriptInterfacesLoop;
                                                }
                                        }
                                    }
                            }
                    }

                continue;
            }

            if(currentObject.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C')
            {
                this.gameMode.push(currentObject);
                continue;
            }
            if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C')
            {
                //console.log('BP_PlayerState_C', currentObject);
                this.players[currentObject.pathName] = new SubSystem_Player({baseLayout: this, player: currentObject});
                continue;
            }
            if(currentObject.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
            {
                let mTetrominoLeaderBoard = this.getObjectProperty(currentObject, 'mTetrominoLeaderBoard');
                    if(mTetrominoLeaderBoard !== null)
                    {
                        for(let j = 0; j < mTetrominoLeaderBoard.values.length; j++)
                        {
                            let playerName  = null;
                            let level       = null;
                            let score       = null;
                                for(let k = 0; k < mTetrominoLeaderBoard.values[j].length; k++)
                                {
                                    switch(mTetrominoLeaderBoard.values[j][k].name)
                                    {
                                        case 'PlayerName':
                                            playerName = mTetrominoLeaderBoard.values[j][k].value;
                                            break;
                                        case 'LevelName':
                                            level = mTetrominoLeaderBoard.values[j][k].value.replace('LVL', '');
                                            break;
                                        case 'Points':
                                            score = mTetrominoLeaderBoard.values[j][k].value;
                                            break;
                                    }
                                }
                                if(playerName !== null && level !== null && score !== null)
                                {
                                    $.post(this.tetrominoUrl, {playerName: playerName, level: level, score: score});
                                }
                        }
                    }
            }

            if(currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C')
            {
                this.addResourceDeposit(currentObject);
                continue;
            }
            if(currentObject.className.startsWith('/Game/FactoryGame/Resource/Environment/AnimalParts/BP_'))
            {
                this.addAnimalParts(currentObject);
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

            if([
                '/RefinedPower/World/ResourceNodes/WaterTurbine/BP_WaterTurbineNode_Medium.BP_WaterTurbineNode_Medium_C',
                '/RefinedPower/World/ResourceNodes/WaterTurbine/BP_WaterTurbineNode_Fast.BP_WaterTurbineNode_Fast_C'
            ].includes(currentObject.className))
            {
                continue; // Too much so skip...
            }

            // Skip
            if([
                '/Game/FactoryGame/Buildable/Factory/TradingPost/BP_StartingPod.BP_StartingPod_C',
                '/Game/FactoryGame/Character/Player/Char_Player.Char_Player_C',
                '/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole.Build_SignPole_C',

                '/Game/FactoryGame/Schematics/Progression/BP_SchematicManager.BP_SchematicManager_C',
                '/Game/FactoryGame/Recipes/Research/BP_ResearchManager.BP_ResearchManager_C',
                '/Game/FactoryGame/Unlocks/BP_UnlockSubsystem.BP_UnlockSubsystem_C',
                '/Game/FactoryGame/Events/BP_EventSubsystem.BP_EventSubsystem_C',

                '/Game/FactoryGame/Schematics/Progression/BP_GamePhaseManager.BP_GamePhaseManager_C',

                '/Game/FactoryGame/Buildable/Factory/PipeHyper/FGPipeConnectionComponentHyper.FGPipeConnectionComponentHyper_C',

                '/Game/FactoryGame/Resource/BP_FrackingCore.BP_FrackingCore_C',
                '/Game/FactoryGame/Character/Creature/BP_CreatureSpawner.BP_CreatureSpawner_C',

                // HUB PARTS
                '/Game/FactoryGame/Buildable/Factory/WorkBench/Build_WorkBenchIntegrated.Build_WorkBenchIntegrated_C',
                '/Game/FactoryGame/Buildable/Factory/Mam/Build_MamIntegrated.Build_MamIntegrated_C',
                '/Game/FactoryGame/Buildable/Factory/HubTerminal/Build_HubTerminal.Build_HubTerminal_C',
                '/Game/FactoryGame/Prototype/TetrominoRecipeDesigner/Build_TetrominoGame_Computer.Build_TetrominoGame_Computer_C',

                '/Game/FactoryGame/Buildable/Vehicle/BP_VehicleTargetPoint.BP_VehicleTargetPoint_C',

                // MODS
                '/Game/EfficiencyCheckerMod/Buildings/EfficiencyChecker/Build_Pipeline_Stub.Build_Pipeline_Stub_C'
            ].includes(currentObject.className))
            {
                continue;
            }

            // Fix some save/games bugs and/or old object conversion
            currentObject = SaveParser_FicsIt.callADA(this, currentObject);
                if(currentObject === null)
                {
                    continue;
                }

            /*
            '/Script/FactoryGame.FGInventoryComponent',
            '/Script/FactoryGame.FGInventoryComponentEquipment',
            '/Script/FactoryGame.FGInventoryComponentTrash',
            '/Script/FactoryGame.FGPowerInfoComponent',
            '/Script/FactoryGame.FGRecipeShortcut',
            '/Script/FactoryGame.FGHealthComponent',
             */
            if(
                    currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C'
                 || (currentObject.className.startsWith('/Script/FactoryGame.') && currentObject.className !== '/Script/FactoryGame.FGItemPickup_Spawnable')
                 || currentObject.className.startsWith('/Game/FactoryGame/-Shared/Blueprint/BP_')
            )
            {
                continue;
            }

            // Update extracted core availability to get satellite status
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/FrackingSmasher/Build_FrackingSmasher.Build_FrackingSmasher_C')
            {
                let mExtractableResource = this.getObjectProperty(currentObject, 'mExtractableResource');
                    if(mExtractableResource !== null)
                    {
                        this.frackingSmasherCores[mExtractableResource.pathName] = currentObject.pathName;
                    }
            }

            promises.push(new Promise(function(resolve){
                this.parseObject(currentObject, resolve);
            }.bind(this)));

            // Wait for promise to complete before launching next batch!
            let progress    = Math.round(i / countObjects * 100);
                if(progress > parseObjectsProgress)
                {
                    return Promise.all(promises).then(() => {
                        $('#loaderProgressBar .progress-bar').css('width', (50 + progress * 0.4) + '%');
                        $('.loader h6').html(translate('MAP\\LOADER\\Rendering objects (%1$s%)...', progress));

                        setTimeout(() => {
                            this.parseObjects((i + 1), objectsKeys);
                        }, 5);
                    });
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
        if(currentObject === null)
        {
            if(resolve === false)
            {
                return;
            }
            return resolve();
        }

        if(currentObject.className.startsWith('/Game/FactoryGame/') === false)
        {
            for(let modId in this.modsData)
            {
                if(currentObject.className.startsWith('/' + modId + '/') === true || currentObject.className.startsWith('/Game/' + modId + '/') === true || (currentObject.className.startsWith('/KLib/') === true) && modId === 'SatisfactoryPlus') //TODO: Add mods multiple references...
                {
                    if(this.modsData[modId].queuedPathName === undefined)
                    {
                        this.modsData[modId].queuedPathName = [];
                    }

                    if(this.modsData[modId].queuedPathName.includes(currentObject.pathName) === false)
                    {
                        this.modsData[modId].queuedPathName.push(currentObject.pathName);

                        return this.loadMod(modId, () => {
                            return this.parseObject(currentObject, resolve, skipMod);
                        });
                    }
                }
            }

            //TODO: Sentry new mod?
        }

        // Needed when moving players
        if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C' && this.players[currentObject.pathName] !== undefined)
        {
            let playerState = this.players[currentObject.pathName].addMarker();
                if(resolve === false)
                {
                    return {layer: 'playerPositionLayer', marker: playerState};
                }

            return resolve();
        }

        // Skip on pasting
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole.Build_SignPole_C')
        {
            if(resolve === false)
            {
                return;
            }
            return resolve();
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

        if(currentObject.className === '/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C' || currentObject.className === '/CrashSiteBeacons/BP_Beacon_Child.BP_Beacon_Child_C')
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
            this.railroadSubSystem.railroadSwitchControls.push(currentObject.pathName);
        }

        if([
            '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C',
            '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C',
            // MODS
            '/FlexSplines/PowerLine/Build_FlexPowerline.Build_FlexPowerline_C',
            '/AB_CableMod/Visuals1/Build_AB-PLCopper.Build_AB-PLCopper_C',
            '/AB_CableMod/Visuals1/Build_AB-PLCaterium.Build_AB-PLCaterium_C',
            '/AB_CableMod/Visuals3/Build_AB-PLHeavy.Build_AB-PLHeavy_C',
            '/AB_CableMod/Visuals4/Build_AB-SPLight.Build_AB-SPLight_C',
            '/AB_CableMod/Visuals3/Build_AB-PLPaintable.Build_AB-PLPaintable_C'
        ].includes(currentObject.className))
        {
            let building = this.addPlayerPowerLine(currentObject);
                if(resolve === false)
                {
                    return {layer: 'playerPowerGridLayer', marker: building};
                }

            return resolve();
        }

        if(
             // Pipes
                currentObject.className === '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C'
             || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C'
             || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipeHyper/Build_PipeHyper.Build_PipeHyper_C'
             // Pipe Mods
             || currentObject.className === '/Game/InfiniteLogistics/Buildable/InfinitePipeHyper/Build_InfinitePipeHyper.Build_InfinitePipeHyper_C'
             || currentObject.className === '/Game/InfiniteLogistics/Buildable/InfinitePipeline/Build_InfinitePipeline.Build_InfinitePipeline_C'
             // Belts
             || currentObject.className.includes('/Build_ConveyorBeltMk')
             // Belts Mod
             || (currentObject.className.startsWith('/CoveredConveyor') && currentObject.className.includes('lift') === false)
             || currentObject.className.startsWith('/Game/Conveyors_Mod/Build_BeltMk')
             || currentObject.className.startsWith('/UltraFastLogistics/Buildable/build_conveyorbeltMK')
             || currentObject.className.startsWith('/FlexSplines/Conveyor/Build_Belt')
        )
        {
            let building = this.addPlayerBelt(currentObject);
                if(resolve === false && building !== false)
                {
                    return building;
                }

            return resolve();
        }
        if(currentObject.className.includes('Train/Track/Build_RailroadTrack') || currentObject.className === '/FlexSplines/Track/Build_Track.Build_Track_C')
        {
            let building = this.addPlayerTrack(currentObject);
                if(resolve === false)
                {
                    return {layer: 'playerTracksLayer', marker: building};
                }

            return resolve();
        }

        // Add fauna
        if(currentObject.className.includes('/Game/FactoryGame/Character/Creature/Wildlife/') || currentObject.className.includes('/Game/FactoryGame/Character/Creature/Enemy/'))
        {
            let building = this.addPlayerFauna(currentObject);
                if(resolve === false)
                {
                    return building;
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
                if(currentObject.className.indexOf('Build_') !== -1 || currentObject.className.startsWith('/CoveredConveyor'))
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
                    if(
                           this.useDebug === true
                        && currentObject.className.startsWith('/Game/FactoryGame/Equipment/') === false
                        && currentObject.className.startsWith('/Script/FactoryGame.') === false
                        && ['/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C', '/Script/FactoryGame.FGTrainStationIdentifier', '/Script/FactoryGame.FGTrain'].includes(currentObject.className) === false
                    )
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
                                $('.loader h6').html(translate('MAP\\LOADER\\Adding map layers (%1$s)...', $('.updatePlayerLayerState[data-id=' + layerId + ']').attr('title')));
                                setTimeout(resolve, 5);
                            }.bind(this)).then(() => {
                                this.addLayers((i + 1));
                            });
                    }
            }

        console.timeEnd('addMapLayers');

        return new Promise(function(resolve){
            $('#loaderProgressBar .progress-bar').css('width', '100%');
            $('.loader h6').html(translate('MAP\\LOADER\\Finalization of statistics and controls...'));
            setTimeout(resolve, 25);
        }.bind(this)).then(() => {
            // Altitude slider
            this.altitudeSliderControl = L.control.sliderControl({
                baseLayout  : this,
                minAltitude : Math.floor(this.minAltitude),
                maxAltitude : Math.ceil(this.maxAltitude)
            });
            this.satisfactoryMap.leafletMap.addControl(this.altitudeSliderControl);
            this.altitudeSliderControl.startSlider();

            // Collectables
            let statisticsCollectables = new Modal_Map_Collectables({baseLayout: this});
                statisticsCollectables.get();

            // Player position
            for(let pathName in this.players)
            {
                this.players[pathName].addMarker();
            }

            // Global modals
            $('#statisticsModal').on('show.bs.modal', () => {
                $('#statisticsModal a.nav-link[href="#statisticsModalProduction"]').removeClass('active').click();
            });

            // Reset all statistics tabs on close...
            $('#statisticsModal').on('hide.bs.modal', () => {
                $('#statisticsModal .tab-content .tab-pane').html('');
            });
            // Swicth statistics tabs
            $('#statisticsModal a[data-toggle="tab"]').on('shown.bs.tab', function(e){
                let newTab = $(e.target).attr('href');

                    switch(newTab)
                    {
                        case '#statisticsModalProduction':
                            if($('#statisticsModalProduction').html() === '')
                            {
                                let statisticsProduction = new Modal_Statistics_Production({baseLayout: this});
                                    $('#statisticsModalProduction').html(statisticsProduction.parse());
                            }
                            break;
                        case '#statisticsModalStorage':
                            if($('#statisticsModalStorage').html() === '')
                            {
                                let statisticsStorage = new Modal_Statistics_Storage({baseLayout: this});
                                    $('#statisticsModalStorage').html(statisticsStorage.parse());
                            }
                            break;
                        case '#statisticsModalConsumables':
                            if($('#statisticsModalConsumables').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalConsumables').html(statisticsGame.parseConsumables());
                            }
                            break;
                        case '#statisticsModalCreatures':
                            if($('#statisticsModalCreatures').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalCreatures').html(statisticsGame.parseCreatures());
                            }
                            break;
                        case '#statisticsModalCrafting':
                            if($('#statisticsModalCrafting').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalCrafting').html(statisticsGame.parseCrafting());
                            }
                            break;
                        case '#statisticsModalBuilt':
                            if($('#statisticsModalBuilt').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalBuilt').html(statisticsGame.parseBuilt());
                            }
                            break;
                        case '#statisticsModalPartsUsed':
                            if($('#statisticsModalPartsUsed').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalPartsUsed').html(statisticsGame.parsePartsUsed());
                            }
                            break;
                    }
            }.bind(this));
            $('#researchModal').on('show.bs.modal', () => {
                let statisticsSchematics = new Modal_Schematics({
                        baseLayout      : this
                    });
                    statisticsSchematics.parseSchematics();
                    statisticsSchematics.parseAlternateRecipes();
                    statisticsSchematics.parseMAM();
                    statisticsSchematics.parseAwesomeSink();
                    statisticsSchematics.parseSpecial();
            });
            $('#colorSlotsModal').on('click', () => {
                let colorSlots = new Modal_ColorSlots({baseLayout: this});
                    colorSlots.parse();
            });
            $('#lightSlotsModal').on('click', () => {
                let lightColorSlots = new Modal_LightColorSlots({baseLayout: this});
                    lightColorSlots.parse();
            });
            $('#modalPowerCircuits').on('click', () => {
                let modalPowerCircuits = new Modal_PowerCircuits({
                        baseLayout      : this
                    });
                    modalPowerCircuits.parse();
            });

            $('#optionsModal a[data-toggle="tab"]').on('shown.bs.tab', function(e){
                let target = $(e.target).attr('href');
                    switch(target)
                    {
                        case '#statisticsPlayerInventory':
                            let mapPlayers = new Modal_Map_Players({baseLayout: this});
                                mapPlayers.parse();
                            break;
                        case '#statisticsPlayerHotBars':
                            let mapHotbars = new Modal_Map_Hotbars({baseLayout: this});
                                mapHotbars.parse();
                            break;
                        case '#statisticsModalCollectables':
                            let statisticsCollectables = new Modal_Map_Collectables({baseLayout: this});
                                statisticsCollectables.parse();
                            break;
                        case '#statisticsPlayerPresets':
                            let statisticsPresets = new Modal_Map_Presets({baseLayout: this});
                                statisticsPresets.parse();
                            break;
                        case '#statisticsModalOptions':
                            let mapOptions = new Modal_Map_Options({baseLayout: this});
                                mapOptions.parse();
                            break;
                    }
            }.bind(this))
            $('#optionsModal').on('show.bs.modal', () => {
                $('#optionsModal a.active[data-toggle="tab"]').trigger('shown.bs.tab');
            });

            $('#buildingsModal').on('show.bs.modal', () => {
                let modalBuildings = new Modal_Buildings({
                        baseLayout      : this
                    });
                    modalBuildings.parse();
            });
            $('#trainsModal').on('show.bs.modal', () => {
                let modalTrains = new Modal_Trains({
                        baseLayout      : this
                    });
                    modalTrains.parse();
            });

            $('#buildingsButton').show();
            $('#trainsButton').show();
            $('#statisticsButton').show();
            $('#researchButton').show();
            $('#optionsButton').show();

            // Delay radioactivity to avoid canvas error when map isn't fully loaded...
            setTimeout(() => {
                this.updateRadioactivityLayer();
            }, 1000);

            this.history = new BaseLayout_History({
                baseLayout      : this
            });

            // End...
            window.SCIM.hideLoader();

            $('.updateTitleLayerState').css('cursor', 'pointer').on('click', function(e){
                $(e.currentTarget).closest('div[id]').find('.updatePlayerLayerState').each(function(index, element){
                    this.updatePlayerLayerState($(element), $(element).attr('data-id'));
                }.bind(this));
            }.bind(this));
            $('.updatePlayerLayerState').on('click', function(e){
                this.updatePlayerLayerState($(e.currentTarget), $(e.currentTarget).attr('data-id'));
            }.bind(this));
            $('.updatePlayerLayerFilter').on('click', function(e){
                e.stopPropagation(); // Prevent update layer state...
                this.updatePlayerLayerFilter($(e.currentTarget), $(e.currentTarget).attr('data-id'), $(e.currentTarget).attr('data-filter'));
            }.bind(this));

            // Add download event
            $('#downloadSaveGame').on('click', () => {
                window.SCIM.showLoader();
                $('.loader h6').html('Saving...');

                // Clean subsystems...
                let circuitSubSystem    = new SubSystem_Circuit({baseLayout: this});
                    circuitSubSystem.cleanCircuits();

                // Save...
                this.saveGameParser.save(this);
            });

            // Clipboard control
            this.clipboardControl = new L.Control.ClipboardControl({baseLayout: this});
            this.satisfactoryMap.leafletMap.addControl(this.clipboardControl);

            // Selection control
            this.selectionControl = new L.Control.Selection({baseLayout: this});
            this.satisfactoryMap.leafletMap.addControl(this.selectionControl);
        });
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

        if(this.playerLayersNotUsingAltitude.includes(layerId) === false && element.options.pathName !== undefined)
        {
            let currentObject = this.saveGameParser.getTargetObject(element.options.pathName);
                if(currentObject !== null)
                {
                    this.minAltitude = Math.min(this.minAltitude, Math.floor(currentObject.transform.translation[2]));
                    this.maxAltitude = Math.max(this.maxAltitude, Math.ceil(currentObject.transform.translation[2]));

                    if(updateAltitudeSlider === true)
                    {
                        this.altitudeSliderControl.updateSliderAltitudes(this.minAltitude, this.maxAltitude);
                    }
                }
        }

        if(element.options.extraPattern !== undefined)
        {
            element.options.extraPattern.addTo(this.playerLayers[layerId].subLayer);
        }
        if(element.options.extraMarker !== undefined)
        {
            element.options.extraMarker.addTo(this.playerLayers[layerId].subLayer);
        }
    }

    addPlayerFauna(currentObject)
    {
        let layerId     = 'playerFaunaLayer';
        let iconColor   = '#b34848';
        let iconImage   = this.staticUrl + '/img/mapMonstersIcon.png';

        let faunaData   = this.getFaunaDataFromClassName(currentObject.className);
            if(faunaData !== null)
            {
                iconColor   = faunaData.mapColor;
                iconImage   = faunaData.image;
                layerId     = faunaData.mapLayer;

                if(currentObject.className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
                {
                    let isSpaceRabbitPersistent = this.getObjectProperty(currentObject, 'mIsPersistent');
                        if(isSpaceRabbitPersistent !== null)
                        {
                            iconColor = '#b3ffb3';
                            this.playerLayers[layerId].count++;
                        }
                }
            }

        let faunaMarker = L.marker(
                this.satisfactoryMap.unproject(currentObject.transform.translation),
                {
                    pathName: currentObject.pathName,
                    icon: this.getMarkerIcon('#FFFFFF', iconColor, iconImage),
                    riseOnHover: true,
                    zIndexOffset: 900
                }
            );

        this.setupSubLayer(layerId);
        this.autoBindTooltip(faunaMarker);
        faunaMarker.bindContextMenu(this);
        this.playerLayers[layerId].elements.push(faunaMarker);

        if(this.playerLayers[layerId].filtersCount !== undefined)
        {
            if(this.playerLayers[layerId].filtersCount[currentObject.className] === undefined)
            {
                this.playerLayers[layerId].filtersCount[currentObject.className] = 0;
            }
            this.playerLayers[layerId].filtersCount[currentObject.className]++;
        }

        return {layer: layerId, marker: faunaMarker};
    }

    deleteFauna(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let layerId         = 'playerFaunaLayer';

        let faunaData       = baseLayout.getFaunaDataFromClassName(currentObject.className);
            if(faunaData !== null)
            {
                layerId = faunaData.mapLayer;

                if(currentObject.className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
                {
                    let isSpaceRabbitPersistent = baseLayout.getObjectProperty(currentObject, 'mIsPersistent');
                        if(isSpaceRabbitPersistent !== null)
                        {
                            baseLayout.playerLayers.playerCratesLayer.count--;
                        }
                }
            }

        baseLayout.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
        baseLayout.deleteMarkerFromElements(layerId, marker.relatedTarget);
        baseLayout.setBadgeLayerCount(layerId);
    }

    addResourceDeposit(currentObject)
    {
        let layerId                     = 'playerResourceDepositsLayer';
        let mResourcesLeft              = this.getObjectProperty(currentObject, 'mResourcesLeft');
        let mIsEmptied                  = this.getObjectProperty(currentObject, 'mIsEmptied');

            if(mIsEmptied === null && mResourcesLeft !== null)
            {
                let itemId = this.getItemIdFromDepositTableIndex(currentObject);
                    if(itemId !== null)
                    {
                        this.setupSubLayer(layerId, false);

                        let position    = this.satisfactoryMap.unproject(currentObject.transform.translation);
                        let iconType    = layerId + itemId;
                            if(this.satisfactoryMap.availableIcons[iconType] === undefined)
                            {
                                if(this.itemsData[itemId] !== undefined)
                                {
                                    this.satisfactoryMap.availableIcons[iconType] = L.divIcon({
                                        className   : "leaflet-data-marker",
                                        html        : this.satisfactoryMap.availableIcons[layerId].options.html.replace(this.itemsData.Desc_OreIron_C.image, this.itemsData[itemId].image),
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

                        this.playerLayers[layerId].elements.push(depositMarker);

                        if(this.playerLayers[layerId].filtersCount !== undefined)
                        {
                            if(this.playerLayers[layerId].filtersCount[itemId] === undefined)
                            {
                                this.playerLayers[layerId].filtersCount[itemId] = 0;
                            }
                            this.playerLayers[layerId].filtersCount[itemId]++;
                        }
                    }
            }
    }

    deleteResourceDeposit(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mIsEmptied      = baseLayout.getObjectProperty(currentObject, 'mIsEmptied');

            if(mIsEmptied === null)
            {
                currentObject.properties.push({name: "mIsEmptied", type: "BoolProperty", value: 1});
            }

            baseLayout.deleteObjectProperty(currentObject, 'mResourcesLeft');

        baseLayout.deleteMarkerFromElements('playerResourceDepositsLayer', marker.relatedTarget);
        baseLayout.setBadgeLayerCount('playerResourceDepositsLayer');
    }

    addAnimalParts(currentObject)
    {
        this.setupSubLayer('playerItemsPickupLayer', false);
        let itemId      = 'Desc_SpitterParts_C';
            if(currentObject.className === '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_HogParts.BP_HogParts_C' || currentObject.className === '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaHogParts.BP_AlphaHogParts_C')
            {
                itemId = 'Desc_HogParts_C';
            }
        let iconType    = 'playerItemsPickupLayer' + itemId;

        if(this.satisfactoryMap.availableIcons[iconType] === undefined)
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
        }

        let position    = this.satisfactoryMap.unproject(currentObject.transform.translation);
        let itemMarker  = L.marker(
                position,
                {
                    pathName: currentObject.pathName,
                    itemId: itemId,
                    itemQty: 1,
                    icon: this.satisfactoryMap.availableIcons[iconType], riseOnHover: true
                }
            );
            itemMarker.bindContextMenu(this);
            this.autoBindTooltip(itemMarker);

        this.playerLayers.playerItemsPickupLayer.elements.push(itemMarker);
        itemMarker.addTo(this.playerLayers.playerItemsPickupLayer.subLayer);

        return itemMarker;
    }

    addItemPickup(currentObject)
    {
        let mPickupItems = this.getObjectProperty(currentObject, 'mPickupItems');
            if(mPickupItems !== null && mPickupItems.values[0].value.properties[0] !== null && mPickupItems.values[0].value.properties[0].value > 0)
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
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

            // Game dropped items...
            if(currentObject.className === '/Script/FactoryGame.FGItemPickup_Spawnable')
            {
                let collectable = {pathName: currentObject.pathName};
                    if(currentObject.levelName !== undefined)
                    {
                        collectable.levelName = currentObject.levelName;
                    }
                baseLayout.saveGameParser.collectables.push(collectable);
            }

        baseLayout.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
        baseLayout.deleteMarkerFromElements('playerItemsPickupLayer', marker.relatedTarget);
        baseLayout.setBadgeLayerCount('playerItemsPickupLayer');
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
        let baseLayout = marker.baseLayout;
            baseLayout.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
            baseLayout.deleteMarkerFromElements('playerOrientationLayer', marker.relatedTarget);
            baseLayout.playerLayers.playerOrientationLayer.count--;
            baseLayout.setBadgeLayerCount('playerOrientationLayer');
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
        let baseLayout = marker.baseLayout;
            baseLayout.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
            baseLayout.deleteMarkerFromElements('playerCratesLayer', marker.relatedTarget);
            baseLayout.playerLayers.playerCratesLayer.count--;
            baseLayout.setBadgeLayerCount('playerCratesLayer');
    }

    spawnNewLootCrateNearPlayer()
    {
        let playerPosition  = [0, 0, 0];
        let playerRotation  = [-0, 0, -0.4999995529651642, 0.8660256862640381];

        for(let pathName in this.players)
        {
            // Find target
            let mOwnedPawn  = this.getObjectProperty(this.players[pathName].player, 'mOwnedPawn');
                if(mOwnedPawn !== null)
                {
                    let player = this.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                        if(player !== null)
                        {
                            playerPosition = player.transform.translation;
                            playerRotation = player.transform.rotation;
                        }

                        if(this.players[pathName].isHost())
                        {
                            break; // No need to check further...
                        }
                }
        }

        let cratePathName   = this.generateFastPathName({pathName: 'Persistent_Level:PersistentLevel.BP_Crate_C_XXX'});
        let newLootCrate    = {
            type                : 1,
            className           : "/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C",
            pathName            : cratePathName,
            transform           : {
                rotation            : playerRotation,
                translation         : [
                    playerPosition[0] + (Math.floor(Math.random() * (800 + 1)) - 400),
                    playerPosition[1] + (Math.floor(Math.random() * (800 + 1)) - 400),
                    playerPosition[2] + Math.floor(Math.random() * (400 + 1))
                ]
            },
            children                : [{pathName: cratePathName + ".inventory"}],
            properties              : [{
                name                    : "mInventory",
                type                    : "ObjectProperty",
                value                   : {pathName: cratePathName + ".inventory"}
            }],
            entity                  : {levelName: '', pathName: ''}
        };
        this.saveGameParser.addObject(newLootCrate);

        let newLootCrateInventory = {
            type                    : 0,
            className               : "/Script/FactoryGame.FGInventoryComponent",
            pathName                : cratePathName + ".inventory",
            outerPathName           : cratePathName,
            children                : [],
            properties              : [
                {
                    name                : "mInventoryStacks",
                    type                : "ArrayProperty",
                    value               : {type: "StructProperty", values: []}, // Push items
                    structureName       : "mInventoryStacks",
                    structureType       : "StructProperty",
                    structureSubType    : "InventoryStack"
                },
                {
                    name                : "mArbitrarySlotSizes",
                    type                : "ArrayProperty",
                    index               : 0,
                    value               : {type: "IntProperty", values: []} // Push 0 value for each slot used
                },
                {
                    name                : "mAllowedItemDescriptors",
                    type                : "ArrayProperty",
                    index               : 0,
                    value               : {type: "ObjectProperty", values: [{levelName: "", pathName: ""}]}
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
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = this.getBuildingDataFromClassName(currentObject.className);

        BaseLayout_Modal.form({
            title       : 'Pivot "' + buildingData.name + '" from the top-left corner',
            container   : '#leafletMap',
            inputs      : [
                {
                    label       : 'Angle (Between -180° and 180°)',
                    name        : 'angle',
                    inputType   : 'number',
                    min         : -180,
                    max         : 180,
                    value       : 0,
                }
            ],
            callback: function(form)
            {
                if(form !== null && form.angle !== null)
                {
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
                }
            }.bind(this)
        });
    }

    refreshMarkerPosition(properties)
    {
        let refreshSliderBoundaries     = (properties.transform.translation[2] !== properties.object.transform.translation[2]);
            properties.object.transform = properties.transform;

        // Delete and add again!
        let result                      = this.parseObject(properties.object);
            this.deleteMarkerFromElements(result.layer, properties.marker);

            if(result.marker.options.haloMarker !== undefined)
            {
                this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(result.marker.options.haloMarker);
            }

            this.addElementToLayer(result.layer, result.marker, refreshSliderBoundaries);

            if(properties.object.children !== undefined)
            {
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
            }

        return;
    }

    teleportPlayer(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let newTransform    = JSON.parse(JSON.stringify(currentObject.transform));

        let selectOptions   = [];
            for(let pathName in this.players)
            {
                selectOptions.push({
                    text    : this.players[pathName].getDisplayName(),
                    value   : pathName
                });
            }

            if(selectOptions.length === 1) // Don't ask if there is only one player on the map...
            {
                return this.players[selectOptions[0].value].teleportTo(newTransform);
            }

        BaseLayout_Modal.form({
            title       : "Teleport player",
            container   : '#leafletMap',
            inputs      : [
                {
                    name            : 'playerPathName',
                    inputType       : 'select',
                    inputOptions    : selectOptions
                }
            ],
            callback    : function(form)
            {
                if(form !== null && form.playerPathName !== null)
                {
                    return this.players[form.playerPathName].teleportTo(newTransform);
                }
            }.bind(this)
        });
    }

    editPlayerStorageBuildingInventory(marker, inventoryProperty = 'mStorageInventory')
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
            {
                inventoryProperty   = 'mInventory';
            }
            if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C')
            {
                let mOwnedPawn = this.players[marker.relatedTarget.options.pathName].getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        inventoryProperty   = 'mInventory';
                        currentObject       = mOwnedPawn;
                    }
            }

        let inventory           = this.getObjectInventory(currentObject, inventoryProperty);
        let inventoryOptions    = [];
        let selectOptions       = this.generateInventoryOptions(currentObject);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);
            if(buildingData === null)
            {
                buildingData            = {};
                buildingData.maxSlot    = inventory.length;

                if(currentObject.className === '/Game/FactoryGame/Character/Player/Char_Player.Char_Player_C')
                {
                    buildingData.name = this.players[marker.relatedTarget.options.pathName].getDisplayName();
                }
            }

        for(let i = 0; i < buildingData.maxSlot; i++)
        {
            let newInventorySlot = {
                label           : '#' + (i + 1),
                name            : 'slot' + (i + 1),
                inputType       : 'inventoryItem',
                inputOptions    : selectOptions
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

        BaseLayout_Modal.form({
            title       : '"<strong>' + buildingData.name + '</strong>" Inventory',
            container   : '#leafletMap',
            inputs      : inventoryOptions,
            callback    : function(values)
            {
                if(values !== null)
                {
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

                                }
                                break;
                            }
                        }

                    delete this.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName];
                    this.radioactivityLayerNeedsUpdate = true;
                    this.getObjectRadioactivity(currentObject, inventoryProperty);
                    this.updateRadioactivityLayer();
                }
            }.bind(this)
        });
    }

    fillPlayerStorageBuildingInventoryModal(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C', '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'].includes(currentObject.className))
            {
                // Buffer only have the fluidBox, the fluid is handled with the pipe network ;)
                return this.fillPlayerStorageBuildingInventory(currentObject, null);
            }

        let selectOptions       = this.generateInventoryOptions(currentObject, false);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

        BaseLayout_Modal.form({
            title       : 'Fill "<strong>' + buildingData.name + '</strong>" Inventory',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'fillWith',
                inputType       : 'selectPicker',
                inputOptions    : selectOptions
            }],
            callback    : function(values)
            {
                if(values !== null)
                {
                    this.fillPlayerStorageBuildingInventory(currentObject, values.fillWith);
                    this.updateRadioactivityLayer();
                }
            }.bind(this)
        });
    }

    fillPlayerStorageBuildingInventory(currentObject, fillWith, inventoryProperty = 'mStorageInventory')
    {
        let stack           =  100;
        let storageObjects  = [currentObject];
            // Switch to freight wagons when locomotive was selected
            if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
            {
                storageObjects = Building_Locomotive.getFreightWagons(this, currentObject);
            }
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
            {
                inventoryProperty   = 'mInventory';
            }

        if(fillWith !== null)
        {
            let currentItem = this.getItemDataFromClassName(fillWith);
                if(currentItem !== null && currentItem.stack !== undefined)
                {
                    stack = currentItem.stack;
                }
        }

        for(let i = 0; i < storageObjects.length; i++)
        {
            let buildingData    = this.getBuildingDataFromClassName(storageObjects[i].className);

            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].includes(currentObject.className))
            {
                if(buildingData !== null && buildingData.maxFluid !== undefined)
                {
                    this.setObjectProperty(storageObjects[i], 'mFluidBox', {type: "FluidBox", value: buildingData.maxFluid / 1000}, 'StructProperty');
                }

                continue;
            }

            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C')
            {
                let storage           = this.getObjectProperty(storageObjects[i], 'mInventory');
                    if(storage !== null)
                    {
                        let storageObject = this.saveGameParser.getTargetObject(storage.pathName);
                            if(storageObject !== null)
                            {
                                let mInventoryStacks = this.getObjectProperty(storageObject, 'mInventoryStacks');
                                    if(mInventoryStacks !== null)
                                    {
                                        let value = mInventoryStacks.values[0][0].value;
                                            if(value.itemName === '')
                                            {
                                                let currentPipeNetwork = this.getObjectPipeNetwork(currentObject);
                                                    if(currentPipeNetwork !== null)
                                                    {
                                                        let mFluidDescriptor = this.getObjectProperty(currentPipeNetwork, 'mFluidDescriptor');
                                                            if(mFluidDescriptor !== null)
                                                            {
                                                                value.itemName = mFluidDescriptor.pathName;
                                                            }
                                                    }
                                            }
                                            if(buildingData !== null && buildingData.maxFluid !== undefined)
                                            {
                                                value.properties = [{name: 'NumItems', type: 'IntProperty', value: buildingData.maxFluid}];
                                            }
                                    }
                            }
                    }

                    continue;
            }

            // Skip fluid Freight Wagon
            if(storageObjects[i].className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
            {
                let storage           = this.getObjectProperty(storageObjects[i], inventoryProperty);
                    if(storage !== null)
                    {
                        let storageObject = this.saveGameParser.getTargetObject(storage.pathName);
                            if(storageObject !== null)
                            {
                                let mAdjustedSizeDiff = this.getObjectProperty(storageObject, 'mAdjustedSizeDiff');
                                    if(mAdjustedSizeDiff !== null && mAdjustedSizeDiff === -31)
                                    {
                                        let mInventoryStacks = this.getObjectProperty(storageObject, 'mInventoryStacks');
                                            if(mInventoryStacks !== null)
                                            {
                                                let value = mInventoryStacks.values[0][0].value;
                                                    if(buildingData !== null && buildingData.maxFluid !== undefined)
                                                    {
                                                        value.properties = [{name: 'NumItems', type: 'IntProperty', value: buildingData.maxFluid}];
                                                    }
                                            }

                                            continue;
                                    }
                            }

                    }
            }

            if(buildingData === null || buildingData.maxSlot === undefined)
            {
                continue;
            }

            let oldInventory    = this.getObjectInventory(storageObjects[i], inventoryProperty, true);
                for(let j = 0; j < oldInventory.properties.length; j++)
                {
                    if(oldInventory.properties[j].name === 'mInventoryStacks')
                    {
                        oldInventory = oldInventory.properties[j].value.values;

                        for(let k = 0; k < buildingData.maxSlot; k++)
                        {
                            if(oldInventory[k] !== undefined)
                            {
                                oldInventory[k][0].value.itemName = fillWith;
                                this.setObjectProperty(oldInventory[k][0].value, 'NumItems', stack, 'IntProperty');
                            }

                        }
                        break;
                    }
                }

                delete this.playerLayers.playerRadioactivityLayer.elements[storageObjects[i].pathName];
                this.radioactivityLayerNeedsUpdate = true;
                this.getObjectRadioactivity(storageObjects[i], inventoryProperty);
        }
    }

    clearPlayerStorageBuildingInventory(marker, inventoryProperty = 'mStorageInventory')
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let storageObjects  = [currentObject];
            // Switch to freight wagons when locomotive was selected
            if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
            {
                storageObjects      = Building_Locomotive.getFreightWagons(this, currentObject);
            }
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
            {
                inventoryProperty   = 'mInventory';
            }
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C')
            {
                inventoryProperty   = 'mInventory';
            }

        for(let i = 0; i < storageObjects.length; i++)
        {
            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].includes(currentObject.className))
            {
                this.setObjectProperty(storageObjects[i], 'mFluidBox', {type: "FluidBox", value: 0}, 'StructProperty');
                continue;
            }

            let oldInventory    = this.getObjectInventory(storageObjects[i], inventoryProperty, true);
                if(oldInventory !== null)
                {
                    for(let j = 0; j < oldInventory.properties.length; j++)
                    {
                        if(oldInventory.properties[j].name === 'mInventoryStacks')
                        {
                            let mInventoryStacks = oldInventory.properties[j].value.values;
                                for(let k = 0; k < mInventoryStacks.length; k++)
                                {
                                    mInventoryStacks[k][0].value.itemName = "";
                                    this.setObjectProperty(mInventoryStacks[k][0].value, 'NumItems', 0, 'IntProperty');
                                }
                            break;
                        }
                    }
                }

                delete this.playerLayers.playerRadioactivityLayer.elements[storageObjects[i].pathName];
                this.radioactivityLayerNeedsUpdate = true;
                this.getObjectRadioactivity(storageObjects[i], inventoryProperty);
        }
    }

    updatePipeNetworkFluid(marker)
    {
        let currentObject               = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let currentObjectPipeNetwork    = this.getObjectPipeNetwork(currentObject);

            if(currentObjectPipeNetwork !== null)
            {
                let currentFluidDescriptor = this.getObjectProperty(currentObjectPipeNetwork, 'mFluidDescriptor');

                BaseLayout_Modal.form({
                    title       : 'Update pipe network fluid',
                    container   : '#leafletMap',
                    inputs      : [{
                        name            : 'mFluidDescriptor',
                        inputType       : 'selectPicker',
                        inputOptions    : this.generateInventoryOptions(currentObject),
                        value           : ((currentFluidDescriptor !== null) ? currentFluidDescriptor.pathName : 'NULL')
                    }],
                    callback    : function(values)
                    {
                        if(values !== null)
                        {
                            if(values.mFluidDescriptor === 'NULL')
                            {
                                this.deleteObjectProperty(currentObjectPipeNetwork, 'mFluidDescriptor');
                            }
                            else
                            {
                                this.setObjectProperty(currentObjectPipeNetwork, 'mFluidDescriptor', {levelName: "", pathName: values.mFluidDescriptor}, 'ObjectProperty');
                            }
                        }
                    }.bind(this)
                });
            }
    }

    getObjectPipeNetwork(currentObject)
    {
        if(currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                let currentChildren = this.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                    if(currentChildren !== null)
                    {
                        let mPipeNetworkID = this.getObjectProperty(currentChildren, 'mPipeNetworkID');
                            if(mPipeNetworkID !== null && this.saveGamePipeNetworks[mPipeNetworkID] !== undefined)
                            {
                                return this.saveGameParser.getTargetObject(this.saveGamePipeNetworks[mPipeNetworkID]);
                            }
                    }
            }
        }

        return null;
    }


    generateInventoryOptions(currentObject, addNULL = true)
    {
        let selectOptions           = [];
        let isFluidInventory        = true;
        let itemsCategories         = JSON.parse(JSON.stringify(this.itemsCategories));
            itemsCategories.statue  = 'Statues';
            itemsCategories.ficsmas = 'FICS*MAS Holiday Event';
            itemsCategories.mods    = 'Modded items';

        if(currentObject !== null)
        {
            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C', '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'].includes(currentObject.className) === false)
            {
                isFluidInventory = false;
                delete itemsCategories.liquid;
                delete itemsCategories.gas;
            }
        }

        for(let category in itemsCategories)
        {
            if(isFluidInventory === true && category !== 'liquid' && category !== 'gas')
            {
                continue;
            }

            let categoryOptions = [];
                for(let i in this.itemsData)
                {
                    if(this.itemsData[i].className !== undefined && this.itemsData[i].className !== null && this.itemsData[i].category === category)
                    {
                        categoryOptions.push({
                            group       : itemsCategories[category],
                            dataContent : '<img src="' + this.itemsData[i].image + '" style="width: 24px;" class="mr-1" /> ' + this.itemsData[i].name,
                            value       : this.itemsData[i].className,
                            text        : this.itemsData[i].name
                        });
                    }
                }
                categoryOptions.sort((a, b) => a.text.localeCompare(b.text));
                selectOptions = selectOptions.concat(categoryOptions);
        }

        if(isFluidInventory === false)
        {
            let toolsOptions = [];
                for(let i in this.toolsData)
                {
                    if(this.toolsData[i].className !== undefined && this.toolsData[i].className !== null)
                    {
                        toolsOptions.push({
                            group       : 'Tools - ' + ((this.toolsData[i].category === 'ficsmas') ? itemsCategories[this.toolsData[i].category] : this.toolsCategories[this.toolsData[i].category]),
                            dataContent : '<img src="' + this.toolsData[i].image + '" style="width: 24px;" class="mr-1" /> ' + this.toolsData[i].name,
                            value       : this.toolsData[i].className,
                            text        : this.toolsData[i].name
                        });
                    }
                }
                toolsOptions.sort((a, b) => a.text.localeCompare(b.text));
                selectOptions = selectOptions.concat(toolsOptions);
        }

        if(addNULL === true)
        {
            selectOptions.unshift({value: 'NULL', text: '-----'});
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

            if(this.playerLayers[layerId].filtersCount !== undefined && currentObject.className.includes('/Build_ConveyorLiftMk') === false)
            {
                if(this.playerLayers[layerId].filtersCount[currentObject.className] === undefined)
                {
                    this.playerLayers[layerId].filtersCount[currentObject.className] = 0;
                }
                this.playerLayers[layerId].filtersCount[currentObject.className]++;
            }

        // Check building options
        let weight          = (buildingData.mapWeight !== undefined) ? buildingData.mapWeight : 1;
        let polygonOptions  = {
            width               : (buildingData.width !== undefined) ? (buildingData.width * 100) : 800,
            length              : (buildingData.length !== undefined) ? (buildingData.length * 100) : 800,
            offset              : (buildingData.mapOffset !== undefined) ? buildingData.mapOffset : 0,
            xShift              : (buildingData.mapShiftX !== undefined) ? buildingData.mapShiftX : 0,
            useOnly2D           : false,
            skipDetailedModel   : false
        };

            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorIntegratedBiomass.Build_GeneratorIntegratedBiomass_C')
            {
                polygonOptions.offset = 500;
            }

        if(buildingData.mapHaveHorizontal !== undefined && buildingData.mapHaveHorizontal === true)
        {
            let objectAngle = BaseLayout_Math.getQuaternionToEuler(currentObject.transform.rotation);
                if(Math.round(BaseLayout_Math.clampEulerAxis(objectAngle.pitch)) === 90 || Math.round(BaseLayout_Math.clampEulerAxis(objectAngle.pitch)) === 270)
                {
                    polygonOptions.width     = (buildingData.height !== undefined) ? (buildingData.height * 100) : 800;
                    polygonOptions.useOnly2D = true;

                    if(currentObject.className.includes('Build_PowerPoleWall_') || currentObject.className.includes('Build_PowerPoleWall_'))
                    {
                        polygonOptions.width                = polygonOptions.length = 60; // Make it square
                        polygonOptions.skipDetailedModel    = true;
                    }
                }
                else
                {
                    // Beam length?
                    //TODO: Calculate length based on proper pitch angle...
                    if(buildingData.category === 'beam' && Math.round(BaseLayout_Math.clampEulerAxis(objectAngle.pitch)) === 0)
                    {
                        let mLength = this.getObjectProperty(currentObject, 'mLength');
                            if(mLength !== null)
                            {
                                polygonOptions.width    = mLength;
                                polygonOptions.xShift   = -mLength / 2;
                            }
                    }
                }
        }

        // Update nodes used by extraction building
        if(buildingData.category === 'extraction' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
        {
            let extractResourceNode     = this.getObjectProperty(currentObject, 'mExtractableResource');
                if(extractResourceNode !== null)
                {
                    if(this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
                    {
                        let nodeLayerId     = this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.layerId;

                        let dataCollected   = parseInt($('.updateLayerState[data-id="' + nodeLayerId + '"]').attr('data-collected')) + 1;
                        let dataTotal       = parseInt($('.updateLayerState[data-id="' + nodeLayerId + '"]').attr('data-total'));

                        // Two nodes...
                        //TODO: Check coordinates...
                        if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode625' || extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode614')
                        {
                            dataCollected++;
                        }

                        if(this.showNodesOnMiners === false)
                        {
                            this.satisfactoryMap.availableLayers[nodeLayerId].removeLayer(this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName]);

                            // Two nodes...
                            //TODO: Check coordinates...
                            if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode625')
                            {
                                this.satisfactoryMap.availableLayers[nodeLayerId].removeLayer(this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode614']);
                            }
                            if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode614')
                            {
                                this.satisfactoryMap.availableLayers[nodeLayerId].removeLayer(this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode625']);
                            }
                        }
                        else
                        {
                            this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].setOpacity(window.SCIM.collectedOpacity);

                            // Two nodes...
                            //TODO: Check coordinates...
                            if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode625')
                            {
                                this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode614'].setOpacity(window.SCIM.collectedOpacity);
                            }
                            if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode614')
                            {
                                this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode625'].setOpacity(window.SCIM.collectedOpacity);
                            }
                        }

                        this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.extractorPathName = currentObject.pathName;

                        $('.updateLayerState[data-id="' + nodeLayerId + '"]').attr('data-collected', dataCollected);
                        $('.updateLayerState[data-id="' + nodeLayerId + '"] > .badge').html(new Intl.NumberFormat(this.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.language).format(dataTotal));
                    }
                }
        }

        // Conveyor Lift
        if(currentObject.className.includes('/Build_ConveyorLiftMk'))
        {
            let mTopTransform = this.getObjectProperty(currentObject, 'mTopTransform');
                if(mTopTransform !== null)
                {
                    polygonOptions.customModel      = 'Build_ConveyorLiftMkXXX__0';
                    polygonOptions.customPolygon    = [[-100,-100],[100,-100],[100,-75],[175,-75],[175,75],[100,75],[100,100],[-100,100]];

                    for(let i = 0; i < mTopTransform.values.length; i++)
                    {
                        // Update polygon based on top rotation
                        if(mTopTransform.values[i].name === 'Rotation')
                        {
                            let topAngle    = Math.round(BaseLayout_Math.getQuaternionToEuler([
                                    mTopTransform.values[i].value.values.a,
                                    mTopTransform.values[i].value.values.b,
                                    mTopTransform.values[i].value.values.c,
                                    mTopTransform.values[i].value.values.d
                                ]).yaw);

                                switch(topAngle)
                                {
                                    case -90:
                                    case 270:
                                        polygonOptions.customModel      = 'Build_ConveyorLiftMkXXX__270';
                                        polygonOptions.customPolygon    = [[-100,-100],[-75,-100],[-75,-175],[75,-175],[75,-100],[100,-100],[100,-75],[175,-75],[175,75],[100,75],[100,100],[-100,100]];
                                        break;
                                    case 180:
                                        polygonOptions.customModel      = 'Build_ConveyorLiftMkXXX__180';
                                        polygonOptions.customPolygon    = [[-175,-75],[-100,-75],[-100,-100],[100,-100],[100,-75],[175,-75],[175,75],[100,75],[100,100],[-100,100],[-100,75],[-175,75]];
                                        break;
                                    case 90:
                                        polygonOptions.customModel      = 'Build_ConveyorLiftMkXXX__90';
                                        polygonOptions.customPolygon    = [[-100,-100],[-100,100],[-75,100],[-75,175],[75,175],[75,100],[100,100],[100,75],[175,75],[175,-75],[100,-75],[100,-100]];
                                        break;
                                }
                        }
                        // Add distance...
                        if(mTopTransform.values[i].name === 'Translation')
                        {
                            let height      = Math.abs(mTopTransform.values[i].value.values.z) / 100;
                                this.playerLayers[layerId].distance += height;

                                if(this.playerLayers[layerId].filtersCount !== undefined)
                                {
                                    if(this.playerLayers[layerId].filtersCount[currentObject.className] === undefined)
                                    {
                                        this.playerLayers[layerId].filtersCount[currentObject.className] = {distance: 0};
                                    }
                                    this.playerLayers[layerId].filtersCount[currentObject.className].distance += height;
                                }
                        }
                    }
                }
        }

        // Get building radioactivity?
        let inventoriesProperties = ['mInputInventory', 'mOutputInventory', 'mInventory', 'mStorageInventory', 'mFuelInventory'];
            for(let i = 0; i < inventoriesProperties.length; i++)
            {
                this.getObjectRadioactivity(currentObject, inventoriesProperties[i]);
            }

        // Create building instance
        let markerOptions   = {weight: weight};
            if(this.playerLayers[layerId].renderer != undefined)
            {
                markerOptions.renderer = this.playerLayers[layerId].renderer;
            }

        // Add lights halo
        if(buildingData.category === 'light' && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/LightsControlPanel/Build_LightsControlPanel.Build_LightsControlPanel_C' && Building_Light.hasHalo(this, currentObject) === true)
        {
            let coordinates = Building_Light.getHaloCoordinates(this, currentObject);
                markerOptions.haloMarker = L.haloCircle(
                    coordinates,
                    {
                        originPathName  : currentObject.pathName,
                        radius          : Building_Light.getHaloRadius(currentObject),
                        gradient        : Building_Light.getHaloGradient(this, currentObject),
                        interactive     : false
                    }
                );

            this.setupSubLayer('playerLightsHaloLayer');
            this.playerLayers.playerLightsHaloLayer.elements.push(markerOptions.haloMarker);
        }

        // Add vehicle tracks
        if(buildingData.category === 'vehicle')
        {
            let vehicleTrack   = Building_Vehicle.getTrackData(this, currentObject);
                if(vehicleTrack !== null)
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

        // Add pattern
        if(buildingData.category === 'foundation' && this.showPatterns === true && this.detailedModels !== null)
        {
            let currentPattern          = this.buildableSubSystem.getObjectCustomizationData(currentObject, 'PatternDesc');
                if(currentPattern !== null)
                {
                    let currentPatternRotation  = this.buildableSubSystem.getObjectCustomizationData(currentObject, 'PatternRotation');
                        if(currentPatternRotation === null)
                        {
                            currentPatternRotation = {value: {value: 0}};
                        }

                    if(this.detailedModels[currentPattern.value.pathName] !== undefined)
                    {
                        let patternTransform    = JSON.parse(JSON.stringify(currentObject.transform));
                        let patternRotation     = BaseLayout_Math.getQuaternionToEuler(patternTransform.rotation);
                            patternRotation.yaw = BaseLayout_Math.clampEulerAxis(patternRotation.yaw);
                            switch(currentPatternRotation.value.value)
                            {
                                case 1: // 180°
                                    patternRotation.yaw         = BaseLayout_Math.clampEulerAxis(patternRotation.yaw + 180);
                                    patternTransform.rotation   = BaseLayout_Math.getEulerToQuaternion(patternRotation);
                                    break;
                                case 2: // 90°
                                    patternRotation.yaw         = BaseLayout_Math.clampEulerAxis(patternRotation.yaw + 90);
                                    patternTransform.rotation   = BaseLayout_Math.getEulerToQuaternion(patternRotation);
                                    break;
                                case 3: // 0°
                                    break;
                                default: // -90°
                                    patternRotation.yaw         = BaseLayout_Math.clampEulerAxis(patternRotation.yaw - 90);
                                    patternTransform.rotation   = BaseLayout_Math.getEulerToQuaternion(patternRotation);
                                    break;
                            }

                        markerOptions.extraPattern = L.polygon(
                            BaseLayout_Polygon.generateForms(this, patternTransform, currentPattern.value.pathName, {isPattern: true, skipDetailedModel: false}),
                            {
                                weight          : 0,
                                originPathName  : currentObject.pathName,
                                interactive     : false
                            }
                        );
                    }
                    else
                    {
                        console.log('Missing pattern: ' + currentPattern.value.pathName);
                        if(typeof Sentry !== 'undefined')
                        {
                            Sentry.captureMessage('Missing pattern: ' + currentPattern.value.pathName);
                        }
                    }
                }
        }

        // Extra marker?
        if(buildingData.mapIconImage !== undefined)
        {
            if(buildingData.category !== 'vehicle' || (buildingData.category === 'vehicle' && this.showVehicleExtraMarker === true))
            {
                let position = this.satisfactoryMap.unproject(currentObject.transform.translation);
                    markerOptions.extraMarker = L.marker(
                        position,
                        {originPathName: currentObject.pathName}
                    );
            }
        }

        // Activate detailedModel copy from another building?
        if(this.detailedModels !== null && buildingData.mapUseModel !== undefined && this.detailedModels[currentObject.className] === undefined)
        {
            if(this.buildingsData[buildingData.mapUseModel] !== undefined && this.detailedModels[this.buildingsData[buildingData.mapUseModel].className] !== undefined)
            {
                this.detailedModels[currentObject.className] = this.detailedModels[this.buildingsData[buildingData.mapUseModel].className];
            }
        }

        let building = BaseLayout_Polygon.createBuilding(this, currentObject, markerOptions, polygonOptions);
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
        marker.setStyle({
                fillColor: '#999999',
                fillOpacity: 0.9
            });

        if(marker.options.extraPattern !== undefined)
        {
            marker.options.extraPattern.setStyle({fillOpacity: 0.9});
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
            currentObject = this.saveGameParser.getTargetObject(marker.options.pathName);
            if(currentObject === null){ return; }
        }

        let mapOpacity          = (buildingData !== null && buildingData.mapOpacity !== undefined) ? buildingData.mapOpacity : 0.2;

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
            // Coloring is allowed but mostly for pattern!
            if(currentObject.className.includes('AsphaltSet') || currentObject.className.includes('GripMetal'))
            {
                marker.setStyle({
                    color       : buildingData.mapColor,
                    fillColor   : buildingData.mapColor,
                    fillOpacity : mapOpacity
                });
            }
            else
            {
                let slotColor = this.buildableSubSystem.getObjectPrimaryColor(currentObject);
                    marker.setStyle({
                        color       : buildingData.mapColor,
                        fillColor   : 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                        fillOpacity : mapOpacity
                    });
            }
        }

        if(marker.options.extraPattern !== undefined)
        {
            let patternColor = this.buildableSubSystem.getObjectSecondaryColor(currentObject);
                marker.options.extraPattern.setStyle({
                    color       : 'rgb(' + patternColor.r + ', ' + patternColor.g + ', ' + patternColor.b + ')',
                    fillColor   : 'rgb(' + patternColor.r + ', ' + patternColor.g + ', ' + patternColor.b + ')',
                    fillOpacity : Math.min(1, (mapOpacity + 0.3))
                });
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

    deleteGenericBuilding(marker, updateRadioactivity = true, fast = false)
    {
        let baseLayout      = marker.baseLayout;
        let pathName        = marker.relatedTarget.options.pathName;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            if(currentObject.className === '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C')
            {
                let mDecorationDescriptor   = baseLayout.getObjectProperty(currentObject, 'mDecorationDescriptor');
                    buildingData            = baseLayout.getItemDataFromClassName(mDecorationDescriptor.pathName);
                    buildingData.mapLayer   = 'playerStatuesLayer';
            }
            if(currentObject.className === '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
            {
                buildingData                = baseLayout.toolsData.BP_ItemDescriptorPortableMiner_C;
                buildingData.mapLayer       = 'playerMinersLayer';
            }


        let layerId = (buildingData !== null && buildingData.mapLayer !== undefined) ? buildingData.mapLayer : 'playerHUBTerminalLayer';

            if(baseLayout.playerLayers[layerId].filtersCount !== undefined)
            {
                if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className] !== undefined)
                {
                    if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance === undefined)
                    {
                        baseLayout.playerLayers[layerId].filtersCount[currentObject.className]--;

                        if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className] === 0)
                        {
                            $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((currentObject.className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : currentObject.className) + '"]').hide();
                        }
                    }
                }
            }

        // Check all known power connection in children and delete wires when needed!
        if(currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                let childrenPathName    = currentObject.children[i].pathName;
                let childrenType        = '.' + childrenPathName.split('.').pop();

                if(baseLayout.availablePowerConnection.indexOf(childrenType) !== -1)
                {
                    let currentObjectChildren = baseLayout.saveGameParser.getTargetObject(pathName + childrenType);
                        if(currentObjectChildren !== null)
                        {
                            baseLayout.deletePlayerWiresFromPowerConnection(currentObjectChildren);
                        }
                }
            }
        }

        // Remove belt/track connection if needed
        baseLayout.unlinkObjectComponentConnection(currentObject);

        // Does the layer have a distance field to update?
        if(baseLayout.playerLayers[layerId].distance !== undefined)
        {
            let splineData = BaseLayout_Math.extractSplineData(baseLayout, currentObject);
                if(splineData !== null)
                {
                    baseLayout.playerLayers[layerId].distance -= splineData.distance;

                    if(baseLayout.playerLayers[layerId].filtersCount !== undefined)
                    {
                        if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className] !== undefined)
                        {
                            if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance !== undefined)
                            {
                                baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance -= splineData.distance;
                            }
                        }
                    }
                }

            if(currentObject.className.includes('/Build_ConveyorLiftMk'))
            {
                let mTopTransform = baseLayout.getObjectProperty(currentObject, 'mTopTransform');
                    if(mTopTransform !== null)
                    {
                        for(let i = 0; i < mTopTransform.values.length; i++)
                        {
                            // Remove distance...
                            if(mTopTransform.values[i].name === 'Translation')
                            {
                                let height      = Math.abs(mTopTransform.values[i].value.values.z) / 100;
                                    baseLayout.playerLayers[layerId].distance -= height;

                                    if(baseLayout.playerLayers[layerId].filtersCount !== undefined)
                                    {
                                        if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className] !== undefined)
                                        {
                                            if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance !== undefined)
                                            {
                                                baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance -= height;

                                                if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance <= 0)
                                                {
                                                    baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance = 0;
                                                    $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((currentObject.className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : currentObject.className) + '"]').hide();
                                                }
                                            }
                                        }
                                    }
                            }
                        }
                    }
            }
        }

        //MOD: Efficiency Checker
        let innerPipelineAttachment = baseLayout.getObjectProperty(currentObject, 'innerPipelineAttachment');
            if(innerPipelineAttachment !== null)
            {
                baseLayout.saveGameParser.deleteObject(innerPipelineAttachment.pathName);
            }

        // Extraction buildings need to release the connected node!
        if((buildingData !== null && buildingData.category === 'extraction') || currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
        {
            let resourceNode     = baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
                if(resourceNode !== null)
                {
                    resourceNode    = baseLayout.saveGameParser.getTargetObject(resourceNode.pathName);

                    if(resourceNode !== null) // Prevent water volumes ^^
                    {
                        if(baseLayout.satisfactoryMap.collectableMarkers !== undefined && baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName] !== undefined)
                        {
                            let layerId         = baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.layerId;

                            let dataCollected   = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected')) - 1;
                            let dataTotal       = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-total'));

                            $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);

                            if(dataCollected === 0)
                            {
                                $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(baseLayout.language).format(dataTotal));
                            }
                            else
                            {
                                $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(baseLayout.language).format(dataCollected) + '/' + new Intl.NumberFormat(baseLayout.language).format(dataTotal));
                            }

                            if(baseLayout.showNodesOnMiners === false)
                            {
                                baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].addTo(baseLayout.satisfactoryMap.availableLayers[layerId]);
                            }
                            else
                            {
                                baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].setOpacity(1);
                            }

                            delete baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.extractorPathName;
                        }

                        let mIsOccupied = baseLayout.getObjectProperty(currentObject, 'mIsOccupied');
                            if(mIsOccupied !== null)
                            {
                                mIsOccupied = 0;
                            }
                    }
                }
        }

        // Delete vehicles waypoints
        if(buildingData !== null && buildingData.category === 'vehicle')
        {
            let mTargetList = baseLayout.getObjectProperty(currentObject, 'mTargetList'); // Update 5
                if(mTargetList === null) //TODO:OLD
                {
                    mTargetList = baseLayout.getObjectProperty(currentObject, 'mTargetNodeLinkedList');
                }

            if(mTargetList !== null)
            {
                let targetNode = baseLayout.saveGameParser.getTargetObject(mTargetList.pathName);
                    if(targetNode !== null && targetNode.properties.length > 0)
                    {
                        let firstNode   = null;
                        let lastNode    = null;

                        for(let j = 0; j < targetNode.properties.length; j++)
                        {
                            if(targetNode.properties[j].name === 'mFirst')
                            {
                                firstNode = baseLayout.saveGameParser.getTargetObject(targetNode.properties[j].value.pathName);
                            }
                            if(targetNode.properties[j].name === 'mLast')
                            {
                                lastNode = baseLayout.saveGameParser.getTargetObject(targetNode.properties[j].value.pathName);
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
                                    baseLayout.saveGameParser.deleteObject(checkCurrentNode.pathName);
                                    checkCurrentNode            = null;

                                for(let k = 0; k < checkCurrentNodeProperties.length; k++)
                                {
                                    if(checkCurrentNodeProperties[k].name === 'mNext')
                                    {
                                        checkCurrentNode = baseLayout.saveGameParser.getTargetObject(checkCurrentNodeProperties[k].value.pathName);
                                        break;
                                    }
                                }
                            }

                            baseLayout.saveGameParser.deleteObject(lastNode.pathName);
                        }

                        let vehicleTrackData = baseLayout.getMarkerFromPathName(marker.relatedTarget.options.pathName + '_vehicleTrackData', 'playerVehiculesLayer');
                            if(vehicleTrackData !== null)
                            {
                                baseLayout.deleteMarkerFromElements('playerVehiculesLayer', vehicleTrackData, fast);

                                baseLayout.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData']--;

                                if(baseLayout.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData'] === 0)
                                {
                                    $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hide();
                                }
                            }
                    }
            }

            for(let n = (baseLayout.saveGameRailVehicles.length - 1); n >= 0; n--)
            {
                if(baseLayout.saveGameRailVehicles[n].pathName === currentObject.pathName)
                {
                    baseLayout.saveGameRailVehicles.splice(n, 1);
                }
            }
        }

        // Delete trains on tracks!
        if(
               currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C'
            || currentObject.className === '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C'
            || currentObject.className === '/FlexSplines/Track/Build_Track.Build_Track_C'
        )
        {
            for(let n = (baseLayout.saveGameRailVehicles.length - 1); n >= 0; n--)
            {
                let mTrackPosition = baseLayout.getObjectProperty(baseLayout.saveGameRailVehicles[n], 'mTrackPosition');
                    if(mTrackPosition !== null)
                    {
                        if(mTrackPosition.pathName === currentObject.pathName)
                        {
                            baseLayout.saveGameParser.deleteObject(baseLayout.saveGameRailVehicles[n].pathName);
                            baseLayout.deleteMarkerFromElements('playerTrainsLayer', baseLayout.getMarkerFromPathName(baseLayout.saveGameRailVehicles[n].pathName, 'playerTrainsLayer'), fast);
                            baseLayout.saveGameRailVehicles.splice(n, 1);
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
            let mRailroadTrack = baseLayout.getObjectProperty(currentObject, 'mRailroadTrack');
                if(mRailroadTrack !== null)
                {
                    let railroadTrackMarker = baseLayout.getMarkerFromPathName(mRailroadTrack.pathName, layerId);
                        if(railroadTrackMarker !== null)
                        {
                            baseLayout.deleteGenericBuilding({baseLayout: baseLayout, relatedTarget: railroadTrackMarker});
                        }
                }

            baseLayout.railroadSubSystem.deleteObjectIdentifier(currentObject);
        }

        // Release space elevator!
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C')
        {
            let gameState = baseLayout.saveGameParser.getTargetObject('/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C');
                if(gameState !== null)
                {
                    baseLayout.setObjectProperty(gameState, 'mIsSpaceElevatorBuilt', 0, 'BoolProperty');
                }
        }

        // Delete extra properties
        let mSignPoles = baseLayout.getObjectProperty(currentObject, 'mSignPoles');
            if(mSignPoles !== null)
            {
                for(let j = 0; j < mSignPoles.values.length; j++)
                {
                    baseLayout.saveGameParser.deleteObject(mSignPoles.values[j].pathName);
                }
            }

        // Delete extra marker!
        if(marker.relatedTarget.options.extraMarker !== undefined)
        {
            baseLayout.playerLayers[layerId].subLayer.removeLayer(marker.relatedTarget.options.extraMarker);
        }
        if(marker.relatedTarget.options.haloMarker !== undefined)
        {
            baseLayout.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(marker.relatedTarget.options.haloMarker);
        }

        // Delete current object
        if(baseLayout.playerLayers[layerId].count !== undefined && buildingData.mapUseCount !== undefined && buildingData.mapUseCount === true)
        {
            baseLayout.playerLayers[layerId].count--;
        }
        baseLayout.saveGameParser.deleteObject(pathName);
        baseLayout.deleteMarkerFromElements(layerId, marker.relatedTarget, fast);

        // Refresh radioactivity
        if(currentObject.className.includes('/Build_ConveyorBeltMk'))
        {
            if(baseLayout.useRadioactivity && currentObject.extra !== undefined && currentObject.extra.items.length > 0)
            {
                for(let i = 0; i < currentObject.extra.items.length; i++)
                {
                    let currentItemData = baseLayout.getItemDataFromClassName(currentObject.extra.items[i].name);
                        if(currentItemData !== null)
                        {
                            if(currentItemData.radioactiveDecay !== undefined)
                            {
                                delete baseLayout.playerLayers.playerRadioactivityLayer.elements[pathName + '_' + i];
                            }
                        }
                }
            }
        }
        else
        {
            delete baseLayout.playerLayers.playerRadioactivityLayer.elements[pathName];
        }

        baseLayout.radioactivityLayerNeedsUpdate = true;

        if(updateRadioactivity === true)
        {
            baseLayout.updateRadioactivityLayer();
        }
    }

    addPlayerBelt(currentObject)
    {
        let mapLayer     = 'playerUnknownLayer';
        let buildingData = this.getBuildingDataFromClassName(currentObject.className);
            if(buildingData !== null)
            {
                mapLayer = buildingData.mapLayer;
            }

        this.setupSubLayer(mapLayer);
        let splineData = BaseLayout_Math.extractSplineData(this, currentObject);

        if(this.useRadioactivity && currentObject.extra !== undefined && currentObject.extra.items.length > 0)
        {
            let radioactiveInventory = [];
                for(let i = 0; i < currentObject.extra.items.length; i++)
                {
                    let currentItemData = this.getItemDataFromClassName(currentObject.extra.items[i].name, false);
                        if(currentItemData !== null)
                        {
                            if(currentItemData.radioactiveDecay !== undefined)
                            {
                                radioactiveInventory.push({position: currentObject.extra.items[i].position, radioactiveDecay: currentItemData.radioactiveDecay});
                            }
                        }
                }

            if(radioactiveInventory.length > 0)
            {
                for(let i = 0; i < radioactiveInventory.length; i++)
                {
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
                            }, [{qty: 1, radioactiveDecay: radioactiveInventory[i].radioactiveDecay}]);

                            break;
                        }

                        currentBeltDistance += segmentDistance;
                    }
                }
            }
        }

        let belt = L.conveyor(
                splineData.points,
                {
                    pathName    : currentObject.pathName,
                    weight      : 135,
                    altitude    : currentObject.transform.translation[2]
                }
        );

        belt.bindContextMenu(this);
        belt.on('mouseover', function(marker){
            let currentObject       = this.saveGameParser.getTargetObject(marker.sourceTarget.options.pathName);
            let slotColor           = this.buildableSubSystem.getObjectPrimaryColor(currentObject);
                marker.sourceTarget.setStyle({color: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')', opacity: 0.5});
        }.bind(this));
        belt.on('mouseout', function(marker){
            let mouseOutStyle       = {opacity: 0.9};
            let currentObject       = this.saveGameParser.getTargetObject(marker.sourceTarget.options.pathName);
                if(currentObject !== null)
                {
                    let buildingData = this.getBuildingDataFromClassName(currentObject.className);
                        if(buildingData !== null)
                        {
                            mouseOutStyle.color = buildingData.mapColor;
                        }
                }

            marker.sourceTarget.setStyle(mouseOutStyle);
        }.bind(this));
        belt.fire('mouseout');

        this.autoBindTooltip(belt);

        if(this.playerLayers[mapLayer].distance !== undefined)
        {
            this.playerLayers[mapLayer].distance += splineData.distance;
        }

        this.playerLayers[mapLayer].elements.push(belt);

        if(this.playerLayers[mapLayer].filtersCount !== undefined)
        {
            if(this.playerLayers[mapLayer].filtersCount[currentObject.className] === undefined)
            {
                this.playerLayers[mapLayer].filtersCount[currentObject.className] = {distance: 0};
            }
            this.playerLayers[mapLayer].filtersCount[currentObject.className].distance += splineData.distance;
        }

        return {layer: mapLayer, marker: belt};
    }

    unlinkObjectComponentConnection(currentObject)
    {
        if(currentObject.children !== undefined)
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
                            this.railroadSubSystem.unlinkRailroadTrackConnections(connectedComponent);

                        }

                        // Platform connection
                        if(connectedComponent.className === '/Script/FactoryGame.FGTrainPlatformConnection')
                        {
                            this.railroadSubSystem.unlinkTrainPlatformConnections(connectedComponent);
                        }
                }
            }
        }

        // Trains connection
        if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C' || currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
        {
            let previousTrain   = null;
            let nextTrain       = null;

            if(currentObject.extra !== undefined && currentObject.extra.previous !== undefined && currentObject.extra.previous.pathName !== '')
            {
                let previousObject = this.saveGameParser.getTargetObject(currentObject.extra.previous.pathName);

                if(previousObject !== null)
                {
                    if(previousObject.extra.previous.pathName === currentObject.pathName)
                    {
                        previousObject.extra.previous.levelName = '';
                        previousObject.extra.previous.pathName  = '';
                    }
                    if(previousObject.extra.next.pathName === currentObject.pathName)
                    {
                        previousObject.extra.next.levelName     = '';
                        previousObject.extra.next.pathName      = '';
                    }

                    previousTrain = this.getMarkerFromPathName(currentObject.extra.previous.pathName, 'playerTrainsLayer');
                }

                currentObject.extra.previous.levelName          = '';
                currentObject.extra.previous.pathName           = '';
            }
            if(currentObject.extra !== undefined && currentObject.extra.next !== undefined && currentObject.extra.next.pathName !== '')
            {
                let nextObject = this.saveGameParser.getTargetObject(currentObject.extra.next.pathName);

                if(nextObject !== null)
                {
                    if(nextObject.extra.previous.pathName === currentObject.pathName)
                    {
                        nextObject.extra.previous.levelName     = '';
                        nextObject.extra.previous.pathName      = '';
                    }
                    if(nextObject.extra.next.pathName === currentObject.pathName)
                    {
                        nextObject.extra.next.levelName         = '';
                        nextObject.extra.next.pathName          = '';
                    }

                    nextTrain = this.getMarkerFromPathName(currentObject.extra.next.pathName, 'playerTrainsLayer');
                }

                currentObject.extra.next.levelName              = '';
                currentObject.extra.next.pathName               = '';
            }

            if(previousTrain !== null)
            {
                this.deleteGenericBuilding({baseLayout: this, relatedTarget: previousTrain});
            }
            if(nextTrain !== null)
            {
                this.deleteGenericBuilding({baseLayout: this, relatedTarget: nextTrain});
            }
        }

        // Pipe/Lift Floor Hole
        let mBottomSnappedConnection = this.getObjectProperty(currentObject, 'mBottomSnappedConnection');
            if(mBottomSnappedConnection !== null)
            {

            }
        let mTopSnappedConnection = this.getObjectProperty(currentObject, 'mTopSnappedConnection');
            if(mTopSnappedConnection !== null)
            {

            }
    }

    addPlayerTrack(currentObject)
    {
        this.setupSubLayer('playerTracksLayer');

        let splineData      = BaseLayout_Math.extractSplineData(this, currentObject);
        let track           = L.conveyor(
                splineData.points,
                {
                    pathName    : currentObject.pathName,
                    weight      : 600,
                    color       : '#ff69b4',
                    altitude    : currentObject.transform.translation[2]
                }
            );

        track.bindContextMenu(this);
        track.on('mouseover', function(){
            this.setStyle({color: '#bf4e87', opacity: 0.7});
        });
        track.on('mouseout', function(){
            this.setStyle({color: '#ff69b4', opacity: 0.9});
        });
        track.fire('mouseout');

        this.autoBindTooltip(track);

        this.playerLayers.playerTracksLayer.distance += splineData.distance;
        this.playerLayers.playerTracksLayer.elements.push(track);

        if(this.playerLayers.playerTracksLayer.filtersCount !== undefined)
        {
            let trackClassName = currentObject.className;
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C' || currentObject.className === '/FlexSplines/Track/Build_Track.Build_Track_C')
                {
                    trackClassName = '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C';
                }

            if(this.playerLayers.playerTracksLayer.filtersCount[trackClassName] === undefined)
            {
                this.playerLayers.playerTracksLayer.filtersCount[trackClassName] = {distance: 0};
            }
            this.playerLayers.playerTracksLayer.filtersCount[trackClassName].distance += splineData.distance;
        }

        return track;
    }

    addPlayerPowerLine(currentObject)
    {
        this.setupSubLayer('playerPowerGridLayer');

        // Orphaned power lines (Most likely when mods are removed)
        if(currentObject.extra.source.pathName === '' || currentObject.extra.target.pathName === '')
        {
            console.log('Deleting orphaned power line...');
            this.deletePlayerPowerLine({options: {pathName: currentObject.pathName}});
            return false;
        }

        let currentObjectSource = this.saveGameParser.getTargetObject(currentObject.extra.source.pathName);
        let currentObjectTarget = this.saveGameParser.getTargetObject(currentObject.extra.target.pathName);

            if(currentObjectSource !== null && currentObjectTarget !== null)
            {
                let currentObjectSourceOuterPath    = this.saveGameParser.getTargetObject(currentObjectSource.outerPathName);
                let currentObjectTargetOuterPath    = this.saveGameParser.getTargetObject(currentObjectTarget.outerPathName);

                    if(currentObjectSourceOuterPath !== null && currentObjectSourceOuterPath.transform !== undefined && currentObjectTargetOuterPath !== null && currentObjectTargetOuterPath.transform !== undefined)
                    {
                        // Check if source and target have the proper wire connection?
                        this.checkPlayerWirePowerConnection(currentObjectSource, currentObject);
                        this.checkPlayerWirePowerConnection(currentObjectTarget, currentObject);

                        // Does source or target have a connection anchor?
                        let sourceTranslation = currentObjectSourceOuterPath.transform.translation;
                            if(this.detailedModels !== null && this.detailedModels[currentObjectSourceOuterPath.className] !== undefined && this.detailedModels[currentObjectSourceOuterPath.className].powerConnection !== undefined)
                            {
                                let currentModel = this.detailedModels[currentObjectSourceOuterPath.className];
                                    sourceTranslation= BaseLayout_Math.getPointRotation(
                                        [
                                            sourceTranslation[0] + (currentModel.powerConnection[0] * currentModel.scale) + ((currentModel.xOffset !== undefined) ? currentModel.xOffset : 0),
                                            sourceTranslation[1] + (currentModel.powerConnection[1] * currentModel.scale) + ((currentModel.yOffset !== undefined) ? currentModel.yOffset : 0)
                                        ],
                                        sourceTranslation,
                                        currentObjectSourceOuterPath.transform.rotation
                                    );
                            }
                        let targetTranslation = currentObjectTargetOuterPath.transform.translation;
                            if(this.detailedModels !== null && this.detailedModels[currentObjectTargetOuterPath.className] !== undefined && this.detailedModels[currentObjectTargetOuterPath.className].powerConnection !== undefined)
                            {
                                let currentModel = this.detailedModels[currentObjectTargetOuterPath.className];
                                    targetTranslation= BaseLayout_Math.getPointRotation(
                                        [
                                            targetTranslation[0] + (currentModel.powerConnection[0] * currentModel.scale) + ((currentModel.xOffset !== undefined) ? currentModel.xOffset : 0),
                                            targetTranslation[1] + (currentModel.powerConnection[1] * currentModel.scale) + ((currentModel.yOffset !== undefined) ? currentModel.yOffset : 0)
                                        ],
                                        targetTranslation,
                                        currentObjectTargetOuterPath.transform.rotation
                                    );
                            }


                        // Add the power line!
                        let powerline = L.polyline([
                                this.satisfactoryMap.unproject(sourceTranslation),
                                this.satisfactoryMap.unproject(targetTranslation)
                            ], {
                                pathName    : currentObject.pathName,
                                color       : ((currentObject.className === '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C') ? '#00ff00' : '#0000ff'),
                                weight      : 1,
                                interactive : false,
                                altitude    : ((currentObjectSourceOuterPath.transform.translation[2] + currentObjectTargetOuterPath.transform.translation[2]) / 2)
                            });

                        this.playerLayers.playerPowerGridLayer.elements.push(powerline);

                        this.playerLayers.playerPowerGridLayer.distance += Math.sqrt(
                            ((sourceTranslation[0] - targetTranslation[0]) * (sourceTranslation[0] - targetTranslation[0]))
                          + ((sourceTranslation[1] - targetTranslation[1]) * (sourceTranslation[1] - targetTranslation[1]))
                        ) / 100;

                        return powerline;
                    }

                    return false;
            }
    }

    checkPlayerWirePowerConnection(currentObject, currentWireObject)
    {
        let mWires = this.getObjectProperty(currentObject, 'mWires');

            // Create the missing property...
            if(mWires === null)
            {
                currentObject.properties.push({
                    name    : "mWires",
                    type    : "ArrayProperty",
                    value   : {
                        type    : "ObjectProperty",
                        values  : [{
                            levelName   : ((currentWireObject.levelName !== undefined) ? currentWireObject.levelName : 'Persistent_Level'),
                            pathName    : currentWireObject.pathName
                        }]
                    }
                });

                return;
            }

            // Check if wire is properly connected...
            for(let i = 0; i < mWires.values.length; i++)
            {
                if(mWires.values[i].pathName === currentWireObject.pathName)
                {
                    return;
                }
            }

            // Wasn't found, add it!
            mWires.values.push({
                levelName   : ((currentWireObject.levelName !== undefined) ? currentWireObject.levelName : 'Persistent_Level'),
                pathName    : currentWireObject.pathName
            });
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
        let currentObjectSource = this.saveGameParser.getTargetObject(currentObject.extra.source.pathName);

        // Unlink source power connection
        if(currentObjectSource !== null)
        {
            this.unlinkPowerConnection(currentObjectSource, currentObject);
        }

        // Unlink target power connection
        let currentObjectTarget = this.saveGameParser.getTargetObject(currentObject.extra.target.pathName);
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
                intensity += (radioactivityItems[p].qty * radioactivityItems[p].radioactiveDecay) / (4 * 3.1415926535897932 * distance * distance) * Math.pow(Math.E, -0.0125 * distance);
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

    // Layers
    setupSubLayer(layerId, show = true)
    {
        if(this.playerLayers[layerId] === undefined)
        {
            throw new Error('Undefined layerId `' + layerId + '`');
            //this.playerLayers[layerId] = {layerGroup: L.layerGroup().addTo(this.satisfactoryMap.leafletMap), subLayer: null, mainDivId: '#playerModsLayer', elements: []};
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
            switch(layerId)
            {
                case 'playerRadioactivityLayer':
                    this.playerLayers[layerId].subLayer = new HeatmapOverlay({
                        maxOpacity: .8,
                        scaleRadius: true,
                        useLocalExtrema: false,
                        //gradient: { 0.33: "rgb(0,255,0)", 0.90: "yellow", 1.0: "rgb(255,0,0)"}
                        gradient: { 0.40: "rgb(0,0,255)", 0.80: "rgb(0,255,0)", 0.90: "yellow", 1.0: "rgb(255,0,0)"}
                    });
                    break;
                default:
                    this.playerLayers[layerId].subLayer = L.layerGroup();
            }

            // Do we need to show it by default?
            if(show === true)
            {
                switch(this.playerLayers[layerId].mainDivId)
                {
                    case '#playerStructuresLayer':
                        show = this.showStructuresOnLoad;
                        break;
                    case '#playerBuildingLayer':
                        show = this.showBuildingsOnLoad;
                        break;
                    case '#playerGeneratorsLayer':
                        show = this.showGeneratorsOnLoad;
                        break;
                    case '#playerBuildingLayer':
                        show = this.showTransportationOnLoad;
                        break;
                }
            }

            if(show === true)
            {
                this.playerLayers[layerId].subLayer.addTo(this.playerLayers[layerId].layerGroup);
                $('.updatePlayerLayerState[data-id=' + layerId + ']').addClass(window.SCIM.outlineClass);
            }

            let layerIcon = $('.updatePlayerLayerState[data-id=' + layerId + ']');
                layerIcon.children('img[data-src]').each(function(){
                    $(this).attr('src', $(this).attr('data-src')).removeAttr('data-src');
                });
                layerIcon.show();

            $(this.playerLayers[layerId].mainDivId).show()
                                                   .parent().show();

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

       this.playerLayers[layerId] = {layerGroup: L.layerGroup().addTo(this.satisfactoryMap.leafletMap), subLayer: null, mainDivId: '#playerModsLayer', elements: [], filters: []};
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
                    // HIDE
                    if(this.playerLayers[layerId].layerGroup.hasLayer(this.playerLayers[layerId].subLayer))
                    {
                        this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer);
                        $this.removeClass(window.SCIM.outlineClass);

                        if(layerId === 'playerLightsLayer')
                        {
                            if(this.playerLayers.playerLightsHaloLayer.layerGroup.hasLayer(this.playerLayers.playerLightsHaloLayer.subLayer))
                            {
                                this.playerLayers.playerLightsHaloLayer.layerGroup.removeLayer(this.playerLayers.playerLightsHaloLayer.subLayer);
                                $('.updatePlayerLayerState[data-id="playerLightsHaloLayer"] > i').removeClass('fa-light-switch-on').addClass('fa-light-switch-off');
                            }
                        }

                        if(layerId === 'playerLightsHaloLayer')
                        {
                            $('.updatePlayerLayerState[data-id="playerLightsHaloLayer"] > i').removeClass('fa-light-switch-on').addClass('fa-light-switch-off');
                        }
                    }
                    // SHOW
                    else
                    {
                        this.playerLayers[layerId].layerGroup.addLayer(this.playerLayers[layerId].subLayer);
                        $this.addClass(window.SCIM.outlineClass);

                        if(layerId === 'playerLightsLayer')
                        {
                            if($('.updatePlayerLayerState[data-id="playerLightsHaloLayer"]').hasClass(window.SCIM.outlineClass))
                            {
                                this.playerLayers.playerLightsHaloLayer.layerGroup.addLayer(this.playerLayers.playerLightsHaloLayer.subLayer);
                                $('.updatePlayerLayerState[data-id="playerLightsHaloLayer"] > i').removeClass('fa-light-switch-off').addClass('fa-light-switch-on');
                            }
                        }

                        if(layerId === 'playerLightsHaloLayer')
                        {
                            $('.updatePlayerLayerState[data-id="playerLightsHaloLayer"] > i').removeClass('fa-light-switch-off').addClass('fa-light-switch-on');
                        }
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
                                            let currentClassName = currentObject.className;
                                                if(layerId === 'playerResourceDepositsLayer')
                                                {
                                                    currentClassName = this.getItemIdFromDepositTableIndex(currentObject);
                                                }

                                            if(currentSubLayer.hasLayer(currentMarker) && this.playerLayers[layerId].filters.includes(currentClassName))
                                            {
                                                currentSubLayer.removeLayer(currentMarker);

                                                if(currentMarker.options.extraPattern !== undefined)
                                                {
                                                    currentSubLayer.removeLayer(currentMarker.options.extraPattern);
                                                }
                                                if(currentMarker.options.extraMarker !== undefined)
                                                {
                                                    currentSubLayer.removeLayer(currentMarker.options.extraMarker);
                                                }
                                                if(currentMarker.options.haloMarker !== undefined)
                                                {
                                                    this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(currentMarker.options.haloMarker);
                                                }

                                                if(layerId === 'playerVehiculesLayer')
                                                {
                                                    let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', layerId);
                                                        if(vehicleTrackData !== null)
                                                        {
                                                            currentSubLayer.removeLayer(vehicleTrackData);
                                                        }
                                                }
                                            }
                                            else
                                            {
                                                if(currentSubLayer.hasLayer(currentMarker) === false && this.playerLayers[layerId].filters.includes(currentClassName) === false)
                                                {
                                                    let addToSubLayer = true;
                                                        if(this.playerLayersNotUsingAltitude.includes(layerId) === false)
                                                        {
                                                            if(currentObject.transform.translation[2] < ($('#altitudeSliderInputs input[name=minAltitude]').val() * 100) || currentObject.transform.translation[2] > ($('#altitudeSliderInputs input[name=maxAltitude]').val() * 100))
                                                            {
                                                                addToSubLayer = false;
                                                            }
                                                        }

                                                        if(addToSubLayer === true)
                                                        {
                                                            currentSubLayer.addLayer(currentMarker);

                                                            if(currentMarker.options.extraPattern !== undefined)
                                                            {
                                                                currentSubLayer.addLayer(currentMarker.options.extraPattern);
                                                            }
                                                            if(currentMarker.options.extraMarker !== undefined)
                                                            {
                                                                currentSubLayer.addLayer(currentMarker.options.extraMarker);
                                                            }
                                                            if(currentMarker.options.haloMarker !== undefined)
                                                            {
                                                                this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(currentMarker.options.haloMarker);
                                                            }

                                                            if(layerId === 'playerVehiculesLayer')
                                                            {
                                                                let trackDataFilterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hasClass("btn-warning");
                                                                    if(trackDataFilterStatus)
                                                                    {
                                                                        let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', layerId);
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
            if(this.playerLayers[layerId].subLayer !== null && this.playerLayersNotUsingAltitude.includes(layerId) === false)
            {
                let currentSubLayer     = this.playerLayers[layerId].subLayer;
                let currentLayerLength  = this.playerLayers[layerId].elements.length;

                for(let i = 0; i < currentLayerLength; i++)
                {
                    let currentMarker   = this.playerLayers[layerId].elements[i];
                    let currentObject   = this.saveGameParser.getTargetObject(currentMarker.options.pathName);

                    if(currentObject !== null)
                    {
                        if(currentSubLayer.hasLayer(currentMarker) && (currentObject.transform.translation[2] < minAltitude || currentObject.transform.translation[2] > maxAltitude))
                        {
                            currentSubLayer.removeLayer(currentMarker);

                            if(currentMarker.options.extraPattern !== undefined)
                            {
                                currentSubLayer.removeLayer(currentMarker.options.extraPattern);
                            }
                            if(currentMarker.options.extraMarker !== undefined)
                            {
                                currentSubLayer.removeLayer(currentMarker.options.extraMarker);
                            }
                            if(currentMarker.options.haloMarker !== undefined)
                            {
                                this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(currentMarker.options.haloMarker);
                            }

                            if(layerId === 'playerVehiculesLayer')
                            {
                                let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', layerId);
                                    if(vehicleTrackData !== null)
                                    {
                                        currentSubLayer.removeLayer(vehicleTrackData);
                                    }
                            }
                        }
                        else
                        {
                            if(currentSubLayer.hasLayer(currentMarker) === false && currentObject.transform.translation[2] >= minAltitude && currentObject.transform.translation[2] <= maxAltitude)
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

                                                    if(currentMarker.options.extraPattern !== undefined)
                                                    {
                                                        currentSubLayer.addLayer(currentMarker.options.extraPattern);
                                                    }
                                                    if(currentMarker.options.extraMarker !== undefined)
                                                    {
                                                        currentSubLayer.addLayer(currentMarker.options.extraMarker);
                                                    }
                                                    if(currentMarker.options.haloMarker !== undefined)
                                                    {
                                                        this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(currentMarker.options.haloMarker);
                                                    }

                                                    if(layerId === 'playerVehiculesLayer')
                                                    {
                                                        let trackDataFilterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hasClass("btn-warning");
                                                            if(trackDataFilterStatus)
                                                            {
                                                                let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', layerId);
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

                                    if(currentMarker.options.extraPattern !== undefined)
                                    {
                                        currentSubLayer.addLayer(currentMarker.options.extraPattern);
                                    }
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
                                    if(currentMarker.options.haloMarker !== undefined)
                                    {
                                        this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(currentMarker.options.haloMarker);
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

    // Inventory
    getObjectInventory(currentObject, inventoryPropertyName = 'mInventory', raw = false)
    {
        let inventory = this.getObjectProperty(currentObject, inventoryPropertyName);
            if(inventory !== null)
            {
                let inventoryObject = this.saveGameParser.getTargetObject(inventory.pathName);
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

        if(raw === false)
        {
            return [];
        }

        return null;
    }
    getObjectRadioactivity(currentObject, inventoryPropertyName = 'mInventory')
    {
        if(this.useRadioactivity === true)
        {
            let inventoryPathName = this.getObjectProperty(currentObject, inventoryPropertyName);
                if(inventoryPathName !== null)
                {
                    let inventoryObject = this.saveGameParser.getTargetObject(inventoryPathName.pathName);
                        if(inventoryObject !== null)
                        {
                            let mInventoryStacks = this.getObjectProperty(inventoryObject, 'mInventoryStacks');
                                if(mInventoryStacks !== null)
                                {
                                    let radioactivityItems  = [];
                                        for(let k = 0; k < mInventoryStacks.values.length; k++)
                                        {
                                            if(mInventoryStacks.values[k][0].value.itemName !== '')
                                            {
                                                // Rename item
                                                let currentItemData = this.getItemDataFromClassName(mInventoryStacks.values[k][0].value.itemName, false);
                                                    if(currentItemData !== null)
                                                    {
                                                        if(currentItemData.radioactiveDecay !== undefined)
                                                        {
                                                            radioactivityItems.push({
                                                                qty                 : mInventoryStacks.values[k][0].value.properties[0].value,
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

                                        return;
                                }
                        }
                }
        }

        return;
    }
    getObjectTargetInventory(currentObject)
    {
        let inventory               = [];
        let mInventoryStacks        = this.getObjectProperty(currentObject, 'mInventoryStacks');
            if(mInventoryStacks !== null)
            {
                let mActiveEquipmentIndex   = this.getObjectProperty(currentObject, 'mActiveEquipmentIndex');

                for(let k = 0; k < mInventoryStacks.values.length; k++)
                {
                    if(mInventoryStacks.values[k][0].value.itemName !== '')
                    {
                        // Rename item
                        let currentItemData = this.getItemDataFromClassName(mInventoryStacks.values[k][0].value.itemName);
                            if(currentItemData !== null)
                            {
                                inventory.push({
                                    rawClassName    : mInventoryStacks.values[k][0].value.itemName,
                                    className       : currentItemData.className,
                                    category        : currentItemData.category,
                                    name            : currentItemData.name,
                                    image           : currentItemData.image,
                                    qty             : mInventoryStacks.values[k][0].value.properties[0].value,
                                    isActive        : ((mActiveEquipmentIndex !== null && mActiveEquipmentIndex === k) ? true : false)
                                });
                            }
                    }
                    else
                    {
                        inventory.push(null);
                    }
                }
            }

        return inventory;
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

        let itemQty         = (inventory.qty !== undefined) ? inventory.qty : null;
        let itemUnits       = '';
        let itemStyle       = 'border-radius: 5px;';
            if(itemQty !== null && inventory.category !== undefined && (inventory.category === 'liquid' || inventory.category === 'gas'))
            {
                itemQty     = Math.round(Math.round(itemQty) / 1000);
                itemUnits   = 'm³';
                itemStyle   = 'border-radius: 50%;';
            }


        let isActiveStyle   = 'border: 1px solid #000000;padding: 5px;';
            if(inventory.isActive !== undefined && inventory.isActive === true)
            {
                isActiveStyle   = 'border: 3px solid #F39C12;padding: 3px;';
            }

        let html = '';
            html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;' + isActiveStyle + itemStyle + 'background-color: #FFFFFF;"';

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
                // Show filter icons
                let filterIcon  = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : className) + '"]');
                    filterIcon.find('img[data-src]').each(function(){
                        $(this).attr('src', $(this).attr('data-src')).removeAttr('data-src');
                    });
                    filterIcon.show();


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

            let currentLength = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter:not([style*="display: none"])').length;
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
        let html                = '';
        let potentialInventory  = this.getObjectInventory(currentObject, 'mInventoryPotential');
            if(potentialInventory !== null)
            {
                html += '<div class="text-center"><table class="mr-auto ml-auto mt-3"><tr><td>';
                html += this.setInventoryTableSlot(potentialInventory, null, 48, '', this.itemsData.Desc_CrystalShard_C.image);
                html += '</td></tr></table></div>';
            }

        return html;
    }

    toggleDropPodHasBeenOpened(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let layerId         = marker.relatedTarget.options.layerId;

        let dataCollected   = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected'));
        let dataTotal       = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-total'));

        let hasBeenOpened   = this.getObjectProperty(currentObject, 'mHasBeenOpened', 0);
            if(hasBeenOpened == 0)
            {
                dataCollected++;
                this.setObjectProperty(currentObject, 'mHasBeenOpened', 1, 'BoolProperty');
                marker.relatedTarget.setOpacity(window.SCIM.collectedOpacity);
            }
            else
            {
                dataCollected--;
                this.deleteObjectProperty(currentObject, 'mHasBeenOpened');
                marker.relatedTarget.setOpacity(1);
            }

        $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);

        if(dataCollected === 0)
        {
            $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(this.language).format(dataTotal));
        }
        else
        {
            $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(this.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.language).format(dataTotal));
        }
    }

    updateObjectProductionPausedStatus(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);
        let isProductionPaused  = this.getObjectProperty(currentObject, 'mIsProductionPaused');

            // GENERATOR
            if(buildingData !== null && buildingData.category === 'generator' && buildingData.powerGenerated !== undefined)
            {
                let currentObjectPowerInfo = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + '.powerInfo');
                    if(currentObjectPowerInfo !== null)
                    {
                        switch(currentObject.className)
                        {
                            case '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C':
                                if(isProductionPaused === null)
                                {
                                    this.setObjectProperty(currentObjectPowerInfo, 'mBaseProduction', 0, 'FloatProperty');
                                }
                                else
                                {
                                    this.setObjectProperty(currentObjectPowerInfo, 'mBaseProduction', buildingData.powerGenerated.normal[1], 'FloatProperty');

                                    let resourceNode     = this.getObjectProperty(currentObject, 'mExtractableResource');
                                        if(resourceNode !== null)
                                        {
                                            if(this.satisfactoryMap.collectableMarkers !== undefined && this.satisfactoryMap.collectableMarkers[resourceNode.pathName] !== undefined)
                                            {
                                                if(this.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity !== undefined)
                                                {
                                                    if(buildingData !== null && buildingData.powerGenerated[this.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity] !== undefined)
                                                    {
                                                        this.setObjectProperty(
                                                            currentObjectPowerInfo,
                                                            'mBaseProduction',
                                                            (buildingData.powerGenerated[this.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity][1] + buildingData.powerGenerated[this.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity][0]) / 2,
                                                            'FloatProperty'
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                }
                                break;
                            default:
                                if(isProductionPaused === null)
                                {
                                    this.deleteObjectProperty(currentObjectPowerInfo, 'mDynamicProductionCapacity');
                                }
                                else
                                {
                                    this.setObjectProperty(currentObjectPowerInfo, 'mDynamicProductionCapacity', buildingData.powerGenerated, 'FloatProperty');
                                }
                        }
                    }
            }

            // PRODUCTION
            if(buildingData !== null && buildingData.powerUsed !== undefined)
            {
                let currentObjectPowerInfo  = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + '.powerInfo');
                    if(currentObjectPowerInfo !== null)
                    {
                        if(isProductionPaused === null)
                        {
                            this.setObjectProperty(currentObjectPowerInfo, 'mTargetConsumption', 0, 'FloatProperty');
                        }
                        else
                        {
                            this.setObjectProperty(currentObjectPowerInfo, 'mTargetConsumption', buildingData.powerUsed, 'FloatProperty');
                        }
                    }
            }

            // STATE
            if(isProductionPaused === null)
            {
                this.setObjectProperty(currentObject, 'mIsProductionPaused', 1, 'BoolProperty');
            }
            else
            {
                this.deleteObjectProperty(currentObject, 'mIsProductionPaused');
            }

            // LIGHT
            if(buildingData !== null && buildingData.category === 'light')
            {
                this.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
            }
    }

    updateObjectClockSpeed(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

        BaseLayout_Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" clock speed',
            container   : '#leafletMap',
            inputs      : [
                {
                    name        : 'clockSpeed',
                    inputType   : 'number',
                    value       : this.getClockSpeed(currentObject) * 100,
                    min         : 1,
                    max         : 250
                },
                {
                    label       : 'Use power shards from your containers?',
                    name        : 'useOwnPowershards',
                    inputType   : 'toggle'
                }
            ],
            callback    : function(form)
            {
                if(form !== null && form.clockSpeed !== null && form.useOwnPowershards !== null)
                {
                    let clockSpeed          = Math.max(1, Math.min(Math.round(form.clockSpeed * 1000000) / 1000000, 250));
                    let totalPowerShards    = Math.ceil((clockSpeed - 100) / 50);

                    if(totalPowerShards > 0)
                    {
                        let potentialInventory = this.getObjectInventory(currentObject, 'mInventoryPotential', true);
                            if(potentialInventory !== null)
                            {
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
                    }

                    this.setObjectProperty(currentObject, 'mCurrentPotential', clockSpeed / 100, 'FloatProperty');
                    this.setObjectProperty(currentObject, 'mPendingPotential', clockSpeed / 100, 'FloatProperty');

                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/FrackingSmasher/Build_FrackingSmasher.Build_FrackingSmasher_C')
                    {
                        // Update all linked extractors
                        let satellites  = Building_FrackingSmasher.getSatellites(this, currentObject);
                            for(let i = 0; i < satellites.length; i++)
                            {
                                if(satellites[i].options.extractorPathName !== undefined)
                                {
                                    let currentExtractor = this.saveGameParser.getTargetObject(satellites[i].options.extractorPathName);
                                        if(currentExtractor !== null)
                                        {
                                            this.setObjectProperty(currentExtractor, 'mCurrentPotential', clockSpeed / 100, 'FloatProperty');
                                            this.setObjectProperty(currentExtractor, 'mPendingPotential', clockSpeed / 100, 'FloatProperty');
                                        }
                                }
                            }
                    }
                }
            }.bind(this)
        });
    }

    getObjectProperty(currentObject, propertyName, defaultPropertyValue = null)
    {
        if(currentObject!== null && currentObject.properties !== undefined)
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

    getItemDataFromRecipe(currentObject, propertyName = 'mCurrentRecipe')
    {
        let recipe              = this.getObjectProperty(currentObject, propertyName);

        if(recipe !== null)
        {
            // Extract recipe name
            let recipeName = recipe.pathName.split('.')[1];
                if(this.recipesData[recipeName] !== undefined) //TODO: Bypass mod override?! ('|#|')
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

    getRecipeDataFromProducedClassName(className)
    {
        className = className.replace('Build_', 'Desc_').replace('Build_', 'Desc_');

        for(let recipeId in this.recipesData)
        {
            if(this.recipesData[recipeId].produce !== undefined && this.recipesData[recipeId].produce[className] !== undefined)
            {
                return this.recipesData[recipeId];
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

        if(this.itemsData[className] !== undefined)
        {
            this.itemsData[className].id = className;
            return this.itemsData[className];
        }
        for(let i in this.itemsData)
        {
            if(this.itemsData[i].className !== undefined && this.itemsData[i].className === className)
            {
                this.itemsData[i].id = i;
                return this.itemsData[i];
            }
        }
        if(this.toolsData[className] !== undefined)
        {
            this.toolsData[className].id = className;
            return this.toolsData[className];
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
        if(this.itemsData[itemId] !== undefined)
        {
            return this.itemsData[itemId];
        }
        if(this.toolsData[itemId] !== undefined)
        {
            return this.toolsData[itemId];
        }

        console.log('Missing item itemId', itemId);

        return null;
    }

    getItemIdFromDepositTableIndex(currentObject)
    {
        let mResourceDepositTableIndex  = this.getObjectProperty(currentObject, 'mResourceDepositTableIndex');
            switch(mResourceDepositTableIndex)
            {
                case 0:
                    return 'Desc_Stone_C';
                case 1:
                    return 'Desc_OreIron_C';
                case 2:
                    return 'Desc_OreCopper_C';
                case 3:
                    return 'Desc_Coal_C';
                case 4:
                    return 'Desc_OreGold_C';
                case 5:
                    return 'Desc_Sulfur_C';
                case 6:
                    return 'Desc_RawQuartz_C';
                case 7:
                    return 'Desc_OreBauxite_C';
                case 8:
                    return 'Desc_SAM_C';
                case 9:
                    return 'Desc_OreUranium_C';
                default:
                    console.log('Unknown mResourceDepositTableIndex', currentObject);
            }

        return null;
    }

    getBuildingDataFromId(buildingId)
    {
        if(this.buildingsData[buildingId] !== undefined)
        {
            return this.buildingsData[buildingId];
        }

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
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Desc_CyberWagon.Desc_CyberWagon_C'; }
        if(className === '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C'){ className = '/Game/FactoryGame/Buildable/Factory/DroneStation/Desc_DroneTransport.Desc_DroneTransport_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/Desc_Locomotive.Desc_Locomotive_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/Desc_FreightWagon.Desc_FreightWagon_C'; }

        if(className === '/FlexSplines/Track/Build_Track.Build_Track_C'){ className = '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C'; }

        // Create fake angled railings with new width
        if(this.buildingsData.Build_SM_RailingRamp_8x4_01_C === undefined && this.buildingsData.Build_Railing_01_C !== undefined)
        {
            this.buildingsData.Build_SM_RailingRamp_8x4_01_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Railing_01_C));
            this.buildingsData.Build_SM_RailingRamp_8x4_01_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_SM_RailingRamp_8x4_01.Build_SM_RailingRamp_8x4_01_C';
            this.buildingsData.Build_SM_RailingRamp_8x4_01_C.length     = 8;

            this.buildingsData.Build_SM_RailingRamp_8x2_01_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Railing_01_C));
            this.buildingsData.Build_SM_RailingRamp_8x2_01_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_SM_RailingRamp_8x2_01.Build_SM_RailingRamp_8x2_01_C';
            this.buildingsData.Build_SM_RailingRamp_8x2_01_C.length     = 8;

            this.buildingsData.Build_SM_RailingRamp_8x1_01_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Railing_01_C));
            this.buildingsData.Build_SM_RailingRamp_8x1_01_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_SM_RailingRamp_8x1_01.Build_SM_RailingRamp_8x1_01_C';
            this.buildingsData.Build_SM_RailingRamp_8x1_01_C.length     = 8;
        }

        // Add equipment vehicles
        if(this.buildingsData.Desc_GolfCart_C === undefined && this.toolsData.Desc_GolfCart_C !== undefined)
        {
            this.buildingsData.Desc_GolfCart_C                  = JSON.parse(JSON.stringify(this.toolsData.Desc_GolfCart_C));
            this.buildingsData.Desc_GolfCart_C.className        = '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C';
            this.buildingsData.Desc_GolfCart_C.category         = 'vehicle';
        }
        if(this.buildingsData.Desc_GolfcartGold_C === undefined && this.toolsData.Desc_GolfCartGold_C !== undefined)
        {
            this.buildingsData.Desc_GolfcartGold_C              = JSON.parse(JSON.stringify(this.toolsData.Desc_GolfCartGold_C));
            this.buildingsData.Desc_GolfcartGold_C.className    = '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_GolfcartGold.BP_GolfcartGold_C';
            this.buildingsData.Desc_GolfcartGold_C.category     = 'vehicle';
        }

        // Add projectiles
        if(this.buildingsData.BP_FireWorksProjectile_01_C === undefined)
        {
            if(this.itemsData.Desc_Fireworks_Projectile_01_C !== undefined)
            {
                this.buildingsData.BP_FireWorksProjectile_01_C                  = JSON.parse(JSON.stringify(this.itemsData.Desc_Fireworks_Projectile_01_C));
                this.buildingsData.BP_FireWorksProjectile_01_C.className        = '/Game/FactoryGame/Events/Christmas/Fireworks/BP_FireWorksProjectile_01.BP_FireWorksProjectile_01_C';
                this.buildingsData.BP_FireWorksProjectile_01_C.mapUseSlotColor  = false;
                this.buildingsData.BP_FireWorksProjectile_01_C.mapLayer         = 'playerFicsmasLayer';
                this.buildingsData.BP_FireWorksProjectile_01_C.mapColor         = '#00FF00';
                this.buildingsData.BP_FireWorksProjectile_01_C.width            = 0.25;
                this.buildingsData.BP_FireWorksProjectile_01_C.length           = 0.25;
                this.buildingsData.BP_FireWorksProjectile_01_C.height           = 2;
            }
            if(this.itemsData.Desc_Fireworks_Projectile_02_C !== undefined)
            {
                this.buildingsData.BP_FireWorksProjectile_02_C                  = JSON.parse(JSON.stringify(this.itemsData.Desc_Fireworks_Projectile_02_C));
                this.buildingsData.BP_FireWorksProjectile_02_C.className        = '/Game/FactoryGame/Events/Christmas/Fireworks/BP_FireWorksProjectile_02.BP_FireWorksProjectile_02_C';
                this.buildingsData.BP_FireWorksProjectile_02_C.mapUseSlotColor  = false;
                this.buildingsData.BP_FireWorksProjectile_02_C.mapLayer         = 'playerFicsmasLayer';
                this.buildingsData.BP_FireWorksProjectile_02_C.mapColor         = '#00FF00';
                this.buildingsData.BP_FireWorksProjectile_02_C.width            = 0.25;
                this.buildingsData.BP_FireWorksProjectile_02_C.length           = 0.25;
                this.buildingsData.BP_FireWorksProjectile_02_C.height           = 2;
            }
            if(this.itemsData.Desc_Fireworks_Projectile_03_C !== undefined)
            {
                this.buildingsData.BP_FireWorksProjectile_03_C                  = JSON.parse(JSON.stringify(this.itemsData.Desc_Fireworks_Projectile_03_C));
                this.buildingsData.BP_FireWorksProjectile_03_C.className        = '/Game/FactoryGame/Events/Christmas/Fireworks/BP_FireworksProjectile_03.BP_FireworksProjectile_03_C';
                this.buildingsData.BP_FireWorksProjectile_03_C.mapUseSlotColor  = false;
                this.buildingsData.BP_FireWorksProjectile_03_C.mapLayer         = 'playerFicsmasLayer';
                this.buildingsData.BP_FireWorksProjectile_03_C.mapColor         = '#00FF00';
                this.buildingsData.BP_FireWorksProjectile_03_C.width            = 0.25;
                this.buildingsData.BP_FireWorksProjectile_03_C.length           = 0.25;
                this.buildingsData.BP_FireWorksProjectile_03_C.height           = 2;
            }
        }

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



    getFaunaDataFromClassName(className)
    {
        if(this.faunaData[className] !== undefined)
        {
            return this.faunaData[className];
        }

        for(let i in this.faunaData)
        {
            if(this.faunaData[i].className !== undefined && this.faunaData[i].className === className)
            {
                this.faunaData[i].id = i;
                return this.faunaData[i];
            }
        }

        if(className.includes('/Game/FactoryGame/Character/Creature/Wildlife/') || className.includes('/Game/FactoryGame/Character/Creature/Enemy/'))
        {
            console.log('Missing fauna className: ' + className);

            if(typeof Sentry !== 'undefined')
            {
                Sentry.setContext('className', {className: className});
                Sentry.captureMessage('Missing fauna className: ' + className);
            }
        }

        return null;
    }


    getIconSrcFromId(iconId)
    {
        for(let i in this.itemsData)
        {
            if(this.itemsData[i].iconId !== undefined && this.itemsData[i].iconId === iconId)
            {
                return this.itemsData[i].image;
            }
        }
        for(let i in this.toolsData)
        {
            if(this.toolsData[i].iconId !== undefined && this.toolsData[i].iconId === iconId)
            {
                return this.toolsData[i].image;
            }
        }
        for(let i in this.buildingsData)
        {
            if(this.buildingsData[i].iconId !== undefined && this.buildingsData[i].iconId === iconId)
            {
                return this.buildingsData[i].image;
            }
        }

        console.log('Missing iconID: ' + iconId);
        if(typeof Sentry !== 'undefined')
        {
            Sentry.captureMessage('Missing iconID: ' + iconId);
        }

        return this.itemsData.Desc_IronIngot_C.image;
    }

    getBuildingIsOn(currentObject)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/FrackingExtractor/Build_FrackingExtractor.Build_FrackingExtractor_C')
        {
            currentObject = Building_FrackingExtractor.getSmasher(this, currentObject);
        }

        if(currentObject !== null)
        {
            if(this.getObjectProperty(currentObject, 'mIsProductionPaused') !== null)
            {
                return false;
            }
        }

        return true;
    }

    getBuildingIsPowered(currentObject)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/FrackingExtractor/Build_FrackingExtractor.Build_FrackingExtractor_C')
        {
            currentObject = Building_FrackingExtractor.getSmasher(this, currentObject);
        }

        if(currentObject !== null && currentObject.children !== undefined)
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
        }

        return false;
    }

    generateFastPathName(currentObject)
    {
        let pathName    = JSON.parse(JSON.stringify(currentObject.pathName.split('_')));
            pathName.pop();
            pathName.push(Math.floor(Math.random() * Math.floor(2147483647)));

        let newPathName = pathName.join('_');

            if(this.saveGameParser.getTargetObject(newPathName) !== null)
            {
                console.log('Collision detected', newPathName);
                return this.generateFastPathName(currentObject);
            }

        return newPathName;
    }

    updateBuiltWithRecipe(currentObject)
    {
        let mBuiltWithRecipe    = this.getObjectProperty(currentObject, 'mBuiltWithRecipe');
            if(mBuiltWithRecipe !== null)
            {
                let className = currentObject.className.replace('Build_', 'Desc_').replace('Build_', 'Desc_');
                    for(let recipeId in this.recipesData)
                    {
                       if(this.recipesData[recipeId].produce !== undefined && this.recipesData[recipeId].produce[className] !== undefined)
                       {
                           if(mBuiltWithRecipe.pathName !== this.recipesData[recipeId].className)
                           {
                               mBuiltWithRecipe.pathName = this.recipesData[recipeId].className;
                           }

                           return;
                       }
                    }
            }

        return;
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
            marker.on('mouseout', this.closeTooltip.bind(this));

            if(L.Browser.touch)
            {
                marker.on('click', this.showTooltip.bind(this));
            }
        }
    }
    showTooltip(e)
    {
        if(this.tooltipsEnabled === false)
        {
            return;
        }

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
            let tooltipOptions = {sticky: true, opacity: 1};
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C')
                {
                    Building_RailroadSwitchControl.bindTooltip(this, currentObject, tooltipOptions);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C')
                {
                    Building_RailroadTrack.bindTooltip(this, currentObject, tooltipOptions);
                }

            e.target.closeTooltip.bind(this);
            e.target.bindTooltip(content, tooltipOptions);
            e.target.openTooltip();
        }
    }
    closeTooltip(e)
    {
        let currentObject   = this.saveGameParser.getTargetObject(e.target.options.pathName);
            if(currentObject !== null)
            {
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C')
                {
                    Building_RailroadSwitchControl.unbindTooltip(this, currentObject);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C')
                {
                    Building_RailroadTrack.unbindTooltip(this, currentObject);
                }
            }

        e.target.unbindTooltip();
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

                        if(marker.options.extraPattern !== undefined)
                        {
                            this.playerLayers[layerId].subLayer.removeLayer(marker.options.extraPattern);
                        }
                        if(marker.options.extraMarker !== undefined)
                        {
                            this.playerLayers[layerId].subLayer.removeLayer(marker.options.extraMarker);
                        }
                        if(marker.options.haloMarker !== undefined)
                        {
                            this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(marker.options.haloMarker);
                        }

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
            let mBuiltWithRecipe = this.getObjectProperty(currentObject, 'mBuiltWithRecipe')
                if(mBuiltWithRecipe !== null)
                {
                    let recipeName = mBuiltWithRecipe.pathName.split('.')[1];
                        if(this.recipesData[recipeName] !== undefined)
                        {
                            for(let ingredient in this.recipesData[recipeName].ingredients)
                            {
                                for(let i = 0; i < this.recipesData[recipeName].ingredients[ingredient]; i++)
                                {
                                    recipe.push(ingredient);
                                }
                            }
                        }
                }
        }
        else
        {
            // Simple string is 1 item :)
            recipe.push(currentObject);
        }

        for(let i = (storages.length - 1); i >= 0; i--)
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
}