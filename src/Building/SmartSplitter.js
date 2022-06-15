import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

// 0 => front
// 1 => right
// 2 => left

// *                : /Script/FactoryGame.FGWildCardDescriptor
// None             : /Game/FactoryGame/Resource/FilteringRules/Desc_None.Desc_None_C
// Any              : /Game/FactoryGame/Resource/FilteringRules/Desc_Wildcard.Desc_Wildcard_C
// Any Undefined    : /Game/FactoryGame/Resource/FilteringRules/Desc_AnyUndefined.Desc_AnyUndefined_C
// Overflow         : /Game/FactoryGame/Resource/FilteringRules/Desc_Overflow.Desc_Overflow_C

export default class Building_SmartSplitter
{
    static getSortRule(baseLayout, currentObject, index)
    {
        let mSortRules = baseLayout.getObjectProperty(currentObject, 'mSortRules');
            if(mSortRules  !== null)
            {
                let indexRules = [];
                    for(let i = 0; i < mSortRules.values.length; i++)
                    {
                        let currentRule         = mSortRules.values[i];
                        let currentOutputIndex  = null;
                        let currentItemClass    = null;

                            for(let j = 0; j < currentRule.length; j++)
                            {
                                if(currentRule[j].name === 'OutputIndex')
                                {
                                    currentOutputIndex  = currentRule[j].value;
                                }
                                if(currentRule[j].name === 'ItemClass')
                                {
                                    currentItemClass    = (currentRule[j].value.pathName !== '') ? currentRule[j].value.pathName : '/Game/FactoryGame/Resource/FilteringRules/Desc_None.Desc_None_C';
                                }
                            }

                            if(currentOutputIndex === index && currentItemClass !== null)
                            {
                                indexRules.push(currentItemClass);
                            }
                    }

                    if(indexRules.length > 0)
                    {
                        return indexRules;
                    }
            }

        if(index === 0)
        {
            return ['/Script/FactoryGame.FGWildCardDescriptor'];
        }

        return ['/Game/FactoryGame/Resource/FilteringRules/Desc_None.Desc_None_C'];
    }

    static getSortRuleLabel(baseLayout, className)
    {
        switch(className)
        {
            case '/Script/FactoryGame.FGWildCardDescriptor':
                return '*';
            case '':
            case '/Game/FactoryGame/Resource/FilteringRules/Desc_None.Desc_None_C':
                return 'None';
            case '/Game/FactoryGame/Resource/FilteringRules/Desc_Wildcard.Desc_Wildcard_C':
                return 'Any';
            case '/Game/FactoryGame/Resource/FilteringRules/Desc_AnyUndefined.Desc_AnyUndefined_C':
                return 'Any undefined';
            case '/Game/FactoryGame/Resource/FilteringRules/Desc_Overflow.Desc_Overflow_C':
                return 'Overflow';
        }

        let itemData = baseLayout.getItemDataFromClassName(className);
            if(itemData !== null)
            {
                return '<img src="' + itemData.image + '" style="width: 16px;height: 16px;" class="mr-1" /> ' + itemData.name;
            }

        return '?';
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-random',
            text        : 'Update rules',
            callback    : Building_SmartSplitter.updateRules
        });
        contextMenu.push('-');

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateRules(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let inputOptions   = baseLayout.generateInventoryOptions(currentObject, false);
            inputOptions.unshift({
                value: '/Game/FactoryGame/Resource/FilteringRules/Desc_Overflow.Desc_Overflow_C',
                text: 'Overflow'
            });
            inputOptions.unshift({
                value: '/Game/FactoryGame/Resource/FilteringRules/Desc_AnyUndefined.Desc_AnyUndefined_C',
                text: 'Any undefined'
            });
            inputOptions.unshift({
                value: '/Game/FactoryGame/Resource/FilteringRules/Desc_Wildcard.Desc_Wildcard_C',
                text: 'Any'
            });
            inputOptions.unshift({
                value: '/Game/FactoryGame/Resource/FilteringRules/Desc_None.Desc_None_C',
                text: 'None'
            });
            inputOptions.unshift({
                value: '/Script/FactoryGame.FGWildCardDescriptor',
                text: '*'
            });

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" rules',
                container   : '#leafletMap',
                inputs      : [{
                    name            : '2',
                    label           : 'Left output',
                    inputType       : 'selectPicker',
                    multiple        : ((currentObject.className === '/Game/FactoryGame/Buildable/Factory/CA_SplitterProgrammable/Build_ConveyorAttachmentSplitterProgrammable.Build_ConveyorAttachmentSplitterProgrammable_C') ? true : false),
                    inputOptions    : inputOptions,
                    value           : Building_SmartSplitter.getSortRule(baseLayout, currentObject, 2)
                },{
                    name            : '0',
                    label           : 'Center output',
                    inputType       : 'selectPicker',
                    multiple        : ((currentObject.className === '/Game/FactoryGame/Buildable/Factory/CA_SplitterProgrammable/Build_ConveyorAttachmentSplitterProgrammable.Build_ConveyorAttachmentSplitterProgrammable_C') ? true : false),
                    inputOptions    : inputOptions,
                    value           : Building_SmartSplitter.getSortRule(baseLayout, currentObject, 0)
                },{
                    name            : '1',
                    label           : 'Right output',
                    inputType       : 'selectPicker',
                    multiple        : ((currentObject.className === '/Game/FactoryGame/Buildable/Factory/CA_SplitterProgrammable/Build_ConveyorAttachmentSplitterProgrammable.Build_ConveyorAttachmentSplitterProgrammable_C') ? true : false),
                    inputOptions    : inputOptions,
                    value           : Building_SmartSplitter.getSortRule(baseLayout, currentObject, 1)
                }],
                callback    : function(values)
                {
                    baseLayout.deleteObjectProperty(currentObject, 'mSortRules');

                    let mSortRules = {
                            name: "mSortRules", type: "ArrayProperty", value: {type: "StructProperty", values: []},
                            structureName: "mSortRules", structureType: "StructProperty", structureSubType: "SplitterSortRule"
                        };
                        for(let outputIndex in values)
                        {
                            if(Array.isArray(values[outputIndex]) === false)
                            {
                                values[outputIndex] = [values[outputIndex]];
                            }

                            for(let i = 0; i < values[outputIndex].length; i++)
                            {
                                mSortRules.value.values.push([
                                    {name: "ItemClass", type: "ObjectProperty", value: {levelName: "", pathName: values[outputIndex][i]}},
                                    {name: "OutputIndex", type: "IntProperty", value: parseInt(outputIndex)}
                                ]);
                            }
                        }

                        currentObject.properties.push(mSortRules);
                }
            });
    }
}