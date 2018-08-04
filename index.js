var canvas, ctx;

var isDown = false;
var startX = 0;
var startY = 0;

var input;
var img;
var saturation;
var contrast;
var url;

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas2 = document.getElementById('canvas2');
    ctx2 = canvas2.getContext('2d');
    input = document.getElementById("file");
    input.addEventListener('change', upload);
    contrast = document.getElementById("contrast").value;
    document.getElementById("contrast").addEventListener("change", contrastChange);
    saturation = document.getElementById("saturation").value;
    document.getElementById("saturation").addEventListener("change", saturationChange);

    canvas2.addEventListener('mousemove', mousemove, false);
    canvas2.addEventListener('mousedown', mousedown, false);
    canvas2.addEventListener('mouseup', mouseup, false);
    canvas2.addEventListener('mouseout', mouseup, false);

    canvas2.x = canvas.x;
    canvas2.y = canvas.y;
    document.getElementById("canvasses").style = `height: ${canvas.height};`;
}

function getXY() {
    var x = 0;
    var y = 0;
    var o = canvas2;
    while (o) {
        x += o.offsetLeft;
        y += o.offsetTop;
        o = o.offsetParent;
    }
    try {
        x -= document.scrollingElement.scrollLeft;
        y -= document.scrollingElement.scrollTop;
    } catch (e) { /* MSIE? */ }
    return {
        x: x,
        y: y
    };
}


function mouseup(e) {

    ctx2.clearRect(0, 0, canvas.width, canvas.height);

    if (isDown) {
        img = new Image();
        img.src = canvas.toDataURL("image/png");
        console.log(img.src);
        img.onload = () => {
            ctx.filter = `saturate(${saturation}%) contrast(${contrast}%)`;

            var xy = getXY();
            canvas.height = (e.clientY - xy.y) - startY;
            canvas.width = (e.clientX - xy.x) - startX;
            canvas2.height = canvas.height;
            canvas2.width = canvas.width;
            document.getElementById("canvasses").style = `height: ${canvas.height};`;

            erase();
            ctx.drawImage(img, -startX, -startY);

            analyze();
        }
    }

    isDown = false;
}

function mousedown(e) {
    isDown = true;
    var xy = getXY();
    startX = e.clientX - xy.x;
    startY = e.clientY - xy.y;
}

function mousemove(e) {
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    if (isDown) {
        ctx2.strokeStyle = "black";
        var xy = getXY();
        ctx2.strokeRect(startX, startY, (e.clientX - xy.x) - startX, (e.clientY - xy.y) - startY);
    }
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
            canvas2.width = canvas.width;
            canvas2.height = canvas.height;
            document.getElementById("canvasses").style = `height: ${canvas.height};`;

            ctx.filter = `saturate(${saturation}%) contrast(${contrast}%)`;
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