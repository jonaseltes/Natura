var express = require('express');
var app = express();
var path = require("path");
// var reload = require('reload');
var server = require('http').Server(app);

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname+'/index.html'));
});

app.use(express.static(__dirname + '/public'));
// app.use(express.static(__dirname + '/js'));
// app.use(express.static(__dirname + '/textures'));
// app.use(express.static(__dirname + '/assets'));


// reload(server, app);


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});


// app.use(express.static(‘.’));
