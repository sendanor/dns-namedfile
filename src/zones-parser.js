
const _ = require('lodash');
const path = require('path');
const debug = require('nor-debug');
const is = require('nor-is');
const fs = require('fs');

/** Assert a string starts with this prefix */
function _assertPrefix (context, expectedPrefix) {
	debug.assert(context).is('object');
	debug.assert(context.data).is('string');
	debug.assert(expectedPrefix).is('string');
	const prefixContent = context.data.substr(0, expectedPrefix.length);
	if (prefixContent !== expectedPrefix) {
		throw new Error('Unexpected start: ' + prefixContent);
	}
}

/** Returns true if a string starts with this prefix */
function _hasPrefix (context, expectedPrefix) {
	debug.assert(context).is('object');
	debug.assert(context.data).is('string');
	debug.assert(expectedPrefix).is('string');
	const prefixContent = context.data.substr(0, expectedPrefix.length);
	return prefixContent === expectedPrefix;
}

/** Eat a prefix out of context */
function _eatPrefix (context, prefix) {
	"use strict";
	debug.assert(context).is('object');
	debug.assert(context.data).is('string');
	debug.assert(prefix).is('string');
	_assertPrefix(context, prefix);
	context.data = context.data.substr(prefix.length);
	debug.assert(context.data).is('string');
}

/** Assert a string starts with this prefix */
function _eatWhitespace (context) {
	"use strict";
	debug.assert(context).is('object');
	debug.assert(context.data).is('string');
	context.data = _.trimStart(context.data);
	debug.assert(context.data).is('string');
}

/** Returns the content until suffix */
function _parseUntil (context, suffix) {
	"use strict";

	debug.assert(context).is('object');
	debug.assert(context.data).is('string');
	debug.assert(suffix).is('string');

	const value = context.data.substr(0, context.data.indexOf(suffix));

	_eatPrefix(context, value + suffix);
	debug.assert(context.data).is('string');

	return value;
}

/** Parse "type <type>;" and return the value */
function parseType (context) {
	"use strict";

	debug.assert(context).is('object');
	debug.assert(context.data).is('string');

	_eatPrefix(context, 'type ');
	_eatWhitespace(context);

	return _.trimEnd(_parseUntil(context, ';'))
}

/** Parse `file "<path>";` and return the path */
function parseFile (context) {
	"use strict";

	debug.assert(context).is('object');
	debug.assert(context.data).is('string');

	_eatPrefix(context, 'file ');
	_eatWhitespace(context);
	_eatPrefix(context, '"');
	const path = _parseUntil(context, '"');
	_eatWhitespace(context);
	_parseUntil(context, ';');

	return path;
}

/** Parse `allow-query { any; };` and return the path */
function parseAllowQuery (context) {
	"use strict";

	debug.assert(context).is('object');
	debug.assert(context.data).is('string');

	_eatPrefix(context, 'allow-query ');
	_eatWhitespace(context);
	_eatPrefix(context, '{');
	const listData = _parseUntil(context, '}');
	_eatWhitespace(context);
	_parseUntil(context, ';');

	return _.split(listData, ';').map(item => _.trim(item)).filter(item => item);
}

/** Parse `allow-transfer { 127.0.0.1;188.64.1.73;178.213.235.41;178.213.235.49;81.90.66.86; };` and return array of values */
function parseAllowTransfer (context) {
	"use strict";

	debug.assert(context).is('object');
	debug.assert(context.data).is('string');

	_eatPrefix(context, 'allow-transfer ');
	_eatWhitespace(context);
	_eatPrefix(context, '{');
	const listData = _parseUntil(context, '}');
	_eatWhitespace(context);
	_parseUntil(context, ';');

	return _.split(listData, ';').map(item => _.trim(item)).filter(item => item);
}

/** Parse `masters { 127.0.0.1;188.64.1.73;178.213.235.41;178.213.235.49;81.90.66.86; };` and return array of values */
function parseMasters (context) {
	"use strict";

	debug.assert(context).is('object');
	debug.assert(context.data).is('string');

	_eatPrefix(context, 'masters ');
	_eatWhitespace(context);
	_eatPrefix(context, '{');
	const listData = _parseUntil(context, '}');
	_eatWhitespace(context);
	_parseUntil(context, ';');

	return _.split(listData, ';').map(item => _.trim(item)).filter(item => item);
}

/** Parse single zone from zones.conf */
function parseZone (context) {
	"use strict";

	let zone = {};
	
	if (is.string(context)) {
		context = {data:context};
	}

	debug.assert(context).is('object');
	debug.assert(context.data).is('string');

	_eatWhitespace(context);
	_eatPrefix(context, 'zone ');
	_eatWhitespace(context);
	_eatPrefix(context, '"');

	zone.domain = _parseUntil(context, '"');
	//debug.log('zone.domain = "' + zone.domain + '"');

	_eatWhitespace(context);
	_eatPrefix(context, '{');

	let l = context.data.length;
	let ll = l;
	while (l >= 1) {

		_eatWhitespace(context);

		if (_hasPrefix(context, 'type ')) {
			zone.type = parseType(context);
			//debug.log('zone.type = ', zone.type);
			continue;
		}

		if (_hasPrefix(context, 'file ')) {
			zone.file = parseFile(context);
			//debug.log('zone.file = ', zone.file);
			continue;
		}

		if (_hasPrefix(context, 'masters ')) {
			zone.masters = parseMasters(context);
			//debug.log('zone.masters = ', zone.masters);
			continue;
		}

		if (_hasPrefix(context, 'allow-query ')) {
			zone.allowQuery = parseAllowQuery(context);
			//debug.log('zone.allowQuery = ', zone.allowQuery);
			continue;
		}

		if (_hasPrefix(context, 'allow-transfer ')) {
			zone.allowTransfer = parseAllowTransfer(context);
			//debug.log('zone.allowTransfer = ', zone.allowTransfer);
			continue;
		}

		if (_hasPrefix(context, '}')) {
			_eatPrefix(context, '}');
			_eatWhitespace(context);
			_parseUntil(context, ';');
			return zone;
		}

		// End if no changes
		ll = l;
		l = context.data.length;
		if (l === 0) throw new Error("Unexpected end of data");
		if (l === ll) throw new Error('next unrecognized: ' + context.data.substr(0, 300));

	}

}

/** Parse zones.conf into zones.json */
function parseZones (context) {
	"use strict";

	let zones = [];

	if (is.string(context)) {
		context = {data:context};
	}

	debug.assert(context).is('object');
	debug.assert(context.data).is('string');

	let l = context.data.length;
	let ll = l;
	while (l >= 1) {

		_eatWhitespace(context);

		if (_hasPrefix(context, 'zone ')) {
			const zone = parseZone(context);
			//debug.log('zone = ', zone);
			zones.push(zone);
			continue;
		}

		// End if no changes
		ll = l;
		l = context.data.length;
		if (l === 0) return zones;
		if (l === ll) throw new Error('next unrecognized: ' + context.data.substr(0, 300));

	}

	return zones;
}

/* Parse a block of data */
function parseData (data) {

	// Strip comments out
	data = data.replace(/\/\*[^*]*\*\//gm, "");
	data = data.replace(/\/\/.*/g, "");

	return parseZones(data);
}

module.exports = parseData;