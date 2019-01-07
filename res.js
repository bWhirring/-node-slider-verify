const resemble = require("resemblejs");
const fse = require("fs-extra");
var diff = resemble("./12.png")
  .compareTo("./1.png")
  .ignoreColors()
  .onComplete(function(data) {
    fse.writeFileSync("diff1.png", data.getBuffer());
  });
