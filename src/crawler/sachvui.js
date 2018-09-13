const md5 = require("md5");
const downloader = require("download");
var request = require("async-request");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/MBookReader", {
  useNewUrlParser: true
});
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

const genJsDom = (html) => {
  /* parse the html and create a dom window */
  let jsdom = require('jsdom');
  let { JSDOM } = jsdom;
  let dom = new JSDOM(html, {
    // standard options:  disable loading other assets
    // or executing script tags
    FetchExternalResources: false,
    ProcessExternalResources: false,
    MutationEvents: false,
    QuerySelector: false
  });

  let window = dom.window
  let $ = require('jQuery')(window);

  return $;
}

const retrieveHtml = async (url) => {
  try {
    let response = await request(url);
    return response.body;
  } catch (error) {
    console.log(error);
  }
}

const retrieveCategory = async (url) => {
  let html = await retrieveHtml(url);
  let $ = await genJsDom(html);
  let array = $('ul[class="center-block row"] li');
  let promises = [];
  for (let i = 0; i < array.length; i++) {
    promises.push(saveCategory(array[i]));
  }
  await Promise.all(promises);
}

const saveCategory = async (category) => {
  let aTag = category.firstChild;
  let name = aTag.text;
  let Category = require("../api/models/category");
  await Category.find({ name })
    .exec()
    .then(res => {
      if (res.length >= 1) {
        console.log("Passed category >>> " + name);
      } else {
        let category = new Category({
          _id: new mongoose.Types.ObjectId(),
          name
        });
        category.save()
          .then(c => {
            console.log("Saved category: " + name);
          })
          .catch(err => {
            console.log("Save category error >>> " + name);
          })
      }
    })
    .catch(err => {
      console.log("Find Category failed: " + err);
    });
}

const listBook = async (url, page) => {
  console.log("------------------------------------------------");
  console.log("...Starting retrieve page: " + page + "=>" + url);
  console.log("------------------------------------------------");
  let html = await retrieveHtml(url);
  let $ = await genJsDom(html);
  let array = $('.col-md-9').find('.panel-body div');
  let aCounter = 0;
  for (let i = 0; i < array.length; i++) {
    let node = array[i].children[0].nodeName;
    if (node === 'UL') {
      let flag = -1;
      let liNodes = array[i].children[0].children;
      for (let k = liNodes.length - 1; k >= 0; k--) {
        if (liNodes[k].className === 'active') {
          flag = k;
          break;
        }
      }
      if (flag === liNodes.length - 1) {
        console.log("Out of page, you crawl all of books");
        return;
      } else {
        let nextNode = liNodes[flag + 1].children[0];
        listBook(nextNode.href, nextNode.text);
      }
    } else if (node === 'A') {
      // Wait for seconds
      await sleep(2000);
      aCounter++;
      let bookDetail = array[i].children[0].href;
      let bookHtml = await retrieveHtml(bookDetail);
      let info = await retriveBook(bookHtml);

      let cover = await md5(info.cover) + ".jpg";
      let epub = '';
      let epubLink = '';
      let pdf = '';
      let pdfLink = '';
      let downloadLink = info.downloadLink;
      for (let j = 0; j < downloadLink.length; j++) {
        if (downloadLink[j].indexOf("epub") > 0) {
          epub = await md5(downloadLink[j]) + ".epub";
          epubLink = downloadLink[j];
          break;
        }
        if (j === downloadLink.length - 1 && epub === '') {
          pdf = await md5(downloadLink[j]) + ".pdf";
          pdfLink = downloadLink[j];
        }
      }
      let format = (epub === '') ? 'pdf' : 'epub';
      await savebook(cover, info.title, info.author, info.catg, info.description, epub, pdf, format);

      let path = __dirname.replace("crawler", "");
      let fs = require("fs");
      await downloader(info.cover).pipe(fs.createWriteStream(path + "cover/" + cover));
      if (epub !== '') {
        await downloader(epubLink).pipe(fs.createWriteStream(path + "file/" + epub));
      }
      if (pdf !== '') {
        await downloader(pdfLink).pipe(fs.createWriteStream(path + "file/" + pdf));
      }

      console.log("Page-" + page + "=>" + aCounter + '. Retrieved Book >>> \n\tCover: '
        + info.cover + "\n\tTitle: "
        + info.title + "\n\tAuthor: "
        + info.author + "\n\tCategory: "
        + info.catg + "\n\tLink Download: "
        + info.downloadLink + "\n\tDescription: ");
      // + info.description);
    } else if (node === undefined) {
      console.log("We do nothing at index " + i);
    }
  }
}

const retriveBook = async (html) => {
  let $ = genJsDom(html);
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
              if (link.indexOf('epub') > -1 || link.indexOf('pdf') > -1) {
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

  // console.log('Book Infor >>> \nCover: ' + cover + "\nTitle: " + title + "\nAuthor: " + author
  //   + "\nCategory: " + catg + "\nLink Download: " + downloadLink + "\nDescription: " + description);

  return { cover, title, author, catg, description, downloadLink };
}

const savebook = async (cover, title, author, catg, description, epub, pdf, format) => {
  let Category = require("../api/models/category");
  await Category.find({ name: catg })
    .exec()
    .then(result => {
      if (result.length >= 1) {
        let Book = require("../api/models/book");
        let book = new Book({
          _id: new mongoose.Types.ObjectId(),
          cover,
          title,
          author,
          description,
          category: result[0]._id,
          epub,
          pdf,
          format
        });
        book.save();
      }
    })
    .catch(err => {
      console.log("Save book error: " + err);
    });
}

let endOfCrawl = async () => {
  console.log("End of crawler!");
}

let sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const crawlJob = async () => {
  try {
    await retrieveCategory("http://sachvui.com");
    await listBook("http://sachvui.com/the-loai/tat-ca.html/1", 1)
    endOfCrawl();
  } catch (error) {
    console.log(error);
  }
}

crawlJob();
