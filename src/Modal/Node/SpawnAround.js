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
            for(let buildingId in baseLayout.buildingsData)
            {
                let currentBuildingOption = {
                        dataContent : '<img src="' + baseLayout.buildingsData[buildingId].image + '" style="width: 48px;" class="py-2 mr-1" /> ' + baseLayout.buildingsData[buildingId].name,
                        value       : baseLayout.buildingsData[buildingId].className,
                        text        : baseLayout.buildingsData[buildingId].name
                    }

                if(baseLayout.buildingsData[buildingId].category === 'foundation')
                {
                    if(baseLayout.buildingsData[buildingId].className.includes('Build_Foundation'))
                    {
                        currentBuildingOption.group = baseLayout.buildingsData[buildingId].subCategory;
                        foundationTypes.push(currentBuildingOption);
                    }
                }
                if(baseLayout.buildingsData[buildingId].category === 'extraction')
                {
                    if(baseLayout.buildingsData[buildingId].className.startsWith('/Game/FactoryGame/Buildable/Factory/Miner'))
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
            callback    : function(values)
            {
                return new Spawn_Node({
                    baseLayout          : baseLayout,
                    marker              : marker,

                    foundationType      : values.foundationType,
                    minerType           : values.minerType,

                    rotation            : parseFloat(values.rotation)
                });
            }
        });
    }
}