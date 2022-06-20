export default class Building_MAM
{
    static getManager(baseLayout)
    {
        return baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.ResearchManager');
    }

    static initiate(baseLayout)
    {
        let researchManager = Building_MAM.getManager(baseLayout);
            if(researchManager !== null)
            {
                let mUnlockedResearchTrees  = baseLayout.getObjectProperty(researchManager, 'mUnlockedResearchTrees');
                let mIsActivated            = baseLayout.getObjectProperty(researchManager, 'mIsActivated');

                    if(mUnlockedResearchTrees === null)
                    {
                        baseLayout.setObjectProperty(researchManager, 'mUnlockedResearchTrees', {type: 'Object', values: []}, 'Array');
                    }
                    if(mIsActivated === null)
                    {
                        baseLayout.setObjectProperty(researchManager, 'mIsActivated', 1, 'Bool');
                    }
            }
    }

    static reset(baseLayout)
    {
        let researchManager = Building_MAM.getManager(baseLayout);
            if(researchManager !== null)
            {
                researchManager.properties = [];
            }
    }
}