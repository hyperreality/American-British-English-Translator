'use strict';

var colors = require('colors');
var prettyjson = require('prettyjson');
var Tokenizer = require('sentence-tokenizer');

var different_spellings = require('../data/different_spellings.json');
var different_meanings = require('../data/different_meanings.json');
var american_only = require('../data/american_only.json');
var british_only = require('../data/british_only.json');
var ignore_list = require('../data/ignore_list.json');

exports.translate = function translate(data, options) {
	options = options || {};
	options.american = options.american || false;
	options.british = options.british || false;
	options.exclusive = options.exclusive || false;
	options.spelling = options.spelling || false;
	options.showall = options.showall || false;
	options.count = options.count || false;

	if (options.american && options.british) {
		return "Error: --american and --british are mutually exclusive options";
	};

	if (options.exclusive && options.spelling) {
		return "Error: --exclusive and --spelling are mutually exclusive options";
	};

	if (data.length === 0) {
		return "Error: no input";
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

	var ignored = function(word) {
		for (var i = 0; i < ignore_list.length; i++) {
			if (word === ignore_list[i]) {
				return true;
			};
		};
		return false;
	};

	var current_sentence = 0;
	var american_count = 0;
	var british_count = 0;

	tokenizer.getSentences().forEach(function(sentence) {
		tokenizer.getTokens(current_sentence).forEach(function(word) {

			word = word.replace(/[^\w-]/g, ""); // tokenizer didn't remove punctuation, so we will

			if (!(!options.showall && ignored(word))) {

				if (!options.exclusive) {

					for(var key in different_spellings) {
						if (!options.american && word.toLowerCase() === key) {
							appendToOutput(sentence, word, "is British English spelling:", different_spellings[key], " is the American English variant");
							british_count += 1;
						}
						else if (!options.british && word.toLowerCase() === different_spellings[key]) {
							appendToOutput(sentence, word, "is American English spelling:", key, " is the British English variant");
							american_count += 1;
						};
					}; }; 
				if (!options.spelling) {

					if (word in different_meanings) {
						if ((!options.american && different_meanings[word]["British English"]) || (!options.british && different_meanings[word]["American English"])) {
							appendToOutput(sentence, word, "has different meanings:", prettyjson.render(different_meanings[word]));
						};
					};

					if (!options.british) {
						if (word in american_only) {
							appendToOutput(sentence, word, "is American English:", prettyjson.render(american_only[word]));
							american_count += 1;
						};
					};

					if (!options.american) {
						if (word in british_only) {
							appendToOutput(sentence, word, "is British English:", prettyjson.render(british_only[word]));
							british_count += 1;
						};
					};

				};
			};
		});
		current_sentence += 1;
	});

	if (output.length === 0) {
		return "Done, nothing to report";
	};

	if (options.count) {
		if (!options.british) output.push("Count of American English features: " + american_count);
		if (!options.american) output.push("Count of British English features: " + british_count);
		output.push('\n');
	};

	return output.slice(0,-1).join('\n');
};
