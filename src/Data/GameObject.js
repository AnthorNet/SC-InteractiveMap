/**
 * Get the root of the give path name.
 *
 * @example
 * // returns "Persistent_Level:PersistentLevel.Build_ConstructorMk1_C_2147415647"
 * getPathNameComponent("Persistent_Level:PersistentLevel.Build_ConstructorMk1_C_2147415647.InputInventory");
 *
 * @param {string} pathName
 * @returns string
*/
export function getPathNameRoot(pathName) {
    return pathName.substring(0, pathName.lastIndexOf("."));
}

/**
 * Get the component of the give path name.
 *
 * @example
 * // returns ".InputInventory"
 * getPathNameComponent("Persistent_Level:PersistentLevel.Build_ConstructorMk1_C_2147415647.InputInventory");
 *
 * @param {string} pathName
 * @returns string
 */
export function getPathNameComponent(pathName) {
    return pathName.substring(pathName.lastIndexOf("."));
}