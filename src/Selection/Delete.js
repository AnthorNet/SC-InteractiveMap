/* global gtag */
import Modal_Selection                          from '../Modal/Selection.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class Selection_Delete
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.markers                = options.markers;

        this.keepDeleted            = (options.keepDeleted !== undefined) ? options.keepDeleted : false;

        this.useHistory             = (options.history !== undefined) ? options.history : true;

        if(typeof gtag === 'function')
        {
            gtag('event', 'Delete', {event_category: 'Selection'});
        }

        return this.delete();
    }

    delete()
    {
        let putInCrate                                          = {};

        if(this.markers)
        {
            console.time('deleteMultipleMarkers');

            for(let i = 0; i < this.markers.length; i++)
            {
                let contextMenu = this.baseLayout.getContextMenu(this.markers[i]);

                if(contextMenu !== false)
                {
                    // Search for a delete callback in contextmenu...
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name.includes('delete'))
                        {
                            if(this.keepDeleted === true)
                            {
                                let currentObject       = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);
                                let mBuiltWithRecipe    = this.baseLayout.getObjectProperty(currentObject, 'mBuiltWithRecipe');
                                    if(mBuiltWithRecipe !== null)
                                    {
                                        let recipeName = mBuiltWithRecipe.pathName.split('.')[1];
                                            if(this.baseLayout.recipesData[recipeName] !== undefined)
                                            {
                                                for(let ingredient in this.baseLayout.recipesData[recipeName].ingredients)
                                                {
                                                    if(putInCrate[ingredient] === undefined)
                                                    {
                                                        putInCrate[ingredient] = 0;
                                                    }

                                                    putInCrate[ingredient] += this.baseLayout.recipesData[recipeName].ingredients[ingredient];
                                                }
                                            }
                                    }

                                let inventory   = [];
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mStorageInventory'));
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mInputInventory'));
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mOutputInventory'));
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mInventory'));
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mFuelInventory'));
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mBatteryInventory'));
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mInventoryPotential'));

                                    if(inventory.length > 0)
                                    {
                                        for(let m = 0; m < inventory.length; m++)
                                        {
                                            if(inventory[m] !== null)
                                            {
                                                if(putInCrate[inventory[m].rawClassName] === undefined)
                                                {
                                                    putInCrate[inventory[m].rawClassName] = 0;
                                                }

                                                putInCrate[inventory[m].rawClassName] += inventory[m].qty;
                                            }
                                        }
                                    }

                                if([
                                    '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C',
                                    '/Script/FactoryGame.FGItemPickup_Spawnable',
                                    '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C'
                                ].includes(currentObject.className))
                                {
                                    let itemClassName = this.baseLayout.itemsData[this.markers[i].options.itemId].className;
                                        if(putInCrate[itemClassName] === undefined)
                                        {
                                            putInCrate[itemClassName] = 0;
                                        }

                                    putInCrate[itemClassName] += this.markers[i].options.itemQty;
                                }
                            }

                            contextMenu[j].callback({baseLayout: this.baseLayout, relatedTarget: this.markers[i]}, false, true);
                        }
                    }
                }
            }

            if(this.keepDeleted === true)
            {
                let maxInCrate  = 64;
                let tempCrate   = [];

                for(let className in putInCrate)
                {
                    let stackSize = 50;

                    let currentItemData = this.baseLayout.getItemDataFromClassName(className);

                        if(currentItemData !== null && currentItemData.stack !== undefined && currentItemData.category !== 'liquid' && currentItemData.category !== 'gas')
                        {
                            if(currentItemData.stack !== undefined)
                            {
                                stackSize = currentItemData.stack;
                            }

                            while(putInCrate[className] > 0)
                            {
                                let currentAmount = Math.min(putInCrate[className], stackSize);

                                tempCrate.push({
                                    className   : className,
                                    amount      : currentAmount
                                });

                                putInCrate[className] -= currentAmount;
                            }
                        }
                }

                let currentLootCrateInventory = null;

                for(let i = 0; i < tempCrate.length; i++)
                {
                    if(i % maxInCrate === 0)
                    {
                        currentLootCrateInventory = this.baseLayout.spawnNewLootCrateNearPlayer();
                    }

                    let newItem = [{
                        name: "Item",
                        type: "StructProperty",
                        value: {
                            type: "InventoryItem",
                            unk1: 0,
                            itemName: tempCrate[i].className,
                            levelName: "",
                            pathName: "",
                            properties: [{name: "NumItems", type: "IntProperty", value: tempCrate[i].amount}]
                        }
                    }];

                    currentLootCrateInventory.properties[0].value.values.push(newItem);
                    currentLootCrateInventory.properties[1].value.values.push(0);
                }

                this.baseLayout.setBadgeLayerCount('playerCratesLayer');
            }

            console.timeEnd('deleteMultipleMarkers');
            this.baseLayout.updateRadioactivityLayer();
            this.baseLayout.updateDelayedBadgeCount();
        }

        Modal_Selection.cancel(this.baseLayout);
    }
}