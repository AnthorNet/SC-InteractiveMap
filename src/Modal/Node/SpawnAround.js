import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

import Spawn_Node                               from '../../Spawn/Node.js';

export default class Modal_Node_SpawnAround
{
    static getHTML(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let foundationTypes = [];
        let minerTypes      = [];
            for(const buildingData of baseLayout.buildingsData.values())
            {
                let currentBuildingOption = {
                        dataContent : '<img src="' + buildingData.image + '" style="width: 48px;" class="py-2 mr-1" /> ' + buildingData.name,
                        value       : buildingData.className,
                        text        : buildingData.name
                    }

                if(buildingData.category === 'foundation')
                {
                    if(buildingData.className.includes('Build_Foundation'))
                    {
                        currentBuildingOption.group = buildingData.subCategory;
                        foundationTypes.push(currentBuildingOption);
                    }
                }
                if(buildingData.category === 'extraction')
                {
                    if(buildingData.className.startsWith('/Game/FactoryGame/Buildable/Factory/Miner'))
                    {
                        minerTypes.push(currentBuildingOption);
                    }
                }
            }

        BaseLayout_Modal.form({
            title       : "Position",
            container   : '#leafletMap',
            inputs      : [
                {
                    name            : 'foundationType',
                    inputType       : 'selectPicker',
                    inputHeight     : true,
                    inputOptions    : foundationTypes,
                    value           : '/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x2_01.Build_Foundation_8x2_01_C'
                },
                {
                    name            : 'minerType',
                    inputType       : 'selectPicker',
                    inputHeight     : true,
                    inputOptions    : minerTypes
                },
                {
                    label       : 'Rotation (Angle between 0 and 360 degrees)',
                    name        : 'rotation',
                    inputType   : 'number',
                    min         : 0,
                    max         : 360,
                    value       : 0
                },
                {
                    label           : 'Use materials from your containers?',
                    name            : 'useOwnMaterials',
                    inputType       : 'toggle'
                }
            ],
            callback    : function(form)
            {
                if(form !== null && form.foundationType !== null && form.minerType !== null && form.yaw !== null && form.useOwnMaterials !== null)
                {
                    return new Spawn_Node({
                        baseLayout          : baseLayout,
                        marker              : marker,

                        foundationType      : form.foundationType,
                        minerType           : form.minerType,

                        rotation            : parseFloat(form.rotation)
                    });
                }
            }
        });
    }
}