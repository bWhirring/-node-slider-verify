import * as puppeteer from "puppeteer";
import * as fs from "fs";
import { createCanvas, Image } from "canvas";
import * as path from "path";
import { downloadImage } from "./util";

function timeout(delay = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(1);
      } catch (e) {
        reject(0);
      }
    }, delay);
  });
}

class SliderVerify {
  private width: number;
  private height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  async init() {
    const browser = await puppeteer.launch({
      headless: false
    });
    const page = (await browser.pages())[0];

    await page.goto(
      "http://www.sf-express.com/cn/sc/dynamic_function/waybill/#search/bill-number",
      {
        waitUntil: "networkidle0"
      }
    );

    await page.click(".clear-inputs");
    await page.type(".token-input", "764449660978", { delay: 10 });
    await page.click("#queryBill");

    await page.waitForSelector("#tcaptcha_popup");

    const frame = await page.mainFrame();
    const childFrame = (await frame.childFrames())[0];
    const dragButton = "#tcaptcha_drag_button";
    await childFrame.waitForSelector(dragButton);
    await childFrame.waitFor(1000);
    let url = await childFrame.evaluate(() => {
      return document.querySelector("#slideBkg").getAttribute("src");
    });
    url = `https://captcha.guard.qcloud.com${url}`;

    await downloadImage(url);
    let distance = (await this.getSliderDistance()) - 78;

    const e = await childFrame.$(dragButton);
    const box = await e.boundingBox();
    await page.waitFor(1000);
    let idx = 0; //  滑动次数
    const axleX = Math.floor(box.x + box.width / 2);
    const axleY = Math.floor(box.y + box.height / 2);

    var simulateSliderMove = async step => {
      await page.mouse.move(axleX, axleY);
      await page.mouse.down();
      await timeout(150);
      await page.mouse.move(step / 2, axleY, { steps: 20 });
      await timeout(200);
      await page.mouse.move(400, axleY, { steps: 20 });
      await timeout(100);
      await page.mouse.move(step, axleY, { steps: 20 });
      await page.waitFor(150);
      await page.mouse.up();
      await timeout(500);

      const text = await childFrame.evaluate(() => {
        let tcaptcha = <HTMLElement>document.querySelector(".tcaptcha-status");
        return tcaptcha.innerText;
      });

      if (text) {
        if (idx === 1) {
          idx = 0;
          await childFrame.click(".tcaptcha-action--refresh");
          console.log("-------------- 刷新验证码 -------------");
          await timeout(500);
          let url = await childFrame.evaluate(() => {
            return document.querySelector("#slideBkg").getAttribute("src");
          });
          url = `https://captcha.guard.qcloud.com${url}`;

          await downloadImage(url);
          distance = (await this.getSliderDistance()) - 78;
          await simulateSliderMove(distance);
        } else {
          idx += 1;
          await timeout();
          await simulateSliderMove(distance - 10);
        }
      }
    };
    await simulateSliderMove(distance);

    await page.on("response", async res => {
      const url = res.url();
      const status = res.status();
      if (
        url.includes(
          "http://www.sf-express.com/sf-service-owf-web/service/bills"
        ) &&
        status === 200
      ) {
        const data = await res.json();

        console.log(data);
      }
    });
  }

  getSliderDistance(): number {
    const { width, height } = this;
    const buf = fs.readFileSync(path.resolve(__dirname, "../test/code.jpeg"));
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = buf;
    ctx.drawImage(img, 0, 0, width, height);

    const img_data = ctx.getImageData(0, 0, width, height).data;
    const arr = [];
    const minHeight = Math.floor(height / 4);
    const maxHeight = minHeight * 3;
    const minWidth = Math.floor(width / 2);
    for (let i = minHeight; i < maxHeight; i++) {
      for (let j = width; j > minWidth; j--) {
        let p = width * i + j;
        p = p << 2;
        if (
          255 - img_data[p] < 10 &&
          255 - img_data[p - 1] < 10 &&
          255 - img_data[p + 1] < 10
        ) {
          arr.push(j);
          break;
        }
      }
    }
    return Math.max(...arr);
  }
}

const sliderVerify = new SliderVerify(680, 390);

sliderVerify.init();
