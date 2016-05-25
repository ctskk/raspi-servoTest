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

//サーボクラスの初期化
var servo : Servo = new Servo();

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

/**
 * サーボ制御クラス
 */
class Servo {
    
    //GPIO制御用に使用するPIN番号
    private pinNumber : number;
    //サーボ角度
    private servo_angle : number;
    
    //コンストラクタ
    constructor(pinNumber : number = 18, clock : number = 400, range : number = 1024) {
        
        this.pinNumber = pinNumber;
        this.servo_angle = 0;
        
        //WiringPiの初期化
        if(wiringpi.wiringPiSetupGpio() == -1)
        {
            console.log("[SRV] Setup error.");
        }
        else
        {
            console.log("[SRV] GPIO setup ok.");
        }
        wiringpi.pinMode(this.pinNumber, wiringpi.PWM_OUTPUT);
        wiringpi.pwmSetMode(wiringpi.PWM_MODE_MS);
        wiringpi.pwmSetClock(clock);
        wiringpi.pwmSetRange(range);
    }
    
    get angle() : number { return this.servo_angle; }
    
    //サーボ角度を増減させる
    public addServoAngle(angle : number) : void {
        var newVal : number = this.servo_angle += angle;
        if (newVal <   0) { this.servo_angle =   0; }
        if (newVal > 180) { this.servo_angle = 180; }
        this.setServoAngle(newVal);
    }
    
    //サーボ角度を設定する
    public setServoAngle(angle : number) : void {
        this.servo_angle = angle;
        const st =  35;
        const ed = 118;
        let step = Math.ceil(((ed - st) / 180) * this.servo_angle);
        var num : number = st + step;
        console.log('[SRV] STP:' + num);
        wiringpi.pwmWrite(this.pinNumber, num);
    }

}
