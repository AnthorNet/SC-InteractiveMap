import SaveParser_Read      from './SaveParser/Read.js';
import SaveParser_Write     from './SaveParser/Write.js';

export default class SaveParser
{
    constructor(arrayBuffer, fileName)
    {
        this.fileName               = fileName;
        this.arrayBuffer            = arrayBuffer;

        this.header                 = null;
        this.PACKAGE_FILE_TAG       = null;
        this.maxChunkSize           = null;

        this.countObjects           = 0;
        this.objects                = null;
        this.objectsHashMap         = {};
        this.collectables           = null;

        this.objectsPurge           = [];
        this.cleanCircuitSubSystems = [];
        this.cleanPipesNetworks     = {};
        this.autoPurgeDeleteObjects = true;

        // Holds some default values to reduce memory usage...
        this.defaultValues          = {
            mPrimaryColor               : {
                name: "mPrimaryColor",
                type: "StructProperty",
                value: {
                    type: "LinearColor",
                    values: {
                        a: 1,
                        b: 0.15631400048732758,
                        g: 0.44070500135421753,
                        r: 1
                    }
                }
            },
            mSecondaryColor             : {
                name: "mSecondaryColor",
                type: "StructProperty",
                value: {
                    type: "LinearColor",
                    values: {
                        a: 1,
                        b: 0.26225098967552185,
                        g: 0.13286800682544708,
                        r: 0.11697100102901459
                    }
                }
            }
        };
    }

    load(callback = null)
    {
        this.header             = null;
        this.objects            = null;
        this.objectsHashMap     = {};

        new SaveParser_Read({
            saveParser  : this,
            callback    : callback
        });
    }

    save(callback = null)
    {
        let writer = new SaveParser_Write({
            saveParser  : this,
            callback    : callback
        });
            writer.streamSave();
    }

    getHeader()
    {
        return this.header;
    }

    getObjects()
    {
        return this.objects;
    }

    getCollectables()
    {
        return this.collectables;
    }


    /* SAVE MANIPULATION */
    addObject(currentObject)
    {
        this.countObjects                           = this.objects.push(currentObject);
        this.objectsHashMap[currentObject.pathName] = this.countObjects - 1;
    }


    getTargetObject(pathName, forceRefreshMap = false, skipRefreshMap = false)
    {
        if(forceRefreshMap === true)
        {
            this.refreshHashmap();
        }

        if(this.objectsHashMap[pathName] !== undefined && this.objects[this.objectsHashMap[pathName]] !== undefined)
        {
            if(this.objects[this.objectsHashMap[pathName]].pathName !== pathName && forceRefreshMap === false)
            {
                return this.getTargetObject(pathName, true);
            }

            return this.objects[this.objectsHashMap[pathName]];
        }

        if(forceRefreshMap === false && skipRefreshMap === false)
        {
            return this.getTargetObject(pathName, true);
        }

        return null;
    }

    getTargetObjectKey(pathName, forceRefreshMap = false)
    {
        if(forceRefreshMap === true)
        {
            this.refreshHashmap();
        }

        if(this.objectsHashMap[pathName] !== undefined && this.objects[this.objectsHashMap[pathName]] !== undefined)
        {
            if(this.objects[this.objectsHashMap[pathName]].pathName !== pathName && forceRefreshMap === false)
            {
                return this.getTargetObjectKey(pathName, true);
            }

            return this.objectsHashMap[pathName];
        }

        if(forceRefreshMap === false)
        {
            return this.getTargetObjectKey(pathName, true);
        }

        return null;
    }

    deleteObject(pathName)
    {
        let currentObject = this.getTargetObject(pathName);
        if(currentObject !== null)
        {
            this.objectsPurge.push(this.getTargetObjectKey(pathName));

            if(currentObject.children !== undefined && currentObject.children.length > 0)
            {
                for(let i = 0; i < currentObject.children.length; i++)
                {
                    let selectedObject = this.getTargetObjectKey(currentObject.children[i].pathName);
                        this.objectsPurge.push(selectedObject);
                }
            }

            if(this.autoPurgeDeleteObjects === true)
            {
                this.purgeDeleteObjects();
            }
        }
    }

    purgeDeleteObjects()
    {
        let foundationSubSystemSanitize = new Array();

        // Delete in reverse to avoid refreshing hash table
        this.objectsPurge.sort((a, b) => (a > b) ? -1 : 1);
        for(let i = 0; i < this.objectsPurge.length; i++)
        {
            if(this.objects[this.objectsPurge[i]] !== undefined)
            {
                foundationSubSystemSanitize.push(this.objects[this.objectsPurge[i]].pathName);
            }

            this.objects.splice(this.objectsPurge[i], 1);
        }

        // Delete from circuit/railroad subSystem
        if(foundationSubSystemSanitize.length > 0 || this.cleanCircuitSubSystems.length > 0)
        {
            foundationSubSystemSanitize = foundationSubSystemSanitize.concat(this.cleanCircuitSubSystems);

            let circuitSubSystem = this.getTargetObject('Persistent_Level:PersistentLevel.CircuitSubsystem');

            for(let i = 0; i < circuitSubSystem.extra.circuits.length; i++)
            {
                let currentCiruitSubSystem = this.getTargetObject(circuitSubSystem.extra.circuits[i].pathName);

                for(let j = 0; j < currentCiruitSubSystem.properties.length; j++)
                {
                    if(currentCiruitSubSystem.properties[j].name === 'mComponents')
                    {
                        for(let k = currentCiruitSubSystem.properties[j].value.values.length - 1; k >= 0; k--)
                        {
                            let currentValues = currentCiruitSubSystem.properties[j].value.values[k];

                            for(let m = foundationSubSystemSanitize.length - 1; m >= 0; m--)
                            {
                                if(currentValues.pathName === foundationSubSystemSanitize[m])
                                {
                                    foundationSubSystemSanitize.splice(m, 1);
                                    currentCiruitSubSystem.properties[j].value.values.splice(k, 1);
                                }
                            }
                        }
                    }
                }
            }

            if(foundationSubSystemSanitize.length > 0)
            {
                //let railroadSubsystem       = this.getTargetObject('Persistent_Level:PersistentLevel.RailroadSubsystem');
                    //console.log(railroadSubsystem, foundationSubSystemSanitize);
            }
        }

        this.refreshHashmap();
        this.autoPurgeDeleteObjects = true;
        this.objectsPurge           = [];
        this.cleanCircuitSubSystems = [];
    }

    refreshHashmap()
    {
        this.objectsHashMap = {};
        this.countObjects   = this.objects.length;

        for(let i = 0; i < this.countObjects; i++)
        {
            this.objectsHashMap[this.objects[i].pathName] = i;
        }
    }
}