var gonzales = require('gonzales-pe');
var unquote = require('unquote');
var zin = require('zin');

function parseParens(parens) {
	var delim = parens.get(1).content;
	switch(delim) {
		case ':': return parseMap(parens);
		case ',': return parseArray(parens);
	}
	
	var e = new Error('Unexpected parentheses delimiter ' + delim);
	e.node = parens.get(1);
	throw e;
}

function parseMap(parens) {
	var map = {};
	var apropos = parens.content.filter(function(node) {
		return node.content !== ':' && node.type !== 'space';
	});

	for(var i = 0; i < apropos.length/2; i += 2) {
		map[parseValue(apropos[i])] = parseValue(apropos[i + 1]);
	}

	return map;
}

function parseArray(parens) {
	var elems = [];
	parens.forEach(function(node) {
		if(node.content === ',' || node.type === 'space') return;
		elems.push(parseValue(node));
	});
	return elems;
}

function parseString(string) {
	return unquote(string.content);
}

function parseIdent(ident) {
	return ident.content;
}

function parseValue(valNode) {
	return {
		parentheses: parseParens,
		number: parseNumber,
		color: parseColor,
		string: parseString,
		ident: parseIdent,
	}[valNode.type](valNode)
}

module.exports = function(scssString) {
	try {
		var tree = gonzales.parse(scssString, {syntax: 'scss'});
		var out = {};

		tree.forEach('declaration', function(decl) {
			var name = decl.first('property').first('variable').first('ident').content;
			var valNode = decl.first('value').first();
			var value = parseValue(valNode);

			out[name] = value;
		});

		return out;
	} catch(e) {
		if(e.node) {
			var point = zin({
				str: scssString,
				column: e.node.start.column,
				line: e.node.start.line - 1,
			});

			e.message += '\n\n' + point;
		}
	}
}