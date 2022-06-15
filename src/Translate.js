export default class Translate
{
    constructor(options)
    {
        this.build                      = options.build;
        this.version                    = options.version;
        this.startCallback              = (options.startCallback !== undefined) ? options.startCallback : null;

        this.dataUrl                    = options.dataUrl;

        this.language                   = options.language;
        this.translations               = {};

        this.loadInitialData();
    }

    loadInitialData()
    {
        $.getJSON(this.dataUrl, (data) => { this.translations = data; }).done(() => {
            if(this.startCallback !== null)
            {
                this.startCallback();
            }
        });
    }

    _(value, replace)
    {
        if(this.translations[value] !== undefined)
        {
            value = this.translations[value];
        }

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