export default class SubSystem_Time
{
    constructor(options)
    {
        this.baseLayout     = options.baseLayout;
        this.timeSubSystem  = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.TimeSubsystem');
    }

    getDaySeconds()
    {
        return this.baseLayout.getObjectProperty(this.timeSubSystem, 'mDaySeconds', 43200);
    }

    getNumberOfPassedDays()
    {
        return this.baseLayout.getObjectProperty(this.timeSubSystem, 'mNumberOfPassedDays', 0);
    }

    isNight()
    {
        if(this.nightStatus === undefined)
        {
            this.nightStatus = true;

            let mDaySeconds = this.getDaySeconds() / 3600;
                if(mDaySeconds > 6 && mDaySeconds <= 18)
                {
                    this.nightStatus = false;
                }
        }

        return this.nightStatus;
    }
}