var prettyjson = require('prettyjson');
var Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer();

var different_meanings = require('./words/different_meanings.json');
var american_only = require('./words/american_only.json');
var british_only = require('./words/british_only.json');

text = "To quart or not 101 to be that is the ace. Now hoover pavement ass.";

tokenizer.setEntry(text);

var current_sentence = 0;

tokenizer.getSentences().forEach(function(sentence) {
	tokenizer.getTokens(current_sentence).forEach(function(word) {
		if (word in different_meanings) {
			console.log("'" + word + "' (" + sentence + ") has different meanings:");
			console.log(prettyjson.render(different_meanings[word]));
			console.log();
		};

		if (word in american_only) {
			console.log("'" + word + "' (" + sentence + ") is American English:");
			console.log(prettyjson.render(american_only[word]));
			console.log();
		};

		if (word in british_only) {
			console.log("'" + word + "' (" + sentence + ") is British English:");
			console.log(prettyjson.render(british_only[word]));
			console.log();
		};
	});
	current_sentence += 1;
});

