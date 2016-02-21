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
