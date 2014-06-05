[Vocabulary](http://github.com/visiongeist/vocabulary)
==================================================

Vocubulary is a tiny helper which allows you to give your HTML the semantic it deserves when you add your custom Javascript functionality.

*Short Story*

Let's assume you have a button which should execute some Javascript code

```html
<button id="myButton">Click me</button>
```
Rather then writing a piece of code which binds an event handler and executes the logic as you used to do it ...

```js
var btn = document.getElementById('myButton');

btn.addEventListener('click', function () {
  alert('you clicked me');
});
```

... you would annotate your markup properly ...

```html
<button id="myButton" class="voc-action voc-todo-deleteEntry">Click me</button>
```

and allow people to understand the purpose of the markup without searching through your source code.

You will find the [long story](http://damien.antipa.at/blog/2014/05/16/give-back-some-semantic-to-your-html-and-create-a-vocabulary/) on my [blog](http://damien.antipa.at/).

Concept
------------------------------------

Think of your desirable actions as a unique word in a vocabulary. **deleteEntry** would be one of these words. Obviously **deleteEntry** is not a really unique expression in a global scope. To make the creation of unique expressions easier we will have multiple dictionaries in our vocabulary. In the previous example we created a dictionary called **todo**. Within this dictionary **deleteEntry** was unique. However dictionaries can be huge and hard to find a word in it. Therefor a dictionary may have chapters. So that a word does not need to be unique in a dictionary anymore but in one of its chapters.

Technically **vocabulary** provides 3 broad terms: Dictionary, Chapter, Word

Vocabulary -> has dictionaries -> [has chapters ->] has words


Basic Usage
------------------------------------

To define a new word we will access the global object called vocabulary. 
```js
window.vocabulary;
```
We will create a new dictionary or access an existing one by using the *dict()* method.
```js
vocabulary.dict('todo');
```
Now we are able to add new words to the dictionary.
```js
vocabulary.dict('todo').add('deleteEntry', function (opt) {
	console.log('entry deleted');
});
```
Or to one of its chapters.
```js
vocabulary.dict('todo').chap('foo').add('deleteEntry', function (opt) {
	console.log('entry deleted');
});
```
Since we have our code in place, we could simple trigger it.

```js
vocabulary.dict('todo').execute('deleteEntry');
```

Or properly annotate our button (or any other HTML markup) to trigger the action
```html
<button id="myButton" class="voc-action voc-todo-deleteEntry">Click me</button>
```

Additional Things
------------------------------------

##### .voc-action

The *voc-action* css class has to be added to the element which is annotated with the action. This is necessary for performance reasons, because the actions will be detected through event delegation. Setting this will avoid having performance issues when huge dictionaries are in place.

##### Handler arguments

The handler function which was defined through *add()* will have the *this* object set to the Chapter or Dictionary if directly attached to it. Additionally an object is passed as the first argument. It will contain these default properties.

```js
{
	target: HTMLElement, // element which contained the defined action
	originalEvent: Event // browser event
}
```

##### passing options

As described the first argument of the handler function will contain an object. This object contains a key/value list of values passed through *data-* attributes.

```html
<button id="myButton" class="voc-action voc-todo-deleteEntry" data-entry-name="foo">Click me</button>
```

```js
vocabulary.dict('todo').add('deleteEntry', function (opt) {
  console.log('entry '+ opt.entryName +' deleted');
});
```

The *deleteEntry* will be able to access the value through its first argument *opt.entryName*

##### Events

Word definitions are independent of the event type and usually reacts on click events. Though through annotation of the css class it is possible to bind the function to another event.

```html
<select class="voc-action voc-todo-updateEntry--change">
  <option>Chinese</option>
  <option selected>English</option>
  <option>French</option>
  <option>German</option>
  <option>Italian</option>
  <option>Japanese</option>
  <option>Korean</option>
  <option>Portuguese</option>
  <option>Spanish</option>
</select>
```

The added double dash will limit the execution of the handler to change events. Most of the default browser events are observed by the vocabulary. Adding new events which can be used is done through a build configuration or by calling *vocabulary.addEvent('customEvent')*.

##### API Documentation

The [JSdoc](https://rawgit.com/visiongeist/vocabulary/master/docs/index.html) is build under */docs* or viewable through [rawgit](https://rawgit.com/visiongeist/vocabulary/master/docs/index.html). Sorry for the ugly default template. 

How to add Plugins/Helpers
------------------------------------
coming soon

Example
------------------------------------
I adapted the [todo-mvc example](https://rawgit.com/visiongeist/vocabulary/master/example/index.html) from jQuery to vocabulary quickly. Available under */example*

How to Customize your Build
------------------------------------
You may customize several build options before running grunt to change the prefix or the global namespace. *config.json* should be self-explainable.

Dependencies
------------------------------------
none

Browser Support
------------------------------------
IE10+, evergreens Chrome, Firefox, Android 3.0+, iOS 5.0+

[classList](https://gist.github.com/devongovett/1381839) polyfill for IE 9.0
[addEventListener](http://css-tricks.com/snippets/javascript/addeventlistner-polyfill/) polyfill for IE 8.0 and older
