import Modal_Map_Players                        from './Players.js';

import Building_SpaceElevator                   from '../../Building/SpaceElevator.js';
import Building_MAM                             from '../../Building/MAM.js';

export default class Modal_Map_Options
{
    constructor(options)
    {
        this.baseLayout                         = options.baseLayout;
    }

    parse()
    {
        $('#statisticsModalOptions').empty();

        let html                            = [];
        let header                          = this.baseLayout.saveGameParser.getHeader();
        let gameState                       = this.baseLayout.gameStateSubSystem.get();

        let unlockSubSystem                 = this.baseLayout.unlockSubSystem.get();

        let mIsBuildingEfficiencyUnlocked   = 0;
        let mIsBuildingOverclockUnlocked    = 0;
        let mIsMapUnlocked                  = 0;

        if(unlockSubSystem !== null)
        {
            mIsBuildingEfficiencyUnlocked   = this.baseLayout.getObjectProperty(unlockSubSystem, 'mIsBuildingEfficiencyUnlocked', 0);
            mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(unlockSubSystem, 'mIsBuildingOverclockUnlocked', 0);
            mIsMapUnlocked                  = this.baseLayout.getObjectProperty(unlockSubSystem, 'mIsMapUnlocked', 0);
        }

        html.push('<div class="form-group row">');
            html.push('<label for="inputSessionName" class="col-sm-3 col-form-label">' + this.baseLayout.translate._('Session name') + '</label>');
            html.push('<div class="col-sm-9"><input type="text" name="sessionName" class="form-control" id="inputSessionName" value="' + header.sessionName + '"></div>');
        html.push('</div>');

        html.push('<div class="form-group row">');
            html.push('<label for="inputSessionVisibility" class="col-sm-3 col-form-label">' + this.baseLayout.translate._('Session type') + '</label>');
            html.push('<div class="col-sm-9"><select name="sessionVisibility" class="form-control" id="inputSessionVisibility">');
                html.push('<option value="0" ' + ((header.sessionVisibility === 0) ? 'selected' : '') + '>' + this.baseLayout.translate._('Private') + '</option>'); // SV_Private
                html.push('<option value="1" ' + ((header.sessionVisibility === 1) ? 'selected' : '') + '>' + this.baseLayout.translate._('Friends Only') + '</option>'); // SV_FriendsOnly
            html.push('</select></div>');
        html.push('</div>');

        html.push('<div class="form-group row">');
            html.push('<label for="inputTimeOfDay" class="col-sm-6 col-form-label">' + this.baseLayout.translate._('Time of day') + '</label>');
            html.push('<div class="col-sm-6"><input type="text" name="timeOfDay" class="form-control text-right" id="inputTimeOfDay" value="' + new Date(1000 * this.baseLayout.timeSubSystem.getDaySeconds()).toISOString().substr(11, 8) + '" readonly></div>');
        html.push('</div>');
        html.push('<div class="form-group row">');
            html.push('<label for="inputNumberOfPassedDay" class="col-sm-6 col-form-label">' + this.baseLayout.translate._('Number of passed days') + '</label>');
            html.push('<div class="col-sm-6"><input type="text" name="numberOfPassedDay" class="form-control text-right" id="inputNumberOfPassedDay" value="' + this.baseLayout.timeSubSystem.getNumberOfPassedDays() + '" readonly></div>');
        html.push('</div>');

        html.push('<hr class="border-secondary" />');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputBuildingEfficiencyUnlocked" id="inputBuildingEfficiencyUnlocked" ' + ((mIsBuildingEfficiencyUnlocked === 1) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputBuildingEfficiencyUnlocked">' + this.baseLayout.translate._('Building efficiency unlocked?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputBuildingOverclockUnlocked" id="inputBuildingOverclockUnlocked" ' + ((mIsBuildingOverclockUnlocked === 1) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputBuildingOverclockUnlocked">' + this.baseLayout.translate._('Building overclocking unlocked?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputGameStateMapUnlocked" id="inputGameStateMapUnlocked" ' + ((mIsMapUnlocked === 1) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputGameStateMapUnlocked">' + this.baseLayout.translate._('Map unlocked?') + '</label>');
            html.push('</div>');
        html.push('</div>');

        html.push('<hr class="border-secondary" />');
        html.push('<h4>' + this.baseLayout.translate._('Map visibility:') + '</h4>');
        html.push('<div class="row"><div class="col-6">');
            html.push('<button class="btn btn-secondary w-100" id="resetFogOfWar">' + this.baseLayout.translate._('Hide all map') + '</button>');
        html.push('</div><div class="col-6">');
            html.push('<button class="btn btn-secondary w-100" id="clearFogOfWar">' + this.baseLayout.translate._('Reveal all map') + '</button>');
        html.push('</div></div>');
        html.push('<div class="row"><div class="col-12">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputUseInternalCoordinates" id="inputUseInternalCoordinates" ' + ((this.baseLayout.satisfactoryMap.showInternalCoordinates === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputUseInternalCoordinates">' + this.baseLayout.translate._('Show coordinates in centimeters (Internal Engine measure)') + '</label>');
            html.push('</div>');
        html.push('</div></div>');

        html.push('<hr class="border-secondary" />');
        html.push('<h4>' + this.baseLayout.translate._('Interactive map (Need a full refresh):') + '</h4>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowPlayersOnLoad" id="inputShowPlayersOnLoad" ' + ((this.baseLayout.showPlayersOnLoad === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowPlayersOnLoad">' + this.baseLayout.translate._('Show player informations by default?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');

        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowStructuresOnLoad" id="inputShowStructuresOnLoad" ' + ((this.baseLayout.showStructuresOnLoad === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowStructuresOnLoad">' + this.baseLayout.translate._('Show structures by default?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowBuildingsOnLoad" id="inputShowBuildingsOnLoad" ' + ((this.baseLayout.showBuildingsOnLoad === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowBuildingsOnLoad">' + this.baseLayout.translate._('Show buildings by default?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowGeneratorsOnLoad" id="inputShowGeneratorsOnLoad" ' + ((this.baseLayout.showGeneratorsOnLoad === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowGeneratorsOnLoad">' + this.baseLayout.translate._('Show power grid by default?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowNodesOnMiners" id="inputShowNodesOnMiners" ' + ((this.baseLayout.showNodesOnMiners === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowNodesOnMiners">' + this.baseLayout.translate._('Show nodes icons on miners?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowTransportationOnLoad" id="inputShowTransportationOnLoad" ' + ((this.baseLayout.showTransportationOnLoad === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowTransportationOnLoad">' + this.baseLayout.translate._('Show transportation by default?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowVehicleExtraMarker" id="inputShowVehicleExtraMarker" ' + ((this.baseLayout.showVehicleExtraMarker === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowVehicleExtraMarker">' + this.baseLayout.translate._('Show vehicles map icons?') + '</label>');
            html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputUseRadioactivity" id="inputUseRadioactivity" ' + ((this.baseLayout.useRadioactivity === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputUseRadioactivity">' + this.baseLayout.translate._('Generate radioactivity?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputUseFogOfWar" id="inputUseFogOfWar" ' + ((this.baseLayout.useFogOfWar === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputUseFogOfWar">' + this.baseLayout.translate._('Generate fog of war?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group"><div class="input-group input-group-sm"><div class="input-group-prepend"><label class="input-group-text" for="inputMapStructuresModelsQuality">Structures Models Quality</label></div><select class="custom-select text-white" id="inputMapStructuresModelsQuality" style="background: none;">');
        html.push('<option value="low" class="text-secondary" ' + ((this.baseLayout.mapStructuresModelsQuality === 'low') ? 'selected' : '') + '>Square (Low)</option>');
        html.push('<option value="medium" class="text-secondary" ' + ((this.baseLayout.mapStructuresModelsQuality === 'medium') ? 'selected' : '') + '>Outline (Medium)</option>');
        html.push('<option value="high" class="text-secondary" ' + ((this.baseLayout.mapStructuresModelsQuality === 'high') ? 'selected' : '') + '>Ouline + Details (High)</option>');
        html.push('</select></div></div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group"><div class="input-group input-group-sm"><div class="input-group-prepend"><label class="input-group-text" for="inputMapModelsQuality">BuildingsModels Quality</label></div><select class="custom-select text-white" id="inputMapModelsQuality" style="background: none;">');
        html.push('<option value="low" class="text-secondary" ' + ((this.baseLayout.mapModelsQuality === 'low') ? 'selected' : '') + '>Square (Low)</option>');
        html.push('<option value="medium" class="text-secondary" ' + ((this.baseLayout.mapModelsQuality === 'medium') ? 'selected' : '') + '>Outline (Medium)</option>');
        html.push('<option value="high" class="text-secondary" ' + ((this.baseLayout.mapModelsQuality === 'high') ? 'selected' : '') + '>Ouline + Details (High)</option>');
        html.push('</select></div></div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowPatterns" id="inputShowPatterns" ' + ((this.baseLayout.showPatterns === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowPatterns">' + this.baseLayout.translate._('Show patterns?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowCollected" id="inputShowCollected" ' + ((this.baseLayout.showCollected === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowCollected">' + this.baseLayout.translate._('Show collected icons?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputShowCircuitsColors" id="inputShowCircuitsColors" ' + ((this.baseLayout.showCircuitsColors === true) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputShowCircuitsColors">' + this.baseLayout.translate._('Show colored power circuits?') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('</div>');
        html.push('</div></div>');

        $('#statisticsModalOptions').html(html.join(''));

        $('#statisticsModalOptions input, #statisticsModalOptions select').on('keyup click', () => {
            if(this.baseLayout.localStorage !== null)
            {
                this.baseLayout.showPlayersOnLoad           = (($('#inputShowPlayersOnLoad').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowPlayersOnLoad', this.baseLayout.showPlayersOnLoad);

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

                this.baseLayout.showCircuitsColors          = (($('#inputShowCircuitsColors').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowCircuitsColors', this.baseLayout.showCircuitsColors);

                this.baseLayout.showVehicleExtraMarker      = (($('#inputShowVehicleExtraMarker').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapShowVehicleExtraMarker', this.baseLayout.showVehicleExtraMarker);

                this.baseLayout.useRadioactivity            = (($('#inputUseRadioactivity').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapUseRadioactivity', this.baseLayout.useRadioactivity);

                this.baseLayout.useFogOfWar                 = (($('#inputUseFogOfWar').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapUseFogOfWar', this.baseLayout.useFogOfWar);

                this.baseLayout.satisfactoryMap.showInternalCoordinates = (($('#inputUseInternalCoordinates').is(':checked') === true) ? true : false);
                this.baseLayout.localStorage.setItem('mapInternalCoordinates', this.baseLayout.satisfactoryMap.showInternalCoordinates);

                this.baseLayout.mapStructuresModelsQuality  = $('#inputMapStructuresModelsQuality').val();
                this.baseLayout.localStorage.setItem('mapStructuresModelsQuality', this.baseLayout.mapStructuresModelsQuality);

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
                    this.baseLayout.setObjectProperty(this.baseLayout.gameMode[i], 'mSaveSessionName', newSessionName, 'Str');
                }
            }

            if(isValidNewSessionName === true)
            {
                this.baseLayout.setObjectProperty(gameState, 'mReplicatedSessionName', newSessionName, 'Str');
            }

            let newSessionVisibility        = parseInt($('#inputSessionVisibility').val());
                header.sessionVisibility    = newSessionVisibility;
                header.mapOptions           = header.mapOptions.replace('?Visibility=SV_Private', '')
                                                               .replace('?Visibility=SV_FriendsOnly', '');

                if(newSessionVisibility === 1)
                {
                    header.mapOptions = header.mapOptions + '?Visibility=SV_FriendsOnly';
                }
                else
                {
                    header.mapOptions = header.mapOptions + '?Visibility=SV_Private';
                }

            if(unlockSubSystem !== null)
            {
                this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsBuildingEfficiencyUnlocked', (($('#inputBuildingEfficiencyUnlocked').is(':checked') === true) ? 1 : 0), 'Bool');
                this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsBuildingOverclockUnlocked', (($('#inputBuildingOverclockUnlocked').is(':checked') === true) ? 1 : 0), 'Bool');
                this.baseLayout.setObjectProperty(unlockSubSystem, 'mIsMapUnlocked', (($('#inputGameStateMapUnlocked').is(':checked') === true) ? 1 : 0), 'Bool');
            }
        });

        $('#resetFogOfWar').on('click', () => {
            this.baseLayout.mapSubSystem.resetFogOfWar();
        });

        $('#clearFogOfWar').on('click', () => {
            this.baseLayout.mapSubSystem.clearFogOfWar();
        });
    }
}