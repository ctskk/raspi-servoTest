import express  = require('express');
import http     = require('http');
import io       = require('socket.io');
import path     = require('path');
import Servo    = require('./Servo');

var app = express();

//Node.jsの起動PathをHTTPのルートフォルダとして設定する。
app.use('/', express.static(path.join(__dirname, 'stream')));
//ルートディレクトリへのHTTPリクエストがきたら、index.htmlへのPathを返す。
app.get('/', function(req, res) { res.sendFile(__dirname + '/index.html'); });
//使用するポート番号の設定
app.set('port', process.env.PORT || 3000);

//HTTPサーバーとして動作開始する。
var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('listening on *:' + app.get('port'));
});

//WebSocketの生成;
var websocket = io.listen(server);

//接続ソケット管理用配列
var sockets = {};

//サーボクラスの初期化
var servo = new Servo.Servo();

//クライアントからSocket接続があった場合の処理
websocket.on('connection', function(socket) {

    //連想配列にオブジェクトを記録しつつLog出力する。
    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);

    //Socket切断時の処理
    socket.on('disconnect', function() {
        //オブジェクトを削除する。
        delete sockets[socket.id];
    });

    //startメッセージの処理
    socket.on('start', function() {
        servo.setServoAngle(0);
        ack();
    });

    //stopメッセージの処理
    socket.on('stop', function() {
        servo.setServoAngle(0);
        ack();
    });

    //setメッセージの処理
    socket.on('set', function(angle) {
        servo.setServoAngle(angle);
        ack();
    });

    //moveメッセージの処理
    socket.on('move', function(angle) {
        servo.addServoAngle(angle);
        ack();
    });

});

//ACK処理
function ack() : void {
    console.log('[SRV] ACK:' + servo.angle);
    websocket.sockets.emit('ack', servo.angle);
}

