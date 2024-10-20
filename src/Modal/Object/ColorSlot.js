import BaseLayout_Math                          from '../../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

import Building_Pipeline                        from '../../Building/Pipeline.js';

import SubSystem_Buildable                      from '../../SubSystem/Buildable.js';

export default class Modal_Object_ColorSlot
{
    static getHTML(marker)
    {
        let baseLayout          = marker.baseLayout;
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

        selectOptions.push({
            fullWidth       : true,
            primaryColor    : 'rgb(' + playerColors[27].primaryColor.r + ', ' + playerColors[27].primaryColor.g + ', ' + playerColors[27].primaryColor.b + ')',
            secondaryColor  : 'rgb(' + playerColors[27].secondaryColor.r + ', ' + playerColors[27].secondaryColor.g + ', ' + playerColors[27].secondaryColor.b + ')',
            value           : 27,
            text            : 'Project Assembly'
        });

        for(let slotIndex = 1; slotIndex <= SubSystem_Buildable.totalColorSlots; slotIndex++)
        {
            let inGameSlot = (slotIndex >= 16) ? slotIndex + 8 : slotIndex;

            selectOptions.push({
                primaryColor    : 'rgb(' + playerColors[inGameSlot].primaryColor.r + ', ' + playerColors[inGameSlot].primaryColor.g + ', ' + playerColors[inGameSlot].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[inGameSlot].secondaryColor.r + ', ' + playerColors[inGameSlot].secondaryColor.g + ', ' + playerColors[inGameSlot].secondaryColor.b + ')',
                value           : inGameSlot,
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

        if(Building_Pipeline.isPipeline(currentObject))
        {
            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[17].primaryColor.r + ', ' + playerColors[17].primaryColor.g + ', ' + playerColors[17].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[17].secondaryColor.r + ', ' + playerColors[17].secondaryColor.g + ', ' + playerColors[17].secondaryColor.b + ')',
                value           : 17,
                text            : 'FICSIT Pipe'
            });
        }
        if(buildingData.category === 'foundation' || buildingData.category === 'wall')
        {
            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[18].primaryColor.r + ', ' + playerColors[18].primaryColor.g + ', ' + playerColors[18].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[18].secondaryColor.r + ', ' + playerColors[18].secondaryColor.g + ', ' + playerColors[18].secondaryColor.b + ')',
                value           : 18,
                text            : 'Concrete Structure'
            });
        }

        let objectPrimaryColor      = baseLayout.buildableSubSystem.getObjectPrimaryColor(currentObject);
        let objectSecondaryColor    = baseLayout.buildableSubSystem.getObjectSecondaryColor(currentObject);
            if(slotIndex !== 255)
            {
                let playerCustomColor       = baseLayout.buildableSubSystem.getPlayerCustomColor();
                    objectPrimaryColor      = playerCustomColor.primaryColor;
                    objectSecondaryColor    = playerCustomColor.secondaryColor;
            }

            selectOptions.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + objectPrimaryColor.r + ', ' + objectPrimaryColor.g + ', ' + objectPrimaryColor.b + ')',
                secondaryColor  : 'rgb(' + objectSecondaryColor.r + ', ' + objectSecondaryColor.g + ', ' + objectSecondaryColor.b + ')',
                value           : 255,
                text            : 'Custom Swatch'
            });

        // Finishes
        let finishes = {
            19: {
                name    : 'Carbon Steel Finish',
                image   : baseLayout.staticUrl + '/img/gameStable1.0/IconDesc_SteelFinish_256.png?v=' + baseLayout.scriptVersion
            },
            20: {
                name: 'Caterium Finish',
                image   : baseLayout.staticUrl + '/img/gameStable1.0/IconDesc_CateriumFinish_256.png?v=' + baseLayout.scriptVersion
            },
            21: {
                name: 'Chrome Finish',
                image   : baseLayout.staticUrl + '/img/gameStable1.0/IconDesc_ChromeFinish_256.png?v=' + baseLayout.scriptVersion
            },
            22: {
                name: 'Copper Finish',
                image   : baseLayout.staticUrl + '/img/gameStable1.0/IconDesc_CopperFinish_256.png?v=' + baseLayout.scriptVersion
            }
        };
            for(let i = 19; i <= 22; i++)
            {
                let primaryColor = baseLayout.buildableSubSystem.getDefaultPrimaryColorSlot(i);
                    selectOptions.push({
                        primaryColor    : 'rgb(' + primaryColor.r + ', ' + primaryColor.g + ', ' + primaryColor.b + ')',
                        backgroundImage : finishes[i].image,
                        value           : i,
                        text            : finishes[i].name
                    });
            }

        BaseLayout_Modal.form({
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
                baseLayout.buildableSubSystem.setObjectColorSlot(currentObject, parseInt(values.slotIndex));
                marker.relatedTarget.fire('mouseout'); // Trigger a redraw
            }
        });
    }
}