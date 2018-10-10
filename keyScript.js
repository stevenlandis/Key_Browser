var scrollSpeed = 10;
var scrollAcc = 10;
var scrollDec = 15;
var scrollMaxSpeed = 200;

var mouse = {
    x: 0,
    y: 0
};

var keyOverlay = undefined;
var textOverlay = undefined;

// controls whether the extension is on or not
var on = true;

chrome.runtime.sendMessage(
    "Starting Content Script"
);

window.addEventListener('keydown', (event) => {
    // console.log("pressed " + event.key);
    console.log(event);

    // test for spedial overlay keypress
    if (event.key === ' ' && event.ctrlKey) {
        focusKeyOverlay();
    }

    // make sure not to fire event when typing
    if (isTyping(event)) {
        console.log('   STOPPED: not typing');
        return;
    }

    handleKeyPress(event);
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'd' || event.key === 'e') {
        decScroll();
    }

    // console.log(keys);
});

// document.body.addEventListener('onfocusout', (event) => {
//     console.log('bye bye');
// });

window.addEventListener('focusout', (event) => {
    keys = [];
    decScroll();
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// window.addEventListener('load', (event) => {
//     console.log('loading');
// });

window.addEventListener('DOMContentLoaded', (event) => {
    // make the overlays
    makeTextOverlay();
    setTextOverlay('Listening', 'LightGreen');
    makeKeyOverLay();
});

function handleKeyPress(event) {
    // make sure the extension is on
    if (!on) return;

    // make sure a modifier isn't pressed
    if (event.ctrlKey || event.altKey || event.metaKey) {
        console.log('   STOPPED: modifier pressed');
        return;
    }

    // make sure the key isn't being trigger on a repeat
    if (event.repeat) {
        console.log('   STOPPED: repeated key');
        return;
    }

    console.log('   key is processed');

    if        (event.key === 'x') {
        // close current tab
        chrome.runtime.sendMessage("close tab");
    } else if (event.key === 'w') {
        // go back in history
        window.history.back();
    } else if (event.key === 'r') {
        // go forward in history
        window.history.forward();
    } else if (event.key === 's') {
        // move to left tab
        chrome.runtime.sendMessage('highlight left tab');
    } else if (event.key === 'f') {
        // move to right tab
        chrome.runtime.sendMessage('highlight right tab');
    } else if (event.key === 't') {
        // open a new tab
        chrome.runtime.sendMessage('new tab');
    } else if (event.key === 'd') {
        // scroll up
        startScroll(1, scrollSpeed, scrollMaxSpeed, scrollAcc, scrollDec);
    } else if (event.key === 'e') {
        // scroll down
        startScroll(-1, scrollSpeed, scrollMaxSpeed, scrollAcc, scrollDec);
    } else if (event.key === 'y') {
        // open histiry
        chrome.runtime.sendMessage('open history');
    } else if (event.key === 'g') {
        // open link in new tab and go to new tab
        var link = getLinkUnderCursor();
        if (link === undefined) return;

        window.open(link);
    } else if (event.key === 'n') {
        // search page for link that includes 'next'
        // and go to link
        var link = getNextLink();
        if (link === undefined) return;

        window.open(link,"_self");
    } else if (event.key === 'q') {
        console.log('stopping');
        setTextOverlay('Off', '#ed9595');
        on = false;
        focusBody();
    }
}

function isTyping(event) {
    if (event.target.contentEditable === 'true') {
        return true;
    }

    return event.path.find((tag) => {
        return tag.tagName === 'INPUT' ||
               tag.tagName === 'SPAN' ||
               tag.tagName === 'TEXTAREA';
    }) !== undefined;
}

// ---------------------
//  Scrolling Mechanics
// ---------------------

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

function getElemUnderCursor() {
    return document.elementFromPoint(mouse.x, mouse.y);
}

function getLinkUnderCursor() {
    var elem = getElemUnderCursor();

    while (elem.tagName !== 'A') {
        elem = elem.parentElement;

        if (elem === null) {
            return undefined;
        }
    }

    return elem.href;
}

function getNextLink() {
    var links = document.getElementsByTagName('a');
    for (var e of links) {
        if (e.innerText.toLowerCase().includes('next')) {
            return e.href;
        }
    }
}

function getMaxZLevel() {
    return Math.max(
        ...Array.from(document.querySelectorAll('body *'))
            .map(a => parseFloat(window.getComputedStyle(a).zIndex))
            .filter(a => !isNaN(a)));
}

function makeTextOverlay() {
    textOverlay = document.createElement('div');
    textOverlay.style.width = 'auto';
    textOverlay.style.height = 'auto';
    textOverlay.style.position = 'fixed';
    textOverlay.style.zIndex = getMaxZLevel() + 1;
    textOverlay.style.bottom = 0;
    textOverlay.style.right = 0;
    textOverlay.style.border = 'none';
    textOverlay.style.padding = '5px';
    textOverlay.style.backgroundColor = 'LightGreen';
    textOverlay.style.fontSize = '12px';
    textOverlay.style.fontFamily = 'arial';
    textOverlay.textContent = 'test text';

    document.body.appendChild(textOverlay);
}

function setTextOverlay(txt, color) {
    if (textOverlay===undefined)return;

    textOverlay.textContent = txt;

    if (color!==undefined) {
        textOverlay.style.backgroundColor = color;
    }
}

function makeKeyOverLay() {
    keyOverlay = document.createElement('iframe');
    document.body.appendChild(keyOverlay);

    keyOverlay.style.border = 'none';
    keyOverlay.style.position = 'fixed';
    keyOverlay.style.width = '0';
    keyOverlay.style.height = '0';

    keyOverlay.addEventListener('blur', (event) => {
        // make sure the extension is on
        if (!on) return;

        setTextOverlay('Listening', 'LightGreen');
    });

    // add event listeners
    keyOverlay.contentDocument.addEventListener('keydown', (event) => {
        event.stopPropagation();
        handleKeyPress(event);
    });

    keyOverlay.contentDocument.addEventListener('keyup', (event) => {
        if (event.key === 'd' || event.key === 'e') {
            decScroll();
        }
    });
}

function focusKeyOverlay() {
    if (keyOverlay===undefined)return;

    on = true;

    document.activeElement.blur();
    keyOverlay.focus();
    setTextOverlay('Locked', 'LightBlue');
}

function focusBody() {
    document.activeElement.blur();
    document.body.focus();
}