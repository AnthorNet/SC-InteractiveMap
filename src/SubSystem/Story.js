export default class SubSystem_Story
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.storySubSystem     = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.StorySubsystem');
    }
}