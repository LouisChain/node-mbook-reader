const md5 = require("md5");
const downloader = require("download");
var request = require("request");
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

const retrieveHtml = (option) => {
  return new Promise((resolve, reject) => {
    request(option, (error, response, html) => {
      if (error) {
        console.log(error);
        return reject(error + "");
      } else {
        return resolve(html);
      }
    });
  });
}

const retrieveCategory = (option) => {
  return new Promise((resolve, reject) => {
    (async () => {
      let html = await retrieveHtml(option);
      let $ = genJsDom(html);
      let array = $('ul[class="center-block row"] li');
      for (i = 0; i < array.length; i++) {
        await singleCategory(array[i]);
      }
      return resolve("Retrieve category succeded!");
    })();
  });
}

const singleCategory = (category) => {
  return new Promise((resolve, reject) => {
    let aTag = category.firstChild;
    let name = aTag.text;
    let Category = require("../api/models/category");
    Category.find({ name })
      .exec()
      .then(res => {
        if (res.length >= 1) {
          console.log("Passed category >>> " + name);
          return resolve("Passed category");
        } else {
          let category = new Category({
            _id: new mongoose.Types.ObjectId(),
            name
          });
          category.save()
            .then(c => {
              console.log("Saved category: " + name);
              return resolve("Saved category");
            })
            .catch(err => {
              console.log("Save category error >>> " + name);
            })
        }
      })
      .catch(err => {
        console.log("Find Category failed: " + err);
        return reject(err);
      });
  });
}

const listBook = (option) => {
  new Promise((resolve, reject) => {
    (async () => {
      console.log("...Starting retrieve page: " + option.uri);
      let html = await retrieveHtml(option);
      let $ = genJsDom(html);
      let array = $('.col-md-9').find('.panel-body div');
      let aCounter = 0;
      for (i = 0; i < array.length; i++) {
        let node = array[i].children[0].nodeName;
        if (node === 'UL') {
          console.log("Retrieving new page at index " + i);
          let flag = -1;
          for (k = node.children.length - 1; k >= 0; k--) {
            if (node.children[k].className === 'active') {
              flag = k;
              break;
            }
          }
          if (flag === node.children.length - 1) {
            console.log("Out of page, you crawl all of books");
            break;
          } else {
            return listBook({ uri: node.children[flag + 1].children[0].href })
          }
        } else if (node === 'A') {
          let bookLink = array[i].children[0].href;
          let bookOption = {
            uri: bookLink
          }
          let bookHtml = await retrieveHtml(bookOption);
          let info = await singleBook(bookHtml);

          let cover = md5(info.cover) + ".jpg";
          let epub = '';
          let epubLink = '';
          let pdf = '';
          let pdfLink = '';
          let downloadLink = info.downloadLink;
          for (j = 0; j < downloadLink.length; j++) {
            if (downloadLink[j].indexOf("epub") > 0) {
              epub = md5(downloadLink[j]) + ".epub";
              epubLink = downloadLink[j];
              break;
            }
            if (j === downloadLink.length - 1 && epub === '') {
              pdf = md5(downloadLink[j]) + ".pdf";
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

          console.log(aCounter + '. Retrieved Book >>> \n\tCover: '
            + info.cover + "\n\tTitle: "
            + info.title + "\n\tAuthor: "
            + info.author + "\n\tCategory: "
            + info.catg + "\n\tLink Download: "
            + info.downloadLink + "\n\tDescription: "
            + info.description);

          aCounter++;
        } else if (node === undefined) {
          console.log("We do nothing at index " + i);
        }
      }
      return resolve("Retrieve category succeded!");
    })();
  })
}

const singleBook = (html) => {
  return new Promise((resolve, reject) => {
    let $ = genJsDom(html);

    let container = $('.panel-body')[0]
    let cover = '';
    let title = '';
    let author = '';
    let catg = '';
    let downloadLink = [];
    let description = '';
    for (i = 0; i < container.children.length; i++) {
      let child1 = container.children[i];
      // The infor
      if (child1.className === 'row thong_tin_ebook') {
        for (j = 0; j < child1.children.length; j++) {
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

    return resolve({ cover, title, author, catg, description, downloadLink });
  });

}

const savebook = (cover, title, author, catg, description, epub, pdf, format) => {
  return new Promise((resolve, reject) => {
    let Category = require("../api/models/category");
    Category.find({ name: catg })
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
          book.save()
            .then(res => {
              return resolve("Save book >>> Saved new book");
            })
            .catch(err => {
              return reject("Save book error " + err);
            })
        } else {
          console.log("Save book >>> Cannot find category: " + catg);
          return reject("Save book >>> Cannot find category: " + catg);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
}

let testLog = () => {
  return new Promise((resolve, reject) => {
    return resolve("Log test!");
  });
}

const crawlJob = async () => {
  try {
    let option = {
      uri: "http://sachvui.com"
    }
    let category = await retrieveCategory(option);
    // let listBook = await listBook()
    let log = await testLog();
    return Promise.resolve(category + log);
  } catch (error) {
    Promise.reject(error);
  }
}

// crawlJob()
//   .then(res => console.log("Crawler: ", res))
//   .catch(err => console.log(err + ""))

retrieveCategory({
  uri: "http://sachvui.com"
})
  .then(res => listBook({ uri: "http://sachvui.com/the-loai/tat-ca.html/1" }))
  .then(res => console.log(res));
