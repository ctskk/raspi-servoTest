import wiringpi = require('wiring-pi');

/**
 * サーボ制御クラス
 */
export class Servo {

    private static wiringPi_initialized : boolean = false;
    
    //GPIO制御用に使用するPIN番号
    private pinNumber : number;
    //サーボ角度
    private servo_angle : number;
    //角度補正値
    private adjust_angle : number;
    
    //コンストラクタ
    constructor(pinNumber : number, adjust_angle : number = 0, clock : number = 400, range : number = 1024) {
        
        this.pinNumber = pinNumber;
        this.adjust_angle = adjust_angle;
        this.servo_angle = 0;
        
        //WiringPiの初期化
        if(/*Servo.wiringPi_initialized != true && */wiringpi.wiringPiSetupGpio() == -1)
        {
            console.log("[SRV] Setup error.");
            Servo.wiringPi_initialized = false;
        }
        else
        {
            console.log("[SRV] GPIO setup ok.");
            wiringpi.pinMode(this.pinNumber, wiringpi.PWM_OUTPUT);
            wiringpi.pwmSetMode(wiringpi.PWM_MODE_MS);
            wiringpi.pwmSetClock(clock);
            wiringpi.pwmSetRange(range);
            Servo.wiringPi_initialized = true;
        }
        console.log("[SRV:"+this.pinNumber+"] initialized.");
    }
    
    //サーボ角度
    get angle() : number { return this.servo_angle; }
    
    //サーボ角度を増減させる
    public addServoAngle(angle : number) : void {
        var newVal : number = this.servo_angle += angle;
        this.setServoAngle(newVal);
    }
    
    //サーボ角度を設定する
    public setServoAngle(angle : number) : void {
        var newVal = angle;
        if (newVal <   0) { newVal =   0; }
        if (newVal > 180) { newVal = 180; }
        this.servo_angle = newVal;

        const st =  35;
        const ed = 118;
        let step = Math.ceil(((ed - st) / 180) * (this.servo_angle + this.adjust_angle));
        var num : number = st + step;
        console.log("[SRV:"+this.pinNumber+"] STP:" + num);
        wiringpi.pwmWrite(this.pinNumber, num);
    }

}
