export default class SubSystem_Unlock
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.unlockSubSystem    = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.UnlockSubsystem');
    }

    haveEfficiency()
    {
        let mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(this.unlockSubSystem, 'mIsBuildingOverclockUnlocked', 0);
            if(mIsBuildingOverclockUnlocked === 1)
            {
                return true;
            }

        return false;
    }

    haveOverclocking()
    {
        let mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(this.unlockSubSystem, 'mIsBuildingOverclockUnlocked', 0);
            if(mIsBuildingOverclockUnlocked === 1)
            {
                return true;
            }

        return false;
    }

    haveMap()
    {
        let mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(this.unlockSubSystem, 'mIsBuildingOverclockUnlocked', 0);
            if(mIsBuildingOverclockUnlocked === 1)
            {
                return true;
            }

        return false;
    }
}