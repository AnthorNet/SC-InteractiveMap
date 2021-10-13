import BaseLayout_Math                          from '../BaseLayout/Math.js';

import Building_Light                           from '../Building/Light.js';

export default class SubSystem_Buildable
{
    static get totalColorSlots(){ return 16; }
    static get totalLightColorSlots(){ return 7; }

    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.buildableSubSystem     = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.BuildableSubsystem');
        this.gameState              = this.baseLayout.saveGameParser.getTargetObject('/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C');
        //console.log(this.buildableSubSystem)
    }

    getObjectPrimaryColorSlot(currentObject, raw = false)
    {
        let colorSlot = null;

            if(currentObject !== null)
            {
                colorSlot = this.baseLayout.getObjectProperty(currentObject, 'mColorSlot');
            }

            if(raw === true)
            {
                return colorSlot;
            }

            if(colorSlot !== null)
            {
                return parseInt(colorSlot.value);
            }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C')
        {
            return 17;
        }

        return 0;
    }

    getObjectPrimaryColor(currentObject)
    {
        let colorSlot                   = this.getObjectPrimaryColorSlot(currentObject);
        let mColorSlotsPrimary_Linear   = this.getPrimaryColorSlots();
            if(mColorSlotsPrimary_Linear !== null && mColorSlotsPrimary_Linear.values[colorSlot] !== undefined)
            {
                return {
                    r: BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[colorSlot].r),
                    g: BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[colorSlot].g),
                    b: BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[colorSlot].b)
                };
            }

        return this.getDefaultPrimaryColorSlot(colorSlot);
    }

    getPlayerColorSlots()
    {
        let totalColorSlot                  = SubSystem_Buildable.totalColorSlots;
        let playerColors                    = [];
        let mColorSlotsPrimary_Linear       = this.getPrimaryColorSlots();
        let mColorSlotsSecondary_Linear     = this.getSecondaryColorSlots();

            if(mColorSlotsPrimary_Linear === null && this.buildableSubSystem !== null)
            {
                mColorSlotsPrimary_Linear = {
                    name                    : "mColorSlotsPrimary_Linear",
                    structureName           : "mColorSlotsPrimary_Linear",
                    structureSubType        : "LinearColor",
                    structureType           : "StructProperty",
                    type                    : "ArrayProperty",
                    value                   : {type: "StructProperty", values: []}
                };

                for(let slotIndex = 0; slotIndex < (totalColorSlot + 2); slotIndex++)
                {
                    mColorSlotsPrimary_Linear.value.values[slotIndex]     = JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)));
                }

                this.buildableSubSystem.properties.push(mColorSlotsPrimary_Linear);
                mColorSlotsPrimary_Linear = this.getPrimaryColorSlots();
            }

            if(mColorSlotsSecondary_Linear === null && this.buildableSubSystem !== null)
            {
                mColorSlotsSecondary_Linear = {
                    name                    : "mColorSlotsSecondary_Linear",
                    structureName           : "mColorSlotsSecondary_Linear",
                    structureSubType        : "LinearColor",
                    structureType           : "StructProperty",
                    type                    : "ArrayProperty",
                    value                   : {type: "StructProperty", values: []}
                };

                for(let slotIndex = 0; slotIndex < (totalColorSlot + 2); slotIndex++)
                {
                    mColorSlotsSecondary_Linear.value.values[slotIndex]     = JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)));
                }

                this.buildableSubSystem.properties.push(mColorSlotsSecondary_Linear);
                mColorSlotsSecondary_Linear = this.getSecondaryColorSlots();
            }

        for(let slotIndex = 0; slotIndex < (totalColorSlot + 2); slotIndex++)
        {
            playerColors.push({
                primaryColor    : this.getDefaultPrimaryColorSlot(slotIndex),
                secondaryColor  : this.getDefaultSecondaryColorSlot(slotIndex)
            });

            if(mColorSlotsPrimary_Linear !== null)
            {
                playerColors[slotIndex].primaryColor    = {
                    r : BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[slotIndex].r),
                    g : BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[slotIndex].g),
                    b : BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[slotIndex].b),
                    a : BaseLayout_Math.linearColorToRGB(mColorSlotsPrimary_Linear.values[slotIndex].a)
                };
            }
            if(mColorSlotsSecondary_Linear !== null)
            {
                playerColors[slotIndex].secondaryColor  = {
                    r: BaseLayout_Math.linearColorToRGB(mColorSlotsSecondary_Linear.values[slotIndex].r),
                    g: BaseLayout_Math.linearColorToRGB(mColorSlotsSecondary_Linear.values[slotIndex].g),
                    b: BaseLayout_Math.linearColorToRGB(mColorSlotsSecondary_Linear.values[slotIndex].b),
                    a: BaseLayout_Math.linearColorToRGB(mColorSlotsSecondary_Linear.values[slotIndex].a)
                };
            }
        }

        return playerColors;
    }

    getPrimaryColorSlots()
    {
        return this.baseLayout.getObjectProperty(this.buildableSubSystem, 'mColorSlotsPrimary_Linear');
    }

    getDefaultPrimaryColorSlot(index, raw = false)
    {
        let defaultColors    = [
            {r: 0.9529412388801575, g: 0.3019607365131378, b: 0.06666668504476547, a: 1},
            {r: 0.14901961386203766, g: 0.3921568989753723, b: 0.6549019813537598, a: 1},
            {r: 0.8000000715255737, g: 0.2039215862751007, b: 0.07450980693101883, a: 1},
            {r: 0.125490203499794, g: 0.12941177189350128, b: 0.18431372940540314, a: 1},

            {r: 0.7450980544090271, g: 0.7647059559822083, b: 0.8078432083129883, a: 1},
            {r: 0.49803924560546875, g: 0.729411780834198, b: 0.2862745225429535, a: 1},
            {r: 1, g: 0.3490196168422699, b: 0.7921569347381592, a: 1},
            {r: 0.45098042488098145, g: 0.874509871006012, b: 0.8431373238563538, a: 1},

            {r: 0.4901961088180542, g: 0.3294117748737335, b: 0.10196079313755035, a: 1},
            {r: 0.9568628072738647, g: 0.8431373238563538, b: 0.6823529601097107, a: 1},
            {r: 0.5843137502670288, g: 0.3294117748737335, b: 0.9803922176361084, a: 1},
            {r: 0.20000001788139343, g: 0.6392157077789307, b: 0.4862745404243469, a: 0.9803922176361084},

            {r: 0.9254902601242065, g: 0.8431373238563538, b: 0.32156863808631897, a: 1},
            {r: 0.30588236451148987, g: 0.30980393290519714, b: 0.2666666805744171, a: 1},
            {r: 0.4705882668495178, g: 0.09803922474384308, b: 0.41568630933761597, a: 1},
            {r: 0.22352942824363708, g: 0.22352942824363708, b: 0.22352942824363708, a: 1},

            // Hidden slots
            {r: 0.1098039299249649, g: 0.1098039299249649, b: 0.1098039299249649, a: 1},    // Foundations
            {r: 0.9529412388801575, g: 0.3019607961177826, b: 0.06666667014360428, a: 1}    // Pipes
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

    getSecondaryColorSlots()
    {
        return this.baseLayout.getObjectProperty(this.buildableSubSystem, 'mColorSlotsSecondary_Linear');
    }

    getDefaultSecondaryColorSlot(index, raw = false)
    {
        let defaultColors    = [
            {r: 0.11372549831867218, g: 0.13333329558372498, b: 0.26274511218070984, a: 1},
            {r: 0.33725491166114807, g: 0.250980406999588, b: 0.12156863510608673, a: 1},
            {r: 0.30588236451148987, g: 0.3137255012989044, b: 0.3803921937942505, a: 1},
            {r: 0.2392157018184662, g: 0.3607843220233917, b: 0.29411765933036804, a: 1},

            {r: 0.11372549831867218, g: 0.13333334028720856, b: 0.26274511218070984, a: 1},
            {r: 0.11372549831867218, g: 0.13333334028720856, b: 0.26274511218070984, a: 1},
            {r: 0.11372549831867218, g: 0.13333334028720856, b: 0.26274511218070984, a: 1},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256, a: 1},

            {r: 0.32549020648002625, g: 0.3450980484485626, b: 0.3450980484485626, a: 1},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256, a: 1},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256, a: 1},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256, a: 1},

            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256, a: 1},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256, a: 1},
            {r: 0.1098039299249649, g: 0.12941177189350128, b: 0.25882354378700256, a: 1},
            {r: 0.7843137979507446, g: 0.7921569347381592, b: 0.874509871006012, a: 1},

            // Hidden slots
            {r: 0.1882353127002716, g: 0.1882353127002716, b: 0.1882353127002716, a: 1},    // Foundations
            {r: 1, g: 0, b: 0.9294118285179138, a: 1}                                       // Pipes
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
        let totalColorSlot                  = SubSystem_Buildable.totalLightColorSlots;
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
                mBuildableLightColorSlots = this.getLightColorSlots();
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

        return playerColors;
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