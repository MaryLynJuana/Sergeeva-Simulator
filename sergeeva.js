'use strict'

const fs = require('fs');
const readline = require( 'readline' );
const dictionary = require('./words.json');
const cTable = require('console.table'); //if you already have console.table in your node, delete this line

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pickRandomKey = obj => {
	const keys = Object.keys(obj);
	const randomIndex = Math.floor(Math.random()*keys.length);
	return keys[ randomIndex ]
};

const toLower = str => str.trim().toLowerCase();

const isRight = (word, rightWord) => {
	const articles = [ '', 'a ', 'an ', 'the ', 'to ' ];
	for (let article of articles) {
		if (rightWord === article + word) return true
	}
	return false
};

const results = {
	correct: 0,
	incorrect: 0,
	score: 0,
};

const askTranslation = dict => {
	const rightWord = pickRandomKey(dict);
	console.log(`\x1b[36m${dict[ rightWord ]}\x1b[0m`);
	rl.question('Translate into English: ', answer => {
		let aLow = toLower(answer);
		let rLow = toLower(rightWord);
		if (aLow in commands) return commands[aLow](dict);
		if ( isRight(aLow, rLow) ) {
			console.log('Right!');
			results.correct++
		} else {
			const failMsg = `\x1b[31mIncorrect!\x1b[0m\nCorrect answer is: \x1b[36m${rightWord}\x1b[0m`;
			console.log(failMsg);
			results.incorrect++
		}
	return  askTranslation(dict);
	});
};

const getResult = () => {
	const count = results.correct + results.incorrect;
	results.score = count ? results.correct * 100 / count : 0;
	console.clear();
	console.table(results);
	const dopkaMsg = `\x1b[35mCondratulations! You are on dopka\x1b[0m`;
	if (results.score < 60) console.log(dopkaMsg)
};

//Functions for interactive adding, deleting and correcting words in the dictionary

const rewriteDictionary = (dict, message) => {
	fs.writeFile('./words.json', JSON.stringify(dict), () => {
		rl.close();
		console.log(message)
	})
};

const addNewWord = dict => {
	rl.question('Type in English: ', engWord => {
		const eng = toLower(engWord);
		if (eng in commands) return commands[eng](dict);
		rl.question('Type in Ukrainian: ', ukrWord => {
			const ukr = toLower(ukrWord);
			if (ukr in commands) return commands[ukr](dict);
			const failMsg = `\x1b[31m$You have to enter the word and its translation to add it\x1b[0m`;
			if (!eng || !ukr) {
				console.log(failMsg);
				return addNewWord(dict)
			}
			dict[eng] = ukr;
			const successMsg = `\x1b[36mThe word ${eng} was successfully added\x1b[0m`;
			rewriteDictionary(dict, successMsg)
		})
	})
};

const deleteWord = dict => {
	rl.question('Enter the word you want to delete: ', engWord => {
		const word = toLower(engWord);
		if (word in commands) return commands[word](dict);
		const failMsg = `\x1b[31mThere is no word \x1b[36m${word}\x1b[31m in the dictionary\x1b[0m`;
		if (!dict[word]) {
			console.log(failMsg);
			return deleteWord(dict)
		}
		const confirmMsg = `Are you sure you want to delete the word \x1b[31m${word}\x1b[0m from your dictionary?[y/n] `;
		rl.question(confirmMsg, confirm => {
			const conf = toLower(confirm);
			if (conf in commands) return commands[conf](dict);
			if (conf !== 'y') return deleteWord(dict);
			Reflect.deleteProperty(dict, word);
			const successMsg = `\x1b[36mThe word was successfully deleted\x1b[0m`;
			rewriteDictionary(dict, successMsg)
		})
	})
};

const correctWord = dict => {
	const askOld = `\x1b[36mPlease enter the old English variant of the word you want to correct\x1b[0m`;
	console.log(askOld);
	rl.question(`Enter the uncorrected variant: `, oldWord => {
		const old = toLower(oldWord);
		if (old in commands) return commands[old](dict);
		Reflect.deleteProperty(dict, old);
		const askCorrect = `\x1b[36mNow enter the correct variant in English and in Ukrainian\x1b[0m`;
		console.log(askCorrect);
		return addNewWord(dict);
	})
};

const commands = {
			
	'add': dict => addNewWord(dict),
	'cor': dict => correctWord(dict),
	'del': dict => deleteWord(dict),
	'menu': dict => menu(dict),
	'res': () => {
		rl.close();
		getResult()
	},
	'start': dict => askTranslation(dict),
	'xx': () => {
		rl.close();
		console.clear();	
	},
	'🐠': () => {
		console.log(
			`\x1b[31mMatrix crashed! Now your console is green\x1b[0m \x1b[38m\x1b[40m\x1b[1m`
		);
		rl.close()
	},
};

const menuMessage = `\x1b[36mWelcome to Sergeeva Simulator!\x1b[0m
To start a test, type 'start'
To add new words to the dictionary, type 'add'
To correct a mistake in a word from the dictionary, type 'cor'
To delete a word from the dictionary, type 'del'
To get your test results, type 'res'
To return to this menu, type 'menu'
To cancel the program, type 'xx'` ;

const menu = dict => {
	console.clear();
	console.log(menuMessage);
	rl.question('Enter a command: ', command => {
		console.clear();
		if (command in commands) return commands[command](dict);
        return menu(dict)
	})
};

menu(dictionary);
