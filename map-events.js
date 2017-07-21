const fs = require('fs');

const dataFile = process.argv[2];

if (!dataFile) {
  console.log('provide events json as argument!');
  process.exit(0);
}

const data = require(dataFile);

// transforming function
const transformSummary = summary => {
  return summary.replace('@language(', '@code(');
};

const newData = data
  .map(d => {
    const oldSummary = d.summary;
    d.summary = transformSummary(d.summary);

    return d.summary !== oldSummary ? d : null;
  })
  .filter(_ => _);

fs.writeFileSync('./events-transformed.json', JSON.stringify(newData, null, 2), 'utf-8');
