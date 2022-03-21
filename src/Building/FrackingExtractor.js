export default class Building_FrackingExtractor
{
    static getSmasher(baseLayout, currentObject)
    {
        let mExtractableResource = baseLayout.getObjectPropertyValue(currentObject, 'mExtractableResource');
            if(mExtractableResource !== null)
            {
                if(baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName] !== undefined && baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName].options.core !== undefined)
                {
                    const frackingSmasherCore = baseLayout.frackingSmasherCores.get(baseLayout.satisfactoryMap.collectableMarkers[mExtractableResource.pathName].options.core);
                    if(frackingSmasherCore !== undefined)
                    {
                        return baseLayout.saveGameParser.getTargetObject(frackingSmasherCore);
                    }
                }
            }

        return null;
    }
}