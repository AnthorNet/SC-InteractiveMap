import BaseLayout_Math                          from '../BaseLayout/Math.js';

import Building_Light                           from '../Building/Light.js';

export default class SubSystem_GameState
{
    static get totalLightColorSlots(){ return 7; }

    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.gameState              = this.baseLayout.saveGameParser.getTargetObject('/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C');
    }

    getPublicTodoList()
    {
        return this.baseLayout.getObjectProperty(this.gameState, 'mPublicTodoList');
    }

    /**
     * COLOR PRESETS
     */
    getPlayerColorPresets()
    {
        let presets                     = [];
        let mPlayerGlobalColorPresets   = this.baseLayout.getObjectProperty(this.gameState, 'mPlayerGlobalColorPresets');
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
        let mPlayerGlobalColorPresets   = this.baseLayout.getObjectProperty(this.gameState, 'mPlayerGlobalColorPresets');
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
        let mPlayerGlobalColorPresets   = this.baseLayout.getObjectProperty(this.gameState, 'mPlayerGlobalColorPresets');
            if(mPlayerGlobalColorPresets === null)
            {
                this.gameState.properties.push({
                    name                : "mPlayerGlobalColorPresets",
                    structureName       : "mPlayerGlobalColorPresets",
                    structureSubType    : "GlobalColorPreset",
                    structureType       : "StructProperty",
                    type                : "ArrayProperty",
                    value               : {type: 'StructProperty', values: []}
                });

                return this.addPlayerColorPreset(name, primaryColor);
            }

            mPlayerGlobalColorPresets.values.push([
                {
                    flags                       : 18,
                    hasCultureInvariantString   : 1,
                    historyType                 : 255,
                    name                        : "PresetName",
                    type                        : "TextProperty",
                    value                       : name
                },
                {
                    name                        : "Color",
                    type                        : "StructProperty",
                    value                       : {
                        type                        : "LinearColor",
                        values                      : primaryColor
                    }
                }
            ]);
    }
    deletePlayerColorPreset(presetIndex)
    {
        let mPlayerGlobalColorPresets   = this.baseLayout.getObjectProperty(this.gameState, 'mPlayerGlobalColorPresets');
            if(mPlayerGlobalColorPresets !== null)
            {
                if(mPlayerGlobalColorPresets.values[presetIndex] !== undefined)
                {
                    mPlayerGlobalColorPresets.values.splice(presetIndex, 1);
                }
                if(mPlayerGlobalColorPresets.values.length === 0)
                {
                    this.baseLayout.deleteObjectProperty(this.gameState, 'mPlayerGlobalColorPresets');
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
                        name                : "mBuildableLightColorSlots",
                        structureName       : "mBuildableLightColorSlots",
                        structureSubType    : "LinearColor",
                        structureType       : "StructProperty",
                        type                : "ArrayProperty",
                        value: {type: "StructProperty", values: []}
                    };
                    for(let slotIndex = 0; slotIndex < totalColorSlot; slotIndex++)
                    {
                        mBuildableLightColorSlots.value.values[slotIndex]     = JSON.parse(JSON.stringify(this.getDefaultLightColorSlot(slotIndex, true)));
                    }

                    this.gameState.properties.push(mBuildableLightColorSlots);
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
        return this.baseLayout.getObjectProperty(this.gameState, 'mBuildableLightColorSlots');
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
}