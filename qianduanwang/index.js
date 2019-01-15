const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const pixels = require("image-pixels");
const resemble = require("resemblejs");
const acedia = require("acedia");

let page = null;
const bgImg = path.resolve(__dirname, "bg.png");
const fullbgImg = path.resolve(__dirname, "fullbg.png");
const diffImg = path.resolve(__dirname, `diff.png`);

async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });
  page = (await browser.pages())[0];

  await page.goto("https://www.qdfuns.com/");
  await page.waitForSelector(".hand");

  await page.click("a[data-type=login]");
  const geetest_btn = ".geetest_btn";
  await page.waitForSelector(geetest_btn);

  await page.click(geetest_btn);
  await page.waitFor(1000);

  async function getDistance() {
    let { bg, fullbg } = await page.evaluate(() => {
      const fullbg = document.querySelector(".geetest_canvas_fullbg");
      const bg = document.querySelector(".geetest_canvas_bg");
      return {
        bg: bg.toDataURL(),
        fullbg: fullbg.toDataURL()
      };
    });
    acedia(bg, bgImg);
    acedia(fullbg, fullbgImg);

    resemble(bgImg)
      .compareTo(fullbgImg)
      .ignoreColors()
      .onComplete(async function(data) {
        fs.writeFileSync(diffImg, data.getBuffer());
      });

    var { data } = await pixels(diffImg, {
      cache: false
    });
    let arr = [];
    for (let i = 10; i < 150; i++) {
      for (let j = 80; j < 220; j++) {
        var p = 260 * i + j;
        p = p << 2;
        if (data[p] === 255 && data[p + 1] === 0 && data[p + 2] === 255) {
          arr.push(j);
          break;
        }
      }
    }
    return Math.min(...arr);
  }

  const distance = await getDistance();
  const button = await page.$(".geetest_slider_button");
  const box = await button.boundingBox();
  const axleX = Math.floor(box.x + box.width / 2);
  const axleY = Math.floor(box.y + box.height / 2);

  await btnSlider(distance);
  async function btnSlider(distance) {
    await page.mouse.move(axleX, axleY);
    await page.mouse.down();
    await page.waitFor(200);
    await page.mouse.move(box.x + distance / 4, axleY, { steps: 20 });
    await page.waitFor(200);
    await page.mouse.move(box.x + distance / 3, axleY, { steps: 18 });
    await page.waitFor(210);
    await page.mouse.move(box.x + distance / 2, axleY, { steps: 15 });
    await page.waitFor(230);
    await page.mouse.move(box.x + (distance / 3) * 2, axleY, { steps: 15 });
    await page.waitFor(350);
    await page.mouse.move(box.x + (distance / 4) * 3, axleY, { steps: 10 });
    await page.waitFor(350);
    await page.mouse.move(box.x + distance + 50, axleY, { steps: 10 });
    await page.waitFor(300);
    await page.mouse.move(box.x + distance + 30, axleY, { steps: 10 });
    await page.waitFor(300);
    await page.mouse.up();
    await page.waitFor(1000);

    const text = await page.evaluate(() => {
      return document.querySelector(".geetest_result_box").innerText;
    });
    console.log(text);
    let step = 0;
    if (text) {
      if (
        text.includes("怪物吃了拼图") ||
        text.includes("拖动滑块将悬浮图像正确拼合")
      ) {
        await page.waitFor(2000);
        await page.click(".geetest_refresh_1");
        await page.waitFor(1000);
        step = await getDistance();
        await btnSlider(step);
      } else if (text.includes("速度超过")) {
        console.log("success");
      }
    }
  }
}

run();
