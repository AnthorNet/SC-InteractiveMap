import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import Modal_Schematics                         from '../Modal/Schematics.js';

export default class Building_Production
{
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-exchange',
            text        : 'Update recipe',
            callback    : Building_Production.editRecipe
        });
        contextMenu.push('-');

        let mCurrentRecipe      = baseLayout.getObjectProperty(currentObject, 'mCurrentRecipe');
            if(mCurrentRecipe !== null)
            {
                contextMenu.push({
                    icon        : 'fa-box-full',
                    text        : 'Fill inventory',
                    callback    : Building_Production.fillInventory,
                    className   : 'Building_Production_fillInventory'
                });
            }

        contextMenu.push({
            icon        : 'fa-box-open',
            text        : 'Clear inventory',
            callback    : Building_Production.clearInventory,
            className   : 'Building_Production_clearInventory'
        });
        contextMenu.push('-');

        return contextMenu;
    }

    static editRecipe(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let mCurrentRecipe      = baseLayout.getObjectProperty(currentObject, 'mCurrentRecipe');
        let selectedRecipes     = [];
        let selectOptions       = [];

        let statisticsSchematics = new Modal_Schematics({
                baseLayout      : baseLayout
            });
        let purchasedSchematics = statisticsSchematics.getPurchasedSchematics();

        for(const [recipeId, recipeData] of baseLayout.recipesData)
        {
            if(recipeData.mProducedIn !== undefined && recipeData.mProducedIn.includes(currentObject.className))
            {
                selectedRecipes.push(recipeId);
            }
        }

        selectedRecipes.sort(function(a, b){
            return baseLayout.recipesData.get(a).name.localeCompare(baseLayout.recipesData.get(b).name);
        }.bind(baseLayout));

        for(let i = 0; i < selectedRecipes.length; i++)
        {
            const recipeData = baseLayout.recipesData.get(selectedRecipes[i]);
            if(recipeData.className !== undefined)
            {
                let isUnlocked = false;

                    for(let schematicId in baseLayout.schematicsData)
                    {
                        if(baseLayout.schematicsData[schematicId].className !== undefined && purchasedSchematics.includes(baseLayout.schematicsData[schematicId].className))
                        {
                            if(baseLayout.schematicsData[schematicId].recipes !== undefined && baseLayout.schematicsData[schematicId].recipes.includes(recipeData.className))
                            {
                                isUnlocked = true;
                            }
                        }
                    }

                    if(isUnlocked === true)
                    {
                        selectOptions.push({text: recipeData.name, value: recipeData.className});
                    }
            }
        }

        selectOptions.unshift({text: 'None', value: 'NULL'});

        BaseLayout_Modal.form({
            title       : 'Update "' + buildingData.name + '" recipe',
            container   : '#leafletMap',
            inputs      : [
                {
                    name            : 'recipe',
                    inputType       : 'select',
                    inputOptions    : selectOptions,
                    value           : ((mCurrentRecipe !== null) ? mCurrentRecipe.pathName : 'NULL')
                }
            ],
            callback    : function(form)
            {
                if(form !== null && form.recipe !== null)
                {
                    if(form.recipe === 'NULL')
                    {
                        baseLayout.deleteObjectProperty(currentObject, 'mCurrentRecipe');
                    }
                    else
                    {
                        if(mCurrentRecipe === null)
                        {
                             currentObject.properties.push({name: "mCurrentRecipe", type: "ObjectProperty", value: {levelName: "", pathName: form.recipe}});
                        }
                        else
                        {
                            mCurrentRecipe.pathName = form.recipe;
                        }
                    }

                    Building_Production.clearInventory(marker);
                }
            }
        });
    }

    static fillInventory(marker, updateRadioactivityLayer = true)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mCurrentRecipe      = baseLayout.getObjectProperty(currentObject, 'mCurrentRecipe');
            if(mCurrentRecipe !== null)
            {
                let currentRecipe       = baseLayout.getItemDataFromRecipe(currentObject);
                    if(currentRecipe !== null)
                    {
                        let mInputInventory     = baseLayout.getObjectProperty(currentObject, 'mInputInventory');
                            if(mInputInventory !== null)
                            {
                                let inputInventory = baseLayout.saveGameParser.getTargetObject(mInputInventory.pathName);
                                    if(inputInventory !== null)
                                    {
                                        let ingredientsKeys     = Object.keys(currentRecipe.ingredients);
                                        let mInventoryStacks    = baseLayout.getObjectProperty(inputInventory, 'mInventoryStacks');
                                            for(let i = 0; i < mInventoryStacks.values.length; i++)
                                            {
                                                if(ingredientsKeys[i] !== undefined)
                                                {
                                                    mInventoryStacks.values[i][0].value.itemName = ingredientsKeys[i];

                                                    let itemData = baseLayout.getItemDataFromClassName(ingredientsKeys[i]);
                                                        if(itemData.category === 'liquid' || itemData.category === 'gas')
                                                        {
                                                            baseLayout.setObjectProperty(mInventoryStacks.values[i][0].value, 'NumItems', 50000);
                                                        }
                                                        else
                                                        {
                                                            baseLayout.setObjectProperty(mInventoryStacks.values[i][0].value, 'NumItems', itemData.stack);
                                                        }
                                                }
                                                else
                                                {
                                                    mInventoryStacks.values[i][0].value.itemName = '';
                                                    baseLayout.setObjectProperty(mInventoryStacks.values[i][0].value, 'NumItems', 0);
                                                }
                                            }
                                    }
                            }

                        let mOutputInventory    = baseLayout.getObjectProperty(currentObject, 'mOutputInventory');
                            if(mOutputInventory !== null)
                            {
                                let outInventory = baseLayout.saveGameParser.getTargetObject(mOutputInventory.pathName);
                                    if(outInventory !== null)
                                    {
                                        let produceKeys         = Object.keys(currentRecipe.produce)
                                        let mInventoryStacks    = baseLayout.getObjectProperty(outInventory, 'mInventoryStacks');
                                            for(let i = 0; i < mInventoryStacks.values.length; i++)
                                            {
                                                if(produceKeys[i] !== undefined)
                                                {
                                                    mInventoryStacks.values[i][0].value.itemName = produceKeys[i];

                                                    let itemData = baseLayout.getItemDataFromClassName(produceKeys[i]);
                                                        if(itemData.category === 'liquid' || itemData.category === 'gas')
                                                        {
                                                            baseLayout.setObjectProperty(mInventoryStacks.values[i][0].value, 'NumItems', 50000);
                                                        }
                                                        else
                                                        {
                                                            baseLayout.setObjectProperty(mInventoryStacks.values[i][0].value, 'NumItems', itemData.stack);
                                                        }
                                                }
                                                else
                                                {
                                                    mInventoryStacks.values[i][0].value.itemName = '';
                                                    baseLayout.setObjectProperty(mInventoryStacks.values[i][0].value, 'NumItems', 0);
                                                }
                                            }
                                    }
                            }

                        delete baseLayout.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName];
                        baseLayout.radioactivityLayerNeedsUpdate = true;
                        baseLayout.getObjectRadioactivity(currentObject, 'mInputInventory');
                        baseLayout.getObjectRadioactivity(currentObject, 'mOutputInventory');

                        if(updateRadioactivityLayer === true)
                        {
                            baseLayout.updateRadioactivityLayer();
                        }
                    }
            }
    }

    static clearInventory(marker, updateRadioactivityLayer = true)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let mInputInventory     = baseLayout.getObjectProperty(currentObject, 'mInputInventory');
            if(mInputInventory !== null)
            {
                let inputInventory = baseLayout.saveGameParser.getTargetObject(mInputInventory.pathName);
                    if(inputInventory !== null)
                    {
                        let mInventoryStacks = baseLayout.getObjectProperty(inputInventory, 'mInventoryStacks');
                            for(let i = 0; i < mInventoryStacks.values.length; i++)
                            {
                                mInventoryStacks.values[i][0].value.itemName = '';
                                baseLayout.setObjectProperty(mInventoryStacks.values[i][0].value, 'NumItems', 0);
                            }
                    }
            }

        let mOutputInventory    = baseLayout.getObjectProperty(currentObject, 'mOutputInventory');
            if(mOutputInventory !== null)
            {
                let outInventory = baseLayout.saveGameParser.getTargetObject(mOutputInventory.pathName);
                    if(outInventory !== null)
                    {
                        let mInventoryStacks = baseLayout.getObjectProperty(outInventory, 'mInventoryStacks');
                            for(let i = 0; i < mInventoryStacks.values.length; i++)
                            {
                                mInventoryStacks.values[i][0].value.itemName = '';
                                baseLayout.setObjectProperty(mInventoryStacks.values[i][0].value, 'NumItems', 0);
                            }
                    }
            }

        delete baseLayout.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName];
        baseLayout.radioactivityLayerNeedsUpdate = true;
        baseLayout.getObjectRadioactivity(currentObject, 'mInputInventory');
        baseLayout.getObjectRadioactivity(currentObject, 'mOutputInventory');
        baseLayout.updateRadioactivityLayer();

        if(updateRadioactivityLayer === true)
        {
            baseLayout.updateRadioactivityLayer();
        }
    }
}