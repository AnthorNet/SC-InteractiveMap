import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

import cloneDeep                                from '../../Lib/cloneDeep.js'

export default class Modal_Map_Hotbars
{
    constructor(options)
    {
        this.baseLayout = options.baseLayout;
        this.clipboard  = (this.baseLayout.localStorage !== null && this.baseLayout.localStorage.getItem('hotbarsClipboard') !== null) ? JSON.parse(this.baseLayout.localStorage.getItem('hotbarsClipboard')) : [];
    }

    parse(options = {})
    {
        $('#statisticsPlayerHotBars').empty();

        let hotbarHeaderHtml    = [];
        let hotbarHtml          = [];

        for(const [pathName, player] of this.baseLayout.players)
        {
            hotbarHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ((player.isHost() === true) ? 'active' : '') + '" data-toggle="tab" href="#playerHotBars-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">');
            hotbarHeaderHtml.push(player.getDisplayName());
            hotbarHeaderHtml.push('</span></li>');

            hotbarHtml.push('<div class="tab-pane fade ' + ((player.isHost() === true) ? 'show active' : '') + '" id="playerHotBars-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '">');
            hotbarHtml.push(this.parsePlayer(player.player, options));
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

        $('#statisticsPlayerHotBars .btn-copy').click(function(e){
            let playerStatePathName = $(e.target).closest('[data-hotbar]').attr('data-pathName');
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                if(playerState !== null)
                {
                    let hotbarSlot          = $(e.target).closest('[data-hotbar]').attr('data-hotbar');
                    let mHotbars            = this.baseLayout.getObjectProperty(playerState, 'mHotbars');
                        if(mHotbars !== null)
                        {
                            let hotbarJson = [{values: []}];

                                for(let j = 0; j < mHotbars.values[parseInt(hotbarSlot)][0].value.values.length; j++)
                                {
                                    let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mHotbars.values[parseInt(hotbarSlot)][0].value.values[j].pathName);
                                        if(currentShortcut !== null)
                                        {
                                            hotbarJson[0].values.push(currentShortcut.properties);
                                        }
                                }

                                this.baseLayout.localStorage.setItem('hotbarsClipboard', JSON.stringify(hotbarJson));
                                this.clipboard = hotbarJson;
                                $('#statisticsPlayerHotBars .btn-paste').show();
                                $('#statisticsPlayerHotBars .btn-pasteAll').hide();
                        }
                }
        }.bind(this));
        $('#statisticsPlayerHotBars .btn-paste').click(function(e){
            if(this.clipboard.length > 0)
            {
                let playerStatePathName = $(e.target).closest('[data-hotbar]').attr('data-pathName');
                let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                    if(playerState !== null)
                    {
                        let hotbarSlot          = $(e.target).closest('[data-hotbar]').attr('data-hotbar');
                        let mHotbars            = this.baseLayout.getObjectProperty(playerState, 'mHotbars');
                            if(mHotbars !== null)
                            {
                                for(let j = 0; j < mHotbars.values[parseInt(hotbarSlot)][0].value.values.length; j++)
                                {
                                    let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mHotbars.values[parseInt(hotbarSlot)][0].value.values[j].pathName);
                                        if(currentShortcut !== null)
                                        {
                                            currentShortcut.properties = cloneDeep(this.clipboard[0].values[j]);
                                        }
                                }

                                this.parse(options);
                            }
                    }
            }
        }.bind(this));
        $('#statisticsPlayerHotBars .btn-delete').click(function(e){
            if(this.clipboard.length > 0)
            {
                let playerStatePathName = $(e.target).closest('[data-hotbar]').attr('data-pathName');
                let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                    if(playerState !== null)
                    {
                        let hotbarSlot          = $(e.target).closest('[data-hotbar]').attr('data-hotbar');
                        let mHotbars            = this.baseLayout.getObjectProperty(playerState, 'mHotbars');
                            if(mHotbars !== null)
                            {
                                for(let j = 0; j < mHotbars.values[parseInt(hotbarSlot)][0].value.values.length; j++)
                                {
                                    let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mHotbars.values[parseInt(hotbarSlot)][0].value.values[j].pathName);
                                        if(currentShortcut !== null)
                                        {
                                            currentShortcut.properties = [];
                                        }
                                }

                                $(e.currentTarget).tooltip('dispose');
                                this.parse(options);
                            }
                    }
            }
        }.bind(this));

        $('#statisticsPlayerHotBars .btn-copyAll').click(function(e){
            let playerStatePathName = $(e.target).closest('[data-pathName]').attr('data-pathName');
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                if(playerState !== null)
                {
                    let mHotbars = this.baseLayout.getObjectProperty(playerState, 'mHotbars');
                        if(mHotbars !== null)
                        {
                            let hotbarJson = [];

                                for(let i = 0; i < mHotbars.values.length; i++)
                                {
                                    hotbarJson.push({values: []});

                                    for(let j = 0; j < mHotbars.values[i][0].value.values.length; j++)
                                    {
                                        let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mHotbars.values[i][0].value.values[j].pathName);
                                            if(currentShortcut !== null)
                                            {
                                                hotbarJson[i].values.push(currentShortcut.properties);
                                            }
                                    }
                                }

                                this.baseLayout.localStorage.setItem('hotbarsClipboard', JSON.stringify(hotbarJson));
                                this.clipboard = hotbarJson;
                                $('#statisticsPlayerHotBars .btn-paste').show();
                                $('#statisticsPlayerHotBars .btn-pasteAll').show();
                        }
                }
        }.bind(this));
        $('#statisticsPlayerHotBars .btn-pasteAll').click(function(e){
            if(this.clipboard.length > 0)
            {
                let playerStatePathName = $(e.target).closest('[data-pathName]').attr('data-pathName');
                let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                    if(playerState !== null)
                    {
                        let mHotbars = this.baseLayout.getObjectProperty(playerState, 'mHotbars');
                            if(mHotbars !== null)
                            {
                                for(let i = 0; i < mHotbars.values.length; i++)
                                {
                                    for(let j = 0; j < mHotbars.values[i][0].value.values.length; j++)
                                    {
                                        let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mHotbars.values[i][0].value.values[j].pathName);
                                            if(currentShortcut !== null)
                                            {
                                                currentShortcut.properties = cloneDeep(this.clipboard[i].values[j]);
                                            }
                                    }
                                }

                                this.parse(options);
                            }
                    }
            }
        }.bind(this));

        if(this.clipboard.length > 0)
        {
            $('#statisticsPlayerHotBars .btn-paste').show();
        }
        if(this.clipboard.length > 1)
        {
            $('#statisticsPlayerHotBars .btn-pasteAll').show();
        }
    }

    parsePlayer(player, options = {})
    {
        let cellWidth           = 86;
        let html                = [];

        let mHotbarsHtml        = this.parseHotbars(player, cellWidth);
        let mPresetHotbarsHtml  = this.parseHotbarsPresets(player, options);

        if(mPresetHotbarsHtml.length === 0)
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

    parseHotbars(player, cellWidth)
    {
        let mHotbars            = this.baseLayout.getObjectProperty(player, 'mHotbars');
        let mHotbarsHtml        = [];

            if(mHotbars !== null)
            {
                mHotbarsHtml.push('<div class="row mb-3" data-pathName="' + player.pathName + '">');
                    mHotbarsHtml.push('<div class="col-6">');
                        mHotbarsHtml.push('<div class="btn btn-info w-100 text-center btn-copyAll"><i class="fas fa-copy mr-1"></i> Copy all hotbars</div>');
                    mHotbarsHtml.push('</div>');
                    mHotbarsHtml.push('<div class="col-6">');
                        mHotbarsHtml.push('<div class="btn btn-info w-100 text-center btn-pasteAll" style="display: none;"><i class="fas fa-paste mr-1"></i> Paste all hotbars</div>');
                    mHotbarsHtml.push('</div>');
                mHotbarsHtml.push('</div>');

                mHotbarsHtml.push('<div class="row">');
                for(let i = 0; i < mHotbars.values.length; i++)
                {
                    mHotbarsHtml.push('<div class="col-12" data-hotbar="' + i + '" data-pathName="' + player.pathName + '">');
                    mHotbarsHtml.push('<div class="d-flex flex-row">');
                    mHotbarsHtml.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 48px;height: ' + cellWidth + 'px;padding: 6px;line-height: ' + cellWidth + 'px;font-size: 20px;"><strong>#' + (i + 1) + '</strong></div>');

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
                                                currentInventory = true;
                                                mHotbarsHtml.push(this.baseLayout.getInventoryImage({image: buildingData.image, name: buildingData.name}, cellWidth));
                                            }
                                    }
                                    else
                                    {
                                        let mCustomizationRecipeToActivate = this.baseLayout.getObjectProperty(currentShortcut, 'mCustomizationRecipeToActivate');
                                            if(mCustomizationRecipeToActivate !== null)
                                            {
                                                if(mCustomizationRecipeToActivate.pathName.startsWith('/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/Recipe_'))
                                                {
                                                    let currentSwatch = mCustomizationRecipeToActivate.pathName.split('.').pop();
                                                        switch(currentSwatch)
                                                        {
                                                            case 'Recipe_Swatch_Custom_C':
                                                                let customColor = this.baseLayout.buildableSubSystem.getPlayerCustomColor();
                                                                    currentInventory = true;
                                                                    mHotbarsHtml.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 50%;padding: 5px;background: linear-gradient(135deg, rgb('
                                                                        + customColor.primaryColor.r + ', ' + customColor.primaryColor.g + ', ' + customColor.primaryColor.b + ') 0%,'
                                                                        + 'rgb(' + customColor.primaryColor.r + ', ' + customColor.primaryColor.g + ', ' + customColor.primaryColor.b + ') 50%,'
                                                                        + 'rgb(' + customColor.secondaryColor.r + ', ' + customColor.secondaryColor.g + ', ' + customColor.secondaryColor.b + ') 51%,'
                                                                        + 'rgb(' + customColor.secondaryColor.r + ', ' + customColor.secondaryColor.g + ', ' + customColor.secondaryColor.b + ') 100%);" data-hover="tooltip" title="Custom Swatch"></div>');
                                                                break;
                                                            default:
                                                                let currentSlot     = parseInt(currentSwatch.replace('Recipe_Swatch_Slot', '').replace('_C'));
                                                                let playerColors    = this.baseLayout.buildableSubSystem.getPlayerColorSlots();
                                                                    if(playerColors[currentSlot] !== undefined)
                                                                    {
                                                                            currentInventory    = true;
                                                                        let swatchName          = 'Swatch ' + currentSlot;
                                                                            if(currentSlot === 0){ swatchName = 'FICSIT Factory'; }
                                                                            if(currentSlot === 16){ swatchName = 'FICSIT Foundation'; }
                                                                            if(currentSlot === 17){ swatchName = 'FICSIT Pipe'; }
                                                                            if(currentSlot === 18){ swatchName = 'Concrete Structure'; }

                                                                        mHotbarsHtml.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 50%;padding: 5px;background: linear-gradient(135deg, rgb('
                                                                            + playerColors[currentSlot].primaryColor.r + ', ' + playerColors[currentSlot].primaryColor.g + ', ' + playerColors[currentSlot].primaryColor.b + ') 0%,'
                                                                            + 'rgb(' + playerColors[currentSlot].primaryColor.r + ', ' + playerColors[currentSlot].primaryColor.g + ', ' + playerColors[currentSlot].primaryColor.b + ') 50%,'
                                                                            + 'rgb(' + playerColors[currentSlot].secondaryColor.r + ', ' + playerColors[currentSlot].secondaryColor.g + ', ' + playerColors[currentSlot].secondaryColor.b + ') 51%,'
                                                                            + 'rgb(' + playerColors[currentSlot].secondaryColor.r + ', ' + playerColors[currentSlot].secondaryColor.g + ', ' + playerColors[currentSlot].secondaryColor.b + ') 100%);" data-hover="tooltip" title="' + swatchName + '"></div>');
                                                                    }
                                                        }
                                                }
                                                else
                                                {
                                                    if(mCustomizationRecipeToActivate.pathName.startsWith('/Game/FactoryGame/Buildable/-Shared/Customization/Patterns/'))
                                                    {

                                                    }
                                                    else
                                                    {
                                                        //console.log('MISSING CASE', mCustomizationRecipeToActivate);
                                                    }
                                                }
                                            }
                                    }
                            }

                            if(currentInventory === null)
                            {
                                mHotbarsHtml.push(this.baseLayout.getInventoryImage(null, cellWidth));
                            }
                    }

                    mHotbarsHtml.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 140px;height: ' + cellWidth + 'px;padding: 6px;align-items: center;justify-content: center;">');
                        mHotbarsHtml.push('<span class="btn btn-secondary mr-1 btn-copy" data-hover="tooltip" title="Copy hotbar"><i class="fas fa-copy"></i></span>');
                        mHotbarsHtml.push('<span class="btn btn-secondary ml-1 btn-paste" data-hover="tooltip" title="Paste hotbar" style="display: none;"><i class="fas fa-paste"></i></span>');
                        mHotbarsHtml.push('<span class="btn btn-danger ml-1 btn-delete" data-hover="tooltip" title="Delete hotbar"><i class="fas fa-trash"></i></span>');
                    mHotbarsHtml.push('</div>');

                    mHotbarsHtml.push('</div>');
                    mHotbarsHtml.push('</div>');
                }
                mHotbarsHtml.push('</div>');
            }

        return mHotbarsHtml;
    }

    parseHotbarsPresets(player)
    {
        let mPresetHotbars      = this.baseLayout.getObjectProperty(player, 'mPresetHotbars');
        let mPresetHotbarsHtml  = [];
        let cellWidth           = 50;

            if(mPresetHotbars !== null)
            {
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

        return mPresetHotbarsHtml;
    }
}