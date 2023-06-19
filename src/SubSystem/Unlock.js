import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Unlock extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.UnlockSubsystem';
            if(options.baseLayout.saveGameParser.header.saveVersion >= 41)
            {
                options.pathName        = 'Persistent_Level:PersistentLevel.unlockSubsystem';
            }
        super(options);
    }

    haveEfficiency()
    {
        let mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(this.subSystem, 'mIsBuildingOverclockUnlocked', 0);
            if(mIsBuildingOverclockUnlocked === 1)
            {
                return true;
            }

        return false;
    }

    haveOverclocking()
    {
        let mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(this.subSystem, 'mIsBuildingOverclockUnlocked', 0);
            if(mIsBuildingOverclockUnlocked === 1)
            {
                return true;
            }

        return false;
    }

    haveMap()
    {
        let mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(this.subSystem, 'mIsBuildingOverclockUnlocked', 0);
            if(mIsBuildingOverclockUnlocked === 1)
            {
                return true;
            }

        return false;
    }
}