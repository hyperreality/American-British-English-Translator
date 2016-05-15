'use strict';

var american_spellings = require('../data/american_spellings.json');
var british_spellings = require('../data/british_spellings.json');
var american_only = require('../data/american_only.json');
var british_only = require('../data/british_only.json');
var different_meanings = require('../data/different_meanings.json');
var ignore_list = require('../data/ignore_list.json');

var translate = function translate(data, options) {
	var words = data.split(/[\s,.:()!?\/]/); // simple tokenizer

	var out = [];

	for (var i = 0; i < words.length; i++) {
		if (data[i]) out.push.apply(out, translateWord(words[i], options));
		if (data[i+1]) out.push.apply(out, translateWord(words[i]+" "+words[i+1], options));
	}

	if ( out.length === 0 ) return "Nothing found";
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

	var show_spelling = false;
	var show_exclusive = false;
	var show_different = false;

	// if no options specified, print everything
        if (!options.spelling && !options.exclusive && !options.different) {
		show_spelling = true;
		show_exclusive = true;
		show_different = true;
	}
	else {
		if (options.spelling) show_spelling = true;
		if (options.exclusive) show_exclusive = true;
		if (options.different) show_different = true;
	}

	var output = [];

	var addToOutput = function(word, reason, details) {
		var obj = {};
		obj[word] = [ { "issue": reason, "details": details } ];
		output.push(obj);
	}

	var ignored = function(word) {
		if (ignore_list.indexOf(word) != -1) {
			return true;
		}
		return false;
	}

	word = word.toLowerCase().trim();

	if (!(!options.showall && ignored(word))) {

		if (show_spelling) {

			var american_spelling = british_spellings[word];

			if (!options.american && american_spelling) {
				addToOutput(word, "British English Spelling", american_spelling);
			}
			else {
				var british_spelling = american_spellings[word];
				if (!options.british && british_spelling) {
					addToOutput(word, "American English Spelling", british_spelling);
				}
			}
		}

		if (show_exclusive) {

			if (!options.british && (word in american_only)) {
				addToOutput(word, "American English", american_only[word]);
			}

			if (!options.american && (word in british_only)) {
				addToOutput(word, "British English", british_only[word]);
			}

		}

		if (show_different) {

			if (different_meanings[word]) {
				if ((!options.american && different_meanings[word]["British English"]) || (!options.british && different_meanings[word]["American English"])) {
					addToOutput(word, "Different meanings", different_meanings[word]);

				}
			}
		}
	}

	return output;
}

module.exports = {
	translate: translate,
	translateWord: translateWord
}

