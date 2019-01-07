const fse = require("fs-extra"),
  path = require("path");

const https = require("https"),
  Stream = require("stream").Transform;

export const filename = path.resolve(__dirname, `../../test/sms/test.jpeg`);
export class VerifyCode {
  downCode(url: string) {
    return new Promise(resolve => {
      https
        .request(url, response => {
          var data = new Stream();
          response.on("data", chunk => {
            data.push(chunk);
          });

          response.on("end", () => {
            resolve(data.read());
          });
        })
        .end();
    });
  }
  async getCode(url: string) {
    const data = await this.downCode(url);
    fse.outputFileSync(filename, data);
  }
}
