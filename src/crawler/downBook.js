const base = require("./base");
const fs = require("fs");
const baseUrl = "http://sachnoionline.net";
const axios = require("axios");

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
  let url = baseUrl + "/book/data?id=" + id;
  let chapters = "$(document).ready(function() {\n" +
    "                        new jPlayerPlaylist({\n" +
    "                            jPlayer: \"#jquery_jplayer_2\",\n" +
    "                            cssSelectorAncestor: \"#jp_container_2\"\n" +
    "                        }, [\n" +
    "                        {\n" +
    "                            title: \"01. Phần 00\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew00.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"02. Phần 01\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew01.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"03. Phần 02\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew02.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"04. Phần 03\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew03.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"05. Phần 04\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew04.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"06. Phần 05\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew05.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"07. Phần 060708\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew060708.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"08. Phần 09\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew09.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"09. Phần 1011\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew1011.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"10. Phần 121314\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew121314.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"11. Phần 15161718192021\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew15161718192021.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"12. Phần 22232425\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew22232425.mp3\"\n" +
    "                        },\n" +
    "                        {\n" +
    "                            title: \"13. Phần 2627282930\",\n" +
    "                            mp3: \"http://sno.sachnoionline.net/media/snoo/file/kham_pha_cuoc_song/dac_nhan_tam/DacNhanTamNewNew2627282930.mp3\"\n" +
    "                        }], {\n" +
    "                            playlistOptions: {\n" +
    "                              autoPlay: true                              \n" +
    "                            },\n" +
    "                            swfPath: \"/themes/classic/player/js\",\n" +
    "                            supplied: \"mp3\",\n" +
    "                            wmode: \"window\",\n" +
    "                            smoothPlayBar: true,\n" +
    "                            keyEnabled: true\n" +
    "                        });\n" +
    "                    });"
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

downJob("Dac Nhan Tam", 107);
// down("aaa", "https://drive.google.com/uc?id=1h6X1z5xrhnwHv74KTjpUnqCK1e1Kf63V", "xxx.mp3")