/* global L */
import Modal_Selection                          from '../Modal/Selection.js';

export default class Building_RailroadTrack
{
    static getConnectedComponents(baseLayout, currentObject)
    {
        if(currentObject.children !== undefined)
        {
            let connectedComponents     = [];
                for(const child of currentObject.children)
                {
                    let trackConnection1 = baseLayout.saveGameParser.getTargetObject(child.pathName);
                        if(trackConnection1 !== null)
                        {
                            let mConnectedComponents    = baseLayout.getObjectProperty(trackConnection1, 'mConnectedComponents');
                                if(mConnectedComponents !== null)
                                {
                                    for(let j = 0; j < mConnectedComponents.values.length; j++)
                                    {
                                        let trackConnection2 = baseLayout.saveGameParser.getTargetObject(mConnectedComponents.values[j].pathName);
                                            if(trackConnection2 !== null)
                                            {
                                                connectedComponents.push(trackConnection2);
                                            }
                                    }
                                }
                        }
                }

            return connectedComponents;
        }

        return null;
    }

    /**
     * TOOLTIP
     */
    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        tooltipOptions.direction    = 'bottom';
        tooltipOptions.opacity      = 0.7;

        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, 'playerTracksLayer');
            if(marker !== null)
            {
                marker.setStyle({color: '#0000FF'});
            }

        let connectedComponents = Building_RailroadTrack.getConnectedComponents(baseLayout, currentObject);
            if(connectedComponents !== null)
            {
                let markers = [];
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
                                            markers.push(marker);
                                            marker.setStyle({color: '#00FF00'});
                                        }
                                }
                        }
                    }

                    if(markers.length > 0)
                    {
                        let boundaries  = Modal_Selection.getBoundaries(baseLayout, markers);
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
        let connectedComponents = Building_RailroadTrack.getConnectedComponents(baseLayout, currentObject);
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
                                baseLayout.setObjectProperty(trackConnection1, {
                                    name: 'mSwitchPosition',
                                    type: 'IntProperty',
                                    value: mSwitchPosition === 0 ? 1 : 0
                                });
                            }
                    }
            }
    }
}