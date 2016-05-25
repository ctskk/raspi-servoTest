import wiringpi = require('wiring-pi');

/**
 * サーボ制御クラス
 */
export class Servo {
    
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
    
    //サーボ角度
    get angle() : number { return this.servo_angle; }
    
    //サーボ角度を増減させる
    public addServoAngle(angle : number) : void {
        var newVal : number = this.servo_angle += angle;
        if (newVal <   0) { newVal =   0; }
        if (newVal > 180) { newVal = 180; }
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
