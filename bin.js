#!/usr/bin/env node

var varsToJs = require('./');
var fs = require('fs');

process.stdout.write(
	JSON.stringify(
		varsToJs(
			fs.readFileSync(process.argv[2], 'utf8')
		)
	)
);
