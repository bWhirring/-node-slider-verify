import { VerifyCode, filename } from "./util";
import mosaic from "@dwd/mosaic";

const verifyCode = new VerifyCode();
(async () => {
  const codeKey = (Math.random() * (9999 - 1000) + 1000).toFixed();
  await verifyCode.getCode(
    `https://passport-partner.dmall.com/captcha/getCode?key=${codeKey}`
  );
  const code = await mosaic.captcha({
    filename
  });
  console.log(code);
})();
