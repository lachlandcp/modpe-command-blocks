(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Data = {};

Data.save = function (file, content) {
	var path = new android.os.Environment.getExternalStorageDirectory().getPath() + "/games/com.mojang/minecraftworlds/" + Level.getWorldDir() + '/modData/commandBlocks/';
	try {
		file = file + '.json';
        var data = new java.io.File(path + file);
        if (data.exists()) data.delete();
        data.createNewFile();
        var outWrite = new java.io.OutputStreamWriter(new java.io.FileOutputStream(data));
        outWrite.append(JSON.stringify(content || {}));
        outWrite.close();
		return Data.read(file);
    } catch (err) {
        print(err);
    }
}

Data.read = function(file) {
	var path = new android.os.Environment.getExternalStorageDirectory().getPath() + "/games/com.mojang/minecraftworlds/" + Level.getWorldDir() + '/modData/commandBlocks/';
	file = file + '.json';
    java.io.File(new java.io.File(path)).mkdirs();
    var data = new java.io.File(path + file);
    if (!data.exists()) {
		return {};
	}
    var fos = new java.io.FileInputStream(data);
    var str = new java.lang.StringBuilder();
    var ch;
    while ((ch = fos.read()) != -1) str.append(java.lang.Character(ch));
    var result = JSON.parse(String(str.toString()));
    fos.close();
	return result;
}

module.exports = Data;

},{}],2:[function(require,module,exports){
/*
 *	From https://github.com/sliceofcode/OreDirectory/blob/master/src/core/global.coffee
 */

var global = (function() {
        return this;
    }).call(null);

module.exports = global;

},{}],3:[function(require,module,exports){
var globe = require('./global.js');
var Data = require('./data.js');

globe.newLevel = newLevel;
globe.useItem = useItem;
globe.redstoneUpdateHook = redstoneUpdateHook;

var config_filename = "commandBlocks";

var commandBlocks = {};
var command_block_id = 137;

Block.defineBlock(command_block_id, "Command Block", [
    ['command_block', 0]
], 7, true, 0);
Block.setRedstoneConsumer(command_block_id, true);
Player.addItemCreativeInv(command_block_id, 1, 0);

function newLevel() {
    commandBlocks = Data.read(config_filename);
}

function useItem(x, y, z, itemId, blockId, side) {
	if (itemId != command_block_id) return;
    var sides = [
        [x, y - 1, z],
        [x, y + 1, z],
        [x, y, z - 1],
        [x, y, z + 1],
        [x - 1, y, z],
        [x + 1, y, z]
    ];
    x = sides[side][0];
    y = sides[side][1];
    z = sides[side][2];

    if (Level.getTile(x, y, z) != 0) return;

    commandBlocks[x + '/' + y + '/' + z] = {
        x: x,
        y: y,
        z: z,
        command: "javascript:clientMessage('Test');",
        type: "command_block"
    }

    Level.setTile(x, y, z, 137);

	Data.save(config_filename, commandBlocks);
}


function redstoneUpdateHook(x, y, z, newCurrent, worldLoading, blockId, blockDamage) {
	if (newCurrent <= 0 || worldLoading) return false;
    if (blockId == command_block_id) {
        if (!((x + '/' + y + '/' + z) in commandBlocks)) return false;

        var data = commandBlocks[x + '/' + y + '/' + z];

        if (data.command.substring(0, 1) == '/') {
            clientMessage(data.command);
        } else if (data.command.substring(0, 11) == "javascript:") {
            eval(data.command.substring(11));
        }
    }
}

},{"./data.js":1,"./global.js":2}]},{},[3]);
