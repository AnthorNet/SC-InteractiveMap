import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Statistics extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.StatisticsSubsystem';
        super(options);

        this.updateStatisticsLeaderBoard();
    }

    convert(object, playerPathName = null, propertyName = null)
    {
        let convertedObjects = {};
            for(let i = 0; i < object.values.length; i++)
            {
                if(object.values[i].keyMap.pathName !== '')
                {
                    switch(object.valueType)
                    {
                        case 'Struct':
                            for(let j = 0; j < object.values[i].valueMap.length; j++)
                            {
                                if(playerPathName !== null && propertyName !== null)
                                {
                                    if(object.values[i].valueMap[j].name === propertyName)
                                    {
                                        for(let k = 0; k < object.values[i].valueMap[j].value.values.length; k++)
                                        {
                                            if(object.values[i].valueMap[j].value.values[k].keyMap.pathName === playerPathName)
                                            {
                                                convertedObjects[object.values[i].keyMap.pathName] = object.values[i].valueMap[j].value.values[k].valueMap;
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    if(convertedObjects[object.values[i].keyMap.pathName] === undefined)
                                    {
                                        convertedObjects[object.values[i].keyMap.pathName] = {};
                                    }

                                    convertedObjects[object.values[i].keyMap.pathName][object.values[i].valueMap[j].name] = object.values[i].valueMap[j].value;
                                }
                            }

                            break;

                        case 'Int':
                        default:
                            convertedObjects[object.values[i].keyMap.pathName] = object.values[i].valueMap;
                            break;

                    }
                }
            }

        return convertedObjects;
    }

    getConsumablesConsumedCount()
    {
        let mConsumablesConsumedCount = this.baseLayout.getObjectProperty(this.subSystem, 'mConsumablesConsumedCount');
            if(mConsumablesConsumedCount !== null)
            {
                return this.convert(mConsumablesConsumedCount);
            }

        return null;
    }

    getCreaturesKilledCount()
    {
        let mCreaturesKilledCount = this.baseLayout.getObjectProperty(this.subSystem, 'mCreaturesKilledCount');
            if(mCreaturesKilledCount !== null)
            {
                return this.convert(mCreaturesKilledCount);
            }

        return null;
    }

    getItemsManuallyCraftedCount(playerPathName = null, propertyName = null)
    {
        let mItemsManuallyCraftedCount = this.baseLayout.getObjectProperty(this.subSystem, 'mItemsManuallyCraftedCount');
            if(mItemsManuallyCraftedCount !== null)
            {
                return this.convert(mItemsManuallyCraftedCount, playerPathName, propertyName);
            }

        return null;
    }

    getActorsBuiltCount(playerPathName = null, propertyName = null)
    {
        let mActorsBuiltCount = this.baseLayout.getObjectProperty(this.subSystem, 'mActorsBuiltCount');
            if(mActorsBuiltCount !== null)
            {
                return this.convert(mActorsBuiltCount, playerPathName, propertyName);
            }

        return null;
    }

    getItemsPickedUp(playerPathName = null, propertyName = null)
    {
        let mItemsPickedUp = this.baseLayout.getObjectProperty(this.subSystem, 'mItemsPickedUp');
            if(mItemsPickedUp !== null)
            {
                return this.convert(mItemsPickedUp, playerPathName, propertyName);
            }

        return null;
    }

    /**
     * LEADERBOARD
     */
    updateStatisticsLeaderBoard()
    {
        for(let player in this.baseLayout.players)
        {
            let playerName = this.baseLayout.players[player].getDisplayName(true);
                if(playerName !== null)
                {
                    let postData = {
                            playerName  : playerName,
                            data        : Object.assign(
                                {},
                                this.getCreaturesKilledCount(),
                                this.getConsumablesConsumedCount(),
                                this.getItemsManuallyCraftedCount(player, 'BuiltPerPlayer'),
                                this.getActorsBuiltCount(player, 'BuiltPerPlayer')
                            )
                        };

                    try
                    {
                        $.post(this.baseLayout.statisticsUrl, postData);
                    }
                    catch(error){}
                }
        }
    }
}