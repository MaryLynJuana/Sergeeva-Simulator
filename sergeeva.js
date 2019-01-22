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
	const randomIndex = Math.floor(Math.random()*keys.length)
	return keys[ randomIndex ]
};

let correct = 0;
let incorrect = 0;

const askTranslation = dict => {
	const rightWord = pickRandomKey(dict);
	console.log(`\x1b[36m${dict[ rightWord ]}\x1b[0m`);
	rl.question('Translate into English: ', answer => {
		let aLow =  answer.trim().toLowerCase();
		let rLow = rightWord.toLowerCase();
		if (aLow in commands) return commands[aLow](dict);
		let right = false;
		const articles = [ '', 'a ', 'an ', 'the ', 'to ' ];
		articles.forEach(article => {
			if (rLow === article + aLow) right = true
		});
		if ( right ) {
			console.log('Right!');
			correct++
		} else {
			console.log(`\x1b[31mIncorrect!\x1b[0m` +
				`\nCorrect answer is: \x1b[36m${rightWord}\x1b[0m`);
			incorrect++
		};
	return  askTranslation(dict);
	});
};

const getResult = () => {
	const count = correct + incorrect;
	const score = count === 0 ? 0 : correct * 100 / count;
	const res ={
		correct,
		incorrect,
		score,
	};
	console.table(res);
	if (score < 60) console.log(
	`\x1b[35mCondratulations! You are on dopka\x1b[0m`
	)
};

const addNewWords = dict => {
	rl.question('Type in English: ', engWord => {
		const eng = engWord.trim().toLowerCase();
		if (eng in commands) return commands[eng](dict);
		rl.question('Type in Ukrainian: ', ukrWord => {
		const ukr = ukrWord.trim().toLowerCase();
			if (ukr in commands) return commands[ukr](dict);
			if (eng && ukr) {
				dict[eng] = ukr;
				fs.writeFile('./words.json', JSON.stringify(dict), err => {
					if (err) throw err;
					rl.close();
					console.log(
						`\x1b[36mThe word ${eng} was successfully added\x1b[0m`
					);
				})
			} else {
				console.log(
				`\x1b[31m$You have enter the word and its translation to add it\x1b[0m`
				);
				return addNewWords(dict)
			}
		});
	});
};

const deleteWord = dict => {
	rl.question('Enter the word you want to delete: ', engWord => {
		const word = engWord.trim().toLowerCase();
		if (word in commands) return commands[word](dict);
		if (!dict[word]) menu(dict);
		rl.question(
			`Are you sure you want to delete the word \x1b[31m${word}\x1b[0m from your dictionary?[y/n] `,
			confirm => {
				const conf = confirm.trim().toLowerCase();
				if (conf in commands) return commands[conf](dict);
				if (conf === 'y') {
					Reflect.deleteProperty(dict, word);
					fs.writeFile('./words.json', JSON.stringify(dict), err => {
						if (err) throw err;
						rl.close();
						console.log(`\x1b[36mThe word was successfully deleted\x1b[0m`)
					});
				} else {
					console.log(
						`\x1b[31m$There is no word \x1b[31m${word}\x1b[0m in the dictionary\x1b[0m`
					);
					return deleteWord(dict)
				}
			});
	});
};

const correctWord = dict => {
	console.log(
		`\x1b[36mPlease enter the old English variant of the word you want to correct\x1b[0m`
	);
	rl.question(`Enter the uncorrected variant: `, oldWord => {
				const old = oldWord.trim().toLowerCase();
		if (old in commands) return commands[old](dict);
		Reflect.deleteProperty(dict, old);
		console.log(
			`\x1b[36mNow enter the correct variant in English and in Ukrainian\x1b[0m`
		);
		return addNewWords(dict);
	})
};

const commands = {
			
	'add': dict => addNewWords(dict),
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
		if (command in commands) commands[command](dict);
        else {
			menu(dict)
		}
	})
};

menu(dictionary);
