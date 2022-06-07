/* global Sentry */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Building_Sign
{
    static getConversionIcons(){
        return {
            16: 514,    17: 386,    39: 384,    40: 385,    127: 408,
            128: 409,   129: 410,   130: 411,   131: 412,
            132: 413,   143: 433,   144: 434,   145: 435,
            146: 441,   150: 448,   151: 449,   152: 450,
            153: 451,   154: 452,   155: 453,   156: 454,
            157: 455,   158: 456,   377: 619,
        }
    }

    static get getOtherIcons(){
        return {
            599: ['Emote Build Gun Spin', '/img/signIcons/Emote_BuildGunSpin_256.png'],
            600: ['Emote Clap', '/img/signIcons/Emote_Clap_256.png'],
            601: ['Emote Face Palm', '/img/signIcons/IconDesc_EmoteFacepalm_256.png'],
            602: ['Emote Heart', '/img/signIcons/IconDesc_EmoteHeart_256.png'],
            603: ['Emote Paper', '/img/signIcons/IconDesc_EmotePaper_256.png'],
            604: ['Emote Rock', '/img/signIcons/IconDesc_EmoteRock_256.png'],
            605: ['Emote Scissors', '/img/signIcons/IconDesc_EmoteScissors_256.png'],
            606: ['Emote Point', '/img/signIcons/IconDesc_EmotePoint_256.png'],
            607: ['Emote Wave', '/img/signIcons/IconDesc_EmoteWave_256.png'],

            608: ['Checkit', '/img/signIcons/TXUI_Checkit_256.png'],
            609: ['Lizard Doggo', '/img/signIcons/TXUI_LizardDoggo_256.png'],

            614: ['FICMAS Berries', '/img/signIcons/TXUI_Ficsmas_Berries.png'],
            615: ['FICMAS Check', '/img/signIcons/TXUI_Ficsmas_Check.png'],
            616: ['FICMAS Checkit', '/img/signIcons/TXUI_Ficsmas_Checkit.png'],
            617: ['FICMAS Gift', '/img/signIcons/TXUI_FicsMas_Present.png']
        };
    }

    static get getMonochromeIcons(){
        return {
            329: ['Arrow Down', '/img/signIcons/TXUI_MIcon_Arrow_Down.png'],
            330: ['Arrow Down Left', '/img/signIcons/TXUI_MIcon_Arrow_DownLeft.png'],
            331: ['Arrow Down Right', '/img/signIcons/TXUI_MIcon_Arrow_DownRight.png'],
            332: ['Arrow Left', '/img/signIcons/TXUI_MIcon_Arrow_Left.png'],
            333: ['Arrow Up Left', '/img/signIcons/TXUI_MIcon_Arrow_UpLeft.png'],
            334: ['Arrow Up', '/img/signIcons/TXUI_MIcon_Arrow_Up.png'],
            335: ['Arrow Up Right', '/img/signIcons/TXUI_MIcon_Arrow_UpRight.png'],
            336: ['Arrow Right', '/img/signIcons/TXUI_MIcon_Arrow_Right.png'],

            337: ['Drop', '/img/signIcons/TXUI_MIcon_Drop.png'],
            338: ['Radiation', '/img/signIcons/TXUI_MIcon_Radiation.png'],
            339: ['Thumb Up', '/img/signIcons/TXUI_MIcon_ThumbUp.png'],
            340: ['Thumb Down', '/img/signIcons/TXUI_MIcon_ThumbDown.png'],
            341: ['Stop X', '/img/signIcons/TXUI_MIcon_Stop_X.png'],

            342: ['Road Arrow Down', '/img/signIcons/TXUI_MIcon_RoadArrow_Down.png'],
            343: ['Road Arrow Turn Around', '/img/signIcons/TXUI_MIcon_RoadArrow_TurnAround.png'],
            344: ['Road Arrow Turn Left', '/img/signIcons/TXUI_MIcon_RoadArrow_TurnLeft.png'],
            345: ['Road Arrow Turn Right', '/img/signIcons/TXUI_MIcon_RoadArrow_TurnRight.png'],
            346: ['Road Arrow Up', '/img/signIcons/TXUI_MIcon_RoadArrow_Up.png'],

            347: ['Storage Crate', '/img/signIcons/TXUI_MIcon_Crate.png'],
            348: ['Exit Door', '/img/signIcons/TXUI_MIcon_Exit.png'],
            349: ['Factory', '/img/signIcons/TXUI_MIcon_Factory.png'],
            350: ['Home House', '/img/signIcons/TXUI_MIcon_Home.png'],
            351: ['Player Pioneer', '/img/signIcons/TXUI_MIcon_Pioneer.png'],
            352: ['Power', '/img/signIcons/TXUI_MIcon_Power.png'],

            353: ['Vehicle Tractor', '/img/signIcons/TXUI_MIcon_Tractor.png'],
            354: ['Vehicle Explorer', '/img/signIcons/TXUI_MIcon_Explorer.png'],
            355: ['Vehicle Truck', '/img/signIcons/TXUI_MIcon_Truck.png'],
            356: ['Vehicle Train', '/img/signIcons/TXUI_MIcon_Train.png'],
            357: ['Vehicle Factory Cart', '/img/signIcons/TXUI_MIcon_FactoryCart.png'],
            358: ['Vehicle Drone', '/img/signIcons/TXUI_MIcon_Drone.png'],

            362: ['Warning', '/img/signIcons/TXUI_MIcon_Warning.png'],

            598: ['FICSIT Check Mark', '/img/signIcons/ficsit_checkmark_64.png'],

            644: ['Recycle', '/img/signIcons/TXUI_MIcon_Recycle.png'],
            645: ['Trash', '/img/signIcons/TXUI_MIcon_Trash.png']
        };
    }

    static get getBackgroundIcons(){
        return {
            363: ['Background Blueprint Grid', '/img/signIcons/TXUI_MIcon_BG_BlueprintGrid.png'],
            364: ['Background Grid', '/img/signIcons/TXUI_MIcon_BG_Grid.png'],
            365: ['Background Checkered', '/img/signIcons/TXUI_MIcon_BG_Checkered.png'],
            366: ['Background Diagonal Lines', '/img/signIcons/TXUI_MIcon_BG_DiagonalLines.png'],
            367: ['Background Dots', '/img/signIcons/TXUI_MIcon_BG_Dots.png'],
            368: ['Background Rectangles', '/img/signIcons/TXUI_MIcon_BG_Rectangles.png'],

            369: ['None', '/img/signIcons/TXUI_MIcon_None.png'],

            370: ['Radial Gradient', '/img/signIcons/radialGradient.png'],
            371: ['Waves', '/img/signIcons/waves.png'],
            372: ['Vertical Gradient', '/img/signIcons/verticalGradient.png'],
            373: ['Horizontal Gradient', '/img/signIcons/horizontalGradient.png'],

            374: ['FICSIT Check Mark', '/img/signIcons/ficsit_checkmark_64.png'],
            375: ['FICSIT', '/img/signIcons/Ficsit_Monochrome_Logo.png'],

            610: ['FICMAS Logo', '/img/signIcons/TXUI_Ficsmas_Logo.png'],
            611: ['FICMAS Snowflake', '/img/signIcons/TXUI_Ficsmas_Snowflake.png'],
            612: ['FICSIT Check Snowflake', '/img/signIcons/TXUI_Ficsmas_Snowflakes.png'],
            613: ['FICMAS Wraping Paper', '/img/signIcons/TXUI_Ficsmas_WrappingPaper.png'],
            618: ['FICMAS Ugly Sweater', '/img/signIcons/TXUI_Ficsmas_UglySweater.png'],
        };
    }

    static getAvailableLayouts(currentObject)
    {
        let layoutPool = [
            {
                classNames  : [
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_Square_Tiny.Build_StandaloneWidgetSign_Square_Tiny_C',
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_Square_Small.Build_StandaloneWidgetSign_Square_Small_C',
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_Square.Build_StandaloneWidgetSign_Square_C'
                ],
                layouts     : [
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_0.BPW_Sign1x1_0_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_1.BPW_Sign1x1_1_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_2.BPW_Sign1x1_2_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_3.BPW_Sign1x1_3_C'
                ]
            },
            {
                classNames  : [
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_Portrait.Build_StandaloneWidgetSign_Portrait_C'
                ],
                layouts     : [
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_0.BPW_Sign2x3_0_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_1.BPW_Sign2x3_1_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_2.BPW_Sign2x3_2_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_3.BPW_Sign2x3_3_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_4.BPW_Sign2x3_4_C'
                ]
            },
            {
                classNames  : [
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_Small.Build_StandaloneWidgetSign_Small_C',
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_SmallWide.Build_StandaloneWidgetSign_SmallWide_C',
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_SmallVeryWide.Build_StandaloneWidgetSign_SmallVeryWide_C'
                ],
                layouts     : [
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_1.BPW_Sign4x1_1_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_2.BPW_Sign4x1_2_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_3.BPW_Sign4x1_3_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_4.BPW_Sign4x1_4_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_5.BPW_Sign4x1_5_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_6.BPW_Sign4x1_6_C'
                ]
            },
            {
                classNames  : [
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_Medium.Build_StandaloneWidgetSign_Medium_C',
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_Large.Build_StandaloneWidgetSign_Large_C',
                    '/Game/FactoryGame/Buildable/Factory/SignDigital/Build_StandaloneWidgetSign_Huge.Build_StandaloneWidgetSign_Huge_C'
                ],
                layouts     : [
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_1.BPW_Sign2x1_1_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_2.BPW_Sign2x1_2_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_4.BPW_Sign2x1_4_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_5.BPW_Sign2x1_5_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_9.BPW_Sign2x1_9_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_10.BPW_Sign2x1_10_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_12.BPW_Sign2x1_12_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_13.BPW_Sign2x1_13_C',
                    '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_14.BPW_Sign2x1_14_C'
                ]
            }
        ];

        for(let i = 0; i < layoutPool.length; i++)
        {
            if(layoutPool[i].classNames.includes(currentObject.className))
            {
                return layoutPool[i].layouts;
            }
        }

        return null;
    }

    static getBackgroundColor(baseLayout, currentObject)
    {
        let mBackgroundColor = baseLayout.getObjectProperty(currentObject, 'mBackgroundColor');
            if(mBackgroundColor !== null)
            {
                return 'rgb(' + BaseLayout_Math.linearColorToRGB(mBackgroundColor.values.r) + ', ' + BaseLayout_Math.linearColorToRGB(mBackgroundColor.values.g) + ', ' + BaseLayout_Math.linearColorToRGB(mBackgroundColor.values.b) + ')';
            }

        return '#000000';
    }

    static getAuxilaryColor(baseLayout, currentObject)
    {
        let mAuxilaryColor = baseLayout.getObjectProperty(currentObject, 'mAuxilaryColor');
            if(mAuxilaryColor !== null)
            {
                return 'rgb(' + BaseLayout_Math.linearColorToRGB(mAuxilaryColor.values.r) + ', ' + BaseLayout_Math.linearColorToRGB(mAuxilaryColor.values.g) + ', ' + BaseLayout_Math.linearColorToRGB(mAuxilaryColor.values.b) + ')';
            }

        return '#000000';
    }

    static getForegroundColor(baseLayout, currentObject)
    {
        let mForegroundColor = baseLayout.getObjectProperty(currentObject, 'mForegroundColor');
            if(mForegroundColor !== null)
            {
                return 'rgb(' + BaseLayout_Math.linearColorToRGB(mForegroundColor.values.r) + ', ' + BaseLayout_Math.linearColorToRGB(mForegroundColor.values.g) + ', ' + BaseLayout_Math.linearColorToRGB(mForegroundColor.values.b) + ')';
            }

        return '#FA9549';
    }

    static getIconID(baseLayout, currentObject, elementName = 'Icon')
    {
        let mPrefabIconElementSaveData = baseLayout.getObjectProperty(currentObject, 'mPrefabIconElementSaveData');
            if(mPrefabIconElementSaveData !== null)
            {
                for(let i = 0; i < mPrefabIconElementSaveData.values.length; i++)
                {
                    let currentValues   = mPrefabIconElementSaveData.values[i];
                    let currentName     = null;
                    let iconId          = null;
                        for(let j = 0; j < currentValues.length; j++)
                        {
                            if(currentValues[j].name === 'ElementName')
                            {
                                currentName = currentValues[j].value;
                            }
                            if(currentValues[j].name === 'IconID')
                            {
                                iconId      = currentValues[j].value;

                                // Those icons will likely be hidden at some point... Use more recent one.
                                if(Building_Sign.getConversionIcons[iconId] !== undefined)
                                {
                                    iconId = Building_Sign.getConversionIcons[iconId];
                                }
                            }
                        }

                        if(currentName !== null && iconId !== null && currentName === elementName)
                        {
                            return iconId;
                        }
                }
            }

        return null;
    }

    static getIconSrc(baseLayout, currentObject, elementName = 'Icon')
    {
        let iconId = Building_Sign.getIconID(baseLayout, currentObject, elementName);
            if(iconId !== null)
            {
                if(iconId === 369) // Transparent (None) icon, so no drop shadow!
                {
                    return baseLayout.staticUrl + Building_Sign.getBackgroundIcons[369][1];
                }

                if(Building_Sign.getMonochromeIcons[iconId] !== undefined)
                {
                    return [baseLayout.staticUrl + Building_Sign.getMonochromeIcons[iconId][1]];
                }
                if(Building_Sign.getBackgroundIcons[iconId] !== undefined)
                {
                    return [baseLayout.staticUrl + Building_Sign.getBackgroundIcons[iconId][1]];
                }
                if(Building_Sign.getOtherIcons[iconId] !== undefined)
                {
                    return baseLayout.staticUrl + Building_Sign.getOtherIcons[iconId][1];
                }

                return baseLayout.getIconSrcFromId(iconId);
            }

        return null;
    }

    static getOtherIconSrc(baseLayout, currentObject)
    {
        return Building_Sign.getIconSrc(baseLayout, currentObject, 'Other_Icon');
    }

    static getBackgroundIconSrc(baseLayout, currentObject)
    {
        return Building_Sign.getIconSrc(baseLayout, currentObject, '{BG}Background');
    }

    static getLabel(baseLayout, currentObject)
    {
        return Building_Sign.getText(baseLayout, currentObject, 'Label', 'A');
    }

    static getOther0(baseLayout, currentObject)
    {
        return Building_Sign.getText(baseLayout, currentObject, 'Other_0', 'Other Text');
    }

    static getOther1(baseLayout, currentObject)
    {
        return Building_Sign.getText(baseLayout, currentObject, 'Other_1', '10');
    }

    static getText(baseLayout, currentObject, elementName = 'Name', defaultName = 'Shennanigans')
    {
        let mPrefabTextElementSaveData = baseLayout.getObjectProperty(currentObject, 'mPrefabTextElementSaveData');
            if(mPrefabTextElementSaveData !== null)
            {
                for(let i = 0; i < mPrefabTextElementSaveData.values.length; i++)
                {
                    let currentValues   = mPrefabTextElementSaveData.values[i];
                    let currentName     = null;
                    let text            = null;
                        for(let j = 0; j < currentValues.length; j++)
                        {
                            if(currentValues[j].name === 'ElementName')
                            {
                                currentName = currentValues[j].value;
                            }
                            if(currentValues[j].name === 'Text')
                            {
                                text        = currentValues[j].value;
                            }
                        }

                        if(currentName !== null && text !== null && currentName === elementName)
                        {
                            return text.replace(/\n/g, '<br />');
                        }
                }
            }

        return defaultName;
    }

    static getFilterShadow(size, shadowColor)
    {
        if(shadowColor !== null)
        {
            return 'filter:{{EXTRA_FILTER}} drop-shadow(' + size[0] + 'px ' + size[1] + 'px ' + shadowColor + ');background-position: -100%;margin-left: -100%;';
        }

        return '';
    }

    static getBackgroundTemplate(name, width, height, shadowColor, backgroundIconSrc = null)
    {
        if(name === null)
        {
            return '';
        }

        if(backgroundIconSrc !== null && Array.isArray(backgroundIconSrc))
        {
            let backgroundSize      = 64;
                backgroundIconSrc   = backgroundIconSrc[0];
            if(backgroundIconSrc.includes('TXUI_MIcon_BG_Rectangles'))
            {
                backgroundSize = 128;
            }

            return   '<div style="position: absolute;width: ' + width + 'px;height: ' + height + 'px;overflow: hidden;">'
                   + '    <div style="width: 640px;height: 640px;background: url(\'' + name + '\');background-size: ' + backgroundSize + 'px;' + Building_Sign.getFilterShadow([640, 640], shadowColor) + 'animation: displaySignBackground 20s infinite linear;"></div>'
                   + '</div>';
        }

        return '<div style="position: absolute;width: ' + width + 'px;height: ' + height + 'px;background: url(\'' + name + '\');background-size: 128px;"></div>';
    }

    static getImageTemplate(name, size, shadowColor)
    {
        if(name === null)
        {
            return '';
        }

        return   '<div style="display: flex;align-items: center;justify-content: center;">'
               + '    <div style="width: ' + size + 'px;height: ' + size + 'px;overflow: hidden;">'
               + '        <span style="display: block;width: ' + size + 'px;height: 100%;background-size: contain;background-image: url(\'' + name + '\');' + Building_Sign.getFilterShadow([size, 0], shadowColor) + '"></span>'
               + '    </div>'
               + '</div>';
    }

    static getActivePrefabLayout(baseLayout, currentObject)
    {
        let mActivePrefabLayout = baseLayout.getObjectProperty(currentObject, 'mActivePrefabLayout');
            if(mActivePrefabLayout !== null)
            {
                return mActivePrefabLayout.pathName;
            }

        return null;
    }

    static getLayoutTemplate(baseLayout, currentObject, pathName = null)
    {
        if(pathName === null)
        {
            pathName = Building_Sign.getActivePrefabLayout(baseLayout, currentObject);
        }

        if(pathName !== null)
        {
            let iconShadowColor             = false;
            let otherIconShadowColor        = false;
            let backgroundIconShadowColor   = false;

            let iconSrc = Building_Sign.getIconSrc(baseLayout, currentObject);
                if(Array.isArray(iconSrc))
                {
                    iconShadowColor             = true;
                }
            let otherIconSrc = Building_Sign.getOtherIconSrc(baseLayout, currentObject);
                if(Array.isArray(otherIconSrc))
                {
                    otherIconShadowColor        = true;
                }
            let backgroundIconSrc = Building_Sign.getBackgroundIconSrc(baseLayout, currentObject);
                if(Array.isArray(backgroundIconSrc))
                {
                    backgroundIconShadowColor   = true;
                }

            switch(pathName)
            {
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_0.BPW_Sign1x1_0_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 200px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 200px; height: 200px;">'
                         + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 160, ((iconShadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                         + '            </div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                 case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_1.BPW_Sign1x1_1_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 200px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 172, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_2.BPW_Sign1x1_2_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 200px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
             case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_3.BPW_Sign1x1_3_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 200px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 120px;"><strong>{{OTHER_1}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';


                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_1.BPW_Sign2x1_1_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 400px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 40px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_2.BPW_Sign2x1_2_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 400px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 96, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null)) + '</div>'
                         + '        </td>'
                         + '        <td>'
                         + '            <div style="font-size: 40px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_4.BPW_Sign2x1_4_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 400px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 128, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null)) + '</div>'
                         + '        </td>'
                         + '        <td>'
                         + '            <div style="font-size: 28px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_5.BPW_Sign2x1_5_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 400px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 196, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_9.BPW_Sign2x1_9_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 400px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 200px; height: 200px;">'
                         + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 160, ((iconShadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                         + '            </div>'
                         + '        </td>'
                         + '        <td>'
                         + '            <div style="font-size: 28px;text-align: left;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_10.BPW_Sign2x1_10_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 400px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 128, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null)) + '</div>'
                         + '        </td>'
                         + '    </tr>'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 28px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_12.BPW_Sign2x1_12_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 400px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td width="50%">'
                         + '            ' + Building_Sign.getImageTemplate('{{OTHER_ICON_SRC}}', 160, ((otherIconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                         + '        </td>'
                         + '        <td>'
                         + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 200px; height: 200px;">'
                         + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 160, ((iconShadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                         + '            </div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_13.BPW_Sign2x1_13_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 400px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td width="50%">'
                         + '            ' + Building_Sign.getImageTemplate('{{OTHER_ICON_SRC}}', 160, ((otherIconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                         + '        </td>'
                         + '        <td>'
                         + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 160, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_14.BPW_Sign2x1_14_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 400px;height: 200px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 120px;"><strong>{{OTHER_1}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';


                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_0.BPW_Sign2x3_0_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 300, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 200px;height: 300px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 200px; height: 200px;">'
                         + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 160, ((iconShadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                         + '            </div>'
                         + '        </td>'
                         + '    </tr>'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_1.BPW_Sign2x3_1_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 300, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 200px;height: 300px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 172, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                         + '        </td>'
                         + '    </tr>'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_2.BPW_Sign2x3_2_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 300, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 200px;height: 300px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 200, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                         + '        </td>'
                         + '    </tr>'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="display: flex;align-items: center;justify-content: center;">'
                         + '                <span style="display: inline-block;border-radius: 5px;background: {{FOREGROUND_COLOR}};color: {{BACKGROUND_COLOR}};font-size: 30px;padding: 5px;"><strong>{{LABEL}}</strong></span>'
                         + '            </div>'
                         + '        </td>'
                         + '    </tr>'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_3.BPW_Sign2x3_3_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 300, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 200px;height: 300px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_4.BPW_Sign2x3_4_C':
                    return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 300, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null), backgroundIconSrc)
                         + '<table style="width: 200px;height: 300px;position: relative;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 200px;"><strong>{{LABEL}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';


                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_1.BPW_Sign4x1_1_C':
                    return '<table style="width: 200px;height: 50px;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_2.BPW_Sign4x1_2_C': // Same in game but left aligned...
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_3.BPW_Sign4x1_3_C':
                    return '<table style="width: 200px;height: 50px;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 32, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                         + '        </td>'
                         + '        <td>'
                         + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_4.BPW_Sign4x1_4_C':
                    return '<table style="width: 200px;height: 50px;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="display: flex;align-items: center;justify-content: center;">'
                         + '                <span style="display: inline-block;border-radius: 5px;background: {{FOREGROUND_COLOR}};color: {{BACKGROUND_COLOR}};font-size: 20px;padding: 5px;"><strong>{{LABEL}}</strong></span>'
                         + '            </div>'
                         + '        </td>'
                         + '        <td>'
                         + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_5.BPW_Sign4x1_5_C':
                    return '<table style="width: 200px;height: 50px;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 40px; height: 40px;" class="mr-3">'
                         + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 32, ((iconShadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                         + '            </div>'
                         + '        </td>'
                         + '        <td>'
                         + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';
                case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_6.BPW_Sign4x1_6_C':
                    return '<table style="width: 200px;height: 50px;">'
                         + '    <tr>'
                         + '        <td>'
                         + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{OTHER_ICON_SRC}}', 36, ((otherIconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null)) + '</div>'
                         + '        </td>'
                         + '        <td>'
                         + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 40px; height: 40px;" class="mr-3">'
                         + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 32, ((iconShadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                         + '            </div>'
                         + '        </td>'
                         + '        <td>'
                         + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                         + '        </td>'
                         + '    </tr>'
                         + '</table>';

                default:
                    console.log('Missing sign layout: ' + pathName);
                    if(typeof Sentry !== 'undefined')
                    {
                        Sentry.setContext('currentObject', currentObject);
                        Sentry.captureMessage('Missing sign layout: ' + pathName);
                    }
            }
        }

        return '<div><strong>{{TEXT}}</strong></div>';
    }

    static getLayoutHtml(baseLayout, currentObject, pathName = null)
    {
        let backgroundColor     = Building_Sign.getBackgroundColor(baseLayout, currentObject);
        let auxilaryColor       = Building_Sign.getAuxilaryColor(baseLayout, currentObject);
        let foregroundColor     = Building_Sign.getForegroundColor(baseLayout, currentObject);

        let iconSrc             = Building_Sign.getIconSrc(baseLayout, currentObject);
            if(Array.isArray(iconSrc))
            {
                iconSrc             = iconSrc[0];
            }
        let otherIconSrc        = Building_Sign.getOtherIconSrc(baseLayout, currentObject);
            if(Array.isArray(otherIconSrc))
            {
                otherIconSrc        = otherIconSrc[0];
            }
        let backgroundIconSrc = Building_Sign.getBackgroundIconSrc(baseLayout, currentObject);
            if(Array.isArray(backgroundIconSrc))
            {
                backgroundIconSrc        = backgroundIconSrc[0];
            }

        let layoutTemplate  = Building_Sign.getLayoutTemplate(baseLayout, currentObject, pathName);
            layoutTemplate  = layoutTemplate.replace('{{ICON_SRC}}', iconSrc);
            layoutTemplate  = layoutTemplate.replace('{{OTHER_ICON_SRC}}', otherIconSrc);
            layoutTemplate  = layoutTemplate.replace('{{BACKGROUND_ICON_SRC}}', backgroundIconSrc);

            layoutTemplate  = layoutTemplate.replace('{{OTHER_0}}', Building_Sign.getOther0(baseLayout, currentObject));
            layoutTemplate  = layoutTemplate.replace('{{OTHER_1}}', Building_Sign.getOther1(baseLayout, currentObject));
            layoutTemplate  = layoutTemplate.replace('{{LABEL}}', Building_Sign.getLabel(baseLayout, currentObject));
            layoutTemplate  = layoutTemplate.replace('{{TEXT}}', Building_Sign.getText(baseLayout, currentObject));

            layoutTemplate  = layoutTemplate.replace(/{{BACKGROUND_COLOR}}/g, backgroundColor);
            layoutTemplate  = layoutTemplate.replace(/{{AUXILARY_COLOR}}/g, auxilaryColor);
            layoutTemplate  = layoutTemplate.replace(/{{FOREGROUND_COLOR}}/g, foregroundColor);

        let emissiveStyle   = '';
        let mEmissive       = baseLayout.getObjectProperty(currentObject, 'mEmissive');
            if(mEmissive !== null)
            {
                switch(mEmissive)
                {
                    case 1:
                        emissiveStyle   = 'text-shadow: 0 0 10px ' + foregroundColor + ';filter: brightness(1.5);';
                        layoutTemplate  = layoutTemplate.replace(/{{EXTRA_FILTER}}/g,  ' brightness(1.5) blur(0.5px)');
                        break;
                    case 2:
                        emissiveStyle = 'text-shadow: 0 0 20px ' + foregroundColor + ';filter: brightness(2);';
                        layoutTemplate  = layoutTemplate.replace(/{{EXTRA_FILTER}}/g,  ' brightness(2) blur(1px)');
                        break;
                    case 3:
                        emissiveStyle = 'text-shadow: 0 0 40px ' + foregroundColor + ';filter: brightness(2.5);';
                        layoutTemplate  = layoutTemplate.replace(/{{EXTRA_FILTER}}/g,  ' brightness(2.5) blur(1.5px)');
                        break;
                }
            }
            layoutTemplate  = layoutTemplate.replace(/{{EXTRA_FILTER}}/g,  '');

        return '<div class="justify-content-center align-self-center text-center">'
             + '    <div style="border-radius: 5px;background-color: ' + backgroundColor + ';color: ' + foregroundColor + ';' + emissiveStyle + 'padding: 10px;line-height: 1;" class="d-inline-block">'
             +          layoutTemplate
             + '    </div>'
             + '</div>';
    }

    static updatePrefabData(baseLayout, currentObject, propertyName, elementKey, elementName, value)
    {
        let mPropertyName = baseLayout.getObjectProperty(currentObject, propertyName);
            if(mPropertyName !== null)
            {
                for(let i = 0; i < mPropertyName.values.length; i++)
                {
                    let currentValues       = mPropertyName.values[i];
                    let currentElementName  = null;
                    let currentElement      = null;
                    let currentElementKey   = 0;
                        for(let j = 0; j < currentValues.length; j++)
                        {
                            if(currentValues[j].name === 'ElementName')
                            {
                                currentElementName  = currentValues[j].value;
                            }
                            if(currentValues[j].name === elementKey)
                            {
                                currentElement      = currentValues[j].value;
                                currentElementKey   = j;
                            }
                        }

                        if(currentElementName !== null && currentElement !== null && currentElementName === elementName)
                        {
                            mPropertyName.values[i][currentElementKey].value = value;
                            return;
                        }
                }

                // Create if don't exists
                mPropertyName.values.push([
                    {name: 'ElementName', type: 'StrProperty', value: elementName},
                    {name: elementKey, type: 'StrProperty', value: value}
                ])
            }
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        return '<div class="d-flex" style="border-radius: 5px;background: #828382;margin: -7px;padding: 6px">\
                    ' + Building_Sign.getLayoutHtml(baseLayout, currentObject) + '\
                </div>';
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let availableLayouts = Building_Sign.getAvailableLayouts(currentObject);
        let layoutTemplate   = Building_Sign.getLayoutTemplate(baseLayout, currentObject);

            if(availableLayouts !== null)
            {
                contextMenu.push({
                    icon        : 'fa-table',
                    text        : 'Update layout',
                    callback    : Building_Sign.updateLayout
                });
                contextMenu.push('-');
            }

            contextMenu.push({
                icon        : 'fa-paint-brush',
                text        : 'Update background color',
                callback    : Building_Sign.updateBackgroundColor
            });

            if(layoutTemplate.includes('{{AUXILARY_COLOR}}'))
            {
                contextMenu.push({
                    icon        : 'fa-paint-brush',
                    text        : 'Update auxilary color',
                    callback    : Building_Sign.updateAuxilaryColor
                });
            }

            contextMenu.push({
                icon        : 'fa-paint-brush',
                text        : 'Update foreground color',
                callback    : Building_Sign.updateForegroundColor
            });

            contextMenu.push('-');

            if(layoutTemplate.includes('{{TEXT}}') || layoutTemplate.includes('{{LABEL}}') || layoutTemplate.includes('{{OTHER_0}}') || layoutTemplate.includes('{{OTHER_1}}'))
            {
                if(layoutTemplate.includes('{{TEXT}}'))
                {
                    contextMenu.push({
                        icon        : 'fa-pen',
                        text        : 'Update text',
                        callback    : Building_Sign.updateText
                    });
                }
                if(layoutTemplate.includes('{{LABEL}}'))
                {
                    contextMenu.push({
                        icon        : 'fa-pen',
                        text        : 'Update label',
                        callback    : Building_Sign.updateLabel
                    });
                }
                if(layoutTemplate.includes('{{OTHER_0}}'))
                {
                    contextMenu.push({
                        icon        : 'fa-pen',
                        text        : 'Update text',
                        callback    : Building_Sign.updateOther0
                    });
                }
                if(layoutTemplate.includes('{{OTHER_1}}'))
                {
                    contextMenu.push({
                        icon        : 'fa-pen',
                        text        : 'Update text',
                        callback    : Building_Sign.updateOther1
                    });
                }

                contextMenu.push('-');
            }

            if(layoutTemplate.includes('{{ICON_SRC}}') || layoutTemplate.includes('{{OTHER_ICON_SRC}}') || layoutTemplate.includes('{{BACKGROUND_ICON_SRC}}'))
            {
                if(layoutTemplate.includes('{{ICON_SRC}}'))
                {
                    contextMenu.push({
                        icon        : 'fa-icons',
                        text        : 'Update icon',
                        callback    : Building_Sign.updateIcon
                    });
                }
                if(layoutTemplate.includes('{{OTHER_ICON_SRC}}'))
                {
                    contextMenu.push({
                        icon        : 'fa-icons',
                        text        : 'Update other icon',
                        callback    : Building_Sign.updateOtherIcon
                    });
                }
                if(layoutTemplate.includes('{{BACKGROUND_ICON_SRC}}'))
                {
                    contextMenu.push({
                        icon        : 'fa-icons',
                        text        : 'Update background',
                        callback    : Building_Sign.updateBackgroundIcon
                    });
                }

                contextMenu.push('-');
            }

            contextMenu.push({
                icon        : 'fa-adjust',
                text        : 'Update emission strength',
                callback    : Building_Sign.updateEmission
            });
            contextMenu.push({
                icon        : 'fa-border-style',
                text        : 'Update surface finish',
                callback    : Building_Sign.updateGlossiness
            });

            contextMenu.push('-');

        return contextMenu;
    }

    /**
     * MODALS LAYOUT
     */
    static updateLayout(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let availableLayouts    = Building_Sign.getAvailableLayouts(currentObject);
        let inputOptions        = [];
            for(let i = 0; i < availableLayouts.length; i++)
            {
                inputOptions.push({
                    dataContent : Building_Sign.getLayoutHtml(baseLayout, currentObject, availableLayouts[i]),
                    value       : availableLayouts[i],
                    text        : availableLayouts[i]
                });
            }


            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" layout',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mActivePrefabLayout',
                    inputHeight : true,
                    inputType   : 'selectPicker',
                    inputOptions: inputOptions,
                    value       : Building_Sign.getActivePrefabLayout(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    let mActivePrefabLayout = baseLayout.getObjectProperty(currentObject, 'mActivePrefabLayout');
                        if(mActivePrefabLayout !== null)
                        {
                            mActivePrefabLayout.pathName = values.mActivePrefabLayout;
                        }
                }
            });
    }

    /**
     * MODALS COLORS
     */
    static updateBackgroundColor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" background color',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mBackgroundColor',
                    inputType   : 'colorPicker',
                    value       : Building_Sign.getBackgroundColor(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    let mBackgroundColor = baseLayout.getObjectProperty(currentObject, 'mBackgroundColor');
                        if(mBackgroundColor !== null)
                        {
                            mBackgroundColor.values = {
                                r       : BaseLayout_Math.RGBToLinearColor(values.mBackgroundColor.r),
                                g       : BaseLayout_Math.RGBToLinearColor(values.mBackgroundColor.g),
                                b       : BaseLayout_Math.RGBToLinearColor(values.mBackgroundColor.b),
                                a       : 1
                            };
                        }
                }
            });
    }

    static updateAuxilaryColor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" auxilary color',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mAuxilaryColor',
                    inputType   : 'colorPicker',
                    value       : Building_Sign.getAuxilaryColor(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    let mAuxilaryColor = baseLayout.getObjectProperty(currentObject, 'mAuxilaryColor');
                        if(mAuxilaryColor !== null)
                        {
                            mAuxilaryColor.values = {
                                r       : BaseLayout_Math.RGBToLinearColor(values.mAuxilaryColor.r),
                                g       : BaseLayout_Math.RGBToLinearColor(values.mAuxilaryColor.g),
                                b       : BaseLayout_Math.RGBToLinearColor(values.mAuxilaryColor.b),
                                a       : 1
                            };
                        }
                }
            });
    }

    static updateForegroundColor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" foreground color',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mForegroundColor',
                    inputType   : 'colorPicker',
                    value       : Building_Sign.getForegroundColor(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    let mForegroundColor = baseLayout.getObjectProperty(currentObject, 'mForegroundColor');
                        if(mForegroundColor !== null)
                        {
                            mForegroundColor.values = {
                                r       : BaseLayout_Math.RGBToLinearColor(values.mForegroundColor.r),
                                g       : BaseLayout_Math.RGBToLinearColor(values.mForegroundColor.g),
                                b       : BaseLayout_Math.RGBToLinearColor(values.mForegroundColor.b),
                                a       : 1
                            };
                        }
                }
            });
    }

    /**
     * MODALS TEXTS
     */
    static updateText(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let text            = Building_Sign.getText(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" text',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabTextElementSaveData',
                    inputType   : 'textArea',
                    value       : text.replace(/<br \/>/g, '\n')
                }],
                callback    : function(values)
                {
                    return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabTextElementSaveData', 'Text', 'Name', values.mPrefabTextElementSaveData);
                }
            });
    }

    static updateLabel(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let text            = Building_Sign.getLabel(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" text',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabTextElementSaveData',
                    inputType   : 'textArea',
                    value       : text.replace(/<br \/>/g, '\n')
                }],
                callback    : function(values)
                {
                    return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabTextElementSaveData', 'Text', 'Label', values.mPrefabTextElementSaveData);
                }
            });
    }

    static updateOther0(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let text            = Building_Sign.getOther0(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" text',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabTextElementSaveData',
                    inputType   : 'textArea',
                    value       : text.replace(/<br \/>/g, '\n')
                }],
                callback    : function(values)
                {
                    return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabTextElementSaveData', 'Text', 'Other_0', values.mPrefabTextElementSaveData);
                }
            });
    }

    static updateOther1(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let text            = Building_Sign.getOther1(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" text',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabTextElementSaveData',
                    inputType   : 'textArea',
                    value       : text.replace(/<br \/>/g, '\n')
                }],
                callback    : function(values)
                {
                    return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabTextElementSaveData', 'Text', 'Other_1', values.mPrefabTextElementSaveData);
                }
            });
    }

    static updateEmission(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let mEmissive       = baseLayout.getObjectProperty(currentObject, 'mEmissive');

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" emission strength',
                container   : '#leafletMap',
                inputs      : [{
                    name            : 'mEmissive',
                    inputType       : 'select',
                    inputOptions    : [
                        {value: 0, text: 'Off'},
                        {value: 1, text: '1'},
                        {value: 2, text: '2'},
                        {value: 3, text: '3'}
                    ],
                    value           : mEmissive
                }],
                callback    : function(values)
                {
                    baseLayout.deleteObjectProperty(currentObject, 'mEmissive');
                    if(parseInt(values.mEmissive) !== 0)
                    {
                        baseLayout.setObjectProperty(currentObject, 'mEmissive', parseInt(values.mEmissive), 'FloatProperty');
                    }
                }
            });
    }

    static updateGlossiness(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let mGlossiness     = baseLayout.getObjectProperty(currentObject, 'mGlossiness');

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" surface finish',
                container   : '#leafletMap',
                inputs      : [{
                    name            : 'mGlossiness',
                    inputType       : 'select',
                    inputOptions    : [
                        {value: 0, text: 'Matte'},
                        {value: 1, text: 'Glossy'}
                    ],
                    value           : mGlossiness
                }],
                callback    : function(values)
                {
                    baseLayout.deleteObjectProperty(currentObject, 'mGlossiness');
                    if(parseInt(values.mGlossiness) !== 0)
                    {
                        baseLayout.setObjectProperty(currentObject, 'mGlossiness', 1, 'FloatProperty');
                    }
                }
            });
    }

    /**
     * MODALS ICONS
     */
    static generateIconOptions(baseLayout)
    {
        let options = [];

            // Buildings
            for(let key in baseLayout.buildingsData)
            {
                if(baseLayout.buildingsData[key].iconId !== undefined)
                {
                    options.push({
                        group       : 'Buildings',
                        dataContent : '<img src="' + baseLayout.buildingsData[key].image + '" style="width: 24px;" class="mr-1" /> ' + baseLayout.buildingsData[key].name,
                        value       : baseLayout.buildingsData[key].iconId,
                        text        : baseLayout.buildingsData[key].name
                    });
                }
            }

            // Parts
            for(let key in baseLayout.itemsData)
            {
                if(baseLayout.itemsData[key].iconId !== undefined)
                {
                    options.push({
                        group       : 'Parts',
                        dataContent : '<img src="' + baseLayout.itemsData[key].image + '" style="width: 24px;" class="mr-1" /> ' + baseLayout.itemsData[key].name,
                        value       : baseLayout.itemsData[key].iconId,
                        text        : baseLayout.itemsData[key].name
                    });
                }
            }

            // Equipment
            for(let key in baseLayout.toolsData)
            {
                if(baseLayout.toolsData[key].iconId !== undefined)
                {
                    options.push({
                        group       : 'Equipment',
                        dataContent : '<img src="' + baseLayout.toolsData[key].image + '" style="width: 24px;" class="mr-1" /> ' + baseLayout.toolsData[key].name,
                        value       : baseLayout.toolsData[key].iconId,
                        text        : baseLayout.toolsData[key].name
                    });
                }
            }

            // Other
            for(let key in Building_Sign.getOtherIcons)
            {
                options.push({
                    group       : 'Other',
                    dataContent : '<img src="' + Building_Sign.getOtherIcons[key][1] + '" style="width: 24px;" class="mr-1" /> ' + Building_Sign.getOtherIcons[key][0],
                    value       : key,
                    text        : Building_Sign.getOtherIcons[key][0]
                });
            }

            // Monochrome
            for(let key in Building_Sign.getMonochromeIcons)
            {
                options.push({
                    group       : 'Monochrome',
                    dataContent : '<img src="' + Building_Sign.getMonochromeIcons[key][1] + '" style="width: 24px;" class="mr-1" /> ' + Building_Sign.getMonochromeIcons[key][0],
                    value       : key,
                    text        : Building_Sign.getMonochromeIcons[key][0]
                });
            }

            // Backgrounds
            for(let key in Building_Sign.getBackgroundIcons)
            {
                options.push({
                    group       : 'Backgrounds',
                    dataContent : '<img src="' + Building_Sign.getBackgroundIcons[key][1] + '" style="width: 24px;" class="mr-1" /> ' + Building_Sign.getBackgroundIcons[key][0],
                    value       : key,
                    text        : Building_Sign.getBackgroundIcons[key][0]
                });
            }

            return options;
    };

    static updateIcon(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let options         = Building_Sign.generateIconOptions(baseLayout);
            /*
            if(baseLayout.useDebug === true)
            {
                options.push({value: 184, text: 'TEST ICON ID'});
            }
            /**/

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" icon',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabIconElementSaveData',
                    inputType   : 'selectPicker',
                    inputOptions: options,
                    value       : Building_Sign.getIconID(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabIconElementSaveData', 'IconID', 'Icon', parseInt(values.mPrefabIconElementSaveData));
                }
            });
    }

    static updateOtherIcon(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" other icon',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabIconElementSaveData',
                    inputType   : 'selectPicker',
                    inputOptions: Building_Sign.generateIconOptions(baseLayout),
                    value       : Building_Sign.getIconID(baseLayout, currentObject, 'Other_Icon')
                }],
                callback    : function(values)
                {
                    return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabIconElementSaveData', 'IconID', 'Other_Icon', parseInt(values.mPrefabIconElementSaveData));
                }
            });
    }

    static updateBackgroundIcon(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" background',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabIconElementSaveData',
                    inputType   : 'selectPicker',
                    inputOptions: Building_Sign.generateIconOptions(baseLayout),
                    value       : Building_Sign.getIconID(baseLayout, currentObject, '{BG}Background')
                }],
                callback    : function(values)
                {
                    return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabIconElementSaveData', 'IconID', '{BG}Background', parseInt(values.mPrefabIconElementSaveData));
                }
            });
    }
}