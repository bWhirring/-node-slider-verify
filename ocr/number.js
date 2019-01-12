const gm = require("gm");
const path = require("path");
const tesseract = require("node-tesseract");

const number = path.resolve(__dirname, "./number.png");
const numbered = path.resolve(__dirname, "./numbered.png");

function dealImage(callback) {
  return new Promise(resolve => {
    gm(number)
      .monochrome()
      .write(numbered, err => {
        if (err) return;
        resolve(callback);
      });
  });
}

function ocr() {
  tesseract.process(numbered, (err, text) => {
    console.log(err, text);
  });
}

dealImage(ocr());
