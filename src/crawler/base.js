const request = require("request");
const fs = require("fs");
const axios = require("axios");
const mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost:27017/MBookReader", {
//   useNewUrlParser: true
// });
// var htmlparser = require("htmlparser");
// request({
//   uri: "http://sachvui.com",
// }, (error, response, body) => {
//   var handler = new htmlparser.DefaultHandler(function (error, dom) {
//     if (error) {
//       console.log(error);
//     }
//     else {
//       console.log(dom);
//     }
//   });
//   var parser = new htmlparser.Parser(handler);
//   parser.parseComplete(body);
// });

let genJsDom = async html => {
  /* parse the html and create a dom window */
  const jsdom = require("jsdom");
  const { JSDOM } = jsdom;
  let dom = await new JSDOM(html, {
    // standard options:  disable loading other assets
    // or executing script tags
    FetchExternalResources: false,
    ProcessExternalResources: false,
    MutationEvents: false,
    QuerySelector: false
  });

  let window = dom.window;
  let $ = require("jquery")(window);

  return $;
};

let retrieveHtml = url => {
  // try {
  //   let response = await request(url);
  //   return response.body;
  // } catch (error) {
  //   console.log(error);
  // }

  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (!error) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
};

let retrieveHtml2 = url => {
  return new Promise((resolve, reject) => {
    request(
      url,
      { headers: { "User-Agent": "Promise", accept: "text/html" } },
      (error, response, body) => {
        if (!error) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

let sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

let log = (path, message) => {
  fs.appendFileSync(path, message);
};

let downloadFile = async (url, dest) => {
  console.log(url)
  // axios image download with response type "stream"
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
    headers: {
      Referer: "http://sachnoionline.net"
    }
  });

  // pipe the result stream into a file on disc
  response.data.pipe(fs.createWriteStream(dest));

  // return a promise and resolve when download finishes
  return new Promise((resolve, reject) => {
    response.data.on("end", () => {
      resolve();
    });

    response.data.on("error", () => {
      reject();
    });
  });
};

module.exports = {
  genJsDom,
  retrieveHtml,
  retrieveHtml2,
  sleep,
  log,
  downloadFile
};
