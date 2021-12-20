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

const audioProperties = {
    id: '',
    type: 'audio',
    channelName: '',
    sampleRate: '48000',
    noOfChannels: '2',
    bytesPerSample:'4',
    webFrameRate: '45',
    webChannelStride: '128',
    ndiChannelStride: '48000'
};


// ndi('create-send-audio-channel', audioProperties) ;

const port = process.env.PORT || 8001;

function success(err, id, type) {
  // console.log(`successfully send ${type} frame - [${id}]`) ;
}


// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  // ########### NDI sockets ###########


  socket.on('audio frames', (audio, channelName) => {
    if (audioProperties.id != channelName){
      audioProperties.id = channelName
      audioProperties.channelName = channelName

      ndi('create-send-audio-channel', audioProperties) ;
    }
    var audioFrameIs = new Uint8Array(audio.data);
    ndi("send-audio", audioProperties, audioFrameIs.buffer);
  });

});

server.listen(port, () => console.log(`Server is running on port ${port}`));
