import Modal                                    from '../Modal.js';

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
                                    currentItemClass    = currentRule[j].value.pathName;
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

        return null
    }

    static getSortRuleLabel(baseLayout, className)
    {
        switch(className)
        {
            case '/Script/FactoryGame.FGWildCardDescriptor':
                return '*';
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
        let buildingData = baseLayout.getBuildingDataFromClassName(currentObject.className);
            contextMenu.push({
                text: 'Update "' + buildingData.name + '" rules',
                callback: Building_SmartSplitter.updateRules
            });
            contextMenu.push({separator: true});

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateRules(marker)
    {
        let baseLayout      = marker.baseLayout;
            baseLayout.pauseMap();
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" rules',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'leftOutput',
                    label       : 'Left output',
                    inputType   : 'text',
                    value       : Building_SmartSplitter.getSortRule(baseLayout, currentObject, 2)
                },{
                    name        : 'centerOutput',
                    label       : 'Center output',
                    inputType   : 'text',
                    value       : Building_SmartSplitter.getSortRule(baseLayout, currentObject, 0)
                },{
                    name        : 'rightOutput',
                    label       : 'Right output',
                    inputType   : 'text',
                    value       : Building_SmartSplitter.getSortRule(baseLayout, currentObject, 1)
                }],
                callback    : function(values)
                {
                    this.unpauseMap();

                    if(values === null)
                    {
                        return;
                    }

                    console.log(values);
                }.bind(baseLayout)
            });
    }
}