#Dictionary

This is a simple application which serves as a demonstration of its owner's coding skills.

## Description

Task: Implement online Dictionary which allows user to store, view and add definitions of words using HTML5, CSS3 and JavaScript. Usage of third-party frameworks or libraries such as jQuery or Bootstrap is not permitted.

Solution: Write an application using only pure JavaScript.
* No third-party libraries are used.
* Namespace nsDictionary is used to prevent "pollution" of the global scope.
* Module pattern is used to isolate functionality based on the purpose of a particular module.

Implemented modules are described below:

* SimpleDictionary - provides basic functionality for working with the individual words in the dictionary;

* SimpleDictionaryView - provides interface for the end-user;

* SimpleDictionaryDataStorage - handles loading, saving and deleting application data;

## Installation

Fire up a web server and copy the files to its root directory or subdirectory. After this, open /index.html in the browser. For example:

http://127.0.0.1/index.html

WARNING: The app performs an ajax request during initialization and therefore will not word if opened simply from local hard disk. Usage of a local web server is imminent.

## Project structure

* index.html - contains html sources.
* styles/style.css - contains cascade style sheets.
* scripts/script.js - contains javascript code.
* module diagram.jpg - illustration showing links between modules.
* UI sketch.pdf - UI design prototypes.
