var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var axios = require('axios');
var buffer = require('buffer');
var atob = require('atob');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var base64;

app.use("/static", express.static(path.join(__dirname, "static")));
app.post("/dwnd", function(req, res) {
    // get url from post parameter
    var urlBase64 = req.body.url;
    var url = atob(urlBase64);
    console.log("file from " + url + " requested");
    axios({
        url: url, //your url
        method: 'GET',
        responseType: 'arraybuffer', // important
    }).then((response) => {
        // encode file data to base64
        base64 = Buffer.from(response.data, 'binary').toString('base64');
        const byteChars = atob(base64);
        
        // simple xor encoding
        // const encodedString = byteChars.map( value => value ^ 0x80 );
        const CIPHER_KEY = 0x10;
        const encodedString = byteChars.split("").map(  e => String.fromCharCode( e.charCodeAt(0) ^ CIPHER_KEY ) ).join("");


        // send response containing file data as base64 encoded string
        // with javascript code to decode to binary data
        res.status(200).send(`<htm><head><title>download</title>
        <link href="/static/css/style.css" rel="stylesheet"/>
        </head><body><a id="a">Download your file here</a>
        <pre>${JSON.stringify(response.headers, 1) }</pre>
        <script>var a="${base64}";
        const byteChars = atob(a);
        const CIPHER_KEY = 0x10;
        const decodedByteChars = byteChars.split("").map(  e => String.fromCharCode( e.charCodeAt(0) ^ CIPHER_KEY ) ).join("");
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: '${response.headers['content-type']}'});
        const blobUrl = URL.createObjectURL(blob);

        var a = document.getElementById('a');
        a.href = blobUrl;
        </script>
        </body></html>`);
    });
});

app.listen(8080);