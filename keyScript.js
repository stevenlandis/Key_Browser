var scrollSpeed = 50;

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
        startScroll(scrollSpeed);
    } else if (event.key === 'e') {
        startScroll(-scrollSpeed);
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'd' || event.key === 'e') {
        stopScroll();
    }
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
    step: undefined
};

function startScroll(dy) {
    stopScroll();

    scroll.step = dy;

    doScroll(dy);
    // start the new timer
    scroll.timer = setInterval(() => {
        doScroll(dy);
    }, 50);
}

function doScroll(dy) {
    window.scrollTo(
        window.scrollX,
        window.scrollY + dy
    );
}

function stopScroll() {
    // clear an existing timer
    if (scroll.timer !== undefined) {
        clearInterval(scroll.timer);
    }
}