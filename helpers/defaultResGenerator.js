const { createPath } = require("./createPath");
const { headerGenerator } = require("./headerGenerator");
const fs = require("fs").promises;

const defaultResGenerator = async (res, type, folders, fileName, status) => {
  const file = await fs.readFile(
    createPath(folders.join("/"), fileName),
    "utf-8",
  );
  headerGenerator(status, type, res);
  res.write(file);
  res.end();
};

module.exports.defaultResGenerator = defaultResGenerator;