import SubSystem                                from '../SubSystem.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

import Building_Light                           from '../Building/Light.js';

export default class SubSystem_GameState extends SubSystem
{
    static get totalLightColorSlots(){ return 7; }

    constructor(options)
    {
        options.pathName        = '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C';
        super(options);

        this.updateTetrominoLeaderBoard();
    }

    getPublicTodoList()
    {
        return this.baseLayout.getObjectProperty(this.subSystem, 'mPublicTodoList');
    }

    /**
     * COLOR PRESETS
     */
    getPlayerColorPresets()
    {
        let presets                     = [];
        let mPlayerGlobalColorPresets   = this.baseLayout.getObjectProperty(this.subSystem, 'mPlayerGlobalColorPresets');
            if(mPlayerGlobalColorPresets !== null)
            {
                for(let i = 0; i < mPlayerGlobalColorPresets.values.length; i++)
                {
                    let currentPresetName   = null;
                    let currentPresetColor  = null;

                        for(let j = 0; j < mPlayerGlobalColorPresets.values[i].length; j++)
                        {
                            if(mPlayerGlobalColorPresets.values[i][j].name === 'PresetName')
                            {
                                currentPresetName = mPlayerGlobalColorPresets.values[i][j].value;
                            }
                            if(mPlayerGlobalColorPresets.values[i][j].name === 'Color')
                            {
                                currentPresetColor = mPlayerGlobalColorPresets.values[i][j].value.values;
                            }
                        }

                    if(currentPresetName !== null && currentPresetColor !== null)
                    {
                        presets.push({
                            name            : currentPresetName,
                            primaryColor    : {
                                r : BaseLayout_Math.linearColorToRGB(currentPresetColor.r),
                                g : BaseLayout_Math.linearColorToRGB(currentPresetColor.g),
                                b : BaseLayout_Math.linearColorToRGB(currentPresetColor.b),
                                a : BaseLayout_Math.linearColorToRGB(currentPresetColor.a)
                            }
                        });
                    }
                }
            }

        return presets;
    }

    setPlayerColorPreset(presetIndex, name, primaryColor)
    {
        let mPlayerGlobalColorPresets   = this.baseLayout.getObjectProperty(this.subSystem, 'mPlayerGlobalColorPresets');
            if(mPlayerGlobalColorPresets !== null)
            {
                if(mPlayerGlobalColorPresets.values[presetIndex] !== undefined)
                {
                    for(let j = 0; j < mPlayerGlobalColorPresets.values[presetIndex].length; j++)
                    {
                        if(mPlayerGlobalColorPresets.values[presetIndex][j].name === 'PresetName')
                        {
                            mPlayerGlobalColorPresets.values[presetIndex][j].value = name;
                        }
                        if(mPlayerGlobalColorPresets.values[presetIndex][j].name === 'Color')
                        {
                            mPlayerGlobalColorPresets.values[presetIndex][j].value.values.r   = primaryColor.r;
                            mPlayerGlobalColorPresets.values[presetIndex][j].value.values.g   = primaryColor.g;
                            mPlayerGlobalColorPresets.values[presetIndex][j].value.values.b   = primaryColor.b;
                            mPlayerGlobalColorPresets.values[presetIndex][j].value.values.a   = primaryColor.a;
                        }
                    }
                }
            }
    }

    addPlayerColorPreset(name, primaryColor)
    {
        let mPlayerGlobalColorPresets   = this.baseLayout.getObjectProperty(this.subSystem, 'mPlayerGlobalColorPresets');
            if(mPlayerGlobalColorPresets === null)
            {
                this.subSystem.properties.push({
                    name                : 'mPlayerGlobalColorPresets',
                    structureSubType    : 'GlobalColorPreset',
                    type                : 'Array',
                    value               : {type: 'Struct', values: []}
                });

                return this.addPlayerColorPreset(name, primaryColor);
            }

            mPlayerGlobalColorPresets.values.push([
                {
                    flags                       : 18,
                    hasCultureInvariantString   : 1,
                    historyType                 : 255,
                    name                        : 'PresetName',
                    type                        : 'Text',
                    value                       : name
                },
                {
                    name                        : 'Color',
                    type                        : 'Struct',
                    value                       : {
                        type                        : 'LinearColor',
                        values                      : primaryColor
                    }
                }
            ]);
    }

    deletePlayerColorPreset(presetIndex)
    {
        let mPlayerGlobalColorPresets   = this.baseLayout.getObjectProperty(this.subSystem, 'mPlayerGlobalColorPresets');
            if(mPlayerGlobalColorPresets !== null)
            {
                if(mPlayerGlobalColorPresets.values[presetIndex] !== undefined)
                {
                    mPlayerGlobalColorPresets.values.splice(presetIndex, 1);
                }
                if(mPlayerGlobalColorPresets.values.length === 0)
                {
                    this.baseLayout.deleteObjectProperty(this.subSystem, 'mPlayerGlobalColorPresets');
                }
            }
    }

