
function timeRemaining() {
    countdown--;

    g.clear();
    showDateBar();

    g.setFontAlign(0,0);  // centre
    g.setFont("Vector", 40);
    g.setColor("#FF0000");
    g.drawString("8w1", g.getWidth()/2, 60);
    
    g.setFontAlign(0,0);  // centre
    g.setFont("Vector", 50);
    g.setColor("#FFFF00");
    // draw the current counter value
    let mins = Math.floor(countdown / 60).toString();
    if (mins<10) {
        mins = "0" + mins;  //padding with leading zero
    }
    let secs = (countdown % 60).toString();
    if (secs<10) {
        secs = "0" + secs;  // padding with leading zero
    }
    g.drawString(mins + ":" + secs, g.getWidth()/2, 130);
    
    // optional - this keeps the watch LCD lit up
    //Bangle.setLCDPower(1);
    //console.log(Bangle.isLCDOn());
}

// displays the date in a narrow strip at the top
function showDateBar() {
    g.setColor("#FFFF00");  // yellow
    g.setFontAlign(-1,-1);  // top left
    g.setFont("12x20");
    g.drawString(getWeekLetter(today) + " " + getDateText(today), 5, 5);
}

function getDateText(date) {
    // turns "Sat, 18 Jun 2022 12:04:35 GMT" into "Sat 18 Jun"
    return date.toUTCString().substring(0, 3) 
           + date.toUTCString().substring(4, 11);
}

function getWeekLetter(date) {
    return "A";
    // TODO: actually calculate the correct week A or B
}

// MAIN PROGRAM
var period = 50;
var countdown = period * 60;
var today = new Date();
//console.log(getDateText(today));

var timetable = require("Storage").read("timetable.txt");
//console.log(timetable);
var interval = setInterval(timeRemaining, 1000);