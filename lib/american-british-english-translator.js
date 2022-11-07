const american_spellings = require('../data/american_spellings.json');
const british_spellings = require('../data/british_spellings.json');
const american_only = require('../data/american_only.json');
const british_only = require('../data/british_only.json');
const different_meanings = require('../data/different_meanings.json');
const ignore_list = require('../data/ignore_list.json');

function translate(data, options={}) {
  const out = {};
  const seen = {};

  const lines = data.split('\n');

  for (let line = 0; line < lines.length; line++) {
    const words = lines[line].split(/[\s,.:()!?\/"']/); // simple tokenizer

    for (let j = 0; j < words.length; j++) {
      let result = {};
      result = translateWord(words[j], options);
      if (words[j + 1]) {
        const temp = translateWord(`${words[j]} ${words[j + 1]}`, options);
        if (temp && Object.keys(temp).length !== 0) result = temp; // if a two word expression was found, overwrite the one word one (we want zip code rather than zip)
      }

      if (result && Object.keys(result).length !== 0) {
        if (options.firstonly) {
          let key = Object.keys(result)[0];
          if (!(key in seen)) {
            out[line + 1] = out[line + 1] || [];
            out[line + 1].push(result);
            seen[key] = result[key]["issue"];
          }
        } else {
            out[line + 1] = out[line + 1] || [];
            out[line + 1].push(result);
        }
      }
    }
  }

  return out;
};

function translateWord(word, options={}) {
  if (word.length === 0) {
    return {};
  }

  if (options.american && options.british) {
    throw new Error('--american and --british are mutually exclusive options');
  }

  // if no options specified, print everything
  if (!(options.spelling || options.exclusive || options.different)) {
    options.spelling = true;
    options.exclusive = true;
    options.different = true;
  }

  word = word.toLowerCase().trim();

  function addToOutput(word, reason, details) {
    // we add objects inside of arrays per line
    // e.g. { '1': [ { bodge: { issue: X, details: Y } ] }
    // objects should guarantee insertion order for strings
    // so each line could just be an object instead
    // but let's retain backwards compatability, and this
    // original way also identifies multiple usages of the same word per line
    const obj = {};
    obj[word] = {
      issue: reason,
      details,
    };
    return obj;
  };

  function ignored(word) {
    return !options.showall && ignore_list.indexOf(word) !== -1;
  };

  if (!ignored(word)) {
    if (options.different && different_meanings[word]) {
      if ((!options.american && different_meanings[word]['British English']) || (!options.british && different_meanings[word]['American English'])) {
        return addToOutput(word, 'Different meanings', different_meanings[word]);
      }
    }

    if (options.spelling) {
      const american_spelling = british_spellings[word];
      if (!options.american && american_spelling) {
        return addToOutput(word, 'British English Spelling', american_spelling);
      }
      const british_spelling = american_spellings[word];
      if (!options.british && british_spelling) {
        return addToOutput(word, 'American English Spelling', british_spelling);
      }
    }

    if (options.exclusive) {
      if (!options.british && (word in american_only)) {
        return addToOutput(word, 'American English', american_only[word]);
      }

      if (!options.american && (word in british_only)) {
        return addToOutput(word, 'British English', british_only[word]);
      }
    }
  }

  return {};
};

module.exports = {
  translate,
  translateWord,
};
