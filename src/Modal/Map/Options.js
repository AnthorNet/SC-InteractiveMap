import Modal_Map_Players                        from './Players.js';

import Building_SpaceElevator                   from '../../Building/SpaceElevator.js';
import Building_MAM                             from '../../Building/MAM.js';

export default class Modal_Map_Options
{
    constructor(options)
    {
        this.baseLayout                         = options.baseLayout;

        this.defaultAvailableSchematics         = [ // Persistent_Level:PersistentLevel.schematicManager => mAvailableSchematics
            "/Game/FactoryGame/Schematics/Progression/Schematic_1-1.Schematic_1-1_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_1-2.Schematic_1-2_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_1-3.Schematic_1-3_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_2-1.Schematic_2-1_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_2-2.Schematic_2-2_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_2-3.Schematic_2-3_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_2-5.Schematic_2-5_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_3-1.Schematic_3-1_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_3-2.Schematic_3-2_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_3-3.Schematic_3-3_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_3-4.Schematic_3-4_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_4-1.Schematic_4-1_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_4-2.Schematic_4-2_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_4-4.Schematic_4-4_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_5-1.Schematic_5-1_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_5-2.Schematic_5-2_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_5-3.Schematic_5-3_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_5-4.Schematic_5-4_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_6-1.Schematic_6-1_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_6-2.Schematic_6-2_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_6-3.Schematic_6-3_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_6-4.Schematic_6-4_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_7-1.Schematic_7-1_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_7-2.Schematic_7-2_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_7-3.Schematic_7-3_C",
            "/Game/FactoryGame/Schematics/Progression/Schematic_7-4.Schematic_7-4_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial1.Schematic_Tutorial1_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial1_5.Schematic_Tutorial1_5_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial2.Schematic_Tutorial2_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial3.Schematic_Tutorial3_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial4.Schematic_Tutorial4_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial5.Schematic_Tutorial5_C"
        ];
        this.defaultPurchasedSchematics         = [ // Persistent_Level:PersistentLevel.schematicManager => mPurchasedSchematics
            "/Game/FactoryGame/Schematics/Schematic_StartingRecipes.Schematic_StartingRecipes_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial1.Schematic_Tutorial1_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial1_5.Schematic_Tutorial1_5_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial2.Schematic_Tutorial2_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial3.Schematic_Tutorial3_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial4.Schematic_Tutorial4_C",
            "/Game/FactoryGame/Schematics/Tutorial/Schematic_Tutorial5.Schematic_Tutorial5_C"
        ];
        this.defaultAvailableRecipes            = [ // Persistent_Level:PersistentLevel.recipeManager => mAvailableRecipes
            "/Game/FactoryGame/Recipes/Smelter/Recipe_IngotIron.Recipe_IngotIron_C",
            "/Game/FactoryGame/Recipes/Constructor/Recipe_IronPlate.Recipe_IronPlate_C",
            "/Game/FactoryGame/Recipes/Constructor/Recipe_IronRod.Recipe_IronRod_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_TradingPost.Recipe_TradingPost_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_OreIron.Recipe_OreIron_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_OreCopper.Recipe_OreCopper_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_OreBauxite.Recipe_OreBauxite_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_OreCaterium.Recipe_OreCaterium_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_OreUranium.Recipe_OreUranium_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_CrudeOil.Recipe_CrudeOil_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_Sulfur.Recipe_Sulfur_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_Limestone.Recipe_Limestone_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_Coal.Recipe_Coal_C",
            "/Game/FactoryGame/Recipes/RawResources/Recipe_RawQuartz.Recipe_RawQuartz_C",
            "/Game/FactoryGame/Recipes/Equipment/Recipe_XenoZapper.Recipe_XenoZapper_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_WorkBench.Recipe_WorkBench_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_Workshop.Recipe_Workshop_C",
            "/Game/FactoryGame/Recipes/Equipment/Recipe_PortableMiner.Recipe_PortableMiner_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_SmelterBasicMk1.Recipe_SmelterBasicMk1_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_PowerLine.Recipe_PowerLine_C",
            "/Game/FactoryGame/Recipes/Smelter/Recipe_IngotCopper.Recipe_IngotCopper_C",
            "/Game/FactoryGame/Recipes/Constructor/Recipe_Wire.Recipe_Wire_C",
            "/Game/FactoryGame/Recipes/Constructor/Recipe_Cable.Recipe_Cable_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_ConstructorMk1.Recipe_ConstructorMk1_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_PowerPoleMk1.Recipe_PowerPoleMk1_C",
            "/Game/FactoryGame/Recipes/Constructor/Recipe_Concrete.Recipe_Concrete_C",
            "/Game/FactoryGame/Recipes/Constructor/Recipe_Screw.Recipe_Screw_C",
            "/Game/FactoryGame/Recipes/Assembler/Recipe_IronPlateReinforced.Recipe_IronPlateReinforced_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_ConveyorPole.Recipe_ConveyorPole_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_ConveyorBeltMk1.Recipe_ConveyorBeltMk1_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_MinerMk1.Recipe_MinerMk1_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_StorageContainerMk1.Recipe_StorageContainerMk1_C",
            "/Game/FactoryGame/Recipes/Buildings/TowTruck/Recipe_SpaceElevator.Recipe_SpaceElevator_C",
            "/Game/FactoryGame/Recipes/Buildings/Recipe_GeneratorBiomass.Recipe_GeneratorBiomass_C",
            "/Game/FactoryGame/Recipes/Constructor/Recipe_Biomass_Wood.Recipe_Biomass_Wood_C",
            "/Game/FactoryGame/Recipes/Constructor/Recipe_Biomass_Leaves.Recipe_Biomass_Leaves_C"
        ];
        this.defaultScannableResources          = [ // mScannableResources
            "/Game/FactoryGame/Resource/RawResources/OreIron/Desc_OreIron.Desc_OreIron_C",
            "/Game/FactoryGame/Resource/RawResources/OreCopper/Desc_OreCopper.Desc_OreCopper_C",
            "/Game/FactoryGame/Resource/RawResources/Stone/Desc_Stone.Desc_Stone_C"
        ];
    }

