/* global gtag, FileReader, Promise */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Spawn_Image
{
    constructor(options)
    {
        this.marker                 = options.marker;
        this.baseLayout             = options.marker.baseLayout;

        let supportType             = options.supportId.split('|')
            this.supportId          = supportType[0];
            this.supportRotation    = parseInt(supportType[1]);
            this.supportClassName   = this.baseLayout.buildingsData[this.supportId].className;
            this.supportSize        = this.baseLayout.buildingsData[this.supportId].width * 100;
            this.layerId            = this.baseLayout.buildingsData[this.supportId].mapLayer;

        this.maxPixelSize           = 64;
        this.useOwnMaterials        = options.useOwnMaterials;

        if(options.imageFile.type !== undefined && ['image/jpeg', 'image/png'].includes(options.imageFile.type))
        {
            // Try to read the image data
            this.image              = document.createElement('img');

            let reader              = new FileReader();
                reader.readAsDataURL(options.imageFile);
                reader.onload       = (evt) => {
                    if(evt.target.readyState === FileReader.DONE)
                    {
                        this.image.src      = evt.target.result;
                        this.image.onload   = (e) => {
                            this.imageWidth         = e.target.naturalWidth;
                            this.imageHeight        = e.target.naturalHeight;

                            if(this.supportId !== 'Build_Beam_Painted_C')
                            {
                                if(this.imageWidth > this.maxPixelSize || this.imageHeight > this.maxPixelSize)
                                {
                                    BaseLayout_Modal.alert("Image to be big, maximum allowed is " + this.maxPixelSize + "px.");
                                    return this.release();
                                }
                            }

                            this.canvas             = document.createElement('canvas');
                            this.canvas.width       = this.imageWidth;
                            this.canvas.height      = this.imageHeight;

                            this.canvasContext      = this.canvas.getContext('2d');
                            this.canvasContext.drawImage(this.image, 0, 0);

                            this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);
                            this.centerObjectHeight = 400;
                            this.correctedCenterYaw = 0;

                            let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(this.centerObject.className);
                                if(currentObjectData !== null)
                                {
                                    if(currentObjectData.height !== undefined)
                                    {
                                        this.centerObjectHeight = currentObjectData.height * 100 / 2;
                                    }
                                    if(currentObjectData.mapCorrectedAngle !== undefined)
                                    {
                                        this.correctedCenterYaw = currentObjectData.mapCorrectedAngle;
                                    }
                                }

                                if(typeof gtag === 'function')
                                {
                                    gtag('event', 'Image', {event_category: 'Spawn'});
                                }

                            return this.spawn();
                        };
                    }
                };

                return;
        }

        BaseLayout_Modal.alert("Image could not be read.");
        return this.release();
    }

    getPointColor(x, y)
    {
        let imageData   = this.canvasContext.getImageData(x, y, 1, 1);
        let color       = {};
            color.r     = imageData.data[0];
            color.g     = imageData.data[1];
            color.b     = imageData.data[2];
            color.a     = imageData.data[3];

        return color;
    }

    spawn()
    {
        console.time('spawnImage');

        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history = [];

        return this.loop(0);
    }

    loop(x)
    {
        for(x; x < this.imageWidth; x++)
        {
            let results = [];
                for(let y = 0; y < this.imageHeight; y++)
                {
                    let result = this.spawnSupport(x, y);
                        if(result !== null)
                        {
                            results.push(result);
                        }
                }

            return Promise.all(results).then((results) => {
                for(let i = 0; i < results.length; i++)
                {
                    this.baseLayout.addElementToLayer(results[i].layer, results[i].marker);
                }
            }).finally(() => {
                window.requestAnimationFrame(() => {
                    $('#liveLoader .progress-bar').css('width', Math.round(x / this.imageWidth * 100) + '%');
                    this.loop(x+1);
                });
            });
        }

        return this.release();
    }

    spawnSupport(x, y)
    {
        let pixelColor          = this.getPointColor(x, y);
            if(pixelColor.a === 0)
            {
                return null;
            }

        let linearColor         = {
                type    : 'LinearColor',
                values  : {
                    r: BaseLayout_Math.RGBToLinearColor(pixelColor.r),
                    g: BaseLayout_Math.RGBToLinearColor(pixelColor.g),
                    b: BaseLayout_Math.RGBToLinearColor(pixelColor.b),
                    a: 1,
                }
            };

        let supportRotation     = this.correctedCenterYaw;
            if(this.supportId === 'Build_Beam_Painted_C' && this.supportRotation !== 0)
            {
                supportRotation = BaseLayout_Math.clampEulerAxis(this.correctedCenterYaw + this.supportRotation);
            }

        let newSupport          = {
                type                : 1,
                className           : this.supportClassName,
                pathName            : 'Persistent_Level:PersistentLevel.' + this.supportId + '_XXX',
                needTransform       : 1,
                transform           : {
                    rotation            : BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, supportRotation),
                    translation         : [0, 0, 0]
                },
                entity              : {pathName: 'Persistent_Level:PersistentLevel.BuildableSubsystem'},
                properties          : [
                    {name: 'mDidFirstTimeUse', type: 'BoolProperty', value: 1},
                    {name: 'mBuiltWithRecipe', type: 'ObjectProperty', value: {levelName: '', pathName: ''}},
                    {name: 'mBuildTimeStamp', type: 'FloatProperty', value: 0}
                 ]
            };

            if(this.supportId === 'Build_Beam_Painted_C')
            {
                newSupport.properties.push({name: 'mLength', type: 'FloatProperty', value: this.supportSize});
                newSupport.properties.push({name: 'mCustomizationData', type: 'StructProperty', value: {
                    type    : 'FactoryCustomizationData',
                    values  : [
                        {
                            name    : 'SwatchDesc',
                            type    : 'ObjectProperty',
                            value   : {levelName: '', pathName: '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Custom.SwatchDesc_Custom_C'}
                        },
                        {
                            name    : 'OverrideColorData',
                            type    : 'StructProperty',
                            value   : {
                                type    : 'FactoryCustomizationColorSlot',
                                values  : [{
                                    name    : 'PrimaryColor',
                                    type    : 'StructProperty',
                                    value   : linearColor
                                }]
                            }
                        }
                    ]
                }});
            }
            else
            {
                newSupport.properties.push({name: 'mActivePrefabLayout', type: 'ObjectProperty', value: {levelName: '', pathName: '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_2.BPW_Sign1x1_2_C'}});
                newSupport.properties.push({name: 'mPrefabTextElementSaveData', type: 'ArrayProperty', value: {
                    type    : 'StructProperty',
                    values  : [[
                        {name: 'ElementName', type: 'StrProperty', value: 'Name'},
                        {name: 'Text', type: 'StrProperty', value: ''},
                    ]]
                }, structureName: 'mPrefabTextElementSaveData', structureType: 'StructProperty', structureSubType: 'PrefabTextElementSaveData'});
                newSupport.properties.push({name: 'mBackgroundColor', type: 'StructProperty', value: linearColor});
            }

            newSupport.pathName    = this.baseLayout.generateFastPathName(newSupport);
                                  this.baseLayout.updateBuiltWithRecipe(newSupport);

            // Check around for materials!
            if(this.useOwnMaterials === 1)
            {
                let result = this.baseLayout.removeFromStorage(newSupport);
                    if(result === false)
                    {
                        BaseLayout_Modal.alert("We could not find enough materials and stopped your construction!");
                        return this.release(); // Don't have materials, stop it...
                    }
            }

            // Calculate support position!
            let rotation                = BaseLayout_Math.getPointRotation(
                [
                    this.centerObject.transform.translation[0] - (this.imageWidth * this.supportSize / 2) + (x * this.supportSize),
                    this.centerObject.transform.translation[1]
                ],
                this.centerObject.transform.translation,
                BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, this.correctedCenterYaw)
            );
            newSupport.transform.translation[0]  = rotation[0];
            newSupport.transform.translation[1]  = rotation[1];
            newSupport.transform.translation[2]  = this.centerObject.transform.translation[2] + (this.imageHeight * this.supportSize) - (y * this.supportSize) + this.centerObjectHeight - (this.supportSize / 2);

        return new Promise((resolve) => {
            this.baseLayout.saveGameParser.addObject(newSupport);

            this.history.push({
                pathName: newSupport.pathName,
                layerId: this.layerId,
                callback: 'deleteGenericBuilding',
                properties: {fastDelete: true}
            });

            return this.baseLayout.parseObject(newSupport, resolve);
        });
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name    : 'Undo: Spawn around (Image)',
                values  : this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount(this.layerId);

        console.timeEnd('spawnImage');
    }
}
