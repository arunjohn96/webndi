const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 9006;
const events = require('events')
const addon = require('bindings')('ndi');
ndi = addon.ndi;

const SearchProperties = {
	channelSearchMaxWaitTime: '25',
};

function analyse(data) {
    console.log(data);
}

ndi('list-channel', SearchProperties, analyse) ;

server.listen(port, () => console.log(`Server is running on port ${port}`));

