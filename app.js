const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
// const { Board, Servo, Motors } = require("johnny-five");
// let servo;
// let motors;
let currentCoords;
let id = undefined;
const invertPWM = true;

const port = process.env.PORT || 8081;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!

// const board = new Board({
//   repl: false,
// });

// board.on("ready", function () {
//   servo = new Servo(7);
//   // led.strobe(1000); // on off every second
//   servo.to(90);

//   motors = new Motors([
//     { pins: { dir: 5, pwm: 6 }, invertPWM },
//     { pins: { dir: 12, pwm: 11 }, invertPWM },
//   ]);
//   console.log("ready");
// });

io.on("connection", function (socket) {
  socket.on("stop", (data) => {
    console.log("stop");
    io.sockets.emit("stop", data);
  });

  socket.on("coords", (data) => {
    console.log("coords");
    // io.sockets.emit("coordsServer", data)
    // io.sockets.emit("coords", data);
    currentCoords = data;
  });

  socket.on("getCoords", (fn) => {
    if (currentCoords) {
      fn(currentCoords);
    } else {
      fn("geen current coords");
    }
  });

  socket.on("cameraControls", (data) => {
    console.log("camera controls server");
    console.log(data);
    // if(id === socket.id) {
    io.sockets.emit("cameraControls", data);
    // }
  });

  socket.on("isControllerConnected", (fn) => {
    if (id) {
      fn(true);
    } else {
      fn(false);
    }
  })

  socket.on("controllerConnected", () => {
    // console.log("connected");
    if (id === undefined || id === socket.id) {
      id = socket.id;
      console.log(`new user: ${id}`);
      socket.emit("connected", true);
    } else {
      console.log("user already connected");
      socket.emit("connected", false);
    }
    // console.log(socket.id)

    console.log("controller connected");
    io.sockets.emit("controllerStatus", true)
  });

  socket.on("carControls", (data) => {
    // if (id === socket.id) {
      console.log("car controls server");
      console.log(`original user: ${id}`);
      console.log(`sending user: ${socket.id}`);
      console.log(data);
    // }

    // if(id === socket.id ) {
    io.sockets.emit("carControls", data);
    // }

    //   if (data.x > 25) {
    //     servo.to(102);
    //   } else if (data.x < -25) {
    //     servo.to(78);
    //   } else {
    //     const scaledX = scale(data.x, -25, 25, 78, 102);
    //     console.log(scaledX);
    //     servo.to(scaledX);
    //   }

    //   if (data.y < 0) {
    //     if (data.x < -25) {
    //       motors.forward(255);
    //     } else {
    //       // console.log(`value: ${data.y}`);
    //       const scaledY = scale(data.y, -25, 0, 255, 0);
    //       motors.forward(scaledY);
    //       // console.log(scaledY);
    //     }
    //   }

    //   if (data.y > 0) {
    //     if (data.x > 25) {
    //       motors.reverse(255);
    //     } else {
    //       // console.log(`value: ${data.y}`);
    //       const scaledY = scale(data.y, 0, 25, 0, 255);
    //       motors.reverse(scaledY);
    //       // console.log(scaledY);
    //     }
    //     // console.log(`value: ${data.y}`);
    //     const scaledY = scale(data.y, 0, 50, 0, 255);
    //     motors.reverse(scaledY);
    //     // console.log(scaledY);
    //   }
  });

  socket.on("disconnect", () => {
    if (id === socket.id) {
      // id = undefined;
      console.log(`disconnected controller: ${socket.id}`)
      io.sockets.emit("controllerStatus", false)
    }
  });

  socket.on("blurred", () => {
    console.log("blurred")
    // if (id === socket.id) {
    // console.log("blurred maar dan in de if")
    //   id = undefined;
    //   console.log(`disconnected controller: ${socket.id}`)
    //   io.sockets.emit("controllerStatus", false)
    // }
})
});



// const scale = (num, in_min, in_max, out_min, out_max) => {
//   return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
// };

server.listen(port, () => console.log(`Listening on port ${port}`));
