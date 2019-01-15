const puppeteer = require("puppeteer");
const path = require("path");
var inquirer = require("inquirer");
const acedia = require("acedia");
const test = require("./util");

let page = null;

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    timeout: 0
  });
  page = (await browser.pages())[0];

  await page.goto(
    "https://x.tongdun.cn/onlineExperience/textSelection?source=baidu&plan=%E5%8F%8D%E6%AC%BA%E8%AF%88&unit=%E6%99%BA%E8%83%BD%E9%AA%8C%E8%AF%81&keyword=%E6%99%BA%E8%83%BD%E9%AA%8C%E8%AF%81%E7%A0%81&e_creative=24659987438&e_adposition=cl1&e_keywordid=101045415224&e_keywordid2=101045415224&audience=236369",
    {
      waitUntil: "networkidle2"
    }
  );

  await page.waitForSelector("#loginBtn");

  await page.click("#loginBtn");
  const bg = ".td-bg-img";
  await page.waitForSelector(bg);

  await page.waitFor(1000);
  const bgElement = await page.$(bg);
  let { data } = await page.evaluate(() => {
    const bgImg = document.querySelector(".td-bg-img");
    return {
      data: bgImg.toDataURL()
    };
  });
  acedia(data, path.resolve(__dirname, "test.png"));

  const { x, y } = await bgElement.boundingBox();
  const { pos } = await inquirer.prompt({
    name: "pos",
    message: "请输入点坐标"
  });
  const { pic_str } = await test();
  const allPos = pic_str.split("|"); // '55,83|236,37|126,128'

  const inputNumArr = pos.split(",");
  let arr = [];
  inputNumArr.map(v => {
    arr.push(allPos[v]);
  });
  for (let i = 0; i < arr.length; i++) {
    console.log(x + Number(arr[i].split(",")[0]));
    console.log(y + Number(arr[i].split(",")[1]));
    await page.mouse.click(
      x + Number(arr[i].split(",")[0]),
      y + Number(arr[i].split(",")[1])
    );
    await page.waitFor(2000);
  }
}

run();
