#!/usr/bin/env node

var spawn = require('child_process').spawn;
var express = require('express');
var WebSocket = require('ws');
var os = require('os');
var multer = require('multer');
var serveStatic = require('serve-static');
var upload = multer({
    dest: os.tmpdir()
});
var ip = require('ip');
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var compression = require('compression');
var app = express();
var server = require('http').createServer(app);
var directory = path.join(__dirname, "public");
var wss = new WebSocket.Server({
    server: server
});

var port = Number(process.argv[2] || 80);

console.log("Navigate to " + ip.address() + ":" + port);

app.use(compression({
    level: 5
}));

app.use(serveStatic(directory, {
    index: ["index.html"]
}));

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

app.post("/blenderfile", upload.single("blenderfile"), function(req, res, next) {
    res.send("recieved");
    console.log("new connection");
    wss.on("connection", function(ws) {
        console.log("ready");
        var filepath = req.file.path;
        console.log("temp path: " + filepath);
        blenderoutput("MAIN: Started", ws) || next();
        var tempimagesdir = tmp.dirSync().name;
        var output = spawn("blender", ["--background", filepath, "-o", tempimagesdir + "/temp_#####", "-t", "0", "-F", "PNG", "-a"]);
        output.stdout.on("data", function(data) {
            blenderoutput("BLENDER: " + data, ws) || next();
        });
        output.on("close", function(code) {
            blenderoutput("MAIN: Blender done, starting ffmpeg", ws) || next();
            var tempvideoloc = tmp.tmpNameSync({
                postfix: ".mp4"
            });
            var videocreation = spawn("ffmpeg", ["-i", tempimagesdir + "/temp_%05d.png", tempvideoloc]);
            videocreation.stdout.on("data", function(data) {
                blenderoutput("FFMPEG: " + data, ws) || next();
            });
            videocreation.on("close", function(code) {
                blenderoutput("MAIN: Ffmpeg done", ws) || next();
                console.log("rendering finished");
                ws.send(toArrayBuffer(fs.readFileSync(tempvideoloc)));
                tmp.setGracefulCleanup();
            });
        });
    });
});

function blenderoutput(data, ws) {
    if (ws.readyState === ws.OPEN) {
        var datatosend = JSON.stringify({
            target: "processingoutput",
            data: data
        });
        ws.send(datatosend);
        return true;
    } else {
        return false;
    }
}

server.listen(port);
