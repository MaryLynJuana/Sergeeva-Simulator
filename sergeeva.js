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
	const keys = Object.keys( obj );
	return keys[ keys.length * Math.random() << 0 ]
};

let correct = 0;
let incorrect = 0;

const askTranslation = dict => {
	const rightWord = pickRandomKey( dict );
	console.log(`\x1b[36m${dict[ rightWord ]}\x1b[0m`);
	rl.question('Translate into English: ', answer => {
		let aLow =  answer.trim().toLowerCase();
		let rLow = rightWord.toLowerCase();
		if (aLow === rLow || rLow === 'to ' + aLow || rLow === 'a ' + aLow || rLow === 'the ' + aLow) {
			console.log('Right!');
			correct++
		} else if ( aLow === 'xx' ) {
			rl.close();
			console.clear();
			return
		} else if (aLow === 'menu') {
			console.clear();
			return menu(dict)
		} else {
			console.log(`\x1b[31mIncorrect!\x1b[0m` +
				`\nCorrect answer is: \x1b[36m${rightWord}\x1b[0m`);
			incorrect++
		}
	return  askTranslation( dict );
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
	if (score < 60) console.log(`\x1b[35mCondratulations! You are on dopka\x1b[0m`)
};

const addNewWords = dict => {
	rl.question('Type in English: ', eng => {
		if (eng.trim().toLowerCase()==='xx') {
			rl.close();
			console.clear();
			return
		}
		if (eng.trim().toLowerCase() === 'menu') menu(dict);
		rl.question('Type in Ukrainian: ', ukr => {
			if (ukr.trim().toLowerCase() === 'xx') {
			rl.close();
			console.clear();
			return
		}
			if (eng && ukr) {
				dict[eng] = ukr;
				fs.writeFile('./words.json', JSON.stringify(dict), err => {
					if (err) throw err;
					rl.close();
					console.log(`\x1b[36mThe word ${eng} was successfully added\x1b[0m`)
				})
			} else menu(dict)
		});
	});
};

const deleteWord = dict => {
	rl.question('Enter the word you want to delete: ', word => {
		if (!dict[word]) menu(dict);
		if ( word.trim().toLowerCase() === 'xx') {
			rl.close();
			console.clear();
			return
		}
		rl.question(`Are you sure you want to delete the word ${word} from your dictionary?[y/n] `, confirm => {
			if (confirm.trim().toLowerCase() === 'y') {
				Reflect.deleteProperty(dict, word);
				fs.writeFile('./words.json', JSON.stringify(dict), err => {
					if (err) throw err;
					console.log(`\x1b[36mThe word was successfully deleted\x1b[0m`)
				});
			}
			rl.close()
		});
	});
}

const correctWord = dict => {
	rl.question(`\x1b[36mPlease enter the old English variant of the word you want to correct\x1b[0m
Enter the uncorrected variant: `, old => {
		Reflect.deleteProperty(dict, old);
		console.log(`\x1b[36mNow enter the correct variant in English and in Ukrainian\x1b[0m`);
		return addNewWords(dict);
	})
};

const commands = {
			
	'add': dict => {
		addNewWords(dict)
	},
	'cor': dict => {
		correctWord(dict)
	},
	'del': dict => {
		deleteWord(dict)
    },
	'res': () => {
		rl.close();
		getResult()
	},
	'start': dict => {
		askTranslation(dict)
	},
	'xx': () => {
		rl.close();
		console.clear();	
	},
	'🐠': () => {
		console.log(`\x1b[31mMatrix crashed! Now your console is green\x1b[0m \x1b[38m\x1b[40m\x1b[1m`);
		rl.close()
	},
};

const menu = dict => {
	console.clear();
	console.log( 
	`\x1b[36mWelcome to Sergeeva Simulator!\x1b[0m
To start a test, type 'start'
To add new words to the dictionary, type 'add'
To correct a mistake in a word from the dictionary, type 'cor'
To delete a word from the dictionary, type 'del'
To get your test results, type 'res'
To return to this menu, type 'menu'
To cancel the program, type 'xx'` );
	rl.question('Enter a command: ', command => {
		console.clear();
		if (command in commands) commands[command](dict);
        else {
			menu(dict)
		}
	})
};

menu(dictionary);
