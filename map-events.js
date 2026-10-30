const fs = require("fs");

const dataFile = process.argv[2];

if (!dataFile) {
  console.log("provide events json as argument!");
  process.exit(0);
}

const data = require(dataFile);

const transformSummary = (summary) => {
  return summary
    .replace(/^Google Creative Lab\b/, "Google")
    .replace(/@\s+/g, "@")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/,\s+/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/@(reserarch|ressearch|resarch|reserch)\b/g, "@research")
    .replace(/@(worflow|worlfow|worklfow|workfow)\b/g, "@workflow")
    .replace(/@personla\b/g, "@personal")
    .replace(/@musc\b/g, "@music")
    .replace(/@language\(/g, "@code(")
    .replace(/\bsupercolider\b/g, "supercollider")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const newData = data
  .map((d) => {
    const oldSummary = d.summary || "";
    const summary = transformSummary(oldSummary);

    if (summary === oldSummary) {
      return null;
    }

    console.log(`${oldSummary} -> ${summary}`);

    return { ...d, summary };
  })
  .filter((_) => _);

fs.writeFileSync(
  "./events-transformed.json",
  JSON.stringify(newData, null, 2),
  "utf-8"
);
