'use strict';

var american_spellings = require('../data/american_spellings.json');
var british_spellings = require('../data/british_spellings.json');
var american_only = require('../data/american_only.json');
var british_only = require('../data/british_only.json');
var different_meanings = require('../data/different_meanings.json');
var ignore_list = require('../data/ignore_list.json');

var translate = function (data, options) {
    var out = {};
    var lines = data.split('\n');

    for (var line = 0; line < lines.length; line++) {
        var words = lines[line].split(/[\s,.:()!?\/"']/); // simple tokenizer

        for (var j = 0; j < words.length; j++) {
            var result = "";
            if (words[j]) {
                result = translateWord(words[j], options);
                if (words[j + 1]) {
                    var temp = translateWord(words[j] + " " + words[j + 1], options);
                    if (temp) result = temp; // if a two word expression was found, overwrite the one word one (we want zip code rather than zip)
                }
            }

            if (result != "") {
                out[line + 1] = out[line + 1] || [];
                out[line + 1].push(result);
            }
        }
    }

    return out;
}

var translateWord = function (word, options) {
    options = options || {};
    options.american = options.american || false;
    options.british = options.british || false;
    options.exclusive = options.exclusive || false;
    options.spelling = options.spelling || false;
    options.different = options.different || false;
    options.showall = options.showall || false;

    if (options.american && options.british) {
        throw new Error('--american and --british are mutually exclusive options');
    }

    if (word.length === 0) {
        return [];
    }

    // if no options specified, print everything
    if (!(options.spelling || options.exclusive || options.different)) {
        options.spelling = true;
        options.exclusive = true;
        options.different = true;
    }

    var addToOutput = function (word, reason, details) {
        var obj = {};
        obj[word] = {
            "issue": reason,
            "details": details
        };
        return obj;
    };

    var ignored = function (word) {
        return !options.showall && ignore_list.indexOf(word) !== -1;
    };

    word = word.toLowerCase().trim();

    if (!ignored(word)) {
        if (options.different && different_meanings[word]) {
            if ((!options.american && different_meanings[word]["British English"]) || (!options.british && different_meanings[word]["American English"])) {
                return addToOutput(word, "Different meanings", different_meanings[word]);
            }
        }

        if (options.spelling) {
            var american_spelling = british_spellings[word];
            if (!options.american && american_spelling) {
                return addToOutput(word, "British English Spelling", american_spelling);
            } else {
                var british_spelling = american_spellings[word];
                if (!options.british && british_spelling) {
                    return addToOutput(word, "American English Spelling", british_spelling);
                }
            }
        }

        if (options.exclusive) {
            if (!options.british && (word in american_only)) {
                return addToOutput(word, "American English", american_only[word]);
            }

            if (!options.american && (word in british_only)) {
                return addToOutput(word, "British English", british_only[word]);
            }

        }
    }

    return "";
};

module.exports = {
    translate: translate,
    translateWord: translateWord
}
