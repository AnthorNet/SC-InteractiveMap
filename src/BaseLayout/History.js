/* global L, gtag */
import Selection_Delete                         from '../Selection/Delete.js';
import Selection_MoveTo                         from '../Selection/MoveTo.js';
import Selection_Offset                         from '../Selection/Offset.js';
import Selection_Rotate                         from '../Selection/Rotate.js';

export default class BaseLayout_History
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;

        this.control            = new L.Control.HistoryControl({history: this});
                                  this.baseLayout.satisfactoryMap.leafletMap.addControl(this.control);
        $('.leaflet-control-history').parent().hide();

        this.history            = [];
        this.limit              = 20;
    }

    undo()
    {
        if(this.history.length > 0)
        {
            console.time('undoHistory');

            let currentOperations = this.history.pop();

                if(typeof gtag === 'function')
                {
                    if(currentOperations.name !== undefined)
                    {
                        gtag('event', 'Undo: ' + currentOperations.name, {event_category: 'History'});
                    }
                    else
                    {
                        gtag('event', 'Undo', {event_category: 'History'});
                    }
                }

            return new Promise(function(resolve){
                $('#liveLoader').show()
                                .find('.progress-bar').css('width', '0%');
                window.requestAnimationFrame(resolve);
            }).then(() => {
                this.undoLoop(currentOperations);
            });
        }

        return this.doneUndo();
    }

    undoLoop(currentOperations, i = 0)
    {
        for(i; i < currentOperations.values.length; i++)
        {
            let currentOperation = currentOperations.values[i];
                if(currentOperation.properties === undefined)
                {
                    currentOperation.properties = {};
                }

                if(currentOperation.pathName !== undefined)
                {
                    currentOperation.properties.marker  = this.baseLayout.getMarkerFromPathName(currentOperation.pathName, ((currentOperation.layerId !== undefined) ? currentOperation.layerId : null));

                    if(currentOperation.properties.marker !== null)
                    {
                        currentOperation.properties.object  = this.baseLayout.saveGameParser.getTargetObject(currentOperation.pathName);

                        if(currentOperation.properties.object !== null)
                        {
                            switch(currentOperation.callback)
                            {
                                case 'deleteGenericBuilding':
                                    if(currentOperation.properties.fastDelete !== undefined && currentOperation.properties.fastDelete === true)
                                    {
                                        this.baseLayout.deleteGenericBuilding({baseLayout: this.baseLayout, relatedTarget: currentOperation.properties.marker}, false, true);
                                    }
                                    else
                                    {
                                        this.baseLayout.deleteGenericBuilding({baseLayout: this.baseLayout, relatedTarget: currentOperation.properties.marker}, false);
                                    }
                                    break;
                                case 'deleteFauna':
                                    this.baseLayout.faunaSubsystem.delete({baseLayout: this.baseLayout, relatedTarget: currentOperation.properties.marker});
                                    break;
                                case 'restoreState':

                                    break;
                                default:
                                    this.baseLayout[currentOperation.callback].call(this.baseLayout, currentOperation.properties);
                                    break;
                            }
                        }
                    }
                }

                if(currentOperation.pathNameArray !== undefined)
                {
                    let markers = [];
                        for(let j = 0; j < currentOperation.pathNameArray.length; j++)
                        {
                            let pathName    = currentOperation.pathNameArray[j];
                            let layerId     = null;

                            if(Array.isArray(pathName))
                            {
                                layerId     = pathName[1];
                                pathName    = pathName[0];
                            }

                            let currentMarker = this.baseLayout.getMarkerFromPathName(pathName, layerId);
                                if(currentMarker !== null)
                                {
                                    markers.push(currentMarker);
                                }
                        }

                        if(markers.length > 0)
                        {
                            currentOperation.properties.baseLayout  = this.baseLayout;
                            currentOperation.properties.markers     = markers;
                            currentOperation.properties.history     = false;

                            switch(currentOperation.callback)
                            {
                                case 'Selection_Delete':
                                    new Selection_Delete(currentOperation.properties);
                                    break;
                                case 'Selection_Offset':
                                    new Selection_Offset(currentOperation.properties);
                                    break;
                                case 'Selection_MoveTo':
                                    new Selection_MoveTo(currentOperation.properties);
                                    break;
                                case 'Selection_Rotate':
                                    new Selection_Rotate(currentOperation.properties);
                                    break;
                            }
                        }
                }

            if(i % 250 === 0 || (i + 1) === currentOperations.values.length)
            {
                return new Promise(function(resolve){
                    $('#liveLoader .progress-bar').css('width', Math.round(i / currentOperations.values.length * 100) + '%');
                    window.requestAnimationFrame(resolve);
                }).then(() => {
                    this.undoLoop(currentOperations, (i + 1));
                });
            }
        }

        return this.doneUndo();
    }

    doneUndo()
    {
        console.timeEnd('undoHistory');

        this.baseLayout.updateRadioactivityLayer();
        this.baseLayout.updateDelayedBadgeCount();

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        $('.leaflet-control-history').attr('data-original-title', 'Undo').tooltip('hide');

        // hide control
        if(this.history.length === 0)
        {
            $('.leaflet-control-history').parent().hide();
        }
        else
        {
            let lastEntry = this.history[this.history.length - 1];
                if(lastEntry.name !== undefined)
                {
                    $('.leaflet-control-history').attr('data-original-title', lastEntry.name).tooltip('hide');
                }
        }
    }

    add(history)
    {
        $('.leaflet-control-history').parent().show();
        this.history.push(history);

        if(history.name !== undefined)
        {
            $('.leaflet-control-history').attr('title', history.name).attr('data-original-title', history.name).tooltip('hide');
        }

        if(this.history.length > this.limit)
        {
            this.history.shift();
        }
    }

    removeControl()
    {
        this.baseLayout.satisfactoryMap.leafletMap.removeControl(this.control);
    }
}

/**
 * HISTORY Control
 */
L.Control.HistoryControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function(options){
        //  apply options to instance
        L.Util.setOptions(this, options);
    },

    onAdd: function(){
        let className = 'leaflet-control-zoom leaflet-bar';
        let container1          = L.DomUtil.create('div', className);
        let link1               = L.DomUtil.create('a', 'leaflet-control-history leaflet-bar-part leaflet-bar-part-top-and-bottom', container1);
            link1.innerHTML     = '<i class="far fa-undo"></i>';
            link1.href          = '#';
            link1.dataset.hover = 'tooltip';
            link1.dataset.placement = 'right';
            link1.title         = 'Undo';

        L.DomEvent
            .on(link1, 'click', L.DomEvent.stopPropagation)
            .on(link1, 'click', L.DomEvent.preventDefault)
            .on(link1, 'click', this._undoHistory, this)
            .on(link1, 'dbclick', L.DomEvent.stopPropagation);

        return container1;
    },

    onRemove: function(){},
    _undoHistory: function(){ this.options.history.undo(); }
});

L.control.historyControl = function (options) {
    return new L.Control.HistoryControl(options);
};