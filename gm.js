var fs = require("fs"),
  gm = require("gm");

// resize and remove EXIF profile data
gm("./1.png")
  // .blur(1)
  // .noise("gaussian")
  // .negative()
  .monochrome()
  .write("./13.png", function(err) {
    if (!err) console.log("done");
  });
