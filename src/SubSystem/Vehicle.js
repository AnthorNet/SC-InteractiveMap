import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Vehicle extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.VehicleSubsystem';
        super(options);
    }
}