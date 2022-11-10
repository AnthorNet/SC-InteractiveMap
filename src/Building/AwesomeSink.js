/* global Intl */
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_AwesomeSink
{
    static getResourceSinkSubsystem(baseLayout)
    {
        return baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.ResourceSinkSubsystem');
    }

    static getTotalResourceSinkPoints(baseLayout)
    {
        let resourceSinkSubSystem   = Building_AwesomeSink.getResourceSinkSubsystem(baseLayout);
            if(resourceSinkSubSystem !== null)
            {
                let mTotalPoints                = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mTotalPoints');
                    if(mTotalPoints !== null)
                    {
                        return [mTotalPoints.values[0], mTotalPoints.values[1]];
                    }
                    else //TODO: Before UPDATE7
                    {
                        let mTotalResourceSinkPoints    = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mTotalResourceSinkPoints');
                            if(mTotalResourceSinkPoints !== null)
                            {
                                return [mTotalResourceSinkPoints, 0];
                            }
                    }
            }

        return [0, 0];
    }

    static getGlobalPointHistory(baseLayout)
    {
        let resourceSinkSubSystem   = Building_AwesomeSink.getResourceSinkSubsystem(baseLayout);
            if(resourceSinkSubSystem !== null)
            {
                let mGlobalPointHistoryValues   = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mGlobalPointHistoryValues');
                    if(mGlobalPointHistoryValues !== null)
                    {
                        return [mGlobalPointHistoryValues.values[0][0].value.values, mGlobalPointHistoryValues.values[1][0].value.values];
                    }
                    else //TODO: Before UPDATE7
                    {
                        let mGlobalPointHistory         = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mGlobalPointHistory');
                            if(mGlobalPointHistory !== null)
                            {
                                return [mGlobalPointHistory.values, [0, 0]];
                            }
                    }
            }

        return [[0, 0], [0, 0]];
    }

    static getNumResourceSinkCoupons(baseLayout)
    {
        let resourceSinkSubSystem   = Building_AwesomeSink.getResourceSinkSubsystem(baseLayout);
            if(resourceSinkSubSystem !== null)
            {
                let mNumResourceSinkCoupons      = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mNumResourceSinkCoupons');
                    if(mNumResourceSinkCoupons !== null)
                    {
                        return mNumResourceSinkCoupons;
                    }
            }

        return 0;
    }

    static getCurrentLevels(baseLayout)
    {
        let resourceSinkSubSystem   = Building_AwesomeSink.getResourceSinkSubsystem(baseLayout);
            if(resourceSinkSubSystem !== null)
            {
                let mCurrentPointLevels     = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mCurrentPointLevels');
                    if(mCurrentPointLevels !== null)
                    {
                        return [mCurrentPointLevels.values[0] + 1, mCurrentPointLevels.values[1] + 1];
                    }
                    else
                    {
                        let mCurrentPointLevel      = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mCurrentPointLevel');
                            if(mCurrentPointLevel !== null)
                            {
                                return [mCurrentPointLevel + 1, 1];
                            }
                    }
            }

        return [1, 1];
    }

    static getCouponCosts(currentLevel)
    {
        if(currentLevel < 3)
        {
            return 1000;
        }

        return 500 * Math.pow((Math.ceil(currentLevel / 3) - 1), 2) + 1000;
    }

    static getNextCouponCostRemaining(baseLayout)
    {
        let level   = Building_AwesomeSink.getCurrentLevels(baseLayout);
        let total   = Building_AwesomeSink.getTotalResourceSinkPoints(baseLayout);

            for(let i = 1; i < level[0]; i++)
            {

                total[0] -= Building_AwesomeSink.getCouponCosts(i);
            }
            for(let i = 1; i < level[1]; i++)
            {
                total[1] -= Building_AwesomeSink.getCouponCosts(i);
            }

        return [
            Building_AwesomeSink.getCouponCosts(level[0]) - total[0],
            Building_AwesomeSink.getCouponCosts(level[1]) - total[1]
        ];
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-empty-set',
            text        : 'Reset total earned points',
            callback    : Building_AwesomeSink.resetStatus
        });
        contextMenu.push('-');

        return contextMenu;
    }

    static resetStatus(marker)
    {
        let baseLayout              = marker.baseLayout;
        let resourceSinkSubSystem   = Building_AwesomeSink.getResourceSinkSubsystem(baseLayout);
            if(resourceSinkSubSystem !== null)
            {
                baseLayout.deleteObjectProperty(resourceSinkSubSystem, 'mTotalResourceSinkPoints');
                baseLayout.deleteObjectProperty(resourceSinkSubSystem, 'mCurrentPointLevel');
                baseLayout.deleteObjectProperty(resourceSinkSubSystem, 'mGlobalPointHistory');
            }
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let currentLevels           = Building_AwesomeSink.getCurrentLevels(baseLayout);
        let standardCouponsCost     = Building_AwesomeSink.getCouponCosts(currentLevels[0]);
        let dnaCouponsCost          = Building_AwesomeSink.getCouponCosts(currentLevels[1]);
        let nextCouponsRemaining    = Building_AwesomeSink.getNextCouponCostRemaining(baseLayout);

        let content                 = [];
            content.push('<div style="position: absolute;margin-top: 13px;margin-left: 393px; width: 195px;height: 230px;' + BaseLayout_Tooltip.genericUIBackgroundStyle(baseLayout) + '">');
                content.push('<div style="position: relative;margin: -10px;width: 176px;height: 213px;border-radius: 4px;background: #e59445;background: radial-gradient(circle, #ffc182 0%, #e5ad75 35%, #e59445 100%);overflow: hidden;">');
                    content.push('<div style="position: absolute;top: 50%;left: 50%;margin-top: -150px;margin-left: -150px;width: 300px;height: 300px;background: repeating-conic-gradient(from 0deg, rgba(204, 130, 61, 0.3) 0deg 20deg, transparent 20deg 40deg);animation: loader-counter-clockwise 30s linear infinite;">');
                    content.push('</div>');
                    content.push('<div style="position: relative;color: #FFFFFF;text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);text-align: center;">');

                        // Printable coupons
                        content.push('<div style="margin-top: 5px;height: 88px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_ResourceSink_PrintableCouponsBG.png?v=' + baseLayout.scriptVersion + ') no-repeat;">');
                            content.push('<div style="padding-top: 44px;font-size: 12px;line-height: 11px;"><strong style="font-size: 24px;">' + new Intl.NumberFormat(baseLayout.language).format(Building_AwesomeSink.getNumResourceSinkCoupons(baseLayout)) + '</strong><br />Printable Coupon</div>');
                        content.push('</div>');

                        // Standard points
                        content.push('<div style="margin: 12px 10px 0 10px;height: 48px;background: #666666;border-radius: 4px;text-align: left;white-space: normal;">');
                            content.push('<div style="position: absolute;width: ' + Math.round(100 - (nextCouponsRemaining[0] / standardCouponsCost * 100)) + '%;height: 48px;background: #848484;border-top-left-radius: 4px;border-bottom-left-radius: 4px;"></div>');
                            content.push('<div style="position: absolute;margin-top: 4px;margin-left: 4px;width: 40px;height: 40px;"><img src="' + baseLayout.staticUrl + '/img/Parts_CategoryIcon_128_v2.png" style="width: 40px;height: 40px;" /></div>');
                            content.push('<div style="position: absolute;margin-top: 3px;margin-left: 55px;width: 100px;line-height: 9px;font-size: 10px;">Standard Points until next Coupon:<br /><strong style="font-size: 24px;line-height: 23px;">' + new Intl.NumberFormat(baseLayout.language).format(nextCouponsRemaining[0]) + '</strong></div>');
                        content.push('</div>');

                        // DNA points
                        content.push('<div style="margin: 5px 10px 0 10px;height: 48px;background: #666666;border-radius: 4px;text-align: left;white-space: normal;">');
                            content.push('<div style="position: absolute;width: ' + Math.round(100 - (nextCouponsRemaining[1] / dnaCouponsCost * 100)) + '%;height: 48px;background: #848484;border-top-left-radius: 4px;border-bottom-left-radius: 4px;"></div>');
                            content.push('<div style="position: absolute;margin-top: 4px;margin-left: 4px;width: 40px;height: 40px;"><img src="' + baseLayout.itemsData.Desc_AlienDNACapsule_C.image + '" style="width: 40px;height: 40px;" /></div>');
                            content.push('<div style="position: absolute;margin-top: 3px;margin-left: 55px;width: 100px;line-height: 9px;font-size: 10px;">DNA Points until next Coupon:<br /><strong style="font-size: 24px;line-height: 23px;">' + new Intl.NumberFormat(baseLayout.language).format(nextCouponsRemaining[1]) + '</strong></div>');
                        content.push('</div>');

                    content.push('</div>');

                content.push('</div>');
            content.push('</div>');

        let globalPointHistory      = Building_AwesomeSink.getGlobalPointHistory(baseLayout);
        let standardPointPerMinute  = globalPointHistory[0][globalPointHistory[0].length - 1];
        let dnaPointPerMinute       = globalPointHistory[1][globalPointHistory[1].length - 1];

            content.push('<div style="position: absolute;margin-top: 13px;margin-left: 13px; width: 335px;height: 230px;' + BaseLayout_Tooltip.genericUIBackgroundStyle(baseLayout) + '">');
                content.push('<div style="position: relative;margin: -11px;width: 318px;height: 214px;border-radius: 4px;' + BaseLayout_Tooltip.uiGradient + '">');
                    content.push('<div style="position: absolute;margin-top: 174px;width: 100%;height: 18px;border-top: 1px #FFF solid;text-align: center;line-height: 18px;font-size: 12px;color: #666666;">Standard Points: <strong class="text-warning">' + new Intl.NumberFormat(baseLayout.language).format(standardPointPerMinute) + ' points/min</strong></div>');
                    content.push('<div style="position: absolute;margin-top: 190px;width: 100%;height: 18px;text-align: center;line-height: 18px;font-size: 12px;color: #666666;">DNA Points: <strong style="color: #A678A6;">' + new Intl.NumberFormat(baseLayout.language).format(dnaPointPerMinute) + ' points/min</strong></div>');
                    content.push('<svg viewBox="0 0 318 155" xmlns="http://www.w3.org/2000/svg" style="margin-top: 10px;">');

                        let standardPoints  = [];
                        let xStandardStep   = Math.round(318 / (globalPointHistory[0].length - 1));
                        let yStandardRatio  = Math.max.apply(null, globalPointHistory[0]) / 154;
                            for(let i = 0; i < globalPointHistory[0].length; i++)
                            {
                                standardPoints.push((xStandardStep * i) + ',' + Math.max((154 - (globalPointHistory[0][i] * yStandardRatio)), 1));
                            }
                            content.push('<polyline points="' + standardPoints.join(' ') + '" stroke="#FA9549" fill="none" stroke-width="2" />');

                        let dnaPoints   = [];
                        let xDnaStep    = Math.round(318 / (globalPointHistory[1].length - 1));
                        let yDnaRatio   = Math.max.apply(null, globalPointHistory[1]) / 154;
                            for(let i = 0; i < globalPointHistory[1].length; i++)
                            {
                                dnaPoints.push((xDnaStep * i) + ',' + Math.max((154 - (globalPointHistory[1][i] * yDnaRatio)), 1));
                            }
                            content.push('<polyline points="' + dnaPoints.join(' ') + '" stroke="#A678A6" fill="none" stroke-width="2" />');

                    content.push('</svg>');
                content.push('</div>');
            content.push('</div>');

        // STAND BY
        content.push(BaseLayout_Tooltip.getStandByPanel(baseLayout, currentObject, 275, 282, 302, 212));

        return '<div style="width: 600px;height: 354px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/ResourceSink_Background.png?v=' + baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }
}