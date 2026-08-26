import SubSystem                                from '../SubSystem.js';

export default class SubSystem_RecipeManager extends SubSystem
{
    constructor(options)
    {
        options.pathName            = [
            'Persistent_Level:PersistentLevel.RecipeManager',
            'Persistent_Level:PersistentLevel.recipeManager'
        ];
        super(options);
    }

    getAvailableRecipes()
    {
        return this.baseLayout.getObjectProperty(this.subSystem, 'mAvailableRecipes');
    }

    getAvailableCustomizationRecipes()
    {
        return this.baseLayout.getObjectProperty(this.subSystem, 'mAvailableCustomizationRecipes');
    }
}
