import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class SubSystem_Player
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.player                 = options.player;

        this.defaultInventorySize   = 16;
        this.defaultArmSlots        = 1;

        this.displayName            = false;
        this.doDisplayNameLookup();
    }

    isHost()
    {
        return (this.baseLayout.saveGameParser.playerHostPathName === this.player.pathName);
    }

    doDisplayNameLookup()
    {
        if(this.displayName === false)
        {
            this.displayName = null; // Do lookup only once per session

            if(this.player.eosId !== undefined)
            {
                $.getJSON(this.baseLayout.usersUrl + '?eosId=' + this.player.eosId, function(data)
                {
                    if(data !== null)
                    {
                        this.displayName = data;
                    }
                }.bind(this));
            }
            if(this.player.steamId !== undefined)
            {
                $.getJSON(this.baseLayout.usersUrl + '?steamId=' + this.player.steamId, function(data)
                {
                    if(data !== null)
                    {
                        this.displayName = data;
                    }
                }.bind(this));
            }
        }
    }

    getDisplayName()
    {
        if(this.isHost() === true)
        {
            if(this.displayName !== null)
            {
                return this.displayName + ' <em>(Host)</em>';
            }

            return 'Host';
        }

        if(this.displayName !== null)
        {
            return this.displayName + ' <em>(Guest #' + this.player.pathName.replace('Persistent_Level:PersistentLevel.BP_PlayerState_C_', '') + ')</em>';
        }

        return 'Guest #' + this.player.pathName.replace('Persistent_Level:PersistentLevel.BP_PlayerState_C_', '');
    }

    getOwnedPawn()
    {
        let mOwnedPawn  = this.baseLayout.getObjectPropertyValue(this.player, 'mOwnedPawn');
            if(mOwnedPawn !== null)
            {
                return this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
            }

        return null;
    }

    getCurrentHealth()
    {
        let mOwnedPawn = this.getOwnedPawn();
            if(mOwnedPawn !== null)
            {
                let mHealthComponent = this.baseLayout.getObjectPropertyValue(mOwnedPawn, 'mHealthComponent');
                    if(mHealthComponent !== null)
                    {
                        let currentHealthComponent = this.baseLayout.saveGameParser.getTargetObject(mHealthComponent.pathName);
                            if(currentHealthComponent !== null)
                            {
                                let mCurrentHealth = this.baseLayout.getObjectPropertyValue(currentHealthComponent, 'mCurrentHealth');
                                    if(mCurrentHealth !== null)
                                    {
                                        return mCurrentHealth;
                                    }
                            }
                    }
            }

        return 100;
    }



    addMarker()
    {
        let mOwnedPawn = this.getOwnedPawn();
            if(mOwnedPawn !== null)
            {
                this.baseLayout.setupSubLayer('playerPositionLayer');

                let position        = this.baseLayout.satisfactoryMap.unproject(mOwnedPawn.transform.translation);
                let playerMarker    = L.marker(
                        position,
                        {
                            pathName        : this.player.pathName,
                            icon            : this.baseLayout.getMarkerIcon(
                                '#FFFFFF',
                                ((this.isHost() === true) ? '#b3b3b3' : '#666666'),
                                this.baseLayout.staticUrl + '/img/mapPlayerIcon.png'
                            ),
                            riseOnHover     : true,
                            zIndexOffset    : 1000
                        }
                    );

                this.baseLayout.playerLayers.playerPositionLayer.elements.push(playerMarker);
                playerMarker.bindContextMenu(this.baseLayout);
                this.baseLayout.autoBindTooltip(playerMarker);
                playerMarker.addTo(this.baseLayout.playerLayers.playerPositionLayer.subLayer);

                if(this.isHost() === true)
                {
                    this.baseLayout.satisfactoryMap.leafletMap.setView(position, 7);
                }

                return playerMarker;
            }

        /* Delete wonky player state...
        console.log('mOwnedPawn not found... Deleting wonky player state', this.player);
        this.delete();
        */

        return null;
    }

    teleportTo(transform, zOffset = 400)
    {
        let mOwnedPawn = this.getOwnedPawn();
            if(mOwnedPawn !== null)
            {
                mOwnedPawn.transform                    = transform;
                mOwnedPawn.transform.translation[2]    += zOffset;
                mOwnedPawn.transform.scale3d            = [1, 1, 1];

                this.baseLayout.deleteObjectProperty(this.player, 'mSavedDrivenVehicle');

                let currentPlayerMarker = this.baseLayout.getMarkerFromPathName(this.player.pathName, 'playerPositionLayer');
                    currentPlayerMarker.setLatLng(this.baseLayout.satisfactoryMap.unproject(mOwnedPawn.transform.translation));

                return currentPlayerMarker;
            }

        BaseLayout_Modal.alert('Cannot teleport that player!');
    }



    reset()
    {
        this.baseLayout.deleteObjectProperty(this.player, 'mLastSchematicTierInUI');
        this.baseLayout.deleteObjectProperty(this.player, 'mShoppingList');
        this.baseLayout.deleteObjectProperty(this.player, 'mMessageData');

        // Update player inventories
        let mOwnedPawn = this.baseLayout.getObjectPropertyValue(this.player, 'mOwnedPawn');
            if(mOwnedPawn !== null)
            {
                let currentPlayer   = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                let inventory       = this.baseLayout.getObjectInventory(currentPlayer, 'mInventory', true);
                    if(inventory !== null)
                    {
                        const mAdjustedSizeDiff = this.baseLayout.getObjectPropertyValue(inventory, 'mAdjustedSizeDiff');
                        if(mAdjustedSizeDiff !== null)
                        {
                            this.baseLayout.setObjectPropertyValue(inventory, 'mAdjustedSizeDiff', 0);
                        }
                        for(const propertyName of ['mInventoryStacks', 'mArbitrarySlotSizes', 'mAllowedItemDescriptors'])
                        {
                            const property = this.baseLayout.getObjectPropertyValue(inventory, propertyName);
                            if(property !== null)
                            {
                                property.values.splice(this.defaultInventorySize);

                                // Give Xeno Zapper, Always get prepared ^^
                                if(propertyName === 'mInventoryStacks')
                                {
                                    property.values[0][0].value.itemName               = '/Game/FactoryGame/Resource/Equipment/ShockShank/BP_EquipmentDescriptorShockShank.BP_EquipmentDescriptorShockShank_C';
                                    this.baseLayout.setObjectPropertyValue(property.values[0][0], 'NumItems', 1);
                                }
                            }
                        }
                    }

                let armSlot         = this.baseLayout.saveGameParser.getTargetObject(currentPlayer.pathName + '.ArmSlot');
                                      this.baseLayout.deleteObjectProperty(armSlot, 'mEquipmentInSlot');

                for(const propertyName of ['mAdjustedSizeDiff', 'mActiveEquipmentIndex'])
                {
                    const property = this.baseLayout.getObjectPropertyValue(armSlot, propertyName);
                    if(property !== null)
                    {
                        this.baseLayout.setObjectPropertyValue(armSlot, propertyName, 0);
                    }
                }
                for(const propertyName of ['mInventoryStacks', 'mArbitrarySlotSizes', 'mAllowedItemDescriptors'])
                {
                    const property = this.baseLayout.getObjectPropertyValue(armSlot, propertyName);
                    if(property !== null)
                    {
                        property.values.splice(this.defaultArmSlots);
                    }
                }
            }
    }

    delete()
    {
        if(this.isHost() === false)
        {
            let mOwnedPawn  = this.baseLayout.getObjectPropertyValue(this.player, 'mOwnedPawn');
                if(mOwnedPawn !== null)
                {
                    this.baseLayout.saveGameParser.deleteObject(mOwnedPawn.pathName);
                }

            let oldMarker = this.baseLayout.getMarkerFromPathName(this.player.pathName, 'playerPositionLayer');
                if(oldMarker !== null)
                {
                    this.baseLayout.deleteMarkerFromElements('playerPositionLayer', oldMarker);
                }

            this.baseLayout.saveGameParser.deleteObject(this.player.pathName);
            this.baseLayout.players.delete(this.player.pathName);
        }
    }
}