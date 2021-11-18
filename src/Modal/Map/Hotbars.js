export default class Modal_Map_Hotbars
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
    }

    parse(options = {})
    {
        $('#statisticsPlayerHotBars').empty();

        let hotbarHeaderHtml    = [];
        let hotbarHtml          = [];

        for(let pathName in this.baseLayout.players)
        {
            hotbarHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ((this.baseLayout.players[pathName].isHost() === true) ? 'active' : '') + '" data-toggle="tab" href="#playerHotBars-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">');
            hotbarHeaderHtml.push(this.baseLayout.players[pathName].getDisplayName());
            hotbarHeaderHtml.push('</span></li>');
            
            hotbarHtml.push('<div class="tab-pane fade ' + ((this.baseLayout.players[pathName].isHost() === true) ? 'show active' : '') + '" id="playerHotBars-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '">');
            hotbarHtml.push(this.parseHotbarsPlayer(this.baseLayout.players[pathName].player, options));
            hotbarHtml.push('</div>');
        }

        $('#statisticsPlayerHotBars').html('<ul class="nav nav-tabs nav-fill">' + hotbarHeaderHtml.join('') + '</ul><div class="tab-content p-3 border border-top-0">' + hotbarHtml.join('') + '</div>');

        $('#statisticsPlayerHotBars input[name="presetName"]').on('keyup click', function(e){
            let playerStatePathName = $(e.currentTarget).parent().attr('data-pathName');
            let newValue            = $(e.currentTarget).val();
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);

                if(playerState !== null)
                {
                    let mPresetHotbars      = this.baseLayout.getObjectProperty(playerState, 'mPresetHotbars');
                    let currentPreset       = $(e.currentTarget).parent().attr('data-index');

                        if(mPresetHotbars !== null)
                        {
                            for(let j = 0; j < mPresetHotbars.values[currentPreset].length; j++)
                            {
                                if(mPresetHotbars.values[currentPreset][j].name === 'PresetName')
                                {
                                    if(mPresetHotbars.values[currentPreset][j].value !== newValue)
                                    {
                                        mPresetHotbars.values[currentPreset][j].value = newValue;
                                    }
                                    break;
                                }
                            }
                        }
                }
        }.bind(this));
        $('#statisticsPlayerHotBars input[name="presetName"] + .input-group-append .btn-danger').on('click', function(e){
            let playerStatePathName = $(e.currentTarget).parent().parent().attr('data-pathName');
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);

                if(playerState !== null)
                {
                    let mPresetHotbars      = this.baseLayout.getObjectProperty(playerState, 'mPresetHotbars');
                    let currentPreset       = $(e.currentTarget).parent().parent().attr('data-index');

                        if(mPresetHotbars !== null)
                        {
                            mPresetHotbars.values.splice(currentPreset, 1);
                            this.parse({playerState: playerStatePathName, showPresets :true});
                        }
                }
        }.bind(this));
    }

    parseHotbarsPlayer(player, options = {})
    {
        let cellWidth           = 46;
        let html                = [];

        let mHotbarShortcuts    = this.baseLayout.getObjectProperty(player, 'mHotbarShortcuts');
        let mHotbars            = this.baseLayout.getObjectProperty(player, 'mHotbars');
        let mHotbarsHtml        = [];

        let mPresetHotbars      = this.baseLayout.getObjectProperty(player, 'mPresetHotbars');
        let mPresetHotbarsHtml  = [];

        // Convert single format to multiple hotbars...
        if(mHotbarShortcuts !== null && mHotbars === null)
        {
            mHotbars = {values: [[{value: mHotbarShortcuts}]]};
        }

        mHotbarsHtml.push('<div class="row">');
        for(let i = 0; i < mHotbars.values.length; i++)
        {
            mHotbarsHtml.push('<div class="col-6">');
            mHotbarsHtml.push('<div class="d-flex flex-row">');
            mHotbarsHtml.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 40px;height: ' + cellWidth + 'px;padding: 6px;line-height: ' + cellWidth + 'px;"><strong>#' + (i + 1) + '</strong></div>');

            for(let j = 0; j < mHotbars.values[i][0].value.values.length; j++)
            {
                let currentShortcut     = this.baseLayout.saveGameParser.getTargetObject(mHotbars.values[i][0].value.values[j].pathName);
                let currentInventory    = null;

                if(currentShortcut !== null)
                {
                    let mRecipeToActivate     = this.baseLayout.getItemDataFromRecipe(currentShortcut, 'mRecipeToActivate');
                        if(mRecipeToActivate !== null && mRecipeToActivate.produce !== undefined)
                        {
                            let buildingData = this.baseLayout.getBuildingDataFromClassName(Object.keys(mRecipeToActivate.produce)[0].replace(new RegExp(/Desc_/, 'g'), 'Build_'));

                                if(buildingData !== null)
                                {
                                    currentInventory = {image: buildingData.image, name: buildingData.name};
                                }
                        }
                }

                mHotbarsHtml.push(this.baseLayout.getInventoryImage(currentInventory, cellWidth));
            }

            mHotbarsHtml.push('</div>');
            mHotbarsHtml.push('</div>');
        }
        mHotbarsHtml.push('</div>');

        if(mPresetHotbars !== null)
        {
            cellWidth           = 50;
            mPresetHotbarsHtml.push('<div class="row">');

            for(let i = 0; i < mPresetHotbars.values.length; i++)
            {
                if(i > 1)
                {
                    mPresetHotbarsHtml.push('<hr />');
                }

                let currentPresetName  = '';
                let currentIconIndex   = 0;
                let currentShortCuts   = [];

                    for(let j = 0; j < mPresetHotbars.values[i].length; j++)
                    {
                        if(mPresetHotbars.values[i][j].name === 'PresetName')
                        {
                            currentPresetName = mPresetHotbars.values[i][j].value;
                            continue;
                        }

                        if(mPresetHotbars.values[i][j].name === 'IconIndex')
                        {
                            currentIconIndex = mPresetHotbars.values[i][j].value.value;
                            continue;
                        }

                        if(mPresetHotbars.values[i][j].name === 'Hotbar')
                        {
                            currentShortCuts = mPresetHotbars.values[i][j].value;
                            continue;
                        }
                    }


                    mPresetHotbarsHtml.push('<div class="col-sm-6">');

                        mPresetHotbarsHtml.push('<div class="input-group input-group-sm mb-1" data-index="' + i + '" data-pathName="' + player.pathName + '">');
                            mPresetHotbarsHtml.push('<input type="text" name="presetName" class="form-control form-control-sm" value="' + currentPresetName + '">');
                            mPresetHotbarsHtml.push('<div class="input-group-append"><button class="btn btn-danger"><i class="fas fa-trash-alt"></i></button></div>');
                        mPresetHotbarsHtml.push('</div>');

                    mPresetHotbarsHtml.push('<div class="d-flex flex-row">');

                    for(let j = 0; j < currentShortCuts.values[0].value.values.length; j++)
                    {
                        let currentShortcut     = this.baseLayout.saveGameParser.getTargetObject(currentShortCuts.values[0].value.values[j].pathName);
                        let currentInventory    = null;

                        if(currentShortcut !== null)
                        {
                            let mRecipeToActivate     = this.baseLayout.getItemDataFromRecipe(currentShortcut, 'mRecipeToActivate');
                                if(mRecipeToActivate !== null && mRecipeToActivate.produce !== undefined)
                                {
                                    let buildingData = this.baseLayout.getBuildingDataFromClassName(Object.keys(mRecipeToActivate.produce)[0].replace(new RegExp(/Desc_/, 'g'), 'Build_'));

                                        if(buildingData !== null)
                                        {
                                            currentInventory = {image: buildingData.image, name: buildingData.name};
                                        }
                                }
                        }

                        if(j === currentIconIndex)
                        {
                            let currentIconHtml = this.baseLayout.getInventoryImage(currentInventory, cellWidth);
                                currentIconHtml = currentIconHtml.replace('border: 1px solid #000000;', 'border: 2px solid #F47C3C;');
                                currentIconHtml = currentIconHtml.replace('padding: 5px;', 'padding: 4px;');

                                mPresetHotbarsHtml.push(currentIconHtml);
                        }
                        else
                        {
                            mPresetHotbarsHtml.push(this.baseLayout.getInventoryImage(currentInventory, cellWidth));
                        }
                    }

                    mPresetHotbarsHtml.push('</div>');

                    mPresetHotbarsHtml.push('</div>');

            }

            mPresetHotbarsHtml.push('</div>');
        }

        if(mPresetHotbars === null)
        {
            html.push(mHotbarsHtml.join(''));
        }
        else
        {
            let hotbarHeaderHtml    = [];
            let hotbarHtml          = [];
            let showPresets         = (options.showPresets !== undefined) ? options.showPresets : false;

            hotbarHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ( (showPresets === true) ? '' : 'active' ) + '" data-toggle="tab" href="#playerHotBarsPresets-' + player.pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">HotBars</span></li>');
            hotbarHtml.push('<div class="tab-pane fade ' + ( (showPresets === true) ? '' : 'show active' ) + '" id="playerHotBarsPresets-' + player.pathName.replace('Persistent_Level:PersistentLevel.', '') + '">' + mHotbarsHtml.join('') + '</div>');

            hotbarHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ( (showPresets === true) ? 'active' : '' ) + '" data-toggle="tab" href="#playerHotBarsPresetsShow-' + player.pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">HotBar Presets</span></li>');
            hotbarHtml.push('<div class="tab-pane fade ' + ( (showPresets === true) ? 'show active' : '' ) + '" id="playerHotBarsPresetsShow-' + player.pathName.replace('Persistent_Level:PersistentLevel.', '') + '">' + mPresetHotbarsHtml.join('') + '</div>');

            html.push('<ul class="nav nav-tabs nav-fill">' + hotbarHeaderHtml.join('') + '</ul><div class="tab-content p-3 border border-top-0">' + hotbarHtml.join('') + '</div>');
        }

        return html.join('');
    }
}