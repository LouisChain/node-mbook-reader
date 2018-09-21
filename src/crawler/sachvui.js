const md5 = require("md5");
const download = require("download");
const mongoose = require("mongoose");
const base = require("./base");
const fs = require("fs");
const logFile = __dirname + "/sachvui.txt";

let retrieveCategory = async (url) => {
  let html = await base.retrieveHtml(url);
  let $ = await base.genJsDom(html);
  let array = $('ul[class="center-block row"] li');
  let promises = [];
  for (let i = 0; i < array.length; i++) {
    promises.push(saveCategory(array[i]));
  }
  await Promise.all(promises);
}

let saveCategory = async (category) => {
  let aTag = category.firstChild;
  let name = aTag.text;
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

let listBook = async (url, page) => {
  console.log("------------------------------------------------------------------------------------------------");
  console.log("---- Starting retrieve page " + page + "=>" + url);
  console.log("------------------------------------------------------------------------------------------------");
  base.log(logFile, "\n------------------------------------------------------------------------------------------------"
    + "\n---- Starting retrieve page " + page + "=>" + url
    + "\n------------------------------------------------------------------------------------------------");
  let html = await base.retrieveHtml(url);
  let $ = await base.genJsDom(html);
  let array = $('.col-md-9').find('.panel-body div');
  let aCounter = 0;
  for (let i = 0; i < array.length; i++) {
    let node = array[i].children[0].nodeName;
    if (node === 'A') {
      aCounter++;
      let bookDetail = array[i].children[0].href;
      let bookHtml = await base.retrieveHtml(bookDetail);
      let info = await retriveBook(bookHtml);
      if (!info || info.downloadLink.length === 0) {
        continue;
      }
      let cover = md5(info.cover) + ".jpg";
      let format = 'epub';
      let ebookFileName = '';
      let ebookLink = '';
      let downloadLinks = info.downloadLink;
      for (let j = 0; j < downloadLinks.length; j++) {
        if (downloadLinks[j].indexOf("epub") > 0) {
          ebookFileName = await md5(downloadLinks[j]) + ".epub";
          ebookLink = downloadLinks[j];
          format = 'epub';
          break;
        }
        if (j === downloadLinks.length - 1 && ebookFileName === '') {
          ebookFileName = await md5(downloadLinks[j]) + ".pdf";
          ebookLink = downloadLinks[j];
          format = 'pdf';
        }
      }

      await saveBook(cover, info.cover, ebookLink, info.title, info.author, info.catg, info.description, format);

      /*
      let path = __dirname.replace("crawler", "");
      let coverPath = path + "cover/";
      let ebookPath = path + "ebook/";
      if (!fs.existsSync(coverPath)) {
        fs.mkdirSync(coverPath);
      }
      if (!fs.existsSync(ebookPath)) {
        fs.mkdirSync(ebookPath);
      }
      await downloadSync(info.cover, coverPath + cover);
      if (ebookLink !== '') {
        await downloadSync(ebookLink, ebookPath + ebookFileName);
      }
      */

      console.log("Page" + page + "=>" + aCounter + ' book retrieved info:  \n\tCover: '
        + info.cover + "\n\tTitle: "
        + info.title + "\n\tAuthor: "
        + info.author + "\n\tCategory: "
        + info.catg + "\n\tLink Download: " + ebookLink);
      base.log(logFile, "\nPage" + page + "=>" + aCounter + ' book retrieved info:  \n\tCover: '
        + info.cover + "\n\tTitle: "
        + info.title + "\n\tAuthor: "
        + info.author + "\n\tCategory: "
        + info.catg + "\n\tLink Download: " + ebookLink);
    }
  }
}

let downloadSync = async (link, dest) => {
  try {
    await download(link).then(data => {
      let a = fs.writeFileSync(dest, data);
    });
  } catch (err) {
    console.log(">>> Cannot download file: " + link)
    base.log(logFile, "\n>>> Cannot download file: " + link)
  }
}

let retriveBook = async (html) => {
  let $ = await base.genJsDom(html);
  let container = $('.panel-body')[0]
  let cover = '';
  let title = '';
  let author = '';
  let catg = '';
  let downloadLink = [];
  let description = '';
  for (let i = 0; i < container.children.length; i++) {
    let child1 = container.children[i];
    // The infor
    if (child1.className === 'row thong_tin_ebook') {
      for (let j = 0; j < child1.children.length; j++) {
        let bookInfo = child1.children[j];
        if (bookInfo.className === 'col-md-4 cover') {
          // Cover
          cover = bookInfo.children[0].src;
        } else if (bookInfo.className === 'col-md-8') {
          // Title
          title = bookInfo.children[0].text;
          // Author
          author = bookInfo.children[2].textContent;
          author = author.slice(author.indexOf(":") + 2);
          // Category
          catg = bookInfo.children[3].firstElementChild.text;
          // Get the link epub or pdf
          for (k = bookInfo.children.length - 1; k >= 0; k--) {
            let aNode = bookInfo.children[k];
            if (aNode.nodeName === 'A') {
              let link = aNode.href.toString();
              if (link.indexOf('/epub/') > -1 || link.indexOf('/pdf/') > -1) {
                downloadLink.push(aNode.href);
              }
            }
          }
        }
      }
      // The description
    } else if (child1.className === 'gioi_thieu_sach text-justify') {
      description = child1.textContent;
    }
  }
  return { cover, title, author, catg, description, downloadLink };
}

let saveBook = async (cover, coverLink, ebookLink, title, author, catg, description, format) => {
  let Category = require("../api/models/category");
  let Book = require("../api/models/book");
  await Category.find({ name: catg })
    .exec()
    .then(result => {
      if (result.length >= 1) {
        Book.find({ title })
          .exec()
          .then(_book => {
            if (_book.length <= 0) {
              let book = new Book({
                _id: new mongoose.Types.ObjectId(),
                cover,
                coverLink,
                ebookLink,
                title,
                author,
                description,
                category: result[0]._id,
                format
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

let crawlJob = async () => {
  try {
    if (fs.existsSync(logFile)) {
      await fs.unlink(logFile);
    }
    await retrieveCategory("http://sachvui.com");
    for (let i = 1; i <= 147; i++) {
      await listBook("http://sachvui.com/the-loai/tat-ca.html/" + i, i);
    }
  } catch (error) {
    console.log(error);
  }
}

crawlJob();
