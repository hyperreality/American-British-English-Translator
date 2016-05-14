'use strict';

var Tokenizer = require('sentence-tokenizer');

var american_spellings = require('../data/american_spellings.json');
var british_spellings = require('../data/british_spellings.json');
var american_only = require('../data/american_only.json');
var british_only = require('../data/british_only.json');
var different_meanings = require('../data/different_meanings.json');
var ignore_list = require('../data/ignore_list.json');

var parse = function parse(data, options) {
	data = data.split(' ');

	var out = [];

	data.forEach(function(word) {
		out.push.apply(out, translateWord(word, options));
	})

	if ( out.length === 0 ) return "Nothing found";
	return out;
}

var translateWord = function (word, options) {
	options = options || {};
	options.american = options.american || false;
	options.british = options.british || false;
	options.exclusive = options.exclusive || false;
	options.spelling = options.spelling || false;
	options.showall = options.showall || false;

	if (options.american && options.british) {
		return "Error: --american and --british are mutually exclusive options";
	}

	if (options.exclusive && options.spelling) {
		return "Error: --exclusive and --spelling are mutually exclusive options";
	}

	if (word.length === 0) {
		return [];
	}

	var output = [];

	var ignored = function(word) {
		if (ignore_list.indexOf(word) != -1) {
			return true;
		}
		return false;
	};

	word = word.toLowerCase().trim();

	if (!(!options.showall && ignored(word))) {

		if (!options.exclusive) {

			var american_spelling = british_spellings[word];

			if (!options.american && american_spelling) {
				output.push({"British English spelling": word, "American English variant": american_spelling});
			}

			else {
				var british_spelling = american_spellings[word];
				if (!options.british && british_spelling) {
					output.push({"American English spelling": word, "British English variant": british_spelling});
				}
			}
		}

		if (!options.spelling) {

			if (!options.british && (word in american_only)) {
				output.push({"American English": word, "meaning": american_only[word]});
			}

			if (!options.american && (word in british_only)) {
				output.push({"British English": word, "meaning": british_only[word]});
			}

		}

		if (!options.exclusive && !options.spelling) {
			if (different_meanings[word]) {
				if ((!options.american && different_meanings[word]["British English"]) || (!options.british && different_meanings[word]["American English"])) {
					var temp = {"Different meanings": word};
					for (var attrname in different_meanings[word]) { temp[attrname] = different_meanings[word][attrname]; } 
					output.push(temp);
				}
			}
		}
	}

	if (output.length === 0) return [];
	return output;
}

module.exports = {
	parse: parse,
	translateWord: translateWord
}

