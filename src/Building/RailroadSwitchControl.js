/* global L */

export default class Building_RailroadSwitchControl
{
    static getConnectedComponents(baseLayout, currentObject)
    {
        let mControlledConnection = baseLayout.getObjectProperty(currentObject, 'mControlledConnection');
            if(mControlledConnection !== null)
            {
                let trackConnection1 = baseLayout.saveGameParser.getTargetObject(mControlledConnection.pathName);
                    if(trackConnection1 !== null)
                    {
                        let mConnectedComponents    = baseLayout.getObjectProperty(trackConnection1, 'mConnectedComponents');
                        let mSwitchPosition         = baseLayout.getObjectProperty(trackConnection1, 'mSwitchPosition');
                        let connectedComponents     = [trackConnection1];

                            if(mConnectedComponents !== null && mSwitchPosition !== null && mConnectedComponents.values[mSwitchPosition] !== undefined)
                            {
                                let trackConnection2 = baseLayout.saveGameParser.getTargetObject(mConnectedComponents.values[mSwitchPosition].pathName);
                                    if(trackConnection2 !== null)
                                    {
                                        connectedComponents.push(trackConnection2);
                                    }
                            }

                        return connectedComponents;
                    }
            }

        return null;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let buildingData = baseLayout.getBuildingDataFromClassName(currentObject.className);

            contextMenu.push({
                text: 'Update "' + buildingData.name + '" connected railway',
                callback: Building_RailroadSwitchControl.updateConnectedComponent
            });
            contextMenu.push('-');

        return contextMenu;
    }

    /**
     * TOOLTIP
     */
    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        tooltipOptions.direction    = 'bottom';
        tooltipOptions.opacity      = 0.7;

        let connectedComponents = Building_RailroadSwitchControl.getConnectedComponents(baseLayout, currentObject);
            if(connectedComponents !== null)
            {
                let markersSelected = [];
                    for(let i = 0; i < connectedComponents.length; i++)
                    {
                        if(connectedComponents[i].outerPathName !== undefined)
                        {
                            let connectedObject = baseLayout.saveGameParser.getTargetObject(connectedComponents[i].outerPathName);
                                if(connectedObject !== null)
                                {
                                    let marker = baseLayout.getMarkerFromPathName(connectedComponents[i].outerPathName, 'playerTracksLayer');
                                        if(marker !== null)
                                        {
                                            markersSelected.push(marker);
                                            marker.setStyle({color: '#00FF00'});
                                        }
                                }
                        }
                    }

                    if(markersSelected.length > 0)
                    {
                        let boundaries  = baseLayout.getSelectionBoundaries(markersSelected);
                        let offset      = boundaries.maxX - boundaries.centerX;
                        let distanceY   = baseLayout.satisfactoryMap.leafletMap
                                                    .latLngToLayerPoint(baseLayout.satisfactoryMap.unproject(currentObject.transform.translation))
                                                    .distanceTo(baseLayout.satisfactoryMap.leafletMap.latLngToLayerPoint(baseLayout.satisfactoryMap.unproject([
                                                        currentObject.transform.translation[0],
                                                        currentObject.transform.translation[1] + offset
                                                    ])));

                            tooltipOptions.offset = new L.point(0, distanceY);
                    }
            }
    }
    static unbindTooltip(baseLayout, currentObject)
    {
        let connectedComponents = Building_RailroadSwitchControl.getConnectedComponents(baseLayout, currentObject);
            if(connectedComponents !== null)
            {
                for(let i = 0; i < connectedComponents.length; i++)
                {
                    if(connectedComponents[i].outerPathName !== undefined)
                    {
                        let connectedObject = baseLayout.saveGameParser.getTargetObject(connectedComponents[i].outerPathName);
                            if(connectedObject !== null)
                            {
                                let marker = baseLayout.getMarkerFromPathName(connectedComponents[i].outerPathName, 'playerTracksLayer');
                                    if(marker !== null)
                                    {
                                        let buildingData = baseLayout.getBuildingDataFromClassName(connectedObject.className);
                                            baseLayout.setBuildingMouseOutStyle(marker, buildingData, connectedObject);
                                    }
                            }
                    }
                }
            }
    }

    /**
     * MODALS
     */
    static updateConnectedComponent(marker)
    {
        let baseLayout              = marker.baseLayout;
        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let mControlledConnection   = baseLayout.getObjectProperty(currentObject, 'mControlledConnection');
            if(mControlledConnection !== null)
            {
                let trackConnection1 = baseLayout.saveGameParser.getTargetObject(mControlledConnection.pathName);
                    if(trackConnection1 !== null)
                    {
                        let mConnectedComponents    = baseLayout.getObjectProperty(trackConnection1, 'mConnectedComponents');
                        let mSwitchPosition         = baseLayout.getObjectProperty(trackConnection1, 'mSwitchPosition');
                        let connectedComponents     = [trackConnection1];

                            if(mConnectedComponents !== null && mSwitchPosition !== null && mConnectedComponents.values[mSwitchPosition] !== undefined)
                            {
                                let trackConnection2 = baseLayout.saveGameParser.getTargetObject(mConnectedComponents.values[mSwitchPosition].pathName);
                                    if(trackConnection2 !== null)
                                    {
                                        connectedComponents.push(trackConnection2);
                                    }
                            }

                            if(connectedComponents.length > 1)
                            {
                                baseLayout.setObjectProperty(trackConnection1, 'mSwitchPosition', ((mSwitchPosition === 0) ? 1 : 0), 'IntProperty');
                            }
                    }
            }
    }
}