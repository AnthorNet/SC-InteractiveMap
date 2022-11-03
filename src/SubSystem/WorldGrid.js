export default class SubSystem_WorldGrid
{
    constructor(options)
    {
        this.xModulo            = 800;
        this.yModulo            = 100;
        this.zModulo            = 800;
    }

    isOnGrid(currentObject)
    {
        if((currentObject.transform.translation[0] % this.xModulo) === 0)
        {
            if((currentObject.transform.translation[1] % this.yModulo) === 0)
            {
                if((currentObject.transform.translation[2] % this.zModulo) === 0)
                {
                    return true;
                }
            }
        }

        return false;
    }

    nearestGridTranslation(currentObject)
    {
        return [
            Math.round(currentObject.transform.translation[0] / this.xModulo) * this.xModulo,
            Math.round(currentObject.transform.translation[1] / this.yModulo) * this.yModulo,
            Math.round(currentObject.transform.translation[2] / this.zModulo) * this.zModulo
        ]
    }

    snapToGrid(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(currentObject !== null && baseLayout.worldGridSubSystem.isOnGrid(currentObject) === false)
            {
                currentObject.transform.translation = baseLayout.worldGridSubSystem.nearestGridTranslation(currentObject);
                baseLayout.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
            }
    }
}