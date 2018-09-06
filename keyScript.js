console.log("hi from me");

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
        doScroll(window.innerHeight/2);
    } else if (event.key === 'e') {
        doScroll(-window.innerHeight/2);
    }
});

window.addEventListener('keyup', (event) => {
    
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
    startY: undefined,
    endY: undefined,
    startX: undefined,
    timeStep: undefined,
    timeSteps: 6
};

function doScroll(dy) {
    // clear an existing timer
    if (scroll.timer !== undefined) {
        clearInterval(scroll.timer);
    }

    // set start and end
    // console.log(window);
    scroll.startY = window.scrollY;
    if (scroll.endY === undefined) {
        scroll.endY = scroll.startY + dy;
    } else {
        scroll.endY += dy;
    }
    
    scroll.startX = window.scrollX;

    // reset time
    scroll.timeStep = 0;

    // start the new timer
    scroll.timer = setInterval(() => {
        scroll.timeStep += 1;

        var time = scroll.timeStep / scroll.timeSteps;
        time = Math.sqrt(time);
        currY = scroll.startY + time * (scroll.endY - scroll.startY);
        console.log('scroll to ' + scroll.startX + ', '+currY+' at time '+time);
        window.scrollTo(scroll.startX, currY);


        // stop the timer
        if (scroll.timeStep === scroll.timeSteps) {
            clearInterval(scroll.timer);
            scroll.timer = undefined;
            scroll.startY = undefined;
            scroll.endY = undefined;
            scroll.startX = undefined;
        }
    }, 20);
}