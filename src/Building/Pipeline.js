export default class Building_Pipeline
{
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
            if(poolIndex > 0)
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
            if(poolIndex < (usePool.length - 1))
            {
                currentObject.className = usePool[poolIndex + 1];
            }
    }
}