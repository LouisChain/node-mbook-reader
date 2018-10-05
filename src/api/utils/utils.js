const request = require("request");
const fs = require("fs");
const tokenPath = __dirname + "/const/refresh.cfg";

let get = (url, option) => {
  return new Promise((resolve, reject) => {
    request(url, option, (error, response, body) => {
      if (!error) {
        resolve(body);
      } else {
        reject(error);
      }
    })
  })
}

let getTokenList = () => {
  if (!fs.existsSync(tokenPath)) {
    fs.writeFileSync(tokenPath, "");
  }
  let content = fs.readFileSync(tokenPath, 'utf8');
  return content === "" ? {} : JSON.parse(content);
}

let setTokenList = (object) => {
  let content = JSON.stringify(object);
  let result = fs.writeFileSync(tokenPath, content, "utf8");
  return result;
}

module.exports = { get, getTokenList, setTokenList }