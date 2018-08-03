var canvas, ctx;

var isDown = false;
var prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0;
var xData = [],
    yData = [];

var input;

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    input = document.getElementById("file");
    ctx.strokeStyle = '#080';
    ctx.lineWidth = 2;

    canvas.addEventListener('mousemove', mousemove, false);
    canvas.addEventListener('mousedown', mousedown, false);
    canvas.addEventListener('mouseup', mouseup, false);
    canvas.addEventListener('mouseout', mouseup, false);

    input.addEventListener('change', upload);
}

function draw() {
    ctx.lineTo(currX, currY);
    ctx.stroke();
    xData.push(clamp(currX));
    yData.push(clamp(256 - currY));
}

function clamp(n) {
    // Integer only, 0-255.
    n = Math.round(n);
    return Math.max(0, Math.min(255, n));
}

function getXY() {
    var x = 0;
    var y = 0;
    var o = canvas;
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

function mousemove(e) {
    if (isDown) {
        prevX = currX;
        prevY = currY;
        var xy = getXY();
        currX = e.clientX - xy.x;
        currY = e.clientY - xy.y;
        draw();
    }
}

function mousedown(e) {

    // Initialize new drawing path.
    prevX = currX;
    prevY = currY;
    var xy = getXY();
    currX = e.clientX - xy.x;
    currY = e.clientY - xy.y;
    ctx.beginPath();

    isDown = true;
}

function erase() {
    // Erase.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    xData.length = 0;
    yData.length = 0;
}

function mouseup(e) {
    if (isDown) {
        isDown = false;
        ctx.closePath();
    }
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

function upload(e) {
    var img = new Image();
    img.src = window.URL.createObjectURL(e.target.files[0]);
    erase();
    img.onload = () => {
        var newX = img.width;
        var factor = 1;
        if(img.width > canvas.width)
            newX = canvas.width;
        if(img.height > canvas.width)
            newY = canvas.width;
    
        if(img.width < canvas.width){
            while(newX * 2 < canvas.width){
                newX *= 2;
                factor *= 2;
            }
        }

        ctx.drawImage(img, 0, 0, newX, img.height * factor);
    };
}