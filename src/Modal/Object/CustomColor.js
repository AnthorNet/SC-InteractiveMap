import Modal                                    from '../../Modal.js';

import BaseLayout_Math                          from '../../BaseLayout/Math.js';

import SubSystem_Buildable                      from '../../SubSystem/Buildable.js';

export default class Modal_Object_CustomColor
{
    static getHTML(marker)
    {
        let baseLayout      = marker.baseLayout;
            baseLayout.satisfactoryMap.pauseMap();

        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData            = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let objectPrimaryColor      = baseLayout.buildableSubSystem.getObjectPrimaryColor(currentObject);
        let objectSecondaryColor    = baseLayout.buildableSubSystem.getObjectSecondaryColor(currentObject);

        Modal.form({
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
                baseLayout.satisfactoryMap.unpauseMap();

                if(values === null)
                {
                    return;
                }

                console.log(values);

                baseLayout.buildableSubSystem.setObjectCustomColor(currentObject, values.primaryColor, values.secondaryColor);
                marker.relatedTarget.fire('mouseout'); // Trigger a redraw
            }
        });
    }
}