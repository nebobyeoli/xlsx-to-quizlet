const xlsx = require("xlsx");

var wb = xlsx.readFile("Day 15.xlsx");
var ws = wb.Sheets["Eng_meanings"];
console.log(ws["A1"].v);

var fill = document.getElementById("fill");
fill.innerHTML = ws["A1"].v;