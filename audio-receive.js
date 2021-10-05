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
	channelSearchMaxWaitTime: '120',
	command: 'stop'
};


const audioProperties2 = {
    id: 'a002',
    type: 'audio',
    channelName: 'test-a2',
    sampleRate: '48000',
    noOfChannels: '2',
    bytesPerSample:'4',
    webFrameRate: '45',
    webChannelStride: '128',
    ndiChannelStride: '48000'
};


ndi('create-send-audio-channel', audioProperties2) ;

const emitter = new events.EventEmitter();
emitter.on('receive', (data) => {
	// var audioFrameIs = new Float32Array(data);
	var audioFrameIs = new Uint8Array(data);
  // ndi("send-audio", audioProperties2, audioFrameIs.buffer);
	// console.log(audioFrameIs);
});

//ndi('receive-audio', audioProperties, emitter.emit.bind(emitter)) ;

//setTimeout(function () {
//	   ndi("audio-channel-control", audioProperties) ;
//    }, 4000);
//
ndi('create-receive-audio-channel', audioProperties) ;
ndi('receive-audio', audioProperties, emitter.emit.bind(emitter)) ;
