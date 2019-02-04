// ---------------------
//  Scrolling Mechanics
// ---------------------

var scrollSpeed = 10;
var scrollAcc = 10;
var scrollDec = 15;
var scrollMaxSpeed = 200;

var scroll = {
    timer: undefined,
    sign: undefined,
    speed: undefined,
    maxSpeed: undefined,
    acc: undefined,
    dec: undefined,
    state: undefined
};

function startScroll(sign, speed, maxSpeed, acc, dec) {
    stopScroll();

    // set the scroll properties
    scroll.sign = sign; // up or down
    scroll.speed = speed;
    scroll.maxSpeed = maxSpeed;
    scroll.acc = acc;
    scroll.dec = dec;
    scroll.state = true; // true for acceleration

    doScroll();
    // start the new timer
    scroll.timer = setInterval(() => {
        doScroll();
    }, 50);
}

function decScroll() {
    scroll.state = false;
}

function doScroll() {
    // make sure the window is still focused
    if (!document.hasFocus()) {
        stopScroll();
    }

    // scroll
    window.scrollTo({
        left: window.scrollX,
        top: window.scrollY + scroll.sign * scroll.speed,
        behavior: 'instant'
    });

    // increment speed
    if (scroll.state) {
        scroll.speed += scroll.acc;
    } else {
        scroll.speed -= scroll.dec;
    }

    // console.log(scroll.speed);

    // make sure speed is still positive
    if (scroll.speed <= 0) {
        stopScroll();
        return;
    }

    // cap speed
    scroll.speed = Math.min(scroll.speed, scroll.maxSpeed);
}

function stopScroll() {
    // clear an existing timer
    if (scroll.timer !== undefined) {
        clearInterval(scroll.timer);
    }
    scroll.timer = undefined;
}