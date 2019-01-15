const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const pixels = require("image-pixels");
const resemble = require("resemblejs");
const gm = require("gm");
const acedia = require("acedia");

let page = null;
const bgImg = path.resolve(__dirname, "bg.png");
const bgBlurImg = path.resolve(__dirname, "bgBlur.png");
const bgDiffImg = path.resolve(__dirname, "bgDiff.png");

async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });
  page = (await browser.pages())[0];

  await page.goto(
    "https://x.tongdun.cn/onlineExperience/slidingPuzzle?source=baidu&plan=%E5%8F%8D%E6%AC%BA%E8%AF%88&unit=%E6%99%BA%E8%83%BD%E9%AA%8C%E8%AF%81&keyword=%E6%99%BA%E8%83%BD%E9%AA%8C%E8%AF%81%E7%A0%81&e_creative=24659987438&e_adposition=cl1&e_keywordid=101045415224&e_keywordid2=101045415224&audience=236369"
  );
  await page.waitForSelector("#loginBtn");

  await page.click("#loginBtn");
  const slidetrigger = ".td-pop-slidetrigger";
  await page.waitForSelector(slidetrigger);

  await page.click(slidetrigger);
  await page.waitFor(1000);
  const slideIdentity = ".td-pop-slide-identity";
  await page.waitFor(slideIdentity);

  const top = await page.evaluate(() => {
    const identity = document.querySelector(".td-pop-slide-identity");
    return identity.offsetTop;
  });

  async function getDistance() {
    let { bg } = await page.evaluate(() => {
      const bg = document.querySelector(".td-bg-img");
      return {
        bg: bg.toDataURL()
      };
    });
    acedia(bg, bgImg);

    gm(bgImg)
      .blur(1)
      .write(bgBlurImg, function(err) {
        if (!err) console.log("done");
      });

    resemble(bgImg)
      .compareTo(bgBlurImg)
      .ignoreColors()
      .onComplete(async function(data) {
        fs.writeFileSync(bgDiffImg, data.getBuffer());
      });

    var { data } = await pixels(bgDiffImg, {
      cache: false
    });
    let arr = [];

    for (let i = top; i < top + 44; i++) {
      for (let j = 60; j < 320; j++) {
        var p = 320 * i + j;
        p = p << 2;
        if (data[p] === 255 && data[p + 1] === 0 && data[p + 2] === 255) {
          arr.push(j);
        }
      }
    }
    const { maxStr } = getMoreNum(arr);
    return Number(maxStr);
  }

  const distance = await getDistance();
  const button = await page.$(slidetrigger);
  const box = await button.boundingBox();
  const axleX = Math.floor(box.x + box.width / 2);
  const axleY = Math.floor(box.y + box.height / 2);
  console.log(distance, "distance");
  console.log(box.x + distance);

  await btnSlider(distance);
  async function btnSlider(distance) {
    await page.mouse.move(axleX, axleY);
    await page.mouse.down();
    await page.waitFor(200);
    await page.mouse.move(box.x + distance / 4, axleY, { steps: 20 });
    await page.waitFor(200);
    await page.mouse.move(box.x + distance / 3, axleY, { steps: 18 });
    await page.waitFor(350);
    await page.mouse.move(box.x + distance / 2, axleY, { steps: 15 });
    await page.waitFor(400);
    await page.mouse.move(box.x + (distance / 3) * 2, axleY, { steps: 15 });
    await page.waitFor(350);
    await page.mouse.move(box.x + (distance / 4) * 3, axleY, { steps: 10 });
    await page.waitFor(350);
    await page.mouse.move(box.x + distance + 20, axleY, { steps: 10 });
    await page.waitFor(300);
    await page.mouse.up();
    await page.waitFor(1000);

    const text = await page.evaluate(() => {
      return document.querySelector(".td-pop-slide-msg").innerText;
    });
    console.log(text);
    if (text.includes("验证失败")) {
      await page.waitFor(2000);
      const step = await getDistance();
      await btnSlider(step);
    }
  }
}

run();

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
