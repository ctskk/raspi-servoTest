import * as path from 'path';
import * as http from 'http';
import * as socketIo from 'socket.io';
import * as express from 'express';
import {Servo} from './Servo';

const app = express();
const io = socketIo();

//Node.jsの起動PathをHTTPのルートフォルダとして設定する。
app.use('/', express.static(path.join(__dirname, 'stream')));
//ルートディレクトリへのHTTPリクエストがきたら、index.htmlへのPathを返す。
app.get('/', function(req, res) { res.sendFile(__dirname + '/index.html'); });
//使用するポート番号の設定
app.set('port', process.env.PORT || 3000);

//HTTPサーバーとして動作開始する。
const server = http.createServer(app).listen(app.get('port'), function() {
	console.log('listening on *:' + app.get('port'));
});

//WebSocketの生成;
const websocket = io.listen(server);

//接続ソケット管理用配列
const sockets = {};

//サーボクラスの初期化
const servo_tilt = new Servo(19, 0/*サーボ組付時の補正値*/);
const servo_pan  = new Servo(18, 0/*サーボ組付時の補正値*/);

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
		servo_pan.setServoAngle(0);
		ack(servo_pan.angle);
	});

	//stopメッセージの処理
	socket.on('stop', function() {
		servo_pan.setServoAngle(180);
		ack(servo_pan.angle);
	});

	//set_panメッセージの処理
	socket.on('set_pan', function(angle) {
		servo_pan.setServoAngle(angle);
		ack(servo_pan.angle);
	});

	//set_tiltメッセージの処理
	socket.on('set_tilt', function(angle) {
		servo_tilt.setServoAngle(angle);
		ack(servo_tilt.angle);
	});

	//move_tileメッセージの処理
	socket.on('move_tilt', function(angle) {
		servo_tilt.addServoAngle(angle);
		ack(servo_tilt.angle);
	});

});

//ACK処理
function ack(angle : number) : void {
	console.log('[SRV] ACK:' + angle);
	websocket.sockets.emit('ack', angle);
}

