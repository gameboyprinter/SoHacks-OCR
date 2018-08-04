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
var saturation;
var contrast;
var url;

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    input = document.getElementById("file");
    input.addEventListener('change', upload);
    contrast = document.getElementById("contrast").value;
    document.getElementById("contrast").addEventListener("change", contrastChange);
    saturation = document.getElementById("saturation").value;
    document.getElementById("saturation").addEventListener("change", saturationChange);
}

async function saturationChange(e) {
    saturation = e.target.value;
    await draw(img);
    analyze(img);
}

async function contrastChange(e) {
    contrast = e.target.value;
    await draw(img);
    analyze(img);
}

function erase() {
    // Erase.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    xData.length = 0;
    yData.length = 0;
}

function analyze() {
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

function draw(img) {
    if (url == "")
        return;
    return new Promise(resolve => {
        erase();
        img = new Image();
        img.src = url;
        img.onload = () => {
            img.width *= 5;
            img.height *= 5;
            if (img.width > 1920) {
                img.height *= Math.floor(img.width / 1920);
                img.width = 1920;
            }
            if (img.height > 1080) {
                img.height = 1080;
            }

            canvas.width = img.width;
            canvas.height = img.height;



            ctx.filter = `saturate(${saturation}%) contrast(${contrast}%)`;
            console.log(ctx.filter);
            ctx.drawImage(img, 0, 0, img.width, img.height);
            resolve();
        }
    });
}

async function upload(e) {
    url = window.URL.createObjectURL(e.target.files[0]);
    await draw(img);
    analyze(img);
}

//210-788-2727