import BaseLayout_Statistics_Player_Inventory   from '../BaseLayout/StatisticsPlayerInventory.js';

export default class BaseLayout_Map_Options
{
    constructor(options)
    {
        this.baseLayout                         = options.baseLayout;

        this.defaultInventorySize               = 16;
        this.defaultArmSlots                    = 1;

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

        let unlockSubSystem                 = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem");
        let timeSubSystem                   = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.TimeSubsystem");

        let mIsBuildingEfficiencyUnlocked   = 0;
        let mIsBuildingOverclockUnlocked    = 0;
        let mIsMapUnlocked                  = 0;

        let mDaySeconds                     = 43200;
        let mNumberOfPassedDays             = 0;

        let mCheatNoCost                    = this.baseLayout.getObjectProperty(this.baseLayout.gameState[0], 'mCheatNoCost', 0);
        let mCheatNoPower                   = this.baseLayout.getObjectProperty(this.baseLayout.gameState[0], 'mCheatNoPower', 0);

        if(unlockSubSystem !== null)
        {
            mIsBuildingEfficiencyUnlocked   = this.baseLayout.getObjectProperty(unlockSubSystem, 'mIsBuildingEfficiencyUnlocked', 0);
            mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(unlockSubSystem, 'mIsBuildingOverclockUnlocked', 0);
            mIsMapUnlocked                  = this.baseLayout.getObjectProperty(unlockSubSystem, 'mIsMapUnlocked', 0);
        }

        if(timeSubSystem !== null)
        {
            mDaySeconds                     = this.baseLayout.getObjectProperty(timeSubSystem, 'mDaySeconds', 43200);
            mNumberOfPassedDays             = this.baseLayout.getObjectProperty(timeSubSystem, 'mNumberOfPassedDays', 0);
        }

        html.push('<div class="form-group row">');
            html.push('<label for="inputSessionName" class="col-sm-3 col-form-label">Session name</label>');
            html.push('<div class="col-sm-9"><input type="text" name="sessionName" class="form-control" id="inputSessionName" value="' + header.sessionName + '"></div>');
        html.push('</div>');

        html.push('<div class="form-group row">');
            html.push('<label for="inputTimeOfDay" class="col-sm-6 col-form-label">Time of day</label>');
            html.push('<div class="col-sm-6"><input type="text" name="timeOfDay" class="form-control text-right" id="inputTimeOfDay" value="' + new Date(1000 * mDaySeconds).toISOString().substr(11, 8) + '" readonly></div>');
        html.push('</div>');
        html.push('<div class="form-group row">');
            html.push('<label for="inputNumberOfPassedDay" class="col-sm-6 col-form-label">Number of passed days</label>');
            html.push('<div class="col-sm-6"><input type="text" name="numberOfPassedDay" class="form-control text-right" id="inputNumberOfPassedDay" value="' + mNumberOfPassedDays + '" readonly></div>');
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
        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputCheatNoCost" id="inputCheatNoCost" ' + ((mCheatNoCost === 1) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputCheatNoCost">No cost?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputCheatNoPower" id="inputCheatNoPower" ' + ((mCheatNoPower === 1) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputCheatNoPower">No power?</label></div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<hr />');
        html.push('<h4>Interactive map (Need a full refresh):</h4>');
        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputUseRadioactivity" id="inputUseRadioactivity" ' + ((this.baseLayout.useRadioactivity === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputUseRadioactivity">Generate radioactivity?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputUseFogOfWar" id="inputUseFogOfWar" ' + ((this.baseLayout.useFogOfWar === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputUseFogOfWar">Generate fog of war?</label></div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" name="inputUseDetailedModels" id="inputUseDetailedModels" ' + ((this.baseLayout.useDetailedModels === true) ? 'checked' : '') + ' /><label class="custom-control-label" for="inputUseDetailedModels">Use detailed models?</label></div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group"><div class="input-group input-group-sm"><div class="input-group-prepend"><label class="input-group-text" for="inputUseSmoothFactor">Detailed models quality</label></div><select class="custom-select" id="inputUseSmoothFactor" style="background: none;">');
        html.push('<option value="0" ' + ((this.baseLayout.useSmoothFactor === 0) ? 'selected' : '') + '>0 (Best quality)</option>');
        html.push('<option value="1" ' + ((this.baseLayout.useSmoothFactor === 1) ? 'selected' : '') + '>1 (Default)</option>');
        html.push('<option value="2" ' + ((this.baseLayout.useSmoothFactor === 2) ? 'selected' : '') + '>2</option>');
        html.push('<option value="3" ' + ((this.baseLayout.useSmoothFactor === 3) ? 'selected' : '') + '>3</option>');
        html.push('<option value="4" ' + ((this.baseLayout.useSmoothFactor === 4) ? 'selected' : '') + '>4</option>');
        html.push('<option value="5" ' + ((this.baseLayout.useSmoothFactor === 5) ? 'selected' : '') + '>5</option>');
        html.push('<option value="6" ' + ((this.baseLayout.useSmoothFactor === 6) ? 'selected' : '') + '>6</option>');
        html.push('<option value="7" ' + ((this.baseLayout.useSmoothFactor === 7) ? 'selected' : '') + '>7</option>');
        html.push('<option value="8" ' + ((this.baseLayout.useSmoothFactor === 8) ? 'selected' : '') + '>8</option>');
        html.push('<option value="9" ' + ((this.baseLayout.useSmoothFactor === 9) ? 'selected' : '') + '>9 (Worst quality)</option>');
        html.push('</select></div></div>');
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

        $('#statisticsModalOptions input').on('keyup click', function(){
            if(this.baseLayout.localStorage !== null)
            {
                this.baseLayout.useRadioactivity   = (($('#inputUseRadioactivity').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapUseRadioactivity', this.baseLayout.useRadioactivity);

                this.baseLayout.useFogOfWar        = (($('#inputUseFogOfWar').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapUseFogOfWar', this.baseLayout.useFogOfWar);

                this.baseLayout.useDetailedModels  = (($('#inputUseDetailedModels').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapUseDetailedModels', this.baseLayout.useDetailedModels);

                this.baseLayout.useSmoothFactor    = parseInt($('#inputUseSmoothFactor').val());
                this.baseLayout.localStorage.setItem('mapUseSmoothFactor', this.baseLayout.useSmoothFactor);
            }



            let header                  = this.baseLayout.saveGameParser.getHeader();

            /*
                Name must be at least 3 characters
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

            for(let i = 0; i < this.baseLayout.gameState.length; i++)
            {
                if(isValidNewSessionName === true)
                {
                    this.baseLayout.setObjectProperty(this.baseLayout.gameState[i], 'mReplicatedSessionName', newSessionName, 'StrProperty');
                }

                this.baseLayout.setObjectProperty(this.baseLayout.gameState[i], 'mCheatNoCost', (($('#inputCheatNoCost').is(':checked') === true) ? 1 : 0), 'BoolProperty');
                this.baseLayout.setObjectProperty(this.baseLayout.gameState[i], 'mCheatNoPower', (($('#inputCheatNoPower').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            }

            this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsBuildingEfficiencyUnlocked', (($('#inputBuildingEfficiencyUnlocked').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsBuildingOverclockUnlocked', (($('#inputBuildingOverclockUnlocked').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsMapUnlocked', (($('#inputGameStateMapUnlocked').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            this.baseLayout.setObjectProperty(unlockSubSystem, 'mCheatNoCost', (($('#inputCheatNoCost').is(':checked') === true) ? 1 : 0), 'BoolProperty');
            this.baseLayout.setObjectProperty(unlockSubSystem, 'mCheatNoPower', (($('#inputCheatNoPower').is(':checked') === true) ? 1 : 0), 'BoolProperty');
        }.bind(this));

        $('#resetFogOfWar').on('click', function(){
            this.baseLayout.resetFogOfWar();
        }.bind(this));

        $('#clearFogOfWar').on('click', function(){
            this.baseLayout.clearFogOfWar();
        }.bind(this));

        $('#resetAllGameProgression').on('click', function(){
            $('#resetAllGameProgression strong').hide();
            $('#resetAllGameProgression i').show();

            setTimeout(function(){
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
                let researchManager = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.ResearchManager");
                if(researchManager !== null)
                {
                    researchManager.properties  = [];
                }

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
                let gamePhaseManager = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.GamePhaseManager");
                if(gamePhaseManager !== null)
                {
                    gamePhaseManager.properties = [];
                }

                // Reset tutorial manager
                let tutorialIntroManager = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.TutorialIntroManager");
                if(tutorialIntroManager !== null)
                {
                    tutorialIntroManager.properties = [];
                    tutorialIntroManager.properties.push({name: "mHasCompletedIntroTutorial", type: "BoolProperty", index: 0, value: 1});
                    tutorialIntroManager.properties.push({name: "mHasCompletedIntroSequence", type: "BoolProperty", index: 0, value: 1});
                    tutorialIntroManager.properties.push({name: "mTradingPostLevel", type: "IntProperty", index: 0, value: 6});
                }

                // Reset players tutorials
                for(let i = 0; i < this.baseLayout.playersState.length; i++)
                {
                    this.baseLayout.deleteObjectProperty(this.baseLayout.playersState[i], 'mLastSchematicTierInUI');
                    this.baseLayout.deleteObjectProperty(this.baseLayout.playersState[i], 'mShoppingList');
                    this.baseLayout.deleteObjectProperty(this.baseLayout.playersState[i], 'mMessageData');
                }

                // Update player inventories
                for(let i = 0; i < this.baseLayout.playersInventory.length; i++)
                {
                    let inventory       = this.baseLayout.getObjectInventory(this.baseLayout.playersInventory[i], 'mInventory', true);

                    for(let j = 0; j < inventory.properties.length; j++)
                    {
                        if(inventory.properties[j].name === 'mAdjustedSizeDiff')
                        {
                            inventory.properties[j].value = 0;
                        }
                        if(inventory.properties[j].name === 'mInventoryStacks' || inventory.properties[j].name === 'mArbitrarySlotSizes' || inventory.properties[j].name === 'mAllowedItemDescriptors')
                        {
                            inventory.properties[j].value.values.splice(this.defaultInventorySize);

                            // Give Xeno Zapper, Always get prepared ^^
                            if(inventory.properties[j].name === 'mInventoryStacks')
                            {
                                inventory.properties[j].value.values[0][0].value.itemName               = '/Game/FactoryGame/Resource/Equipment/ShockShank/BP_EquipmentDescriptorShockShank.BP_EquipmentDescriptorShockShank_C';
                                inventory.properties[j].value.values[0][0].value.properties[0].value    = 1;
                            }
                        }
                    }

                    let armSlot         = this.baseLayout.saveGameParser.getTargetObject(this.baseLayout.playersInventory[i].pathName + '.ArmSlot');
                                          this.baseLayout.deleteObjectProperty(armSlot, 'mEquipmentInSlot');

                    for(let j = 0; j < armSlot.properties.length; j++)
                    {
                        if(armSlot.properties[j].name === 'mAdjustedSizeDiff' || armSlot.properties[j].name === 'mActiveEquipmentIndex')
                        {
                            armSlot.properties[j].value = 0;
                        }
                        if(armSlot.properties[j].name === 'mInventoryStacks' || armSlot.properties[j].name === 'mArbitrarySlotSizes' || armSlot.properties[j].name === 'mAllowedItemDescriptors')
                        {
                            armSlot.properties[j].value.values.splice(this.defaultArmSlots);
                        }
                    }
                }

                // Refresh tabs...
                this.parse();

                let statisticsInventory = new BaseLayout_Statistics_Player_Inventory({
                        baseLayout      : this
                    });
                    statisticsInventory.parse();
            }.bind(this), 250);
        }.bind(this));
    }
}