/*!
 * Vocabulary @@version
 * https://github.com/visiongeist/vocabulary
 *
 *
 * Copyright 2014 Damien Antipa
 * Released under the MIT license
 *
 * Date: @@date
 */
(function (win, undefined) {

    // const
    var VERSION = '@@version',
        DEBUG = @@debug,
        GLOBAL_NAME = '@@global-name',
        PREFIX = '@@prefix',
        ACTION_IDENTIFIER = '@@action-identifier',
        DEFAULT_EVENT = '@@default-event',
        EVENTS = @@events;

    // private
    var store = {};

    // dictionary (is also a chapter)
    /**
     * A dictionary is a collection of chapters
     * @constructor Dictionary
     * @augments Chapter
     *
     * @param name
     */
    function Dictionary(name) {
        this._chapters = {};

        this.constructor.prototype.constructor.call(this, name);
    }

    /**
     * Returns a chapter or a list of available chapters
     * @memberof Dictionary
     * @param  {String} [name] name of a chapter or empty to list all
     * @return {Chapter|Chapter[]}
     */
    Dictionary.prototype.chap = function (name) {
        return name ? this._chapters[name] = this._chapters[name] || (new Chapter(name))
            : this._chapters;
    };

    /**
     * A chapter is a collection of words which are associated to actions
     * @constructor Chapter
     * @param  {String} name name of a chapter or empty to list all
     */
    function Chapter(name) {
        this.name = name;

        this._actions = {};
    }

    // a dictionary may be directly used as a chapter
    Dictionary.prototype = new Chapter();

    /**
     * Add new word to a chapter
     * @memberof Chapter
     * @param {String} word
     * @param {Function} fn
     * @param {Mixed} [options]
     */
    Chapter.prototype.add = function (word, fn, options) {
        // TODO add plugin hook
        // plugins should be to react on options

        this._actions[word] = fn;

        return this;
    };

    /**
     * Directly execute a word
     * @memberof Chapter
     * @param  {String} word
     * @param  {Object} options
     * @return {Dictionary} the current dictionary
     */
    Chapter.prototype.execute = function (word, options) {
        // TODO add plugin hook
        // plugins should be able to modify the options before they get passed to the handler

        if (this._actions[word]) {
            this._actions[word].call(this, options);
        } else if (DEBUG) {
            console.warn('No action defined for ' + word, this, options);
        }

        return this;
    };

    /**
     * @memberof Chapter
     * @return {Object} [description]
     */
    Chapter.prototype.list = function () {
        return this._actions;
    };

    /**
     * @namespace vocabulary
     */
    var vocabulary = {

        /**
         * version of the running vocabulary
         * @memberof vocabulary
         * @type {String}
         */
        version: VERSION,

        /**
         * List of bound event types
         * @memberof vocabulary
         * @type {String[]}
         */
        events: [],

        /**
         * adds additional events for observation
         * @memberof vocabulary
         * @param {String[]|String} evt Array of event names or space separated list of events
         */
        addEvent: function (evt) {
            var events = evt instanceof Array ? evt : evt.split(' ');

            for (var i=0; i < evt.length; i++) {
                // add event for information purpose
                this.events.push(evt[i]);

                //register delegation
                document.addEventListener(evt[i], eventHandler);
            }
        },

        /**
         * access a dictionary
         * @memberof vocabulary
         * @param  {String} [name]
         * @return {Dictionary|Object} the dictionary to lookup or a key-value map of all dictionaries if name is null
         */
        dict: function (name) {
            return name ? store[name] = store[name] || (new Dictionary(name))
                : store;
        }

    };

    /**
     * Find actions in the chain
     * @private
     * @param  {HTMLElement} target
     * @return {HTMLElement[]}
     */
    function matchIdentifier(target) {
        // TODO add plugin hook
        // plugins should be able to filter additionally

        var result = [],
            node = target,
            search = PREFIX + '-' + ACTION_IDENTIFIER;

        while (node && node !== document) {
            if (node.classList.contains(search)) {
                result.push(node);
            }

            node = node.parentNode;
        }

        return result;
    }

    /**
     * Handling the events
     * @param  {Event} ev
     */
    function eventHandler(ev) {
        var hit = matchIdentifier(ev.target),
            actionId = PREFIX + '-' + ACTION_IDENTIFIER;

        if (hit.length) {
            for (var i=0; i < hit.length; i++) {

                // find commands
                for (var j=0; j < hit[i].classList.length; j++) {
                    if (hit[i].classList[j].indexOf(PREFIX + '-') === 0 && hit[i].classList[j] !== actionId) {

                        // PREFIX-DICT(-CHAP)-CMD(--EVENT)
                        var cmd = hit[i].classList[j].match(/([^-]+)-([^-]+)([^-]*)-([^-]+)--(.*)/),
                            options = {},
                            def = {
                                prefix: PREFIX,
                                dict: null,
                                chap: null,
                                word: null,
                                event: null
                            },
                            eventIsDef, selectedDict, dataAttr;

                        // either specific or default command
                        def.event = cmd[5] || DEFAULT_EVENT;

                        // event specific command
                        if (ev.type !== def.event) {
                            // abort if command does not match event
                            continue;
                        }

                        def.dict = cmd[2];
                        def.chap = cmd[3];
                        def.word = cmd[4];

                        //read data attributes
                        for (dataAttr in hit[i].dataset) {
                            if (hit[i].dataset.hasOwnProperty(dataAttr)) {
                                options[dataAttr] = hit[i].dataset[dataAttr];
                            }
                        }

                        // add additional data
                        options.definition = def;
                        options.target = hit[i];
                        options.originalEvent = ev;

                        //execute command
                        selectedDict = vocabulary.dict(def.dict);
                        (selectedDict || selectedDict.chap(def.chap)).execute(def.word, options);
                    }
                }

            }
        }
    }

    // add pre-configured events
    vocabulary.addEvent(EVENTS);

    // reveal
    win[GLOBAL_NAME] = vocabulary;

}(this));
