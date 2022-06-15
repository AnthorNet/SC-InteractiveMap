import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

import SubSystem_Buildable                      from '../../SubSystem/Buildable.js';

import Spawn_Circle                             from '../../Spawn/Circle.js';
import Spawn_Fauna                              from '../../Spawn/Fauna.js';
import Spawn_Image                              from '../../Spawn/Image.js';
import Spawn_Polygon                            from '../../Spawn/Polygon.js';
import Spawn_Rectangle                          from '../../Spawn/Rectangle.js';
import Spawn_Road                               from '../../Spawn/Road.js';
import Spawn_Tower                              from '../../Spawn/Tower.js';

export default class Modal_Object_SpawnAround
{
    static getHTML(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let inputOptions    = [];
            inputOptions.push({group: 'Geometric form', text: 'Plain circle', value: 'plainCircle'});
            inputOptions.push({group: 'Geometric form', text: 'Hollow circle', value: 'hollowCirle'});
            inputOptions.push({group: 'Geometric form', text: 'Plain rectangle', value: 'plainRectangle'});
            inputOptions.push({group: 'Geometric form', text: 'Hollow rectangle', value: 'hollowRectangle'});
            inputOptions.push({group: 'Geometric form', text: 'Plain regular polygon', value: 'plainPolygon'});
            inputOptions.push({group: 'Geometric form', text: 'Hollow regular polygon', value: 'hollowPolygon'});
            inputOptions.push({group: 'Geometric form', text: 'Road', value: 'road'});
            inputOptions.push({group: 'Geometric form', text: 'Tower', value: 'tower'});

            inputOptions.push({group: 'Pixel Art', text: 'Import an image', value: 'importImage'});

            let faunaData = baseLayout.faunaSubsystem.data;
                for(let faunaId in faunaData)
                {
                    inputOptions.push({
                        group   : 'Fauna - ' + baseLayout.faunaSubsystem.categories[faunaData[faunaId].category],
                        text    : faunaData[faunaId].name,
                        value   : faunaData[faunaId].className
                    });
                }

        BaseLayout_Modal.form({
            title       : 'Spawn around "' + buildingData.name + '"',
            container   : '#leafletMap',
            inputs      : [
                {
                    name            : 'form',
                    inputType       : 'select',
                    inputOptions    : inputOptions
                },
                {
                    label           : 'Use materials from your containers? (Not suitable for pasting blueprints)',
                    name            : 'useOwnMaterials',
                    inputType       : 'toggle'
                }
            ],
            callback    : function(form)
            {
                form.useOwnMaterials = parseInt(form.useOwnMaterials);

                let faunaData = baseLayout.faunaSubsystem.getDataFromClassName(form.form);
                    if(faunaData !== null)
                    {
                        return BaseLayout_Modal.form({
                            title: "Fauna options",
                            container: '#leafletMap',
                            inputs: [
                                {
                                    label       : 'Spawn quantity <em class="small">(Between 1 and 256)</em>',
                                    name        : 'qty',
                                    inputType   : 'number',
                                    value       : 1,
                                    min         : 1,
                                    max         : 256
                                },
                                {
                                    label       : 'Spawn radius <em class="small">(Between 400 and 3200)</em>',
                                    name        : 'maxRadius',
                                    inputType   : 'number',
                                    value       : 400,
                                    min         : 400,
                                    max         : 3200
                                }
                            ],
                            callback: function(values)
                            {
                                return new Spawn_Fauna({
                                    marker          : marker,
                                    faunaData       : faunaData,
                                    qty             : values.qty,
                                    maxRadius       : values.maxRadius,
                                });
                            }
                        });
                    }

                switch(form.form)
                {
                    case 'plainCircle':
                    case 'hollowCirle':
                        let circleOptions = [];
                            circleOptions.push({
                                label       : 'Outer radius <em class="small">(Between 3 and 256)</em>',
                                name        : 'maxRadius',
                                inputType   : 'number',
                                value       : 6,
                                min         : 3,
                                max         : 256
                            });

                        if(form.form === 'hollowCirle')
                        {
                            circleOptions.push({
                                label       : 'Inner radius <em class="small">(Between 3 and 255)</em>',
                                name        : 'minRadius',
                                inputType   : 'number',
                                value       : 6,
                                min         : 3,
                                max         : 255
                            });
                        }

                        circleOptions.push({
                            label       : 'Arc angle <em class="small">(From 0 to 360°, clockwise)</em>',
                            name        : 'arcAngle',
                            inputType   : 'number',
                            value       : 360,
                            min         : 0,
                            max         : 360
                        });

                        if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_') === true || currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble') === true)
                        {
                            circleOptions.push({
                                label           : 'Direction',
                                name            : 'direction',
                                inputType       : 'select',
                                inputOptions    : [
                                    {text: 'Up', value: 'UP'},
                                    {text: 'Down', value: 'DOWN'}
                                ]
                            });
                        }

                        BaseLayout_Modal.form({
                            title: "Circle options",
                            container: '#leafletMap',
                            inputs: circleOptions,
                            callback: function(values)
                            {
                                if(form.form === 'hollowCirle')
                                {
                                    if(values.minRadius === null)
                                    {
                                        return;
                                    }

                                    values.minRadius = Math.max(3, Math.min(values.minRadius, values.maxRadius));
                                }
                                else
                                {
                                    values.minRadius = 1;
                                }

                                return new Spawn_Circle({
                                    marker          : marker,
                                    minRadius       : values.minRadius,
                                    maxRadius       : values.maxRadius,
                                    arcAngle        : values.arcAngle,
                                    direction       : values.direction,
                                    useOwnMaterials : form.useOwnMaterials
                                });
                            }
                        });
                        break;
                    case 'plainRectangle':
                    case 'hollowRectangle':
                        let rectangleOptions = [];
                            rectangleOptions.push({
                                label       : 'Outer width <em class="small">(Between 3 and 65)</em>',
                                name        : 'maxWidth',
                                inputType   : 'number',
                                value       : 7,
                                min         : 3,
                                max         : 65
                            });
                            rectangleOptions.push({
                                label       : 'Outer length <em class="small">(Between 3 and 65)</em>',
                                name        : 'maxHeight',
                                inputType   : 'number',
                                value       : 7,
                                min         : 3,
                                max         : 65
                            });

                        if(form.form === 'hollowRectangle')
                        {
                            rectangleOptions.push({
                                label       : 'Inner width <em class="small">(Between 3 and 63)</em>',
                                name        : 'minWidth',
                                inputType   : 'number',
                                value       : 3,
                                min         : 3,
                                max         : 63
                            });
                            rectangleOptions.push({
                                label       : 'Inner length <em class="small">(Between 3 and 63)</em>',
                                name        : 'minHeight',
                                inputType   : 'number',
                                value       : 3,
                                min         : 3,
                                max         : 63
                            });
                        }

                        if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_') === true || currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble') === true)
                        {
                            rectangleOptions.push({
                                label           : 'Direction',
                                name            : 'direction',
                                inputType       : 'select',
                                inputOptions    : [
                                    {text: 'Up', value: 'UP'},
                                    {text: 'Down', value: 'DOWN'}
                                ]
                            });
                        }

                        BaseLayout_Modal.form({
                            title: "Rectangle options",
                            container: '#leafletMap',
                            inputs: rectangleOptions,
                            callback: function(values)
                            {
                                if(form.form === 'hollowRectangle')
                                {
                                    if(values.minWidth === null || values.minHeight === null)
                                    {
                                        return;
                                    }

                                    values.minWidth     = Math.max(1, Math.min(values.minWidth, values.maxWidth - 2));
                                    values.minHeight    = Math.max(1, Math.min(values.minHeight, values.maxHeight - 2));
                                }
                                else
                                {
                                    values.minWidth     = 1;
                                    values.minHeight    = 1;
                                }

                                return new Spawn_Rectangle({
                                    marker          : marker,
                                    minWidth        : values.minWidth,
                                    maxWidth        : values.maxWidth,
                                    minHeight       : values.minHeight,
                                    maxHeight       : values.maxHeight,
                                    useOwnMaterials : form.useOwnMaterials
                                });
                            }
                        });
                        break;
                    case 'plainPolygon':
                    case 'hollowPolygon':
                        let polygonOptions  = [];
                        let inputOptions    = [];
                            inputOptions.push({text: 'Triangle - 3 sides', value: 3});
                            inputOptions.push({text: 'Pentagon - 5 sides', value: 5});
                            inputOptions.push({text: 'Hexagon - 6 sides', value: 6});
                            inputOptions.push({text: 'Heptagon - 7 sides', value: 7});
                            inputOptions.push({text: 'Octagon - 8 sides', value: 8});
                            inputOptions.push({text: 'Nonagon - 9 sides', value: 9});
                            inputOptions.push({text: 'Decagon - 10 sides', value: 10});
                            inputOptions.push({text: 'Hendecagon - 11 sides', value: 11});
                            inputOptions.push({text: 'Dodecagon - 12 sides', value: 12});

                            polygonOptions.push({
                                label           : 'Number of sides',
                                name            : 'numberOfSides',
                                inputType       : 'select',
                                inputOptions    : inputOptions,
                                value           : 6
                            });
                            polygonOptions.push({
                                label       : 'Apothem length <em class="small">(Between 3 and 65)</em>',
                                name        : 'maxSize',
                                inputType   : 'number',
                                value       : 6,
                                min         : 3,
                                max         : 65
                            });

                            if(form.form === 'hollowPolygon')
                            {
                                polygonOptions.push({
                                    label       : 'Inner apothem length <em class="small">(Between 3 and 63)</em>',
                                    name        : 'minSize',
                                    inputType   : 'number',
                                    value       : 3,
                                    min         : 3,
                                    max         : 63
                                });
                            }

                            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_') === true || currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble') === true)
                            {
                                polygonOptions.push({
                                    label           : 'Direction',
                                    name            : 'direction',
                                    inputType       : 'select',
                                    inputOptions    : [
                                        {text: 'Up', value: 'UP'},
                                        {text: 'Down', value: 'DOWN'}
                                    ]
                                });
                            }

                            polygonOptions.push({
                                label           : 'Minimize grid overlapping',
                                name            : 'gridOverlapping',
                                inputType       : 'toggle',
                                value           : 1
                            });

                        BaseLayout_Modal.form({
                            title       : "Polygon options",
                            container   : '#leafletMap',
                            inputs      : polygonOptions,
                            callback    : function(values)
                            {
                                if(form.form !== 'hollowPolygon')
                                {
                                    values.minSize = 1;
                                }

                                return new Spawn_Polygon({
                                    marker          : marker,

                                    numberOfSides   : values.numberOfSides,
                                    minSize         : values.minSize,
                                    maxSize         : values.maxSize,
                                    direction       : values.direction,
                                    gridOverlapping : values.gridOverlapping,

                                    useOwnMaterials : form.useOwnMaterials
                                });
                            }
                        });
                        break;
                    case 'road':
                        let roadOptions = [];
                            roadOptions.push({
                                label       : 'Width <em class="small">(Between 1 and 255)</em>',
                                name        : 'maxWidth',
                                inputType   : 'number',
                                value       : 2,
                                min         : 1,
                                max         : 255
                            });
                            roadOptions.push({
                                label       : 'Length <em class="small">(Between 1 and 255)</em>',
                                name        : 'maxHeight',
                                inputType   : 'number',
                                value       : 16,
                                min         : 1,
                                max         : 255
                            });
                            roadOptions.push({
                                label       : 'Step <em class="small">(Between 1 and 255)</em>',
                                name        : 'step',
                                inputType   : 'number',
                                value       : 1,
                                min         : 1,
                                max         : 255
                            });

                            roadOptions.push({
                                label           : 'Direction',
                                name            : 'direction',
                                inputType       : 'select',
                                inputOptions    : [
                                    {text: 'Up', value: 'UP'},
                                    {text: 'Down', value: 'DOWN'}
                                ]
                            });
                            roadOptions.push({
                                label       : 'Curvature <em class="small">(Between -360 and 360°)</em>',
                                name        : 'curvature',
                                inputType   : 'number',
                                value       : 0,
                                min         : -360,
                                max         : 360
                            });

                        BaseLayout_Modal.form({
                            title       : "Road options",
                            container   : '#leafletMap',
                            inputs      : roadOptions,
                            callback    : function(values)
                            {
                                return new Spawn_Road({
                                    marker          : marker,
                                    maxWidth        : values.maxWidth,
                                    maxHeight       : values.maxHeight,
                                    step            : values.step,
                                    direction       : values.direction,
                                    curvature       : values.curvature,
                                    useOwnMaterials : form.useOwnMaterials
                                });
                            }
                        });
                        break;
                    case 'tower':
                        let wallTypes       = [];
                            for(let buildingId in baseLayout.buildingsData)
                            {
                                let currentBuildingOption = {
                                        dataContent : '<img src="' + baseLayout.buildingsData[buildingId].image + '" style="width: 48px;" class="py-2 mr-1" /> ' + baseLayout.buildingsData[buildingId].name,
                                        value       : baseLayout.buildingsData[buildingId].className,
                                        text        : baseLayout.buildingsData[buildingId].name
                                    }
                                if(baseLayout.buildingsData[buildingId].category === 'wall')
                                {
                                    if(
                                            baseLayout.buildingsData[buildingId].className.includes('_Angular_') === false
                                         && baseLayout.buildingsData[buildingId].className.includes('_Corner_') === false
                                         && baseLayout.buildingsData[buildingId].className.includes('_Tris_') === false
                                         && baseLayout.buildingsData[buildingId].className.includes('_FlipTris_') === false
                                         && baseLayout.buildingsData[buildingId].className.includes('_Conveyor_') === false
                                         && baseLayout.buildingsData[buildingId].className.includes('_ConveyorHole_') === false
                                         && baseLayout.buildingsData[buildingId].className.includes('Door_') === false
                                         && baseLayout.buildingsData[buildingId].className.includes('_Gate_') === false
                                    )
                                    {
                                        currentBuildingOption.group = baseLayout.buildingsData[buildingId].subCategory;
                                        wallTypes.push(currentBuildingOption);
                                    }
                                }
                            }

                        let towerOptions = [];
                            towerOptions.push({
                                label       : 'Width <em class="small">(Between 3 and 65)</em>',
                                name        : 'maxWidth',
                                inputType   : 'number',
                                value       : 7,
                                min         : 3,
                                max         : 65
                            });
                            towerOptions.push({
                                label       : 'Length <em class="small">(Between 3 and 65)</em>',
                                name        : 'maxHeight',
                                inputType   : 'number',
                                value       : 7,
                                min         : 3,
                                max         : 65
                            });
                            towerOptions.push({
                                label       : 'Floors <em class="small">(Between 1 and 256)</em>',
                                name        : 'maxFloor',
                                inputType   : 'number',
                                value       : 3,
                                min         : 1,
                                max         : 256
                            });
                            towerOptions.push({
                                label       : 'Floor height <em class="small">(Between 1 and 24)</em>',
                                name        : 'floorHeight',
                                inputType   : 'number',
                                value       : 3,
                                min         : 1,
                                max         : 24
                            });
                            towerOptions.push({
                                label       : 'Foudation rotation <em class="small">(Between -30 and 30)</em>',
                                name        : 'foundationRotation',
                                inputType   : 'number',
                                value       : 1,
                                min         : -30,
                                max         : 30
                            });

                            towerOptions.push({
                                label           : 'Wall type',
                                name            : 'wallType',
                                inputType       : 'selectPicker',
                                inputHeight     : true,
                                inputOptions    : wallTypes,
                                value           : '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Window_Thin_8x4_02.Build_Wall_Window_Thin_8x4_02_C'
                            });
                            towerOptions.push({
                                label           : 'Wall corner type',
                                name            : 'wallCornerType',
                                inputType       : 'selectPicker',
                                inputHeight     : true,
                                inputOptions    : wallTypes,
                                value           : '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_8x4_01.Build_Wall_8x4_01_C'
                            });
                            towerOptions.push({
                                label       : 'Wall rotation <em class="small">(Between -30 and 30)</em>',
                                name        : 'wallRotation',
                                inputType   : 'number',
                                value       : 1,
                                min         : -30,
                                max         : 30
                            });

                        BaseLayout_Modal.form({
                            title       : 'Tower options',
                            message     : 'Floor foundation type will be the one you are spawning on.',
                            container   : '#leafletMap',
                            inputs      : towerOptions,
                            callback: function(values)
                            {
                                return new Spawn_Tower({
                                    marker              : marker,
                                    maxWidth            : values.maxWidth,
                                    maxHeight           : values.maxHeight,

                                    maxFloor            : values.maxFloor,
                                    floorHeight         : values.floorHeight,

                                    foundationRotation  : values.foundationRotation,
                                    wallType            : values.wallType,
                                    wallCornerType      : values.wallCornerType,
                                    wallRotation        : values.wallRotation,

                                    useOwnMaterials     : form.useOwnMaterials
                                });
                            }
                        });
                        break;

                    case 'importImage':
                        let imageOptions = [];
                            imageOptions.push({
                                label       : 'Image <em class="small">(JPG/PNG)</em>',
                                name        : 'imageFile',
                                inputType   : 'file'
                            });
                            imageOptions.push({
                                label       : 'Support type',
                                name        : 'supportId',
                                inputType   : 'select',
                                inputOptions: [
                                    {group: 'Best performance', text: baseLayout.buildingsData.Build_Beam_Painted_C.name + ' (Side)', value: 'Build_Beam_Painted_C|0'},
                                    {group: 'Best performance', text: baseLayout.buildingsData.Build_Beam_Painted_C.name + ' (Face)', value: 'Build_Beam_Painted_C|90'},
                                    {group: 'Slow performance (Limited to 64px)', text: baseLayout.buildingsData.Build_StandaloneWidgetSign_Square_Tiny_C.name, value: 'Build_StandaloneWidgetSign_Square_Tiny_C|0'},
                                    {group: 'Slow performance (Limited to 64px)', text: baseLayout.buildingsData.Build_StandaloneWidgetSign_Square_Small_C.name, value: 'Build_StandaloneWidgetSign_Square_Small_C|0'},
                                    {group: 'Slow performance (Limited to 64px)', text: baseLayout.buildingsData.Build_StandaloneWidgetSign_Square_C.name, value: 'Build_StandaloneWidgetSign_Square_C|0'}
                                ],
                                value       : 'Build_Beam_Painted_C|90'
                            });

                        BaseLayout_Modal.form({
                            title       : "Import image options",
                            message     : '<div class="alert alert-warning">Signs can be very taxing on your GPU and get the game lags a lot. They also use a lot of uObject so be careful. Beams don\'t have that problem at all and performs very well.<br /><br />1px is equivalent to 1m.</div>',
                            container   : '#leafletMap',
                            inputs      : imageOptions,
                            callback    : function(values)
                            {
                                return new Spawn_Image({
                                    marker          : marker,
                                    imageFile       : values.imageFile,
                                    supportId       : values.supportId,
                                    useOwnMaterials : form.useOwnMaterials
                                });
                            }
                        });
                        break;

                    default:
                        return;
                }
            }
        });
    }
}