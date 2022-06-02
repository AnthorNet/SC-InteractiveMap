/* global Sentry, Infinity */
import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class SubSystem_Fauna
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;

        this.data                   = options.data;
        this.dataClassNameHashTable = {};
        this.categories             = options.categories;

        this.creatureSpawners       = [];
    }

    getDataFromClassName(className)
    {
        if(this.data[className] !== undefined)
        {
            return this.data[className];
        }
        if(this.dataClassNameHashTable[className] !== undefined)
        {
            return this.data[this.dataClassNameHashTable[className]];
        }

        for(let i in this.data)
        {
            if(this.data[i].className !== undefined && this.data[i].className === className)
            {
                this.data[i].id                         = i;
                this.dataClassNameHashTable[className]  = i;
                return this.data[i];
            }
        }

        if(className.includes('/Game/FactoryGame/Character/Creature/Wildlife/') || className.includes('/Game/FactoryGame/Character/Creature/Enemy/'))
        {
            console.log('Missing fauna className: ' + className);

            if(typeof Sentry !== 'undefined')
            {
                Sentry.setContext('className', {className: className});
                Sentry.captureMessage('Missing fauna className: ' + className);
            }
        }

        return null;
    }

    getClosestCreatureSpawner(currentObject)
    {
        let closestCreatureSpawner  = {levelName: "Persistent_Exploration_2", pathName: 'Persistent_Exploration_2:PersistentLevel.BP_CreatureSpawner432'};
        let minDistance             = Infinity;

        for(let i = 0; i < this.creatureSpawners.length; i++)
        {
            let currentCreatureSpawner  = this.baseLayout.saveGameParser.getTargetObject(this.creatureSpawners[i]);
                if(currentCreatureSpawner !== null)
                {
                    let spawnerDistance = BaseLayout_Math.getDistance(currentObject.transform.translation, currentCreatureSpawner.transform.translation);
                        if(spawnerDistance <= minDistance)
                        {
                            closestCreatureSpawner  = {
                                levelName   : ((currentCreatureSpawner.levelName !== undefined) ? currentCreatureSpawner.levelName : 'Persistent_Level'),
                                pathName    : currentCreatureSpawner.pathName
                            };
                        }

                        minDistance     = Math.min(minDistance, spawnerDistance);
                }
        }

        return closestCreatureSpawner;
    }

    getCurrentHealth(currentObject)
    {
        let mHealthComponent = this.baseLayout.getObjectProperty(currentObject, 'mHealthComponent');
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

        return 100;
    }

    /*
     * ADD/DELETE
     */
    add(currentObject)
    {
        let layerId     = 'playerFaunaLayer';
        let iconColor   = '#b34848';
        let iconImage   = this.baseLayout.staticUrl + '/img/mapMonstersIcon.png';

        let faunaData   = this.getDataFromClassName(currentObject.className);
            if(faunaData !== null)
            {
                iconColor   = faunaData.mapColor;
                iconImage   = faunaData.image;
                layerId     = faunaData.mapLayer;

                if(currentObject.className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
                {
                    let mFriendActor = this.baseLayout.getObjectProperty(currentObject, 'mFriendActor');
                        if(mFriendActor !== null)
                        {
                            iconColor = '#b3ffb3';
                            this.baseLayout.playerLayers[layerId].count++;
                        }
                }
            }

        let faunaMarker = L.marker(
                this.baseLayout.satisfactoryMap.unproject(currentObject.transform.translation),
                {
                    pathName: currentObject.pathName,
                    icon: this.baseLayout.getMarkerIcon('#FFFFFF', iconColor, iconImage),
                    riseOnHover: true,
                    zIndexOffset: 900
                }
            );

        this.baseLayout.setupSubLayer(layerId);
        this.baseLayout.bindMouseEvents(faunaMarker);
        this.baseLayout.playerLayers[layerId].elements.push(faunaMarker);

        if(this.baseLayout.playerLayers[layerId].filtersCount !== undefined)
        {
            if(this.baseLayout.playerLayers[layerId].filtersCount[currentObject.className] === undefined)
            {
                this.baseLayout.playerLayers[layerId].filtersCount[currentObject.className] = 0;
            }
            this.baseLayout.playerLayers[layerId].filtersCount[currentObject.className]++;
        }

        return {layer: layerId, marker: faunaMarker};
    }

    delete(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let layerId         = 'playerFaunaLayer';

        let faunaData       = baseLayout.faunaSubsystem.getDataFromClassName(currentObject.className);
            if(faunaData !== null)
            {
                layerId = faunaData.mapLayer;
            }

        if(currentObject.className === '/Game/FactoryGame/Character/Creature/Wildlife/SpaceRabbit/Char_SpaceRabbit.Char_SpaceRabbit_C')
        {
            let mFriendActor = baseLayout.getObjectProperty(currentObject, 'mFriendActor');
                if(mFriendActor !== null)
                {
                    baseLayout.playerLayers[layerId].count--;
                }
        }

        let mOwningSpawner = baseLayout.getObjectProperty(currentObject, 'mOwningSpawner');
            if(mOwningSpawner !== null)
            {
                let creatureSpawner = baseLayout.saveGameParser.getTargetObject(mOwningSpawner.pathName);
                    if(creatureSpawner !== null)
                    {
                        let mSpawnData = baseLayout.getObjectProperty(creatureSpawner, 'mSpawnData');
                            if(mSpawnData !== null)
                            {
                                for(let i = (mSpawnData.values.length - 1); i >= 0; i--)
                                {
                                    for(let j = 0; j < mSpawnData.values[i].length; j++)
                                    {
                                        if(mSpawnData.values[i][j].name === 'creature')
                                        {
                                            if(mSpawnData.values[i][j].value.pathName === '' || mSpawnData.values[i][j].value.pathName === currentObject.pathName)
                                            {
                                                mSpawnData.values.splice(i, 1);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                    }
            }

        baseLayout.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
        baseLayout.deleteMarkerFromElements(layerId, marker.relatedTarget);
        baseLayout.setBadgeLayerCount(layerId);
    }
}