'use strict';

var prettyjson = require('prettyjson');
var Tokenizer = require('sentence-tokenizer');
var colors = require('colors');

var different_spellings = require('../data/different_spellings.json');
var different_meanings = require('../data/different_meanings.json');
var american_only = require('../data/american_only.json');
var british_only = require('../data/british_only.json');

exports.translate = function translate(data, options) {
	options = options || {};
	options.british = options.british || false;
	options.american = options.american || false;

	if (data.length === 0) {
		return "Error: no input"
	};

	var tokenizer = new Tokenizer();
	tokenizer.setEntry(data);

	var output = [];

	var appendToOutput = function(sentence, word, message, info, message2) {
		output.push("(" + sentence + ")");
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

			for(var key in different_spellings){
				if (!options.british && word.toLowerCase() === key) {
					appendToOutput(sentence, word, "is British English spelling:", different_spellings[key], " is the American English variant");
				}
				else if (!options.american && word.toLowerCase() === different_spellings[key]) {
					appendToOutput(sentence, word, "is American English spelling:", key, " is the British English variant");
				};
			};

			if (word in different_meanings) {
					appendToOutput(sentence, word, "has different meanings:", prettyjson.render(different_meanings[word]));
			};

			if (!options.american) {
				if (word in american_only) {
					appendToOutput(sentence, word, "is American English:", prettyjson.render(american_only[word]));
				};
			};

			if (!options.british) {
				if (word in british_only) {
					appendToOutput(sentence, word, "is British English:", prettyjson.render(british_only[word]));
				};
			};
		});
		current_sentence += 1;
	});
	
	if (output.length === 0) {
		output.push("Done, nothing to report");
	};

  return output.join('\n');
};
