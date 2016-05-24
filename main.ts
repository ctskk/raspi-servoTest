import express  = require('express');
import http     = require('http');
import io       = require('socket.io');
import path     = require('path');
import wiringpi = require('wiring-pi');

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

//サーボの初期角度
var servo_angle : number = 0;

//サーボ制御用GPIO PIN番号
let PIN_NUMBER : number = 18;

//*
//WiringPiの初期化
if(wiringpi.wiringPiSetupGpio() == -1)
{
    console.log("[SRV] Setup error.");
}
else
{
    console.log("[SRV] GPIO setup ok.");
}
wiringpi.pinMode(PIN_NUMBER, wiringpi.PWM_OUTPUT);
wiringpi.pwmSetMode(wiringpi.PWM_MODE_MS);
wiringpi.pwmSetClock(400);
wiringpi.pwmSetRange(1024);
//*/

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
        servo_angle = 0;
        setServoAngle(0);
        ack(websocket, servo_angle);
    });

    //stopメッセージの処理
    socket.on('stop', function() {
        servo_angle = 0;
        setServoAngle(0);
        ack(websocket, servo_angle);
    });

    //setメッセージの処理
    socket.on('set', function(angle) {
        servo_angle = angle;
        setServoAngle(servo_angle);
        ack(websocket, servo_angle);
    });

    //moveメッセージの処理
    socket.on('move', function(angle) {
        servo_angle += angle;
        setServoAngle(servo_angle);
        ack(websocket, servo_angle);
    });

});

//サーボ角度を設定する
function setServoAngle(angle : number) {
    const st =  15;
    const ed = 120;
    let step = Math.ceil(((ed - st) / 180) * angle);
    var num : number = st + step;
    console.log('[SRV] STP:' + num);
    wiringpi.pwmWrite(PIN_NUMBER, num);
}

//ACK処理
function ack(io, angle : number) : void {
    console.log('[SRV] ACK:' + angle);
    io.sockets.emit('ack', angle);
}
