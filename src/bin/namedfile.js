#!/usr/bin/env node

const _ = require('lodash');
const debug = require('nor-debug');
const is = require('nor-is');
const fs = require('fs');

const argv_ = [].concat(process.argv_);
const nodePath = argv_.shift();
const scriptPath = argv_.shift();
const scriptDir = path.dirname(scriptPath);

let argv = require('minimist')(process.argv.slice(2));

/* */
function readFile (file) {
	"use strict";
	return fs.readFileSync(file, {encoding:'utf8'});
}

function main () {
	"use strict";

	const parseEnabled = !!argv.p;
	const generateEnabled = !!argv.g;

	if (parseEnabled || generateEnabled) {
		const file = _.first(argv._);
		const data = readFile(file);
		const zones = parseZones(data);
		console.log(JSON.stringify(zones));
	} else if (generateEnabled) {
		const file = _.first(argv._);
		const data = readFile(file);
		const zones = JSON.parse(data);
		const zonesStr = generateZones(zones);
		console.log(zonesStr);
	} else {
		console.log('USAGE: dns-namedfile [-g|-p] FILE');
		process.exit(1);
	}

}

try {
	main();
} catch(e) {
	debug.error('Error: ', e);
	process.exit(1);
}

