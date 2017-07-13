
const _ = require('lodash');
const path = require('path');
const util = require('util');
const debug = require('nor-debug');

const zoneFormat = 'zone "%s" {\n%s};';
const zoneTypeFormat = 'type %s;\n';
const zoneFileFormat = 'file "%s";\n';
const zoneAllowQueryFormat = 'allow-query { %s; };\n';
const zoneAllowTransferFormat = 'allow-transfer { %s; };\n';
const zoneMastersFormat = 'masters { %s; };\n';

/** */
function generateZoneType (zone) {
	"use strict";
	debug.assert(zone).is('object');
	debug.assert(zone.type).is('string');
	return util.format(zoneTypeFormat, zone.type);
}

/** */
function generateZoneFile (zone) {
	"use strict";
	debug.assert(zone).is('object');
	debug.assert(zone.file).is('string');
	return util.format(zoneFileFormat, zone.file);
}

/** */
function generateZoneAllowQuery (zone) {
	"use strict";
	debug.assert(zone).is('object');
	debug.assert(zone.allowQuery).is('array');
	return util.format(zoneAllowQueryFormat, zone.allowQuery.join(';'));
}

/** */
function generateZoneAllowTransfer (zone) {
	"use strict";
	debug.assert(zone).is('object');
	debug.assert(zone.allowTransfer).is('array');
	return util.format(zoneAllowTransferFormat, zone.allowTransfer.join(';'));
}

/** */
function generateZoneMasters (zone) {
	"use strict";
	debug.assert(zone).is('object');
	debug.assert(zone.masters).is('array');
	return util.format(zoneMastersFormat, zone.masters.join(';'));
}

/** */
function generateZoneBlock (zone) {
	"use strict";
	debug.assert(zone).is('object');
	let block = "";
	if (zone.type) block += generateZoneType(zone);
	if (zone.file) block += generateZoneFile(zone);
	if (zone.allowQuery) block += generateZoneAllowQuery(zone);
	if (zone.allowTransfer) block += generateZoneAllowTransfer(zone);
	if (zone.masters) block += generateZoneMasters(zone);
	return block;
}

/** */
function generateZone (zone) {
	"use strict";

	debug.assert(zone).is('object');
	debug.assert(zone.domain).is('string');

	const domain = zone.domain;
	const block = generateZoneBlock(zone);
	//debug.log('block =' , block);
	return util.format(zoneFormat, domain, block);
}

/** Generate zones */
function generateZones (zones) {
	"use strict";
	debug.assert(zones).is('array');
	let buffer = [];

	_.forEach(zones, zone => {
		buffer.push(generateZone(zone));
	});

	return buffer.join('\n');
}

module.exports = generateZones;