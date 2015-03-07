/**
 * Created by anatoliyz on 03.03.2015.
 */

//Namespace nsDictionary
var nsDictionary = nsDictionary || {};

nsDictionary.SimpleDictionary = (function () {
    //private
    var _words = [];

    function _addWord(word, definition) {
        _words.push({
            word: word,
            definition: definition
        });
        _sortWords();
    }

    function _addWords(words, wordProp, definitionProp) {
        for (var key in words)
            _words.push({
                word: words[key][wordProp],
                definition: words[key][definitionProp]
            })
        _sortWords();
    }

    function _generateAlphabet() {
        var alphabet = [];
        _words.forEach(
            function addToAlphabet(element) {
                var char = element.word[0].toLowerCase();
                if (alphabet.indexOf(char) < 0)
                    alphabet.push(char);
            }
        );
        return alphabet;
    }

    function _sortWords() {
        _words.sort(function (a, b) {
            if (a.word.toLowerCase() > b.word.toLowerCase()) {
                return 1;
            }
            if (a.word.toLowerCase() < b.word.toLowerCase()) {
                return -1;
            }
            return 0;
        });
    }

    function _getWord(index) {
        return _words[index].word;
    }

    function _getDefinition(index) {
        return _words[index].definition;
    }

    function _getAllWordsAsJson() {
        return JSON.stringify(_words)
    }

    function _getWordsStartingFromLetter(letter) {
        var wordslist = [];
        _words.filter(
            function isStartWith(word) {
                return word.word[0].toLowerCase() === letter.toLowerCase()
            }
        ).forEach(
            function getWordId(word) {
                wordslist.push(_words.indexOf(word))
            }
        );
        return wordslist;
    }

    return { //exposed to public
        /**
         * Get Alphabet (collection of first letters of every word in a Dictionary)
         * @returns {Array} Array of strings
         */
        alphabet: function () {
            return _generateAlphabet();
        },

        /**
         * Add word to Dictionary
         * @param word {string} A word
         * @param def {string} A definition for the word
         */
        addWord: function (word, def) {
            _addWord(word, def)
        },

        /**
         * Add multiple words to Dictionary
         * @param words {Array} Array of words
         * @param wordProp {string} Name of the property containing word
         * @param definitionProp {string} Name of the property containing definition
         */
        addWords: function (words, wordProp, definitionProp) {
            _addWords(words, wordProp, definitionProp)
        },

        /**
         * Get word from Dictionary by its index
         * @param index {number} Index of the word
         * @returns {string} Word at the specified index in the array
         */
        getWord: function (index) {
            return _getWord(index);
        },

        /**
         * Get all words as JSON string. Useful for saving data.
         * @returns {string}
         */
        getAllWordsAsJson: function () {
            return _getAllWordsAsJson()
        },

        /**
         * Get definition of a word at a specified index in the Dictionary
         * @param index {number} Index of the word
         * @returns {string} Definition of the word at the specified index
         */
        getDefinition: function (index) {
            return _getDefinition(index);
        },

        /**
         * Get list of words starting from a particular letter
         * @param letter {string} A letter
         * @returns {Array} List of words starting from the specified letter
         */
        getWordsStartingFromLetter: function (letter) {
            return _getWordsStartingFromLetter(letter);
        }
    }
}());

