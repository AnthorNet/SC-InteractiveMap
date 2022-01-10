import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

import SubSystem_Buildable                      from '../../SubSystem/Buildable.js';

import Spawn_Circle                             from '../../Spawn/Circle.js';
import Spawn_Polygon                            from '../../Spawn/Polygon.js';
import Spawn_Rectangle                          from '../../Spawn/Rectangle.js';
import Spawn_Road                               from '../../Spawn/Road.js';

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

            for(let faunaId in baseLayout.faunaData)
            {
                inputOptions.push({group: 'Fauna - ' + baseLayout.faunaCategories[baseLayout.faunaData[faunaId].category], text: baseLayout.faunaData[faunaId].name, value: faunaId});
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
                if(form !== null && form.form !== null && form.useOwnMaterials !== null)
                {
                    form.useOwnMaterials = parseInt(form.useOwnMaterials);

                    if(baseLayout.faunaData[form.form] !== undefined)
                    {
                        return baseLayout.spawnFauna(marker, form.form);
                    }
                    else
                    {
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
                                        if(values !== null && values.maxRadius !== null && values.arcAngle !== null)
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
                                        value       : 6,
                                        min         : 3,
                                        max         : 65
                                    });
                                    rectangleOptions.push({
                                        label       : 'Outer length <em class="small">(Between 3 and 65)</em>',
                                        name        : 'maxHeight',
                                        inputType   : 'number',
                                        value       : 6,
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
                                        if(values !== null && values.maxWidth !== null && values.maxHeight !== null)
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
                                        if(values !== null && values.numberOfSides !== null && values.minSize !== null && values.maxSize !== null && values.gridOverlapping !== null)
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
                                        if(values !== null && values.maxWidth !== null && values.maxHeight !== null)
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
                                    }
                                });
                                break;
                            default:
                                return;
                        }
                    }
                }
            }
        });
    }
}