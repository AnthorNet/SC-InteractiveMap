import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class BaseLayout_Polygon
{
    static createBuilding(baseLayout, currentObject, markerOptions, options)
    {
        markerOptions.pathName      = currentObject.pathName;
        markerOptions.smoothFactor  = 0;

        let polygon = L.polygon(
                BaseLayout_Polygon.generateForms(baseLayout, currentObject.transform, currentObject.className, options),
                markerOptions
            );
            baseLayout.bindMouseEvents(polygon, true);

        return polygon;
    }

    static generateForms(baseLayout, transform, model, options)
    {
        let center  = [transform.translation[0], transform.translation[1]];
        let forms   = [];

        // Only used for convoyer lift orientation
        if(options.customPolygon !== undefined && options.customModel !== undefined)
        {
            model                               = options.customModel;
            baseLayout.detailedModels[model]    = {forms: [{points: options.customPolygon}]};
        }

        // Prepare high quality model
        if(((['medium', 'high'].includes(baseLayout.mapModelsQuality) && baseLayout.detailedModels !== null) || options.customPolygon !== undefined) && baseLayout.detailedModels[model] !== undefined && options.skipDetailedModel === false)
        {
            let currentModel        = baseLayout.detailedModels[model];
            let currentModelScale   = (currentModel.scale !== undefined) ? currentModel.scale : 1;
            let currentModelXOffset = (currentModel.xOffset !== undefined) ? currentModel.xOffset : 0;
            let currentModelYOffset = (currentModel.yOffset !== undefined) ? currentModel.yOffset : 0;

            // Only keep the first model form which should always give the main object outline...
            if(baseLayout.mapModelsQuality === 'medium' && options.isPattern === undefined)
            {
                currentModel.forms = [currentModel.forms[0]];
            }

            if(currentModel.formsLength === undefined)
            {
                currentModel.formsLength = currentModel.forms.length;
            }

            for(let i = 0; i < currentModel.formsLength; i++)
            {
                let currentForm         = [];
                let currentPoints       = [];
                    if(currentModel.forms[i].pointsLength === undefined)
                    {
                        currentModel.forms[i].pointsLength = currentModel.forms[i].points.length;
                    }

                for(let j = 0; j < currentModel.forms[i].pointsLength; j++)
                {
                    currentPoints.push(baseLayout.satisfactoryMap.unproject(
                        BaseLayout_Math.getPointRotation(
                            [
                                center[0] + ((currentModel.forms[i].points[j][0] + currentModelXOffset) * currentModelScale),
                                center[1] + ((currentModel.forms[i].points[j][1] + currentModelYOffset) * currentModelScale)
                            ],
                            center,
                            transform.rotation
                        )
                    ));
                }

                currentForm.push(currentPoints);

                // Only deals with form holes in high quality
                if(currentModel.forms[i].holes !== undefined && (baseLayout.mapModelsQuality === 'high' || options.isPattern !== undefined))
                {
                   if(currentModel.forms[i].holesLength === undefined)
                    {
                        currentModel.forms[i].holesLength = currentModel.forms[i].holes.length;
                    }

                    for(let j = 0; j < currentModel.forms[i].holesLength; j++)
                    {
                        let currentHole = [];

                        if(currentModel.forms[i].holes[j].holeLength === undefined)
                        {
                            currentModel.forms[i].holes[j].holeLength = currentModel.forms[i].holes[j].length;
                        }

                        for(let k = 0; k < currentModel.forms[i].holes[j].holeLength; k++)
                        {
                            currentHole.push(baseLayout.satisfactoryMap.unproject(
                                BaseLayout_Math.getPointRotation(
                                    [
                                        center[0] + ((currentModel.forms[i].holes[j][k][0] + currentModelXOffset) * currentModelScale),
                                        center[1] + ((currentModel.forms[i].holes[j][k][1] + currentModelYOffset) * currentModelScale)
                                    ],
                                    center,
                                    transform.rotation
                                )
                            ));
                        }

                        currentForm.push(currentHole);
                    }
                }

                forms.push(currentForm);
            }
        }
        else
        {
            let currentPoints = [];
                currentPoints.push(baseLayout.satisfactoryMap.unproject(
                    BaseLayout_Math.getPointRotation(
                        [(center[0] - options.xShift) - ((options.width - options.offset) / 2), center[1] - ((options.length - options.offset) / 2)],
                        center,
                        transform.rotation,
                        options.useOnly2D
                    )
                ));
                currentPoints.push(baseLayout.satisfactoryMap.unproject(
                    BaseLayout_Math.getPointRotation(
                        [(center[0] - options.xShift) + ((options.width - options.offset) / 2), center[1] - ((options.length - options.offset) / 2)],
                        center,
                        transform.rotation,
                        options.useOnly2D
                    )
                ));
                currentPoints.push(baseLayout.satisfactoryMap.unproject(
                    BaseLayout_Math.getPointRotation(
                        [(center[0] - options.xShift) + ((options.width - options.offset) / 2), center[1] + ((options.length - options.offset) / 2)],
                        center,
                        transform.rotation,
                        options.useOnly2D
                    )
                ));
                currentPoints.push(baseLayout.satisfactoryMap.unproject(
                    BaseLayout_Math.getPointRotation(
                        [(center[0] - options.xShift) - ((options.width - options.offset) / 2), center[1] + ((options.length - options.offset) / 2)],
                        center,
                        transform.rotation,
                        options.useOnly2D
                    )
                ));

            forms.push([currentPoints]);
        }

        return forms;
    }
}