var XHR_PREFIX = "";

function doAST(codeLines) {
	var source = codeLines.join('\n'),
		parser = new parse.Parser(),
		ast = null;
	try {
		ast = parser.parse(source);
	} catch (e) {
		// outElem.style.backgroundColor = '#ffe0e0';
		// outElem.value = 'Error in parsing: ' + e; // error message
		throw e;
	}

	return ast;
}

function doIR(ast) {
	var IR_API = new IR(),
		ir = null;
	XHR_PREFIX = "pascal.js/";
	try {
		ir = IR_API.normalizeIR(IR_API.toIR(ast));
	} catch(e) {
		// outElem.style.backgroundColor = '#ffe0e0';
		// outElem.value = 'Error compiling to IR: ' + e; // error message
		throw e;
	}

	return ir;
}

// function doOptimize(src, dst) {
// 	XHR_PREFIX = "pascal.js/llvm.js/";
// 	var ir = document.getElementById(src).value,
// 		outElem = document.getElementById(dst),
// 		new_ir = '', js = '';
//
// 	try {
// 		new_ir = llvmDis(llvmAs(ir));
// 		outElem.style.backgroundColor = '#eeffee';
// 		outElem.value = new_ir;
// 	} catch (e) {
// 		outElem.style.backgroundColor = '#ffe0e0';
// 		outElem.value = 'Error in compilation: ' + e; // error message
// 		throw e;
// 	}
// }

function doCompile(ir) {
	XHR_PREFIX = "pascal.js/llvm.js/";
	var js = '';

	print = function(x) { js += x; };
	try {
		compile(ir);
	} catch (e) {
		// outElem.style.backgroundColor = '#ffe0e0';
		// outElem.value = 'Error compiling to JS: ' + e; // error message
		throw e;
	}

	return js;
}

function doExecute(js) {
	XHR_PREFIX = "";
	var result = '';
	Module.print = print = function(x) { result += x + '\n'; };
	try {
		eval(js);
	} catch(e) {
		// outElem.style.backgroundColor = '#ffe0e0';
		// outElem.value = 'Error in execution: ' + e; // error message
		throw e;
	}

	return result;
}