nsDictionary.SimpleDictionaryDataStorage = (function () {
    var _localStorageLabel = 'nsDictionary.SimpleDictionary.words';
    var _wordPropertyName = 'word';
    var _definitionPropertyName = 'definition';

    function _supportsHtml5Storage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    function _getDataFromJson(args) {
        var r = new XMLHttpRequest();
        r.addEventListener('load',
            function transferComplete(event) {
                nsDictionary.SimpleDictionary.addWords(
                    JSON.parse(event.target.responseText),
                    args.wordPropertyName, args.definitionPropertyName
                );

                if (args.onLoad)
                    args.onLoad();
            }
            , false);
        r.addEventListener('error', function transferFailed() {
            console.log('ERROR: An error occurred while transferring the file.');
        }, false);
        r.open('GET', args.url, true);
        r.send();
    }

    function _getDataFromLocalStorage() {
        if (!_supportsHtml5Storage())return null;
        return JSON.parse(
            localStorage.getItem(_localStorageLabel)
        );
    }

    function _saveDataToLocalStorage() {
        if (!_supportsHtml5Storage()) return;
        localStorage.setItem(_localStorageLabel, nsDictionary.SimpleDictionary.getAllWordsAsJson())
    }

    function _removeDataFromLocalStorage() {
        if (!_supportsHtml5Storage()) return;
        localStorage.removeItem(_localStorageLabel)
    }

    function _loadData(args) {
        var words = _getDataFromLocalStorage();

        if (words) {
            nsDictionary.SimpleDictionary.addWords(
                words, _wordPropertyName, _definitionPropertyName
            );

            if (args.onLoad)
                args.onLoad();
        }
        else
            _getDataFromJson(args);
    }

    return {
        loadData: function (args) {
            _loadData(args);
        },

        saveData: function () {
            _saveDataToLocalStorage();
        },

        clearData: function () {
            _removeDataFromLocalStorage();
        }
    }

}());

