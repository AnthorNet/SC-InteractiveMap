export default class Modal_Node_Foundation
{
    static getHTML(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let fakeFoundation  = {
                    type            : 1,
                    className       : "/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x2_01.Build_Foundation_8x2_01_C",
                    pathName        : "Persistent_Level:PersistentLevel.Build_Foundation_8x2_01_C_XXX",
                    transform       : {
                        rotation        : [0, 0, 0, 1],
                        translation     : currentObject.transform.translation
                    },
                    properties      : [
                        { name: "mBuiltWithRecipe", type: "ObjectProperty", value: { levelName: "", pathName: "/Game/FactoryGame/Recipes/Buildings/Foundations/Recipe_Foundation_8x2_01.Recipe_Foundation_8x2_01_C" } },
                        { name: "mBuildTimeStamp", type: "FloatProperty", value: 0 }
                    ],
                    entity: {pathName: "Persistent_Level:PersistentLevel.BuildableSubsystem"}
                };
                fakeFoundation.pathName = baseLayout.generateFastPathName(fakeFoundation);

            baseLayout.buildableSubSystem.setObjectColorSlot(fakeFoundation, 16);

            baseLayout.saveGameParser.addObject(fakeFoundation);
            let resultCenter = baseLayout.parseObject(fakeFoundation);
                baseLayout.addElementToLayer(resultCenter.layer, resultCenter.marker);
    }
}