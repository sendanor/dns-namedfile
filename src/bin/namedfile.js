#!/usr/bin/env node

const _ = require('lodash');
const debug = require('nor-debug');
const fs = require('fs');
const parseZones = require('../zones-parser.js');
const generateZones = require('../zones-generator.js');

let argv = require('minimist')(process.argv.slice(2), {
	boolean: ['x']
});

/* */
function readFile (path) {
	"use strict";
	debug.assert(path).is('string');
	return fs.readFileSync(path, {encoding:'utf8'});
}

function main () {
	"use strict";

	const zonePerLine = !!argv.x;
	const parseEnabled = !!argv.p;
	const generateEnabled = !!argv.g;

	const filePath = parseEnabled ? argv.p : argv.g;

	if (filePath && parseEnabled) {
		const data = readFile(filePath);
		const zones = parseZones(data);
		console.log(JSON.stringify(zones));
	} else if (filePath && generateEnabled) {
		const data = readFile(filePath);
		const zones = JSON.parse(data);
		const zonesStr = generateZones(zones, {zonePerLine});
		console.log(zonesStr);
	} else {
		console.log('USAGE: namedfile [-x] [-g|-p] FILE');
		process.exit(1);
	}

}

try {
	main();
} catch(e) {
	debug.error('Error: ', e);
	process.exit(1);
}