    parse()
    {
        $('#statisticsModalOptions').empty();

        let html                            = [];
        let header                          = this.baseLayout.saveGameParser.getHeader();
        let gameState                       = this.baseLayout.saveGameParser.getTargetObject('/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C');

        let unlockSubSystem                 = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem");

        let mIsBuildingEfficiencyUnlocked   = 0;
        let mIsBuildingOverclockUnlocked    = 0;
        let mIsMapUnlocked                  = 0;

        let mCheatNoCost                    = this.baseLayout.getObjectProperty(gameState, 'mCheatNoCost', 0);
        let mCheatNoPower                   = this.baseLayout.getObjectProperty(gameState, 'mCheatNoPower', 0);
        let mCheatNoFuel                    = this.baseLayout.getObjectProperty(gameState, 'mCheatNoFuel', 0);

        if(unlockSubSystem !== null)
        {
            mIsBuildingEfficiencyUnlocked   = this.baseLayout.getObjectProperty(unlockSubSystem, 'mIsBuildingEfficiencyUnlocked', 0);
            mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(unlockSubSystem, 'mIsBuildingOverclockUnlocked', 0);
            mIsMapUnlocked                  = this.baseLayout.getObjectProperty(unlockSubSystem, 'mIsMapUnlocked', 0);
        }

        html.push('<div class="form-group row">');
            html.push('<label for="inputSessionName" class="col-sm-3 col-form-label">Session name</label>');
            html.push('<div class="col-sm-9"><input type="text" name="sessionName" class="form-control" id="inputSessionName" value="' + header.sessionName + '"></div>');
        html.push('</div>');

        html.push('<div class="form-group row">');
            html.push('<label for="inputTimeOfDay" class="col-sm-6 col-form-label">Time of day</label>');
            html.push('<div class="col-sm-6"><input type="text" name="timeOfDay" class="form-control text-right" id="inputTimeOfDay" value="' + new Date(1000 * this.baseLayout.timeSubSystem.getDaySeconds()).toISOString().substr(11, 8) + '" readonly></div>');
        html.push('</div>');
        html.push('<div class="form-group row">');
            html.push('<label for="inputNumberOfPassedDay" class="col-sm-6 col-form-label">Number of passed days</label>');
            html.push('<div class="col-sm-6"><input type="text" name="numberOfPassedDay" class="form-control text-right" id="inputNumberOfPassedDay" value="' + this.baseLayout.timeSubSystem.getNumberOfPassedDays() + '" readonly></div>');
        html.push('</div>');

        html.push('<hr />');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputBuildingEfficiencyUnlocked" id="inputBuildingEfficiencyUnlocked" ' + ((mIsBuildingEfficiencyUnlocked === 1) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputBuildingEfficiencyUnlocked">Building efficiency unlocked?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputBuildingOverclockUnlocked" id="inputBuildingOverclockUnlocked" ' + ((mIsBuildingOverclockUnlocked === 1) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputBuildingOverclockUnlocked">Building overclocking unlocked?</label></div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputGameStateMapUnlocked" id="inputGameStateMapUnlocked" ' + ((mIsMapUnlocked === 1) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputGameStateMapUnlocked">Map unlocked?</label></div>');
        html.push('</div>');

        html.push('<hr />');
        html.push('<h4>Map visibility:</h4>');
        html.push('<div class="row"><div class="col-6">');
        html.push('<button class="btn btn-secondary w-100" id="resetFogOfWar">Hide all map</button>');
        html.push('</div><div class="col-6">');
        html.push('<button class="btn btn-secondary w-100" id="clearFogOfWar">reveal all map</button>');
        html.push('</div></div>');

        html.push('<hr />');
        html.push('<h4>Creative mode:</h4>');
        html.push('<div class="row"><div class="col-4">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputCheatNoCost" id="inputCheatNoCost" ' + ((mCheatNoCost === 1) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputCheatNoCost">No cost?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-4">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputCheatNoPower" id="inputCheatNoPower" ' + ((mCheatNoPower === 1) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputCheatNoPower">No power?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-4">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputCheatNoFuel" id="inputCheatNoFuel" ' + ((mCheatNoFuel === 1) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputCheatNoFuel">No fuel?</label></div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<hr />');
        html.push('<h4>Interactive map (Need a full refresh):</h4>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputShowStructuresOnLoad" id="inputShowStructuresOnLoad" ' + ((this.baseLayout.showStructuresOnLoad === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputShowStructuresOnLoad">Show structures by default?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputShowBuildingsOnLoad" id="inputShowBuildingsOnLoad" ' + ((this.baseLayout.showBuildingsOnLoad === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputShowBuildingsOnLoad">Show buildings by default?</label></div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputShowGeneratorsOnLoad" id="inputShowGeneratorsOnLoad" ' + ((this.baseLayout.showGeneratorsOnLoad === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputShowGeneratorsOnLoad">Show power grid by default?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputShowNodesOnMiners" id="inputShowNodesOnMiners" ' + ((this.baseLayout.showNodesOnMiners === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputShowNodesOnMiners">Show nodes icons on miners?</label></div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputShowTransportationOnLoad" id="inputShowTransportationOnLoad" ' + ((this.baseLayout.showTransportationOnLoad === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputShowTransportationOnLoad">Show transportation by default?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputShowVehicleExtraMarker" id="inputShowVehicleExtraMarker" ' + ((this.baseLayout.showVehicleExtraMarker === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputShowVehicleExtraMarker">Show vehicles map icons?</label></div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputUseRadioactivity" id="inputUseRadioactivity" ' + ((this.baseLayout.useRadioactivity === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputUseRadioactivity">Generate radioactivity?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputUseFogOfWar" id="inputUseFogOfWar" ' + ((this.baseLayout.useFogOfWar === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputUseFogOfWar">Generate fog of war?</label></div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-12">');
        html.push('<div class="form-group"><div class="input-group input-group-sm"><div class="input-group-prepend"><label class="input-group-text" for="inputMapModelsQuality">Models Quality</label></div><select class="custom-select text-white" id="inputMapModelsQuality" style="background: none;">');
        html.push('<option value="low" class="text-secondary" ' + ((this.baseLayout.mapModelsQuality === 'low') ? 'selected' : '') + '>Square (Low)</option>');
        html.push('<option value="medium" class="text-secondary" ' + ((this.baseLayout.mapModelsQuality === 'medium') ? 'selected' : '') + '>Outline (Medium)</option>');
        html.push('<option value="high" class="text-secondary" ' + ((this.baseLayout.mapModelsQuality === 'high') ? 'selected' : '') + '>Ouline + Details (High)</option>');
        html.push('</select></div></div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputShowPatterns" id="inputShowPatterns" ' + ((this.baseLayout.showPatterns === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputShowPatterns">Show patterns?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputShowCollected" id="inputShowCollected" ' + ((this.baseLayout.showCollected === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputShowCollected">Show collected icons?</label></div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<hr />');
        html.push('<h4>Hard reset:</h4>');
        html.push('<div class="row"><div class="col-12">');
        html.push('Enjoy the game as a fresh player while keeping your buildings on the map! Here is a summary of what will be reset:');
        html.push('<ul>');
            html.push('<li>Resources scanner unlocked materials</li>');
            html.push('<li>M.A.M. researches</li>');
            html.push('<li>Unlocked recipes and schematics</li>');
            html.push('<li>Extra inventories slots (Empty all pockets before if you want to keep each player inventory)</li>');
            html.push('<li>Extra arm slots</li>');
            html.push('<li>Mail box</li>');
        html.push('</ul>');
        html.push('</div></div>');
        html.push('<div class="row"><div class="col-12"><button class="btn btn-secondary w-100" id="resetAllGameProgression"><strong>Reset all game progression</strong><i class="fas fa-cog fa-spin" style="display: none;"></i></button></div></div>');

        $('#statisticsModalOptions').html(html.join(''));

        $('#statisticsModalOptions input, #statisticsModalOptions select').on('keyup click', () => {
            if(this.baseLayout.localStorage !== null)
            {
                this.baseLayout.showStructuresOnLoad        = (($('#inputShowStructuresOnLoad').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowStructuresOnLoad', this.baseLayout.showStructuresOnLoad);

                this.baseLayout.showBuildingsOnLoad         = (($('#inputShowBuildingsOnLoad').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowBuildingsOnLoad', this.baseLayout.showBuildingsOnLoad);

                this.baseLayout.showGeneratorsOnLoad        = (($('#inputShowGeneratorsOnLoad').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowGeneratorsOnLoad', this.baseLayout.showGeneratorsOnLoad);

                this.baseLayout.showNodesOnMiners           = (($('#inputShowNodesOnMiners').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowNodesOnMiners', this.baseLayout.showNodesOnMiners);

                this.baseLayout.showCollected               = (($('#inputShowCollected').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowCollected', this.baseLayout.showCollected);

                this.baseLayout.showTransportationOnLoad    = (($('#inputShowTransportationOnLoad').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowTransportationOnLoad', this.baseLayout.showTransportationOnLoad);

                this.baseLayout.showPatterns                = (($('#inputShowPatterns').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowPatterns', this.baseLayout.showPatterns);

                this.baseLayout.showVehicleExtraMarker      = (($('#inputShowVehicleExtraMarker').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowVehicleExtraMarker', this.baseLayout.showVehicleExtraMarker);

                this.baseLayout.useRadioactivity            = (($('#inputUseRadioactivity').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapUseRadioactivity', this.baseLayout.useRadioactivity);

                this.baseLayout.useFogOfWar                 = (($('#inputUseFogOfWar').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapUseFogOfWar', this.baseLayout.useFogOfWar);

                this.baseLayout.mapModelsQuality            = $('#inputMapModelsQuality').val();
                this.baseLayout.localStorage.setItem('mapModelsQuality', this.baseLayout.mapModelsQuality);
            }

            let header                  = this.baseLayout.saveGameParser.getHeader();

            /*
                * Name must be at least 3 characters
                * Name can contain but not be equal to any of the following restricted names
                static const TCHAR* RestrictedNames[] = {   TEXT("CON"), TEXT("PRN"), TEXT("AUX"), TEXT("CLOCK$"), TEXT("NUL"),
                                                 TEXT("COM1"), TEXT("COM2"), TEXT("COM3"), TEXT("COM4"),   TEXT("COM5"), TEXT("COM6"), TEXT("COM7"), TEXT("COM8"), TEXT("COM9"),
                                                 TEXT("LPT1"), TEXT("LPT2"), TEXT("LPT3"), TEXT("LPT4"),   TEXT("LPT5"), TEXT("LPT6"), TEXT("LPT7"), TEXT("LPT8"), TEXT("LPT9") };

                * Name can't contain any of the following characters
                RestrictedChars[] = TEXT("/?:&\\*\"<>|%#@^");
            */
            let newSessionName          = $('#inputSessionName').removeClass('is-invalid').val();

            let isValidNewSessionName   = true;
            let sessionNameRegex        = /[\/?:&\\*"<>|%#@^]/;
                if([...newSessionName].length <= 4 || sessionNameRegex.test(newSessionName) === true || newSessionName === "CLOCK$")
                {
                    $('#inputSessionName').addClass('is-invalid')
                    isValidNewSessionName = false;
                }

            if(isValidNewSessionName === true && newSessionName !== header.sessionName) // Update filename only if session has changed
            {
                this.baseLayout.saveGameParser.fileName = newSessionName + '.sav';
                header.mapOptions                       = header.mapOptions.replace('?sessionName=' + header.sessionName + '?', '?sessionName=' + newSessionName + '?');
                header.sessionName                      = newSessionName;
                $('#saveGameInformation strong').html(newSessionName);

                for(let i = 0; i < this.baseLayout.gameMode.length; i++)
                {
                    this.baseLayout.setObjectProperty(this.baseLayout.gameMode[i], 'mSaveSessionName', newSessionName, 'StrProperty');
                }
            }

            if(isValidNewSessionName === true)
            {
                this.baseLayout.setObjectProperty(gameState, 'mReplicatedSessionName', newSessionName, 'StrProperty');
            }

            if($('#inputCheatNoCost').is(':checked') === true)
            {
                this.baseLayout.setObjectProperty(gameState, 'mCheatNoCost', 1, 'BoolProperty');
            }
            else
            {
                this.baseLayout.deleteObjectProperty(gameState, 'mCheatNoCost');
            }

            if($('#inputCheatNoPower').is(':checked') === true)
            {
                this.baseLayout.setObjectProperty(gameState, 'mCheatNoPower', (($('#inputCheatNoPower').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            }
            else
            {
                this.baseLayout.deleteObjectProperty(gameState, 'mCheatNoPower');
            }

            if($('#inputCheatNoFuel').is(':checked') === true)
            {
                this.baseLayout.setObjectProperty(gameState, 'mCheatNoFuel', (($('#inputCheatNoFuel').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            }
            else
            {
                this.baseLayout.deleteObjectProperty(gameState, 'mCheatNoFuel');
            }

            this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsBuildingEfficiencyUnlocked', (($('#inputBuildingEfficiencyUnlocked').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsBuildingOverclockUnlocked', (($('#inputBuildingOverclockUnlocked').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsMapUnlocked', (($('#inputGameStateMapUnlocked').is(':checked') === true) ? 1 : 0), 'BoolProperty');

            if($('#inputCheatNoCost').is(':checked') === true)
            {
                this.baseLayout.setObjectProperty(unlockSubSystem, 'mCheatNoCost', (($('#inputCheatNoCost').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            }
            else
            {
                this.baseLayout.deleteObjectProperty(unlockSubSystem, 'mCheatNoCost');
            }

            if($('#inputCheatNoPower').is(':checked') === true)
            {
                this.baseLayout.setObjectProperty(unlockSubSystem, 'mCheatNoPower', (($('#inputCheatNoPower').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            }
            else
            {
                this.baseLayout.deleteObjectProperty(unlockSubSystem, 'mCheatNoPower');
            }
        });

        $('#resetFogOfWar').on('click', () => {
            this.baseLayout.mapSubSystem.resetFogOfWar();
        });

        $('#clearFogOfWar').on('click', () => {
            this.baseLayout.mapSubSystem.clearFogOfWar();
        });

        $('#resetAllGameProgression').on('click', () => {
            $('#resetAllGameProgression strong').hide();
            $('#resetAllGameProgression i').show();

            setTimeout(() => {
                if(unlockSubSystem !== null)
                {
                    this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsBuildingEfficiencyUnlocked', 0, 'BoolProperty');
                    this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsBuildingOverclockUnlocked', 0, 'BoolProperty');
                    this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsMapUnlocked', 0, 'BoolProperty');

                    this.baseLayout.setObjectProperty(unlockSubSystem, 'mNumTotalInventorySlots', 22, 'IntProperty');
                    this.baseLayout.deleteObjectProperty(unlockSubSystem, 'mNumTotalArmEquipmentSlots');

                    let scannableResources = this.baseLayout.getObjectProperty(unlockSubSystem, 'mScannableResources');
                    if(scannableResources !== null)
                    {
                        scannableResources.values  = [];
                        for(let j = 0; j < this.defaultScannableResources.length; j++)
                        {
                            scannableResources.values.push({levelName: "", pathName: this.defaultScannableResources[j]});
                        }
                    }
                }

                // Reset MAM
                Building_MAM.reset(this.baseLayout);

                // Reset schematic manager
                let schematicManager = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.schematicManager");
                    if(schematicManager !== null)
                    {
                        this.baseLayout.deleteObjectProperty(schematicManager, 'mPaidOffSchematic');
                        this.baseLayout.deleteObjectProperty(schematicManager, 'mActiveSchematic');

                        let mAvailableSchematics = this.baseLayout.getObjectProperty(schematicManager, 'mAvailableSchematics');
                        if(mAvailableSchematics !== null)
                        {
                            mAvailableSchematics.values  = [];
                            for(let j = 0; j < this.defaultAvailableSchematics.length; j++)
                            {
                                mAvailableSchematics.values.push({levelName: "", pathName: this.defaultAvailableSchematics[j]});
                            }
                        }

                        let mPurchasedSchematics = this.baseLayout.getObjectProperty(schematicManager, 'mPurchasedSchematics');
                        if(mPurchasedSchematics !== null)
                        {
                            mPurchasedSchematics.values  = [];
                            for(let j = 0; j < this.defaultPurchasedSchematics.length; j++)
                            {
                                mPurchasedSchematics.values.push({levelName: "", pathName: this.defaultPurchasedSchematics[j]});
                            }
                        }
                    }

                // Reset recipes manager
                let recipeManager = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.recipeManager");
                    if(recipeManager !== null)
                    {
                        let mAvailableRecipes = this.baseLayout.getObjectProperty(recipeManager, 'mAvailableRecipes');
                        if(mAvailableRecipes !== null)
                        {
                            mAvailableRecipes.values  = [];
                            for(let j = 0; j < this.defaultAvailableRecipes.length; j++)
                            {
                                mAvailableRecipes.values.push({levelName: "", pathName: this.defaultAvailableRecipes[j]});
                            }
                        }
                    }

                // Reset game phase
                Building_SpaceElevator.reset(this.baseLayout);

                // Reset tutorial manager
                let tutorialIntroManager = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.TutorialIntroManager");
                    if(tutorialIntroManager !== null)
                    {
                        tutorialIntroManager.properties = [];
                        tutorialIntroManager.properties.push({name: "mHasCompletedIntroTutorial", type: "BoolProperty", value: 1});
                        tutorialIntroManager.properties.push({name: "mHasCompletedIntroSequence", type: "BoolProperty", value: 1});
                        tutorialIntroManager.properties.push({name: "mTradingPostLevel", type: "IntProperty", value: 6});
                    }

                // Reset players tutorials
                for(let pathName in this.baseLayout.players)
                {
                    this.baseLayout.players[pathName].reset();
                }

                // Refresh tabs...
                this.parse();

                let mapPlayers = new Modal_Map_Players({baseLayout: this.baseLayout});
                    mapPlayers.parse();
            }, 250);
        });
    }
}