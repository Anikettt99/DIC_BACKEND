const tympass = (res,req,next) => {
  console.log("Aa RHA IS MIDDLEWARE MAI");
   next()
};

module.exports = tympass;
