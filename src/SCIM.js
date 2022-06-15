import BaseLayout                               from './BaseLayout.js';
import GameMap                                  from './GameMap.js';
import SaveParser                               from './SaveParser.js';
import Translate                                from './Translate.js';

import BaseLayout_Modal                         from './BaseLayout/Modal.js';
import Lib_LeafletPlugins                       from './Lib/LeafletPlugins.js';

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
        this.gameDataUrl                = "https://satisfactory-calculator.com/" + this.language + "/api/game";
        this.modsDataUrl                = "https://satisfactory-calculator.com/" + this.language + "/mods/index/json";
        this.translationDataUrl         = "https://satisfactory-calculator.com/" + this.language + "/api/map/translation";
        this.tetrominoUrl               = "https://satisfactory-calculator.com/" + this.language + "/api/tetromino";
        this.usersUrl                   = "https://satisfactory-calculator.com/" + this.language + "/api/users";

        this.saveParserReadWorker       = '/js/InteractiveMap/build/Worker/SaveParser/Read.js';
        this.saveParserWriteWorker      = '/js/InteractiveMap/build/Worker/SaveParser/Write.js';

        this.collectedOpacity           = 0.3;

        // Updater notice
        this.scriptsVERSION             = Math.floor(Math.random() * Math.floor(999));
        this.urlScriptsVERSION          = null;
        this.intervalScriptsVERSION     = null;

        // Hold...
        this.map                        = null;
        this.baseLayout                 = null;
        this.translate                  = null;
    }

    start(remoteUrl)
    {
        if(this.urlScriptsVERSION !== null)
        {
            this.intervalScriptsVERSION = setInterval(() => { this.checkVersion() }, 300 * 1000);
        }

        // Handle pt_BR locales
        this.language = this.language.split('_')[0];

        this.translate = new Translate({
            build               : this.build,
            version             : this.scriptsVERSION,

            dataUrl             : this.translationDataUrl,

            language            : this.language,
            startCallback       : () => {
                this.map = new GameMap({
                    build               : this.build,
                    version             : this.scriptsVERSION,

                    collectedOpacity    : this.collectedOpacity,

                    staticUrl           : this.staticAssetsUrl,
                    dataUrl             : this.mapDataUrl,

                    language            : this.language,
                    remoteUrl           : remoteUrl
                });

                if(window.File && window.FileReader && window.FileList && window.Blob)
                {
                    $('#dropSaveGame').on('drag dragstart dragend dragover dragenter dragleave drop', function(e){e.preventDefault();e.stopPropagation();})
                                      .on('dragover dragenter', function(){$('#dropSaveGame').addClass('is-dragover');})
                                      .on('dragleave dragend drop', function(){$('#dropSaveGame').removeClass('is-dragover');})
                                      .on('drop', (e) => { this.processSaveGameFile(e.originalEvent.dataTransfer.files[0]); });
                    $('#saveGameFileInput').on('change', (e) => {
                        let currentFile = $(e.currentTarget).prop('files')[0];
                            $(e.currentTarget).val('');

                        this.processSaveGameFile(currentFile);
                    });
                }
                else
                {
                    $('#dropSaveGame').remove();
                }
            }
        });
    }

    processSaveGameFile(droppedFile)
    {
        if(droppedFile !== undefined)
        {
            if(droppedFile.name.toLowerCase().endsWith('.sav'))
            {
                this.showLoader();

                let reader = new FileReader();
                    reader.readAsArrayBuffer(droppedFile);
                    reader.onload = () => {
                        this.drawNewBaseLayout({
                            droppedFileResult       : reader.result,
                            droppedFileName         : droppedFile.name
                        });
                        delete reader.result;
                    };
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
        $('#resetPreviousCollected').hide();

        if(this.baseLayout !== null)
        {
            this.baseLayout.reset();
        }

        window.requestAnimationFrame(() => {
            options.build               = this.build;
            options.debug               = this.debug;
            options.version             = this.scriptsVERSION;

            options.staticUrl           = this.staticAssetsUrl;
            options.dataUrl             = this.gameDataUrl;
            options.modsUrl             = this.modsDataUrl;
            options.tetrominoUrl        = this.tetrominoUrl;
            options.usersUrl            = this.usersUrl;

            options.language            = this.language;
            options.translate           = this.translate;

            options.satisfactoryMap     = this.map;
            options.saveGameParser      = new SaveParser({
                arrayBuffer                 : options.droppedFileResult,
                fileName                    : options.droppedFileName,
                language                    : this.language,
                translate                   : this.translate,

                saveParserReadWorker        : this.saveParserReadWorker,
                saveParserWriteWorker       : this.saveParserWriteWorker
            });

            this.baseLayout = new BaseLayout(options);
            this.baseLayout.draw();
        });
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
        let alertMessage = "Good news, a new version of the interactive map was released! Please refresh your page / browser cache to make sure you'll get the latest fixes and features.";

        if(currentVersion !== undefined && currentVersion !== null)
        {
            if(currentVersion > this.scriptsVERSION)
            {
                BaseLayout_Modal.alert(alertMessage);
                return false;
            }
        }
        else
        {
            if(this.urlScriptsVERSION !== null)
            {
                $.get(this.urlScriptsVERSION, (data) => {
                    if(data > this.scriptsVERSION)
                    {
                        BaseLayout_Modal.alert(alertMessage);
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