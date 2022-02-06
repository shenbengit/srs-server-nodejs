# srs-server-nodejs
> 音视频通话信令服务完整示例移步[srs-rtc-server](https://github.com/shenbengit/srs-rtc-server)。    

多端通话信令服务器，搭配Android demo[p2p](https://github.com/shenbengit/WebRTC-SRS/tree/master/p2p)。

```shell
npm install

node .\app.js

```

默认开启端口8089

修改[publish.html](https://github.com/shenbengit/srs-server-nodejs/blob/49733828cb7bae5444ade8c12506dc4b53330454/public/publish.html#L60) 中服务地址。

Web音视频通话页地址：https://ip:8089/publish.html

注意：Web端只有localhost和https才能调用摄像头。
