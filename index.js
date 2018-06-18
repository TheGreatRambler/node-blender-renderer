var spawn = require('child_process').spawn;
var express = require('express');
var WebSocket = require('ws');
var os = require('os');
var multer = require('multer');
var upload = multer({
    dest: os.tmpdir()
});
var ip = require('ip');
var serveStatic = require('serve-static');
var path = require('path');
var errorhandler = require('express-error-handler');
var compression = require('compression');
var app = express();
var server = require('http').createServer(app);
var directory = path.join(__dirname, "public");
var wss = new WebSocket.Server({
    server: server
});

console.log("started");

app.use(compression({
    level: 5
}));

app.use(serveStatic(directory, {
    'index': ["index.html?ip=" + ip.address()]
}));

app.use(errorhandler({
    server: server
}));

app.post("/blenderfile", upload.single("blenderfile"), function(req, res, next) {
    res.send("recieved");
    console.log("new connection");
    wss.on("connection", function(ws) {
        console.log("ready");
        var filepath = req.file.path;
        console.log("temp path: " + filepath);
        blenderoutput("MAIN: Started", ws) || next();
        var output = spawn("blender", ["--background", filepath, "-o", "temp-image-files/temp_#####", "-t", "0", "-F", "PNG", "-a"]);
        output.stdout.on("data", function(data) {
            blenderoutput("BLENDER: " + data, ws) || next();
        });
        output.on("close", function(code) {
            blenderoutput("MAIN: Blender done, starting ffmpeg", ws) || next();
            var videocreation = spawn("ffmpeg", ["-framerate", "25", "-i", "temp-image-files/temp_%05d.png", "blender-video.mp4"]);
            videocreation.stdout.on("data", function(data) {
                blenderoutput("FFMPEG: " + data, ws) || next();
            });
            videocreation.on("close", function(code) {
                blenderoutput("MAIN: Ffmpeg done", ws) || next();
                console.log("rendering finished");
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

server.listen(80);
