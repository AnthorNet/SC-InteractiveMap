import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

import SubSystem_Buildable                      from '../../SubSystem/Buildable.js';

import Spawn_Blueprint                          from '../../Spawn/Blueprint.js';

export default class Modal_Map_Paste
{
    /*
     * MODAL
     */
    static getHTML(marker)
    {
        let baseLayout          = marker.baseLayout;
        let colorSlotOptions    = [];
            colorSlotOptions.push({text: 'No foundation helper', value: 'NONE'});
            for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
            {
                colorSlotOptions.push({text: 'Swatch #' + (slotIndex + 1), value: slotIndex});
            }

        BaseLayout_Modal.form({
            title       : "Offset clipboard center",
            message     : "Most of the time, the clipboard calculate the center of your selection correctly. If not you can use the offset to move it.",
            container   : '#leafletMap',
            inputs      : [
                {
                    label           : 'X offset',
                    name            : 'xOffset',
                    inputType       : 'coordinate',
                    value           : 0
                },
                {
                    label           : 'Y offset',
                    name            : 'yOffset',
                    inputType       : 'coordinate',
                    value           : 0
                },
                {
                    label           : 'Z offset',
                    name            : 'zOffset',
                    inputType       : 'coordinate',
                    value           : 0
                },
                {
                    label           : 'Paste position',
                    name            : 'pasteOn',
                    inputType       : 'select',
                    inputOptions    : [
                        {text: 'Bottom of pasting object, then delete center object', value: 'bottom'},
                        {text: 'Top of pasting object', value: 'top'}
                    ]
                },
                {
                    label           : 'Colored foundation helper',
                    name            : 'colorSlotHelper',
                    inputType       : 'select',
                    inputOptions    : colorSlotOptions
                }
            ],
            callback    : function(values)
            {
                return new Spawn_Blueprint({
                    baseLayout          : baseLayout,
                    marker              : marker,
                    clipboard           : baseLayout.clipboard,
                    xOffset             : parseFloat(values.xOffset),
                    yOffset             : parseFloat(values.yOffset),
                    zOffset             : parseFloat(values.zOffset),
                    pasteOn             : values.pasteOn,
                    colorSlotHelper     : values.colorSlotHelper
                });
            }
        });
    }
}