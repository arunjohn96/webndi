const express = require("express");
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
ndi = addon.ndi;
var videoProperties = {
  id: 'v001',
  type: 'video',
  channelName: 'testv',
  xres: '960',
  yres: '540',
  frameRate: (1000 / 30) + ''
};
const audioProperties = {
  id: '',
  type: 'audio',
  channelName: '',
  sampleRate: '48000',
  noOfChannels: '2',
  bytesPerSample: '4',
  webFrameRate: '45',
  webChannelStride: '128',
  ndiChannelStride: '48000'
};
// ndi('create-send-video-channel', videoProperties) ;
const port = process.env.PORT || 8000;
// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on('audio frames', (audio, channelName) => {
    if (audioProperties.id != channelName) {
      audioProperties.id = channelName
      audioProperties.channelName = channelName

      ndi('create-send-audio-channel', audioProperties);
    } else {
      var audioFrameIs = new Uint8Array(audio.data);
      ndi("send-audio", audioProperties, audioFrameIs.buffer);
    }
  });

  socket.on('video frames', video => {
    if (videoProperties.id != video.id || videoProperties.channelName != video.channelName) {
      videoProperties.id = video.id
      videoProperties.channelName = video.channelName
      videoProperties.type = video.type
      videoProperties.xres = video.xres
      videoProperties.yres = video.yres
      videoProperties.frameRate = video.frameRate
      ndi('create-send-video-channel', videoProperties);

    } else {
      var videoFrameIs = new Uint8ClampedArray(video.data);
      ndi("send-video", videoProperties, videoFrameIs.buffer);
    }
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
