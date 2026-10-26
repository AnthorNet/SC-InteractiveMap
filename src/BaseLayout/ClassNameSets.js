const BaseLayout_ClassNameSets = {
    skipped         :new Set([
        '/Game/FactoryGame/Buildable/Factory/TradingPost/BP_StartingPod.BP_StartingPod_C',
        '/Game/FactoryGame/Character/Player/Char_Player.Char_Player_C',
        '/Game/FactoryGame/Buildable/Factory/Pipeline/FlowIndicator/Build_PipelineFlowIndicator.Build_PipelineFlowIndicator_C',

        '/Game/FactoryGame/Schematics/Progression/BP_SchematicManager.BP_SchematicManager_C',
        '/Game/FactoryGame/Recipes/Research/BP_ResearchManager.BP_ResearchManager_C',
        '/Game/FactoryGame/Unlocks/BP_UnlockSubsystem.BP_UnlockSubsystem_C',
        '/Game/FactoryGame/Events/BP_EventSubsystem.BP_EventSubsystem_C',

        '/Game/FactoryGame/Schematics/Progression/BP_GamePhaseManager.BP_GamePhaseManager_C',

        '/Game/FactoryGame/Buildable/Factory/PipeHyper/FGPipeConnectionComponentHyper.FGPipeConnectionComponentHyper_C',

        '/Game/FactoryGame/Resource/BP_FrackingCore.BP_FrackingCore_C',

        // SIGN POLES
        '/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole.Build_SignPole_C',
        '/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole_Portrait.Build_SignPole_Portrait_C',
        '/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole_Small.Build_SignPole_Small_C',
        '/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole_Medium.Build_SignPole_Medium_C',
        '/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole_Large.Build_SignPole_Large_C',
        '/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole_Huge.Build_SignPole_Huge_C',

        // HUB PARTS
        '/Game/FactoryGame/Buildable/Factory/WorkBench/Build_WorkBenchIntegrated.Build_WorkBenchIntegrated_C',
        '/Game/FactoryGame/Buildable/Factory/Mam/Build_MamIntegrated.Build_MamIntegrated_C',
        '/Game/FactoryGame/Buildable/Factory/HubTerminal/Build_HubTerminal.Build_HubTerminal_C',
        '/Game/FactoryGame/Prototype/TetrominoRecipeDesigner/Build_TetrominoGame_Computer.Build_TetrominoGame_Computer_C',

        '/Game/FactoryGame/Buildable/Vehicle/BP_VehicleTargetPoint.BP_VehicleTargetPoint_C',

        // MODS
        '/Game/EfficiencyCheckerMod/Buildings/EfficiencyChecker/Build_Pipeline_Stub.Build_Pipeline_Stub_C'
    ]),

    environment     : new Set([
        '/Game/FactoryGame/World/Hazard/SporeCloudPlant/BP_SporeFlower.BP_SporeFlower_C',

        '/Game/FactoryGame/Equipment/C4Dispenser/BP_DestructibleSmallRock.BP_DestructibleSmallRock_C',
        '/Game/FactoryGame/Equipment/C4Dispenser/BP_DestructibleFlatRock.BP_DestructibleFlatRock_C',
        '/Game/FactoryGame/Equipment/C4Dispenser/BP_DestructibleLargeRock.BP_DestructibleLargeRock_C',

        '/Game/FactoryGame/World/Environment/Rock/GasPillar/Mesh/BP_GasPillar_01.BP_GasPillar_01_C',
        '/Game/FactoryGame/World/Environment/Rock/GasPillar/Mesh/BP_GasPillar_02.BP_GasPillar_02_C',
        '/Game/FactoryGame/World/Environment/Rock/GasPillar/Mesh/BP_GasPillar_03.BP_GasPillar_03_C',
        '/Game/FactoryGame/World/Environment/Rock/GasPillar/Mesh/BP_GasPillar_04.BP_GasPillar_04_C',
        '/Game/FactoryGame/World/Environment/Rock/GasPillar/Mesh/BP_GasPillar_05.BP_GasPillar_05_C'
    ]),
    worldBenefit    : new Set([
        '/Game/FactoryGame/World/Benefit/NutBush/BP_NutBush.BP_NutBush_C',
        '/Game/FactoryGame/World/Benefit/BerryBush/BP_BerryBush.BP_BerryBush_C',
        '/Game/FactoryGame/World/Benefit/Mushroom/BP_Shroom_01.BP_Shroom_01_C',
        '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal.BP_Crystal_C',
        '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk2.BP_Crystal_mk2_C',
        '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk3.BP_Crystal_mk3_C',
        '/Game/FactoryGame/Prototype/WAT/BP_WAT1.BP_WAT1_C',
        '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C',
        '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C'
    ]),
    animalParts     :new Set([
        '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_HogParts.BP_HogParts_C',
        '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_CliffHogParts.BP_CliffHogParts_C',
        '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaHogParts.BP_AlphaHogParts_C',
        '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_NuclearHogParts.BP_NuclearHogParts_C'
    ]),


    modNodes        : new Set([
        // Refined Power
        '/RefinedPower/World/ResourceNodes/Thorium/BP_Thorium.BP_Thorium_C',
        // Ficsit Farming
        '/FicsitFarming/World/ResourceNodes/Dirt/BP_DirtNode.BP_DirtNode_C'
    ]),
    modWaterTurbine : new Set([
        '/RefinedPower/World/ResourceNodes/WaterTurbine/BP_WaterTurbineNode_Medium.BP_WaterTurbineNode_Medium_C',
        '/RefinedPower/World/ResourceNodes/WaterTurbine/BP_WaterTurbineNode_Fast.BP_WaterTurbineNode_Fast_C'
    ]),

    fluidStorage    :new Set([
        '/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C',
        '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C',
        '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'
    ])
    /*
    ,
    new Set(['/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole.Build_SignPole_C', '/Game/FactoryGame/Buildable/Factory/Pipeline/FlowIndicator/Build_PipelineFlowIndicator.Build_PipelineFlowIndicator_C'
    ]),
    new Set(['/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C', '/Script/FactoryGame.FGTrainStationIdentifier', '/Script/FactoryGame.FGTrain'
    ]),
    */
};

export default BaseLayout_ClassNameSets;