import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

export default class Modal_Map_Hotbars
{
    constructor(options)
    {
        this.baseLayout     = options.baseLayout;
        this.clipboard      = (this.baseLayout.localStorage !== null && this.baseLayout.localStorage.getItem('hotbarsClipboard') !== null) ? JSON.parse(this.baseLayout.localStorage.getItem('hotbarsClipboard')) : [];
        this.lastPathName   = null;
    }

    parse(options = {})
    {
        $('#statisticsPlayerHotBars').empty();

        let hotbarHeaderHtml    = [];
        let hotbarHtml          = [];

        for(let pathName in this.baseLayout.players)
        {
            if(this.baseLayout.players[pathName].isHost() === true && this.lastPathName === null)
            {
                this.lastPathName = pathName;
            }

            hotbarHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ((pathName === this.lastPathName) ? 'active' : '') + '" data-toggle="tab" href="#playerHotBars-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;" data-pathName="' + pathName +'">');
            hotbarHeaderHtml.push(this.baseLayout.players[pathName].getDisplayName());
            hotbarHeaderHtml.push('</span></li>');

            hotbarHtml.push('<div class="tab-pane fade ' + ((pathName === this.lastPathName) ? 'show active' : '') + '" id="playerHotBars-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '">');
            hotbarHtml.push(this.parsePlayer(this.baseLayout.players[pathName].player, options));
            hotbarHtml.push('</div>');
        }

        $('#statisticsPlayerHotBars').html('<ul class="nav nav-tabs nav-fill">' + hotbarHeaderHtml.join('') + '</ul><div class="tab-content p-3 border border-top-0">' + hotbarHtml.join('') + '</div>');

        $('#statisticsPlayerHotBars span[data-toggle="tab"]').on('show.bs.tab', (e) => {
                this.lastPathName = $(e.target).attr('data-pathName');
            });

        if(this.baseLayout.saveGameParser.header.buildVersion >= 258449)
        {
            this.prepareEvents(options)
        }
        else
        {
            this.prepareOldEvents(options);
        }

        if(this.clipboard.length > 0)
        {
            $('#statisticsPlayerHotBars .btn-paste').show();
        }
        if(this.clipboard.length > 1)
        {
            $('#statisticsPlayerHotBars .btn-pasteAll').show();
        }
    }

