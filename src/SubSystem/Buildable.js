import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class SubSystem_Buildable
{
    static get totalColorSlots(){ return 16; }
    static get extraColorSlots(){ return 3; }

    static get primaryColors(){ return [
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
        {r: 0.9529412388801575, g: 0.3019607961177826, b: 0.06666667014360428, a: 1},   // Pipes
        {r: 1, g: 1, b: 1, a: 1}                                                        // Concrete
    ]; }
    static get secondaryColors(){ return [
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
        {r: 1, g: 0, b: 0.9294118285179138, a: 1},                                      // Pipes
        {r: 0.9529410004615784, g: 0.3019610047340393, b: 0.06666699796915054, a: 1}    // Concrete
    ]; }

    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.buildableSubSystem     = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.BuildableSubsystem');
    }

    getObjectColorSlot(currentObject)
    {
        let mCustomizationData = this.baseLayout.getObjectProperty(currentObject, 'mCustomizationData');
            if(mCustomizationData !== null)
            {
                for(let i = 0; i < mCustomizationData.values.length; i++)
                {
                    if(mCustomizationData.values[i].name === 'SwatchDesc')
                    {
                        let currentSwatchDesc = mCustomizationData.values[i].value.pathName;
                            switch(currentSwatchDesc)
                            {
                                case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Custom.SwatchDesc_Custom_C':
                                    return 255;
                                case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Concrete.SwatchDesc_Concrete_C':
                                    return 18;
                                case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_FoundationOverride.SwatchDesc_FoundationOverride_C':
                                    return 16;
                                default:
                                    let slot = currentSwatchDesc.split('.');
                                        slot = parseInt(slot[0].replace('/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot', ''));

                                        if(isNaN(slot))
                                        {
                                            console.log('getObjectColorSlot', currentSwatchDesc);
                                            return 0;
                                        }

                                        return slot;
                            }
                    }
                }
            }

        //TODO:OLD
        let colorSlot = this.baseLayout.getObjectProperty(currentObject, 'mColorSlot');
            if(colorSlot !== null)
            {
                return parseInt(colorSlot.value);
            }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C')
        {
            return 17;
        }

        let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
            if(buildingData !== null && buildingData.category === 'foundation')
            {
                return 16;
            }

        return 0;
    }

    setObjectColorSlot(currentObject, slotIndex)
    {
        let mCustomizationData = this.baseLayout.getObjectProperty(currentObject, 'mCustomizationData');
            if(mCustomizationData !== null)
            {
                for(let i = 0; i < mCustomizationData.values.length; i++)
                {
                    if(mCustomizationData.values[i].name === 'SwatchDesc')
                    {
                        switch(slotIndex)
                        {
                            case 255:
                                mCustomizationData.values[i].value.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Custom.SwatchDesc_Custom_C';
                                break;
                            case 18:
                                mCustomizationData.values[i].value.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Concrete.SwatchDesc_Concrete_C';
                                break;
                            case 16:
                                mCustomizationData.values[i].value.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_FoundationOverride.SwatchDesc_FoundationOverride_C';
                                break;
                            default:
                                mCustomizationData.values[i].value.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot' + slotIndex + '.SwatchDesc_Slot' + slotIndex + '_C';
                        }
                    }
                }
            }

        //TODO:OLD
        this.baseLayout.deleteObjectProperty(currentObject, 'mColorSlot');
        currentObject.properties.push({
            name    : 'mColorSlot',
            type    : 'ByteProperty',
            value   : {enumName: 'None', value: slotIndex}
        });
    }



    getObjectPrimaryColor(currentObject)
    {
        let colorSlot           = this.getObjectColorSlot(currentObject);
        let playerColorSlots    = this.getPlayerColorSlots();

            if(playerColorSlots[colorSlot] === undefined)
            {
                console.log('getObjectPrimaryColor', colorSlot, currentObject);
                return playerColorSlots[0].primaryColor;
            }

        return playerColorSlots[colorSlot].primaryColor;
    }
    getObjectSecondaryColor(currentObject)
    {
        let colorSlot           = this.getObjectColorSlot(currentObject);
        let playerColorSlots    = this.getPlayerColorSlots();

            if(playerColorSlots[colorSlot] === undefined)
            {
                console.log('getObjectSecondaryColor', colorSlot, currentObject);
                return playerColorSlots[0].secondaryColor;
            }

        return playerColorSlots[colorSlot].secondaryColor;
    }



    getPlayerColorSlots()
    {
        if(this.playerColorSlots === undefined || this.playerColorSlots === null)
        {
            let totalColorSlot      = SubSystem_Buildable.totalColorSlots;
            let playerColors        = [];
            let primaryColorSlots   = this.getPrimaryColorSlots();
            let secondaryColorSlots = this.getSecondaryColorSlots();

            for(let slotIndex = 0; slotIndex < (totalColorSlot + SubSystem_Buildable.extraColorSlots); slotIndex++)
            {
                if(primaryColorSlots[slotIndex] === undefined)
                {
                    primaryColorSlots[slotIndex] = JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)));
                }
                if(secondaryColorSlots[slotIndex] === undefined)
                {
                    secondaryColorSlots[slotIndex] = JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)));
                }

                playerColors.push({
                    primaryColor    : {
                        r : BaseLayout_Math.linearColorToRGB(primaryColorSlots[slotIndex].r),
                        g : BaseLayout_Math.linearColorToRGB(primaryColorSlots[slotIndex].g),
                        b : BaseLayout_Math.linearColorToRGB(primaryColorSlots[slotIndex].b),
                        a : BaseLayout_Math.linearColorToRGB(primaryColorSlots[slotIndex].a)
                    },
                    secondaryColor  : {
                        r: BaseLayout_Math.linearColorToRGB(secondaryColorSlots[slotIndex].r),
                        g: BaseLayout_Math.linearColorToRGB(secondaryColorSlots[slotIndex].g),
                        b: BaseLayout_Math.linearColorToRGB(secondaryColorSlots[slotIndex].b),
                        a: BaseLayout_Math.linearColorToRGB(secondaryColorSlots[slotIndex].a)
                    }
                });
            }

            playerColors[255]                 = {};
            playerColors[255].primaryColor    = {
                r : BaseLayout_Math.linearColorToRGB(0),
                g : BaseLayout_Math.linearColorToRGB(0),
                b : BaseLayout_Math.linearColorToRGB(0),
                a : BaseLayout_Math.linearColorToRGB(1)
            };
            playerColors[255].secondaryColor  = {
                r : BaseLayout_Math.linearColorToRGB(0),
                g : BaseLayout_Math.linearColorToRGB(0),
                b : BaseLayout_Math.linearColorToRGB(0),
                a : BaseLayout_Math.linearColorToRGB(1)
            };

            for(let pathName in this.baseLayout.players)
            {
                let mCustomColorData  = this.baseLayout.getObjectProperty(this.baseLayout.players[pathName].player, 'mCustomColorData');
                    if(mCustomColorData !== null)
                    {
                        for(let j = 0; j < mCustomColorData.values.length; j++)
                        {
                            if(mCustomColorData.values[j].name === 'PrimaryColor')
                            {
                                playerColors[255].primaryColor    = {
                                    r : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.r),
                                    g : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.g),
                                    b : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.b),
                                    a : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.a)
                                };
                            }
                            if(mCustomColorData.values[j].name === 'SecondaryColor')
                            {
                                playerColors[255].secondaryColor    = {
                                    r : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.r),
                                    g : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.g),
                                    b : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.b),
                                    a : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.a)
                                };
                            }
                        }

                        if(this.baseLayout.players[pathName].isHost())
                        {
                            break;
                        }
                    }

            }

            this.playerColorSlots = playerColors;
        }

        return this.playerColorSlots;
    }

    setPlayerColorSlot(slotIndex, primaryColor, secondaryColor)
    {
        let mColorSlots_Data = this.baseLayout.getObjectProperty(this.buildableSubSystem, 'mColorSlots_Data');
            if(mColorSlots_Data !== null)
            {
                if(mColorSlots_Data.values[slotIndex] === undefined)
                {
                    mColorSlots_Data.values[slotIndex] = [
                        {
                            name    : "PrimaryColor",
                            type    : "StructProperty",
                            value   : {type: "LinearColor", values: JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)))}
                        },
                        {
                            name    : "SecondaryColor",
                            type    : "StructProperty",
                            value   : {type: "LinearColor", values : JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)))}
                        },
                        {name: "Metallic", type: "FloatProperty", value: 0},
                        {name: "Roughness", type: "FloatProperty", value: 0}
                    ];
                }

                for(let j = 0; j < mColorSlots_Data.values[slotIndex].length; j++)
                {
                    if(mColorSlots_Data.values[slotIndex][j].name === 'PrimaryColor')
                    {
                        mColorSlots_Data.values[slotIndex][j].value.values.r = primaryColor.r;
                        mColorSlots_Data.values[slotIndex][j].value.values.g = primaryColor.g;
                        mColorSlots_Data.values[slotIndex][j].value.values.b = primaryColor.b;
                    }
                    if(mColorSlots_Data.values[slotIndex][j].name === 'SecondaryColor')
                    {
                        mColorSlots_Data.values[slotIndex][j].value.values.r = secondaryColor.r;
                        mColorSlots_Data.values[slotIndex][j].value.values.g = secondaryColor.g;
                        mColorSlots_Data.values[slotIndex][j].value.values.b = secondaryColor.b;
                    }
                }
            }

        //TODO:OLD
        let mColorSlotsPrimary_Linear = this.baseLayout.getObjectProperty(this.buildableSubSystem, 'mColorSlotsPrimary_Linear');
            if(mColorSlotsPrimary_Linear !== null)
            {
                if(mColorSlotsPrimary_Linear.values[slotIndex] === undefined)
                {
                    mColorSlotsPrimary_Linear.values[slotIndex] = JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)));
                }

                mColorSlotsPrimary_Linear.values[slotIndex].r   = primaryColor.r;
                mColorSlotsPrimary_Linear.values[slotIndex].g   = primaryColor.g;
                mColorSlotsPrimary_Linear.values[slotIndex].b   = primaryColor.b;
            }
        let mColorSlotsSecondary_Linear = this.baseLayout.getObjectProperty(this.buildableSubSystem, 'mColorSlotsSecondary_Linear');
            if(mColorSlotsSecondary_Linear !== null)
            {
                if(mColorSlotsSecondary_Linear.values[slotIndex] === undefined)
                {
                    mColorSlotsSecondary_Linear.values[slotIndex] = JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)));
                }

                mColorSlotsSecondary_Linear.values[slotIndex].r = secondaryColor.r;
                mColorSlotsSecondary_Linear.values[slotIndex].g = secondaryColor.g;
                mColorSlotsSecondary_Linear.values[slotIndex].b = secondaryColor.b;
            }

        this.playerColorSlots = null;
    }


    getPrimaryColorSlots()
    {
        let mColorSlots_Data = this.baseLayout.getObjectProperty(this.buildableSubSystem, 'mColorSlots_Data');
            if(this.baseLayout.saveGameParser.header.buildVersion > 168000)
            {
                if(mColorSlots_Data === null && this.buildableSubSystem !== null)
                {
                    console.log('Creating missing mColorSlots_Data');

                    mColorSlots_Data = {
                        name                : "mColorSlots_Data",
                        structureName       : "mColorSlots_Data",
                        structureType       : "StructProperty",
                        structureSubType    : "FactoryCustomizationColorSlot",
                        type                : "ArrayProperty",
                        value               : {type: "StructProperty", values: []}
                    };

                    for(let slotIndex = 0; slotIndex < (SubSystem_Buildable.totalColorSlots + SubSystem_Buildable.extraColorSlots); slotIndex++)
                    {
                        mColorSlots_Data.value.values.push([
                            {
                                name    : "PrimaryColor",
                                type    : "StructProperty",
                                value   : {type: "LinearColor", values: JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)))}
                            },
                            {
                                name    : "SecondaryColor",
                                type    : "StructProperty",
                                value   : {type: "LinearColor", values : JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)))}
                            },
                            {name: "Metallic", type: "FloatProperty", value: 0},
                            {name: "Roughness", type: "FloatProperty", value: 0}
                        ]);
                    }

                    this.buildableSubSystem.properties.push(mColorSlots_Data);
                    return this.getPrimaryColorSlots();
                }
            }

        if(mColorSlots_Data !== null)
        {
            let data = [];
                for(let i = 0; i < mColorSlots_Data.values.length; i++)
                {
                    for(let j = 0; j < mColorSlots_Data.values[i].length; j++)
                    {
                        if(mColorSlots_Data.values[i][j].name === 'PrimaryColor')
                        {
                            data.push(mColorSlots_Data.values[i][j].value.values);
                        }
                    }
                }
            return data;
        }

        //TODO:OLD
        let mColorSlotsPrimary_Linear = this.baseLayout.getObjectProperty(this.buildableSubSystem, 'mColorSlotsPrimary_Linear');
            if(mColorSlotsPrimary_Linear === null && this.buildableSubSystem !== null)
            {
                console.log('Creating missing mColorSlotsPrimary_Linear');

                mColorSlotsPrimary_Linear = {
                    name                    : "mColorSlotsPrimary_Linear",
                    structureName           : "mColorSlotsPrimary_Linear",
                    structureSubType        : "LinearColor",
                    structureType           : "StructProperty",
                    type                    : "ArrayProperty",
                    value                   : {type: "StructProperty", values: []}
                };

                for(let slotIndex = 0; slotIndex < (SubSystem_Buildable.totalColorSlots + SubSystem_Buildable.extraColorSlots); slotIndex++)
                {
                    mColorSlotsPrimary_Linear.value.values.push(
                        JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)))
                    );
                }

                this.buildableSubSystem.properties.push(mColorSlotsPrimary_Linear);
                return this.getPrimaryColorSlots();
            }

        if(mColorSlotsPrimary_Linear !== null)
        {
            return mColorSlotsPrimary_Linear.values;
        }

        return SubSystem_Buildable.primaryColors;
    }

    getDefaultPrimaryColorSlot(index, raw = false)
    {
        let defaultColors   = SubSystem_Buildable.primaryColors;
        let returnColor     = (defaultColors[index] !== undefined) ? defaultColors[index] : defaultColors[0];

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
        let mColorSlots_Data = this.baseLayout.getObjectProperty(this.buildableSubSystem, 'mColorSlots_Data');
            if(mColorSlots_Data !== null)
            {
                let data = [];
                    for(let i = 0; i < mColorSlots_Data.values.length; i++)
                    {
                        for(let j = 0; j < mColorSlots_Data.values[i].length; j++)
                        {
                            if(mColorSlots_Data.values[i][j].name === 'SecondaryColor')
                            {
                                data.push(mColorSlots_Data.values[i][j].value.values);
                            }
                        }
                    }
                return data;
            }

        //TODO:OLD
        let mColorSlotsSecondary_Linear = this.baseLayout.getObjectProperty(this.buildableSubSystem, 'mColorSlotsSecondary_Linear');
            if(mColorSlotsSecondary_Linear === null && this.buildableSubSystem !== null)
            {
                console.log('Creating missing mColorSlotsPrimary_Linear');

                mColorSlotsSecondary_Linear = {
                    name                    : "mColorSlotsSecondary_Linear",
                    structureName           : "mColorSlotsSecondary_Linear",
                    structureSubType        : "LinearColor",
                    structureType           : "StructProperty",
                    type                    : "ArrayProperty",
                    value                   : {type: "StructProperty", values: []}
                };

                for(let slotIndex = 0; slotIndex < (SubSystem_Buildable.totalColorSlots + SubSystem_Buildable.extraColorSlots); slotIndex++)
                {
                    mColorSlotsSecondary_Linear.value.values.push(
                        JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)))
                    );
                }

                this.buildableSubSystem.properties.push(mColorSlotsSecondary_Linear);
                return this.getSecondaryColorSlots();
            }

        if(mColorSlotsSecondary_Linear !== null)
        {
            return mColorSlotsSecondary_Linear.values;
        }

        return SubSystem_Buildable.secondaryColors;
    }

    getDefaultSecondaryColorSlot(index, raw = false)
    {
        let defaultColors   = SubSystem_Buildable.secondaryColors;
        let returnColor     = (defaultColors[index] !== undefined) ? defaultColors[index] : defaultColors[0];

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