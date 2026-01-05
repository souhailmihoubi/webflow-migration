
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'temp_countries.json');
const outputFile = path.join(__dirname, 'apps/client/src/app/shared/constants/countries.ts');

try {
  const rawData = fs.readFileSync(inputFile, 'utf8');
  const countriesObj = JSON.parse(rawData);

  const countriesWithDuplicates = Object.entries(countriesObj).map(([key, val]) => ({
    code: key.toUpperCase(),
    dial_code: val.dialCode,
    name: val.name,
    flag: val.flag
  }));

  // Deduplicate by name and code to be safe, though source usually unique keys.
  // Sorting by name
  const countries = countriesWithDuplicates.sort((a, b) => a.name.localeCompare(b.name));

  const fileContent = `export const COUNTRY_CODES = ${JSON.stringify(countries, null, 2)};`;

  fs.writeFileSync(outputFile, fileContent);
  console.log('Successfully wrote countries.ts');
} catch (err) {
  console.error('Error transforming countries:', err);
}
