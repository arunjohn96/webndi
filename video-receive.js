const events = require('events')
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

const videoProperties = {
    id: 'x003',
    type: 'video',
    channelName: 'test-v1',
	channelSearchMaxWaitTime: '60',
	command: 'stop'
};

const emitter = new events.EventEmitter();
emitter.on('receive', (data) => {
    var videoFrameIs = new Uint8Array(data);
    console.log(videoFrameIs);
});

//setTimeout(function () {
//	   ndi("video-channel-control", videoProperties) ;
//    }, 4000);
//

ndi('create-receive-video-channel', videoProperties) ;
ndi('receive-video', videoProperties, emitter.emit.bind(emitter)) ;




