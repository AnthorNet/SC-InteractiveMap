export default class SubSystem_Event
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.eventSubSystem     = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.EventSubsystem');
    }

    resetAllEvents()
    {
        this.eventSubSystem.properties = [];
    }

    resetFicsmas()
    {
        this.baseLayout.deleteObjectProperty(this.eventSubSystem, 'mCalendarData'); // OLD

        let mStoredCalendarData = this.baseLayout.getObjectProperty(this.eventSubSystem, 'mStoredCalendarData');
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
                    this.baseLayout.deleteObjectProperty(this.eventSubSystem, 'mStoredCalendarData');
                }
            }
    }
}