var Data = {};

Data.save = function(file, content) {
  var path = new android.os.Environment.getExternalStorageDirectory().getPath() + "/games/com.mojang/minecraftworlds/" + Level.getWorldDir() + '/modData/commandBlocks/';
  try {
    file = file + '.json';
    var data = new java.io.File(path + file);
    if (data.exists()) data.delete();
    data.createNewFile();
    var outWrite = new java.io.OutputStreamWriter(new java.io.FileOutputStream(data), 'UTF-8');
    outWrite.append(encodeURI(JSON.stringify(content || {})));
    outWrite.close();
    return Data.read(file);
  } catch (err) {
    print(err);
  }
};

Data.read = function(file) {
  var path = new android.os.Environment.getExternalStorageDirectory().getPath() + "/games/com.mojang/minecraftworlds/" + Level.getWorldDir() + '/modData/commandBlocks/';
  var result;
  try {
    file = file + '.json';
    java.io.File(new java.io.File(path)).mkdirs();
    var data = new java.io.File(path + file);
    if (!data.exists()) {
      return {};
    }
    var fos = new java.io.FileInputStream(data);
    var str = new java.lang.StringBuilder();
    var ch;
    while ((ch = fos.read()) != -1) {
      str.append(java.lang.Character(ch));
    }
    var content = String(str.toString());
    try {
      result = JSON.parse(content);
    } catch (err) {
      result = JSON.parse(decodeURI(content));
    }
    fos.close();
  } catch (err) {
    result = {};
  }
  return result;
};

module.exports = Data;
