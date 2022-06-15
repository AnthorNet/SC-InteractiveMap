/* global Intl */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_Pipeline
{
    static get availableConnections(){ return ['.PipeInputFactory', '.PipeOutputFactory', '.PipelineConnection0', '.PipelineConnection1', '.FGPipeConnectionFactory', '.Connection0', '.Connection1', '.Connection2', '.Connection3', '.ConnectionAny0', '.ConnectionAny1']; }

    static get availablePipelines()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C',
            '/Game/FactoryGame/Buildable/Factory/PipelineMk2/Build_PipelineMK2.Build_PipelineMK2_C'
        ];
    }

    static get availablePipePumps()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/PipePump/Build_PipelinePump.Build_PipelinePump_C',
            '/Game/FactoryGame/Buildable/Factory/PipePumpMk2/Build_PipelinePumpMK2.Build_PipelinePumpMk2_C'
        ];
    }

    /*
     * PIPE LOOKUP, includes mods to avoid finding them everywhere
     */
    static isPipeline(currentObject)
    {
        if(Building_Pipeline.availablePipelines.includes(currentObject.className))
        {
            return true;
        }

        // Pipes Mod
        if(
               currentObject.className === '/Game/InfiniteLogistics/Buildable/InfinitePipeline/Build_InfinitePipeline.Build_InfinitePipeline_C'
        )
        {
            return true;
        }

        return false;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let usePool     = Building_Pipeline.availablePipelines;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PipePump') === true)
            {
                usePool = Building_Pipeline.availablePipePumps;
            }

        let poolIndex   = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && (poolIndex > 0 || poolIndex < (usePool.length - 1)))
            {
                if(poolIndex > 0)
                {
                    let downgradeData = baseLayout.getBuildingDataFromClassName(usePool[poolIndex - 1]);
                        if(downgradeData !== null)
                        {
                            contextMenu.push({
                                icon        : 'fa-level-down-alt',
                                text        : 'Downgrade to "' + downgradeData.name + '"',
                                callback    : Building_Pipeline.downgradePipeline,
                                className   : 'Building_Pipeline_downgradePipeline'
                            });
                        }
                }
                if(poolIndex < (usePool.length - 1))
                {
                    let upgradeData = baseLayout.getBuildingDataFromClassName(usePool[poolIndex + 1]);
                        if(upgradeData !== null)
                        {
                            contextMenu.push({
                                icon        : 'fa-level-up-alt',
                                text        : 'Upgrade to "' + upgradeData.name + '"',
                                callback    : Building_Pipeline.upgradePipeline,
                                className   : 'Building_Pipeline_upgradePipeline'
                            });
                        }
                }

                contextMenu.push('-');
            }


        if(Building_Pipeline.isPipeline(currentObject))
        {
            contextMenu.push({
                icon        : 'fa-water-rise',
                text        : baseLayout.translate._('MAP\\CONTEXTMENU\\Fill inventory'),
                callback    : Building_Pipeline.fillInventory,
                className   : 'Building_Pipeline_fillInventory'
            });
            contextMenu.push({
                icon        : 'fa-water-lower',
                text        : baseLayout.translate._('MAP\\CONTEXTMENU\\Clear inventory'),
                callback    : Building_Pipeline.clearInventory,
                className   : 'Building_Pipeline_clearInventory'
            });
        }

        return contextMenu;
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, tooltip, currentObject)
    {
        let content         = [];
        let distance        = '';
        let pipelineData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

        if(pipelineData !== null)
        {
            let splineData      = BaseLayout_Math.extractSplineData(baseLayout, currentObject);
                if(splineData !== null)
                {
                    distance = ' (' + new Intl.NumberFormat(baseLayout.language).format(Math.round(splineData.distance * 10) / 10) + 'm)';
                }

            // HEADER
            content.push('<div style="position: absolute;margin-top: 5px;width: 350px;' + BaseLayout_Tooltip.defaultTextStyle + 'text-align: center;">');
            content.push('<strong class="small">' + pipelineData.name + distance + '</strong>');
            content.push('</div>');

            // VOLUME
            let maxFluid        = 3.1415926535897932 * Math.pow((1.3 / 2), 2) * splineData.distanceStraight * 1000; // Use straigth calculation
            let itemType        = null;

            let fluidBox        = baseLayout.getObjectProperty(currentObject, 'mFluidBox');
                if(fluidBox === null)
                {
                    fluidBox = {value: 0};
                }
            let currentFluid    = Math.min(maxFluid, fluidBox.value * 1000); //TODO: Until we get fluidBox method working!

            // Get fluid type
            let currentPipeNetwork = baseLayout.pipeNetworkSubSystem.getObjectPipeNetwork(currentObject);
                if(currentPipeNetwork !== null)
                {
                    let mFluidDescriptor = baseLayout.getObjectProperty(currentPipeNetwork, 'mFluidDescriptor');
                        if(mFluidDescriptor !== null)
                        {
                            itemType = mFluidDescriptor.pathName;
                        }
                }

            if(itemType !== null)
            {
                itemType = baseLayout.getItemDataFromClassName(itemType);

                if(itemType !== null && itemType.color !== undefined)
                {
                    content.push('<div style="position: absolute;margin-top: 31px;margin-left: 187px;">');
                        if(itemType.category === 'gas')
                        {
                            content.push(tooltip.setGasDome(140, currentFluid, maxFluid, itemType.color));
                        }
                        else
                        {
                            content.push(tooltip.setLiquidDome(140, currentFluid, maxFluid, itemType.color));
                        }
                    content.push('</div>');
                }

                if(itemType !== null && itemType.color !== undefined)
                {
                    content.push('<div style="position: absolute;margin-top: 185px;margin-left: 11px;width: 160px;color: #5b5b5b;text-align: center;font-size: 13px;">');
                    content.push('<strong>' + itemType.name + '</strong>');
                    content.push('</div>');
                }
            }

            // AMOUNT
            content.push('<div style="position: absolute;margin-top: 200px;margin-left: 200px;width: 120px;color: #FFFFFF;text-align: center;font-size: 13px;">');
            content.push('<span class="small">Current amount:</span><br /><strong>' + new Intl.NumberFormat(baseLayout.language).format(Math.round(currentFluid / 100) / 10) + ' / ' + new Intl.NumberFormat(baseLayout.language).format(Math.round(maxFluid / 100) / 10) + 'm³</strong>');
            content.push('</div>');

            if(pipelineData.maxFlowRate !== undefined)
            {
                content.push('<div style="position: absolute;margin-top: 205px;margin-left: 11px;width: 80px;text-align: center;font-size: 11px;color: #5b5b5b;">');
                content.push('<span class="small">Flow Rate</span><br /><i class="fas fa-chevron-right"></i><br /><strong><strong class="text-info">???</strong> m³/min</strong>');
                content.push('</div>');
                content.push('<div style="position: absolute;margin-top: 205px;margin-left: 93px;width: 80px;text-align: center;font-size: 11px;color: #5b5b5b;border-left: 1px solid #5b5b5b;">');
                content.push('<span class="small">Max Flow Rate</span><br /><i class="fas fa-chevron-double-right"></i><br /><strong><strong class="text-info">' + pipelineData.maxFlowRate / 1000 + '</strong> m³/min</strong>');
                content.push('</div>');
            }

            // Flow indicator
            content.push('<div style="position: absolute;margin-top: 42px;margin-left: 32px;width: 118px;height: 118px;"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/flowIndicator.png?v=' + baseLayout.scriptVersion + '" style="width: 118px;height: 118px;transform: rotate(-135deg);" /></div>');
            content.push('<div style="position: absolute;margin-top: 42px;margin-left: 32px;width: 118px;height: 118px;"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/flowGlass.png?v=' + baseLayout.scriptVersion + '" style="width: 118px;height: 118px;" /></div>');

        }

        return '<div style="position: relative;width: 350px;height: 270px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_PipeInspector_BG.png?v=' + baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }

    /**
     * DOWNGRADE/UPGRADE
     */
    static downgradePipeline(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let usePool         = Building_Pipeline.availablePipelines;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PipePump') === true)
            {
                usePool = Building_Pipeline.availablePipePumps;
            }

        let poolIndex       = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && poolIndex > 0)
            {
                currentObject.className = usePool[poolIndex - 1];
            }
    }

    static upgradePipeline(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let usePool         = Building_Pipeline.availablePipelines;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PipePump') === true)
            {
                usePool = Building_Pipeline.availablePipePumps;
            }

        let poolIndex       = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && poolIndex < (usePool.length - 1))
            {
                currentObject.className = usePool[poolIndex + 1];
            }
    }



    static fillInventory(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let splineData          = BaseLayout_Math.extractSplineData(baseLayout, currentObject);
        let maxFluid            = 3.1415926535897932 * Math.pow((1.3 / 2), 2) * splineData.distanceStraight * 1000; // Use straigth calculation

            baseLayout.setObjectProperty(currentObject, 'mFluidBox', {
                type    : 'FluidBox',
                value   : maxFluid
            }, 'StructProperty');
    }

    static clearInventory(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            baseLayout.deleteObjectProperty(currentObject, 'mFluidBox');
    }
}