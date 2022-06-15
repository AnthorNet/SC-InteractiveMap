/* global gtag */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import SubSystem_Fauna                          from '../SubSystem/Fauna.js';

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
                children            : [{pathName: pathName + '.HealthComponent'}],
                className           : this.faunaClassName,
                pathName            : pathName,
                entity              : {levelName: '', pathName: ''},
                properties          : [
                    {name: 'mHealthComponent', type: 'ObjectProperty', value: {pathName: pathName + '.HealthComponent'}},
                    {name: 'mIsPersistent', type: 'BoolProperty', value: 1} // Just in case CSS allow to push Zoos ;)
                ],
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
                newFauna.children.unshift({pathName: pathName + '.mInventory'});

                let currentPlayerObject = this.baseLayout.saveGameParser.getTargetObject(this.baseLayout.saveGameParser.playerHostPathName);
                let mOwnedPawn          = this.baseLayout.getObjectProperty(currentPlayerObject, 'mOwnedPawn');

                newFauna.properties.push({name: 'mFriendActor', type: 'ObjectProperty', value: {pathName: mOwnedPawn.pathName}});
                newFauna.properties.push({name: 'mLootTableIndex', type: 'IntProperty', value: 0});
                newFauna.properties.push({name: 'mLootTimerHandle', type: 'StructProperty', value: {handle: 'None', type: 'TimerHandle'}});

                let newSpaceRabbitInventory     = {
                    type            : 0,
                    children        : [],
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

            let closestCreatureSpawner = this.baseLayout.faunaSubsystem.getClosestCreatureSpawner(this.centerObject);
                newFauna.properties.push({
                    name    : "mOwningSpawner",
                    type    : "ObjectProperty",
                    value   : closestCreatureSpawner
                });
                this.baseLayout.saveGameParser.addObject(newFauna);

            let creatureSpawner = this.baseLayout.saveGameParser.getTargetObject(closestCreatureSpawner.pathName);
                if(creatureSpawner !== null)
                {
                    let mSpawnData = this.baseLayout.getObjectProperty(creatureSpawner, 'mSpawnData');
                        if(mSpawnData !== null)
                        {
                            mSpawnData.values.push([
                                {
                                    name    : "SpawnLocation",
                                    type    : "StructProperty",
                                    value   : {
                                        type    : "Vector",
                                        values  : {
                                            x       : newFauna.transform.translation[0],
                                            y       : newFauna.transform.translation[1],
                                            z       : newFauna.transform.translation[2]
                                        }
                                    }
                                },
                                {name: "creature", type: "ObjectProperty", value: {pathName: newFauna.pathName}},
                                {name: "WasKilled", type: "BoolProperty", value: 0},
                                {name: "KilledOnDayNr", type: "IntProperty", value: -1}
                            ]);
                        }
                }

            this.history.push({
                pathName: newFauna.pathName,
                layerId: this.layerId,
                callback: 'deleteFauna'
            });

            let result = this.baseLayout.faunaSubsystem.add(newFauna);
                return new Promise((resolve) => {
                    $('#liveLoader .progress-bar').css('width', Math.round(currentQty / this.maxRadius * 100) + '%');
                    window.requestAnimationFrame(resolve);
                }).then(() => {
                    this.baseLayout.addElementToLayer(result.layer, result.marker);
                    this.loop((currentQty + 1));
                });
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
