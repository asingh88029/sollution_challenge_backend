const diseaseList = [
  {
    id: 107,
    name: "Rabies",
  },
  {
    id: 100,
    name: "Malaria",
  },
  {
    id: 95,
    name: "Lassa",
  },
  {
    id: 96,
    name: "Tuberculosis",
  },
  {
    id: 97,
    name: "Measles",
  },
  {
    id: 98,
    name: "Meningococcal",
  },
  {
    id: 99,
    name: "Chikungunya",
  },
  {
    id: 101,
    name: "Plague",
  },
  {
    id: 102,
    name: "Hiv",
  },
  {
    id: 103,
    name: "Immunization",
  },
  {
    id: 104,
    name: "Pneumonia",
  },
  {
    id: 105,
    name: "Rubella",
  },
  {
    id: 106,
    name: "Poliomyelitis",
  },
  {
    id: 108,
    name: "Hepatitis",
  },
  {
    id: 109,
    name: "Buruli",
  },
  {
    id: 112,
    name: "Millennium",
  },
  {
    id: 113,
    name: "Soil",
  },
  {
    id: 114,
    name: "Foodborne",
  },
  {
    id: 115,
    name: "Ebola",
  },
  {
    id: 116,
    name: "Hepatitis",
  },
  {
    id: 117,
    name: "Yellow",
  },
  {
    id: 118,
    name: "Dengue",
  },
  {
    id: 119,
    name: "Trachoma",
  },
  {
    id: 120,
    name: "Chagas",
  },
  {
    id: 121,
    name: "Lymphatic filariasis",
  },
  {
    id: 122,
    name: "Onchocerciasis",
  },
  {
    id: 123,
    name: "Trypanosomiasis",
  },
  {
    id: 124,
    name: "Guinea",
  },
  {
    id: 125,
    name: "Echinococcosis",
  },
  {
    id: 126,
    name: "Encephalitis",
  },
  {
    id: 126,
    name: "Encephalitis",
  },
  {
    id: 127,
    name: "Vector",
  },
  {
    id: 128,
    name: "Avian",
  },
  {
    id: 129,
    name: "Influenza",
  },
  {
    id: 130,
    name: "Cholera",
  },
  {
    id: 131,
    name: "Yaws",
  },
  {
    id: 132,
    name: "Leprosy",
  },
  {
    id: 133,
    name: "Leishmaniasis",
  },
  {
    id: 134,
    name: "Diarrhoeal",
  },
  {
    id: 135,
    name: "Taeniasis",
  },
  {
    id: 136,
    name: "Bites",
  },
  {
    id: 137,
    name: "Crimean",
  },
  {
    id: 137,
    name: "Haemorrhagic",
  },
  {
    id: 138,
    name: "Marburg",
  },
  {
    id: 139,
    name: "Monkeypox",
  },
  {
    id: 140,
    name: "Rift",
  },
  {
    id: 141,
    name: "Second",
  },
  {
    id: 142,
    name: "Cancer",
  },
  {
    id: 143,
    name: "Cold",
  },
  {
    id: 143,
    name: "Khasi",
  },
  {
    id: 143,
    name: "Sardi",
  },
  {
    id: 143,
    name: "Jukaam",
  },
  {
    id: 143,
    name: "Animal",
  },
];

let justDisease = [];

for (const iterator of diseaseList) {
  justDisease.push(iterator.name.split("-")[0].trim().toLowerCase());
}


module.exports = justDisease;
// 