const city = require("cities.json");

let justCity = [];

for (const iterator of city) {
  justCity.push(iterator.name.split(" ")[0].trim().toLowerCase());
}

module.exports = justCity;