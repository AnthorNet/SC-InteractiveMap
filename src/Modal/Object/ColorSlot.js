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

        let buildableSubSystem  = new SubSystem_Buildable({baseLayout: baseLayout});
        let slotIndex           = buildableSubSystem.getObjectPrimaryColorSlot(currentObject);
        let playerColors        = buildableSubSystem.getPlayerColorSlots();
        let selectOptions       = [];

        for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
        {
            selectOptions.push({
                primaryColor    : 'rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ')',
                value           : slotIndex,
                text            : '#' + (slotIndex + 1)
            });
        }

        if(buildingData.category === 'foundation')
        {
            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[16].primaryColor.r + ', ' + playerColors[16].primaryColor.g + ', ' + playerColors[16].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[16].secondaryColor.r + ', ' + playerColors[16].secondaryColor.g + ', ' + playerColors[16].secondaryColor.b + ')',
                value           : 16,
                text            : 'Default foundations'
            });

            let foundationSlotIndex = buildableSubSystem.getObjectPrimaryColorSlot(currentObject, true);
                if(foundationSlotIndex === null)
                {
                    slotIndex = 16;
                }
        }
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C')
        {
            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[17].primaryColor.r + ', ' + playerColors[17].primaryColor.g + ', ' + playerColors[17].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[17].secondaryColor.r + ', ' + playerColors[17].secondaryColor.g + ', ' + playerColors[17].secondaryColor.b + ')',
                value           : 17,
                text            : 'Default pipes'
            });

            let pipeSlotIndex = buildableSubSystem.getObjectPrimaryColorSlot(currentObject, true);
                if(pipeSlotIndex === null)
                {
                    slotIndex = 17;
                }
        }

        Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" color slot',
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

                let colorSlot       = baseLayout.getObjectProperty(currentObject, 'mColorSlot');
                let newSlotIndex    = parseInt(values.slotIndex);

                if(colorSlot === null && newSlotIndex > 0 && newSlotIndex < SubSystem_Buildable.totalColorSlots)
                {
                    currentObject.properties.push({
                        name: 'mColorSlot',
                        type: 'ByteProperty',
                        value: {
                            enumName: 'None',
                            value: newSlotIndex
                        }
                    });
                }
                else
                {
                    for(let i = 0; i < currentObject.properties.length; i++)
                    {
                        if(currentObject.properties[i].name === 'mColorSlot')
                        {
                            if(newSlotIndex > 0)
                            {
                                currentObject.properties[i].value.value = newSlotIndex;
                            }
                            else
                            {
                                currentObject.properties.splice(i, 1);
                            }

                            break;
                        }
                    }
                }

                let mPrimaryColor   = baseLayout.getObjectProperty(currentObject, 'mPrimaryColor');
                    if(mPrimaryColor !== null)
                    {
                        mPrimaryColor.values = {
                            r: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].primaryColor.r),
                            g: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].primaryColor.g),
                            b: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].primaryColor.b)
                        }
                    }
                let mSecondaryColor = baseLayout.getObjectProperty(currentObject, 'mSecondaryColor');
                    if(mSecondaryColor !== null)
                    {
                        mSecondaryColor.values = {
                            r: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].secondaryColor.r),
                            g: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].secondaryColor.g),
                            b: BaseLayout_Math.RGBToLinearColor(playerColors[slotIndex].secondaryColor.b)
                        }
                    }

                marker.relatedTarget.fire('mouseout'); // Trigger a redraw
            }
        });
    }
}