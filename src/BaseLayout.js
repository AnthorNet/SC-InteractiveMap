/* global L, Promise, Infinity, Intl, Sentry, parseFloat */

import BaseLayout_Selection_Offset              from './BaseLayout/SelectionOffset.js';
import BaseLayout_Selection_Rotate              from './BaseLayout/SelectionRotate.js';
import BaseLayout_Selection_Delete              from './BaseLayout/SelectionDelete.js';
import BaseLayout_Selection_Copy                from './BaseLayout/SelectionCopy.js';

import BaseLayout_ContextMenu                   from './BaseLayout/ContextMenu.js';
import BaseLayout_Tooltip                       from './BaseLayout/Tooltip.js';
import BaseLayout_History                       from './BaseLayout/History.js';
import BaseLayout_Math                          from './BaseLayout/Math.js';

import SubSystem_Buildable                      from './SubSystem/Buildable.js';
import SubSystem_Circuit                        from './SubSystem/Circuit.js';
import SubSystem_Foliage                        from './SubSystem/Foliage.js';

import BaseLayout_Statistics_Production         from './BaseLayout/StatisticsProduction.js';
import BaseLayout_Statistics_Storage            from './BaseLayout/StatisticsStorage.js';
import BaseLayout_Statistics_Collectables       from './BaseLayout/StatisticsCollectables.js';

import Modal                                    from './Modal.js';
import Modal_Buildings                          from './Modal/Buildings.js';
import Modal_ColorSlots                         from './Modal/ColorSlots.js';
import Modal_LightColorSlots                    from './Modal/LightColorSlots.js';
import Modal_MapHotbars                         from './Modal/MapHotbars.js';
import Modal_MapPlayers                         from './Modal/MapPlayers.js';
import Modal_MapOptions                         from './Modal/MapOptions.js';
import Modal_PowerCircuits                      from './Modal/PowerCircuits.js';
import Modal_Schematics                         from './Modal/Schematics.js';
import Modal_Trains                             from './Modal/Trains.js';

import Building_FrackingExtractor               from './Building/FrackingExtractor.js';
import Building_FrackingSmasher                 from './Building/FrackingSmasher.js';
import Building_Locomotive                      from './Building/Locomotive.js';
import Building_Light                           from './Building/Light.js';
import Building_RailroadSwitchControl           from './Building/RailroadSwitchControl.js';
import Building_RailroadTrack                   from './Building/RailroadTrack.js';
import Building_TrainStation                    from './Building/TrainStation.js';

