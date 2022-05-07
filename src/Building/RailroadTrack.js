/* global L */
import Modal_Selection                          from '../Modal/Selection.js';

export default class Building_RailroadTrack
{
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