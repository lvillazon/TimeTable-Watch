const ACCEL_HIGH = 1.8;
const ACCEL_LOW = 0.2;
//const ACCEL_HIGH = 1.1;  // debug values to make it easier to trigger
//const ACCEL_LOW = 0.9;
const FRAMES = 100; // how many frames for each animation
const SCREEN = 176;  // screen size
const HALF_SCREEN = Math.round(SCREEN /2);

// return true if the watch is waved around energetically enough
function trigger() {
    accel = Bangle.getAccel();
//    if (accel.mag > highest) highest = accel.mag;
//    if (accel.mag < lowest) lowest = accel.mag;
//    console.log("trig:" + trigger + " mag:"+accel.mag + " high:" + highest + " low:" + lowest);
    return (accel.mag > ACCEL_HIGH || accel.mag < ACCEL_LOW);
}

function wait() {
    if (trigger()) {
        console.log("triggering");
        clearInterval(interval);
        interval = setInterval(animate, 100);
    } else {
        animateBeat();
    }
}

// show beating heart in time to actual heart rate
Bangle.on('HRM', (hrm) => {
    if (hrm.bpm != bpm) {
        bpm = hrm.bpm;
        //console.log("new bpm="+bpm);
    }
});

// how far through the current beat are we? 0-1
function beatFraction() {
    let duration_ms = 60000/bpm;
    let elapsedTime = Date.now() - beatStart;
    if (elapsedTime>duration_ms) {  // beat has finished, so start the next
        beatStart = Date.now();
//        beatNumber++;
        elapsedTime = 0;
        //console.log("Badum");
    }
    let proportionLeft = 1-(elapsedTime / duration_ms);
    //console.log("bpm:"+bpm + " beat#" + beatNumber + " duration:"+duration_ms + " completed:"+Math.round((proportionLeft*100)/100)+"%")
    return proportionLeft;
}

function animateBeat() {
    let f = beatFraction();
    drawHeart(1-f);
}

function drawHeart(scale) {
    scale = Math.abs(Math.sin(Math.PI*scale));
    g.clear();
    g.setColor(1,0,0); // red
    r = 50 * scale;
    d = 30 * scale;
    h = 100 * scale;
    t = 19 * scale;
    x = 88;// * scale;
    y = 60;// * scale;
    g.fillCircle(x-d, y, r);
    g.fillCircle(x+d, y, r);
    g.fillPoly([x-d-r,y+t, x+d+r,y+t, x,y+h]);
}

function animate() {
    // reset timeout, to keep the backlight on during animations
    Bangle.setLCDPower(1);
    frame_counter++;
    if (Math.random() > 0.2) { // create new circle
        bubbles.push({x: Math.random()*SCREEN,
                      y: Math.random()*SCREEN,
                      r:0,
                      col: [Math.random()*2, Math.random()*2, Math.random()*2]
                     });
    }
    for (let i=0; i<bubbles.length; i++) {
        let b = bubbles[i];
        if (b.r < 50) {
            b.r = b.r + 3;
            g.setColor(b.col[0], b.col[1], b.col[2]);
            g.fillCircle(b.x, b.y, b.r);
            g.setColor(0);
            g.drawCircle(b.x, b.y, b.r);  // outline
        } else {
            g.setColor(0);
            g.fillCircle(b.x, b.y, b.r);
            bubbles.shift(); // remove oldest bubble - which should be this one
        }
    }
    if (frame_counter > FRAMES){
        frame_counter = 0;
        g.clear();
        bubbles = [];
        clearInterval(interval);
        interval = setInterval(wait, 100);
    }
}

function toggleMode() {
    if (mode == "heart") {
        mode = "time";
        startTimeMode();
    } else {
        mode = "heart";
        startHeartMode();
    }
    console.log(mode);
    setWatch(toggleMode, BTN1);
}

function startHeartMode() {
    Bangle.setHRMPower(1);
    var bpm = 60;  // sensible starting value
    var beatStart = Date.now();
    interval = setInterval(wait, 100); // schedule the initial beat
}

function startTimeMode() {
    Bangle.setHRMPower(0);
    g.clear();
    clearInterval(interval);
}

Bangle.setLCDTimeout(2);
console.log("Starting...");

var frame_counter = 0;
var bubbles = [];

Bangle.setHRMPower(1);
var bpm = 60;  // sensible starting value
var beatStart = Date.now();
//var beatNumber = 0;  // just for debugging

var mode = "heart";
setWatch(toggleMode, BTN1);
var interval = setInterval(wait, 100); // schedule the initial beat
Bangle.loadWidgets();
Bangle.drawWidgets();





















