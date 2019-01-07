import * as puppeteer from "puppeteer";

(async () => {
  const broswer = await puppeteer.launch({
    headless: false
  });

  const page = (await broswer.pages())[0];

  await page.goto("https://dun.163.com/trial/sense", {
    waitUntil: "networkidle0"
  });

  await page.waitForSelector(".yidun_intelli-control");

  await page.click(".yidun_intelli-control");
})();
