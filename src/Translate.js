export default class Translate
{
    constructor(options)
    {
        this.build                      = options.build;
        this.version                    = options.version;
        this.startCallback              = (options.startCallback !== undefined) ? options.startCallback : null;

        this.dataUrl                    = options.dataUrl;

        this.language                   = options.language;
        this.translations               = null;

        this.loadInitialData();
    }

    loadInitialData()
    {
        $.getJSON(this.dataUrl, function(data){
            if(data !== undefined)
            {
                this.translations = new Map(Object.entries(data));
            }
        }.bind(this)).done(() => {
            if(this.startCallback !== null)
            {
                this.startCallback();
            }
        });
    }

    _(value, replace)
    {
        value = this.translations?.get(value) ?? value;

        if(replace !== undefined)
        {
            if(Array.isArray(replace) === false)
            {
                replace = [replace];
            }
            for(let i = 0; i < replace.length; i++)
            {
                value = value.replace('%' + (i + 1) + '$s', replace[i]);
            }
        }

        return value;
    }
}