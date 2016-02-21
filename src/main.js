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
