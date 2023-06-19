import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Event extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.EventSubsystem';
        super(options);
    }

    resetAllEvents()
    {
        this.subSystem.properties = [];
    }

    resetFicsmas()
    {
        this.baseLayout.deleteObjectProperty(this.subSystem, 'mCalendarData'); // OLD

        let mStoredCalendarData = this.baseLayout.getObjectProperty(this.subSystem, 'mStoredCalendarData');
            if(mStoredCalendarData !== null)
            {
                for(let i = (mStoredCalendarData.values.length - 1); i >= 0; i--)
                {
                    if(mStoredCalendarData.values[i].key.name === 'EEvents::EV_Christmas')
                    {
                        mStoredCalendarData.values.splice(i, 1);
                    }
                }

                if(mStoredCalendarData.values.length === 0)
                {
                    this.baseLayout.deleteObjectProperty(this.subSystem, 'mStoredCalendarData');
                }
            }
    }
}