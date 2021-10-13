const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e8
});
app.use('/static', express.static('public'))


const port = process.env.PORT || 7000;


app.get("/browser", function(req, res) {
  res.sendFile(__dirname + "/public/browser.html");
});
app.get("/server", function(req, res) {
  res.sendFile(__dirname + "/public/server.html");
});

// const server_list = ['http://localhost:9000']
const server_list = ['https://stream1.webrtc2ndi.life']
const browser_list = {}

// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  // ########### NDI sockets ###########

  socket.on("browser", (ExternalUserID) => {
    browser_list[ExternalUserID] = socket.id
    console.log("Browser List:::::::", browser_list);
    console.log("Sending emit to ::::", browser_list[ExternalUserID]);
    socket.emit("browser_added")
  });

  socket.on("get_server", (ExternalUserId) => {
    index = Object.keys(browser_list).indexOf(ExternalUserId)
    console.log("External User Id Index:::",index);
    var j =0;
    var i =0;
    var server_url;
    while(i<=index){
      if (j>=server_list.length){
        j=0
      }
      server_url = server_list[j]
      console.log(j, server_url);
      j++;
      i++;
    }
    socket.emit("server_url", server_url)

  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
