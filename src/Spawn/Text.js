/* global gtag, Infinity */
import BaseLayout_Math from '../BaseLayout/Math.js';

export default class Spawn_Text
{
    constructor(options)
    {
        this.marker             = options.marker;
        this.baseLayout         = options.marker.baseLayout;

        this.line1              = options.line1;
        this.line2              = options.line2;
        this.line3              = options.line3;
        this.line4              = options.line4;
        this.line5              = options.line5;

        this.font               = options.font;
        this.letterSpacing      = options.letterSpacing;
        this.textAlign          = options.textAlign;
        this.depthAlign         = options.depthAlign;

        this.useOwnMaterials    = options.useOwnMaterials;

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);
        this.correctedCenterYaw = 0;

        let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(this.centerObject.className);
            if(currentObjectData !== null)
            {
                if(currentObjectData.mapCorrectedAngle !== undefined)
                {
                    this.correctedCenterYaw = currentObjectData.mapCorrectedAngle;
                }
            }

        if(typeof gtag === 'function')
        {
            gtag('event', 'Text', {event_category: 'Spawn'});
        }

        return this.spawn();
    }

    spawn()
    {
        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history            = [];

        return this.loadFont();
    }

    loadFont()
    {
        if(this.baseLayout.pipeLetters === null)
        {
            this.baseLayout.pipeLetters = {};
        }


        return new Promise(function(resolve){
            if(this.baseLayout.pipeLetters[this.font] === undefined)
            {
                $.getJSON(this.baseLayout.staticUrl + '/js/InteractiveMap/build/PipeFonts/' + this.font + '.json?v=' + this.baseLayout.scriptVersion, function(data)
                {
                    this.baseLayout.pipeLetters[this.font] = data;

                    $('#liveLoader').show().find('.progress-bar').css('width', '5%');
                    setTimeout(resolve, 5);
                }.bind(this));
            }
            else
            {
                $('#liveLoader').show().find('.progress-bar').css('width', '5%');
                setTimeout(resolve, 5);
            }
        }.bind(this)).then(function(){
            this.draw();
        }.bind(this));
    }

    draw()
    {
        let lineHeight      = 1200;
        let spacingWidth    = 400;
        let startOffset     = 0;

        let lines           = [];
            if(this.line1 !== '')
            {
                lines.push(Array.from(this.line1));
            }
            if(this.line2 !== '')
            {
                lines.push(Array.from(this.line2));
            }
            if(this.line3 !== '')
            {
                lines.push(Array.from(this.line3));
            }
            if(this.line4 !== '')
            {
                lines.push(Array.from(this.line4));
            }
            if(this.line5 !== '')
            {
                lines.push(Array.from(this.line5));
            }
        lines = lines.reverse();

        for(let i = 0; i < lines.length; i++)
        {
            let currentLine = lines[i];
            let textWidth   = 0;

                // Prepate text
                for(let j = 0; j < currentLine.length; j++)
                {
                    let currentSymbol = null;
                        for(let k = 0; k < this.baseLayout.pipeLetters[this.font].length; k++)
                        {
                            if(this.baseLayout.pipeLetters[this.font][k].symbol === currentLine[j].toUpperCase())
                            {
                                currentSymbol = this.baseLayout.pipeLetters[this.font][k];
                                break;
                            }
                        }

                        if(currentSymbol !== null)
                        {
                            if(currentSymbol.width === undefined)
                            {
                                let minX        = Infinity;
                                let maxX        = -Infinity;

                                for(let k = 0; k < currentSymbol.pipes.length; k++)
                                {
                                    let splineMinX = Infinity;
                                    let splineMaxX = -Infinity;

                                    for(let l = 0; l < currentSymbol.pipes[k].spline.length; l++)
                                    {
                                        splineMinX    = Math.min(splineMinX, currentSymbol.pipes[k].x);
                                        splineMaxX    = Math.max(splineMaxX, currentSymbol.pipes[k].x);
                                    }

                                    minX    = Math.min(minX, splineMinX);
                                    maxX    = Math.max(maxX, splineMaxX);
                                }

                                currentSymbol.width    = Math.abs(minX) + Math.abs(maxX) + 270; // Add pipe width
                            }

                            currentLine[j]  = currentSymbol;
                            textWidth      += currentSymbol.width + parseFloat(this.letterSpacing);
                        }
                        else
                        {
                            currentLine[j] = ' ';
                        }

                    if(currentLine[j] === ' ') // Space
                    {
                        textWidth += spacingWidth;
                    }
                }

                if(this.textAlign === 'center')
                {
                    startOffset -= textWidth / 2;
                }
                if(this.textAlign === 'right')
                {
                    startOffset -= textWidth;
                }

                // Spawn a new pipe circuit!
                let newPipeNetworkID                = this.baseLayout.getIncrementalIdFromInternalPointer('/Script/FactoryGame.FGPipeNetwork');;
                let mFluidIntegrantScriptInterfaces = {name: "mFluidIntegrantScriptInterfaces", type: "ArrayProperty", index: 0, value: {type: "InterfaceProperty", values: []}};
                let newPipeNetwork                  = {
                    type: 1,
                    className: '/Script/FactoryGame.FGPipeNetwork',
                    levelName: 'Persistent_Level',
                    pathName: 'Persistent_Level:PersistentLevel.FGPipeNetwork_' + newPipeNetworkID,
                    needTransform: 0,
                    transform: {rotation: [0, 0, 0, 1], translation: [0, 0, 0], scale3d: [1, 1, 1]},
                    wasPlacedInLevel: 0,
                    children: [],
                    properties: [{name: "mPipeNetworkID", type: "IntProperty", index: 0, value: newPipeNetworkID}, mFluidIntegrantScriptInterfaces],
                    entityLevelName: "", entityPathName: ""
                };

                this.baseLayout.saveGameParser.addObject(newPipeNetwork);

                // Spawn pipes...
                for(let j = 0; j < currentLine.length; j++)
                {
                    if(currentLine[j] === ' ')
                    {
                        startOffset += spacingWidth;
                    }
                    else
                    {
                        for(let k = 0; k < currentLine[j].pipes.length; k++)
                        {
                            let currentPipe = currentLine[j].pipes[k];
                            let newPipe     = JSON.parse(JSON.stringify({
                                    type                : 1,
                                    className           : "/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C",
                                    levelName           : "Persistent_Level",
                                    pathName            : "Persistent_Level:PersistentLevel.Build_Pipeline_C_XXX",
                                    needTransform       : 1,
                                    transform           : {rotation: [0, 0, 0, 1], translation: [], scale3d: this.centerObject.transform.scale3d},
                                    wasPlacedInLevel    : 0,
                                    children            : [],
                                    properties          : [
                                        {name: "mSplineData", type: "ArrayProperty", index: 0, value: {type: "StructProperty", values: []}, structureName: "mSplineData", structureType: "StructProperty", structureSubType: "SplinePointData"},
                                        {name: "mBuiltWithRecipe", type: "ObjectProperty", index: 0, value: {levelName: "", pathName: "/Game/FactoryGame/Recipes/Buildings/Recipe_Pipeline.Recipe_Pipeline_C"}},
                                        {name: "mBuildTimeStamp", type: "FloatProperty", index: 0, value: 0}
                                    ],
                                    entityLevelName     : "Persistent_Level",
                                    entityPathName      : "Persistent_Level:PersistentLevel.BuildableSubsystem"
                                }));
                                newPipe.pathName  = this.baseLayout.generateNewPathName(newPipe);

                                newPipe.children.push({levelName: "Persistent_Level", pathName: newPipe.pathName + ".PipelineConnection0"});
                                newPipe.children.push({levelName: "Persistent_Level", pathName: newPipe.pathName + ".PipelineConnection1"});

                            // Calculate new position
                            let centerRotation                      = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, this.correctedCenterYaw);
                            let rotation                            = BaseLayout_Math.getPointRotation(
                                    [
                                        currentPipe.x + (currentLine[j].width / 2) + startOffset + this.centerObject.transform.translation[0],
                                        currentPipe.y + this.centerObject.transform.translation[1] + parseFloat(this.depthAlign)
                                    ],
                                    this.centerObject.transform.translation,
                                    centerRotation
                                );
                                newPipe.transform.translation[0]  = rotation[0];
                                newPipe.transform.translation[1]  = rotation[1];
                                newPipe.transform.translation[2]  = currentPipe.z + this.centerObject.transform.translation[2] + (lineHeight * i);

                            // Add splines
                            for(let l = 0; l < currentPipe.spline.length; l++)
                            {
                                let currentSpline = [];

                                    for(let currentSplineProperty in currentPipe.spline[l])
                                    {
                                        let currentSplineRotation   = BaseLayout_Math.getPointRotation(
                                            [currentPipe.spline[l][currentSplineProperty].x, currentPipe.spline[l][currentSplineProperty].y],
                                            [0, 0],
                                            centerRotation
                                        );
                                        let currentSplineValue      = {x: currentSplineRotation[0], y: currentSplineRotation[1], z: currentPipe.spline[l][currentSplineProperty].z};

                                        currentSpline.push({
                                            name: currentSplineProperty,
                                            type: "StructProperty",
                                            index: 0,
                                            value: { type: "Vector", values: currentSplineValue }
                                        });
                                    }

                                newPipe.properties[0].value.values.push(currentSpline);
                            }

                            let PipelineConnection0 = {
                                    type: 0,
                                    className: "/Script/FactoryGame.FGPipeConnectionComponent",
                                    levelName: "Persistent_Level",
                                    pathName: newPipe.pathName + ".PipelineConnection0",
                                    outerPathName: newPipe.pathName,
                                    children: [],
                                    properties: [{name: "mPipeNetworkID", type: "IntProperty", index: 0, value: newPipeNetworkID}]
                                };
                            let PipelineConnection1 = {
                                    type: 0,
                                    className: "/Script/FactoryGame.FGPipeConnectionComponent",
                                    levelName: "Persistent_Level",
                                    pathName: newPipe.pathName + ".PipelineConnection1",
                                    outerPathName: newPipe.pathName,
                                    children: [],
                                    properties: [{name: "mPipeNetworkID", type: "IntProperty", index: 0, value: newPipeNetworkID}]
                                };

                            // Add to save game
                            this.baseLayout.saveGameParser.addObject(newPipe);
                            this.baseLayout.saveGameParser.addObject(PipelineConnection0);
                            this.baseLayout.saveGameParser.addObject(PipelineConnection1);
                            mFluidIntegrantScriptInterfaces.value.values.push({levelName: "Persistent_Level", pathName: newPipe.pathName});

                            let result = this.baseLayout.parseObject(newPipe);
                                this.baseLayout.addElementToLayer(result.layer, result.marker);
                        }

                        startOffset += currentLine[j].width + parseFloat(this.letterSpacing);
                    }
                }
        }

        return this.release();
    }

    release()
    {
        /*
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name: 'Undo: Spawn around (Text)',
                autoPurgeDeleteObjects: false,
                values: this.history
            });
        }
        */

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        //this.baseLayout.setBadgeLayerCount('playerFoundationsLayer');
        this.baseLayout.unpauseMap();
    }
}
