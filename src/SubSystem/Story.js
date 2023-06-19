import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Story extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.StorySubsystem';
        super(options);
    }
}