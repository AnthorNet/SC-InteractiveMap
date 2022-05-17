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
                let mTotalResourceSinkPoints      = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mTotalResourceSinkPoints');
                    if(mTotalResourceSinkPoints !== null)
                    {
                        return mTotalResourceSinkPoints;
                    }
            }

        return 0;
    }

    static getGlobalPointHistory(baseLayout)
    {
        let resourceSinkSubSystem   = Building_AwesomeSink.getResourceSinkSubsystem(baseLayout);
            if(resourceSinkSubSystem !== null)
            {
                let mGlobalPointHistory      = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mGlobalPointHistory');
                    if(mGlobalPointHistory !== null)
                    {
                        return mGlobalPointHistory.values;
                    }
            }

        return [0];
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

    static getCurrentLevel(baseLayout)
    {
        let resourceSinkSubSystem   = Building_AwesomeSink.getResourceSinkSubsystem(baseLayout);
            if(resourceSinkSubSystem !== null)
            {
                let mCurrentPointLevel      = baseLayout.getObjectProperty(resourceSinkSubSystem, 'mCurrentPointLevel');
                    if(mCurrentPointLevel !== null)
                    {
                        return mCurrentPointLevel + 1;
                    }
            }

        return 1;
    }

    static getCouponCost(baseLayout, currentLevel = null)
    {
        if(currentLevel === null)
        {
            currentLevel = Building_AwesomeSink.getCurrentLevel(baseLayout);
        }

        if(currentLevel < 3)
        {
            return 1000;
        }

        return 500 * Math.pow((Math.ceil(currentLevel / 3) - 1), 2) + 1000;
    }

    static getNextCouponCostRemaining(baseLayout)
    {
        let level   = Building_AwesomeSink.getCurrentLevel(baseLayout);
        let total   = Building_AwesomeSink.getTotalResourceSinkPoints(baseLayout);

            for(let i = 1; i < level; i++)
            {
                total -= Building_AwesomeSink.getCouponCost(baseLayout, i);
            }

        return Building_AwesomeSink.getCouponCost(baseLayout) - total;
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
        let content         = [];
            content.push('<div style="position: absolute;margin-top: 13px;margin-left: 393px; width: 195px;height: 230px;' + BaseLayout_Tooltip.genericUIBackgroundStyle(baseLayout) + '">');
                content.push('<div style="position: relative;margin: -10px;width: 176px;height: 213px;border-radius: 4px;background: #e59445;background: radial-gradient(circle, #ffc182 0%, #e5ad75 35%, #e59445 100%);overflow: hidden;">');
                    content.push('<div style="position: absolute;top: 50%;left: 50%;margin-top: -150px;margin-left: -150px;width: 300px;height: 300px;background: repeating-conic-gradient(from 0deg, rgba(204, 130, 61, 0.3) 0deg 20deg, transparent 20deg 40deg);animation: loader-counter-clockwise 30s linear infinite;">');
                    content.push('</div>');

                    content.push('<div style="position: relative;color: #FFFFFF;text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);text-align: center;">');
                        content.push('<div style="padding-top: 15px;font-size: 12px;">Points until next Coupon:<br /><strong style="font-size: 24px;">' + new Intl.NumberFormat(baseLayout.language).format(Building_AwesomeSink.getNextCouponCostRemaining(baseLayout)) + '</strong></div>');

                        content.push('<div style="display: inline-block;width: 145px;height: 73px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_ResourceSink_CouponBar_Empty.png?v=' + baseLayout.scriptVersion + ') no-repeat;background-size: cover;">');
                            content.push('<div style="position: absolute;width: ' + Math.round(100 - (Building_AwesomeSink.getNextCouponCostRemaining(baseLayout) / Building_AwesomeSink.getCouponCost(baseLayout) * 100)) + '%;height: 73px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_ResourceSink_CouponBar_Full.png?v=' + baseLayout.scriptVersion + ') left no-repeat;background-size: cover;"></div>');
                            content.push('<div style="position: absolute;color: #FA9549;margin-top: 48px;margin-left: 59px;width: 28px;line-height: 14px;font-size: 10px;"><strong>' + Math.round(100 - (Building_AwesomeSink.getNextCouponCostRemaining(baseLayout) / Building_AwesomeSink.getCouponCost(baseLayout) * 100)) + '%</strong></div>')
                        content.push('</div>');

                        content.push('<div style="padding-top: 5px;font-size: 12px;">Printable Coupon:<br /><strong style="font-size: 24px;">' + new Intl.NumberFormat(baseLayout.language).format(Building_AwesomeSink.getNumResourceSinkCoupons(baseLayout)) + '</strong></div>');
                    content.push('</div>');

                content.push('</div>');
            content.push('</div>');

        let globalPointHistory  = Building_AwesomeSink.getGlobalPointHistory(baseLayout);
        let pointPerMinute      = globalPointHistory[globalPointHistory.length - 1];

            content.push('<div style="position: absolute;margin-top: 13px;margin-left: 13px; width: 335px;height: 230px;' + BaseLayout_Tooltip.genericUIBackgroundStyle(baseLayout) + '">');
                content.push('<div style="position: relative;margin: -11px;width: 318px;height: 214px;border-radius: 4px;' + BaseLayout_Tooltip.uiGradient + '">');
                    content.push('<div style="position: absolute;margin-top: 174px;width: 100%;height: 30px;border-top: 1px #FFF solid;text-align: center;line-height: 30px;font-size: 14px;" class="text-warning">' + new Intl.NumberFormat(baseLayout.language).format(pointPerMinute) + ' points/min</div>');
                    content.push('<svg viewBox="0 0 318 154" xmlns="http://www.w3.org/2000/svg" style="margin-top: 10px;">');

                        let points  = [];
                        let xStep   = Math.round(318 / globalPointHistory.length);
                        let yRatio  = Math.max.apply(null, globalPointHistory) / 154;
                            for(let i = 0; i < globalPointHistory.length; i++)
                            {
                                points.push((xStep * i) + ',' + Math.max((154 - (globalPointHistory[i] * yRatio)), 1));
                            }
                            points.push(318 + ',' + 1);
                            content.push('<polyline points="' + points.join(' ') + '" stroke="#FA9549" fill="none" />');

                    content.push('</svg>');
                content.push('</div>');
            content.push('</div>');

        // STAND BY
        content.push(BaseLayout_Tooltip.getStandByPanel(baseLayout, currentObject, 275, 282, 302, 212));

        return '<div style="width: 600px;height: 354px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/ResourceSink_Background.png?v=' + baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }
}