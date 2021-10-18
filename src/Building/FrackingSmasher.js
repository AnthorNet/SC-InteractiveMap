export default class Building_FrackingSmasher
{
    static getSatellites(baseLayout, currentObject)
    {
        let currentObjectSatellites = [];
        let extractedCore           = baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
            if(extractedCore !== null)
            {
                for(let pathName in baseLayout.satisfactoryMap.collectableMarkers)
                {
                    if(pathName.startsWith('Persistent_Exploration_2:PersistentLevel.BP_FrackingSatellite') === true)
                    {
                        if(baseLayout.satisfactoryMap.collectableMarkers[pathName].options.core !== undefined && baseLayout.satisfactoryMap.collectableMarkers[pathName].options.core === extractedCore.pathName)
                        {
                            currentObjectSatellites.push(baseLayout.satisfactoryMap.collectableMarkers[pathName]);
                        }
                    }
                }
            }

        return currentObjectSatellites;
    }
}