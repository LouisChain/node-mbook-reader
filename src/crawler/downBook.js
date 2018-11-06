const download = require("download");
const base = require("./base");
const fs = require("fs");
const baseUrl = "http://sachnoionline.net";

const down = async (folderName, url, fileName) => {
  let path = "/Users/louis/Downloads/" + folderName;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  await base
    .downloadFile(url, path + "/" + fileName)
    .then(() => {
      //console.log("download success: " + url);
    })
    .catch(err => {
      //console.log("error download file: " + url + " " + err);
    });
};

const parseJson = str => {
  let json = [];
  while (str.length > 1) {
    let i = str.indexOf("{");
    let k = str.indexOf("},");
    let subs = str.substring(i, k);
    let title = subs
      .substring(subs.indexOf(":") + 1, subs.indexOf('",\n') + 1)
      .trim();
    title = title.substring(1, title.length - 1);
    let media = subs.substring(subs.lastIndexOf("mp3:") + 5).trim();
    media = media.substring(1, media.length - 1);
    json.push({ title, media });
    str = str.substring(k + 3);
  }
  return json;
};

const downJob = async (folderName, id) => {
  let chapters = await base.retrieveHtml2(baseUrl + "/book/data?id=" + id);
  let str = chapters.substring(
    chapters.indexOf("["),
    chapters.indexOf("}],") + 2
  );
  let pure = str.replace("}]", "},]");
  let json = parseJson(pure);
  for (let i = 0; i < json.length; i++) {
    await down(
      folderName,
      json[i].media,
      json[i].media.substring(json[i].media.lastIndexOf("/") + 1)
    );
  }
  process.exit();
};

downJob("Richest man in Babylon", 2583);
// down("aaa", "https://drive.google.com/uc?id=1h6X1z5xrhnwHv74KTjpUnqCK1e1Kf63V", "xxx.mp3")