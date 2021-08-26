const fs = require('fs');

const options = {
    key: fs.readFileSync('./cert/server.key'),
    cert: fs.readFileSync('./cert/server.pem')
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
