const fs = require("fs");

const dataFile = process.argv[2];

if (!dataFile) {
  console.log("provide events json as argument!");
  process.exit(0);
}

const data = require(dataFile);

const newData = data
  .map((d) => {
    if (d.description === undefined || d.description === "") {
      return null;
    }

    console.log(d.description);

    return { ...d, description: "" };
  })
  .filter((_) => _);

fs.writeFileSync(
  "./events-transformed.json",
  JSON.stringify(newData, null, 2),
  "utf-8"
);
