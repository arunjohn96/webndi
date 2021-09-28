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

const audioProperties = {
    id: 'a003',
    type: 'audio',
    channelName: 'test-a1',
	channelSearchMaxWaitTime: '5',
	command: 'stop'
};


const emitter = new events.EventEmitter();
emitter.on('receive', (data) => {
	var audioFrameIs = new Uint8Array(data);
	console.log(audioFrameIs);
});

//ndi('receive-audio', audioProperties, emitter.emit.bind(emitter)) ;

//setTimeout(function () {
//	   ndi("audio-channel-control", audioProperties) ;
//    }, 4000);
//
ndi('create-receive-audio-channel', audioProperties) ;
ndi('receive-audio', audioProperties, emitter.emit.bind(emitter)) ;


