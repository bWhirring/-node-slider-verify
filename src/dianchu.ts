import * as puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = (await browser.pages())[0];

  await page.goto(
    "https://x.tongdun.cn/onlineExperience/captcha?source=baidu&plan=%E5%8F%8D%E6%AC%BA%E8%AF%88&unit=%E6%99%BA%E8%83%BD%E9%AA%8C%E8%AF%81&keyword=%E6%99%BA%E8%83%BD%E9%AA%8C%E8%AF%81%E7%A0%81&e_creative=24659987438&e_adposition=cl1&e_keywordid=101045415224&e_keywordid2=101045415224&audience=236369"
  );
  await page.waitForSelector(".trigger-mode");

  await page.click(".trigger-mode");
  await page.waitForSelector(".td-btn-content");
  await page.click(".td-btn-content");
})();
