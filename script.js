const indexHTML = document.getElementById("index-html");

if (indexHTML) {

    $(document).ready(function() {
        $('input[id="XLSX-input"]').change(function(e) {

            var files = e.target.files, f = files[0];
            var reader = new FileReader();
            reader.onload = function(e) {
                var data = new Uint8Array(e.target.result);

                writeme.innerHTML = "file is uploaded, running";
                var workbook = XLSX.read(data, {type: 'array'});

                /* DO SOMETHING WITH workbook HERE */
                writeme.innerHTML = workbook.Sheets["Eng_meanings"]["A1"].v;
                console.log(workbook.Sheets["Eng_meanings"]["A1"].v);
            };
            reader.readAsArrayBuffer(f);
        });
    });
}