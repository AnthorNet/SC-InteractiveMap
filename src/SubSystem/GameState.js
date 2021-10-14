import BaseLayout_Math                          from '../BaseLayout/Math.js';

import Building_Light                           from '../Building/Light.js';

export default class SubSystem_Buildable
{
    static get totalColorSlots(){ return 16; }
    static get totalLightColorSlots(){ return 7; }

    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.gameState              = this.baseLayout.saveGameParser.getTargetObject('/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C');
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