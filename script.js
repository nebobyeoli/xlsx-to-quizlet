const indexHTML = document.getElementById('index-html');
const XLSX_input = document.getElementById('XLSX-input');

if (indexHTML) {

    XLSX_input.onchange = function(e) {
        // Check File API support
        if (window.File && window.FileList && window.FileReader) {
            
            const FILES = e.target.files;
            let XLSXreader, workbook;

            writeme.innerHTML = 'First words:';
            
            for (let i = 0; i < FILES.length; i++) {
                
                // Only xlsx
                if (!FILES[i].type.match('sheet')) {
                    console.log('Only XLSXs allowed!');
                    continue;
                }

                XLSXreader = new FileReader();

                XLSXreader.onload = function(e) {
                    // Set workbook
                    workbook = XLSX.read(e.target.result, {type: 'array'});
                    
                    /* DO SOMETHING WITH workbook HERE */
                    writeme.innerHTML += ' ' + workbook.Sheets['Eng_meanings']['A1'].v;
                    console.log(workbook.Sheets['Eng_meanings']['A1'].v);
                };
                XLSXreader.readAsArrayBuffer(FILES[i]);
            }
        }
        else {
            console.log('Your browser does not support File API');
        }
    };
}