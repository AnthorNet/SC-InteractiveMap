export default class SubSystem_Statistics
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.statisticsSubSystem    = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.StatisticsSubsystem');
    }

    convert(array)
    {
        let object = {};
            for(let i = 0; i < array.length; i++)
            {
                let value = array[i].value;
                    if(Array.isArray(value))
                    {
                        value = {};
                        for(let j = 0; j < array[i].value.length; j++)
                        {
                            value[array[i].value[j].name] = array[i].value[j].value;
                        }
                    }
                object[array[i].key.pathName] = value;
            }

        return object;
    }

    getConsumablesConsumedCount()
    {
        let mConsumablesConsumedCount = this.baseLayout.getObjectProperty(this.statisticsSubSystem, 'mConsumablesConsumedCount');
            if(mConsumablesConsumedCount !== null)
            {
                return this.convert(mConsumablesConsumedCount.values);
            }

        return null;
    }

    getCreaturesKilledCount()
    {
        let mCreaturesKilledCount = this.baseLayout.getObjectProperty(this.statisticsSubSystem, 'mCreaturesKilledCount');
            if(mCreaturesKilledCount !== null)
            {
                return this.convert(mCreaturesKilledCount.values);
            }

        return null;
    }

    getItemsManuallyCraftedCount()
    {
        let mItemsManuallyCraftedCount = this.baseLayout.getObjectProperty(this.statisticsSubSystem, 'mItemsManuallyCraftedCount');
            if(mItemsManuallyCraftedCount !== null)
            {
                return this.convert(mItemsManuallyCraftedCount.values);
            }

        return null;
    }

    getActorsBuiltCount()
    {
        let mActorsBuiltCount = this.baseLayout.getObjectProperty(this.statisticsSubSystem, 'mActorsBuiltCount');
            if(mActorsBuiltCount !== null)
            {
                return this.convert(mActorsBuiltCount.values);
            }

        return null;
    }
}