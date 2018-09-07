var scrollSpeed = 20;
var scrollAcc = 10;
var scrollDec = 15;
var scrollMaxSpeed = 200;

chrome.runtime.sendMessage(
    "Starting Content Script"
);

window.addEventListener('keydown', (event) => {
    console.log("pressed " + event.key);
    // console.log(event);

    // make sure not to fire event when typing
    if (isTyping(event)) {
        return;
    }

    // make sure a modifier isn't pressed
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    // make sure the key isn't being trigger on a repeat
    if (event.repeat) {
        return;
    }

    if        (event.key === 'x') {
        chrome.runtime.sendMessage("close tab");
    } else if (event.key === 'w') {
        window.history.back();
    } else if (event.key === 'r') {
        window.history.forward();
    } else if (event.key === 's') {
        chrome.runtime.sendMessage('highlight left tab');
    } else if (event.key === 'f') {
        chrome.runtime.sendMessage('highlight right tab');
    } else if (event.key === 't') {
        chrome.runtime.sendMessage('new tab');
    } else if (event.key === 'd') {
        startScroll(1, scrollSpeed, scrollMaxSpeed, scrollAcc, scrollDec);
    } else if (event.key === 'e') {
        startScroll(-1, scrollSpeed, scrollMaxSpeed, scrollAcc, scrollDec);
    } else if (event.key === 'y') {
        chrome.runtime.sendMessage('open history');
    } else if (event.key === 'g') {
        console.log(getVisibleLinks());
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'd' || event.key === 'e') {
        decScroll();
    }
});

document.body.addEventListener('onfocusout', (event) => {
    console.log('bye bye');
});

function isTyping(event) {
    return event.path.find((tag) => {
        return tag.tagName === 'INPUT' ||
               tag.tagName === 'SPAN' ||
               tag.tagName === 'TEXTAREA';
    }) !== undefined;
}

// Scrolling Mechanics
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
    window.scrollTo(
        window.scrollX,
        window.scrollY + scroll.sign * scroll.speed
    );

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

function getVisibleNodes() {
    allNodes = document.querySelectorAll('body *');
    goodNodes = [];

    for (var i in allNodes) {
        if (allNodes[i].offsetHeight !== 0) {
            goodNodes.push(allNodes[i]);
        }
    }

    return goodNodes;
}

function getVisibleLinks() {
    nodes = document.getElementsByTagName('a');

    goodNodes = [];

    for (var n of nodes) {
        // make sure it is visible
        if (
            n.offsetHeight === 0 ||
            window.getComputedStyle(n).visibility === 'hidden'
        ) {
            continue;
        }

        // make sure it is on the screen
        var bounds = n.getBoundingClientRect();
        var w = window.innerWidth;
        var h = window.innerHeight;
        if (
            bounds.x > window.innerWidth ||
            bounds.x + bounds.width < 0 ||
            bounds.y > window.innerHeight ||
            bounds.y + bounds.height < 0
        ) {
            continue;
        }

        goodNodes.push(n);
    }

    return goodNodes;
}