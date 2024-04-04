import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import Lib_MapMarker                            from '../Lib/L.MapMarker.js';

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
        if(this.baseLayout.saveGameParser.playerHostPathName !== null)
        {
            return (this.baseLayout.saveGameParser.playerHostPathName === this.player.pathName);
        }

        // A temporary fix for Update 8...
        if(Object.keys(this.baseLayout.players)[0] === this.player.pathName)
        {
            return true;
        }

        return false;
    }

    getPlatformId()
    {
        if(this.player.eosId !== undefined)
        {
            return this.player.eosId;
        }
        if(this.player.steamId !== undefined)
        {
            return this.player.steamId;
        }

        return null;
    }

    doDisplayNameLookup()
    {
        let mOwnedPawn = this.getOwnedPawn();
            if(mOwnedPawn !== null)
            {
                let mCachedPlayerName = this.baseLayout.getObjectProperty(mOwnedPawn, 'mCachedPlayerName');
                    if(mCachedPlayerName !== null)
                    {
                        this.displayName = mCachedPlayerName;
                        //console.log('mCachedPlayerName', this.displayName);
                        return;
                    }
            }


        if(this.displayName === false)
        {
            this.displayName = null; // Do lookup only once per session

            if(this.player.eosId !== undefined)
            {
                $.getJSON(this.baseLayout.usersUrl + '?eosId=' + this.player.eosId, (data) => {
                    if(data !== null)
                    {
                        this.displayName = data;
                    }
                });
            }
            if(this.player.steamId !== undefined)
            {
                $.getJSON(this.baseLayout.usersUrl + '?steamId=' + this.player.steamId, (data) => {
                    if(data !== null)
                    {
                        this.displayName = data;
                    }
                });
            }
        }
    }

    getDisplayName(raw = false)
    {
        if(raw === true)
        {
            return this.displayName;
        }

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
        let mOwnedPawn  = this.baseLayout.getObjectProperty(this.player, 'mOwnedPawn');
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
                let mHealthComponent = this.baseLayout.getObjectProperty(mOwnedPawn, 'mHealthComponent');
                    if(mHealthComponent !== null)
                    {
                        let currentHealthComponent = this.baseLayout.saveGameParser.getTargetObject(mHealthComponent.pathName);
                            if(currentHealthComponent !== null)
                            {
                                let mCurrentHealth = this.baseLayout.getObjectProperty(currentHealthComponent, 'mCurrentHealth');
                                    if(mCurrentHealth !== null)
                                    {
                                        return mCurrentHealth;
                                    }
                            }
                    }
            }

        return 100;
    }

    setCurrentHealth(health)
    {
        let mOwnedPawn = this.getOwnedPawn();
            if(mOwnedPawn !== null)
            {
                let mHealthComponent = this.baseLayout.getObjectProperty(mOwnedPawn, 'mHealthComponent');
                    if(mHealthComponent !== null)
                    {
                        let currentHealthComponent = this.baseLayout.saveGameParser.getTargetObject(mHealthComponent.pathName);
                            if(currentHealthComponent !== null)
                            {
                                this.baseLayout.setObjectProperty(currentHealthComponent, 'mCurrentHealth', Math.max(1, Math.min(100, parseInt(health))), 'Float');
                            }
                    }
            }
    }



    addMarker()
    {
        let mOwnedPawn = this.getOwnedPawn();
            if(mOwnedPawn !== null)
            {
                this.baseLayout.setupSubLayer('playerPositionLayer');

                let position        = this.baseLayout.satisfactoryMap.unproject(mOwnedPawn.transform.translation);
                let playerMarker    = L.mapMarker(
                        position,
                        {
                            pathName        : this.player.pathName,
                            color           : '#FFFFFF',
                            fillColor       : ((this.isHost() === true) ? '#b3b3b3' : '#666666'),
                            icon            : this.baseLayout.staticUrl + '/img/mapPlayerIcon.png'
                        }
                    );

                this.baseLayout.playerLayers.playerPositionLayer.elements.push(playerMarker);
                this.baseLayout.bindMouseEvents(playerMarker);
                playerMarker.addTo(this.baseLayout.playerLayers.playerPositionLayer.subLayer);

                //if(this.isHost() === true)
                //{
                //    this.baseLayout.satisfactoryMap.leafletMap.setView(position, 7);
                //}

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

    delete()
    {
        if(this.isHost() === false)
        {
            let mOwnedPawn  = this.baseLayout.getObjectProperty(this.player, 'mOwnedPawn');
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
            delete(this.baseLayout.players[this.player.pathName]);
        }
    }
}