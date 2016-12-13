/* highlight rules */
var markup = {
	statement: 'program var const String Integer begin end. if while for'.split(' '),
	special: '; ( ) := : = < > * / % ! + -'.split(' '),
	comment: {start: '{', end: '}'},
	constant: {start: ['"', '\'']},
	number: '1234567890.'.split('')
};
// helpers
var classes = Object.keys(markup);
var blocks = {};
classes.filter(key => markup[key].start)
	.forEach(key => {
		if (markup[key].start instanceof Array) markup[key].start.forEach(start => blocks[start] = key);
		else blocks[markup[key].start] = key;
	});
var lists = {};
classes.filter(key => markup[key] instanceof Array)
	.forEach(key => {
		markup[key].forEach(word => lists[word.toLowerCase()] = key);
	});
var regexps = classes.filter(key => key instanceof RegExp);

/* base constants */
var cursor = {x: 0, y: 0};
tab = 8;
var source = [];

var title = document.querySelector('.window .title');
var code = document.querySelector('.source');

/* run */

init();
document.addEventListener('keydown', handler);
document.addEventListener('keypress', handler);

function init() {
	source = code.innerHTML.replace(/\t/g, ' '.repeat(8)).split(/[\n\r]+/);
	handler();
}

function handler(event) {
	edit(event);
	updateTitle();
	highlight();
}

/* main */

function updateTitle() {
	var found = source.find(string => string.match(/^\s*program\s+(\w+);?$/));
	var programName = found && RegExp.$1;
	title.innerHTML = (programName ? programName.toUpperCase() : 'NONAME00') + '.PAS';
}

function edit(event) {
	if (!event) return;

	switch (event.key) {
		//TODO: add event.ctrlKey
		case 'ArrowLeft':  cursor.x--; break;
		case 'ArrowRight': cursor.x++; break;
		case 'ArrowUp':    cursor.y--; break;
		case 'ArrowDown':  cursor.y++; break;
		case 'Backspace': {
			source[cursor.y] = source[cursor.y].substr(0, cursor.x - 1) + source[cursor.y].substr(cursor.x);
			cursor.x--;
			break;
		}
		case 'Delete': {
			source[cursor.y] = source[cursor.y].substr(0, cursor.x) + source[cursor.y].substr(cursor.x + 1);
			break;
		}
		case 'Enter': {
			console.log('enter');
			break;
		}
		default: console.log(event.key, event.keyCode)
	}

	if (cursor.x < 0) cursor.x = 0;
	if (cursor.y < 0) cursor.y = 0;
	if (cursor.y >= source.length) cursor.y = source.length - 1;

	if (event.key.length === 1) {
		var gap = cursor.x - source[cursor.y].length;
		if (gap < 0) gap = 0;
		source[cursor.y] = source[cursor.y].substr(0, cursor.x) + ' '.repeat(gap) + event.key + source[cursor.y].substr(cursor.x);
		cursor.x++;
	}

	event.preventDefault();
}

function highlight() {
	var result = [];

	source.forEach((string, y) => {
		var buffer = '', cBuffer = '', block = false, end = false, line = [], key = false;

		if (string.length < cursor.x) string += ' '.repeat(cursor.x - string.length);
		string += ' ';

		string.split('').forEach((letter, x) => {
			var cursoredLetter = letter;
			if (cursor.x === x && cursor.y === y) {
				cursoredLetter = letter === '\t'
					? wrap(' ', 'cursor') + ' '.repeat(tab - 1)
					: wrap(letter, 'cursor');
			}

			if (block) {
				cBuffer += cursoredLetter;
				if (end instanceof Array ? end.includes(letter) : end === letter) {
					line.push(wrap(cBuffer, block));
					end = false;
					block = false;
					cBuffer = '';
				}
			} else {
				buffer += letter;
				var flush = false;

				if (key = (lists[buffer.toLowerCase()] || checkRegexp(buffer))) {
					cBuffer += cursoredLetter;
					flush = true;
				} else if (letter === ' ' || letter === '\t') {
					cBuffer += cursoredLetter;
					flush = true;
				} else if (key = lists[letter]) {
					line.push(cBuffer);
					cBuffer = cursoredLetter;
					flush = true;
				} else if (block = blocks[letter]) {
					line.push(cBuffer);
					cBuffer = cursoredLetter;
					buffer = '';
					end = markup[block].end || letter;
				} else {
					cBuffer += cursoredLetter;
				}

				if (flush) {
					line.push(key ? wrap(cBuffer, key) : cBuffer);
					buffer = '';
					if (!block) cBuffer = '';
				}
			}
		});

		line.push(key || block ? wrap(cBuffer, key || block) : cBuffer);
		result.push(line.join(''));
	});

	code.innerHTML = result.join('\n');
}

function wrap(string, type) {
	return '<span class="' + type + '">' + string + '</span>';
}

function checkRegexp(string) {
	return regexps.find(key => markup[key].test(string));
}