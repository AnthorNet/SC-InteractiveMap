import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Statistics extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.StatisticsSubsystem';
        super(options);
    }

    convert(array)
    {
        let object = {};
            for(let i = 0; i < array.length; i++)
            {
                let value = array[i].valueMap;
                    if(Array.isArray(value))
                    {
                        value = {};
                        for(let j = 0; j < array[i].valueMap.length; j++)
                        {
                            value[array[i].valueMap[j].name] = array[i].valueMap[j].value;
                        }
                    }
                object[array[i].keyMap.pathName] = value;
            }

        return object;
    }

    getConsumablesConsumedCount()
    {
        let mConsumablesConsumedCount = this.baseLayout.getObjectProperty(this.subSystem, 'mConsumablesConsumedCount');
            if(mConsumablesConsumedCount !== null)
            {
                return this.convert(mConsumablesConsumedCount.values);
            }

        return null;
    }

    getCreaturesKilledCount()
    {
        let mCreaturesKilledCount = this.baseLayout.getObjectProperty(this.subSystem, 'mCreaturesKilledCount');
            if(mCreaturesKilledCount !== null)
            {
                return this.convert(mCreaturesKilledCount.values);
            }

        return null;
    }

    getItemsManuallyCraftedCount()
    {
        let mItemsManuallyCraftedCount = this.baseLayout.getObjectProperty(this.subSystem, 'mItemsManuallyCraftedCount');
            if(mItemsManuallyCraftedCount !== null)
            {
                return this.convert(mItemsManuallyCraftedCount.values);
            }

        return null;
    }

    getActorsBuiltCount()
    {
        let mActorsBuiltCount = this.baseLayout.getObjectProperty(this.subSystem, 'mActorsBuiltCount');
            if(mActorsBuiltCount !== null)
            {
                return this.convert(mActorsBuiltCount.values);
            }

        return null;
    }
}