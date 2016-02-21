var globe = require('./global.js');
var Data = require('./data.js');

globe.newLevel = newLevel;
globe.useItem = useItem;
globe.redstoneUpdateHook = redstoneUpdateHook;
globe.leaveGame = leaveGame;

var config_filename = "commandBlocks";

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
                type: "command_block"
            }
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
        type: "command_block"
    }

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

        if (data.command.substring(0, 1) == '/') {
            net.zhuoweizhang.mcpelauncher.ScriptManager.callScriptMethod("procCmd", data.cmd);
        } else if (data.command.substring(0, 11).toLowerCase() == "javascript:") {
            eval(data.command.substring(11));
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

                var scroll = new android.widget.ScrollView(ctx);
                var layout = new android.widget.LinearLayout(ctx);
                layout.setOrientation(1);

                var setcmd = new android.widget.EditText(ctx);
                setcmd.setHint("Insert command or javascript");
                setcmd.setText(commandBlocks[key].command);

                var params = new android.view.ViewGroup.LayoutParams(-1, -1);

                layout.addView(setcmd, params);

                alert.setView(layout);

                alert.setPositiveButton("Ok", new android.content.DialogInterface.OnClickListener({
                    onClick: function(viewarg) {
                        commandBlocks[key].command = '' + setcmd.getText().toString(); // '' needed to conver to JS string
                        print(commandBlocks[key].command);
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
