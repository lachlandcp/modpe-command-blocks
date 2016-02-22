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
	try {
	    var fos = new java.io.FileInputStream(data);
	    var str = new java.lang.StringBuilder();
	    var ch;
	    while ((ch = fos.read()) != -1) str.append(java.lang.Character(ch));
	    var result = JSON.parse(String(str.toString()));
	    fos.close();
	} catch (err) {
		result = {};
	}
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

var VERSION = "1.0.1";

globe.newLevel = newLevel;
globe.useItem = useItem;
globe.redstoneUpdateHook = redstoneUpdateHook;
globe.leaveGame = leaveGame;
globe.procCmd = procCmd;

var config_filename = "commandBlocks";

var searge_says = [
    "Yolo",
    "/achievement take achievement.understandCommands @p",
    "Ask for help on twitter",
    "/deop @p",
    "Scoreboard deleted, commands blocked",
    "Contact helpdesk for help",
    "/testfornoob @p",
    "/trigger warning",
    "Oh my god, it's full of stats",
    "/kill @p[name=!Searge]",
    "Have you tried turning it off and on again?",
    "Sorry, no help today"
];

var commandBlocks = {};
var command_block_id = 137;

Block.defineBlock(command_block_id, "Command Block", [
    ['command_block', 0]
], 7, true, 0);
Block.setRedstoneConsumer(command_block_id, true);
Player.addItemCreativeInv(command_block_id, 1, 0);
Item.setCategory(command_block_id, ItemCategory.TOOL);

function newLevel() {
    commandBlocks = Data.read(config_filename);
}

function leaveGame() {
    Data.save(config_filename, commandBlocks);
}

function useItem(x, y, z, itemId, blockId, side) {

    var key = x + '/' + y + '/' + z;
    if (blockId == command_block_id) {
        if (!(key in commandBlocks)) {
            commandBlocks[key] = {
                x: x,
                y: y,
                z: z,
                command: "",
                type: "command_block",
                output: ""
            };
        }

        preventDefault();
        editCommandBlock(x, y, z);

    }

    if (itemId != command_block_id) {
        return;
    }

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

    commandBlocks[key] = {
        x: x,
        y: y,
        z: z,
        command: "",
        type: "command_block",
        output: ""
    };
    Data.save(config_filename, commandBlocks);

    Level.setTile(x, y, z, 137);
}

function destroyBlock(x, y, z) {
    if (Level.getTile(x, y, z) == command_block_id) {
        var key = x + '/' + y + '/' + z;
        if (!((key) in commandBlocks)) return false;
        delete commandBlocks[key];
    }
}

function redstoneUpdateHook(x, y, z, newCurrent, worldLoading, blockId, blockDamage) {
    if (newCurrent <= 0 || worldLoading) return false;
    if (blockId == command_block_id) {
        var key = x + '/' + y + '/' + z;
        if (!((key) in commandBlocks)) return false;

        var data = commandBlocks[key];

		commandBlocks[key].output = "";

        if (data.command.substring(0, 1) == '/') {
            if (data.command == '/help') {
                commandBlocks[key].output = searge_says[Math.floor(Math.random() * searge_says.length)];
            } else {
                net.zhuoweizhang.mcpelauncher.ScriptManager.callScriptMethod("procCmd", [data.command.substring(1)]);
            }
        } else if (data.command.substring(0, 11).toLowerCase() == "javascript:") {
					try {
						eval(data.command.substring(11));
					} catch(err) {
						print(err);
					}
        } else if (data.command == "Searge") { // 1.9 easter egg
            commandBlocks[key].output = "#itzlipofutzli";
        }
    }
}

function editCommandBlock(x, y, z) {
    var ctx = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();
    ctx.runOnUiThread(new java.lang.Runnable({
        run: function() {
            try {
                var key = x + '/' + y + '/' + z;

                var alert = new android.app.AlertDialog.Builder(ctx);
                alert.setTitle("Command Block");

                var scroll = new android.widget.HorizontalScrollView(ctx);
                var layout = new android.widget.LinearLayout(ctx);
                layout.setOrientation(1);

                var setcmd = new android.widget.EditText(ctx);
                setcmd.setHint("Insert command or javascript");
                setcmd.setText(commandBlocks[key].command);

                var params = new android.view.ViewGroup.LayoutParams(-1, -1);

                layout.addView(setcmd, params);

				var output_text = commandBlocks[key].output || "No output available.";

				var output = new android.widget.TextView(ctx);
				output.setText("Previous Output: " + output_text);
				scroll.addView(output);
				layout.addView(scroll, params);


                alert.setView(layout);

                alert.setPositiveButton("Ok", new android.content.DialogInterface.OnClickListener({
                    onClick: function(viewarg) {
                        commandBlocks[key].command = '' + setcmd.getText().toString(); // empty string needed to convert to JS string
                        Data.save(config_filename, commandBlocks);
                    }
                }));

                alert.setNegativeButton("Cancel", new android.content.DialogInterface.OnClickListener({
                    onClick: function(viewarg) {}
                }));

                var dialog = alert.create();
                dialog.show();
            } catch (err) {
                print("An error occured: " + err);
            }
        }
    }));
}

// Useful for testing
function procCmd(cmd) {
    if (cmd.toLowerCase() == "commandblocks") {
        ModPE.showTipMessage("Version: " + VERSION);
    }
}

},{"./data.js":1,"./global.js":2}]},{},[3]);
