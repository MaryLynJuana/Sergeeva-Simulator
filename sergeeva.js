'use strict'

const readline = require( 'readline' );
const words = require('./words.js');

const dictionary = words.dictionary;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
	
const pickRandomKey = obj => {
	const keys = Object.keys( obj );
	return keys[ keys.length * Math.random() << 0 ]
};

const askTranslation = dict => {
	console.log( 'To cancel the program, type "xx"' );
	const rightWord = pickRandomKey( dict );
	console.log( dict[ rightWord ] );
	rl.question('Translate into English: ', answer => {
		if ( answer.toUpperCase() === rightWord.toUpperCase() ) {
			console.log('Right!')
		} else if ( answer==='xx' ) {
			rl.close();
			return
		} else {
			console.log(`Incorrect! \n Correct answer is: '${rightWord}'`)
		}
	return  askTranslation( dict );
	});
};

askTranslation( dictionary );
