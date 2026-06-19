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
        //TODO: May be check for each events...
        this.baseLayout.deleteObjectProperty(this.subSystem, 'mStoredCalendarData'); // Old...
        this.baseLayout.deleteObjectProperty(this.subSystem, 'mCalendarData');
    }
}