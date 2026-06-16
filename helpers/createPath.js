const path = require("path");
const createPath = (...args) => path.join(__dirname, "..", args.join("/"));

module.exports.createPath = createPath;