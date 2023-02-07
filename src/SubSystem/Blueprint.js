//
export default class SubSystem_Blueprint
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.blueprintSubSystem = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.BlueprintSubsystem');

        this.blueprintsProxies  = {};
    }

    addToProxy(currentObject)
    {
        let mBlueprintProxy = this.baseLayout.getObjectProperty(currentObject, 'mBlueprintProxy');
            if(mBlueprintProxy !== null)
            {
                if(this.blueprintsProxies[mBlueprintProxy.pathName] === undefined)
                {
                    this.blueprintsProxies[mBlueprintProxy.pathName] = [];
                }

                this.blueprintsProxies[mBlueprintProxy.pathName].push(currentObject.pathName);
            }
    }

    deleteFromProxy(currentObject)
    {
        let mBlueprintProxy = this.baseLayout.getObjectProperty(currentObject, 'mBlueprintProxy');
            if(mBlueprintProxy !== null)
            {
                if(this.blueprintsProxies[mBlueprintProxy.pathName] !== undefined)
                {
                    if(this.blueprintsProxies[mBlueprintProxy.pathName].includes(currentObject.pathName))
                    {
                        for(let i = (this.blueprintsProxies[mBlueprintProxy.pathName].length - 1); i >= 0; i--)
                        {
                            if(this.blueprintsProxies[mBlueprintProxy.pathName][i] === currentObject.pathName)
                            {
                                this.blueprintsProxies[mBlueprintProxy.pathName].splice(i, 1);
                                break;
                            }
                        }

                        //TODO: Check bounding box?
                    }

                    if(this.blueprintsProxies[mBlueprintProxy.pathName].length === 0)
                    {
                        delete this.blueprintsProxies[mBlueprintProxy.pathName];
                        this.baseLayout.saveGameParser.deleteObject(mBlueprintProxy.pathName);
                    }
                }
            }
    }
}