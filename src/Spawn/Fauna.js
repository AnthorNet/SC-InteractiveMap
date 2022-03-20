/* global gtag */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Spawn_Fauna
{
    constructor(options)
    {
        this.marker             = options.marker;
        this.baseLayout         = options.marker.baseLayout;
        this.layerId            = 'playerFaunaLayer';

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);

        this.maxQty             = Math.max(1, Math.min(256, parseInt(options.qty)));
        this.maxRadius          = Math.max(400, Math.min(3200, parseInt(options.maxRadius)));

        this.faunaData          = options.faunaData
        this.faunaClassName     = this.faunaData.className;
        this.faunaPathName      = this.faunaData.pathName;

        if(this.faunaData.mapLayer !== undefined)
        {
            this.layerId = this.faunaData.mapLayer;
        }

            if(typeof gtag === 'function')
            {
                gtag('event', 'Fauna', {event_category: 'Spawn'});
            }

        return this.spawn();
    }

    spawn()
    {
        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history            = [];

        return this.loop(0);
    }

    loop(currentQty)
    {
        for(currentQty; currentQty < this.maxQty; currentQty++)
        {
            let pathName        = this.baseLayout.generateFastPathName({pathName: this.faunaPathName});
            let newFauna        = {
                type                : 1,
                children            : new Set([{pathName: pathName + '.HealthComponent'}]),
                className           : this.faunaClassName,
                pathName            : pathName,
                entity              : {levelName: '', pathName: ''},
                properties          : [{name: 'mHealthComponent', type: 'ObjectProperty', value: {pathName: pathName + '.HealthComponent'}}],
                transform           : {
                    rotation            : [0, -0, this.centerObject.transform.rotation[2], this.centerObject.transform.rotation[3]],
                    translation         : [
                        this.centerObject.transform.translation[0] + (Math.floor(Math.random() * ((this.maxRadius * 2) + 1)) - 400),
                        this.centerObject.transform.translation[1] + (Math.floor(Math.random() * ((this.maxRadius * 2) + 1)) - 400),
                        this.centerObject.transform.translation[2] + 450 //TODO: Use building height
                    ]
                }
            };

            if(this.faunaClassName === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
            {
                newFauna.children.add({pathName: pathName + '.mInventory'});

                let currentPlayerObject = this.baseLayout.saveGameParser.getTargetObject(this.baseLayout.saveGameParser.playerHostPathName);
                let mOwnedPawn          = this.baseLayout.getObjectProperty(currentPlayerObject, 'mOwnedPawn');

                this.baseLayout.setObjectProperty(newFauna, {name: 'mFriendActor', type: 'ObjectProperty', value: {pathName: mOwnedPawn.pathName}});
                this.baseLayout.setObjectProperty(newFauna, {name: 'mLootTableIndex', type: 'IntProperty', value: 0});
                this.baseLayout.setObjectProperty(newFauna, {name: 'mLootTimerHandle', type: 'StructProperty', value: {handle: 'None', type: 'TimerHandle'}});
                this.baseLayout.setObjectProperty(newFauna, {name: 'mIsPersistent', type: 'BoolProperty', value: 1});

                let newSpaceRabbitInventory     = {
                    type            : 0,
                    children        : new Set(),
                    className       : '/Script/FactoryGame.FGInventoryComponent',
                    outerPathName   : pathName, pathName: pathName + '.mInventory',
                    properties      : [
                        {
                            name: "mInventoryStacks",
                            structureName: "mInventoryStacks",
                            structureSubType: "InventoryStack",
                            structureType: "StructProperty",
                            type: "ArrayProperty",
                            value: {
                                type: "StructProperty",
                                values: [[{
                                    name: "Item",
                                    type: "StructProperty",
                                    value: {
                                        itemName: "", levelName: "", pathName: "",
                                        type: "InventoryItem",
                                        unk1: 0,
                                        properties: [{name: "NumItems", type: "IntProperty", value: 0}]
                                    }
                                }]]
                            }
                        },
                        { name: '"mArbitrarySlotSizes', type: 'ArrayProperty', value: {type: 'IntProperty', values: [0]} },
                        { name: 'mAllowedItemDescriptors', type: 'ArrayProperty', value: {type: 'ObjectProperty', values: [{levelName: '', pathName: ''}]} }
                    ]
                };

                this.baseLayout.saveGameParser.addObject(newSpaceRabbitInventory);
            }

            this.baseLayout.saveGameParser.addObject({
                className: '/Script/FactoryGame.FGHealthComponent',
                outerPathName: pathName, pathName: pathName + '.HealthComponent',
                properties: [], type: 0
            });

            //TODO: Ensure the creature spawner still exists in the save!
            let newCreatureSpawnerId = "Persistent_Exploration_2:PersistentLevel.BP_CreatureSpawner432";
                this.baseLayout.setObjectProperty(newFauna, {name: "mOwningSpawner", type: "ObjectProperty", value: {levelName: "Persistent_Exploration_2", pathName: newCreatureSpawnerId}});

            this.baseLayout.saveGameParser.addObject(newFauna);

            this.history.push({
                pathName: newFauna.pathName,
                layerId: this.layerId,
                callback: 'deleteFauna'
            });

            let result = this.baseLayout.addPlayerFauna(newFauna);
                return new Promise(function(resolve){
                    $('#liveLoader .progress-bar').css('width', Math.round(currentQty / this.maxRadius * 100) + '%');
                    setTimeout(resolve, 5);
                }.bind(this)).then(function(){
                    this.baseLayout.addElementToLayer(result.layer, result.marker);
                    this.loop((currentQty + 1));
                }.bind(this));
        }

        return this.release();
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name    : 'Undo: Spawn around (Fauna)',
                values  : this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount(this.layerId);
    }
}
