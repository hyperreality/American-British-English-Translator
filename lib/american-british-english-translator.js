'use strict';

var colors = require('colors');
var prettyjson = require('prettyjson');
var Tokenizer = require('sentence-tokenizer');

var different_spellings = require('../data/different_spellings.json');
var different_meanings = require('../data/different_meanings.json');
var american_only = require('../data/american_only.json');
var british_only = require('../data/british_only.json');

exports.translate = function translate(data, options) {
	options = options || {};
	options.american = options.american || false;
	options.british = options.british || false;
	options.exclusive = options.exclusive || false;
	options.spelling = options.spelling || false;

	if (options.american && options.british) {
		return "Error: --american and --british are mutually exclusive options"
	};

	if (options.exclusive && options.spelling) {
		return "Error: --exclusive and --spelling are mutually exclusive options"
	};

	if (data.length === 0) {
		return "Error: no input"
	};

	var tokenizer = new Tokenizer();
	tokenizer.setEntry(data);

	var output = [];

	var appendToOutput = function(sentence, word, message, info, message2) {
		output.push("(" + sentence.gray + ")");
		output.push("'" + word.cyan + "' " + message);
		if (message2) {
			output.push(info + message2);
		}
		else {
			output.push(info);
		};
		output.push('\n');
	};

	var current_sentence = 0;

	tokenizer.getSentences().forEach(function(sentence) {
		tokenizer.getTokens(current_sentence).forEach(function(word) {

			word = word.replace(/[^\w-]/g, ""); // tokenizer didn't remove punctuation, so we will

			if (!options.exclusive) {

				for(var key in different_spellings){
					if (!options.american && word.toLowerCase() === key) {
						appendToOutput(sentence, word, "is British English spelling:", different_spellings[key], " is the American English variant");
					}
					else if (!options.british && word.toLowerCase() === different_spellings[key]) {
						appendToOutput(sentence, word, "is American English spelling:", key, " is the British English variant");
					};
				};

			};

			if (!options.spelling) {

				if (word in different_meanings) {

					if ((!options.american && different_meanings[word]["British English"]) || (!options.british && different_meanings[word]["American English"])) {
						appendToOutput(sentence, word, "has different meanings:", prettyjson.render(different_meanings[word]));
					};
				};

				if (!options.british) {
					if (word in american_only) {
						appendToOutput(sentence, word, "is American English:", prettyjson.render(american_only[word]));
					};
				};

				if (!options.american) {
					if (word in british_only) {
						appendToOutput(sentence, word, "is British English:", prettyjson.render(british_only[word]));
					};
				};

			};
		});
		current_sentence += 1;
	});

	if (output.length === 0) {
		return "Done, nothing to report"
	};

	return output.slice(0,-1).join('\n');
};
