const express = require("express");
const process = require("process");
const app = express();
const http = require("http");
const server = http.createServer(app);
const fs = require('fs')
const io = require("socket.io")(server);
const addon = require('bindings')('ndi');
app.use('/static', express.static('public'))
ndi = addon.ndi;

const audioProperties = {
    id: 'a001',
    type: 'audio',
    channelName: 'test-a1',
    sampleRate: '48000',
    noOfChannels: '2',
    bytesPerSample:'4',
    webFrameRate: '45',
    webChannelStride: '128',
    ndiChannelStride: '48000'
};

var videoProperties = {
    id: 'b001',
    type: 'video',
    channelName: 'test-v1',
    xres: '480',
    yres: '320',
    frameRate: (1000 / 30) + ''
};

const port = process.env.PORT || 80;

function success(err, id, type) {
  // console.log(`successfully send ${type} frame - [${id}]`) ;
}

// API URLS
app.get("/av", function(req, res) {
  res.sendFile(__dirname + "/public/av.html");
});

ndi('create-send-audio-channel', audioProperties) ;
ndi('create-send-video-channel', videoProperties) ;

io.sockets.on("connection", socket => {
    socket.on('audio frames', audio => { 
       var audioFrameIs = new Uint8Array(audio.data) ;
       ndi("send-audio", audioProperties, audioFrameIs.buffer);
    });
    socket.on('video frames', video => {
       var videoFrameIs = new Uint8ClampedArray(video);
       ndi("send-video", videoProperties, videoFrameIs.buffer);
    });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
 
