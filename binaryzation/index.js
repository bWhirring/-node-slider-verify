const acedia = require("acedia");
const path = require("path");
const { createCanvas, Image } = require("canvas");

const width = 320,
  height = 180;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = path.resolve(__dirname, "./1.png");
ctx.drawImage(img, 0, 0, width, height);

const imgData = ctx.getImageData(0, 0, width, height);
const { data } = imgData;
const index = 255 / 2;
for (var i = 0; i < data.length; i += 4) {
  var R = data[i];
  var G = data[i + 1];
  var B = data[i + 2];
  var Alpha = data[i + 3];
  var sum = (R + G + B) / 3;
  if (sum > index) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = Alpha;
  } else {
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = Alpha;
  }
}
ctx.putImageData(imgData, 0, 0);

acedia(canvas.toDataURL(), path.resolve(__dirname, "./gray.png"));
