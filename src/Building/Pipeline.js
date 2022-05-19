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

        return contextMenu;
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
}