const xlsx = require("xlsx");

var workbook = xlsx.readFile("Day 15.xlsx");
var worksheet = workbook.Sheets["Eng_meanings"];
console.log(worksheet["A1"].v);




function handleDrop(e) {
    e.stopPropagation(); e.preventDefault();
    var files = e.dataTransfer.files, f = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = new Uint8Array(e.target.result);
        workbook = XLSX.read(data, {type: 'array'});
    
        /* DO SOMETHING WITH workbook HERE */
        console.log(workbook.Sheets["Eng_meanings"]["A1"].v);
    };
    reader.readAsArrayBuffer(f);
}
drop_dom_element.addEventListener('drop', handleDrop, false);








var help = document.getElementById("help-html");
if (help) {

    function previewFiles() {
    
        var preview = document.querySelector('#preview');
        var files   = document.querySelector('input[type=file]').files;
    
        function readAndPreview(file) {
    
            // `file.name` 형태의 확장자 규칙에 주의하세요
            if ( /\.(xlsx)$/i.test(file.name) ) {
                var reader = new FileReader();
                workbook = xlsx.readFile(file);
                reader.addEventListener("load", function () {
                    //var workbook = xlsx.readFile(file);
                    image = new Image();
                    image.height = 100;
                    image.title = file.name;
                    image.src = this.result;
                    preview.appendChild( image );
                }, false);
    
                reader.readAsDataURL(file);
            }
        }
    
        if (files) {
            [].forEach.call(files, readAndPreview);
        }
    }
}
