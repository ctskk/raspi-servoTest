# raspi-servoTest
Servo test for SG-90

# gen ssl key
 
 ```
openssl genrsa -out server.key 2048
openssl req -batch -new -key server.key -out server.csr -subj "/C=JP/ST=Kanagawa/L=Yokohama/O=KonnoWorks/OU=Dev/CN=www.konnoworks.co.jp"
openssl x509 -in server.csr -out server.crt -req -signkey server.key -days 73000 -sha256
```
