
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

// const listBook = (option) => {
//   request(option, (error, response, html) => {
//     if (error) {
//       console.log(error);
//       reject(error + "");
//     } else {
//       let $ = genJsDom(html);
//       (async () => {
//         let array = $('ul[class="center-block row"] li');
//         for (i = 0; i < array.length; i++) {
//           await singleCategory(array[i]);
//         }
//         return resolve("Retrieve category succeded!");
//       })();
//     }
//   });
// }

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
  .then(res => testLog())
  .then(res => console.log(res))
