const express = require("express");
const events = require('events')
const app = express();
const http = require("http");
const server = http.createServer(app);
const fs = require('fs')
const io = require("socket.io")(server, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e8
});
const addon = require('bindings')('ndi');

const port = process.env.PORT || 9000;
const emitter = new events.EventEmitter();
ndi = addon.ndi;

const videoProperties = {
  id: 'v001',
  type: 'video',
  channelName: 'test',
  xres: '960',
  yres: '540',
  frameRate: (1000 / 30) + '',
  // channelIps: '',
  channelGroup: '',
};
const audioProperties = {
  id: '',
  type: 'audio',
  channelName: 'test',
  sampleRate: '48000',
  noOfChannels: '2',
  bytesPerSample: '4',
  webFrameRate: '45',
  webChannelStride: '128',
  ndiChannelStride: '48000',
  channelIps: '',
  channelGroup: '',
};
const returnVideoProperties = {
  id: 'x003',
  type: 'video',
  channelName: 'test',
  channelGroup: '',
  channelIps: '',
  channelSearchMaxWaitTime: '25',
  command: 'stop',
  pollInterval: '0',
  bandWidth: 'low'
};
const returnAudioProperties = {
  id: 'a003',
  type: 'audio',
  channelName: 'test',
  channelSearchMaxWaitTime: '25',
  command: 'stop',
  pollInterval: '0.5',
  channelGroup: '',
  channelIps: ''
};

// API URLS
app.use('/static', express.static('public'))
app.get("/test", function(req, res) {
  res.sendFile(__dirname + "/public/TestNDI.html");
});
app.get("/video", function(req, res) {
  res.sendFile(__dirname + "/public/video.webm");
});


function captureVideo(data) {
  var videoFrameIs = new Uint8Array(data.data);
  var rgbaFrame = new Uint8Array(videoFrameIs.byteLength)
  rgbaFrame.set(videoFrameIs)
  emitter.emit('rgba', rgbaFrame)
  // console.log("Data::::");
}

function captureAudio(data) {
  var audioFrameIs = new Float32Array(data.data);
  var audioFrame = new Float32Array(audioFrameIs.byteLength)
  audioFrame.set(audioFrameIs)
  emitter.emit('audio', audioFrame)
  // console.log("Audio Data::::", audioFrame.byteLength);
}

async function initializeReturnFeed(videoProperties) {
  var audioProperty = returnAudioProperties
  audioProperty.id = videoProperties.id + '-audio'
  audioProperty.channelName = videoProperties.channelName
  audioProperty.channelGroup = videoProperties.channelGroup
  audioProperty.channelIps = videoProperties.channelIps
  audioProperty.command = "start"
  videoProperties.command = "start"
  console.log("initializeReturnFeed::::::::::::::::", videoProperties);
  console.log(audioProperty);
  ndi('channel-control', videoProperties);
  ndi('channel-control', audioProperty);
  ndi('create-receive-video-channel', videoProperties);
  ndi('receive-video', videoProperties, message, captureVideo);
  ndi('create-receive-audio-channel', audioProperty);
  ndi('receive-audio', audioProperty, message, captureAudio);
}

function message(msg) {
  console.log(msg)
}

// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {

  socket.on('audio frames', (audio, channelName, channelGroup) => {
    if (!(audioProperties.id == channelName && audioProperties.channelGroup == channelGroup)) {
      audioProperties.id = channelName
      audioProperties.channelName = channelName
      // audioProperties.channelIps = videoProperties.channelIps
      audioProperties.channelGroup = channelGroup
      ndi('create-send-audio-channel', audioProperties);
    } else {
      var audioFrameIs = new Uint8Array(audio.data);
      ndi("send-audio", audioProperties, audioFrameIs.buffer);
    }
  });

  socket.on('video frames', video => {
    if (!(videoProperties.id == video.id && videoProperties.channelName == video.channelName &&
        videoProperties.channelIps == video.channelIps && videoProperties.channelGroup == video.channelGroup &&
        videoProperties.xres == video.xres && videoProperties.yres == video.yres &&
        videoProperties.frameRate == video.frameRate)) {
      videoProperties.id = video.id
      videoProperties.channelName = video.channelName
      videoProperties.type = video.type
      videoProperties.xres = video.xres
      videoProperties.yres = video.yres
      videoProperties.frameRate = video.frameRate
      videoProperties.channelIps = video.channelIps
      videoProperties.channelGroup = video.channelGroup
      ndi('create-send-video-channel', videoProperties);
      setTimeout(() => {
        initializeReturnFeed(returnVideoProperties)
      }, 5000)

    } else {
      var videoFrameIs = new Uint8ClampedArray(video.data);
      ndi("send-video", videoProperties, videoFrameIs.buffer);
    }
  });

  socket.on("ready", (id) => {
    emitter.on('rgba', (data) => {
      socket.emit('rgba_receiver', data.buffer)
    });
    emitter.on('audio', (data) => {
      socket.emit('audio_receiver', data.buffer)
    });
  });

});

server.listen(port, () => console.log(`Server is running on port ${port}`));
