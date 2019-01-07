import * as https from "https";
import { Stream } from "stream";
import { outputFileSync } from "fs-extra";
import * as path from "path";

export function getSliderImage(url: string) {
  return new Promise(resolve => {
    https
      .request(url, res => {
        const data = new Stream.Transform();
        res.on("data", chunk => {
          data.push(chunk);
        });
        res.on("end", () => {
          resolve(data.read());
        });
      })
      .end();
  });
}

export async function downloadImage(url: string) {
  const data = await getSliderImage(url);
  outputFileSync(path.resolve(__dirname, `../test/code.jpeg`), data);
}
