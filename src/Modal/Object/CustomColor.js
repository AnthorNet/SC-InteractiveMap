import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

export default class Modal_Object_CustomColor
{
    static getHTML(marker)
    {
        let baseLayout              = marker.baseLayout;
        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData            = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let objectPrimaryColor      = baseLayout.buildableSubSystem.getObjectPrimaryColor(currentObject);
        let objectSecondaryColor    = baseLayout.buildableSubSystem.getObjectSecondaryColor(currentObject);

        BaseLayout_Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" custom color',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'primaryColor',
                inputType       : 'colorPicker',
                value           : objectPrimaryColor
            },
            {
                name            : 'secondaryColor',
                inputType       : 'colorPicker',
                value           : objectSecondaryColor
            }],
            callback    : function(values)
            {
                baseLayout.buildableSubSystem.setObjectCustomColor(currentObject, values.primaryColor, values.secondaryColor);
                marker.relatedTarget.fire('mouseout'); // Trigger a redraw
            }
        });
    }
}