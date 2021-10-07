export default class SubSystem_Vehicle
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.vehicleSubSystem   = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.VehicleSubsystem');
    }
}