nsDictionary.SimpleDictionaryView = (function () {
    var _constants = {
        attrDataLetter: 'data-letter',
        attrDataWordId: 'data-word-id',
        attrHref: 'href',
        elemLink: 'a',
        elemUnorderedList: 'ul',
        elemListItem: 'li',
        eventClick: 'click',
        idAlphabet: 'alphabet',
        idBtnAdd: 'btn-add',
        idShowFormAdd: 'show-add-form',
        idFormAdd: 'add-word',
        idInputWord: 'input-add-word',
        idInputDef: 'input-add-def',
        idSaveData: 'save-data',
        idClearData: 'clear-data',
        idWordCard: 'word-card',
        idWordCardBack: 'word-card-back',
        idWordCardDefinition: 'word-card-definition',
        idWordCardWord: 'word-card-word',
        idWordList: 'word-list',
        styleDisplayNone: 'none',
        styleDisplayEmpty: '',
        //This constant is intentionally left blank
        //to show an example during init
        valueNotReload: ''
    }

    function $(id) {
        return document.getElementById(id);
    }

    var _currentLetter = '';

    function _getEventTarget(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        if (target.nodeType == 3) target = target.parentNode;
        return target;
    }

    function _addClickEventListeners(elements) {
        elements.forEach(function addHandler(element) {
            $(element.id).addEventListener(_constants.eventClick, element.eventHandler)
        });
    }

    function _setInnerText(id, text) {
        if (document.all) {
            $(id).innerText = text;
        } else {
            $(id).textContent = text;
        }
    }

    function _toggleVisibility(elements) {
        elements.forEach(function setVisibility(element) {
            if (element.show)
                $(element.id).style.display = _constants.styleDisplayEmpty;
            else
                $(element.id).style.display = _constants.styleDisplayNone;
        });
    }

    function _renderLinkList(source, dataAttr, eventHandler, textNode, containerId) {
        var ul = document.createElement(_constants.elemUnorderedList);

        for (var i = 0; i < source.length; i++) {
            var link = document.createElement(_constants.elemLink);
            link.setAttribute(_constants.attrHref, _constants.valueNotReload);
            link.setAttribute(dataAttr, source[i]);
            link.addEventListener(_constants.eventClick, eventHandler, false);
            link.appendChild(document.createTextNode(textNode(source[i])));

            var li = document.createElement(_constants.elemListItem);
            li.appendChild(link);
            ul.appendChild(li);
        }

        var container = $(containerId)
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(ul);
    }

    function _onWordCardBackClick(evt) {
        _showWordsByFirstLetter(_currentLetter);
    }

    function _showWordDefinition(index) {
        _toggleVisibility([
            {id: _constants.idWordList, show: false},
            {id: _constants.idFormAdd, show: false},
            {id: _constants.idWordCard, show: true}
        ]);
        _setInnerText(_constants.idWordCardWord, nsDictionary.SimpleDictionary.getWord(index));
        _setInnerText(_constants.idWordCardDefinition, nsDictionary.SimpleDictionary.getDefinition(index));
    }

    function _onWordClick(e) {
        _showWordDefinition(_getEventTarget(e).getAttribute(_constants.attrDataWordId))
    }

    function _showWordsByFirstLetter(letter) {
        _currentLetter = letter;

        _toggleVisibility([
            {id: _constants.idWordList, show: true},
            {id: _constants.idFormAdd, show: false},
            {id: _constants.idWordCard, show: false}
        ]);

        _renderLinkList(nsDictionary.SimpleDictionary.getWordsStartingFromLetter(letter),
            _constants.attrDataWordId,
            _onWordClick,
            function (i) {
                return nsDictionary.SimpleDictionary.getWord(i)
            },
            _constants.idWordList);
    }

    function _onLetterClick(e) {
        _showWordsByFirstLetter(_getEventTarget(e).getAttribute(_constants.attrDataLetter));
    }

    function _renderAlphabet() {
        _renderLinkList(nsDictionary.SimpleDictionary.alphabet(),
            _constants.attrDataLetter,
            _onLetterClick,
            function (i) {
                return i
            },
            _constants.idAlphabet);
    }

    function _onLinkShowAddFromClick(evt) {
        _toggleVisibility([
            {id: _constants.idWordList, show: false},
            {id: _constants.idFormAdd, show: true},
            {id: _constants.idWordCard, show: false}
        ]);
    }

    function _onBtnAddClick(evt) {
        var word = $(_constants.idInputWord).value;
        var definition = $(_constants.idInputDef).value;

        if (word != '' && definition != '') {
            nsDictionary.SimpleDictionary.addWord(word, definition);
            _redrawPanels(word[0]);
        }
    }

    function _onSaveDataClick(evt) {
        nsDictionary.SimpleDictionaryDataStorage.saveData();
    }

    function _onClearDataClick(evt) {
        nsDictionary.SimpleDictionaryDataStorage.clearData();
    }

    function _initForm(letter) {
        _addClickEventListeners([
            {id: _constants.idBtnAdd, eventHandler: _onBtnAddClick},
            {id: _constants.idShowFormAdd, eventHandler: _onLinkShowAddFromClick},
            {id: _constants.idSaveData, eventHandler: _onSaveDataClick},
            {id: _constants.idClearData, eventHandler: _onClearDataClick},
            {id: _constants.idWordCardBack, eventHandler: _onWordCardBackClick}
        ]);

        _redrawPanels(letter);
    }

    function _redrawPanels(letter) {
        _renderAlphabet();
        _showWordsByFirstLetter(letter);

        $(_constants.idInputWord).value = '';
        $(_constants.idInputDef).value = '';
    }

    function _initView(args) {
        if (args.constants)
            for (var key in args.constants)
                _constants[key] = args.constants[key];

        _initForm(nsDictionary.SimpleDictionary.getWord(0)[0]);
    }

    return {
        init: function (args) {
            _initView(args);
        }
    }
}());

nsDictionary.SimpleDictionaryDataStorage.loadData({
    //if no data will be found stored at local storage,
    //asynchronous request will be made at the specified url
    url: 'words.json',
    wordPropertyName: 'word',
    definitionPropertyName: 'definition',

    onLoad: function () {
        nsDictionary.SimpleDictionaryView.init({
            //if necessary, some constants can be overridden during app init
            constants: {
                valueNotReload: '#'
            }
        });
    }
});

