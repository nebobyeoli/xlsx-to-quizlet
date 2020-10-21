import { run } from '/working/headless.js';
// const { run } = require('/working/headless.js');

const indexHTML = document.getElementById('index-html');
const XLSX_input = document.getElementById('XLSX-input');

const data = [];

if (indexHTML) {

    // Get the files!
    XLSX_input.onchange = function(e) {
        // Check File API support
        if (window.File && window.FileList && window.FileReader) {
            
            const FILES = e.target.files;
            let XLSXreader, workbook;
            
            for (let i = 0; i < FILES.length; i++) {
                if (!FILES[i].type.match('sheet')) FILES.splice(i, 1);
            }

            for (let i = 0; i < FILES.length; i++) {
                
                // Only xlsx
                if (!FILES[i].type.match('sheet')) {
                    console.log('Only XLSXs allowed!');
                    continue;
                }

                // data.push({ name:  });
                data.push({ name: FILES[i].name.slice(0, -5), words: [], defs: [] });
                
                XLSXreader = new FileReader();

                XLSXreader.onload = function(e) {
                    // Set workbook
                    workbook = XLSX.read(e.target.result, {type: 'array'});
                    
                    // DO SOMETHING WITH workbook HERE
                    // Write in data arr
                    for (let j = 0; workbook.Sheets['Eng_meanings'][`A${j+1}`] != null; j++) {
                        data[i].words.push(workbook.Sheets['Eng_meanings'][`A${j+1}`].v);
                        data[i].defs.push(workbook.Sheets['Eng_meanings'][`B${j+1}`].v);
                    }
                };
                XLSXreader.readAsArrayBuffer(FILES[i]);
            }

            // sort data
            for (let i = 0; i < data.length; i++) for (let j = 0; j < data.length-1 - i; j++) {
                if (data[j].name > data[j+1].name) {
                    let t = data[j]; data[j] = data[j+1]; data[j+1] = t;
                }
            }

            console.log(data);
            run();
        }
        else {
            console.log('Your browser does not support File API');
        }
    };
}
