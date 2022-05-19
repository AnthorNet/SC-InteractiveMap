/* global L */
import BaseLayout_Math                          from '../BaseLayout/Math.js';

import Modal_Selection                          from '../Modal/Selection.js';

export default class Building_RailroadTrack
{
    static get availableConnections(){ return ['.TrackConnection0', '.TrackConnection1']; }

    static getConnectedComponents(baseLayout, currentObject)
    {
        if(currentObject.children !== undefined)
        {
            let connectedComponents     = [];
                for(let i = 0; i < currentObject.children.length; i++)
                {
                    let trackConnection1 = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
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

    /*
     * ADD
     */
    static add(baseLayout, currentObject)
    {
        baseLayout.setupSubLayer('playerTracksLayer');

        let splineData      = BaseLayout_Math.extractSplineData(baseLayout, currentObject);
        let track           = L.conveyor(
                splineData.points,
                {
                    pathName    : currentObject.pathName,
                    weight      : 600,
                    color       : '#ff69b4',
                    opacity     : 0.9
                }
            );

        baseLayout.bindMouseEvents(track);

        baseLayout.playerLayers.playerTracksLayer.distance += splineData.distance;
        baseLayout.playerLayers.playerTracksLayer.elements.push(track);

        if(baseLayout.playerLayers.playerTracksLayer.filtersCount !== undefined)
        {
            let trackClassName = currentObject.className;
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C' || currentObject.className === '/FlexSplines/Track/Build_Track.Build_Track_C')
                {
                    trackClassName = '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C';
                }

            if(baseLayout.playerLayers.playerTracksLayer.filtersCount[trackClassName] === undefined)
            {
                baseLayout.playerLayers.playerTracksLayer.filtersCount[trackClassName] = {distance: 0};
            }
            baseLayout.playerLayers.playerTracksLayer.filtersCount[trackClassName].distance += splineData.distance;
        }

        return {layer: 'playerTracksLayer', marker: track};
    }

    /**
     * TOOLTIP
     */
    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        tooltipOptions.direction    = 'bottom';

        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, 'playerTracksLayer');
            if(marker !== null)
            {
                marker.setStyle({color: '#0000FF'});
            }

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
                                        marker.setStyle({color: '#00FF00'});
                                    }
                            }
                    }
                }
            }
    }
    static unbindTooltip(baseLayout, currentObject)
    {
        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, 'playerTracksLayer');
            if(marker !== null)
            {
                marker.setStyle({color: '#ff69b4'});
            }

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
                                        marker.setStyle({color: '#ff69b4'});
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