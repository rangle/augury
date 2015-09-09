var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'angular2/angular2', 'angular2/src/core/compiler/view_listener', 'angular2/src/core/debug/debug_element_view_listener', 'services/store'], function (require, exports, angular2_1, view_listener_1, debug_element_view_listener_1, store_1) {
    var ESC_KEY = 27;
    var ENTER_KEY = 13;
    var TodoItem = (function () {
        function TodoItem(todoStore) {
            this.todoStore = todoStore;
        }
        TodoItem.prototype.stopEditing = function (todo, editedTitle) {
            todo.setTitle(editedTitle.value);
            todo.editing = false;
        };
        TodoItem.prototype.cancelEditingTodo = function (todo) { todo.editing = false; };
        TodoItem.prototype.updateEditingTodo = function (editedTitle, todo) {
            editedTitle = editedTitle.value.trim();
            todo.editing = false;
            if (editedTitle.length === 0) {
                return this.todoStore.remove(todo.uid);
            }
            todo.setTitle(editedTitle);
        };
        TodoItem.prototype.editTodo = function (todo) {
            todo.editing = true;
        };
        TodoItem.prototype.removeCompleted = function () {
            this.todoStore.removeCompleted();
        };
        TodoItem.prototype.toggleCompletion = function (uid) {
            this.todoStore.toggleCompletion(uid);
        };
        TodoItem.prototype.remove = function (uid) {
            this.todoStore.remove(uid);
        };
        TodoItem = __decorate([
            angular2_1.Component({
                selector: 'todo-item',
                properties: ['todo: todo-obj']
            }),
            angular2_1.View({
                template: "\n      <div class=\"view\">\n        <input class=\"toggle\" type=\"checkbox\" (click)=\"toggleCompletion(todo.uid)\" [checked]=\"todo.completed\">\n        <label (dblclick)=\"editTodo(todo)\">{{todo.title}}</label>\n        <button class=\"destroy\" (click)=\"remove(todo.uid)\"></button>\n      </div>\n      <input class=\"edit\" *ng-if=\"todo.editing\" [value]=\"todo.title\" #editedtodo (blur)=\"stopEditing(todo, editedtodo)\" (keyup.enter)=\"updateEditingTodo(editedtodo, todo)\" (keyup.escape)=\"cancelEditingTodo(todo)\">\n  ",
                directives: [angular2_1.NgIf]
            }),
            __param(0, angular2_1.Inject(store_1.TodoStore))
        ], TodoItem);
        return TodoItem;
    })();
    var TodoApp = (function () {
        function TodoApp(todoStore) {
            this.todoStore = todoStore;
            //this.todoStore = new TodoStore();
        }
        TodoApp.prototype.removeCompleted = function () {
            this.todoStore.removeCompleted();
        };
        TodoApp = __decorate([
            angular2_1.Component({
                selector: 'todo-app',
            }),
            angular2_1.View({
                directives: [angular2_1.NgIf, angular2_1.NgFor, TodoItem],
                template: "\n\t\t<section class=\"todoapp\">\n      <header class=\"header\">\n\t\t\t\t<h1>todos</h1>\n\t\t\t\t<input class=\"new-todo\" placeholder=\"What needs to be done?\" autofocus=\"\" \n        #newtodo (keyup)=\"addTodo($event, newtodo)\">\n\t\t\t</header>\n\t\t\t<section class=\"main\" *ng-if=\"todoStore.todos.length > 0\">\n\t\t\t\t<input class=\"toggle-all\" type=\"checkbox\" *ng-if=\"todoStore.todos.length\" #toggleall [checked]=\"todoStore.allCompleted()\" (click)=\"todoStore.setAllTo(toggleall)\">\n\t\t\t\t<ul class=\"todo-list\">\n\t\t\t\t\t<li *ng-for=\"#todo of todoStore.todos\" [class.completed]=\"todo.completed\" [class.editing]=\"todo.editing\">\n\t\t\t\t\t   <todo-item [todo-obj]=\"todo\" ></todo-item>\n          </li>\n\t\t\t\t</ul>\n\t\t\t</section>\n\t\t\t<footer class=\"footer\" *ng-if=\"todoStore.todos.length > 0\">\n\t\t\t\t<span class=\"todo-count\"><strong>{{todoStore.getRemaining().length}}</strong> {{todoStore.getRemaining().length == 1 ? 'item' : 'items'}} left</span>\n\t\t\t\t<button class=\"clear-completed\" *ng-if=\"todoStore.getCompleted().length > 0\" (click)=\"removeCompleted()\">Clear completed</button>\n\t\t\t</footer>\n\t\t</section>"
            }),
            __param(0, angular2_1.Inject(store_1.TodoStore))
        ], TodoApp);
        return TodoApp;
    })();
    var appRefPromise = angular2_1.bootstrap(TodoApp, [
        angular2_1.bind(view_listener_1.AppViewListener).toClass(debug_element_view_listener_1.DebugElementViewListener),
        angular2_1.bind(store_1.TodoStore).toClass(store_1.TodoStore)
    ]);
    //let appRefPromise = bootstrap(TodoApp);
    appRefPromise.then(function (appRef) {
        window['appRef'] = appRef;
        console.log('awesome', appRef);
    });
});
//# sourceMappingURL=app.js.map