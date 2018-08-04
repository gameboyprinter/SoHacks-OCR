var canvas, ctx;

var isDown = false;
var prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0;
var xData = [],
    yData = [];

var input;
var img;

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    input = document.getElementById("file");
    input.addEventListener('change', upload);
}

function erase() {
    // Erase.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    xData.length = 0;
    yData.length = 0;
}

function analyze() {
    if(typeof img === "undefined")
        return;
    Tesseract.recognize(canvas)
        .progress(message => {
            var status = document.getElementById("status");
            status.innerHTML = `${message.status} : ${message.progress * 100}%`;
        })
        .catch(err => console.error(err))
        .then(result => {
            var resultDiv = document.getElementById("result");
            resultDiv.innerHTML = result.html;
        });
}

function upload(e) {
    img = new Image();
    img.src = window.URL.createObjectURL(e.target.files[0]);
    erase();
    img.onload = () => {
        img.width *= 5;
        img.height *= 5;
        if(img.width > 1920){
            img.height *= Math.floor(img.width/1920);
            img.width = 1920;
        }
        if(img.height > 1080){
            img.height = 1080;
        }
            
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        analyze();
    };
}