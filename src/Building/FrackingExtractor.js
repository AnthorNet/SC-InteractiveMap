export default class Building_FrackingExtractor
{
    static getSmasher(baseLayout, currentObject)
    {
        let mExtractableResource = baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
            if(mExtractableResource !== null)
            {
                if(baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName] !== undefined && baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName].options.core !== undefined)
                {
                    if(baseLayout.frackingSmasherCores[baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName].options.core] !== undefined)
                    {
                        return baseLayout.saveGameParser.getTargetObject(baseLayout.frackingSmasherCores[baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName].options.core]);
                    }
                }
            }

        return null;
    }
}