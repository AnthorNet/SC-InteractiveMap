import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Building_Door
{
    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let mDoorConfiguration  = baseLayout.getObjectProperty(currentObject, 'mDoorConfiguration');

        contextMenu.push({
            icon        : ((mDoorConfiguration !== null) ? ((mDoorConfiguration.value === 'EDoorConfiguration::DC_Open') ? 'fa-door-open' : 'fa-door-close') : 'fa-door-open'),
            text        : 'Update status',
            callback    : Building_Door.updateStatus
        });
        contextMenu.push('-');

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateStatus(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let mDoorConfiguration  = baseLayout.getObjectProperty(currentObject, 'mDoorConfiguration');

            BaseLayout_Modal.form({
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
                    baseLayout.deleteObjectProperty(currentObject, 'mDoorConfiguration');

                    if(values.mDoorConfiguration !== 'Automatic')
                    {
                        currentObject.properties.push({
                            name: "mDoorConfiguration", type: "EnumProperty",
                            value: { name: "EDoorConfiguration", value: values.mDoorConfiguration}
                        });
                    }
                }
            });
    }
}