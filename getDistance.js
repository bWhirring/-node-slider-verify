var pixels = require("image-pixels");

(async () => {
  let arr = [];
  var { data } = await pixels("./13.png");
  var idx = 0;
  for (let i = 122; i < 114 + 44; i++) {
    for (let j = 320; j > 150; j--) {
      var p = 320 * i + j;
      p = p << 2;
      if (
        data[p - 2] === 0 &&
        data[p] === 0 &&
        data[p + 1] === 0 &&
        data[p + 2] === 0
      ) {
        console.log(data[p - 2], data[p - 1], data[p + 3]);
        if (j === 255) {
          idx += 1;
        }
        arr.push(j);
      }
    }
  }

  console.log(idx);
  const test = getMoreNum(arr);
  console.log(test);
})();

function getMoreNum(arr) {
  var obj = {};
  var arr1 = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr1.indexOf(arr[i]) == -1) {
      obj[arr[i]] = 1;
      arr1.push(arr[i]);
    } else {
      obj[arr[i]]++;
    }
  }
  var max = 0;
  var maxStr;
  for (var i in obj) {
    if (max < obj[i]) {
      max = obj[i];
      maxStr = i;
    }
  }
  return { max, maxStr };
}
