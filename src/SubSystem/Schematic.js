import Modal_Map_Players                         from '../Modal/Map/Players.js';

import Building_MAM                             from '../Building/MAM.js';

import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Schematic extends SubSystem
{
    constructor(options)
    {
        options.pathName            = 'Persistent_Level:PersistentLevel.schematicManager';
        super(options);

        this.collectedSchematics    = new Schematics({language: this.baseLayout.language});

        // Force filling schematics...
        this.getPurchasedSchematics();
    }

    havePurchasedSchematics(pathName)
    {
        if(this.subSystem !== null)
        {
            let mPurchasedSchematics    = this.baseLayout.getObjectProperty(this.subSystem, 'mPurchasedSchematics');
                if(mPurchasedSchematics !== null)
                {
                    for(let i = 0; i < mPurchasedSchematics.values.length; i++)
                    {
                        if(mPurchasedSchematics.values[i].pathName === pathName)
                        {
                            return true;
                        }
                    }
                }
        }

        return false;
    }

    getPurchasedSchematics()
    {
            this.collectedSchematics.resetCollected();
        let purchasedSchematics = [];
            if(this.subSystem !== null)
            {
                let mPurchasedSchematics    = this.baseLayout.getObjectProperty(this.subSystem, 'mPurchasedSchematics');
                    if(mPurchasedSchematics !== null)
                    {
                        for(let i = (mPurchasedSchematics.values.length - 1); i >= 0; i--)
                        {
                            if(purchasedSchematics.includes(mPurchasedSchematics.values[i].pathName) === false)
                            {
                                // Convert old schematics, but renamed again in 1.0...
                                if(this.baseLayout.saveGameParser.header.saveVersion < 46)
                                {
                                    if(mPurchasedSchematics.values[i].pathName === '/Game/FactoryGame/Schematics/Research/AlienOrganisms_RS/Research_AOrgans_0.Research_AOrgans_0_C')
                                    {
                                        mPurchasedSchematics.values[i].pathName = '/Game/FactoryGame/Schematics/Research/AlienOrganisms_RS/Research_AO_Spitter.Research_AO_Spitter_C';
                                    }
                                    if(mPurchasedSchematics.values[i].pathName === '/Game/FactoryGame/Schematics/Research/AlienOrganisms_RS/Research_ACarapace_0.Research_ACarapace_0_C')
                                    {
                                        mPurchasedSchematics.values[i].pathName = '/Game/FactoryGame/Schematics/Research/AlienOrganisms_RS/Research_AO_Hog.Research_AO_Hog_C';
                                    }
                                }

                                purchasedSchematics.push(mPurchasedSchematics.values[i].pathName);
                                this.collectedSchematics.addCollected(mPurchasedSchematics.values[i].pathName);
                            }
                            else
                            {
                                // Remove duplicates...
                                mPurchasedSchematics.values.splice(i, 1);
                            }
                        }
                    }
            }

        return purchasedSchematics;
    }

    switchSchematic(schematicId, currentStatus)
    {
        this.availableSchematics    = null;
        this.purchasedSchematics    = null;
        let currentSchematic        = {className: schematicId};
            if(this.baseLayout.schematicsData[schematicId] !== undefined && this.baseLayout.schematicsData[schematicId].className !== undefined)
            {
                currentSchematic    = this.baseLayout.schematicsData[schematicId];
            }

        if(this.subSystem !== null)
        {
            switch(currentStatus)
            {
                case 'purchased': // Go to none state
                    for(let i = 0; i < this.subSystem.properties.length; i++)
                    {
                        if(this.subSystem.properties[i].name === 'mAvailableSchematics')
                        {
                            let mAvailableSchematics = this.subSystem.properties[i].value.values;
                                for(let j = (mAvailableSchematics.length - 1); j >= 0; j--)
                                {
                                    if(mAvailableSchematics[j].pathName === currentSchematic.className)
                                    {
                                        mAvailableSchematics.splice(j, 1);
                                    }
                                }
                        }

                        if(this.subSystem.properties[i].name === 'mPurchasedSchematics')
                        {
                            let mPurchasedSchematics = this.subSystem.properties[i].value.values;
                                for(let j = (mPurchasedSchematics.length - 1); j >= 0; j--)
                                {
                                    if(mPurchasedSchematics[j].pathName === currentSchematic.className)
                                    {
                                        mPurchasedSchematics.splice(j, 1);
                                    }
                                }
                        }
                    }
                    break;
                case 'available': // Go to purchased state
                    for(let i = 0; i < this.subSystem.properties.length; i++)
                    {
                        if(this.subSystem.properties[i].name === 'mAvailableSchematics')
                        {
                            let mAvailableSchematics = this.subSystem.properties[i].value.values;
                                for(let j = (mAvailableSchematics.length - 1); j >= 0; j--)
                                {
                                    if(mAvailableSchematics[j].pathName === currentSchematic.className)
                                    {
                                        mAvailableSchematics.splice(j, 1);
                                    }
                                }
                        }

                        if(this.subSystem.properties[i].name === 'mPurchasedSchematics')
                        {
                            let preventDuplicate        = false;
                            let mPurchasedSchematics    = this.subSystem.properties[i].value.values;
                                for(let j = 0; j < mPurchasedSchematics.length; j++)
                                {
                                    if(mPurchasedSchematics[j].pathName === currentSchematic.className)
                                    {
                                        preventDuplicate = true;
                                        break;
                                    }
                                }

                                if(preventDuplicate === false)
                                {
                                    mPurchasedSchematics.push({levelName: "", pathName: currentSchematic.className});
                                }
                        }
                    }
                    break;
                case 'none': // Go to available state
                    for(let i = 0; i < this.subSystem.properties.length; i++)
                    {
                        if(this.subSystem.properties[i].name === 'mAvailableSchematics')
                        {
                            let preventDuplicate        = false;
                            let mAvailableSchematics    = this.subSystem.properties[i].value.values;
                                for(let j = 0; j < mAvailableSchematics.length; j++)
                                {
                                    if(mAvailableSchematics[j].pathName === currentSchematic.className)
                                    {
                                        preventDuplicate = true;
                                        break;
                                    }
                                }

                                if(preventDuplicate === false)
                                {
                                    mAvailableSchematics.push({levelName: "", pathName: currentSchematic.className});
                                }
                        }

                        if(this.subSystem.properties[i].name === 'mPurchasedSchematics')
                        {
                            let mPurchasedSchematics = this.subSystem.properties[i].value.values;
                                for(let j = (mPurchasedSchematics.length - 1); j >= 0; j--)
                                {
                                    if(mPurchasedSchematics[j].pathName === currentSchematic.className)
                                    {
                                        mPurchasedSchematics.splice(j, 1);
                                    }
                                }
                        }
                    }
                    break;
            }

            // Handle player slots
            let mapPlayers = new Modal_Map_Players({baseLayout: this.baseLayout});
                switch(currentStatus)
                {
                    case 'none': // Go to available state
                    case 'purchased': // Go to none state
                        if(currentStatus !== 'none' && currentSchematic.equipmentSlots !== undefined)
                        {
                            mapPlayers.removeEquipmentSlot(currentSchematic.equipmentSlots);
                        }
                        if(currentStatus !== 'none' && currentSchematic.slots !== undefined)
                        {
                            mapPlayers.removeInventorySlot(currentSchematic.slots);
                        }
                        break;
                    case 'available': // Go to purchased state
                        if(currentSchematic.equipmentSlots !== undefined)
                        {
                            mapPlayers.addEquipmentSlot(currentSchematic.equipmentSlots);
                        }
                        if(currentSchematic.slots !== undefined)
                        {
                            mapPlayers.addInventorySlot(currentSchematic.slots);
                        }
                        break;
                }

            // Handle MAM tree unlocks
            let researchManager = Building_MAM.getManager(this.baseLayout);
                if(researchManager !== null)
                {
                    let currentResearch = currentSchematic.className.split('.');
                        currentResearch = currentResearch.pop();
                        currentResearch = currentResearch.split('_');

                        if(currentResearch[0] === 'Research')
                        {
                                Building_MAM.initiate(this.baseLayout);
                            let mUnlockedResearchTrees  = this.baseLayout.getObjectProperty(researchManager, 'mUnlockedResearchTrees');
                            let currentTree             = null;

                                switch(currentResearch[1])
                                {
                                    //{levelName: "", pathName: "/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_HardDrive.BPD_ResearchTree_HardDrive_C"}
                                    case 'AO':
                                    case 'AOrgans':
                                    case 'AlienOrganisms':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_AlienOrganisms.BPD_ResearchTree_AlienOrganisms_C';
                                        break;
                                    case 'Alien':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_AlienTech.BPD_ResearchTree_AlienTech_C';
                                        break;
                                    case 'Caterium':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Caterium.BPD_ResearchTree_Caterium_C';
                                        break;
                                    case 'FlowerPetals':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_FlowerPetals.BPD_ResearchTree_FlowerPetals_C';
                                        break;
                                    case 'Mycelia':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Mycelia.BPD_ResearchTree_Mycelia_C';
                                        break;
                                    case 'Nutrients':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Nutrients.BPD_ResearchTree_Nutrients_C';
                                        break;
                                    case 'PowerSlugs':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_PowerSlugs.BPD_ResearchTree_PowerSlugs_C';
                                        break;
                                    case 'Quartz':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Quartz.BPD_ResearchTree_Quartz_C';
                                        break;
                                    case 'Sulfur':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_Sulfur.BPD_ResearchTree_Sulfur_C';
                                        break;
                                    case 'XMas':
                                        currentTree = '/Game/FactoryGame/Schematics/Research/BPD_ResearchTree_XMas.BPD_ResearchTree_XMas_C';
                                        break;
                                }

                            if(currentTree !== null)
                            {
                                let isUnlocked                      = false;
                                let mUnlockedResearchTreesValues    = mUnlockedResearchTrees.values;
                                    for(let j = 0; j < mUnlockedResearchTreesValues.length; j++)
                                    {
                                        if(mUnlockedResearchTreesValues[j].pathName === currentTree)
                                        {
                                            isUnlocked = true;
                                            break;
                                        }
                                    }

                                    if(isUnlocked === false)
                                    {
                                        mUnlockedResearchTreesValues.push({levelName: "", pathName: currentTree});
                                    }
                            }
                        }
                }

            // Handle unlocked recipes
            if(currentSchematic.recipes !== undefined)
            {
                let recipeManager = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.recipeManager');
                    if(recipeManager !== null)
                    {
                        let mAvailableRecipes               = this.baseLayout.getObjectProperty(recipeManager, 'mAvailableRecipes');
                        let mAvailableCustomizationRecipes  = this.baseLayout.getObjectProperty(recipeManager, 'mAvailableCustomizationRecipes');

                            switch(currentStatus)
                            {
                                case 'purchased': // Go to none state
                                case 'none': // Go to available state
                                    if(mAvailableRecipes !== null)
                                    {
                                        for(let j = (mAvailableRecipes.values.length - 1); j >= 0; j--)
                                        {
                                            if(currentSchematic.recipes.includes(mAvailableRecipes.values[j].pathName))
                                            {
                                                mAvailableRecipes.values.splice(j, 1);
                                            }
                                        }
                                    }
                                    if(mAvailableCustomizationRecipes !== null)
                                    {
                                        for(let j = (mAvailableCustomizationRecipes.values.length - 1); j >= 0; j--)
                                        {
                                            if(currentSchematic.recipes.includes(mAvailableCustomizationRecipes.values[j].pathName))
                                            {
                                                mAvailableCustomizationRecipes.values.splice(j, 1);
                                            }
                                        }
                                    }
                                    break;
                                case 'available': // Go to purchased state
                                    // Let the game fills the proper recipes...
                                    break;
                            }
                    }
            }

            // Handle emotes
            if(currentSchematic.emotes !== undefined)
            {
                let unlockSubSystem = this.baseLayout.unlockSubSystem.get();
                    if(unlockSubSystem !== null)
                    {
                        let mUnlockedEmotes  = this.baseLayout.getObjectProperty(unlockSubSystem, 'mUnlockedEmotes');
                            if(mUnlockedEmotes !== null)
                            {
                                switch(currentStatus)
                                {
                                    case 'purchased': // Go to none state
                                    case 'none': // Go to available state
                                        if(mUnlockedEmotes !== null)
                                        {
                                            for(let j = (mUnlockedEmotes.values.length - 1); j >= 0; j--)
                                            {
                                                if(currentSchematic.emotes.includes(mUnlockedEmotes.values[j].pathName))
                                                {
                                                    mUnlockedEmotes.values.splice(j, 1);
                                                }
                                            }
                                        }
                                        break;
                                    case 'available': // Go to purchased state
                                        // Let the game fills the proper recipes...
                                        break;
                                }
                            }
                    }
            }

            // Handle tapes
            if(currentSchematic.tapes !== undefined)
            {
                let unlockSubSystem = this.baseLayout.unlockSubSystem.get();
                    if(unlockSubSystem !== null)
                    {
                        let mUnlockedTapes  = this.baseLayout.getObjectProperty(unlockSubSystem, 'mUnlockedTapes');
                            if(mUnlockedTapes !== null)
                            {
                                switch(currentStatus)
                                {
                                    case 'purchased': // Go to none state
                                    case 'none': // Go to available state
                                        if(mUnlockedTapes !== null)
                                        {
                                            for(let j = (mUnlockedTapes.values.length - 1); j >= 0; j--)
                                            {
                                                if(currentSchematic.tapes.includes(mUnlockedTapes.values[j].pathName))
                                                {
                                                    mUnlockedTapes.values.splice(j, 1);
                                                }
                                            }
                                        }
                                        break;
                                    case 'available': // Go to purchased state
                                        // Let the game fills the proper recipes...
                                        break;
                                }
                            }
                    }
            }
        }
    }



    /*
     * MODAL
     */
    getSchematicsUnlocks(currentSchematic)
    {
        let unlocks = [];
            if(currentSchematic.recipes !== undefined)
            {
                for(let k = 0; k < currentSchematic.recipes.length; k++)
                {
                    if(
                            currentSchematic.recipes[k].startsWith('/Game/FactoryGame/Buildable/-Shared/Customization/') === false
                         && currentSchematic.recipes[k] !== '/Game/FactoryGame/Schematics/ResourceSink/Patterns/CBG_PatternRemoval.CBG_PatternRemoval_C'
                    )
                    {
                        let currentRecipe = this.baseLayout.getRecipeFromClassName(currentSchematic.recipes[k]);
                            if(currentRecipe !== null)
                            {
                                unlocks.push(currentRecipe.name);
                            }
                            else
                            {
                                unlocks.push(currentSchematic.recipes[k]);
                            }
                    }
                }
            }
            if(currentSchematic.schematics !== undefined)
            {
                for(let k = 0; k < currentSchematic.schematics.length; k++)
                {
                    if(
                            currentSchematic.schematics[k].startsWith('/Game/FactoryGame/Schematics/ResourceSink/Customizer_Background/') === false
                         && currentSchematic.schematics[k] !== '/Game/FactoryGame/Schematics/Progression/CustomizerUnlock_PipelineSwatch.CustomizerUnlock_PipelineSwatch_C'
                    )
                    {
                        let schematicId = currentSchematic.schematics[k].split('.');
                            schematicId = schematicId.pop();
                        if(this.baseLayout.schematicsData[schematicId] !== undefined)
                        {
                            unlocks.push(this.baseLayout.schematicsData[schematicId].name);
                        }
                        else
                        {
                            unlocks.push(currentSchematic.schematics[k]);
                        }
                    }
                }
            }
            if(currentSchematic.scannerPairs !== undefined)
            {
                for(let k = 0; k < currentSchematic.scannerPairs.length; k++)
                {
                    if(currentSchematic.scannerPairs[k] === '/Game/FactoryGame/Resource/RawResources/Geyser/Desc_Geyser.Desc_Geyser_C')
                    {
                        unlocks.push('Resource Scanner: Geyser');
                    }
                    else
                    {
                        let currentRecipe = this.baseLayout.getItemDataFromClassName(currentSchematic.scannerPairs[k]);
                            if(currentRecipe !== null)
                            {
                                unlocks.push('Resource Scanner: ' + currentRecipe.name);
                            }
                            else
                            {
                                unlocks.push('Resource Scanner: ' + currentSchematic.scannerPairs[k]);
                            }
                    }
                }
            }
            if(currentSchematic.slots !== undefined)
            {
                unlocks.push(currentSchematic.slots + ' Inventory Slot(s)');
            }
            if(currentSchematic.equipmentSlots !== undefined)
            {
                unlocks.push(currentSchematic.equipmentSlots + ' Equipment Slot(s)');
            }


            if(unlocks.length > 0)
            {
                return '<br /><u>Unlocks:</u> <em>' + unlocks.join(', ') + '</em>';
            }

        return '';
    }
}