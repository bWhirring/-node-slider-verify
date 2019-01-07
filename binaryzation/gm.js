var gm = require("gm"),
  path = require("path");

// resize and remove EXIF profile data
console.log(path.resolve(__dirname, "1.png"));
gm(path.resolve(__dirname, "1.png"))
  // .blur(1)
  // .noise("gaussian")
  // .negative()
  .monochrome()
  .write(path.resolve(__dirname, "./13.png"), function(err) {
    console.log(err);
    if (!err) console.log("done");
  });
