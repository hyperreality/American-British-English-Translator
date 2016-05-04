# American British English Translator

Reads in a text and identifies words that differ in usage between American English and British English, including:
  1. Words with alternative spellings ("cozy" / "cosy")
  2. Words with different meanings in each of the two dialects ("pants")
  3. Words typically used in only one of the dialects ("ladybug" / "ladybird")

Existing solutions only notice the first category of words, thus failing to prevent the most embarrassing mistakes, such as a British person asking an American colleague for a "rubber".

## Installation

```bash
$ npm install -g american-british-english-translator
```

This will install the command `english-translate` globally, so it will be added automatically to your `PATH`.

## Usage (CLI)

The command line interface can be used in three different ways:

**Pipe stdin:**

```bash
$ echo "That was a right bodge job" | english-translate
```

![Example 2](https://raw.github.com/hyperreality/american-british-english-translator/master/images/example2.png)

**Analyze a file:**

```bash
$ english-translate American\ Psycho.txt
```

![Example 1](https://raw.github.com/hyperreality/american-british-english-translator/master/images/example1.png)

**Prompt:**

```bash
$ english-translate
```

![Example 3](https://raw.github.com/hyperreality/american-british-english-translator/master/images/example3.png)

### Command line options

By default `english-translate` outputs almost everything it can*, but it's possible to refine the output and thus speed up the program by using some command line options:

```bash
# Only identify Americanisms
$ english-translate file.txt --american

# Only identify Britishisms
$ english-translate --british

# Only check for spelling differences
$ english-translate --spelling

# Only check for British spellings
$ english-translate --british --spelling

# Don't check spelling differences, only check for meanings exclusive to one of the dialects
$ english-translate --exclusive

# Print a count of dialect features
$ english-translate --count

# Do not use colors
$ english-translate --no-color
```

* Common words with tiny subtleties in meaning, such as 'can' or 'through', are ignored by default. These words are configured in data/ignore_list.json. If you want to include them then pass the `--showall` flag.

## Usage (from Node.js)

Include it in your script and call the `translate()` method:

```javascript
var translator = require('american-british-english-translator');

var data = "I was gobsmacked";

var options = {
  british: true,
  count: true
};

console.log(translator.translate(data, options));
```

## Sources

  - [List of words having different meanings in American and British English: A-L](https://en.wikipedia.org/wiki/List_of_words_having_different_meanings_in_British_and_American_English:_A%E2%80%93L)
  - [List of words having different meanings in American and British English: M-Z](https://en.wikipedia.org/wiki/List_of_words_having_different_meanings_in_British_and_American_English:_M%E2%80%93Z)
  - [Glossary of American terms not widely used in the United Kingdom](https://en.wikipedia.org/wiki/List_of_American_words_not_widely_used_in_the_United_Kingdom)
  - [Glossary of British terms not widely used in the United States](https://en.wikipedia.org/wiki/List_of_British_words_not_widely_used_in_the_United_States)
  - [Comprehensive list of American and British spelling differences](http://www.tysto.com/uk-us-spelling-list.html)