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
app.use('/static', express.static('public'))
ndi = addon.ndi;

const audioProperties = {
  id: 'a001',
  type: 'audio',
  channelName: 'test',
  sampleRate: '48100',
  noOfChannels: '2',
  noOfSamples: '512',
  channelStride: '512'
};

var videoProperties = {
  id: 'b001',
  type: 'video',
  channelName: 'testVideo',
  xres: '480',
  yres: '320',
  frameRate: (1000 / 30) + ''
};

let broadcaster;
const port = process.env.PORT || 80;

function success(err, id, type) {
  // console.log(`successfully send ${type} frame - [${id}]`) ;
}

// API URLS
app.get("/meeting", function(req, res) {
  res.sendFile(__dirname + "/public/broadcast.html");
});
app.get("/audio", function(req, res) {

  res.sendFile(__dirname + "/public/AudioBuffer.html");
});
app.get("/panel", function(req, res) {
  res.sendFile(__dirname + "/public/watch.html");
});

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

function toBuffer(ab) {
  var buf = Buffer.alloc(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  // ########### NDI sockets ###########
  socket.on('audio_buffer', function(msg) {
    // const audio_buf = new DataView(toArrayBuffer(toBuffer(msg)))

  })

  socket.on('audio frames', obj => {
    audioProperties.id = obj.id
    audioProperties.type = obj.type
    audioProperties.channelName = obj.channelName
    audioProperties.sampleRate = obj.sampleRate
    audioProperties.noOfChannels = obj.noOfChannels
    audioProperties.noOfSamples = obj.noOfSamples
    audioProperties.channelStride = obj.channelStride
    const audio_buf = new Int8Array(obj.data)
    const audioFrameIs = new Float32Array(audio_buf, 4)
    // audioFrameIs.set(obj.data)
    // obj.data.forEach((item, i) => {
    //
    // });

    console.log(audioFrameIs[0]);
    // ndi('sync', audioProperties, audioFrameIs.buffer, success);
  });
  socket.on('video frames', obj => {
    videoProperties.id = obj.id
    videoProperties.channelName = obj.channelName
    videoProperties.xres = obj.width
    videoProperties.yres = obj.height
    videoProperties.frameRate = obj.frameRate
    var videoFrameIs = new Uint8ClampedArray(obj.data);
    // var videoFrameIs2 = new Uint8ClampedArray(msg);

    // socket.emit("rec", videoProperties);
    //console.log(videoFrameIs);
    ndi('sync', videoProperties, videoFrameIs.buffer, success);
    // ndi('sync',videoProperties2, videoFrameIs2.buffer, success2) ;
  });

  // ########### Webrtc Sockets ##########
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));

// executeNDI();

function executeNDI() {
  fs.readFile(__dirname + '/public/data.raw', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    const output_raw = new DataView(toArrayBuffer(data)) // 80000
    const audio_buffer = new Float32Array(output_raw.buffer) //20000
    console.log(output_raw.byteLength, "DataViewLength:::");
    console.log(audio_buffer.length, "ArrayBuffer Length:::");
    const sample_size = 1920
    audioProperties.sampleRate = '48000'
    audioProperties.noOfChannels = '1'
    audioProperties.noOfSamples = sample_size+''
    audioProperties.channelStride = sample_size + ''
    var i = 0;
    setInterval(()=>{
      const audio_frame = new Float32Array(audio_buffer.slice(i * sample_size, i * sample_size + (sample_size-1)).buffer)
      console.log(audio_frame[0], audio_frame[1], i);
      ndi('sync', audioProperties, audio_frame.buffer , success);
      i++
      if (i*sample_size > audio_buffer.length){
        i=0;
      }
    },100)
    // Worked for 1920,43
    // console.log("Checking :::::: Length (ffmpeg, recieved data) :::", '('+data.length+','+ msg.length+')');
    console.log("Checking :::::: ffmpeg :::", output_raw.getFloat32(0, false));
    console.log("Checking :::::: ffmpeg :::", output_raw.getFloat32(0, true));
    // console.log("Checking :::::: recieved data :::", audio_buf.getFloat32(audio_buf.length, false));
  })
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
