/* global L */
import Modal_Selection                          from '../Modal/Selection.js';

export default class Building_RailroadSwitchControl
{
    static getConnectedComponents(baseLayout, currentObject)
    {
        if(baseLayout.saveGameParser.header.saveVersion >= 51)
        {
            let connectedComponents     = [];
            let mControlledConnections  = baseLayout.getObjectProperty(currentObject, 'mControlledConnections');
            let mSwitchData             = baseLayout.getObjectProperty(currentObject, 'mSwitchData');
                if(mControlledConnections !== null && mSwitchData !== null)
                {
                    for(let i = 0; i < mControlledConnections.values.length; i++)
                    {
                        let trackConnection1 = baseLayout.saveGameParser.getTargetObject(mControlledConnections.values[i].pathName);
                            if(trackConnection1 !== null)
                            {
                                connectedComponents.push(trackConnection1);

                                // At the end, check the connected railway...
                                if(i === (mControlledConnections.values.length - 1))
                                {
                                    let mConnectedComponents    = baseLayout.getObjectProperty(trackConnection1, 'mConnectedComponents');
                                        if(mConnectedComponents !== null)
                                        {
                                            let switchPosition    = baseLayout.getObjectProperty(mSwitchData, 'position', {enumName: 'None', value: 0});
                                                if(mConnectedComponents !== null && mConnectedComponents.values[switchPosition.value] !== undefined)
                                                {
                                                    let trackConnection2 = baseLayout.saveGameParser.getTargetObject(mConnectedComponents.values[switchPosition.value].pathName);
                                                        if(trackConnection2 !== null)
                                                        {
                                                            connectedComponents.push(trackConnection2);
                                                        }
                                                }
                                        }
                                }
                            }
                    }
                }

                if(connectedComponents.length > 0)
                {
                    return connectedComponents;
                }
        }
        else
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
        }

        return null;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        if(baseLayout.saveGameParser.header.saveVersion >= 51)
        {
            contextMenu.push({
                icon        : 'fa-code-merge',
                text        : 'Update railway direction',
                callback    : Building_RailroadSwitchControl.updateSwitchPosition
            });
            contextMenu.push('-');
        }
        else
        {
            contextMenu.push({
                icon        : 'fa-code-merge',
                text        : 'Update connected railway',
                callback    : Building_RailroadSwitchControl.updateConnectedComponentLegacy
            });
            contextMenu.push('-');
        }

        return contextMenu;
    }

    /**
     * TOOLTIP
     */
    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        tooltipOptions.direction    = 'bottom';

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
                                        marker.setStyle({color: '#00FF00'});
                                    }
                            }
                    }
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
    static updateSwitchPosition(marker)
    {
        let baseLayout              = marker.baseLayout;
        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let mControlledConnections  = baseLayout.getObjectProperty(currentObject, 'mControlledConnections');
        let mSwitchData             = baseLayout.getObjectProperty(currentObject, 'mSwitchData');
            if(mControlledConnections !== null && mSwitchData !== null)
            {
                let trackConnection1 = baseLayout.saveGameParser.getTargetObject(mControlledConnections.values[0].pathName);
                    if(trackConnection1 !== null)
                    {
                        let mConnectedComponents    = baseLayout.getObjectProperty(trackConnection1, 'mConnectedComponents');
                            if(mConnectedComponents !== null)
                            {
                                let switchPosition  = baseLayout.getObjectProperty(mSwitchData, 'position', {enumName: 'None', value: 0});
                                    baseLayout.deleteObjectProperty(mSwitchData, 'position');

                                    if(switchPosition.value < (mConnectedComponents.values.length - 1))
                                    {
                                        mSwitchData.values.push({
                                            name    : 'position',
                                            type    : 'Byte',
                                            value   : { enumName: 'None', value: (switchPosition.value + 1) }
					});
                                    }
                            }
                    }
            }
    }

    static updateConnectedComponentLegacy(marker)
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
                                baseLayout.setObjectProperty(trackConnection1, 'mSwitchPosition', ((mSwitchPosition === 0) ? 1 : 0), 'Int');
                            }
                    }
            }
    }
}