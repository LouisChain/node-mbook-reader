
const downloader = require("download");
const fs = require("fs");


downloader('http://sachvui.com/cover/2017/pr-la-song.jpg').pipe(fs.createWriteStream('foo.jpg'));


// return new Promise((resolve, reject) => {
  try {
    let option = {
      uri: bookLink
    }
    let html = await retrieveHtml(option);
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
  
    return Promise.resolve({ cover, title, author, catg, description, downloadLink });
    // });
  } catch (error) {
    return Promise.reject(error);
  }