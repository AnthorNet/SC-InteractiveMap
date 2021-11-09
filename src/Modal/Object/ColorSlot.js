import Modal                                    from '../../Modal.js';

import BaseLayout_Math                          from '../../BaseLayout/Math.js';

import SubSystem_Buildable                      from '../../SubSystem/Buildable.js';

export default class Modal_Object_ColorSlot
{
    static getHTML(marker)
    {
        let baseLayout      = marker.baseLayout;
            baseLayout.satisfactoryMap.pauseMap();

        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let slotIndex           = baseLayout.buildableSubSystem.getObjectColorSlot(currentObject);
        let playerColors        = baseLayout.buildableSubSystem.getPlayerColorSlots();
        let selectOptions       = [];

        selectOptions.push({
            fullWidth       : true,
            primaryColor    : 'rgb(' + playerColors[0].primaryColor.r + ', ' + playerColors[0].primaryColor.g + ', ' + playerColors[0].primaryColor.b + ')',
            secondaryColor  : 'rgb(' + playerColors[0].secondaryColor.r + ', ' + playerColors[0].secondaryColor.g + ', ' + playerColors[0].secondaryColor.b + ')',
            value           : 0,
            text            : 'FICSIT Factory'
        });

        for(let slotIndex = 1; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
        {
            selectOptions.push({
                primaryColor    : 'rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ')',
                value           : slotIndex,
                text            : 'Swatch ' + slotIndex
            });
        }

        if(buildingData.category === 'foundation')
        {
            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[16].primaryColor.r + ', ' + playerColors[16].primaryColor.g + ', ' + playerColors[16].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[16].secondaryColor.r + ', ' + playerColors[16].secondaryColor.g + ', ' + playerColors[16].secondaryColor.b + ')',
                value           : 16,
                text            : 'FICSIT Foundation'
            });
        }
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C')
        {
            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[17].primaryColor.r + ', ' + playerColors[17].primaryColor.g + ', ' + playerColors[17].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[17].secondaryColor.r + ', ' + playerColors[17].secondaryColor.g + ', ' + playerColors[17].secondaryColor.b + ')',
                value           : 17,
                text            : 'FICSIT Pipe'
            });
        }

        let objectPrimaryColor      = baseLayout.buildableSubSystem.getObjectPrimaryColor(currentObject);
        let objectSecondaryColor    = baseLayout.buildableSubSystem.getObjectSecondaryColor(currentObject);
            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + objectPrimaryColor.r + ', ' + objectPrimaryColor.g + ', ' + objectPrimaryColor.b + ')',
                secondaryColor  : 'rgb(' + objectSecondaryColor.r + ', ' + objectSecondaryColor.g + ', ' + objectSecondaryColor.b + ')',
                value           : 255,
                text            : 'Custom Swatch'
            });

        Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" color swatch',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'slotIndex',
                inputType       : 'colorSlots',
                inputOptions    : selectOptions,
                value           : slotIndex
            }],
            callback    : function(values)
            {
                baseLayout.satisfactoryMap.unpauseMap();

                if(values === null)
                {
                    return;
                }

                baseLayout.buildableSubSystem.setObjectColorSlot(currentObject, parseInt(values.slotIndex));
                marker.relatedTarget.fire('mouseout'); // Trigger a redraw
            }
        });
    }
}