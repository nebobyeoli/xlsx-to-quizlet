const indexHTML = document.getElementById('index-html');
const XLSX_input = document.getElementById('XLSX-input');

const data = [];

if (indexHTML) {

    // get the files
    XLSX_input.addEventListener('change', e => {
        // check File API support
        if (window.File && window.FileList && window.FileReader) {

            const FILES = e.target.files;
            let XLSXreader, workbook;

            console.log(typeof(FILES), FILES);

            for (let i = 0; i < FILES.length; i++) {

                // only xlsx
                if (!FILES[i].type.match('sheet')) {
                    console.log('Only XLSXs allowed!');
                    continue;
                }

                data.push({ name: FILES[i].name.slice(0, -5), words: [], defs: [] });

                XLSXreader = new FileReader();

                XLSXreader.addEventListener('load', e => {
                    // set workbook
                    workbook = XLSX.read(e.target.result, {type: 'array'});
                    
                    // DO SOMETHING WITH the workbook HERE
                    // write in data arr
                    for (let j = 0; workbook.Sheets['Eng_meanings'][`A${j+1}`] != null; j++) {
                        data[i].words.push(workbook.Sheets['Eng_meanings'][`A${j+1}`].v);
                        data[i].defs.push(workbook.Sheets['Eng_meanings'][`B${j+1}`].v);
                    }
                });
                XLSXreader.readAsArrayBuffer(FILES[i]);
            }

            // sort data
            for (let i = 0; i < data.length; i++) for (let j = 0; j < data.length-1 - i; j++) {
                if (data[j].name > data[j+1].name) {
                    let t = data[j]; data[j] = data[j+1]; data[j+1] = t;
                }
            }

            console.log(data);
        }
        else {
            console.log('Your browser does not support File API');
        }
    });
}
