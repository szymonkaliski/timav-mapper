const fs = require("fs");

const dataFile = process.argv[2];

if (!dataFile) {
  console.log("provide events json as argument!");
  process.exit(0);
}

const data = require(dataFile);

// transforming functions

const transformCodeToLanguage = summary => {
  return summary.replace("@language(", "@code(");
};

const transformWritingToJournal = summary => {
  return summary.replace("@writing", "@journal");
};

const transformDesignToVisualDesign = summary => {
  return summary.replace("@design", "@visual(design)");
};


// actual transformation

const newData = data
  .map(d => {
    const oldSummary = d.summary;

    // d.summary = transformCodeToLanguage(d.summary);

    d.summary = transformWritingToJournal(d.summary);
    d.summary = transformDesignToVisualDesign(d.summary);

    return d.summary !== oldSummary ? d : null;
  })
  .filter(_ => _);


// dump to file

fs.writeFileSync(
  "./events-transformed.json",
  JSON.stringify(newData, null, 2),
  "utf-8"
);
