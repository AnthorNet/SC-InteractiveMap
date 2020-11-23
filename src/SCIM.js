import Map from './Map.js';
import SaveParser from './SaveParser.js';
import BaseLayout from './BaseLayout.js';

export default class SCIM
{
    constructor()
    {
        this.build                      = 'EarlyAccess';
        this.debug                      = false;
        this.language                   = 'en';

        this.outlineClass               = 'btn-outline-warning focus';

        this.staticAssetsUrl            = "https://static.satisfactory-calculator.com";
        this.mapDataUrl                 = "https://satisfactory-calculator.com/" + this.language + "/interactive-map/index/json";
        this.gameDataUrl                = "https://satisfactory-calculator.com/" + this.language + "/interactive-map/index/data";
        this.modsDataUrl                = "https://satisfactory-calculator.com/" + this.language + "/mods/index/json";

        this.collectedOpacity           = 0.3;

        this.scriptsVERSION             = Math.floor(Math.random() * Math.floor(999));
        this.urlScriptsVERSION          = null;
        this.intervalScriptsVERSION     = null;

        // Hold...
        this.map                        = null;
        this.baseLayout                 = null;
    }

    start(startCallback)
    {
        if(this.urlScriptsVERSION !== null)
        {
            this.intervalScriptsVERSION = setInterval(this.checkVersion.bind(this), 300 * 1000);
        }

        this.map = new Map({
            build               : this.build,
            version             : this.scriptsVERSION,

            collectedOpacity    : this.collectedOpacity,

            staticUrl           : this.staticAssetsUrl,
            dataUrl             : this.mapDataUrl,

            language            : this.language,
            startCallback       : startCallback
        });

        if(window.File && window.FileReader && window.FileList && window.Blob)
        {
            $('#dropSaveGame').on('drag dragstart dragend dragover dragenter dragleave drop', function(e){e.preventDefault();e.stopPropagation();})
                              .on('dragover dragenter', function(){$('#dropSaveGame').addClass('is-dragover');})
                              .on('dragleave dragend drop', function(){$('#dropSaveGame').removeClass('is-dragover');})
                              .on('drop', function(e){ this.processSaveGameFile(e.originalEvent.dataTransfer.files[0]); }.bind(this));
            $('#saveGameFileInput').on('change', function(e){
                let currentFile = $(e.currentTarget).prop('files')[0];
                $(this).val('');

                this.processSaveGameFile(currentFile);
            }.bind(this));
        }
        else
        {
            $('#dropSaveGame').remove();
        }
    }

    processSaveGameFile(droppedFile)
    {
        if(droppedFile !== undefined)
        {
            if(droppedFile.name.endsWith('.sav'))
            {
                this.showLoader();

                let reader = new FileReader();
                    reader.readAsArrayBuffer(droppedFile);
                    reader.onload = function(){
                        this.drawNewBaseLayout({
                            droppedFileResult       : reader.result,
                            droppedFileName         : droppedFile.name
                        });
                    }.bind(this);
            }
            else
            {
                alert('File should be name XXX.sav');
            }
        }
        else
        {
            alert('Something went wrong reading your save file!');
        }
    }

    drawNewBaseLayout(options)
    {
        if(this.baseLayout !== null)
        {
            this.baseLayout.reset();
        }

        setTimeout(function(){
            options.build           = this.build;
            options.debug           = this.debug;

            options.staticUrl       = this.staticAssetsUrl;
            options.dataUrl         = this.gameDataUrl;
            options.modsUrl         = this.modsDataUrl;

            options.language        = this.language;
            options.version         = this.scriptsVERSION;

            options.satisfactoryMap = this.map;
            options.saveGameParser  = new SaveParser(options.droppedFileResult, options.droppedFileName),

            this.baseLayout         = new BaseLayout(options);

            this.baseLayout.draw();
        }.bind(this), 250);
    }



    showLoader()
    {
        let tips = [
                'You can right click on any foundations and spawn a geometric form around it!',
                'You can right click on any buildings and delete them!',
                'You can right click on any storage container and edit their inventory!',
                'You can right click on a building to update its color!',
                'You can change the color gun slots in the map options...',
            ];

        $('.loader .tips').show();
        $('.loader .tips .speech-bubble em').html(tips[Math.floor(Math.random() * tips.length)]);
        $('.loader h6').html('Loading...');
        $('#dropSaveGame').hide();
        $('#downloadSaveGameModalButton').hide();
        $('#saveGameLoader').show();
        $('.loader').show();
    }

    hideLoader()
    {
        $('.loader').hide();
        $('#saveGameLoader').hide();
        $('#loaderProgressBar').hide();

        if(this.baseLayout !== null)
        {
            $('#downloadSaveGameModalButton').show();
            $('#dropSaveGame small').remove();
        }

        $('#dropSaveGame').show();
    }


    checkVersion(currentVersion)
    {
        if(currentVersion !== undefined && currentVersion !== null)
        {
            if(currentVersion > this.scriptsVERSION)
            {
                if($.fn.modal)
                {
                    $('#newMapRelease').modal({backdrop: 'static', keyboard: false});
                }
                else
                {
                    alert("Good news, a new version of the interactive map was released! Please refresh your page / browser cache to make sure you'll get the latest fixes and features.");
                }

                return false;
            }
        }
        else
        {
            if(this.urlScriptsVERSION !== null)
            {
                $.get(this.urlScriptsVERSION, function(data){
                    if(data > this.scriptsVERSION)
                    {
                        if($.fn.modal)
                        {
                            $('#newMapRelease').modal({backdrop: 'static', keyboard: false});
                        }
                        else
                        {
                            alert("Good news, a new version of the interactive map was released! Please refresh your page / browser cache to make sure you'll get the latest fixes and features.");
                        }

                        clearInterval(this.intervalScriptsVERSION);
                        return false;
                    }
                });
            }
        }

        return true;
    };
}
window.SCIM = new SCIM();