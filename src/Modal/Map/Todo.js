import { marked }                               from '../../Lib/marked.esm.js';

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
                        todoHtml.push('<h5 class="border-bottom border-warning">Public Notes</h5>');
                            let mPublicTodoList = this.baseLayout.gameStateSubSystem.getPublicTodoList();
                                if(mPublicTodoList !== null)
                                {
                                    todoHtml.push(marked.parse(mPublicTodoList).replace(/(?:\r\n|\r|\n)/g, '<br>'));
                                }
                        todoHtml.push('<h5 class="border-bottom border-warning mt-3">Private Notes</h5>');
                            let mPrivateTodoList = this.baseLayout.getObjectProperty(this.baseLayout.players[pathName].player, 'mPrivateTodoList');
                                if(mPrivateTodoList !== null)
                                {
                                    todoHtml.push(marked.parse(mPrivateTodoList).replace(/(?:\r\n|\r|\n)/g, '<br>'));
                                }
                    todoHtml.push('</div>');
                    todoHtml.push('<div class="col-8">');

                        todoHtml.push('<h5 class="border-bottom border-warning">Recipes</h5>');

                        let mShoppingList     = this.baseLayout.getObjectProperty(this.baseLayout.players[pathName].player, 'mShoppingList');
                            if(mShoppingList !== null)
                            {
                                todoHtml.push('<ul class="list-group list-group-flush">');
                                for(let i = 0; i < mShoppingList.values.length; i++)
                                {
                                    let currentRecipe   = null;
                                    let currentAmount   = 0;

                                    for(let j = 0; j < mShoppingList.values[i].length; j++)
                                    {
                                        if(mShoppingList.values[i][j].type === 'ObjectProperty')
                                        {
                                            currentRecipe = this.baseLayout.getRecipeFromClassName(mShoppingList.values[i][j].value.pathName);
                                            //console.log(currentRecipe);
                                        }
                                        if(mShoppingList.values[i][j].type === 'IntProperty')
                                        {
                                            currentAmount = mShoppingList.values[i][j].value;
                                        }
                                    }

                                    if(currentRecipe !== null)
                                    {
                                        todoHtml.push('<li class="list-group-item d-flex justify-content-between align-items-center">');


                                        todoHtml.push('' + currentRecipe.name + '');
                                        todoHtml.push('<span class="float-right"><strong>' + currentAmount + '</strong></span>');

                                        todoHtml.push('</li>');
                                    }
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
}