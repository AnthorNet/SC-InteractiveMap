/* global Intl */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Building_Beacon
{
    static getCompassText(baseLayout, currentObject)
    {
        return baseLayout.getObjectProperty(currentObject, 'mCompassText');
    }

    static getFormattedCompassText(baseLayout, currentObject)
    {
        let mCompassText = Building_Beacon.getCompassText(baseLayout, currentObject);
            if(mCompassText !== null)
            {
                return 'Beacon: <strong>' + mCompassText + '</strong>';
            }

        return '<strong>Beacon</strong>';
    }

    static getCompassColor(baseLayout, currentObject)
    {
        return baseLayout.getObjectProperty(currentObject, 'mCompassColor');
    }

    static getFormattedCompassColor(baseLayout, currentObject)
    {
        let mCompassColor   = Building_Beacon.getCompassColor(baseLayout, currentObject);
            if(mCompassColor !== null)
            {
                return 'rgb(' + BaseLayout_Math.linearColorToRGB(mCompassColor.values.r) + ', ' + BaseLayout_Math.linearColorToRGB(mCompassColor.values.g) + ', ' + BaseLayout_Math.linearColorToRGB(mCompassColor.values.b) + ')';
            }

        return '#b3b3b3';
    }

    /*
     * ADD/DELETE
     */
    static add(baseLayout, currentObject)
    {
        baseLayout.setupSubLayer('playerOrientationLayer');

        let beacon          = L.marker(
            baseLayout.satisfactoryMap.unproject(currentObject.transform.translation),
            {
                pathName        : currentObject.pathName,
                icon            : baseLayout.getMarkerIcon('#FFFFFF', Building_Beacon.getFormattedCompassColor(baseLayout, currentObject), baseLayout.staticUrl + '/img/mapBeaconIcon.png'),
                riseOnHover     : true,
                zIndexOffset    : 900
            }
        );

        baseLayout.playerLayers.playerOrientationLayer.count++;
        baseLayout.bindMouseEvents(beacon);
        baseLayout.playerLayers.playerOrientationLayer.elements.push(beacon);

        return {layer: 'playerOrientationLayer', marker: beacon};
    }

    static delete(marker)
    {
        let baseLayout = marker.baseLayout;
            baseLayout.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
            baseLayout.deleteMarkerFromElements('playerOrientationLayer', marker.relatedTarget);
            baseLayout.playerLayers.playerOrientationLayer.count--;
            baseLayout.setBadgeLayerCount('playerOrientationLayer');
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            text        : Building_Beacon.getFormattedCompassText(baseLayout, currentObject)
        });

        contextMenu.push({
            icon        : 'fa-pen',
            text        : 'Update label',
            callback    : Building_Beacon.updateCompassText
        });
        contextMenu.push({
            icon        : 'fa-paint-brush',
            text        : 'Update color',
            callback    : Building_Beacon.updateCompassColor
        });
        contextMenu.push('-');

        contextMenu.push({
            icon        : 'fa-portal-exit',
            text        : 'Teleport player',
            callback    : baseLayout.teleportPlayer
        });
        contextMenu.push('-');
        contextMenu.push({
            icon        : 'fa-trash-alt',
            text        : 'Delete',
            callback    : Building_Beacon.delete
        });

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateCompassText(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mCompassText    = Building_Beacon.getCompassText(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>Beacon</strong>" label',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mCompassText',
                    inputType   : 'text',
                    value       : mCompassText
                }],
                callback    : function(values)
                {
                    if(values.mCompassText !== '')
                    {
                        if(mCompassText !== null)
                        {
                            baseLayout.setObjectProperty(currentObject, 'mCompassText', values.mCompassText);
                        }
                        else
                        {
                            currentObject.properties.push({
                                flags                       : 18,
                                hasCultureInvariantString   : 1,
                                historyType                 : 255,
                                name                        : "mCompassText",
                                type                        : "TextProperty",
                                value                       : values.mCompassText
                            });
                        }
                    }
                    else
                    {
                        baseLayout.deleteObjectProperty(currentObject, 'mCompassText');
                    }
                }
            });
    }

    static updateCompassColor(marker)
    {
        let baseLayout              = marker.baseLayout;
        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mCompassColor           = Building_Beacon.getCompassColor(baseLayout, currentObject);
        let mFormattedCompassColor  = Building_Beacon.getFormattedCompassColor(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>Beacon</strong>" color',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mCompassColor',
                    inputType   : 'colorPicker',
                    value       : mFormattedCompassColor
                }],
                callback    : function(values)
                {
                    let newCompassColor = {
                            r       : BaseLayout_Math.RGBToLinearColor(values.mCompassColor.r),
                            g       : BaseLayout_Math.RGBToLinearColor(values.mCompassColor.g),
                            b       : BaseLayout_Math.RGBToLinearColor(values.mCompassColor.b),
                            a       : 1
                        };

                    if(mCompassColor !== null)
                    {
                        baseLayout.setObjectProperty(currentObject, 'mCompassColor', {type: 'LinearColor', values: newCompassColor});
                    }
                    else
                    {
                        currentObject.properties.push({
                            name                        : "mCompassColor",
                            type                        : "StructProperty",
                            value                       : {type: 'LinearColor', values: newCompassColor}
                        });
                    }

                    new Promise(function(resolve){
                        return baseLayout.parseObject(currentObject, resolve);
                    }).then(function(result){
                        baseLayout.playerLayers[result.layer].count--;
                        baseLayout.deleteMarkerFromElements(result.layer, marker.relatedTarget);
                        baseLayout.addElementToLayer(result.layer, result.marker);
                    });
                }
            });
    }


    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, genericTooltipBackgroundStyle)
    {
        let content         = [];
            content.push(Building_Beacon.getFormattedCompassText(baseLayout, currentObject))

        content.push('<div class="text-small">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(currentObject.transform.translation[0])) + ' / ' + new Intl.NumberFormat(baseLayout.language).format(Math.round(currentObject.transform.translation[1])) + '</div>');
        content.push('<div class="text-small">Altitude: ' + new Intl.NumberFormat(baseLayout.language).format(Math.round(currentObject.transform.translation[2] / 100)) + 'm</div>');

        return '<div class="d-flex" style="' + genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }
}