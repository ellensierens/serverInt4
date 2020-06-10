const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const {Board, Servo, Motors} = require("johnny-five");
let servo;
let motors
const invertPWM = true;

const port = process.env.PORT || 8081;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!

const board = new Board({
  repl: false,
});

board.on("ready", function () {
  servo = new Servo(7);
  // led.strobe(1000); // on off every second

  motors = new Motors([
    { pins: { dir: 5, pwm: 6 }, invertPWM },
    { pins: { dir: 12, pwm: 11}, invertPWM }
  ]);

  servo.to(90);
  console.log('ready');
});

io.on("connection", function (socket) {
  console.log("connected")

  socket.on("stop", data => {
    motors.forward(data);
  })

  socket.on("carControls", data => {
    console.log(`value: ${data.x}`);
    const scaledX = scale(data.x, -50, 50, 78, 102);
    console.log(scaled);

    servo.to(scaledX);
    // console.log("right");

    if(data === "stop"){
      motors.forward(0);
    }

    if(data.y < 0) {
      // console.log(`value: ${data.y}`);
      const scaledY = scale(data.y, -50, 0, 255, 0);
      motors.forward(scaledY);
      // console.log(scaledY);
    }

    if(data.y > 0) {
      // console.log(`value: ${data.y}`);
      const scaledY = scale(data.y, 0, 50, 0, 255);
      motors.reverse(scaledY);
      // console.log(scaledY);
    }
  });
});

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

server.listen(port, () => console.log(`Listening on port ${port}`));