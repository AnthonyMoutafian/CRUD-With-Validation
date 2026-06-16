function headerGenerator(status,type,res){
    return res.writeHead(status, {
      "content-type": type,
    });
}

module.exports.headerGenerator = headerGenerator