    /**
     * LIGHTS COLOR
     */
    getObjectLightColor(currentObject)
    {
        let colorSlot               = Building_Light.getColorSlotIndex(this.baseLayout, currentObject);
        let playerLightColorSlots   = this.getPlayerLightColorSlots();
            if(playerLightColorSlots !== null && playerLightColorSlots[colorSlot] !== undefined)
            {
                return playerLightColorSlots[colorSlot];
            }

        return this.getDefaultLightColorSlot(colorSlot);
    }

    getPlayerLightColorSlots()
    {
        if(this.playerLightColorSlots === undefined || this.playerLightColorSlots === null)
        {
            let totalColorSlot                  = SubSystem_GameState.totalLightColorSlots;
            let playerColors                    = [];
            let mBuildableLightColorSlots       = this.getLightColorSlots();

                if(mBuildableLightColorSlots === null)
                {
                    mBuildableLightColorSlots = {
                        name                : 'mBuildableLightColorSlots',
                        structureSubType    : 'LinearColor',
                        type                : 'Array',
                        value               : {type: 'Struct', values: []}
                    };
                    for(let slotIndex = 0; slotIndex < totalColorSlot; slotIndex++)
                    {
                        mBuildableLightColorSlots.value.values[slotIndex]     = JSON.parse(JSON.stringify(this.getDefaultLightColorSlot(slotIndex, true)));
                    }

                    this.subSystem.properties.push(mBuildableLightColorSlots);
                    return this.getPlayerLightColorSlots();
                }

                for(let slotIndex = 0; slotIndex < totalColorSlot; slotIndex++)
                {
                    playerColors.push(this.getDefaultLightColorSlot(slotIndex));

                    if(mBuildableLightColorSlots !== null)
                    {
                        playerColors[slotIndex] = {
                            r : BaseLayout_Math.linearColorToRGB(mBuildableLightColorSlots.values[slotIndex].r),
                            g : BaseLayout_Math.linearColorToRGB(mBuildableLightColorSlots.values[slotIndex].g),
                            b : BaseLayout_Math.linearColorToRGB(mBuildableLightColorSlots.values[slotIndex].b),
                            a : BaseLayout_Math.linearColorToRGB(mBuildableLightColorSlots.values[slotIndex].a)
                        };
                    }
                }

                this.playerLightColorSlots = playerColors;
        }

        return this.playerLightColorSlots;
    }

    setPlayerLightColorSlot(slotIndex, primaryColor)
    {
        let mBuildableLightColorSlots   = this.getLightColorSlots();
            if(mBuildableLightColorSlots !== null)
            {
                mBuildableLightColorSlots.values[slotIndex].r   = primaryColor.r;
                mBuildableLightColorSlots.values[slotIndex].g   = primaryColor.g;
                mBuildableLightColorSlots.values[slotIndex].b   = primaryColor.b;


            }

        this.playerLightColorSlots = null;
    }

    getLightColorSlots()
    {
        return this.baseLayout.getObjectProperty(this.subSystem, 'mBuildableLightColorSlots');
    }

    getDefaultLightColorSlot(index, raw = false)
    {
        let defaultColors    = [
            {r: 1, g: 1, b: 1, a: 1},
            {r: 1, g: 0, b: 0, a: 1},
            {r: 1, g: 1, b: 0, a: 1},
            {r: 0, g: 1, b: 0, a: 1},
            {r: 0, g: 1, b: 1, a: 1},
            {r: 0, g: 0, b: 1, a: 1},
            {r: 1, g: 0, b: 1, a: 1}
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

    /**
     * TETROMINO LEADERBOARD
     */
    updateTetrominoLeaderBoard()
    {
        let mTetrominoLeaderBoard = this.baseLayout.getObjectProperty(this.subSystem, 'mTetrominoLeaderBoard');
            if(mTetrominoLeaderBoard !== null)
            {
                let tetrominoData = [];
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
                                        level = parseInt(mTetrominoLeaderBoard.values[j][k].value.replace('LVL', ''));
                                        break;
                                    case 'Points':
                                        score = mTetrominoLeaderBoard.values[j][k].value;
                                        break;
                                }
                            }
                            if(playerName !== null && level !== null && score !== null)
                            {
                                tetrominoData.push({playerName: playerName, level: level, score: score});
                            }
                    }

                if(tetrominoData.length > 0)
                {
                    try
                    {
                        $.post(this.baseLayout.tetrominoUrl, {data: tetrominoData});
                    }
                    catch(error){} // Silently fail UCS2 caracters???
                }
            }
    }
}