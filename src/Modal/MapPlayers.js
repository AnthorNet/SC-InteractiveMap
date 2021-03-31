export default class Modal_MapPlayers
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
    }

    parse()
    {
        $('#statisticsPlayerInventory').empty();

        if(this.baseLayout.playersState !== undefined && this.baseLayout.playersState.length > 0)
        {
            let updateSizeHtml  = [];
            let unlockSubSystem = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem");

                if(unlockSubSystem !== null)
                {
                    let mNumTotalInventorySlots     = this.baseLayout.getObjectProperty(unlockSubSystem, 'mNumTotalInventorySlots');
                    let mNumTotalArmEquipmentSlots  = this.baseLayout.getObjectProperty(unlockSubSystem, 'mNumTotalArmEquipmentSlots');

                    updateSizeHtml.push('<div class="row">');
                    updateSizeHtml.push('<div class="col-6">');
                        updateSizeHtml.push('<div class="input-group mt-3"><div class="input-group-prepend"><span class="input-group-text">Total Inventory Slots</span><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryRemoveInventory">-</button></div><input type="text" class="form-control text-center" value="' + ((mNumTotalInventorySlots !== null) ? mNumTotalInventorySlots : 22) + '" readonly><div class="input-group-append"><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryAddInventory">+</button></div></div>');
                    updateSizeHtml.push('</div>');
                    updateSizeHtml.push('<div class="col-6">');
                        updateSizeHtml.push('<div class="input-group mt-3"><div class="input-group-prepend"><span class="input-group-text">Total Arm Equipment Slots</span><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryRemoveBelt">-</button></div><input type="text" class="form-control text-center" value="' + ((mNumTotalArmEquipmentSlots !== null) ? mNumTotalArmEquipmentSlots : 1) + '" readonly><div class="input-group-append"><button class="btn btn-outline-secondary text-white" type="button" id="parseStatisticsPlayerInventoryAddBelt">+</button></div></div>');
                    updateSizeHtml.push('</div>');
                    updateSizeHtml.push('</div>');
                }

                let inventoryHeaderHtml = [];
                let inventoryHtml       = [];
                    for(let i = 0; i < this.baseLayout.playersState.length; i++)
                    {
                        let isHost      = (this.baseLayout.playersState[i].pathName === this.baseLayout.saveGameParser.playerHostPathName);
                        let mOwnedPawn  = this.baseLayout.getObjectProperty(this.baseLayout.playersState[i], 'mOwnedPawn');
                            if(mOwnedPawn !== null)
                            {
                                let currentPlayer   = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);

                                    inventoryHeaderHtml.push('<li class="nav-item"><a class="nav-link ' + ((isHost === true) ? 'active' : '') + '" data-toggle="tab" href="#playerInventory-' + currentPlayer.pathName.replace('Persistent_Level:PersistentLevel.', '') + '" role="tab">');

                                    if(isHost === true)
                                    {
                                        inventoryHeaderHtml.push('Host');
                                    }
                                    else
                                    {
                                        inventoryHeaderHtml.push('Guest #' + this.baseLayout.playersState[i].pathName.replace('Persistent_Level:PersistentLevel.BP_PlayerState_C_', ''));
                                    }

                                    inventoryHeaderHtml.push('</a></li>');

                                    inventoryHtml.push('<div class="tab-pane fade ' + ((isHost === true) ? 'show active' : '') + '" id="playerInventory-' + currentPlayer.pathName.replace('Persistent_Level:PersistentLevel.', '') + '" role="tabpanel">' + this.parseInventoryPlayer(currentPlayer) + '</div>');
                            }
                    }
                $('#statisticsPlayerInventory').html('<ul class="nav nav-tabs nav-fill" role="tablist">' + inventoryHeaderHtml.join('') + '</ul><div class="tab-content p-3 border border-top-0">' + inventoryHtml.join('') + '</div>' + updateSizeHtml.join(''));

            if(unlockSubSystem !== null)
            {
                $('#parseStatisticsPlayerInventoryRemoveInventory').on('click', function(){
                    this.removeInventorySlot(1);
                    this.parse();
                }.bind(this));
                $('#parseStatisticsPlayerInventoryAddInventory').on('click', function(){
                    this.addInventorySlot(1);
                    this.parse();
                }.bind(this));

                $('#parseStatisticsPlayerInventoryRemoveBelt').on('click', function(){
                    this.removeEquipmentSlot(1);
                    this.parse();
                }.bind(this));
                $('#parseStatisticsPlayerInventoryAddBelt').on('click', function(){
                    this.addEquipmentSlot(1);
                    this.parse();
                }.bind(this));
            }
        }
        else
        {
            $('#statisticsPlayerInventory').html('<div class="alert alert-danger" role="alert">We could not find the player inventory!</div>');
        }
    }

    parseInventoryPlayer(player)
    {
        let html                = [];
        let inventory           = this.baseLayout.getObjectInventory(player, 'mInventory');

            html.push('<div class="row">');

                html.push('<div class="col-6" style="padding-left: 10px;padding-right: 10px;">');
                html.push(this.baseLayout.setInventoryTableSlot(inventory, null, 64));
                html.push('</div>');

                html.push('<div class="col-6">');
                    html.push('<div style="position: relative;padding-top: 100%;background: url(' + this.baseLayout.staticUrl + '/img/charSilhouette.png) center no-repeat #666;background-size: contain;border: 1px solid #000; border-radius: 5px;">');

                    let backSlot    = this.baseLayout.saveGameParser.getTargetObject(player.pathName + '.BackSlot');
                    let armSlot     = this.baseLayout.saveGameParser.getTargetObject(player.pathName + '.ArmSlot');

                    html.push('<div style="position: absolute;margin-top: -100%;padding-top: 25%;padding-left: 5%;">' + this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectTargetInventory(backSlot), null, 64) + '</div>');
                    html.push('<div style="position: absolute;margin-top: -100%;padding-top: 50%;padding-left: 5%;">' + this.baseLayout.setInventoryTableSlot(this.baseLayout.getObjectTargetInventory(armSlot), null, 64, '', null, 4) + '</div>');

                    html.push('</div>');
                html.push('</div>');

            html.push('</div>');
        return html.join('');
    }

    addEquipmentSlot(count)
    {
        let unlockSubSystem = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem");
            if(unlockSubSystem !== null)
            {
                let mNumTotalArmEquipmentSlots  = this.baseLayout.getObjectProperty(unlockSubSystem, 'mNumTotalArmEquipmentSlots');
                let newCount                    = Math.max(1, Math.min(9, ((mNumTotalArmEquipmentSlots !== null) ? mNumTotalArmEquipmentSlots : 1) + parseInt(count)));
                    this.baseLayout.setObjectProperty(unlockSubSystem, 'mNumTotalArmEquipmentSlots', newCount, 'IntProperty');
                    count                        = newCount - mNumTotalArmEquipmentSlots;

                if(this.baseLayout.playersState.length > 0)
                {
                    for(let i = 0; i < this.baseLayout.playersState.length; i++)
                    {
                        let mOwnedPawn  = this.baseLayout.getObjectProperty(this.baseLayout.playersState[i], 'mOwnedPawn');
                            if(mOwnedPawn !== null)
                            {
                                let currentPlayer   = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                let armSlot         = this.baseLayout.saveGameParser.getTargetObject(currentPlayer.pathName + '.ArmSlot');
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
    }

    removeEquipmentSlot(count)
    {
        let unlockSubSystem = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem");
            if(unlockSubSystem !== null)
            {
                let mNumTotalArmEquipmentSlots  = this.baseLayout.getObjectProperty(unlockSubSystem, 'mNumTotalArmEquipmentSlots');
                let newCount                    = Math.max(1, Math.min(9, ((mNumTotalArmEquipmentSlots !== null) ? mNumTotalArmEquipmentSlots : 1) - parseInt(count)));
                    this.baseLayout.setObjectProperty(unlockSubSystem, 'mNumTotalArmEquipmentSlots', newCount, 'IntProperty');

                if(this.baseLayout.playersState.length > 0)
                {
                    for(let i = 0; i < this.baseLayout.playersState.length; i++)
                    {
                        let mOwnedPawn  = this.baseLayout.getObjectProperty(this.baseLayout.playersState[i], 'mOwnedPawn');
                            if(mOwnedPawn !== null)
                            {
                                let currentPlayer   = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                let armSlot         = this.baseLayout.saveGameParser.getTargetObject(currentPlayer.pathName + '.ArmSlot');
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
    }

    addInventorySlot(count)
    {
        let unlockSubSystem = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem");
            if(unlockSubSystem !== null)
            {
                let mNumTotalInventorySlots     = this.baseLayout.getObjectProperty(unlockSubSystem, 'mNumTotalInventorySlots');
                let newCount                    = Math.max(22, Math.min(500, ((mNumTotalInventorySlots !== null) ? mNumTotalInventorySlots : 22) + parseInt(count)));
                   this.baseLayout.setObjectProperty(unlockSubSystem, 'mNumTotalInventorySlots', newCount, 'IntProperty');
                   count                        = newCount - mNumTotalInventorySlots;

                if(this.baseLayout.playersState.length > 0)
                {
                    for(let i = 0; i < this.baseLayout.playersState.length; i++)
                    {
                        let mOwnedPawn  = this.baseLayout.getObjectProperty(this.baseLayout.playersState[i], 'mOwnedPawn');
                            if(mOwnedPawn !== null)
                            {
                                let currentPlayer   = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                let inventory       = this.baseLayout.getObjectInventory(currentPlayer, 'mInventory', true);
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
    }

    removeInventorySlot(count)
    {
        let unlockSubSystem = this.baseLayout.saveGameParser.getTargetObject("Persistent_Level:PersistentLevel.UnlockSubsystem");
            if(unlockSubSystem !== null)
            {
                let mNumTotalInventorySlots     = this.baseLayout.getObjectProperty(unlockSubSystem, 'mNumTotalInventorySlots');
                let newCount                    = Math.max(22, Math.min(500, ((mNumTotalInventorySlots !== null) ? mNumTotalInventorySlots : 22) - parseInt(count)));
                   this.baseLayout.setObjectProperty(unlockSubSystem, 'mNumTotalInventorySlots', newCount, 'IntProperty');

                if(this.baseLayout.playersState.length > 0)
                {
                    for(let i = 0; i < this.baseLayout.playersState.length; i++)
                    {
                        let mOwnedPawn  = this.baseLayout.getObjectProperty(this.baseLayout.playersState[i], 'mOwnedPawn');
                            if(mOwnedPawn !== null)
                            {
                                let currentPlayer   = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                let inventory       = this.baseLayout.getObjectInventory(currentPlayer, 'mInventory', true);
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

    deletePlayer(pathName)
    {

    }
}