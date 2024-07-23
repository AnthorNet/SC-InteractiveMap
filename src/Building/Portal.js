/* global Intl */
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Building_Portal
{
    static getLinkedPortal(baseLayout, currentObject)
    {
        return baseLayout.getObjectProperty(currentObject, 'mLinkedPortal');
    }

    static getPortalName(baseLayout, currentObject)
    {
        let mPortalName     = baseLayout.getObjectProperty(currentObject, 'mPortalName');
            if(mPortalName !== null)
            {
                return mPortalName;
            }

        return null;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : ((currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C') ? 'fa-portal-enter' : 'fa-portal-exit'),
            text        : baseLayout.translate._('Update Linked Portal'),
            callback    : Building_Portal.updateLinkedPortal
        });

        contextMenu.push({
            icon        : 'fa-pen',
            text        : 'Update name',
            callback    : Building_Portal.updatePortalName
        });

        return contextMenu;
    }

    /**
     * MODAL
     */
    static updatePortalName(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" name',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPortalName',
                    inputType   : 'text',
                    value       : Building_Portal.getPortalName(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    if(values.mPortalName !== '')
                    {
                        currentObject.properties.push({
                            flags                       : 18,
                            hasCultureInvariantString   : 1,
                            historyType                 : 255,
                            name                        : 'mPortalName',
                            type                        : 'Text',
                            value                       : values.mPortalName
                        });
                    }
                    else
                    {
                        baseLayout.deleteObjectProperty(currentObject, 'mPortalName');
                    }
                }
            });
    }

    static updateLinkedPortal(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let selectOptions       = [];
        let selectValue         = 'NULL';
        let linkables           = baseLayout.portalSubSystem.portals;
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C')
            {
                linkables = baseLayout.portalSubSystem.satellites;
            }
            selectOptions.push({
                text    : 'No link',
                value   : 'NULL'
            });

            for(let i = 0; i < linkables.length; i++)
            {
                let linkableObject = baseLayout.saveGameParser.getTargetObject(linkables[i]);
                    if(linkableObject !== null)
                    {
                        let linkedPortal = Building_Portal.getLinkedPortal(baseLayout, linkableObject);
                            if(linkedPortal === null || linkedPortal.pathName === currentObject.pathName)
                            {
                                let currentName = Building_Portal.getPortalName(baseLayout, linkableObject);
                                    if(currentName === null)
                                    {
                                        currentName = buildingData.name;
                                    }

                                selectOptions.push({
                                    text    : currentName + ' [' + new Intl.NumberFormat(baseLayout.language).format(linkableObject.transform.translation[0]) + ' / ' + new Intl.NumberFormat(baseLayout.language).format(linkableObject.transform.translation[1]) + ']',
                                    value   : linkables[i]
                                });

                                if(linkedPortal !== null && linkedPortal.pathName === currentObject.pathName)
                                {
                                    selectValue = linkableObject.pathName;
                                }
                            }
                    }
            }


        BaseLayout_Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" Linked Portal',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'updateLinkedPortal',
                inputType       : 'selectPicker',
                inputOptions    : selectOptions,
                value           : selectValue
            }],
            callback    : function(values)
            {
                if(values.updateLinkedPortal === 'NULL')
                {
                    let linkedPortal    = Building_Portal.getLinkedPortal(baseLayout, currentObject);
                        if(linkedPortal !== null)
                        {
                            let linkedPortalObject = baseLayout.saveGameParser.getTargetObject(linkedPortal.pathName);
                                if(linkedPortalObject !== null)
                                {
                                    baseLayout.deleteObjectProperty(linkedPortalObject, 'mLinkedPortal');
                                }
                        }

                    baseLayout.deleteObjectProperty(currentObject, 'mLinkedPortal');
                }
                else
                {
                    baseLayout.setObjectProperty(currentObject, 'mLinkedPortal', {pathName: values.updateLinkedPortal}, 'Object');

                    let linkedPortalObject = baseLayout.saveGameParser.getTargetObject(values.updateLinkedPortal);
                        if(linkedPortalObject !== null)
                        {
                            baseLayout.setObjectProperty(linkedPortalObject, 'mLinkedPortal', {pathName: currentObject.pathName}, 'Object');
                        }
                }
            }
        });
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, genericTooltipBackgroundStyle)
    {
        let content         = [];
        let minimapTarget   = [currentObject.transform.translation];
        let linkedPortal    = Building_Portal.getLinkedPortal(baseLayout, currentObject);
            if(linkedPortal !== null)
            {
                let linkedPortalObject = baseLayout.saveGameParser.getTargetObject(linkedPortal.pathName);
                    if(linkedPortalObject !== null)
                    {
                        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C')
                        {
                            minimapTarget.push(linkedPortalObject.transform.translation);
                        }
                        else
                        {
                            minimapTarget.unshift(linkedPortalObject.transform.translation);
                        }
                    }

                // Just to avoid missing a point, as genrally the minimap accepts loops and skip the last point...
                minimapTarget.push(linkedPortalObject.transform.translation);
            }

        content.push(baseLayout.mapSubSystem.getMinimap({trackData: minimapTarget}));

        return '<div class="d-flex" style="' + genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }

    //
    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, 'playerPortalsLayer');
            if(marker !== null)
            {
                let linkedPortal = Building_Portal.getLinkedPortal(baseLayout, currentObject);
                    if(linkedPortal !== null)
                    {
                        let linkedPortalObject = baseLayout.saveGameParser.getTargetObject(linkedPortal.pathName);
                            if(linkedPortalObject !== null)
                            {
                                marker.options.linkedPortalMarker = L.conveyor([
                                    baseLayout.satisfactoryMap.unproject(((currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C') ? linkedPortalObject.transform.translation : currentObject.transform.translation)),
                                    baseLayout.satisfactoryMap.unproject(((currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C') ? currentObject.transform.translation : linkedPortalObject.transform.translation))
                                ], {
                                    pathName    : ((currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C') ? currentObject.pathName : linkedPortal.pathName),
                                    interactive : false,
                                    color       : '#a671a6',
                                    weight      : 400
                                }).addTo(baseLayout.playerLayers.playerPortalsLayer.subLayer);
                                marker.options.linkedPortalMarker.setDashArray(baseLayout);
                            }
                    }
            }
    }
    static unbindTooltip(baseLayout, currentObject)
    {
        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, 'playerPortalsLayer');
            if(marker !== null && marker.options.linkedPortalMarker !== undefined)
            {
                marker.options.linkedPortalMarker.removeDashArray();
                baseLayout.playerLayers.playerPortalsLayer.subLayer.removeLayer(marker.options.linkedPortalMarker);
                delete marker.options.linkedPortalMarker;
            }
    }
}