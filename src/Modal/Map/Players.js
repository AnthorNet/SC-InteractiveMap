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
                let mNumTotalInventorySlots     = this.baseLayout.getObjectPropertyValue(this.unlockSubSystem, 'mNumTotalInventorySlots');
                let mNumTotalArmEquipmentSlots  = this.baseLayout.getObjectPropertyValue(this.unlockSubSystem, 'mNumTotalArmEquipmentSlots');

                updateSizeHtml.push('<div class="row">');
                updateSizeHtml.push('<div class="col-6">');
                    updateSizeHtml.push('<div class="input-group mt-3"><div class="input-group-prepend"><span class="input-group-text">Total Inventory Slots</span><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryRemoveInventory">-</button></div><input type="text" class="form-control text-center" value="' + ((mNumTotalInventorySlots !== null) ? mNumTotalInventorySlots : 22) + '" readonly><div class="input-group-append"><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryAddInventory">+</button></div></div>');
                updateSizeHtml.push('</div>');
                updateSizeHtml.push('<div class="col-6">');
                    updateSizeHtml.push('<div class="input-group mt-3"><div class="input-group-prepend"><span class="input-group-text">Total Arm Equipment Slots</span><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryRemoveBelt">-</button></div><input type="text" class="form-control text-center" value="' + ((mNumTotalArmEquipmentSlots !== null) ? mNumTotalArmEquipmentSlots : 1) + '" readonly><div class="input-group-append"><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryAddBelt">+</button></div></div>');
                updateSizeHtml.push('</div>');
                updateSizeHtml.push('</div>');
            }

            for(const [pathName, player] of this.baseLayout.players)
            {
                let mOwnedPawn  = player.getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        inventoryHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ((player.isHost() === true) ? 'active' : '') + '" data-toggle="tab" href="#playerInventory-' + mOwnedPawn.pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">');
                        inventoryHeaderHtml.push(player.getDisplayName());
                        inventoryHeaderHtml.push('</span></li>');

                        inventoryHtml.push('<div class="tab-pane fade ' + ((player.isHost() === true) ? 'show active' : '') + '" id="playerInventory-' + mOwnedPawn.pathName.replace('Persistent_Level:PersistentLevel.', '') + '">');

                        let inventory           = this.baseLayout.getObjectInventory(mOwnedPawn, 'mInventory');

                            inventoryHtml.push('<div class="row">');

                                inventoryHtml.push('<div class="col-6" style="padding-left: 10px;padding-right: 10px;">');
                                inventoryHtml.push(this.baseLayout.setInventoryTableSlot(inventory, null, 64));
                                inventoryHtml.push('</div>');

                                inventoryHtml.push('<div class="col-6">');
                                    inventoryHtml.push('<div style="position: relative;padding-top: 100%;background: url(' + this.baseLayout.staticUrl + '/img/charSilhouette.png) center no-repeat #666;background-size: contain;border: 1px solid #000; border-radius: 5px;">');


                                    let armSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.ArmSlot');
                                        inventoryHtml.push('<div style="position: absolute;margin-top: -100%;padding-top: 50%;padding-left: 5%;">' + this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectTargetInventory(armSlot), null, 64, '', null, 4) + '</div>');

                                    let backSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.BackSlot');
                                        inventoryHtml.push('<div style="position: absolute;margin-top: -100%;padding-top: 25%;padding-left: 5%;">' + this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectTargetInventory(backSlot), null, 64) + '</div>');

                                    inventoryHtml.push('</div>');

                                    if(player.isHost() === false)
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
            $('.parseStatisticsPlayerInventoryDeleteGuest').on('click', function(e){
                let pathName = $(e.target).attr('data-pathName');
                const player = this.baseLayout.players.get(pathName);
                    if(player !== undefined)
                    {
                        player.delete();
                    }
                this.parse();
            }.bind(this));
        }
    }

    addEquipmentSlot(count)
    {
        if(this.unlockSubSystem !== null)
        {
            let mNumTotalArmEquipmentSlots  = this.baseLayout.getObjectPropertyValue(this.unlockSubSystem, 'mNumTotalArmEquipmentSlots');
            let newCount                    = Math.max(1, Math.min(9, ((mNumTotalArmEquipmentSlots !== null) ? mNumTotalArmEquipmentSlots : 1) + parseInt(count)));
                this.baseLayout.setObjectProperty(this.unlockSubSystem, {
                    name: 'mNumTotalArmEquipmentSlots',
                    type: 'IntProperty',
                    value: newCount
                });
                count                        = newCount - mNumTotalArmEquipmentSlots;

            for(const player of this.baseLayout.players.values())
            {
                let mOwnedPawn  = player.getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        let armSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.ArmSlot');
                        const mInventoryStacks = this.baseLayout.getObjectPropertyValue(armSlot, 'mInventoryStacks');
                        if(mInventoryStacks !== null)
                        {
                            for(let k = 0; k < count; k++)
                            {
                                mInventoryStacks.values.push([{
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
                        const mArbitrarySlotSizes = this.baseLayout.getObjectPropertyValue(armSlot, 'mArbitrarySlotSizes');
                        if(mArbitrarySlotSizes !== null)
                        {
                            for(let k = 0; k < count; k++)
                            {
                                mArbitrarySlotSizes.values.push(0);
                            }
                        }
                        const mAllowedItemDescriptors = this.baseLayout.getObjectPropertyValue(armSlot, 'mAllowedItemDescriptors');
                        if(mAllowedItemDescriptors !== null)
                        {
                            for(let k = 0; k < count; k++)
                            {
                                mAllowedItemDescriptors.values.push({levelName: "", pathName: ""});
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
            let mNumTotalArmEquipmentSlots  = this.baseLayout.getObjectPropertyValue(this.unlockSubSystem, 'mNumTotalArmEquipmentSlots');
            let newCount                    = Math.max(1, Math.min(9, ((mNumTotalArmEquipmentSlots !== null) ? mNumTotalArmEquipmentSlots : 1) - parseInt(count)));
                this.baseLayout.setObjectProperty(this.unlockSubSystem, {
                    name: 'mNumTotalArmEquipmentSlots',
                    type: 'IntProperty',
                    value: newCount
                });

            for(const player of this.baseLayout.players.values())
            {
                let mOwnedPawn  = player.getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        let armSlot = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName + '.ArmSlot');
                            for(let j = 0; j < armSlot.properties.length; j++)
                            {
                                const mActiveEquipmentIndex = this.baseLayout.getObjectPropertyValue(armSlot, 'mActiveEquipmentIndex');
                                if(mActiveEquipmentIndex !== null)
                                {
                                    this.baseLayout.setObjectPropertyValue(armSlot, 'mActiveEquipmentIndex', 0);
                                }
                                for (const propertyName of ['mInventoryStacks', 'mArbitrarySlotSizes', 'mAllowedItemDescriptors']) {
                                    const property = this.baseLayout.getObjectPropertyValue(armSlot, propertyName);
                                    if(property !== null)
                                    {
                                        property.values.splice(newCount);
                                    }
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
            let mNumTotalInventorySlots     = this.baseLayout.getObjectPropertyValue(this.unlockSubSystem, 'mNumTotalInventorySlots');
            let newCount                    = Math.max(22, Math.min(500, ((mNumTotalInventorySlots !== null) ? mNumTotalInventorySlots : 22) + parseInt(count)));
                this.baseLayout.setObjectProperty(this.unlockSubSystem, {
                    name: 'mNumTotalInventorySlots',
                    type: 'IntProperty',
                    value: newCount
                });
                count                        = newCount - mNumTotalInventorySlots;

            for(const player of this.baseLayout.players.values())
            {
                let mOwnedPawn  = player.getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        let inventory = this.baseLayout.getObjectInventory(mOwnedPawn, 'mInventory', true);
                        const mInventoryStacks = this.baseLayout.getObjectPropertyValue(inventory, 'mInventoryStacks');
                        if(mInventoryStacks !== null)
                        {
                            for(let k = 0; k < count; k++)
                            {
                                mInventoryStacks.values.push([{
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
                        const mArbitrarySlotSizes = this.baseLayout.getObjectPropertyValue(inventory, 'mArbitrarySlotSizes');
                        if(mArbitrarySlotSizes !== null)
                        {
                            for(let k = 0; k < count; k++)
                            {
                                mArbitrarySlotSizes.values.push(0);
                            }
                        }
                        const mAllowedItemDescriptors = this.baseLayout.getObjectPropertyValue(inventory, 'mAllowedItemDescriptors');
                        if(mAllowedItemDescriptors !== null)
                        {
                            for(let k = 0; k < count; k++)
                            {
                                mAllowedItemDescriptors.values.push({levelName: "", pathName: ""});
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
            let mNumTotalInventorySlots     = this.baseLayout.getObjectPropertyValue(this.unlockSubSystem, 'mNumTotalInventorySlots');
            let newCount                    = Math.max(22, Math.min(500, ((mNumTotalInventorySlots !== null) ? mNumTotalInventorySlots : 22) - parseInt(count)));
                this.baseLayout.setObjectProperty(this.unlockSubSystem, {
                    name: 'mNumTotalInventorySlots',
                    type: 'IntProperty',
                    value: newCount
                });

            for(const player of this.baseLayout.players.values())
            {
                let mOwnedPawn  = player.getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        let inventory = this.baseLayout.getObjectInventory(mOwnedPawn, 'mInventory', true);
                            for(const propertyName of ['mInventoryStacks', 'mArbitrarySlotSizes', 'mAllowedItemDescriptors'])
                            {
                                const property = this.baseLayout.getObjectPropertyValue(inventory, propertyName);
                                {
                                    for(let k = 0; k < count; k++)
                                    {
                                        property.values.splice(newCount);
                                    }
                                }
                            }
                    }
            }
        }
    }
}