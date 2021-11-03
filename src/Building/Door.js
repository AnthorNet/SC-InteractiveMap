import Modal                                    from '../Modal.js';

export default class Building_Door
{
    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let buildingData = baseLayout.getBuildingDataFromClassName(currentObject.className);

            contextMenu.push({
                text: 'Update "' + buildingData.name + '" status',
                callback: Building_Door.updateStatus
            });
            contextMenu.push({separator: true});

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateStatus(marker)
    {
        let baseLayout          = marker.baseLayout;
            baseLayout.satisfactoryMap.pauseMap();
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let mDoorConfiguration  = baseLayout.getObjectProperty(currentObject, 'mDoorConfiguration');

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" status',
                container   : '#leafletMap',
                inputs      : [{
                    name            : 'mDoorConfiguration',
                    inputType       : 'select',
                    inputOptions    : [
                        { text: 'Automatic', value: 'Automatic' },
                        { text: 'Always Open', value: 'EDoorConfiguration::DC_Open' },
                        { text: 'Always Close', value: 'EDoorConfiguration::DC_Closed' }
                    ],
                    value           : ((mDoorConfiguration !== null) ? mDoorConfiguration.value : '')
                }],
                callback    : function(values)
                {
                    this.satisfactoryMap.unpauseMap();

                    if(values === null)
                    {
                        return;
                    }
                    
                    this.deleteObjectProperty(currentObject, 'mDoorConfiguration');

                    if(values.mDoorConfiguration !== 'Automatic')
                    {
                        currentObject.properties.push({
                            name: "mDoorConfiguration", type: "EnumProperty",
                            value: { name: "EDoorConfiguration", value: values.mDoorConfiguration}
                        });
                    }
                }.bind(baseLayout)
            });
    }
}