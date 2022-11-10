//
export default class SubSystem_Blueprint
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.blueprintSubSystem = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.BlueprintSubsystem');

        //console.log(this.blueprintSubSystem);
    }
}