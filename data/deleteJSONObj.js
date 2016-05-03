var british = require('./british_only.json')
var different = require('./different_meanings.json')

for (key in british) {
	if (key in different) {
        	delete british[key];
	}
};

console.log(JSON.stringify(british));