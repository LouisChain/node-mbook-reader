
const download = require("download");
const fs = require("fs");


// downloader('http://sachvui.com/cover/2017/pr-la-song.jpg').pipe(fs.createWriteStream('foo.jpg'));
// download('http://sachvui.com/cover/2017/pr-la-song.jpg', __dirname + '/ttt.jpg').then(() => {
//     console.log('done!');
// });

download('http://sachvui.com/cover/2017/pr-la-song.jpg').then(data => {
  fs.writeFile(__dirname + '/ttt.jpg', data, (err) => {});
});
console.log(__dirname);