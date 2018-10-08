
const a = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // console.log("A function done!")
      resolve("A function done!");
    }, 1000)
  })
}

a()
  .then(rs => {
    console.log(rs);
    return Promise.resolve("After then");
  })
  .then((s) => {
    console.log(s);
  })
  .catch(error => {
    console.log(error);
  })