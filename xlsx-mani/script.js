const indexHTML = document.getElementById('index-html');
const XLSX_input = document.getElementById('XLSX-input');

const BLANK = '_________'; // you know what this is
const data = [];
let data_XLSX = null;

// remove characters of wrapcharArr[] on first and last of langsheetCell
function rmWrapchar(str, wrapcharArr) {
    wrapcharArr.forEach(c => {
        while (str.charAt(0) == c) str = str.slice(1);
        while (str.slice(-1) == c) str = str.slice(0, -1);
    })
    return str;
}

// rmWrapchar on properties of langsheetCell
// langsheetCell: like korSh['A' + j], korSh['B' + j], engSh['B' + j]
function rmSheetwrap(langsheetCell) {
    let cell = langsheetCell;
    if (!cell) return null;
    cell.v = rmWrapchar(cell.v, [' ', '　']).replaceAll(' ,', ',');
    cell.h = cell.w = cell.v;
    cell.r = `<t>${cell.v}</t>`;
    return cell.v;
}

if (indexHTML && XLSX_input) XLSX_input.addEventListener('change', function(e)
{
    // check File API support
    if (!window.File || !window.FileList || !window.FileReader) {
        console.log('Your browser does not support File API');
    }

    else
    {
        // snapshot of loaded e.target.files
        const FILES = e.target.files;

        for (let i = 0; i < FILES.length; i++)
        {
            if (!FILES[i].type.match('sheet')) continue;

            data.push({
                name: FILES[i].name.slice(0, -5),
                terms: [],
                korDefs1: [],
                korDefs2: [],
                engDefs: []
            });

            // data arr snapshot of current file
            const dataNow = data[data.length - 1];

            if (!FILES[i].type.match('sheet')) {
                console.log('Only XLSXs allowed!', FILES[i].name);
                continue;
            }

            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(FILES[i]);

            fileReader.addEventListener('load', function(e)
            {
                // DO SOMETHING WITH the workbook HERE
                // write in data arr
                const workbook = XLSX.read(e.target.result, {type: 'array'});
                if (data_XLSX == null) data_XLSX = workbook;

                console.log(workbook);
                console.log(workbook.Strings);
                console.log('before|length: ', workbook.Strings.length);

                const korSh = workbook.Sheets['Kor_meanings']; // Kor worksheet
                const engSh = workbook.Sheets['Eng_meanings']; // Eng worksheet

                for (let j = 1; engSh['A' + j] != null; j++)
                {
                    let korTerm, korDef1, korDef2;
                    let engTerm = engSh['A' + j].v;
                    let engDef  = engSh['B' + j].v;

                    // regex flag: g = global, i = case-insensitive
                    engSh['B' + j].v = engDef.replaceAll(RegExp(engTerm, 'gi'), BLANK);

                    korTerm = rmSheetwrap(korSh['A' + j]);
                    korDef1 = rmSheetwrap(korSh['B' + j]);
                    korDef2 = rmSheetwrap(korSh['C' + j]);
                    engTerm = rmSheetwrap(engSh['A' + j]);
                    engDef  = rmSheetwrap(engSh['B' + j]);

                    dataNow.terms.push(engTerm);
                    dataNow.korDefs1.push(korDef1);
                    dataNow.korDefs2.push(korDef2);
                    dataNow.engDefs.push(engDef);
                }

                workbook.Strings = [];

                for (let i = 0; i < dataNow.terms.length; i++) {
                    let term    = dataNow.terms     [i];
                    let korDef1 = dataNow.korDefs1  [i];
                    let korDef2 = dataNow.korDefs2  [i];
                    workbook.Strings.push               ({ t: term,     r: `<t>${term   }</t>`, h: term     });
                    workbook.Strings.push               ({ t: korDef1,  r: `<t>${korDef1}</t>`, h: korDef1  });
                    if (korDef2) workbook.Strings.push  ({ t: korDef2,  r: `<t>${korDef2}</t>`, h: korDef2  });
                }

                dataNow.engDefs.forEach(engDef => {
                    workbook.Strings.push               ({ t: engDef,   r: `<t>${engDef}</t>`,  h: engDef   });
                })

                // set column width
                workbook.Sheets['Kor_meanings'] = Object.assign(korSh, {
                    '!cols': [
                        { wch: 14.38 },
                        { wch: 49.38 },
                        { wch: 39.38 }
                    ]
                });

                workbook.Sheets['Eng_meanings'] = Object.assign(engSh, {
                    '!cols': [
                        { wch: 14.38 },
                        { wch: 255   }
                    ]
                });

                data_XLSX.Sheets['Kor_meanings'] = Object.assign(data_XLSX.Sheets['Kor_meanings'], workbook.Sheets['Kor_meanings']);
                data_XLSX.Sheets['Eng_meanings'] = Object.assign(data_XLSX.Sheets['Eng_meanings'], workbook.Sheets['Eng_meanings']);

                // THIS creates a complete download file
                XLSX.writeFile(workbook, FILES[i].name);
                console.log(workbook.Strings);
                console.log('after|length: ', workbook.Strings.length);
            });
        }

        // sort data
        for (let i = 0; i < data.length; i++) for (let j = 0; j < data.length-1 - i; j++) {
            if (data[j].name > data[j + 1].name) {
                let t = data[j]; data[j] = data[j + 1]; data[j + 1] = t;
            }
        }
    }
});
