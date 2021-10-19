import SaveParser_Read      from './SaveParser/Read.js';
import SaveParser_Write     from './SaveParser/Write.js';

export default class SaveParser
{
    constructor(options)
    {
        this.fileName               = options.fileName;
        this.arrayBuffer            = options.arrayBuffer;

        this.language               = options.language;
        this.translate              = options.translate;

        this.header                 = null;
        this.PACKAGE_FILE_TAG       = null;
        this.maxChunkSize           = null;

        this.objects                = null;
        this.collectables           = null;

        this.gameStatePathName      = null;
        this.playerHostPathName     = null;

        this.trainIdentifiers       = [];

        // Holds some default values to reduce memory usage...
        this.defaultValues          = {
            rotation                    : [0, 0, 0, 1],
            translation                 : [0, 0, 0],

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

        new SaveParser_Read({
            saveParser  : this,
            callback    : callback,
            language    : this.language,
            translate   : this.translate
        });
    }

    save(callback = null)
    {
        let writer = new SaveParser_Write({
            saveParser  : this,
            callback    : callback,
            language    : this.language,
            translate   : this.translate
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
        this.objects[currentObject.pathName] = currentObject;
    }

    getTargetObject(pathName)
    {
        // Bypass game state for easy retrievale
        if(pathName === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C' && this.gameStatePathName !== null)
        {
            pathName = this.gameStatePathName;
        }

        if(this.objects[pathName] !== undefined)
        {
            return this.objects[pathName];
        }

        return null;
    }

    deleteObject(pathName)
    {
        let currentObject = this.getTargetObject(pathName);
            if(currentObject !== null)
            {
                if(currentObject.children !== undefined && currentObject.children.length > 0)
                {
                    for(let i = 0; i < currentObject.children.length; i++)
                    {
                        if(this.objects[currentObject.children[i].pathName] !== undefined)
                        {
                            delete this.objects[currentObject.children[i].pathName];
                        }
                    }
                }

                if(this.objects[pathName] !== undefined)
                {
                    delete this.objects[pathName];
                }
            }
    }
}