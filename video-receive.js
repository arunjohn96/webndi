const events = require('events')
const express = require("express");
const process = require("process");
const app = express();
const http = require("http");
const server = http.createServer(app);
const fs = require('fs')
const io = require("socket.io")(server, {
  cors: {
    origin: '*',
  },
  path: '/ndi_return/client/socket.io'
});
const addon = require('bindings')('ndi');
app.use('/static', express.static('public'))
ndi = addon.ndi;
const port = 7001;
const videoProperties = {
  id: 'x003',
  type: 'video',
  channelName: 'test-v1',
  channelGroup: '',
  channelIps: '',
  channelSearchMaxWaitTime: '25',
  command: 'stop',
  pollInterval: '0',
  bandWidth: 'low'
};
const audioProperties = {
  id: 'a003',
  type: 'audio',
  channelName: 'test-a1',
  channelSearchMaxWaitTime: '25',
  command: 'stop',
  pollInterval: '0.5',
  channelGroup: '',
  channelIps: ''
};

const emitter = new events.EventEmitter();

app.use(express.json())
app.use('/static', express.static('public'))
app.get("/ndi_return/client/receiver", function(req, res) {
  res.sendFile(__dirname + "/public/returnCanvas.html");
});
app.post("/ndi_return/client/receiver/list", function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Type', 'application/json');
  let searchProperties = req.body;
  listNDIFeeds(searchProperties)
    .then((value) => {
      res.send({
        message: 'success',
        data: value
      })
    })
    .catch((err) => {
      res.send({
        message: 'failed',
        error: err
      })
    })
});
app.post('/ndi_return/client/receiver', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  let data = req.body;
  setVideoProperties(data)
    .then((videoProperties) => {
      initializeReturnFeed(videoProperties)
    })
    .then(() => {
      res.send({
        message: 'success',
        data: req.body
      })
    })
    .catch((err) => {
      res.send({
        message: 'failed',
        error: err
      })
    })
})
app.post('/ndi_return/client/receiver/resume', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  let data = req.body;
  setVideoProperties(data)
    .then((videoProperties) => {
      resumeReturnFeed(videoProperties)
    })
    .then(() => {
      res.send({
        message: 'success',
        data: req.body
      })
    })
    .catch((err) => {
      res.send({
        message: 'failed',
        error: err
      })
    })
})
app.post("/ndi_return/client/receiver/stop", function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  let data = req.body;
  setVideoProperties(data)
    .then((videoProperties) => {
      ndi('channel-control', videoProperties)
    })
    .then(() => {
      res.send({
        message: 'success',
        data: req.body
      })
    })
    .catch((err) => {
      res.send({
        message: 'failed',
        error: err
      })
    })
});
app.post("/ndi_return/client/receiver/delete", function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  let data = req.body;
  setVideoProperties(data)
    .then((videoProperties) => {
      deleteReturnFeed(videoProperties)
    })
    .then(() => {
      res.send({
        message: 'success',
        data: req.body
      })
    })
    .catch((err) => {
      res.send({
        message: 'failed',
        error: err
      })
    })
});

function message(msg) {
  console.log(msg)
}

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

io.sockets.on("connection", socket => {
  ndiSocket = socket;

  socket.emit("ready")

  socket.on('ping', () => {
    console.log('PING::::::::::');
    // socket.to(socket.id).emit('pong', socket.id)
    // socket.emit('pong', socket.id)
  })

  socket.on("message", (data) => {
    console.log(data);
    socket.emit("message", 'connected to ndiReturnSocket:::::::::::')
  })

  socket.on("hello", () => {
    socket.emit("hello", socket.id)
  })

  socket.on("ready", (id) => {
    console.log("::::::::::::::::::::::::::::::", id);
    socket.to(id).emit('message', 'hai!!!')

    socket.emit('message', "ready received on server :::")

    // initializeReturnFeed(videoProperties);
    emitter.on('rgba', (data) => {
      socket.emit('rgba_receiver', data.buffer)
    });

    emitter.on('audio', (data) => {
      socket.emit('audio_receiver', data.buffer)
    });

  });

  socket.on("disconnect", () => {
    ndiSocket = false;
  });

})

async function initializeReturnFeed(videoProperties) {
  var audioProperty = audioProperties
  audioProperty.id = videoProperties.id + '-audio'
  audioProperty.channelName = videoProperties.channelName
  audioProperty.channelGroup = videoProperties.channelGroup
  audioProperty.channelIps = videoProperties.channelIps
  console.log("initializeReturnFeed::::::::::::::::", videoProperties);
  console.log(audioProperty);
  ndi('channel-control', videoProperties);
  ndi('create-receive-video-channel', videoProperties);
  ndi('receive-video', videoProperties, message, captureVideo);
  ndi('create-receive-audio-channel', audioProperty);
  ndi('receive-audio', audioProperty, message, captureAudio);
}
async function resumeReturnFeed(videoProperties) {
  console.log("resumeReturnFeed::::::::::::::::", videoProperties);
  ndi('channel-control', videoProperties)
  ndi('receive-video', videoProperties, message, captureVideo);
}
async function deleteReturnFeed(videoProperties) {
  console.log("deleteReturnFeed::::::::::::::::", videoProperties);
  ndi('channel-control', videoProperties);
  /*ndi('delete-video-channel', videoProperties, (data) => {
    console.log(data);
  })*/
}
async function listNDIFeeds(data) {
  const SearchProperties = {
    channelSearchMaxWaitTime: '30',
    channelGroup: '',
    channelIps: '',
    channelSearchMaxTrials: '10'
  };

  if (data.hasOwnProperty('channelSearchMaxWaitTime')) {
    SearchProperties.channelSearchMaxWaitTime = data.channelSearchMaxWaitTime
  }
  if (data.hasOwnProperty('channelGroup')) {
    SearchProperties.channelGroup = data.channelGroup
  }
  if (data.hasOwnProperty('channelIps')) {
    SearchProperties.channelIps = data.channelIps
  }
  if (data.hasOwnProperty('channelSearchMaxTrials')) {
    SearchProperties.channelSearchMaxTrials = data.channelSearchMaxTrials
  }

  var x, result;
  console.log(SearchProperties);
  ndi('list-channel', SearchProperties, (data) => {
    console.log(data);
    x = data.filter(onlyUnique).sort();
    result = extractChannelName(x)
    // x = data;
  });

  // console.log("X:::", x);

  return result
}
async function setVideoProperties(data) {
  var vProperty = videoProperties;
  var currentDate = new Date()
  console.log("setVideoProperties ::::::", data, currentDate);
  if (data.hasOwnProperty('channelName')) {
    vProperty.channelName = data.channelName
    vProperty.id = '' + data.channelName + '-return-id';
  }
  if (data.hasOwnProperty('command')) {
    vProperty.command = data.command
  }
  if (data.hasOwnProperty('channelIps')) {
    vProperty.channelIps = data.channelIps
  }
  if (data.hasOwnProperty('channelGroup')) {
    vProperty.channelGroup = data.channelGroup
  }
  if (data.hasOwnProperty('id')) {
    vProperty.id = data.id
  }
  if (data.hasOwnProperty('type')) {
    vProperty.type = data.type
  }
  return vProperty
};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function extractChannelName(value) {
  var res = []
  console.log("extractChannelName::::", value);
  value.forEach((item, i) => {
    res.push(item.split("(")[1].split(")")[0])
  });
  console.log("RES::::", res);
  return res
}


server.listen(port, () => console.log(`Server is running on port ${port}`));


/*
ndi('receive-video', videoProperties, message, emitter.emit.bind(emitter)) ;
*/
