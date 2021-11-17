/* global Sentry */
import Modal                                    from '../Modal.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class Building_Sign
{
    static getConversionIcons(){
        return {
            17: 386,    39: 384,    40: 385,    127: 408,
            128: 409,   129: 410,   130: 411,   131: 412,
            132: 413,   143: 433,   144: 434,   145: 435,
            146: 441,   150: 448,   151: 449,   152: 450,
            153: 451,   154: 452,   155: 453,   156: 454,
            157: 455,   158: 456
        }
    }

    static get getOtherIcons(){
        return {
            599: ['Emote Build Gun Spin', '/img/patternIcons/Emote_BuildGunSpin_256.png'],
            600: ['Emote Clap', '/img/patternIcons/Emote_Clap_256.png'],
            601: ['Emote Face Palm', '/img/patternIcons/IconDesc_EmoteFacepalm_256.png'],
            602: ['Emote Heart', '/img/patternIcons/IconDesc_EmoteHeart_256.png'],
            603: ['Emote Paper', '/img/patternIcons/IconDesc_EmotePaper_256.png'],
            604: ['Emote Rock', '/img/patternIcons/IconDesc_EmoteRock_256.png'],
            605: ['Emote Scissors', '/img/patternIcons/IconDesc_EmoteScissors_256.png'],
            606: ['Emote Point', '/img/patternIcons/IconDesc_EmotePoint_256.png'],
            607: ['Emote Wave', '/img/patternIcons/IconDesc_EmoteWave_256.png'],
            608: ['Checkit', '/img/patternIcons/TXUI_Checkit_256.png'],
            609: ['Lizard Doggo', '/img/patternIcons/TXUI_LizardDoggo_256.png']
        };
    }

    static get getMonochromeIcons(){
        return {
            329: ['Arrow Down', '/img/patternIcons/TXUI_MIcon_Arrow_Down.png'],
            330: ['Arrow Down Left', '/img/patternIcons/TXUI_MIcon_Arrow_DownLeft.png'],
            331: ['Arrow Down Right', '/img/patternIcons/TXUI_MIcon_Arrow_DownRight.png'],
            332: ['Arrow Left', '/img/patternIcons/TXUI_MIcon_Arrow_Left.png'],
            333: ['Arrow Up Left', '/img/patternIcons/TXUI_MIcon_Arrow_UpLeft.png'],
            334: ['Arrow Up', '/img/patternIcons/TXUI_MIcon_Arrow_Up.png'],
            335: ['Arrow Up Right', '/img/patternIcons/TXUI_MIcon_Arrow_UpRight.png'],
            336: ['Arrow Right', '/img/patternIcons/TXUI_MIcon_Arrow_Right.png'],

            337: ['Drop', '/img/patternIcons/TXUI_MIcon_Drop.png'],
            338: ['Radiation', '/img/patternIcons/TXUI_MIcon_Radiation.png'],
            339: ['Thumb Up', '/img/patternIcons/TXUI_MIcon_ThumbUp.png'],
            340: ['Thumb Down', '/img/patternIcons/TXUI_MIcon_ThumbDown.png'],
            341: ['Stop X', '/img/patternIcons/TXUI_MIcon_Stop_X.png'],

            342: ['Road Arrow Down', '/img/patternIcons/TXUI_MIcon_RoadArrow_Down.png'],
            343: ['Road Arrow Turn Around', '/img/patternIcons/TXUI_MIcon_RoadArrow_TurnAround.png'],
            344: ['Road Arrow Turn Left', '/img/patternIcons/TXUI_MIcon_RoadArrow_TurnLeft.png'],
            345: ['Road Arrow Turn Right', '/img/patternIcons/TXUI_MIcon_RoadArrow_TurnRight.png'],
            346: ['Road Arrow Up', '/img/patternIcons/TXUI_MIcon_RoadArrow_Up.png'],

            347: ['Storage Crate', '/img/patternIcons/TXUI_MIcon_Crate.png'],
            348: ['Exit Door', '/img/patternIcons/TXUI_MIcon_Exit.png'],
            349: ['Factory', '/img/patternIcons/TXUI_MIcon_Factory.png'],
            350: ['Home House', '/img/patternIcons/TXUI_MIcon_Home.png'],
            351: ['Player Pioneer', '/img/patternIcons/TXUI_MIcon_Pioneer.png'],
            352: ['Power', '/img/patternIcons/TXUI_MIcon_Power.png'],

            353: ['Vehicle Tractor', '/img/patternIcons/TXUI_MIcon_Tractor.png'],
            354: ['Vehicle Explorer', '/img/patternIcons/TXUI_MIcon_Explorer.png'],
            355: ['Vehicle Truck', '/img/patternIcons/TXUI_MIcon_Truck.png'],
            356: ['Vehicle Train', '/img/patternIcons/TXUI_MIcon_Train.png'],
            357: ['Vehicle Factory Cart', '/img/patternIcons/TXUI_MIcon_FactoryCart.png'],
            358: ['Vehicle Drone', '/img/patternIcons/TXUI_MIcon_Drone.png'],

            362: ['Warning', '/img/patternIcons/TXUI_MIcon_Warning.png'],

            598: ['FICSIT Check Mark', '/img/patternIcons/ficsit_checkmark_64.png']
        };
    }

    static get getBackgroundIcons(){
        return {
            363: ['Background Blueprint Grid', '/img/patternIcons/TXUI_MIcon_BG_BlueprintGrid.png'],
            364: ['Background Grid', '/img/patternIcons/TXUI_MIcon_BG_Grid.png'],
            365: ['Background Checkered', '/img/patternIcons/TXUI_MIcon_BG_Checkered.png'],
            366: ['Background Diagonal Lines', '/img/patternIcons/TXUI_MIcon_BG_DiagonalLines.png'],
            367: ['Background Dots', '/img/patternIcons/TXUI_MIcon_BG_Dots.png'],
            368: ['Background Rectangles', '/img/patternIcons/TXUI_MIcon_BG_Rectangles.png'],

            369: ['None', '/img/patternIcons/TXUI_MIcon_None.png'],

            370: ['Radial Gradient', '/img/patternIcons/radialGradient.png'],
            371: ['Waves', '/img/patternIcons/waves.png'],
            372: ['Vertical Gradient', '/img/patternIcons/verticalGradient.png'],
            373: ['Horizontal Gradient', '/img/patternIcons/horizontalGradient.png'],

            374: ['FICSIT Check Mark', '/img/patternIcons/ficsit_checkmark_64.png'],
            375: ['FICSIT', '/img/patternIcons/Ficsit_Monochrome_Logo.png']
        };
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
            return 'filter: drop-shadow(' + size[0] + 'px ' + size[1] + 'px ' + shadowColor + ');background-position: -100%;margin-left: -100%;';
        }

        return '';
    }

    static getBackgroundTemplate(name, width, height, shadowColor)
    {
        if(name === null)
        {
            return '';
        }

        return   '<div style="position: absolute;width: ' + width + 'px;height: ' + height + 'px;overflow: hidden;">'
               + '    <div style="width: 640px;height: 640px;background: url(\'' + name + '\');background-size: 64px;' + Building_Sign.getFilterShadow([640, 640], shadowColor) + '" class="animatedDisplaySignBackground"></div>'
               + '</div>';
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



    static getLayoutTemplate(baseLayout, currentObject)
    {
        let mActivePrefabLayout = baseLayout.getObjectProperty(currentObject, 'mActivePrefabLayout');
            if(mActivePrefabLayout !== null)
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

                switch(mActivePrefabLayout.pathName)
                {
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_0.BPW_Sign1x1_0_C':
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
                             + '<table style="width: 200px;height: 200px;position: relative;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 172, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_2.BPW_Sign1x1_2_C':
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
                             + '<table style="width: 200px;height: 200px;position: relative;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';


                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_1.BPW_Sign2x1_1_C':
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
                             + '<table style="width: 400px;height: 200px;position: relative;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="font-size: 40px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_2.BPW_Sign2x1_2_C':
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
                             + '<table style="width: 400px;height: 200px;position: relative;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 196, ((iconShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_9.BPW_Sign2x1_9_C':
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 400, 200, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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


                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_0.BPW_Sign2x3_0_C':
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 300, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 300, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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
                        return Building_Sign.getBackgroundTemplate(((backgroundIconSrc !== null) ? '{{BACKGROUND_ICON_SRC}}' : null), 200, 300, ((backgroundIconShadowColor === true) ? '{{AUXILARY_COLOR}}' : null))
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
                        console.log('Missing sign layout: ' + mActivePrefabLayout.pathName);
                        if(typeof Sentry !== 'undefined')
                        {
                            Sentry.setContext('currentObject', currentObject);
                            Sentry.captureMessage('Missing sign layout: ' + mActivePrefabLayout.pathName);
                        }
                }
            }

        return '<div><strong>{{TEXT}}</strong></div>';
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
            }
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
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

        let layoutTemplate  = Building_Sign.getLayoutTemplate(baseLayout, currentObject);
            layoutTemplate  = layoutTemplate.replace('{{ICON_SRC}}', iconSrc);
            layoutTemplate  = layoutTemplate.replace('{{OTHER_ICON_SRC}}', otherIconSrc);
            layoutTemplate  = layoutTemplate.replace('{{BACKGROUND_ICON_SRC}}', backgroundIconSrc);

            layoutTemplate  = layoutTemplate.replace('{{LABEL}}', Building_Sign.getLabel(baseLayout, currentObject));
            layoutTemplate  = layoutTemplate.replace('{{TEXT}}', Building_Sign.getText(baseLayout, currentObject));

            layoutTemplate  = layoutTemplate.replace(/{{BACKGROUND_COLOR}}/g, backgroundColor);
            layoutTemplate  = layoutTemplate.replace(/{{AUXILARY_COLOR}}/g, auxilaryColor);
            layoutTemplate  = layoutTemplate.replace(/{{FOREGROUND_COLOR}}/g, foregroundColor);


        return '<div class="d-flex" style="border-radius: 5px;background: #828382;margin: -7px;padding: 6px">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="border-radius: 5px;background: ' + backgroundColor + ';color: ' + foregroundColor + ';padding: 10px;">\
                        ' + layoutTemplate + '\
                    </div>\
                </div>';
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let layoutTemplate  = Building_Sign.getLayoutTemplate(baseLayout, currentObject);

            contextMenu.push({
                text: 'Update "' + buildingData.name + '" background color',
                callback: Building_Sign.updateBackgroundColor
            });

            if(layoutTemplate.includes('{{AUXILARY_COLOR}}'))
            {
                contextMenu.push({
                    text: 'Update "' + buildingData.name + '" auxilary color',
                    callback: Building_Sign.updateAuxilaryColor
                });
            }

            contextMenu.push({
                text: 'Update "' + buildingData.name + '" foreground color',
                callback: Building_Sign.updateForegroundColor
            });

            contextMenu.push('-');

            if(layoutTemplate.includes('{{TEXT}}') || layoutTemplate.includes('{{LABEL}}'))
            {
                if(layoutTemplate.includes('{{TEXT}}'))
                {
                    contextMenu.push({
                        text: 'Update "' + buildingData.name + '" text',
                        callback: Building_Sign.updateText
                    });
                }
                if(layoutTemplate.includes('{{LABEL}}'))
                {
                    contextMenu.push({
                        text: 'Update "' + buildingData.name + '" label',
                        callback: Building_Sign.updateLabel
                    });
                }

                contextMenu.push('-');
            }

            if(layoutTemplate.includes('{{ICON_SRC}}') || layoutTemplate.includes('{{OTHER_ICON_SRC}}') || layoutTemplate.includes('{{BACKGROUND_ICON_SRC}}'))
            {
                if(layoutTemplate.includes('{{ICON_SRC}}'))
                {
                    contextMenu.push({
                        text: 'Update "' + buildingData.name + '" icon',
                        callback: Building_Sign.updateIcon
                    });
                }
                if(layoutTemplate.includes('{{OTHER_ICON_SRC}}'))
                {
                    contextMenu.push({
                        text: 'Update "' + buildingData.name + '" other icon',
                        callback: Building_Sign.updateOtherIcon
                    });
                }
                if(layoutTemplate.includes('{{BACKGROUND_ICON_SRC}}'))
                {
                    contextMenu.push({
                        text: 'Update "' + buildingData.name + '" background',
                        callback: Building_Sign.updateBackgroundIcon
                    });
                }

                contextMenu.push('-');
            }

        return contextMenu;
    }

    /**
     * MODALS COLORS
     */
    static updateBackgroundColor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" backgroundcolor',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mBackgroundColor',
                    inputType   : 'colorPicker',
                    value       : Building_Sign.getBackgroundColor(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    if(values !== null)
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
                }.bind(baseLayout)
            });
    }

    static updateAuxilaryColor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" auxilary color',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mAuxilaryColor',
                    inputType   : 'colorPicker',
                    value       : Building_Sign.getAuxilaryColor(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    if(values !== null)
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
                }.bind(baseLayout)
            });
    }

    static updateForegroundColor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" foreground color',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mForegroundColor',
                    inputType   : 'colorPicker',
                    value       : Building_Sign.getForegroundColor(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    if(values !== null)
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
                }.bind(baseLayout)
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

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" text',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabTextElementSaveData',
                    inputType   : 'textArea',
                    value       : text.replace(/<br \/>/g, '\n')
                }],
                callback    : function(values)
                {
                    if(values !== null)
                    {
                        return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabTextElementSaveData', 'Text', 'Name', values.mPrefabTextElementSaveData);
                    }
                }.bind(baseLayout)
            });
    }

    static updateLabel(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let label           = Building_Sign.getLabel(baseLayout, currentObject);

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" text',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabTextElementSaveData',
                    inputType   : 'textArea',
                    value       : label.replace(/<br \/>/g, '\n')
                }],
                callback    : function(values)
                {
                    if(values !== null)
                    {
                        return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabTextElementSaveData', 'Text', 'Label', values.mPrefabTextElementSaveData);
                    }
                }.bind(baseLayout)
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

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" icon',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabIconElementSaveData',
                    inputType   : 'selectPicker',
                    inputOptions: Building_Sign.generateIconOptions(baseLayout),
                    value       : Building_Sign.getIconID(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    if(values !== null)
                    {
                        return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabIconElementSaveData', 'IconID', 'Icon', parseInt(values.mPrefabIconElementSaveData));
                    }
                }.bind(baseLayout)
            });
    }

    static updateOtherIcon(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            Modal.form({
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
                    if(values !== null)
                    {
                        return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabIconElementSaveData', 'IconID', 'Other_Icon', parseInt(values.mPrefabIconElementSaveData));
                    }
                }.bind(baseLayout)
            });
    }

    static updateBackgroundIcon(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            Modal.form({
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
                    if(values !== null)
                    {
                        return Building_Sign.updatePrefabData(baseLayout, currentObject, 'mPrefabIconElementSaveData', 'IconID', '{BG}Background', parseInt(values.mPrefabIconElementSaveData));
                    }
                }.bind(baseLayout)
            });
    }
}