var express = require("express");
var fs = require("fs");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set("view engine", "pug");
app.set("views","./");

app.use(function(req, res, next) {
  res.header("Content-Security-Policy", "default-src 'self' 'unsafe-inline' cdn.nexzcore.com ajax.cloudflare.com fonts.googleapis.com fonts.gstatic.com cdn.jsdelivr.net static.cloudflareinsights.com www.google.com www.w3.org data:");
  res.header("X-Frame-Options", "DENY");
  res.header("X-Powered-By", "Nexzcore");
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

io.on('connection', (socket) => {
  socket.on('new', (item) => {
    var temp = JSON.parse(fs.readFileSync('items.json'));
    temp.push(item);
    id = temp.indexOf(item);
    fs.writeFileSync('items.json', JSON.stringify(temp,null,4));
    io.emit('new', [id,item]);
  });
  socket.on('delete', (id) => {
    var temp = JSON.parse(fs.readFileSync('items.json'));
    temp.splice(id,1);
    fs.writeFileSync('items.json', JSON.stringify(temp,null,4));
    io.emit('delete', id);
  });
});

app.get("/", function (req, res) {
  res.render("index",{items:JSON.parse(fs.readFileSync('items.json'))});
});

var server = http.listen(process.env.PORT || 2021, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server running at http://%s:%s", host, port);
});
