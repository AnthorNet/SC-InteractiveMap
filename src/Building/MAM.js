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
                let mUnlockedResearchTrees  = baseLayout.getObjectPropertyValue(researchManager, 'mUnlockedResearchTrees');
                let mIsActivated            = baseLayout.getObjectPropertyValue(researchManager, 'mIsActivated');

                    if(mUnlockedResearchTrees === null)
                    {
                        baseLayout.setObjectProperty(researchManager, {
                            name: 'mUnlockedResearchTrees',
                            type: 'ArrayProperty',
                            value:  {type: 'ObjectProperty', values: []}
                        });
                    }
                    if(mIsActivated === null)
                    {
                        baseLayout.setObjectProperty(researchManager, {
                            name: 'mIsActivated',
                            type: 'BoolProperty',
                            value:  1
                        });
                    }
            }
    }

    static reset(baseLayout)
    {
        let researchManager = Building_MAM.getManager(baseLayout);
            if(researchManager !== null)
            {
                baseLayout.deleteAllObjectProperties(researchManager);
            }
    }
}