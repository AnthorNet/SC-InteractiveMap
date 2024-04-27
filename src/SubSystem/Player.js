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
    }

    getDisplayName(raw = false)
    {
        let displayName = null;
        let mOwnedPawn  = this.getOwnedPawn();
            if(mOwnedPawn !== null)
            {
                let mCachedPlayerName = this.baseLayout.getObjectProperty(mOwnedPawn, 'mCachedPlayerName');
                    if(mCachedPlayerName !== null && mCachedPlayerName !== 'Player')
                    {
                        displayName = mCachedPlayerName;
                    }
            }

        if(raw === true)
        {
            return displayName;
        }

        if(displayName !== null)
        {
            return displayName;
        }

        return 'Player #' + this.player.pathName.replace('Persistent_Level:PersistentLevel.BP_PlayerState_C_', '');
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
                            fillColor       : '#666666',
                            icon            : this.baseLayout.staticUrl + '/img/mapPlayerIcon.png'
                        }
                    );

                this.baseLayout.playerLayers.playerPositionLayer.elements.push(playerMarker);
                this.baseLayout.bindMouseEvents(playerMarker);
                playerMarker.addTo(this.baseLayout.playerLayers.playerPositionLayer.subLayer);

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
        if(Object.keys(this.baseLayout.players).length > 1) // We need to keep at least one player in the map...
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