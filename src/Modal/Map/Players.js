export default class Modal_Map_Players
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.unlockSubSystem    = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem");
    }

    parse()
    {
        $('#statisticsPlayerInventory').empty();

        let updateSizeHtml      = [];
        let inventoryHeaderHtml = [];
        let inventoryHtml       = [];

            if(this.unlockSubSystem !== null)
            {
                let mNumTotalInventorySlots     = this.baseLayout.getObjectProperty(this.unlockSubSystem, 'mNumTotalInventorySlots');
                let mNumTotalArmEquipmentSlots  = this.baseLayout.getObjectProperty(this.unlockSubSystem, 'mNumTotalArmEquipmentSlots');

                updateSizeHtml.push('<div class="row">');
                updateSizeHtml.push('<div class="col-6">');
                    updateSizeHtml.push('<div class="input-group mt-3"><div class="input-group-prepend"><span class="input-group-text">Total Inventory Slots</span><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryRemoveInventory">-</button></div><input type="text" class="form-control text-center" value="' + ((mNumTotalInventorySlots !== null) ? mNumTotalInventorySlots : 22) + '" readonly><div class="input-group-append"><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryAddInventory">+</button></div></div>');
                updateSizeHtml.push('</div>');
                updateSizeHtml.push('<div class="col-6">');
                    updateSizeHtml.push('<div class="input-group mt-3"><div class="input-group-prepend"><span class="input-group-text">Total Arm Equipment Slots</span><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryRemoveBelt">-</button></div><input type="text" class="form-control text-center" value="' + ((mNumTotalArmEquipmentSlots !== null) ? mNumTotalArmEquipmentSlots : 1) + '" readonly><div class="input-group-append"><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryAddBelt">+</button></div></div>');
                updateSizeHtml.push('</div>');
                updateSizeHtml.push('</div>');
            }

            for(let pathName in this.baseLayout.players)
            {
                let mOwnedPawn  = this.baseLayout.players[pathName].getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        inventoryHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ((this.baseLayout.players[pathName].isHost() === true) ? 'active' : '') + '" data-toggle="tab" href="#playerInventory-' + mOwnedPawn.pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">');
                        inventoryHeaderHtml.push(this.baseLayout.players[pathName].getDisplayName());
                        inventoryHeaderHtml.push('</span></li>');

                        inventoryHtml.push('<div class="tab-pane fade ' + ((this.baseLayout.players[pathName].isHost() === true) ? 'show active' : '') + '" id="playerInventory-' + mOwnedPawn.pathName.replace('Persistent_Level:PersistentLevel.', '') + '">');

                        let inventory           = this.baseLayout.getObjectInventory(mOwnedPawn, 'mInventory');

                            inventoryHtml.push('<div class="row">');

                                inventoryHtml.push('<div class="col-7" style="padding-left: 10px;padding-right: 10px;">');
                                inventoryHtml.push(this.baseLayout.setInventoryTableSlot(inventory, null, 64, '', null, 9));
                                inventoryHtml.push('</div>');

                                inventoryHtml.push('<div class="col-5">');
                                    inventoryHtml.push('<div style="position: relative;padding-top: 100%;background: url(' + this.baseLayout.staticUrl + '/img/charSilhouette.png) center no-repeat #666;background-size: contain;border: 1px solid #000; border-radius: 5px;min-height: 512px;">');

                                    let headSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.HeadSlot');
                                        inventoryHtml.push('<div style="position: absolute;margin-top: -25px;top: 10%;left: 10%;">');
                                        inventoryHtml.push('<strong>HEAD</strong>');
                                        inventoryHtml.push(this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectTargetInventory(headSlot), 1, 64));
                                        inventoryHtml.push('</div>');

                                    let bodySlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.BodySlot');
                                        inventoryHtml.push('<div style="position: absolute;margin-top: -25px;top: 10%;right: 10%;text-align: right;">');
                                        inventoryHtml.push('<strong>BODY</strong>');
                                        inventoryHtml.push(this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectTargetInventory(bodySlot), 1, 64));
                                        inventoryHtml.push('</div>');

                                    let armSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.ArmSlot');
                                        inventoryHtml.push('<div style="position: absolute;margin-top: -78px;top: 50%;left: 10%;">');
                                        inventoryHtml.push('<strong>HANDS</strong>');
                                        inventoryHtml.push(this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectTargetInventory(armSlot), null, 64, '', null, 3));
                                        inventoryHtml.push('</div>');

                                    let backSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.BackSlot');
                                        inventoryHtml.push('<div style="position: absolute;margin-top: -25px;top: 50%;right: 10%;text-align: right;">');
                                        inventoryHtml.push('<strong>BACK</strong>');
                                        inventoryHtml.push(this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectTargetInventory(backSlot), 1, 64));
                                        inventoryHtml.push('</div>');

                                    let legSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.LegsSlot');
                                        inventoryHtml.push('<div style="position: absolute;margin-bottom: -25px;bottom: 10%;left: 10%;">');
                                        inventoryHtml.push('<strong>LEG</strong>');
                                        inventoryHtml.push(this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectTargetInventory(legSlot), 1, 64));
                                        inventoryHtml.push('</div>');

                                    inventoryHtml.push('</div>');

                                    if(this.baseLayout.players[pathName].isHost() === false)
                                    {
                                        inventoryHtml.push('<button class="btn btn-danger w-100 parseStatisticsPlayerInventoryDeleteGuest" data-pathName="' + pathName +'">Delete player</button>')
                                    }
                                inventoryHtml.push('</div>');

                            inventoryHtml.push('</div>');
                        inventoryHtml.push('</div>');
                    }
            }

        $('#statisticsPlayerInventory').html('<ul class="nav nav-tabs nav-fill">' + inventoryHeaderHtml.join('') + '</ul><div class="tab-content p-3 border border-top-0">' + inventoryHtml.join('') + '</div>' + updateSizeHtml.join(''));

        if(this.unlockSubSystem !== null)
        {
            $('#parseStatisticsPlayerInventoryRemoveInventory').on('click', () => {
                this.removeInventorySlot(1);
                this.parse();
            });
            $('#parseStatisticsPlayerInventoryAddInventory').on('click', () => {
                this.addInventorySlot(1);
                this.parse();
            });

            $('#parseStatisticsPlayerInventoryRemoveBelt').on('click', () => {
                this.removeEquipmentSlot(1);
                this.parse();
            });
            $('#parseStatisticsPlayerInventoryAddBelt').on('click', () => {
                this.addEquipmentSlot(1);
                this.parse();
            });
            $('.parseStatisticsPlayerInventoryDeleteGuest').on('click', (e) => {
                let pathName = $(e.target).attr('data-pathName');
                    if(this.baseLayout.players[pathName] !== undefined)
                    {
                        this.baseLayout.players[pathName].delete();
                    }
                this.parse();
            });
        }
    }

    addEquipmentSlot(count)
    {
        if(this.unlockSubSystem !== null)
        {
            let mNumTotalArmEquipmentSlots  = this.baseLayout.getObjectProperty(this.unlockSubSystem, 'mNumTotalArmEquipmentSlots');
            let newCount                    = Math.max(1, Math.min(9, ((mNumTotalArmEquipmentSlots !== null) ? mNumTotalArmEquipmentSlots : 1) + parseInt(count)));
                this.baseLayout.setObjectProperty(this.unlockSubSystem, 'mNumTotalArmEquipmentSlots', newCount, 'IntProperty');
                count                        = newCount - mNumTotalArmEquipmentSlots;

            for(let pathName in this.baseLayout.players)
            {
                let mOwnedPawn  = this.baseLayout.players[pathName].getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        let armSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.ArmSlot');
                            for(let j = 0; j < armSlot.properties.length; j++)
                            {
                                if(armSlot.properties[j].name === 'mInventoryStacks')
                                {
                                    for(let k = 0; k < count; k++)
                                    {
                                        armSlot.properties[j].value.values.push([{
                                            name: "Item",
                                            type: "StructProperty",
                                            value: {
                                                itemName: "",
                                                levelName: "",
                                                pathName: "",
                                                type: "InventoryItem",
                                                unk1: 0,
                                                properties: [{name: "NumItems", type: "IntProperty", value: 0}]
                                            }
                                        }]);
                                    }
                                }
                                if(armSlot.properties[j].name === 'mArbitrarySlotSizes')
                                {
                                    for(let k = 0; k < count; k++)
                                    {
                                        armSlot.properties[j].value.values.push(0);
                                    }
                                }
                                if(armSlot.properties[j].name === 'mAllowedItemDescriptors')
                                {
                                    for(let k = 0; k < count; k++)
                                    {
                                        armSlot.properties[j].value.values.push({levelName: "", pathName: ""});
                                    }
                                }
                            }
                    }
            }
        }
    }

    removeEquipmentSlot(count)
    {
        if(this.unlockSubSystem !== null)
        {
            let mNumTotalArmEquipmentSlots  = this.baseLayout.getObjectProperty(this.unlockSubSystem, 'mNumTotalArmEquipmentSlots');
            let newCount                    = Math.max(1, Math.min(9, ((mNumTotalArmEquipmentSlots !== null) ? mNumTotalArmEquipmentSlots : 1) - parseInt(count)));
                this.baseLayout.setObjectProperty(this.unlockSubSystem, 'mNumTotalArmEquipmentSlots', newCount, 'IntProperty');

            for(let pathName in this.baseLayout.players)
            {
                let mOwnedPawn  = this.baseLayout.players[pathName].getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        let armSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.ArmSlot');
                            for(let j = 0; j < armSlot.properties.length; j++)
                            {
                                if(armSlot.properties[j].name === 'mActiveEquipmentIndex')
                                {
                                    armSlot.properties[j].value = 0;
                                }
                                if(armSlot.properties[j].name === 'mInventoryStacks' || armSlot.properties[j].name === 'mArbitrarySlotSizes' || armSlot.properties[j].name === 'mAllowedItemDescriptors')
                                {
                                    armSlot.properties[j].value.values.splice(newCount);
                                }
                            }
                    }
            }
        }
    }

    addInventorySlot(count)
    {
        if(this.unlockSubSystem !== null)
        {
            let mNumTotalInventorySlots     = this.baseLayout.getObjectProperty(this.unlockSubSystem, 'mNumTotalInventorySlots');
            let newCount                    = Math.max(22, Math.min(500, ((mNumTotalInventorySlots !== null) ? mNumTotalInventorySlots : 22) + parseInt(count)));
               this.baseLayout.setObjectProperty(this.unlockSubSystem, 'mNumTotalInventorySlots', newCount, 'IntProperty');
               count                        = newCount - mNumTotalInventorySlots;

            for(let pathName in this.baseLayout.players)
            {
                let mOwnedPawn  = this.baseLayout.players[pathName].getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        let inventory = this.baseLayout.getObjectInventory(mOwnedPawn, 'mInventory', true);
                            for(let j = 0; j < inventory.properties.length; j++)
                            {
                                if(inventory.properties[j].name === 'mInventoryStacks')
                                {
                                    for(let k = 0; k < count; k++)
                                    {
                                        inventory.properties[j].value.values.push([{
                                            name: "Item",
                                            type: "StructProperty",
                                            value: {
                                                itemName: "",
                                                levelName: "",
                                                pathName: "",
                                                type: "InventoryItem",
                                                unk1: 0,
                                                properties: [{name: "NumItems", type: "IntProperty", value: 0}]
                                            }
                                        }]);
                                    }
                                }
                                if(inventory.properties[j].name === 'mArbitrarySlotSizes')
                                {
                                    for(let k = 0; k < count; k++)
                                    {
                                        inventory.properties[j].value.values.push(0);
                                    }
                                }
                                if(inventory.properties[j].name === 'mAllowedItemDescriptors')
                                {
                                    for(let k = 0; k < count; k++)
                                    {
                                        inventory.properties[j].value.values.push({levelName: "", pathName: ""});
                                    }
                                }
                            }
                    }
            }
        }
    }

    removeInventorySlot(count)
    {
        if(this.unlockSubSystem !== null)
        {
            let mNumTotalInventorySlots     = this.baseLayout.getObjectProperty(this.unlockSubSystem, 'mNumTotalInventorySlots');
            let newCount                    = Math.max(22, Math.min(500, ((mNumTotalInventorySlots !== null) ? mNumTotalInventorySlots : 22) - parseInt(count)));
               this.baseLayout.setObjectProperty(this.unlockSubSystem, 'mNumTotalInventorySlots', newCount, 'IntProperty');

            for(let pathName in this.baseLayout.players)
            {
                let mOwnedPawn  = this.baseLayout.players[pathName].getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        let inventory = this.baseLayout.getObjectInventory(mOwnedPawn, 'mInventory', true);
                            for(let j = 0; j < inventory.properties.length; j++)
                            {
                                if(inventory.properties[j].name === 'mInventoryStacks' || inventory.properties[j].name === 'mArbitrarySlotSizes' || inventory.properties[j].name === 'mAllowedItemDescriptors')
                                {
                                    for(let k = 0; k < count; k++)
                                    {
                                        inventory.properties[j].value.values.splice(newCount);
                                    }
                                }
                            }
                    }
            }
        }
    }
}