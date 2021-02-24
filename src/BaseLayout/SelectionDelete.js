/* global gtag */
import BaseLayout_Math from '../BaseLayout/Math.js';

export default class BaseLayout_Selection_Delete
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.markersSelected        = options.markersSelected;

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
        this.baseLayout.saveGameParser.autoPurgeDeleteObjects   = false;
        let putInCrate                                          = {};

        if(this.markersSelected)
        {
            console.time('deleteMultipleMarkers');

            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let contextMenu = this.baseLayout.getContextMenu(this.markersSelected[i]);

                if(contextMenu !== false)
                {
                    // Search for a delete callback in contextmenu...
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name.search('delete') !== -1)
                        {
                            if(this.keepDeleted === true)
                            {
                                let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.markersSelected[i].options.pathName);

                                for(let k = 0; k < currentObject.properties.length; k++)
                                {
                                    if(currentObject.properties[k].name === 'mBuiltWithRecipe')
                                    {
                                        let recipeName = currentObject.properties[k].value.pathName.split('.')[1];
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

                                                break;
                                            }
                                    }

                                    // Before update 3
                                    if(currentObject.properties[k].name === 'mDismantleRefund')
                                    {
                                        let dismantleRefund = currentObject.properties[k].value.values;

                                            for(let m = 0; m < dismantleRefund.length; m++)
                                            {
                                                let currentClass    = null;
                                                let currentAmount   = null;

                                                for(let n = 0; n < dismantleRefund[m].length; n++)
                                                {
                                                    if(dismantleRefund[m][n].name === 'ItemClass')
                                                    {
                                                        currentClass    = dismantleRefund[m][n].value.pathName;
                                                    }
                                                    if(dismantleRefund[m][n].name === 'amount')
                                                    {
                                                        currentAmount   = dismantleRefund[m][n].value;
                                                    }
                                                }

                                                if(currentClass !== null && currentAmount !== null)
                                                {
                                                    if(putInCrate[currentClass] === undefined)
                                                    {
                                                        putInCrate[currentClass] = 0;
                                                    }

                                                    putInCrate[currentClass] += currentAmount;
                                                }
                                            }
                                        break;
                                    }
                                }

                                let inventory   = this.baseLayout.getObjectInventory(currentObject, 'mStorageInventory');
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mInputInventory'));
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mOutputInventory'));
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mInventory'));
                                    inventory   = inventory.concat(this.baseLayout.getObjectInventory(currentObject, 'mFuelInventory'));

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
                            }

                            contextMenu[j].callback({relatedTarget: this.markersSelected[i]}, false, true);
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

                this.baseLayout.saveGameParser.refreshHashmap();
                this.baseLayout.setBadgeLayerCount('playerCratesLayer');
            }

            this.baseLayout.saveGameParser.purgeDeleteObjects();

            console.timeEnd('deleteMultipleMarkers');
            this.baseLayout.updateRadioactivityLayer();
            this.baseLayout.updateDelayedBadgeCount();
        }

        this.baseLayout.cancelSelectMultipleMarkers();
    }
}