    prepareEvents(options)
    {
        $('#statisticsPlayerHotBars .btn-copy').click((e) => {
            let playerStatePathName = $(e.target).closest('[data-hotbar]').attr('data-pathName');
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                if(playerState !== null)
                {
                    let hotbarSlot          = $(e.target).closest('[data-hotbar]').attr('data-hotbar');
                    let mPlayerHotbars      = this.baseLayout.getObjectProperty(playerState, 'mPlayerHotbars');
                        if(mPlayerHotbars !== null)
                        {
                            let hotbarJson      = [{values: []}];
                            let currentHotbar   = this.baseLayout.saveGameParser.getTargetObject(mPlayerHotbars.values[parseInt(hotbarSlot)].pathName);
                                if(currentHotbar !== null)
                                {
                                    let mShortcuts  = this.baseLayout.getObjectProperty(currentHotbar, 'mShortcuts');
                                        if(mShortcuts !== null)
                                        {
                                            for(let j = 0; j < mShortcuts.values.length; j++)
                                            {
                                                let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mShortcuts.values[j].pathName);
                                                    if(currentShortcut !== null)
                                                    {
                                                        hotbarJson[0].values.push(currentShortcut.properties);
                                                    }
                                            }
                                        }
                                }

                            this.baseLayout.localStorage.setItem('hotbarsClipboard', JSON.stringify(hotbarJson));
                            this.clipboard = hotbarJson;
                            $('#statisticsPlayerHotBars .btn-paste').show();
                            $('#statisticsPlayerHotBars .btn-pasteAll').hide();
                        }
                }
        });
        $('#statisticsPlayerHotBars .btn-paste').click((e) => {
            if(this.clipboard.length > 0)
            {
                let playerStatePathName = $(e.target).closest('[data-hotbar]').attr('data-pathName');
                let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                    if(playerState !== null)
                    {
                        let hotbarSlot          = $(e.target).closest('[data-hotbar]').attr('data-hotbar');
                        let mPlayerHotbars      = this.baseLayout.getObjectProperty(playerState, 'mPlayerHotbars');
                            if(mPlayerHotbars !== null)
                            {
                                let currentHotbar   = this.baseLayout.saveGameParser.getTargetObject(mPlayerHotbars.values[parseInt(hotbarSlot)].pathName);
                                    if(currentHotbar !== null)
                                    {
                                        let mShortcuts  = this.baseLayout.getObjectProperty(currentHotbar, 'mShortcuts');
                                            if(mShortcuts !== null)
                                            {
                                                for(let j = 0; j < mShortcuts.values.length; j++)
                                                {
                                                    let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mShortcuts.values[j].pathName);
                                                        if(currentShortcut !== null)
                                                        {
                                                            currentShortcut.properties = JSON.parse(JSON.stringify(this.clipboard[0].values[j]));
                                                        }
                                                        else
                                                        {
                                                            let newShortCutPathName = this.baseLayout.generateFastPathName({pathName: 'Persistent_Level:PersistentLevel.BP_PlayerState_C_' + playerStatePathName.split('_').pop() + '.FGPlayerHotbar_' + currentHotbar.pathName.split('_').pop() + '.FGRecipeShortcut_XXX'});
                                                            let newShortCut         = {
                                                                    className       : '/Script/FactoryGame.FGRecipeShortcut',
                                                                    pathName        : newShortCutPathName,
                                                                    outerPathName   : currentHotbar.pathName,
                                                                    properties      : JSON.parse(JSON.stringify(this.clipboard[0].values[j]))
                                                                };
                                                                this.baseLayout.saveGameParser.addObject(newShortCut);
                                                                mShortcuts.values[j].pathName = newShortCutPathName;
                                                        }
                                                }
                                            }
                                    }

                                $(e.currentTarget).tooltip('dispose');
                                this.parse(options);
                            }
                    }
            }
        });
        $('#statisticsPlayerHotBars .btn-delete').click((e) => {
            let playerStatePathName = $(e.target).closest('[data-hotbar]').attr('data-pathName');
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                if(playerState !== null)
                {
                    let hotbarSlot          = $(e.target).closest('[data-hotbar]').attr('data-hotbar');
                    let mPlayerHotbars      = this.baseLayout.getObjectProperty(playerState, 'mPlayerHotbars');
                        if(mPlayerHotbars !== null)
                        {
                            let currentHotbar = this.baseLayout.saveGameParser.getTargetObject(mPlayerHotbars.values[parseInt(hotbarSlot)].pathName);
                                if(currentHotbar !== null)
                                {
                                    let mShortcuts  = this.baseLayout.getObjectProperty(currentHotbar, 'mShortcuts');
                                        if(mShortcuts !== null)
                                        {
                                            for(let j = 0; j < mShortcuts.values.length; j++)
                                            {
                                                let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mShortcuts.values[j].pathName);
                                                    if(currentShortcut !== null)
                                                    {
                                                        currentShortcut.properties = [];
                                                    }
                                            }
                                        }
                                }

                            $(e.currentTarget).tooltip('dispose');
                            this.parse(options);
                        }
                }
        });

        $('#statisticsPlayerHotBars .btn-copyAll').click((e) => {
            let playerStatePathName = $(e.target).closest('[data-pathName]').attr('data-pathName');
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                if(playerState !== null)
                {
                    let mPlayerHotbars      = this.baseLayout.getObjectProperty(playerState, 'mPlayerHotbars');
                        if(mPlayerHotbars !== null)
                        {
                            let hotbarJson = [];
                                for(let i = 0; i < mPlayerHotbars.values.length; i++)
                                {
                                    hotbarJson.push({values: []});

                                    let currentHotbar = this.baseLayout.saveGameParser.getTargetObject(mPlayerHotbars.values[i].pathName);
                                        if(currentHotbar !== null)
                                        {
                                            let mShortcuts  = this.baseLayout.getObjectProperty(currentHotbar, 'mShortcuts');
                                                if(mShortcuts !== null)
                                                {
                                                    for(let j = 0; j < mShortcuts.values.length; j++)
                                                    {
                                                        let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mShortcuts.values[j].pathName);
                                                            if(currentShortcut !== null)
                                                            {
                                                                hotbarJson[i].values.push(currentShortcut.properties);
                                                            }
                                                    }
                                                }
                                        }
                                }

                                this.baseLayout.localStorage.setItem('hotbarsClipboard', JSON.stringify(hotbarJson));
                                this.clipboard = hotbarJson;
                                $('#statisticsPlayerHotBars .btn-paste').show();
                                $('#statisticsPlayerHotBars .btn-pasteAll').show();
                        }
                }
        });
        $('#statisticsPlayerHotBars .btn-pasteAll').click((e) => {
            if(this.clipboard.length > 0)
            {
                let playerStatePathName = $(e.target).closest('[data-pathName]').attr('data-pathName');
                let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                    if(playerState !== null)
                    {
                        let mPlayerHotbars      = this.baseLayout.getObjectProperty(playerState, 'mPlayerHotbars');
                            if(mPlayerHotbars !== null)
                            {
                                for(let i = 0; i < mPlayerHotbars.values.length; i++)
                                {
                                    let currentHotbar = this.baseLayout.saveGameParser.getTargetObject(mPlayerHotbars.values[i].pathName);
                                        console.log(currentHotbar)
                                        if(currentHotbar !== null)
                                        {
                                            let mShortcuts  = this.baseLayout.getObjectProperty(currentHotbar, 'mShortcuts');
                                                if(mShortcuts !== null)
                                                {
                                                    for(let j = 0; j < mShortcuts.values.length; j++)
                                                    {
                                                        let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mShortcuts.values[j].pathName);
                                                            if(currentShortcut !== null)
                                                            {
                                                                currentShortcut.properties = JSON.parse(JSON.stringify(this.clipboard[i].values[j]));
                                                            }
                                                            else
                                                            {
                                                                let newShortCutPathName = this.baseLayout.generateFastPathName({pathName: 'Persistent_Level:PersistentLevel.BP_PlayerState_C_' + playerStatePathName.split('_').pop() + '.FGPlayerHotbar_' + currentHotbar.pathName.split('_').pop() + '.FGRecipeShortcut_XXX'});
                                                                let newShortCut         = {
                                                                        className       : '/Script/FactoryGame.FGRecipeShortcut',
                                                                        pathName        : newShortCutPathName,
                                                                        outerPathName   : currentHotbar.pathName,
                                                                        properties      : JSON.parse(JSON.stringify(this.clipboard[i].values[j]))
                                                                    };
                                                                    this.baseLayout.saveGameParser.addObject(newShortCut);
                                                                    mShortcuts.values[j].pathName = newShortCutPathName;
                                                                    //console.log(newShortCut)
                                                            }
                                                    }
                                                }
                                        }
                                }

                                this.parse(options);
                            }
                    }
            }
        });
    }

    prepareOldEvents(options) // Old legacy before update UE 5.2
    {
        $('#statisticsPlayerHotBars .btn-copy').click((e) => {
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
        });
        $('#statisticsPlayerHotBars .btn-paste').click((e) => {
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
                                            currentShortcut.properties = JSON.parse(JSON.stringify(this.clipboard[0].values[j]));
                                        }
                                }

                                this.parse(options);
                            }
                    }
            }
        });
        $('#statisticsPlayerHotBars .btn-delete').click((e) => {
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
        });

        $('#statisticsPlayerHotBars .btn-copyAll').click((e) => {
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
        });
        $('#statisticsPlayerHotBars .btn-pasteAll').click((e) => {
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
                                                currentShortcut.properties = JSON.parse(JSON.stringify(this.clipboard[i].values[j]));
                                            }
                                    }
                                }

                                this.parse(options);
                            }
                    }
            }
        });
    }

    parsePlayer(player, options = {})
    {
        let cellWidth           = 86;
            if(this.baseLayout.saveGameParser.header.buildVersion >= 258449)
            {
                return this.parseHotbars(player, cellWidth).join('');
            }

        return this.parseOldHotbars(player, cellWidth).join('');
    }

    parseHotbars(player, cellWidth)
    {
        let mPlayerHotbars      = this.baseLayout.getObjectProperty(player, 'mPlayerHotbars');
        let mHotbarsHtml        = [];

            if(mPlayerHotbars !== null)
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

                for(let i = 0; i < mPlayerHotbars.values.length; i++)
                {
                    mHotbarsHtml.push('<div class="col-12" data-hotbar="' + i + '" data-pathName="' + player.pathName + '">');
                    mHotbarsHtml.push('<div class="d-flex flex-row">');
                    mHotbarsHtml.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 48px;height: ' + cellWidth + 'px;padding: 6px;line-height: ' + cellWidth + 'px;font-size: 20px;"><strong>#' + (i + 1) + '</strong></div>');

                    let currentHotbar = this.baseLayout.saveGameParser.getTargetObject(mPlayerHotbars.values[i].pathName);
                        if(currentHotbar !== null)
                        {
                            let mShortcuts  = this.baseLayout.getObjectProperty(currentHotbar, 'mShortcuts');
                                if(mShortcuts !== null)
                                {
                                    for(let j = 0; j < mShortcuts.values.length; j++)
                                    {
                                        mHotbarsHtml.push(this.parseShortcut(mShortcuts.values[j].pathName, cellWidth));
                                    }
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

    parseOldHotbars(player, cellWidth)
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
                        mHotbarsHtml.push(this.parseShortcut(mHotbars.values[i][0].value.values[j].pathName, cellWidth));
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

    parseShortcut(pathName, cellWidth)
    {
        let currentShortcut     = this.baseLayout.saveGameParser.getTargetObject(pathName);
            if(currentShortcut !== null)
            {
                let mRecipeToActivate = this.baseLayout.getItemDataFromRecipe(currentShortcut, 'mRecipeToActivate');
                    if(mRecipeToActivate !== null && mRecipeToActivate.produce !== undefined)
                    {
                        let buildingData = this.baseLayout.getBuildingDataFromClassName(Object.keys(mRecipeToActivate.produce)[0].replace(new RegExp(/Desc_/, 'g'), 'Build_'));

                            if(buildingData !== null)
                            {
                                return this.baseLayout.getInventoryImage({image: buildingData.image, name: buildingData.name}, cellWidth);
                            }
                    }

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
                                            return '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 50%;padding: 5px;background: linear-gradient(135deg, rgb('
                                                + customColor.primaryColor.r + ', ' + customColor.primaryColor.g + ', ' + customColor.primaryColor.b + ') 0%,'
                                                + 'rgb(' + customColor.primaryColor.r + ', ' + customColor.primaryColor.g + ', ' + customColor.primaryColor.b + ') 50%,'
                                                + 'rgb(' + customColor.secondaryColor.r + ', ' + customColor.secondaryColor.g + ', ' + customColor.secondaryColor.b + ') 51%,'
                                                + 'rgb(' + customColor.secondaryColor.r + ', ' + customColor.secondaryColor.g + ', ' + customColor.secondaryColor.b + ') 100%);" data-hover="tooltip" title="Custom Swatch"></div>';
                                        break;
                                    default:
                                        let currentSlot     = parseInt(currentSwatch.replace('Recipe_Swatch_Slot', '').replace('_C'));
                                        let playerColors    = this.baseLayout.buildableSubSystem.getPlayerColorSlots();
                                            if(playerColors[currentSlot] !== undefined)
                                            {
                                                let swatchName          = 'Swatch ' + currentSlot;
                                                    if(currentSlot === 0){ swatchName = 'FICSIT Factory'; }
                                                    if(currentSlot === 16){ swatchName = 'FICSIT Foundation'; }
                                                    if(currentSlot === 17){ swatchName = 'FICSIT Pipe'; }
                                                    if(currentSlot === 18){ swatchName = 'Concrete Structure'; }

                                                return '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 50%;padding: 5px;background: linear-gradient(135deg, rgb('
                                                    + playerColors[currentSlot].primaryColor.r + ', ' + playerColors[currentSlot].primaryColor.g + ', ' + playerColors[currentSlot].primaryColor.b + ') 0%,'
                                                    + 'rgb(' + playerColors[currentSlot].primaryColor.r + ', ' + playerColors[currentSlot].primaryColor.g + ', ' + playerColors[currentSlot].primaryColor.b + ') 50%,'
                                                    + 'rgb(' + playerColors[currentSlot].secondaryColor.r + ', ' + playerColors[currentSlot].secondaryColor.g + ', ' + playerColors[currentSlot].secondaryColor.b + ') 51%,'
                                                    + 'rgb(' + playerColors[currentSlot].secondaryColor.r + ', ' + playerColors[currentSlot].secondaryColor.g + ', ' + playerColors[currentSlot].secondaryColor.b + ') 100%);" data-hover="tooltip" title="' + swatchName + '"></div>';
                                            }
                                }
                        }


                        if(mCustomizationRecipeToActivate.pathName.startsWith('/Game/FactoryGame/Buildable/-Shared/Customization/Patterns/'))
                        {
                            let patternDesc = mCustomizationRecipeToActivate.pathName.replaceAll('Recipe_Pattern_', 'PatternDesc_');
                                if(this.baseLayout.detailedModels !== null)
                                {
                                    for(let patternPathname in this.baseLayout.detailedModels)
                                    {
                                        if(patternPathname === patternDesc && this.baseLayout.detailedModels[patternPathname].patternImage !== undefined)
                                        {
                                            return '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 5px;padding: 5px;background: #666;" data-hover="tooltip" title="' + this.baseLayout.detailedModels[patternPathname].patternName + '">'
                                                + '<img src="' + this.baseLayout.detailedModels[patternPathname].patternImage + '" class="img-fluid" />'
                                                + '</div>';
                                        }
                                    }
                                }

                            return this.baseLayout.getInventoryImage(null, cellWidth);
                        }

                        if(mCustomizationRecipeToActivate.pathName.startsWith('/Game/FactoryGame/Buildable/-Shared/Customization/Materials/'))
                        {
                            let materialRecipe      = mCustomizationRecipeToActivate.pathName.replace('/Game/FactoryGame/Buildable/-Shared/Customization/Materials/', '');
                            let availableMaterials  = {
                                'Recipe_Material_Foundation_Default.Recipe_Material_Foundation_Default_C'                   : { image: '/img/gameUpdate8/IconDesc_FicsitFoundation4m_256.png', name: 'FICSIT Foundation' },
                                'Recipe_Material_Foundation_Concrete.Recipe_Material_Foundation_Concrete_C'                 : { image: '/img/gameUpdate8/IconDesc_ConcFoundation4m_256.png', name: 'Concrete Foundation' },
                                'Recipe_Material_Foundation_GripMetal.Recipe_Material_Foundation_GripMetal_C'               : { image: '/img/gameUpdate8/IconDesc_SteelFoundation4m_256.png', name: 'Grip Metal Foundation' },
                                'Recipe_Material_Foundation_PolishedConcrete.Recipe_Material_Foundation_PolishedConcrete_C' : { image: '/img/gameUpdate8/IconDesc_PolishFoundation4m_256.png', name: 'Coated Concrete Foundation' },
                                'Recipe_Material_Foundation_Asphalt.Recipe_Material_Foundation_Asphalt_C'                   : { image: '/img/gameUpdate8/IconDesc_AsphaltFoundation8x4_256.png', name: 'Asphalt Foundation' },

                                'Recipe_Material_Wall_Orange.Recipe_Material_Wall_Orange_C'                                 : { image: '/img/gameUpdate8/IconDesc_FicsitWall8x4_256.png', name: 'FICSIT Wall' },
                                'Recipe_Material_Wall_Concrete.Recipe_Material_Wall_Concrete_C'                             : { image: '/img/gameUpdate8/IconDesc_ConcWall8x4_256.png', name: 'Concrete Wall' },
                                'Recipe_Material_Wall_Steel.Recipe_Material_Wall_Steel_C'                                   : { image: '/img/gameUpdate8/IconDesc_SteelWall8x4_256.png', name: 'Steel Wall' },

                                'Recipe_Material_Roof_Ficsit.Recipe_Material_Roof_Ficsit_C'                                 : { image: '/img/gameUpdate8/IconDesc_FicsitRoof4m_256.png', name: 'FICSIT Roof' },
                                'Recipe_Material_Roof_Tar.Recipe_Material_Roof_Tar_C'                                       : { image: '/img/gameUpdate8/IconDesc_TarRoof4m_256.png', name: 'Tar Roof' },
                                'Recipe_Material_Roof_Metal.Recipe_Material_Roof_Metal_C'                                   : { image: '/img/gameUpdate8/IconDesc_SteelRoof4m_256.png', name: 'Metal Roof' },
                                'Recipe_Material_Roof_Glass.Recipe_Material_Roof_Glass_C'                                   : { image: '/img/gameUpdate8/IconDesc_GlassRoof4m_256.png', name: 'Glass Roof' }
                            };

                            if(availableMaterials.hasOwnProperty(materialRecipe))
                            {
                                return '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 5px;padding: 5px;background: #666;" data-hover="tooltip" title="' + availableMaterials[materialRecipe].name + '">'
                                    + '<img src="' + availableMaterials[materialRecipe].image + '" class="img-fluid" />'
                                    + '</div>';
                            }

                            console.log('MISSING HOTBAR MATERIAL', mCustomizationRecipeToActivate);
                            return this.baseLayout.getInventoryImage(null, cellWidth);
                        }

                        if(mCustomizationRecipeToActivate.pathName.startsWith('/Game/FactoryGame/Buildable/-Shared/Customization/Skins/'))
                        {
                            let skinRecipe      = mCustomizationRecipeToActivate.pathName.replace('/Game/FactoryGame/Buildable/-Shared/Customization/Skins/', '');
                            let availableSkins  = {
                                'Recipe_SkinFicsmas_Default.Recipe_SkinFicsmas_Default_C'   : { image: '/img/gameUpdate8/IconDesc_FicsMasBasic_256.png', name: 'Basic FICSMAS Skins' },
                                'Recipe_SkinFicsmas_Premium.Recipe_SkinFicsmas_Premium_C'   : { image: '/img/gameUpdate8/IconDesc_FicsMasPremium_256.png', name: 'Premium FICSMAS Skins' },
                                'Recipe_SkinRemover.Recipe_SkinRemover_C'                   : { image: '/img/patternIcons/IconDesc_PatternRemover_256.png', name: 'Reset Skin' }
                            };

                            if(availableSkins.hasOwnProperty(skinRecipe))
                            {
                                return '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 5px;padding: 5px;background: #666;" data-hover="tooltip" title="' + availableSkins[skinRecipe].name + '">'
                                    + '<img src="' + availableSkins[skinRecipe].image + '" class="img-fluid" />'
                                    + '</div>';
                            }

                            console.log('MISSING HOTBAR SKIN', mCustomizationRecipeToActivate);
                            return this.baseLayout.getInventoryImage(null, cellWidth);
                        }
                    }

                let mBlueprintName = this.baseLayout.getObjectProperty(currentShortcut, 'mBlueprintName');
                    if(mBlueprintName !== null)
                    {
                        // Those are sadly not in the save game...
                        let defaultColor    = [92, 176, 197];
                        let defaultImage    = '/img/signIcons/TXUI_MIcon_QuestionMark.png';

                        return '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border: 1px solid #000000;border-radius: 5px;padding: 0px;background: #FFFFFF;" data-hover="tooltip" title="' + mBlueprintName + '">'
                            + '<div style="position: absolute;width: 100%;height: 100%;background: rgb(' + defaultColor[0] + ', ' + defaultColor[1] + ', ' + defaultColor[2] + ');background: radial-gradient(circle, rgba(' + defaultColor[0] + ', ' + defaultColor[1] + ', ' + defaultColor[2] + ', 0.6) 33%, rgba(' + defaultColor[0] + ', ' + defaultColor[1] + ', ' + defaultColor[2] + ', 1) 100%);"></div>'
                            + '<img src="/img/TXUI_BlueprintIconBG_Mask.png" class="img-fluid" style="position: relative;" />'
                            + '<img src="' + defaultImage + '" style="position: absolute;left: 10%;top: 10%;width: 80%;height: 80%;">'
                            + '</div>';
                    }
            }

        return this.baseLayout.getInventoryImage(null, cellWidth);
    }
}