const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

var u_ws = [];
var h_ws = {};
var a_ws = undefined;

wss.on('connection', function connection(ws,req) {

  var query = require('url').parse(req.url,true).query;
  console.log(query.q);
  if(query.mod != "admin") {
    u_ws.push(ws);
    h_ws[query.name] = ws;
    if(a_ws) {
      a_ws.send("UE:" + query.name);
    }
  } else {
    a_ws = ws;
  }

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    if(query.mod == "admin") {
      CheckMessageFromAdmin(message);
    } else {
      if(message == "UL") {
        if(a_ws) {
          a_ws.send("UL:" + query.name);
        }
      }
    }
  });

  ws.send('something');

  LoopTest(ws);
});

function LoopTest(ws) {
  ws.send("send from loop test");
  setTimeout( function() { LoopTest(ws) } ,1000);
}

function CheckMessageFromAdmin(msg) {
  console.log("msg from admin : " + msg);
  var d = msg.split(":");
  if(d.length > 0) {
    if(d[0] == "SA") {
      for(let i = 0; i < u_ws.length; i++) {
        // console.log(u_ws[i]);
        u_ws[i].send("MA:" + d[1]);
      }
    } else if(d[0] == "CC") {
      h_ws[d[1]].send("CC");
    }
  }
}
