// let socket_io = require("socket.server");
// let http = require("http");
// let https = require("https");
// let express = require('express');
// let log4js = require('log4js');
//
// let app = express();
//
// let http_server = http.createServer(app);
// http_server.listen(8898, "0.0.0.0")
//
// socket_io.listen()

// const engine = require('engine.server');
// const server = engine.listen(8089);
//
// server.on('connection', socket => {
//     socket.send('utf 8 string');
//     socket.send(Buffer.from([0, 1, 2, 3, 4, 5])); // binary datano
// });
// const fs = require('fs');
// const express = require("express");
// const path = require("path")
// const url = require("url")
//
// let app = express();
// const serveIndex = require('serve-index');
// app.use(serveIndex('./html'));
// app.use(express.static('./html'));
// const root = path.resolve()
//
// // 创建服务器
// var sever = http.createServer(function (request, response) {
//     var pathname = url.parse(request.url).pathname;
//     var filepath = path.join(root, pathname);
//     // 获取文件状态
//     fs.stat(filepath, function (err, stats) {
//         if (err) {
//             // 发送404响应
//             response.writeHead(404);
//             response.end("404 Not Found.");
//         } else {
//             // 发送200响应
//             response.writeHead(200);
//             // response是一个writeStream对象，fs读取html后，可以用pipe方法直接写入
//             fs.createReadStream(filepath).pipe(response);
//         }
//     });
// });
// sever.listen(8080);


// const http = require("http"),
//     fs = require("fs"),
//     path = require("path"),
//     url = require("url");
//
// var root = path.resolve();
//
// var sever = http.createServer(function(request,response){
//     var pathname = url.parse(request.url).pathname;
//     var filepath = path.join(root,pathname);
//     // 获取文件状态
//     fs.stat(filepath,function(err,stats){
//         if(err){
//             // 发送404响应
//             response.writeHead(404);
//             response.end("404 Not Found.");
//         }else{
//             // 发送200响应
//             response.writeHead(200);
//             // response是一个writeStream对象，fs读取html后，可以用pipe方法直接写入
//             fs.createReadStream(filepath).pipe(response);
//         }
//     });
// });
// sever.listen(8081);

const fs = require('fs');

const options = {
    key: fs.readFileSync('./cert/1557605_www.learningrtc.cn.key'),
    cert: fs.readFileSync('./cert/1557605_www.learningrtc.cn.pem')
}
const express = require('express')
const app = express()
const serveIndex = require('serve-index');

app.use(serveIndex('./public'));
app.use(express.static('./public'));
const server = require('https').createServer(options, app);

const ioServer = require('socket.io')(server, {
    cors: {
        origin: "https://localhost:8089",
        // methods: ["GET", "POST"],
        credentials: false
    }
});

const socketServer = ioServer.of("/srs")

const clientWebrtcMap = new Map();

socketServer.on('connection', client => {
    console.log("connection:" + client.id)
    // client.emit("test_list", ["1", "2"])
    client.on('join_room', roomId => {
        console.log("join_room-roomId:" + roomId,client.id)

        const set = socketServer.adapter.rooms.get(roomId)
        if (set && set.size > 0) {
            const list = []
            for (const item of set) {
                list.push(clientWebrtcMap.get(item))
                console.log("in_room_other_client---->item", list)
            }
            if (list.length > 0) {
                console.log("in_room_other_client---->all", list.length)
                //推送房间里其他客户端的流地址
                client.emit("in_room_other_client", list)
            }
        }
        console.log(roomId + ",里所有人1：", socketServer.adapter.rooms.get(roomId))
        client.join(roomId);
        client.broadcast.to(roomId).emit("joined", client.id)
        console.log(roomId + ",里所有人2：", socketServer.adapter.rooms.get(roomId))
    }).on("pull_webrtc", (roomId, url) => {
        clientWebrtcMap.set(client.id, url)
        console.log("pull_webrtc", roomId, url)
        client.broadcast.to(roomId).emit("push_webrtc", url)
        console.log("push_webrtc", roomId, url)
    });

    client.on('disconnect', () => {
        clientWebrtcMap.delete(client.id)

        console.log("disconnect:" + client.id)
    });
});

server.listen(8089, () => {
    console.log('App listening at port 8089')
})
