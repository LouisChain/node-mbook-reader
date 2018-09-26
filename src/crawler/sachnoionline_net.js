const md5 = require("md5");
const download = require("download");
const mongoose = require("mongoose");
const base = require("./base");
const fs = require("fs");
const logFile = __dirname + "/sachnoionline.net.txt";
const baseUrl = "http://sachnoionline.net";

let retrieveCategory = async (url) => {
  let html = await base.retrieveHtml2(url);
  let $ = await base.genJsDom(html);
  let array = $('#sidebar li');
  let promises = [];
  for (let i = 0; i < array.length; i++) {
    promises.push(saveCategory(array[i]));
  }
  await Promise.all(promises);
}

let saveCategory = async (category) => {
  let name = category.textContent;
  name = name.substring(0, name.indexOf("("));
  let Category = require("../api/models/category");
  await Category.find({ name })
    .exec()
    .then(res => {
      if (res.length > 0) {
        console.log("Duplicated category >>> " + name);
        base.log(logFile, "\nDuplicated category >>> " + name);
      } else {
        let category = new Category({
          _id: new mongoose.Types.ObjectId(),
          name
        });
        category.save()
          .then(c => {
            console.log("Saved category >>> " + name);
            base.log(logFile, "\nSaved category >>> " + name);
          })
          .catch(err => {
            console.log("Save category error >>> " + name);
            base.log(logFile, "\nSave category error >>> " + name);
          })
      }
    })
    .catch(err => {
      console.log("Find Category failed >>> " + err);
      base.log(logFile, "\nFind Category failed >>> " + err);
    });
}

let listBook = async (url, pageIndex, retrivedCount) => {
  console.log("------------------------------------------------------------------------------------------------");
  console.log("---- Starting retrieve page " + pageIndex + "=>" + url);
  console.log("------------------------------------------------------------------------------------------------");
  base.log(logFile, "\n------------------------------------------------------------------------------------------------"
    + "\n---- Starting retrieve page " + pageIndex + "=>" + url
    + "\n------------------------------------------------------------------------------------------------");
  let html = await base.retrieveHtml2(url);
  let $ = await base.genJsDom(html);
  let array = $('#container #content #hotBooks').children()[1];
  if (array && array.children.length === 0) {
    return -1;
  }
  let aCounter = 0;
  for (let i = 0; i < array.children.length; i++) {
    let node = array.children[i];
    aCounter++;
    let id = node.getAttribute('rel');
    id = id.substring(id.lastIndexOf('/') + 1);
    let detailUrl = node.children[1].href;
    detailUrl = baseUrl + detailUrl;
    let detailHtml = await base.retrieveHtml2(detailUrl);
    let $ = await base.genJsDom(detailHtml);
    let detailContainer = $("#container #content #detail");

    let _chapters = await base.retrieveHtml2("http://sachnoionline.net/book/data?id=" + id);
    let exist = _chapters.indexOf("$(document).ready(function()");
    if (exist !== 0) {
      aCounter--;
      continue;
    }

    let info = await retriveBook(detailContainer, _chapters);
    let { cover, title, author, catg, description, chapters, tags, reader, format } = info;
    await saveBook(cover, title, author, catg, description, chapters, tags, reader, format);

    let total = retrivedCount + aCounter;
    console.log("Page" + pageIndex + "=>" + aCounter + ' book retrieved info:  \n\tCover: '
      + info.cover + "\n\tTitle: "
      + info.title + "\n\tAuthor: "
      + info.author + "\n\tCategory: "
      + info.catg + "\n\tChapters: " + info.chapters.length
      + "\nTOTAL: " + total);
    base.log(logFile, "\nPage" + pageIndex + "=>" + aCounter + ' book retrieved info:  \n\tCover: '
      + info.cover + "\n\tTitle: "
      + info.title + "\n\tAuthor: "
      + info.author + "\n\tCategory: "
      + info.catg + "\n\tChapters: " + info.chapters.length
      + "\nTOTAL: " + total);
  }
  return aCounter;
}

let retriveBook = async (html, chapters) => {
  let leftCover = html.children()[0];
  let cover = leftCover.children[0].children[0].src;
  cover = baseUrl + cover;

  let rightInfo = html.children()[1];
  let trs = rightInfo.children[0].rows;
  let title = trs[0] ? trs[0].textContent.trim() : "";
  let author = trs[2] ? trs[2].textContent.trim().replace("Tác giả:", "").trim() : "";
  let catg = trs[1] ? trs[1].textContent.trim().replace("Thể loại:", "").trim() : "";
  let reader = trs[3] ? trs[3].textContent.trim().replace("Người đọc:", "").trim() : "";
  let tags = trs[7] ? trs[7].textContent.trim().replace("Tags:", "").trim() : "";

  let description = html.children()[5].textContent.trim();
  let format = "audio";

  // Get chapters
  let str = chapters.substring(chapters.indexOf("["), chapters.indexOf("}],") + 2);
  str = str.replace("}]", "},]");
  chapters = parseJson(str);

  return { cover, title, author, catg, description, chapters, tags, reader, format };
}

let saveBook = async (cover, title, author, catg, description, chapters, tags, reader, format) => {
  let Category = require("../api/models/category");
  let Book = require("../api/models/book");
  await Category.find({ name: catg })
    .exec()
    .then(result => {
      if (result.length >= 1) {
        Book.find({ title, format })
          .exec()
          .then(_book => {
            if (_book.length <= 0) {
              let book = new Book({
                _id: new mongoose.Types.ObjectId(),
                cover,
                title,
                author,
                description,
                category: result[0]._id,
                format,
                tag: tags,
                reader,
                mbookLink: chapters
              });
              book.save();
            }
          });
      }
    })
    .catch(err => {
      console.log("Save book error: " + err);
    });
}

parseJson = (str) => {
  let json = []
  while (str.length > 1) {
    let i = str.indexOf("{");
    let k = str.indexOf("},");
    let subs = str.substring(i, k);
    let title = subs.substring(subs.indexOf(":") + 1, subs.indexOf("\",\n") + 1).trim();
    title = title.substring(1, title.length - 1);
    let media = subs.substring(subs.lastIndexOf("mp3:") + 5).trim();
    media = media.substring(1, media.length - 1);
    json.push({ title, media });
    str = str.substring(k + 3);
  }
  return json;
}

let crawlJob = async () => {
  try {
    if (fs.existsSync(logFile)) {
      await fs.unlink(logFile);
    }
    await retrieveCategory("http://sachnoionline.net/");
    let total = 0;
    for (let i = 1; i <= 200; i++) {
      if (total === -1) {
        break;
      }
      total = total + await listBook("http://sachnoionline.net/book/viewall/page/" + i, i, total);
    }
    console.log("\nCrawl sachnoionline.net was done!")
    base.log(logFile, "\nCrawl sachnoionline.net was done!");
    process.exit();
  } catch (error) {
    console.log(error);
  }
}

crawlJob();
