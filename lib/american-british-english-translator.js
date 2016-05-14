'use strict';

var colors = require('colors');
var prettyjson = require('prettyjson');
var Tokenizer = require('sentence-tokenizer');

var american_spellings = require('../data/american_spellings.json');
var british_spellings = require('../data/british_spellings.json');
var different_meanings = require('../data/different_meanings.json');
var american_only = require('../data/american_only.json');
var british_only = require('../data/british_only.json');
var ignore_list = require('../data/ignore_list.json');

var parse = function parse(data, options) {
	data = data.split(' ');

	var out = [];

	data.forEach(function(word) {
		console.log(translate(word, options));
	})

	return out;
}

var translate = function translate(word, options) {
	options = options || {};
	options.american = options.american || false;
	options.british = options.british || false;
	options.exclusive = options.exclusive || false;
	options.spelling = options.spelling || false;
	options.showall = options.showall || false;
	options.count = options.count || false;

	if (options.american && options.british) {
		return "Error: --american and --british are mutually exclusive options";
	}

	if (options.exclusive && options.spelling) {
		return "Error: --exclusive and --spelling are mutually exclusive options";
	}

	if (word.length === 0) {
		return "Error: no input";
	}

	var output = [];

	var appendToOutput = function(word, dialect, info, message2) {
		var outObj = {};
		outObj['word'] = word;
		outObj['dialect'] = dialect;
		if (message2) {
			outObj['message2'] = message2;
		}
		else {
			outObj['info'] = info;
		}
		output.push(outObj);
	};

	var ignored = function(word) {
		if (word in ignore_list) {
			return true;
		}
		return false;
	};

	var american_count = 0;
	var british_count = 0;

	word = word.toLowerCase().trim();

	if (!(!options.showall && ignored(word))) {

		if (!options.exclusive) {

			var american_spelling = british_spellings[word];

			if (!options.american && american_spelling) {
				appendToOutput(word, "British English spelling", american_spelling, " is the American English variant");
				british_count += 1;
			}

			else {
				var british_spelling = american_spellings[word];
				if (!options.british && british_spelling) {
					appendToOutput(word, "American English spelling", british_spelling, " is the British English variant");
					american_count += 1;
				}
			}
		}

		if (!options.spelling) {

			if (different_meanings[word]) {
				if ((!options.american && different_meanings[word]["British English"]) || (!options.british && different_meanings[word]["American English"])) {
					appendToOutput(word, "different meanings", prettyjson.render(different_meanings[word]));
				}
			}

			if (!options.british && (word in american_only)) {
					appendToOutput(word, "American English", prettyjson.render(american_only[word]));
					american_count += 1;
			}

			if (!options.american && (word in british_only)) {
					appendToOutput(word, "British English", prettyjson.render(british_only[word]));
					british_count += 1;
			}

		}
	}

	if (options.count) {
		if (!options.british) output.push("Count of American English features: " + american_count);
		if (!options.american) output.push("Count of British English features: " + british_count);
		output.push('\n');
	}

	if (output.length === 0) return false;
	return output;
}

module.exports = {
	parse: parse,
	translate: translate
}
