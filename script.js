const xlsx = require("xlsx");

var log = document.getElementById("xlsx-drop").nodeValue;
console.log(log);

var workbook = xlsx.readFile("Day 15.xlsx");

var worksheet = workbook.Sheets["Eng_meanings"];

console.log(worksheet["A1"].v);