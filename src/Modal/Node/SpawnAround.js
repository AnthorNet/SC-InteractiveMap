import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

import Spawn_Node                               from '../../Spawn/Node.js';

export default class Modal_Node_SpawnAround
{
    static getHTML(marker)
    {
        let baseLayout      = marker.baseLayout;

        let collectableType = baseLayout.satisfactoryMap.collectableMarkers[marker.relatedTarget.options.pathName].options.type;
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
                if(baseLayout.buildingsData[buildingId].category === 'extraction' && collectableType !== 'Desc_Geyser_C')
                {
                    if(collectableType === 'Desc_LiquidOil_C')
                    {
                        if(baseLayout.buildingsData[buildingId].className.startsWith('/Game/FactoryGame/Buildable/Factory/OilPump'))
                        {
                            minerTypes.push(currentBuildingOption);
                        }
                    }
                    else
                    {
                        if(baseLayout.buildingsData[buildingId].className.startsWith('/Game/FactoryGame/Buildable/Factory/Miner'))
                        {
                            minerTypes.push(currentBuildingOption);
                        }
                    }
                }
                else
                {
                    if(baseLayout.buildingsData[buildingId].category === 'generator' && collectableType === 'Desc_Geyser_C')
                    {
                        if(baseLayout.buildingsData[buildingId].className.startsWith('/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal'))
                        {
                            minerTypes.push(currentBuildingOption);
                        }
                    }
                }
            }

        let modalTitle = ((collectableType === 'Desc_LiquidOil_C') ? 'Spawn an Oil Extractor' : 'Spawn a Miner');
            if(collectableType === 'Desc_Geyser_C')
            {
                modalTitle = 'Spawn a Geothermal Generator';
            }

        BaseLayout_Modal.form({
            title       : modalTitle,
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
                    label       : 'Spawn count',
                    name        : 'minerCount',
                    inputType   : 'number',
                    min         : 1,
                    max         : ((collectableType === 'Desc_Geyser_C') ? 1 : 12),
                    value       : 1
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
                    minerCount          : values.minerCount,

                    rotation            : parseFloat(values.rotation)
                });
            }
        });
    }
}