import Spawn_Fill                               from './Spawn/Fill.js';

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

        this.saveGamePipeNetworks               = {};

        this.saveGameRailSwitches               = {};
        this.saveGameRailVehicles               = [];
        this.frackingSmasherCores               = {};

        this.gameMode                           = [];
        this.playersState                       = [];
        this.buildingDataClassNameHashTable     = {};
        this.radioactivityLayerNeedsUpdate      = false;
        this.tooltipsEnabled                    = true;

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

        this.showStructuresOnLoad               = (this.localStorage !== null && this.localStorage.getItem('mapShowStructuresOnLoad') !== null) ? (this.localStorage.getItem('mapShowStructuresOnLoad') === 'true') : true;
        this.showBuildingsOnLoad                = (this.localStorage !== null && this.localStorage.getItem('mapShowBuildingsOnLoad') !== null) ? (this.localStorage.getItem('mapShowBuildingsOnLoad') === 'true') : true;
        this.showGeneratorsOnLoad               = (this.localStorage !== null && this.localStorage.getItem('mapShowGeneratorsOnLoad') !== null) ? (this.localStorage.getItem('mapShowGeneratorsOnLoad') === 'true') : true;
        this.showTransportationOnLoad           = (this.localStorage !== null && this.localStorage.getItem('mapShowTransportationOnLoad') !== null) ? (this.localStorage.getItem('mapShowTransportationOnLoad') === 'true') : true;

        this.showVehicleExtraMarker             = (this.localStorage !== null && this.localStorage.getItem('mapShowVehicleExtraMarker') !== null) ? (this.localStorage.getItem('mapShowVehicleExtraMarker') === 'true') : false;

        this.useRadioactivity                   = (this.localStorage !== null && this.localStorage.getItem('mapUseRadioactivity') !== null) ? (this.localStorage.getItem('mapUseRadioactivity') === 'true') : true;
        this.useFogOfWar                        = (this.localStorage !== null && this.localStorage.getItem('mapUseFogOfWar') !== null) ? (this.localStorage.getItem('mapUseFogOfWar') === 'true') : true;
        this.useDetailedModels                  = (this.localStorage !== null && this.localStorage.getItem('mapUseDetailedModels') !== null) ? (this.localStorage.getItem('mapUseDetailedModels') === 'true') : true;
        this.useSmoothFactor                    = (this.localStorage !== null && this.localStorage.getItem('mapUseSmoothFactor') !== null) ? parseInt(this.localStorage.getItem('mapUseSmoothFactor')) : 1;

        this.availablePowerConnection           = ['.PowerInput', '.PowerConnection', '.PowerConnection1', '.PowerConnection2', '.FGPowerConnection', '.FGPowerConnection1', '.SlidingShoe', '.UpstreamConnection', '.DownstreamConnection'];
        this.availableBeltConnection            = ['.ConveyorAny0', '.ConveyorAny1', '.Input0', '.Input1', '.Input2', '.Input3', '.InPut3', '.Input4', '.Input5', '.Input6', '.Output0', '.Output1', '.Output2', '.Output3'];
        this.availableRailwayConnection         = ['.TrackConnection0', '.TrackConnection1'];
        this.availablePlatformConnection        = ['.PlatformConnection0', '.PlatformConnection1'];
        this.availablePipeConnection            = ['.PipeInputFactory', '.PipeOutputFactory', '.PipelineConnection0', '.PipelineConnection1', '.FGPipeConnectionFactory', '.Connection0', '.Connection1', '.Connection2', '.Connection3', '.ConnectionAny0', '.ConnectionAny1'];
        this.availableHyperPipeConnection       = ['.PipeHyperConnection0', '.PipeHyperConnection1', '.PipeHyperStartConnection'];

        this.detailedModels                     = {};
        this.pipeLetters                        = null;

        this.setDefaultLayers();
    }

    setDefaultLayers()
    {
        this.delayedBadgeCount                  = null;

        this.playerLayers                       = {
            playerRadioactivityLayer                : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: {}},
            playerLightsHaloLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: []},

            playerFoundationsLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], useAltitude: true, filters: []},
            playerLightsLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], useAltitude: true, filters: []},
            playerPillarsLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], useAltitude: true, filters: []},
            playerWallsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], useAltitude: true, filters: []},
            playerWalkwaysLayer                     : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], useAltitude: true, filters: []},
            playerStatuesLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], useAltitude: true},

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
            playerStorageGeneratorsLayer            : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: [], useAltitude: true},

            playerStoragesLayer                     : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], useAltitude: true, filters: []},

            playerVehiculesLayer                    : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], count: 0, useAltitude: true, filters: []},
            playerDronesLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], count: 0, useAltitude: true/*, filters: []*/},
            playerBeltsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], distance: 0, useAltitude: true, filters: []},
            playerPipesLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], distance: 0, useAltitude: true, filters: []},
            playerPipesHyperLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], distance: 0, useAltitude: true, filters: []},

            playerTracksLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], distance: 0, useAltitude: true, filters: []},
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
        $('#statisticsModal span[data-toggle="tab"]').off('shown.bs.tab');
        $('#researchModal').off('show.bs.modal');
        $('#optionsModal').off('show.bs.modal');
        $('#buildingsModal').off('show.bs.modal');

        for(let pathName in this.satisfactoryMap.collectableMarkers)
        {
            this.satisfactoryMap.collectableMarkers[pathName].setOpacity(1);
            delete this.satisfactoryMap.collectableMarkers[pathName].options.extractorPathName;
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

        this.saveGameParser.load(() => {
            if(this.buildingsData === null)
            {
                return new Promise(function(resolve){
                    $('#loaderProgressBar .progress-bar').css('width', '47.5%');
                    $('.loader h6').html('Loading game data...');
                    setTimeout(resolve, 50);
                }.bind(this)).then(() => {
                    $.getJSON(this.dataUrl + '?v=' + this.scriptVersion, function(data)
                    {
                        this.modsData       = data.modsData;
                        this.buildingsData  = data.buildingsData;
                        this.itemsData      = data.itemsData;
                        this.toolsData      = data.toolsData;
                        this.recipesData    = data.recipesData;
                        this.schematicsData = data.schematicsData;

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
            }.bind(this)).then(() => {
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
                    this.detailedModels['/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].scale                                           = 2.3;

                    this.renderObjects();
                }.bind(this));
            });
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
        }

        let countObjects            = objectsKeys.length;
        let parseObjectsProgress    = Math.round(i / countObjects * 100);
        let promises                = [];

        if(countObjects > 500000)
        {
            this.useDetailedModels = false;
        }

        for(i; i < countObjects; i++)
        {
            let currentObject = this.saveGameParser.getTargetObject(objectsKeys[i]);

            // Add menu to nodes...
            if([
                '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C',
                '/Game/FactoryGame/Resource/BP_FrackingSatellite.BP_FrackingSatellite_C',
                '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C',
                '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C'
            ].includes(currentObject.className))
            {
                if(this.satisfactoryMap.collectableMarkers[currentObject.pathName] !== undefined)
                {
                    this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.pathName = currentObject.pathName;
                    this.satisfactoryMap.collectableMarkers[currentObject.pathName].bindContextMenu(this);
                }

                if(currentObject.className !== '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                {
                    continue;
                }
            }

            // Skip
            if([
                '/Game/FactoryGame/Buildable/Factory/TradingPost/BP_StartingPod.BP_StartingPod_C',
                '/Game/FactoryGame/Character/Player/Char_Player.Char_Player_C',

                '/Game/FactoryGame/Schematics/Progression/BP_SchematicManager.BP_SchematicManager_C',
                '/Game/FactoryGame/Recipes/Research/BP_ResearchManager.BP_ResearchManager_C',
                '/Game/FactoryGame/Unlocks/BP_UnlockSubsystem.BP_UnlockSubsystem_C',
                '/Game/FactoryGame/Events/BP_EventSubsystem.BP_EventSubsystem_C',

                '/Game/FactoryGame/Schematics/Progression/BP_GamePhaseManager.BP_GamePhaseManager_C',

                '/Game/FactoryGame/Buildable/Factory/PipeHyper/FGPipeConnectionComponentHyper.FGPipeConnectionComponentHyper_C',

                '/Game/FactoryGame/Resource/BP_FrackingCore.BP_FrackingCore_C',
                '/Game/FactoryGame/World/Hazard/SporeCloudPlant/BP_SporeFlower.BP_SporeFlower_C',

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

                '/Game/FactoryGame/Buildable/Vehicle/BP_VehicleTargetPoint.BP_VehicleTargetPoint_C',

                // MODS
                '/Game/EfficiencyCheckerMod/Buildings/EfficiencyChecker/Build_Pipeline_Stub.Build_Pipeline_Stub_C'
            ].includes(currentObject.className))
            {
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

            if(currentObject.className === '/Script/FactoryGame.FGMapManager')
            {
                if(this.useFogOfWar === true)
                {
                    this.addFogOfWar(currentObject);
                }

                continue;
            }

            /*
            '/Script/FactoryGame.FGResourceSinkSubsystem', //TODO: Handle...

            '/Script/FactoryGame.FGDroneStationInfo',
            '/Script/FactoryGame.FGDroneAction_TakeoffSequence',
            '/Script/FactoryGame.FGDroneAction_DockingSequence',
            '/Script/FactoryGame.FGDroneAction_RequestDocking',
            '/Script/FactoryGame.FGDroneAction_TraversePath',

            '/Script/FactoryGame.FGInventoryComponent',
            '/Script/FactoryGame.FGInventoryComponentEquipment',
            '/Script/FactoryGame.FGInventoryComponentTrash',
            '/Script/FactoryGame.FGPowerInfoComponent',
            '/Script/FactoryGame.FGRecipeShortcut',
            '/Script/FactoryGame.FGHealthComponent',

            '/Script/FactoryGame.FGRailroadTimeTable',
            '/Script/FactoryGame.FGRailroadTrackConnectionComponent',
            '/Script/FactoryGame.FGTrainPlatformConnection',
             */
            if(currentObject.className.startsWith('/Script/FactoryGame.') === true && currentObject.className !== '/Script/FactoryGame.FGItemPickup_Spawnable')
            {
                continue;
            }
            if(currentObject.className.startsWith('/Game/FactoryGame/-Shared/Blueprint/BP_') === true)
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
                        $('.loader h6').html('Rendering objects (' + progress + '%)...');

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
        if(currentObject.className.startsWith('/Game/FactoryGame/') === false)
        {
            for(let modId in this.modsData)
            {
                if(currentObject.className.startsWith('/' + modId + '/') === true || currentObject.className.startsWith('/Game/' + modId + '/') === true)
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
        if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C')
        {
            let playerState = this.addPlayerPosition(currentObject, ((this.ownPlayerPath === currentObject.pathName) ? true : false));
                if(resolve === false)
                {
                    return {layer: 'playerPositionLayer', marker: playerState};
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
             // Pipes
                currentObject.className === '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C'
             || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C'
             || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipeHyper/Build_PipeHyper.Build_PipeHyper_C'
             // Pipe Mods
             || currentObject.className === '/Game/InfiniteLogistics/Buildable/InfinitePipeHyper/Build_InfinitePipeHyper.Build_InfinitePipeHyper_C'
             || currentObject.className === '/Game/InfiniteLogistics/Buildable/InfinitePipeline/Build_InfinitePipeline.Build_InfinitePipeline_C'
             // Belts
             || currentObject.className.search('/Build_ConveyorBeltMk') !== -1
             // Belts Mod
             || (currentObject.className.startsWith('/CoveredConveyor') && currentObject.className.search('lift') === -1)
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
        if(currentObject.className.search('Train/Track/Build_RailroadTrack') !== -1)
        {
            let building = this.addPlayerTrack(currentObject);
                if(resolve === false)
                {
                    return {layer: 'playerTracksLayer', marker: building};
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
                    if(this.useDebug === true && currentObject.className.startsWith('/Game/FactoryGame/Equipment/') === false && currentObject.className.startsWith('/Script/FactoryGame.') === false)
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
                        }.bind(this)).then(() => {
                            this.addLayers((i + 1));
                        });
                }
            }

        console.timeEnd('addMapLayers');

        return new Promise(function(resolve){
            $('#loaderProgressBar .progress-bar').css('width', '100%');
            $('.loader h6').html('Finalize statistics and controls...');
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
            let statisticsCollectables = new BaseLayout_Statistics_Collectables({baseLayout: this});
                statisticsCollectables.get();

            // Player position
            for(let i = 0; i < this.playersState.length; i++)
            {
                this.addPlayerPosition(this.playersState[i], ((this.saveGameParser.playerHostPathName === this.playersState[i].pathName) ? true : false));
            }

            // Global modals
            $('#statisticsModal').on('show.bs.modal', () => {
                $('#statisticsModal a.nav-link[href="#statisticsModalProduction"]').removeClass('active').click();
            });
            $('#statisticsModal').on('hide.bs.modal', () => {
                $('#statisticsModalProduction').html('');
                $('#statisticsModalStorage').html('');
            });
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
                            let mapPlayers = new Modal_MapPlayers({baseLayout: this});
                                mapPlayers.parse();
                            break;
                        case '#statisticsPlayerHotBars':
                            let mapHotbars = new Modal_MapHotbars({baseLayout: this});
                                mapHotbars.parse();
                            break;
                        case '#statisticsModalColorSlots':
                            let mapColorSlots = new Modal_ColorSlots({baseLayout: this});
                                mapColorSlots.parse();
                            break;
                        case '#statisticsModalLightColorSlots':
                            let mapLightColorSlots = new Modal_LightColorSlots({baseLayout: this});
                                mapLightColorSlots.parse();
                            break;
                        case '#statisticsModalCollectables':
                            let statisticsCollectables = new BaseLayout_Statistics_Collectables({baseLayout: this});
                                statisticsCollectables.parse();
                            break;
                        case '#statisticsModalOptions':
                            let mapOptions = new Modal_MapOptions({baseLayout: this});
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
                this.saveGameParser.save();
            });

            // Clipboard control
            this.clipboardControl = new L.Control.ClipboardControl({baseLayout: this});
            this.satisfactoryMap.leafletMap.addControl(this.clipboardControl);

            // Lasso control
            this.lassoControl = new L.Control.SelectAreaFeature({baseLayout: this});
            this.satisfactoryMap.leafletMap.addControl(this.lassoControl);
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
        let mOwnedPawn = this.getObjectProperty(currentObject, 'mOwnedPawn');
            if(mOwnedPawn !== null)
            {
                let currentObjectTarget = this.saveGameParser.getTargetObject(mOwnedPawn.pathName);
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
                        playerMarker.bindContextMenu(this);
                        playerMarker.addTo(this.playerLayers.playerPositionLayer.subLayer);

                        if(isOwnPlayer === true)
                        {
                            this.satisfactoryMap.leafletMap.setView(position, 7);
                        }

                        return playerMarker;
                    }
            }
            else
            {
                console.log('mOwnedPawn not found... Deleting wonky player state', currentObject);

                // Delete wonky player state...
                if(this.playersState.length > 0)
                {
                    for(let i = 0; i < this.playersState.length; i++)
                    {
                        if(this.playersState[i].pathName === currentObject.pathName)
                        {
                            this.playersState.splice(i, 1);
                            break;
                        }
                    }
                }

                this.saveGameParser.deleteObject(currentObject.pathName);
            }


        return null;
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

        let pathName        = this.generateFastPathName({pathName: faunaData.pathName + 'XXX'});

        let newFauna        = {
            type                : 1,
            children            : [{levelName: 'Persistent_Level', pathName: pathName + '.HealthComponent'}],
            className           : className,
            pathName            : pathName,
            entityLevelName     : '',
            entityPathName      : '',
            properties          : [{name: 'mHealthComponent', type: 'ObjectProperty', value: {levelName: 'Persistent_Level', pathName: pathName + '.HealthComponent'}}],
            transform           : {
                rotation            : [0, -0, currentObject.transform.rotation[2], currentObject.transform.rotation[3]],
                translation         : [
                    currentObject.transform.translation[0] + (Math.floor(Math.random() * (800 + 1)) - 400),
                    currentObject.transform.translation[1] + (Math.floor(Math.random() * (800 + 1)) - 400),
                    currentObject.transform.translation[2] + 450 + ( (faunaData.zOffset !== undefined) ? faunaData.zOffset : 0 )
                ]
            }
        };

        if(className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
        {
            layerId = 'playerSpaceRabbitLayer';

            newFauna.children.unshift({levelName: 'Persistent_Level', pathName: pathName + '.mInventory'});

            let currentPlayerObject = this.saveGameParser.getTargetObject(this.saveGameParser.playerHostPathName);
            let mOwnedPawn          = this.getObjectProperty(currentPlayerObject, 'mOwnedPawn');

            newFauna.properties.push({name: 'mFriendActor', type: 'ObjectProperty', value: {levelName: 'Persistent_Level', pathName: mOwnedPawn.pathName}});
            newFauna.properties.push({name: 'mLootTableIndex', type: 'IntProperty', value: 0});
            newFauna.properties.push({name: 'mLootTimerHandle', type: 'StructProperty', value: {handle: 'None', type: 'TimerHandle'}});
            newFauna.properties.push({name: 'mIsPersistent', type: 'BoolProperty', value: 1});

            let newSpaceRabbitInventory     = {
                type            : 0,
                children        : [],
                className       : '/Script/FactoryGame.FGInventoryComponent',
                outerPathName   : pathName, pathName: pathName + '.mInventory',
                properties      : [
                    {
                        name: "mInventoryStacks",
                        structureName: "mInventoryStacks",
                        structureSubType: "InventoryStack",
                        structureType: "StructProperty",
                        type: "ArrayProperty",
                        value: {
                            type: "StructProperty",
                            values: [[{
                                name: "Item",
                                type: "StructProperty",
                                value: {
                                    itemName: "", levelName: "", pathName: "",
                                    type: "InventoryItem",
                                    unk1: 0,
                                    properties: [{name: "NumItems", type: "IntProperty", value: 0}]
                                }
                            }]]
                        }
                    },
                    { name: '"mArbitrarySlotSizes', type: 'ArrayProperty', value: {type: 'IntProperty', values: [0]} },
                    { name: 'mAllowedItemDescriptors', type: 'ArrayProperty', value: {type: 'ObjectProperty', values: [{levelName: '', pathName: ''}]} }
                ]
            };

            this.saveGameParser.addObject(newSpaceRabbitInventory);
        }

        this.saveGameParser.addObject({
            className: '/Script/FactoryGame.FGHealthComponent',
            outerPathName: pathName, pathName: pathName + '.HealthComponent',
            properties: [], type: 0
        });

        let newCreatureSpawnerId = "Persistent_Exploration_2:PersistentLevel.BP_CreatureSpawner432";
        newFauna.properties.push({name: "mOwningSpawner", type: "ObjectProperty", value: {levelName: "Persistent_Exploration_2", pathName: newCreatureSpawnerId}});

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

                if(this.saveGameParser.playerHostPathName === this.playersState[i].pathName)
                {
                    break;
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
                    playerPosition[0] + (Math.floor(Math.random() * (1600 + 1)) - 400),
                    playerPosition[1] + (Math.floor(Math.random() * (1600 + 1)) - 400),
                    playerPosition[2] + Math.floor(Math.random() * (800 + 1))
                ]
            },
            children                : [{levelName: "Persistent_Level", pathName: cratePathName + ".inventory"}],
            properties              : [{
                name                    : "mInventory",
                type                    : "ObjectProperty",
                index                   : 0,
                value                   : {levelName: "Persistent_Level", pathName: cratePathName + ".inventory"}
            }],
            entityLevelName         : "",
            entityPathName          : ""
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
                    index               : 0,
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
        this.pauseMap();

        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = this.getBuildingDataFromClassName(currentObject.className);

        Modal.form({
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
                this.unpauseMap();

                if(form === null || form.angle === null)
                {
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

    updateObjectPosition(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

        let currentRotation     = BaseLayout_Math.getQuaternionToEuler(currentObject.transform.rotation);
        let currentRotationYaw  = Math.round(BaseLayout_Math.clampEulerAxis(currentRotation.yaw) * 1000) / 1000
            if(buildingData !== null && buildingData.mapCorrectedAngle !== undefined)
            {
                currentRotationYaw += buildingData.mapCorrectedAngle;
                currentRotationYaw  = BaseLayout_Math.clampEulerAxis(currentRotationYaw);
            }

        this.pauseMap();

        Modal.form({
            title       : "Position",
            message     : 'Negative offset will move X to the West, Y to the North, and Z down.<br /><strong>NOTE:</strong> A foundation is 800 wide.',
            container   : '#leafletMap',
            inputs      : [
                {
                    label       : 'X',
                    name        : 'x',
                    inputType   : 'coordinate',
                    value       : currentObject.transform.translation[0]
                },
                {
                    label       : 'Y',
                    name        : 'y',
                    inputType   : 'coordinate',
                    value       : currentObject.transform.translation[1]
                },
                {
                    label       : 'Z',
                    name        : 'z',
                    inputType   : 'coordinate',
                    value       : currentObject.transform.translation[2]
                },
                {
                    label       : 'Pitch (Angle between 0 and 360 degrees)',
                    name        : 'pitch',
                    inputType   : 'number',
                    min         : 0,
                    max         : 360,
                    value       : Math.round(BaseLayout_Math.clampEulerAxis(currentRotation.pitch) * 1000) / 1000
                },
                {
                    label       : 'Roll (Angle between -180 and 180 degrees)',
                    name        : 'roll',
                    inputType   : 'number',
                    min         : -180,
                    max         : 180,
                    value       : Math.round(BaseLayout_Math.normalizeEulerAxis(currentRotation.roll) * 1000) / 1000
                },
                {
                    label       : 'Rotation (Angle between 0 and 360 degrees)',
                    name        : 'yaw',
                    inputType   : 'number',
                    min         : 0,
                    max         : 360,
                    value       : currentRotationYaw
                }
            ],
            callback    : function(form)
            {
                this.unpauseMap();

                if(form === null || form.x === null || form.y === null || form.z === null || form.pitch === null || form.roll === null || form.yaw === null)
                {
                    return;
                }

                form.x                                  = parseFloat(form.x);
                form.y                                  = parseFloat(form.y);
                form.z                                  = parseFloat(form.z);
                form.pitch                              = parseFloat(form.pitch);
                form.roll                               = parseFloat(form.roll);
                form.yaw                                = parseFloat(form.yaw);

                if(buildingData !== null && buildingData.mapCorrectedAngle !== undefined)
                {
                    form.yaw -= buildingData.mapCorrectedAngle;
                    form.yaw  = BaseLayout_Math.clampEulerAxis(form.yaw);
                }

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
                this.updateRadioactivityLayer();
            }.bind(this)
        });
    }

    teleportPlayer(marker)
    {
        let currentObject   = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let selectOptions   = [];

        for(let i = 0; i < this.playersState.length; i++)
        {
            if(this.saveGameParser.playerHostPathName === this.playersState[i].pathName)
            {
                selectOptions.push({text: 'Host', value: this.playersState[i].pathName});
            }
            else
            {
                selectOptions.push({text: 'Guest #' + this.playersState[i].pathName.replace('Persistent_Level:PersistentLevel.BP_PlayerState_C_', ''), value: this.playersState[i].pathName});
            }
        }

        this.pauseMap();

        Modal.form({
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
                this.unpauseMap();

                if(form === null || form.playerPathName === null)
                {
                    return;
                }

                let playerStateObject   = this.saveGameParser.getTargetObject(form.playerPathName);
                let mOwnedPawn          = this.getObjectProperty(playerStateObject, 'mOwnedPawn');
                    if(mOwnedPawn !== null)
                    {
                        let currentPlayerObject                             = this.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                            currentPlayerObject.transform.translation       = JSON.parse(JSON.stringify(currentObject.transform.translation));
                            currentPlayerObject.transform.translation[2]   += 400;

                            this.deleteObjectProperty(currentPlayerObject, 'mSavedDrivenVehicle');

                        let currentPlayerMarker                             = this.getMarkerFromPathName(form.playerPathName, 'playerPositionLayer');
                            currentPlayerMarker.setLatLng(this.satisfactoryMap.unproject(currentPlayerObject.transform.translation));
                    }
                    else
                    {
                        Modal.alert('Cannot teleport that player!');
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
        let selectOptions       = this.generateInventoryOptions(currentObject);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

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

        Modal.form({
            title       : '"<strong>' + buildingData.name + '</strong>" Inventory',
            container   : '#leafletMap',
            inputs      : inventoryOptions,
            callback    : function(values)
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
                this.ficsitRadioactiveAlert = undefined;
            }.bind(this)
        });
    }

    fillPlayerStorageBuildingInventoryModal(marker, inventoryProperty = 'mStorageInventory')
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].includes(currentObject.className))
            {
                // Buffer only have the dfluidBox, the fluid is handled with the pipe network ;)
                return this.fillPlayerStorageBuildingInventory(currentObject, null);
            }
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
            {
                inventoryProperty   = 'mInventory';
            }

        let selectOptions       = this.generateInventoryOptions(currentObject, false);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

        Modal.form({
            title       : 'Fill "<strong>' + buildingData.name + '</strong>" Inventory',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'fillWith',
                inputType       : 'selectPicker',
                inputOptions    : selectOptions
            }],
            callback    : function(values)
            {
                if(values === null)
                {
                    return;
                }

                this.fillPlayerStorageBuildingInventory(currentObject, values.fillWith, inventoryProperty);
                this.updateRadioactivityLayer();
                this.ficsitRadioactiveAlert = undefined;
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
                storageObjects      = Building_Locomotive.getFreightWagons(this, currentObject);
            }

        if(fillWith !== null)
        {
            let currentItem     = this.getItemDataFromClassName(fillWith);
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

        for(let i = 0; i < storageObjects.length; i++)
        {
            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].includes(currentObject.className))
            {
                this.setObjectProperty(storageObjects[i], 'mFluidBox', {type: "FluidBox", value: 0}, 'StructProperty');
                continue;
            }

            if(storageObjects[i].className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
            {
                inventoryProperty   = 'mInventory';
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

                Modal.form({
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
                        if(values === null)
                        {
                            return;
                        }

                        if(values.mFluidDescriptor === 'NULL')
                        {
                            this.deleteObjectProperty(currentObjectPipeNetwork, 'mFluidDescriptor');
                        }
                        else
                        {
                            this.setObjectProperty(currentObjectPipeNetwork, 'mFluidDescriptor', {levelName: "", pathName: values.mFluidDescriptor}, 'ObjectProperty');
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
        let selectOptions       = [];
        let isFluidInventory    = false;
        let itemsCategories = {
            ore                 : 'Ores',
            material            : 'Materials',
            component           : 'Components',
            fuel                : 'Fuels',
            ammo                : 'Ammos',
            special             : 'Special',
            statue              : 'Statues',
            ficsmas             : 'FICSMAS Holiday Event',
            waste               : 'Waste',
            mods                : 'Modded items'
        };

        if(currentObject !== null)
        {
            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].includes(currentObject.className))
            {
                isFluidInventory = true;
            }
        }

        if(isFluidInventory === true)
        {
            itemsCategories = {
                liquid          : 'Liquids',
                gas             : 'Gas'
            };
        }

        for(let category in itemsCategories)
        {
            let categoryOptions = [];
                for(let i in this.itemsData)
                {
                    if(this.itemsData[i].className !== undefined && this.itemsData[i].className !== null && this.itemsData[i].category === category)
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

        if(isFluidInventory === false)
        {
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
        }

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

            if(this.playerLayers[layerId].filtersCount !== undefined && currentObject.className.search('/Build_ConveyorLiftMk') === -1)
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
                        let layerId         = this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.layerId;

                        let dataCollected   = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected')) + 1;
                        let dataTotal       = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-total'));

                        // Two nodes...
                        //TODO: Check coordinates...
                        if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode625' || extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode614')
                        {
                            dataCollected++
                        }

                        this.satisfactoryMap.availableLayers[layerId].removeLayer(this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName]);
                        this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.extractorPathName = currentObject.pathName;

                        $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);
                        $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(dataCollected + '/' + dataTotal);
                    }
                }
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
            if(buildingData.category !== 'vehicle' || (buildingData.category === 'vehicle' && this.showVehicleExtraMarker === true))
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
        if(currentObject === null)
        {
            return; //TODO: ???
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
            let buildableSubSystem  = new SubSystem_Buildable({baseLayout: this});

            // See also /Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_Frame_01.Build_Foundation_Frame_01_C && /Game/FactoryGame/Buildable/Building/Foundation/Build_FoundationGlass_01.Build_FoundationGlass_01_C ?
            if(buildingData !== null && buildingData.category === 'foundation')
            {
                let playerColors        = buildableSubSystem.getPlayerColorSlots();
                let primaryColor        = playerColors[16].primaryColor;
                let markerStyle         = {
                    color                   : buildingData.mapColor,
                    fillColor               : 'rgb(' + primaryColor.r + ', ' + primaryColor.g + ', ' + primaryColor.b + ')',
                    fillOpacity             : mapOpacity
                };

                let haveDefaulColorSlot = buildableSubSystem.getObjectPrimaryColorSlot(currentObject, true);
                    if(haveDefaulColorSlot !== null)
                    {
                        let slotPrimaryColor        = buildableSubSystem.getObjectPrimaryColor(currentObject);
                            markerStyle.fillColor   = 'rgb(' + slotPrimaryColor.r + ', ' + slotPrimaryColor.g + ', ' + slotPrimaryColor.b + ')';
                    }

                marker.setStyle(markerStyle);
                return;
            }

            let slotColor = buildableSubSystem.getObjectPrimaryColor(currentObject);
                switch(buildingData.category)
                {
                    case 'pad':
                    case 'walkway':
                    case 'stair':
                        marker.setStyle({
                            color       : 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                            fillColor   : ((buildingData.mapFillColor !== undefined) ? buildingData.mapFillColor : buildingData.mapColor),
                            fillOpacity : mapOpacity
                        });
                        break;
                    case 'wall':
                        marker.setStyle({
                            color       : 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                            fillColor   : 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                            fillOpacity : mapOpacity
                        });
                        break;
                    default:
                        marker.setStyle({
                            color       : buildingData.mapColor,
                            fillColor   : 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                            fillOpacity : mapOpacity
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

        let statisticsSchematics = new Modal_Schematics({
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

        Modal.form({
            title       : 'Update "' + buildingData.name + '" recipe',
            container   : '#leafletMap',
            inputs      : [
                {
                    name            : 'recipe',
                    inputType       : 'select',
                    inputOptions    : selectOptions,
                    value           : ((mCurrentRecipe !== null) ? mCurrentRecipe.pathName : 'NULL')
                }
            ],
            callback    : function(form)
            {
                this.unpauseMap();

                if(form === null || form.recipe === null)
                {
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
                            let splineData = BaseLayout_Math.extractSplineData(this, currentObject);
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
        if(currentObject.children !== undefined)
        {
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
        }

        // Remove belt/track connection if needed
        this.unlinkObjectComponentConnection(currentObject);

        // Does the layer have a distance field to update?
        if(this.playerLayers[layerId].distance !== undefined)
        {
            let splineData = BaseLayout_Math.extractSplineData(this, currentObject);
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
                            let layerId         = this.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.layerId;

                            let dataCollected   = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected')) - 1;
                            let dataTotal       = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-total'));

                            $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);

                            if(dataCollected === 0)
                            {
                                $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(dataTotal);
                            }
                            else
                            {
                                $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(dataCollected + '/' + dataTotal);
                            }

                            this.satisfactoryMap.collectableMarkers[resourceNode.pathName].addTo(this.satisfactoryMap.availableLayers[layerId]);
                            delete this.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.extractorPathName;
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

            let information     = Building_TrainStation.getInformation(this, currentObject);
                if(information !== null)
                {
                    let timeTable = this.getObjectProperty(information, 'TimeTable');
                        if(timeTable !== null)
                        {
                            this.saveGameParser.deleteObject(timeTable.pathName);
                        }

                    this.saveGameParser.deleteObject(information.pathName);
                }
        }

        // Release space elevator!
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C')
        {
            let gameState = this.saveGameParser.getTargetObject('/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C');
                if(gameState !== null)
                {
                    this.setObjectProperty(gameState, 'mIsSpaceElevatorBuilt', 0, 'BoolProperty');
                }
        }

        // Delete extra marker!
        if(marker.relatedTarget.options.extraMarker !== undefined)
        {
            this.playerLayers[layerId].subLayer.removeLayer(marker.relatedTarget.options.extraMarker);
        }
        if(marker.relatedTarget.options.haloMarker !== undefined)
        {
            this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(marker.relatedTarget.options.haloMarker);
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

        let beltCorridor    = L.corridor(
                splineData.points,
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
            let buildableSubSystem  = new SubSystem_Buildable({baseLayout: this});
            let slotColor           = buildableSubSystem.getObjectPrimaryColor(currentObject);
                marker.sourceTarget.setStyle({color: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')', opacity: 0.5});
        }.bind(this));
        beltCorridor.on('mouseout', function(marker){
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
        beltCorridor.fire('mouseout');

        this.autoBindTooltip(beltCorridor);

        if(this.playerLayers[mapLayer].distance !== undefined)
        {
            this.playerLayers[mapLayer].distance += splineData.distance;
        }

        this.playerLayers[mapLayer].elements.push(beltCorridor);

        if(this.playerLayers[mapLayer].filtersCount !== undefined)
        {
            if(this.playerLayers[mapLayer].filtersCount[currentObject.className] === undefined)
            {
                this.playerLayers[mapLayer].filtersCount[currentObject.className] = {distance: 0};
            }
            this.playerLayers[mapLayer].filtersCount[currentObject.className].distance += splineData.distance;
        }

        return {layer: mapLayer, marker: beltCorridor};
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
                            let targetConnectedComponent = this.getObjectProperty(connectedComponent, 'mConnectedComponents');
                                if(targetConnectedComponent !== null)
                                {
                                    for(let j = 0; j < targetConnectedComponent.values.length; j++)
                                    {
                                        let currentConnectedComponent = this.saveGameParser.getTargetObject(targetConnectedComponent.values[j].pathName);
                                            if(currentConnectedComponent !== null)
                                            {
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
                                        if(currentConnectedComponent !== null)
                                        {
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

        let splineData      = BaseLayout_Math.extractSplineData(this, currentObject);
        let trackCorridor   = L.corridor(
                splineData.points,
                {
                    pathName: currentObject.pathName,
                    corridor: 600,
                    color: '#ff69b4',
                    weight: 1,
                    altitude: currentObject.transform.translation[2]
                }
            );

        trackCorridor.bindContextMenu(this);
        trackCorridor.on('mouseover', function(){
            this.setStyle({color: '#bf4e87', opacity: 0.7});
        });
        trackCorridor.on('mouseout', function(){
            this.setStyle({color: '#ff69b4', opacity: 0.9});
        });
        trackCorridor.fire('mouseout');

        this.autoBindTooltip(trackCorridor);

        this.playerLayers.playerTracksLayer.distance += splineData.distance;
        this.playerLayers.playerTracksLayer.elements.push(trackCorridor);

        if(this.playerLayers.playerTracksLayer.filtersCount !== undefined)
        {
            let trackClassName = currentObject.className;
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C')
                {
                    trackClassName = '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C'
                }

            if(this.playerLayers.playerTracksLayer.filtersCount[trackClassName] === undefined)
            {
                this.playerLayers.playerTracksLayer.filtersCount[trackClassName] = {distance: 0};
            }
            this.playerLayers.playerTracksLayer.filtersCount[trackClassName].distance += splineData.distance;
        }

        return trackCorridor;
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
            let currentModelXOffset     = (currentModel.xOffset !== undefined) ? currentModel.xOffset : 0;
            let currentModelYOffset     = (currentModel.yOffset !== undefined) ? currentModel.yOffset : 0;

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
                                center[0] + ((currentModel.forms[i].points[j][0] + currentModelXOffset) * currentModelScale),
                                center[1] + ((currentModel.forms[i].points[j][1] + currentModelYOffset) * currentModelScale)
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
                                        center[0] + ((currentModel.forms[i].holes[j][k][0] + currentModelXOffset) * currentModelScale),
                                        center[1] + ((currentModel.forms[i].holes[j][k][1] + currentModelYOffset) * currentModelScale)
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

            $('.updatePlayerLayerState[data-id=' + layerId + ']').show();
            $(this.playerLayers[layerId].mainDivId).show()
                                                   .parent().show();

            if(this.playerLayers[layerId].mainDivId === '#playerGeneratorsLayer')
            {
                $('#modalPowerCircuits').show();
            }

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

                        if(layerId === 'playerLightsLayer')
                        {
                            if(this.playerLayers.playerLightsHaloLayer.layerGroup.hasLayer(this.playerLayers.playerLightsHaloLayer.subLayer))
                            {
                                this.playerLayers.playerLightsHaloLayer.layerGroup.removeLayer(this.playerLayers.playerLightsHaloLayer.subLayer);
                            }
                        }
                    }
                    else
                    {
                        this.playerLayers[layerId].layerGroup.addLayer(this.playerLayers[layerId].subLayer);
                        $this.addClass(window.SCIM.outlineClass);

                        if(layerId === 'playerLightsLayer')
                        {
                            if($('.updatePlayerLayerState[data-id="playerLightsHaloLayer"]').hasClass(window.SCIM.outlineClass))
                            {
                                this.playerLayers.playerLightsHaloLayer.layerGroup.addLayer(this.playerLayers.playerLightsHaloLayer.subLayer);
                            }
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
                                                if(currentMarker.options.haloMarker !== undefined)
                                                {
                                                    this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(currentMarker.options.haloMarker);
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
                                                            if(currentMarker.options.haloMarker !== undefined)
                                                            {
                                                                this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(currentMarker.options.haloMarker);
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
                            if(currentMarker.options.haloMarker !== undefined)
                            {
                                this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(currentMarker.options.haloMarker);
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
                                                    if(currentMarker.options.haloMarker !== undefined)
                                                    {
                                                        this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(currentMarker.options.haloMarker);
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
                            let currentInventory = this.getObjectProperty(inventoryObject, 'mInventoryStacks');
                                if(currentInventory !== null)
                                {
                                    let radioactivityItems  = [];
                                        for(let k = 0; k < currentInventory.values.length; k++)
                                        {
                                            if(currentInventory.values[k][0].value.itemName !== '')
                                            {
                                                // Rename item
                                                let currentItemData = this.getItemDataFromClassName(currentInventory.values[k][0].value.itemName, false);
                                                    if(currentItemData !== null)
                                                    {
                                                        if(currentItemData.radioactiveDecay !== undefined)
                                                        {
                                                            radioactivityItems.push({
                                                                qty                 : currentInventory.values[k][0].value.properties[0].value,
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

        if(itemQty !== null && inventory.category !== undefined && (inventory.category === 'liquid' || inventory.category === 'gas'))
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
                dataCollected--
                this.deleteObjectProperty(currentObject, 'mHasBeenOpened');
                marker.relatedTarget.setOpacity(1);
            }

        $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);

        if(dataCollected === 0)
        {
            $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(dataTotal);
        }
        else
        {
            $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(dataCollected + '/' + dataTotal);
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
        this.pauseMap();

        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

        Modal.form({
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
                this.unpauseMap();

                if(form === null || form.clockSpeed === null || form.useOwnPowershards === null)
                {
                    return;
                }

                let clockSpeed          = Math.max(1, Math.min(Math.round(form.clockSpeed), 250));
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

    updateObjectColorSlot(marker)
    {
        let currentObject       = this.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = this.getBuildingDataFromClassName(currentObject.className);

        let buildableSubSystem  = new SubSystem_Buildable({baseLayout: this});
        let slotIndex           = buildableSubSystem.getObjectPrimaryColorSlot(currentObject);
        let playerColors        = buildableSubSystem.getPlayerColorSlots();
        let selectOptions       = [];

        for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
        {
            selectOptions.push({
                primaryColor    : 'rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ')',
                value           : slotIndex,
                text            : '#' + (slotIndex + 1)
            });
        }

        if(buildingData.category === 'foundation')
        {
            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[16].primaryColor.r + ', ' + playerColors[16].primaryColor.g + ', ' + playerColors[16].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[16].secondaryColor.r + ', ' + playerColors[16].secondaryColor.g + ', ' + playerColors[16].secondaryColor.b + ')',
                value           : 16,
                text            : 'Default foundations'
            });

            let foundationSlotIndex = buildableSubSystem.getObjectPrimaryColorSlot(currentObject, true);
                if(foundationSlotIndex === null)
                {
                    slotIndex = 16;
                }
        }
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C')
        {
            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[17].primaryColor.r + ', ' + playerColors[17].primaryColor.g + ', ' + playerColors[17].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[17].secondaryColor.r + ', ' + playerColors[17].secondaryColor.g + ', ' + playerColors[17].secondaryColor.b + ')',
                value           : 17,
                text            : 'Default pipes'
            });

            let pipeSlotIndex = buildableSubSystem.getObjectPrimaryColorSlot(currentObject, true);
                if(pipeSlotIndex === null)
                {
                    slotIndex = 17;
                }
        }

        Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" color slot',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'slotIndex',
                inputType       : 'colorSlots',
                inputOptions    : selectOptions,
                value           : slotIndex
            }],
            callback    : function(values)
            {
                if(values === null)
                {
                    return;
                }

                let colorSlot       = this.getObjectProperty(currentObject, 'mColorSlot');
                let newSlotIndex    = parseInt(values.slotIndex);

                if(colorSlot === null && newSlotIndex > 0 && newSlotIndex < SubSystem_Buildable.totalColorSlots)
                {
                    currentObject.properties.push({
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

                let mPrimaryColor   = this.getObjectProperty(currentObject, 'mPrimaryColor');
                    if(mPrimaryColor !== null)
                    {
                        mPrimaryColor.values = {
                            r: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].primaryColor.r),
                            g: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].primaryColor.g),
                            b: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].primaryColor.b)
                        }
                    }
                let mSecondaryColor = this.getObjectProperty(currentObject, 'mSecondaryColor');
                    if(mSecondaryColor !== null)
                    {
                        mSecondaryColor.values = {
                            r: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].secondaryColor.r),
                            g: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].secondaryColor.g),
                            b: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].secondaryColor.b)
                        }
                    }

                marker.relatedTarget.fire('mouseout'); // Trigger a redraw
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
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Desc_CyberWagon.Desc_CyberWagon_C'; }
        if(className === '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C'){ className = '/Game/FactoryGame/Buildable/Factory/DroneStation/Desc_DroneTransport.Desc_DroneTransport_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/Desc_Locomotive.Desc_Locomotive_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/Desc_FreightWagon.Desc_FreightWagon_C'; }

        if(className === '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C' && this.buildingsData.Desc_GolfCart_C === undefined)
        {
            this.buildingsData.Desc_GolfCart_C = {
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

            //TODO: Find proper name and missing class
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
                let className           = currentObject.className.replace('Build_', 'Desc_').replace('Build_', 'Desc_');
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
        let message                 = '';
        let selectedMarkersLength   = 0;
            this.pauseMap();

        if(markers !== null)
        {
            let buildings               = {};
                selectedMarkersLength   = markers.length;
                this.markersSelected    = [];

            for(let i = 0; i < selectedMarkersLength; i++)
            {
                if(markers[i].options.pathName !== undefined)
                {
                    let currentObject       = this.saveGameParser.getTargetObject(markers[i].options.pathName);

                    if(currentObject !== null)
                    {
                        this.markersSelected.push(markers[i]);

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
        }

        let inputOptions = [];
            if(markers !== null)
            {
                inputOptions.push({text: 'Delete selected items', value: 'delete'});
                inputOptions.push({text: 'Update selected items color', value: 'color'});

                inputOptions.push({group: 'Positioning', text: 'Offset selected items position', value: 'offset'});
                inputOptions.push({group: 'Positioning', text: 'Rotate selected items position', value: 'rotate'});

                inputOptions.push({group: 'Blueprints', text: 'Add "Foundation 8m x 2m" helpers on selection boundaries', value: 'helpers'});
                inputOptions.push({group: 'Blueprints', text: 'Copy selected items', value: 'copy'});

                inputOptions.push({group: 'Overclocking', text: 'Offset selected items clock speed', value: 'updateClockSpeed'});

                inputOptions.push({group: 'Downgrade', text: 'Downgrade selected belts/lifts', value: 'downgradeConveyor'});
                inputOptions.push({group: 'Downgrade', text: 'Downgrade selected power poles', value: 'downgradePowerPole'});
                inputOptions.push({group: 'Downgrade', text: 'Downgrade selected pipelines/pumps', value: 'downgradePipeline'});
                inputOptions.push({group: 'Downgrade', text: 'Downgrade selected miners', value: 'downgradeMiners'});

                inputOptions.push({group: 'Upgrade', text: 'Upgrade selected belts/lifts', value: 'upgradeConveyor'});
                inputOptions.push({group: 'Upgrade', text: 'Upgrade selected power poles', value: 'upgradePowerPole'});
                inputOptions.push({group: 'Upgrade', text: 'Upgrade selected pipelines/pumps', value: 'upgradePipeline'});
                inputOptions.push({group: 'Upgrade', text: 'Upgrade selected miners', value: 'upgradeMiners'});
            }

            inputOptions.push({group: 'Foundations', text: 'Fill selection with...', value: 'fillSelection'});

            if(markers !== null)
            {
                inputOptions.push({group: 'Foundations', text: 'Convert "Glass Foundation 8m x 1m" to "Foundation 8m x 1m"', value: 'upgradeGlass8x1ToFoundation8x1'});

                inputOptions.push({group: 'Inventory', text: 'Fill selected storages inventories', value: 'fillStorageInventories'});
                inputOptions.push({group: 'Inventory', text: 'Clear selected storages inventories', value: 'clearStorageInventories'});

                inputOptions.push({group: 'Statistics', text: 'Show selected items production statistics', value: 'productionStatistics'});
                inputOptions.push({group: 'Statistics', text: 'Show selected items storage statistics', value: 'storageStatistics'});
                inputOptions.push({group: 'Statistics', text: 'Show selected power circuits statistics', value: 'powerCircuitsStatistics'});
            }

            // Not working?
            //inputOptions.push({group: 'Flora', text: 'Respawn selection flora', value: 'respawnFlora'});
            //inputOptions.push({group: 'Flora', text: 'Clear selection flora', value: 'clearFlora'});

        Modal.form({
            title       : 'You have selected ' + selectedMarkersLength + ' items',
            message     : message,
            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
            container   : '#leafletMap',
            inputs      : [{
                name            : 'form',
                inputType       : 'select',
                inputOptions    : inputOptions
            }],
            callback    : function(form)
            {
                if(form === null || form.form === null)
                {
                    this.cancelSelectMultipleMarkers();
                    return;
                }

                let buildableSubSystem  = new SubSystem_Buildable({baseLayout: this});

                switch(form.form)
                {
                    case 'delete':
                        Modal.confirm({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            message     : 'Do you want a doggy bag with your mass-dismantling?<br /><em>(You\'ll just get a nice loot crate next to you)</em>',
                            container   : '#leafletMap',
                            buttons     : { confirm: {label: 'Yes'}, cancel: {label: 'No'} },
                            callback    : function(result){
                                return new BaseLayout_Selection_Delete({
                                    baseLayout      : this,
                                    markersSelected : this.markersSelected,
                                    keepDeleted     : result
                                });
                            }.bind(this)
                        });
                        return;

                    case 'offset':
                        Modal.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            message     : 'Negative offset will move X to the West, Y to the North, and Z down.<br /><strong>NOTE:</strong> A foundation is 800 wide.',
                            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
                            container   : '#leafletMap',
                            inputs      : [{
                                label       : 'X',
                                name        : 'offsetX',
                                inputType   : 'coordinate',
                                value       : 0
                            },
                            {
                                label       : 'Y',
                                name        : 'offsetY',
                                inputType   : 'coordinate',
                                value       : 0
                            },
                            {
                                label       : 'Z',
                                name        : 'offsetZ',
                                inputType   : 'coordinate',
                                value       : 0
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
                        Modal.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
                            container   : '#leafletMap',
                            inputs      : [{
                                label       : 'Rotation (Angle between 0 and 360 degrees)',
                                name        : 'angle',
                                inputType   : 'number',
                                value       : 0,
                                min         : 0,
                                max         : 360
                            }],
                            callback    : function(form)
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
                        let playerColors        = buildableSubSystem.getPlayerColorSlots();
                        let selectOptionsColors = [];

                        for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
                        {
                            selectOptionsColors.push({
                                primaryColor    : 'rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ')',
                                secondaryColor  : 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ')',
                                value           : slotIndex,
                                text            : (slotIndex + 1)
                            });
                        }

                        Modal.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            container   : '#leafletMap',
                            inputs      : [{
                                name            : 'slotIndex',
                                inputType       : 'colorSlots',
                                inputOptions    : selectOptionsColors
                            }],
                            callback    : function(form)
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
                        let playerColorsHelpers = buildableSubSystem.getPlayerColorSlots();
                        let selectOptions       = [];

                            for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
                            {
                                selectOptions.push({
                                    primaryColor    : 'rgb(' + playerColorsHelpers[slotIndex].primaryColor.r + ', ' + playerColorsHelpers[slotIndex].primaryColor.g + ', ' + playerColorsHelpers[slotIndex].primaryColor.b + ')',
                                    secondaryColor  : 'rgb(' + playerColorsHelpers[slotIndex].secondaryColor.r + ', ' + playerColorsHelpers[slotIndex].secondaryColor.g + ', ' + playerColorsHelpers[slotIndex].secondaryColor.b + ')',
                                    value           : slotIndex,
                                    text            : (slotIndex + 1)
                                });
                            }

                        Modal.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            container   : '#leafletMap',
                            inputs      : [{
                                name            : 'slotIndex',
                                inputType       : 'colorSlots',
                                inputOptions    : selectOptions
                            }],
                            callback    : function(form)
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

                    case 'downgradeConveyor':
                    case 'downgradePowerPole':
                    case 'downgradePipeline':
                    case 'downgradeMiners':
                        return this.downgradeSelection(form.form);

                    case 'upgradeConveyor':
                    case 'upgradePowerPole':
                    case 'upgradePipeline':
                    case 'upgradeMiners':
                        return this.upgradeSelection(form.form);

                    case 'updateClockSpeed':
                        Modal.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
                            container   : '#leafletMap',
                            inputs      : [
                                {
                                    label       : 'Offset clock speed (Percentage)',
                                    name        : 'offset',
                                    inputType   : 'number',
                                    value       : 0,
                                    min         : 0,
                                    max         : 250
                                },
                                {
                                    label       : 'Use power shards from your containers?',
                                    name        : 'useOwnPowershards',
                                    inputType   : 'toggle'
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

                    case 'fillSelection':
                        return this.fillSelection();
                    case 'upgradeGlass8x1ToFoundation8x1':
                        return this.selectionGlass8x1ToFoundation8x1();

                    case 'fillStorageInventories':
                        Modal.form({
                            title       : 'You have selected ' + selectedMarkersLength + ' items',
                            onEscape    : this.cancelSelectMultipleMarkers.bind(this),
                            container   : '#leafletMap',
                            inputs      : [{
                                name            : 'fillWith',
                                inputType       : 'selectPicker',
                                inputOptions    : this.generateInventoryOptions(null, false)
                            }],
                            callback: function(form)
                            {
                                if(form === null || form.fillWith === null)
                                {
                                    this.cancelSelectMultipleMarkers();
                                    return;
                                }

                               return this.fillStorageInventoriesSelection(form.fillWith);
                            }.bind(this)
                        });
                        return;
                    case 'clearStorageInventories':
                        return this.clearStorageInventoriesSelection();

                    case 'respawnFlora':
                        return SubSystem_Foliage.respawn(this);
                    case 'clearFlora':
                        return SubSystem_Foliage.clear(this);

                    case 'productionStatistics':
                        return this.showSelectionProductionStatistics();
                    case 'storageStatistics':
                        return this.showSelectionStorageStatistics();
                    case 'powerCircuitsStatistics':
                        return this.showModalPowerCircuitsStatistics();
                }
            }.bind(this)
        });
    }

    fillSelection()
    {
        if(this.satisfactoryMap.leafletMap.selectAreaFeature._areaSelected !== null)
        {
            let inputOptions = [];
                for(let i in this.buildingsData)
                {
                    if(this.buildingsData[i].category === 'foundation')
                    {
                        inputOptions.push({
                            dataContent: '<img src="' + this.buildingsData[i].image + '" style="width: 24px;" /> ' + this.buildingsData[i].name,
                            value: this.buildingsData[i].className,
                            text: this.buildingsData[i].name
                        });
                    }
                }

            Modal.form({
                title       : 'Fill selection with...',
                onEscape    : this.cancelSelectMultipleMarkers.bind(this),
                container   : '#leafletMap',
                inputs      : [{
                    name            : 'fillWith',
                    inputType       : 'selectPicker',
                    inputOptions    : inputOptions
                },{
                    name            : 'z',
                    label           : 'Altitude (In centimeters)',
                    inputType       : 'coordinate',
                    value           : 0,
                },
                {
                    label           : 'Use materials from your containers?',
                    name            : 'useOwnMaterials',
                    inputType       : 'toggle'
                }],
                callback: function(form)
                {
                    if(form === null || form.fillWith === null || form.z === null || form.useOwnMaterials === null)
                    {
                        this.cancelSelectMultipleMarkers();
                        return;
                    }

                    return new Spawn_Fill({
                        selection       : this.satisfactoryMap.leafletMap.selectAreaFeature._areaSelected,
                        z               : form.z,
                        fillWith        : form.fillWith,
                        useOwnMaterials : parseInt(form.useOwnMaterials),

                        baseLayout      : this
                    });
                }.bind(this)
            });
        }

        return;
    }

    fillStorageInventoriesSelection(fillWith, inventoryProperty = 'mStorageInventory')
    {
        if(this.markersSelected)
        {
            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let currentObject = this.saveGameParser.getTargetObject(this.markersSelected[i].options.pathName);
                    if(currentObject !== null)
                    {
                        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
                        {
                            inventoryProperty   = 'mInventory';
                        }

                        // Skip locomotive to avoid double freight wagons...
                        if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
                        {
                            continue;
                        }

                        this.fillPlayerStorageBuildingInventory(currentObject, fillWith, inventoryProperty);
                    }
            }
        }

        this.updateRadioactivityLayer();
        this.ficsitRadioactiveAlert = undefined;
        this.cancelSelectMultipleMarkers();
    }

    clearStorageInventoriesSelection(inventoryProperty = 'mStorageInventory')
    {
        if(this.markersSelected)
        {
            for(let i = 0; i < this.markersSelected.length; i++)
            {
                this.clearPlayerStorageBuildingInventory({relatedTarget: this.markersSelected[i]}, inventoryProperty);
            }
        }

        this.updateRadioactivityLayer();
        this.ficsitRadioactiveAlert = undefined;
        this.cancelSelectMultipleMarkers();
    }

    downgradeSelection(callbackName)
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
                            if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name === callbackName)
                            {
                                contextMenu[j].callback({relatedTarget: this.markersSelected[i], baseLayout: this});
                            }
                        }
                    }
            }
        }

        this.cancelSelectMultipleMarkers();
    }

    upgradeSelection(callbackName)
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
                            if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name === callbackName)
                            {
                                contextMenu[j].callback({relatedTarget: this.markersSelected[i], baseLayout: this});
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

    showModalPowerCircuitsStatistics()
    {
        if(this.markersSelected)
        {
            let modalPowerCircuits = new Modal_PowerCircuits({
                    baseLayout      : this,
                    markersSelected : this.markersSelected
                });
                modalPowerCircuits.parse();
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


            let fakeFoundation  = {
                    type            : 1,
                    className       : "/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x2_01.Build_Foundation_8x2_01_C",
                    pathName        : "Persistent_Level:PersistentLevel.Build_Foundation_8x2_01_C_XXX",
                    transform       : {
                        rotation        : [0, 0, 0, 1],
                        translation     : [centerX, centerY, minZ + 100]
                    },
                    properties      : [
                        { name: "mPrimaryColor", type: "StructProperty", value: { type: "LinearColor", values: { r: 0.10946200042963028, g: 0.10946200042963028, b: 0.10946200042963028, a: 1 } } },
                        { name: "mSecondaryColor", type: "StructProperty", value: { type: "LinearColor", values: { r: 0.10946200042963028, g: 0.10946200042963028, b: 0.10946200042963028, a: 1 } } },
                        {name: "mColorSlot", type: "ByteProperty", value: {enumName: "None", value: parseFloat(colorSlotHelper)}},
                        { name: "mBuildingID", type: "IntProperty", value: 25 },
                        { name: "mBuiltWithRecipe", type: "ObjectProperty", value: { levelName: "", pathName: "/Game/FactoryGame/Recipes/Buildings/Foundations/Recipe_Foundation_8x2_01.Recipe_Foundation_8x2_01_C" } },
                        { name: "mBuildTimeStamp", type: "FloatProperty", value: 0 }
                    ],
                    entityLevelName : "Persistent_Level",
                    entityPathName  : "Persistent_Level:PersistentLevel.BuildableSubsystem"
                };
                fakeFoundation.pathName = this.generateFastPathName(fakeFoundation);

            this.saveGameParser.addObject(fakeFoundation);
            let resultCenter = this.parseObject(fakeFoundation);
                this.addElementToLayer(resultCenter.layer, resultCenter.marker);

            let newFoundationTopLeft                    = JSON.parse(JSON.stringify(fakeFoundation));
                newFoundationTopLeft.pathName           = this.generateFastPathName(fakeFoundation);
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
                newFoundationTopRight.pathName          = this.generateFastPathName(fakeFoundation);
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
                newFoundationBottomLeft.pathName        = this.generateFastPathName(fakeFoundation);
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
                newFoundationBottomRight.pathName       = this.generateFastPathName(fakeFoundation);
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
        let maxObjectOffset = 0;
        let minX            = Infinity;
        let maxX            = -Infinity;
        let minY            = Infinity;
        let maxY            = -Infinity;
            for(let i = 0; i < markersSelected.length; i++)
            {
                let currentObject   = this.saveGameParser.getTargetObject(markersSelected[i].options.pathName);
                    if(['/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C', '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C', '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C'].includes(currentObject.className))
                    {
                        continue;
                    }

                let mSplineData     = this.getObjectProperty(currentObject, 'mSplineData');
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

                        continue;
                    }

                let objectOffset    = 0;
                let buildingData    = this.getBuildingDataFromClassName(currentObject.className);
                    if(buildingData !== null && buildingData.category === 'foundation')
                    {
                        objectOffset = 400;
                    }

                    minX            = Math.min(minX, currentObject.transform.translation[0] - objectOffset);
                    maxX            = Math.max(maxX, currentObject.transform.translation[0] + objectOffset);
                    minY            = Math.min(minY, currentObject.transform.translation[1] - objectOffset);
                    maxY            = Math.max(maxY, currentObject.transform.translation[1] + objectOffset);
                    maxObjectOffset = Math.max(objectOffset, maxObjectOffset);
            }

        return {
            minX    : minX + maxObjectOffset,
            maxX    : maxX - maxObjectOffset,
            minY    : minY + maxObjectOffset,
            maxY    : maxY - maxObjectOffset,
            centerX : (minX + maxX) / 2,
            centerY : (minY + maxY) / 2
        };
    }

    pauseMap()
    {
        this.satisfactoryMap.leafletMap.dragging.disable();
        this.satisfactoryMap.leafletMap.keyboard.disable();
        this.satisfactoryMap.leafletMap.doubleClickZoom.disable();
        this.satisfactoryMap.leafletMap.scrollWheelZoom.disable();
    }

    unpauseMap()
    {
        this.satisfactoryMap.leafletMap.dragging.enable();
        this.satisfactoryMap.leafletMap.keyboard.enable();
        this.satisfactoryMap.leafletMap.doubleClickZoom.enable();
        this.satisfactoryMap.leafletMap.scrollWheelZoom.enable();
    }
}
