/* global Intl */

export default class Modal_Map_Todo
{
    constructor(options)
    {
        this.baseLayout = options.baseLayout;
    }

    parse()
    {
        let todoHeaderHtml  = [];
        let todoHtml        = [];

        for(let pathName in this.baseLayout.players)
        {
            let mOwnedPawn  = this.baseLayout.players[pathName].getOwnedPawn();
                if(mOwnedPawn !== null)
                {
                    todoHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ((this.baseLayout.players[pathName].isHost() === true) ? 'active' : '') + '" data-toggle="tab" href="#playerInventory-' + mOwnedPawn.pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">');
                    todoHeaderHtml.push(this.baseLayout.players[pathName].getDisplayName());
                    todoHeaderHtml.push('</span></li>');

                    todoHtml.push('<div class="tab-pane fade ' + ((this.baseLayout.players[pathName].isHost() === true) ? 'show active' : '') + '" id="playerInventory-' + mOwnedPawn.pathName.replace('Persistent_Level:PersistentLevel.', '') + '">');
                    todoHtml.push('<div class="row">');
                    todoHtml.push('<div class="col-4">');
                        todoHtml.push('<h5 class="border-bottom border-warning">' + this.baseLayout.translate._('Public Notes') + '</h5>');
                            let mPublicTodoList = this.baseLayout.gameStateSubSystem.getPublicTodoList();
                                if(mPublicTodoList !== null)
                                {
                                    todoHtml.push(this.parseNote(mPublicTodoList));
                                }
                        todoHtml.push('<h5 class="border-bottom border-warning mt-3">' + this.baseLayout.translate._('Private Notes') + '</h5>');
                            let mPrivateTodoList = this.baseLayout.getObjectProperty(this.baseLayout.players[pathName].player, 'mPrivateTodoList');
                                if(mPrivateTodoList !== null)
                                {
                                    todoHtml.push(this.parseNote(mPrivateTodoList));
                                }
                    todoHtml.push('</div>');
                    todoHtml.push('<div class="col-8">');

                        todoHtml.push('<h5 class="border-bottom border-warning">' + this.baseLayout.translate._('Recipes') + '</h5>');

                        let todoIngredients = {};
                        let mShoppingList   = this.baseLayout.getObjectProperty(this.baseLayout.players[pathName].player, 'mShoppingList');
                            if(mShoppingList !== null)
                            {
                                todoHtml.push('<ul class="list-group list-group-flush">');
                                for(let i = 0; i < mShoppingList.values.length; i++)
                                {
                                    let currentRecipe   = null;
                                    let currentAmount   = 0;

                                    for(let j = 0; j < mShoppingList.values[i].length; j++)
                                    {
                                        if(mShoppingList.values[i][j].type === 'Object')
                                        {
                                            currentRecipe = this.baseLayout.getRecipeFromClassName(mShoppingList.values[i][j].value.pathName);
                                        }
                                        if(mShoppingList.values[i][j].type === 'Int')
                                        {
                                            currentAmount = mShoppingList.values[i][j].value;
                                        }
                                    }

                                    if(currentRecipe !== null)
                                    {
                                        todoHtml.push('<li class="list-group-item d-flex justify-content-between align-items-center p-0 py-1">');
                                            todoHtml.push('' + currentRecipe.name + '');
                                            todoHtml.push('<span class="float-right"><strong>' + new Intl.NumberFormat(this.baseLayout.language).format(currentAmount) + '</strong></span>');
                                        todoHtml.push('</li>');

                                        if(currentRecipe.ingredients !== undefined)
                                        {
                                            for(let className in currentRecipe.ingredients)
                                            {
                                                if(todoIngredients[className] === undefined)
                                                {
                                                    todoIngredients[className]  = currentRecipe.ingredients[className];
                                                }
                                                else
                                                {
                                                    todoIngredients[className] += currentRecipe.ingredients[className];
                                                }
                                            }
                                        }
                                    }
                                }
                                todoHtml.push('</ul>');

                                todoHtml.push('<h5 class="border-bottom border-warning mt-3">' + this.baseLayout.translate._('Ingredients') + '</h5>');
                                todoHtml.push('<ul class="list-group list-group-flush">');

                                let playerInventory = this.baseLayout.getObjectInventory(mOwnedPawn, 'mInventory');
                                    todoIngredients = Object.fromEntries(Object.entries(todoIngredients).sort(([,a],[,b]) => b - a));
                                for(let className in todoIngredients)
                                {
                                    let currentPlayerAmount = 0;
                                        for(let i = 0; i < playerInventory.length; i++)
                                        {
                                            if(playerInventory[i] !== null && playerInventory[i].className === className)
                                            {
                                                currentPlayerAmount += playerInventory[i].qty;
                                            }
                                        }

                                    let currentItem = this.baseLayout.getItemDataFromClassName(className);
                                        todoHtml.push('<li class="list-group-item d-flex justify-content-between align-items-center p-0 py-1">');
                                            todoHtml.push('<span><img src="' + currentItem.image + '" class="img-fluid mr-3" style="width: 32px;"> ' + currentItem.name + '</span>');
                                            todoHtml.push('<span class="float-right"><strong>' + new Intl.NumberFormat(this.baseLayout.language).format(currentPlayerAmount) + ' / ' + new Intl.NumberFormat(this.baseLayout.language).format(todoIngredients[className]) + '</strong></span>');
                                        todoHtml.push('</li>');
                                }
                                todoHtml.push('</ul>');
                            }
                            else
                            {
                                todoHtml.push('<div class="text-center">No recipes added!</div>');
                            }

                    todoHtml.push('</div>');
                    todoHtml.push('</div>');
                    todoHtml.push('</div>');
                }
        }

        $('#statisticsPlayerTodo').empty().html('<ul class="nav nav-tabs nav-fill">' + todoHeaderHtml.join('') + '</ul>'
                                           + '<div class="tab-content border border-top-0 p-3">' + todoHtml.join('') + '</div>'
                                           + '</div>');
    }

    parseNote(str)
    {
        str = str.replace('[x]', '<span class="text-warning">[</span><strong style="display: inline-block;width: 10px;text-align: center;">x</strong><span class="text-warning">]</span>');
        str = str.replace('[]', '<span class="text-warning">[<span style="display: inline-block;width: 10px;"></span>]</span>');
        str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');

        return str;
    }
}