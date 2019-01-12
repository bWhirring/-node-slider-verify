const gm = require("gm");
const path = require("path");
const tesseract = require("node-tesseract");

const number = path.resolve(__dirname, "./index.jpeg");
const indexed = path.resolve(__dirname, "./indexed.jpeg");

function dealImage(callback) {
  return new Promise(resolve => {
    gm(number)
      .threshold(50, "%")
      .write(indexed, err => {
        if (err) return;
        resolve(callback);
      });
  });
}

function ocr() {
  tesseract.process(indexed, (err, text) => {
    console.log(err, text);
  });
}

dealImage(ocr());
