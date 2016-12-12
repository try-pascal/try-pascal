var title = document.querySelector('.window .title');
var markup = {
	statement: 'var const String Integer begin end. if while for'.split(' '),
	program: {start: 'program', end: [';', '\n'], run: updateTitle},
	special: '; ( ) : := < > * / % ! + -'.split(' '),
	comment: {start: '{', end: '}'},
	constant: {start: ['"', '\'']},
	number: /^[\d.]+$/
};
var classes = Object.keys(markup);
var cursor = {x: 0, y: 0};
var source = [];
var code = document.querySelector('.source');

init();

document.addEventListener('keyup', function(event) {
	edit(event);
	highlight();
});

function init() {
	source = code.innerHTML.split(/[\n\r]+/);
	highlight();
	// placeCursor()
}

function updateTitle(buffer) {
	var programName = buffer[2];
	if (!programName.trim() || programName === ';') programName = '';
	title.innerHTML = (programName ? programName.toUpperCase() : 'NONAME00') + '.PAS';
	buffer[0] = wrap(buffer[0], 'statement');
	if (buffer[buffer.length - 1] === ';') buffer[buffer.length - 1] = wrap(';', 'special');
	return buffer.join('');
}

function edit(event) {
	switch (event.key) {
		//TODO: add event.ctrlKey
		case 'ArrowLeft':  cursor.x--; break;
		case 'ArrowRight': cursor.x++; break;
		case 'ArrowUp':    cursor.y--; break;
		case 'ArrowDown':  cursor.y++; break;
		case 'Backspace': {
			source[cursor.y] = source[cursor.y].substr(0, cursor.x - 1) + source[cursor.y].substr(cursor.x);
		}
		case 'Enter': {
			console.log('enter');
		}
		default: console.log(event.key, event.keyCode)
	}

	if (cursor.x < 0) cursor.x = 0;
	if (cursor.x > source[cursor.y].length) cursor.x = source[cursor.y].length;
	if (cursor.x === source[cursor.y].length) source[cursor.y] += ' ';
	if (cursor.y < 0) cursor.y = 0;
	if (cursor.y >= source.length) cursor.y = source.length - 1;

	if (event.key.length === 1) {
		source[cursor.y] = source[cursor.y].substr(0, cursor.x) + event.key + source[cursor.y].substr(cursor.x);
		cursor.x++;
	}
}

function highlight() {
	var cursorShift = source.reduce((shift, string, i) => {
		if (cursor.y > i) shift += string.length + 1;
		if (cursor.y === i) shift += cursor.x;
		return shift;
	}, 0);

	var splitted = source.join('\n')
		.split(/([\s\n\r\t]+|:=|[;{}():="'<>*/%!+-])/)
		.filter(str => str !== '');

	var buffer = [];
	var result = [];
	var inside = false;
	var end = false;

	var processedLength = 0;
	splitted.forEach(part => {
		processedLength += part.length;
		var string = part;
		if (processedLength > cursorShift) {
			var index = cursorShift - (processedLength - part.length);
			string = string.substr(0, index) + wrap(string[index], 'cursor') + string.substr(index + 1);
			cursorShift = Infinity;
		}

		if (inside) {
			if (end instanceof Array ? !end.includes(part) : end !== part) buffer.push(string);
			else {
				buffer.push(string);
				var buffered = typeof markup[inside] === 'object' && markup[inside].run
					? markup[inside].run(buffer)
					: buffer.join('');
				result.push(wrap(buffered, inside));
				end = false;
				inside = false;
				buffer = [];
			}
		} else {
			classes.some(cls => {
				if (typeof markup[cls] === 'object') {
					if (markup[cls].start instanceof Array && markup[cls].start.includes(part) || markup[cls].start === part) {
						inside = cls;
						end = markup[cls].end || part;
						buffer.push(string);
						return true;
					}
				}
				if ((markup[cls] instanceof RegExp && markup[cls].test(part)) || (markup[cls] instanceof Array && markup[cls].includes(part))) {
					result.push(wrap(string, cls));
					return true;
				}
				return false;
			}) || result.push(string);
		}
	});

	code.innerHTML = result.join('');
}

function wrap(string, type) {
	return '<span class="' + type + '">' + string + '</span>';
}
