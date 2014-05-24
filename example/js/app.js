/*global voc, Handlebars */
(function () {
    'use strict';

    Handlebars.registerHelper('eq', function(a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });

    var ENTER_KEY = 13;
    var ESCAPE_KEY = 27;

    var util = {
        uuid: function () {
            /*jshint bitwise:false */
            var i, random;
            var uuid = '';

            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
            }

            return uuid;
        },
        pluralize: function (count, word) {
            return count === 1 ? word : word + 's';
        },
        store: function (namespace, data) {
            if (arguments.length > 1) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            } else {
                var store = localStorage.getItem(namespace);
                return (store && JSON.parse(store)) || [];
            }
        }
    };

    var Todo = {
        create: function (opt) {
            var val = opt.target.value;

            if (opt.originalEvent.which !== ENTER_KEY || !val) {
                return;
            }

            App.todos.push({
                id: util.uuid(),
                title: val,
                completed: false
            });

            opt.target.value = '';

            App.render();
        },
        toggleAll: function (opt) {
            var isChecked = opt.target.checked;

            App.todos.forEach(function (todo) {
                todo.completed = isChecked;
            });

            App.render();
        },
        toggle: function (e) {
            var i = App.indexFromEl(e.target);
            App.todos[i].completed = !App.todos[i].completed;
            App.render();
        },
        edit: function (opt) {
            var entry = App.getEntryEl(opt.target),
                input = entry.getElementsByClassName('edit')[0];

            entry.classList.add('editing');
            input.focus();
        },
        editKeyup: function (opt) {
            var key = opt.originalEvent.which;

            if (key === ESCAPE_KEY) {
                opt.target.dataset.abort = true;
            }

            if (key === ENTER_KEY || key === ESCAPE_KEY) {
                opt.target.blur();
            }
        },
        update: function (e) {
            var val = opt.target.value;

            if (opt.target.dataset.abort) {
                opt.target.dataset.abort = false;
                App.render();
                return;
            }

            var i = App.indexFromEl(opt.target);

            if (val) {
                App.todos[i].title = val;
            } else {
                App.todos.splice(i, 1);
            }

            App.render();
        },
        destroy: function (opt) {
            App.todos.splice(opt.id, 1);
            App.render();
        },
        destroyCompleted: function () {
            App.todos = App.getActiveTodos();
            App.filter = 'all';
            App.render();
        }
    };

    var App = {
        init: function () {
            this.todos = util.store('todos-voc');
            this.cacheElements();
            this.bindEvents();

            Router({
                '/:filter': function (filter) {
                    this.filter = filter;
                    this.render();
                }.bind(this)
            }).init('/all');
        },
        cacheElements: function () {
            this.todoTemplate = Handlebars.compile(document.getElementById('todo-template').innerHTML);
            this.footerTemplate = Handlebars.compile(document.getElementById('footer-template').innerHTML);

            this.todoList = document.getElementById('todo-list');
            this.header = document.getElementById('header');
            this.main = document.getElementById('main');
            this.footer = document.getElementById('footer');
            this.newTodo = document.getElementById('new-todo');
            this.toggleAll = document.getElementById('toggle-all');
            this.count = document.getElementById('todo-count');
            this.clearBtn = document.getElementById('clear-completed');
        },
        bindEvents: function () {
            vocabulary.dict('todo')
                .add('createEntry', Todo.create)
                .add('toggleAll', Todo.toggleAll)
                .add('clearCompleted', Todo.destroyCompleted)
                .add('toggleEntry', Todo.toggle)
                .add('editEntry', Todo.edit)
                .add('saveEditEntry', Todo.editKeyup)
                .add('updateEntry', Todo.update)
                .add('deleteEntry', Todo.destroy);
        },
        render: function () {
            var todos = this.getFilteredTodos();
            this.todoList.innerHTML = this.todoTemplate(todos);
            this.main.style.display = todos.length > 0 ? 'block' : 'none';
            this.toggleAll.checked = this.getActiveTodos().length === 0;
            this.renderFooter();
            this.newTodo.focus();
            util.store('todos-jquery', this.todos);
        },
        renderFooter: function () {
            var todoCount = this.todos.length;
            var activeTodoCount = this.getActiveTodos().length;
            var template = this.footerTemplate({
                activeTodoCount: activeTodoCount,
                activeTodoWord: util.pluralize(activeTodoCount, 'item'),
                completedTodos: todoCount - activeTodoCount,
                filter: this.filter
            });

            this.footer.style.display = todoCount > 0 ? 'block' : 'none';
            this.footer.innerHTML = template;
        },
        getActiveTodos: function () {
            return this.todos.filter(function (todo) {
                return !todo.completed;
            });
        },
        getCompletedTodos: function () {
            return this.todos.filter(function (todo) {
                return todo.completed;
            });
        },
        getFilteredTodos: function () {
            if (this.filter === 'active') {
                return this.getActiveTodos();
            }

            if (this.filter === 'completed') {
                return this.getCompletedTodos();
            }

            return this.todos;
        },
        getEntryEl: function (el) {
            var tempNode = el;

            while ((tempNode = tempNode.parentNode) && tempNode !== document) {
                if (tempNode.nodeName.toLowerCase() === 'li') {
                    return tempNode;
                }
            }

            return null;
        },
        // accepts an element from inside the `.item` div and
        // returns the corresponding index in the `todos` array
        indexFromEl: function (el) {
            return this.indexFromId(this.getEntryEl(el).dataset.id);
        },
        indexFromId: function (id) {
            var todos = this.todos;
            var i = todos.length;

            while (i--) {
                if (todos[i].id === id) {
                    return i;
                }
            }
        }
    };

    App.init();

}());
