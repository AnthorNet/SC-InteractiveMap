export default class SubSystem
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.subSystem          = this.baseLayout.saveGameParser.getTargetObject(options.pathName);

        if(this.subSystem === null)
        {
            console.warn('Missing SubSystem', options.pathName);
        }
    }

    get()
    {
        return this.subSystem;
    }
}