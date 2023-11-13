import SubSystem                                from '../SubSystem.js';

export default class SubSystem_GameRules extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.GameRulesSubsystem';
        super(options);
    }
}