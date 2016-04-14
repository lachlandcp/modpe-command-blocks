const globe = require('modpe-globe');
const Data = require('./data.js');

globe.newLevel = newLevel;
globe.useItem = useItem;
globe.redstoneUpdateHook = redstoneUpdateHook;
globe.leaveGame = leaveGame;

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
    if (!(key in commandBlocks)) { // best register any cmd blocks somehow missed.
      commandBlocks[key] = {
        x: x,
        y: y,
        z: z,
        command: "",
        type: "command_block",
        output: "",
        toggle_mode: false
      };
    }

    preventDefault();
    editCommandBlock(x, y, z);
    return;
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

  if (Level.getTile(x, y, z) !== 0) return;

  commandBlocks[key] = {
    x: x,
    y: y,
    z: z,
    command: "",
    type: "command_block",
    output: "",
    toggle_mode: false
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
  if (worldLoading) return false;
  if (blockId == command_block_id) {
    var key = x + '/' + y + '/' + z;
    if (!((key) in commandBlocks)) return false;

    var data = commandBlocks[key];

    if (newCurrent <= 0 && data.toggle_mode == false) return false;

    commandBlocks[key].output = "";

    var match;
    if (data.command.substring(0, 1) == '/') {
      if (data.command == '/help') {
        commandBlocks[key].output = searge_says[Math.floor(Math.random() * searge_says.length)];
      } else {
        net.zhuoweizhang.mcpelauncher.ScriptManager.callScriptMethod("procCmd", [data.command.substring(1)]);
      }
    } else if (match = data.command.match(/^(javascript:|js:)/ig)) {
      try {
        eval(data.command.substring(match[0].length));
      } catch (err) {
        print(err);
        commandBlocks[key].output = err;
      }
    } else if (data.command == "Searge") { // 1.9 easter egg
      commandBlocks[key].output = "#itzlipofutzli";
    } else {
      commandBlocks[key].output = "No command or JS provided.";
    }
  }
}

function editCommandBlock(x, y, z) {
  var ctx = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();
  ctx.runOnUiThread(new java.lang.Runnable({
    run: function() {
      try {
        var key = x + '/' + y + '/' + z;

        var fill = new android.view.ViewGroup.LayoutParams(-1, -1);
        var wrap = new android.view.ViewGroup.LayoutParams(-2, -2);

        var alert = new android.app.AlertDialog.Builder(ctx);
        alert.setTitle("Command Block");

        var scroll = new android.widget.HorizontalScrollView(ctx);
        var layout = new android.widget.LinearLayout(ctx);
        layout.setOrientation(1);

        var setcmd = new android.widget.EditText(ctx);
        setcmd.setHint("Insert command or javascript");
        setcmd.setText(commandBlocks[key].command);
        setcmd.setInputType(524288); // disable autocorrect

        if (!('toggle_mode' in commandBlocks[key])) commandBlocks[key].toggle_mode = false;
        var togglemode = new android.widget.CheckBox(ctx);
        togglemode.setChecked(commandBlocks[key].toggle_mode);

        var togglemode_label = new android.widget.TextView(ctx);
        togglemode_label.setText('Toggle mode? ');

        var togglemode_layout = new android.widget.LinearLayout(ctx);
        togglemode_layout.setOrientation(0);
        togglemode_layout.addView(togglemode_label, wrap);
        togglemode_layout.addView(togglemode, wrap);

        layout.addView(setcmd, fill);
        layout.addView(togglemode_layout, fill);

        var output_text = commandBlocks[key].output || "No output available.";

        var output = new android.widget.TextView(ctx);
        output.setText("Previous Output: " + output_text);

        scroll.addView(output);
        layout.addView(scroll, fill);

        alert.setView(layout);

        alert.setPositiveButton("Ok", new android.content.DialogInterface.OnClickListener({
          onClick: function(viewarg) {
            commandBlocks[key].command = '' + setcmd.getText().toString(); // empty string needed to convert to JS string
            commandBlocks[key].toggle_mode = togglemode.isChecked();
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
