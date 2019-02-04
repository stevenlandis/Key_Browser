var mouse = {
    x: 0,
    y: 0
};

var keyOverlay = undefined;
var textOverlay = undefined;


// controls whether the extension is on or not
var on = true;

// var mainSearchList = [
//     {str: 'exit', fcn: SL_exit, args: []},
//     {str: 'go to link', fcn: SL_goToLink, args: []}
// ];

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
        console.log('   STOPPED: is typing');
        return;
    }

    handleKeyPress(event);
}, true);

window.addEventListener('keyup', (event) => {
    if (event.key === 'd' || event.key === 'e') {
        decScroll();
    }

    // console.log(keys);
}, true);

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

    } else if (event.key === 'j') {
        makeCmdOverlay();
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
    textOverlay.style.color = 'black';
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

function getLinks() {
    var links = document.getElementsByTagName('a');
    
    // construct hash table to elinimate identical links
    var linkMap = {};
    for (var link of links) {
        linkMap[link.href] = link.textContent;
    }

    // turn into list
    var res = [];
    for (var link in linkMap) {
        res.push({
            href: link,
            text: linkMap[link]
        });
    }

    return res;
}

function fuzzyComp(a, b) {
    // search for a in b
    var ai = 0;
    for (var bi = 0; bi < b.length && ai < a.length; bi++) {
        if (a[ai] == b[bi]) ai++;
    }
    return ai;
}

function fuzzySearch(strings, query) {
    strings = strings.map(s => s.toLowerCase());
    query = query.toLowerCase();

    var res = [];

    for (var i = 0; i < strings.length; i++) {
        var src = strings[i];

        // search for query in string
        var queryScore = fuzzyComp(query, src);

        // search for source in query
        var srcScore = fuzzyComp(src, query);

        // console.log(
        //     'Search for "'+query+'" in "'+src+
        //     '" for score '+queryScore+'/'+query.length+
        //     ' and '+srcScore+'/'+src.length);

        // res.push({
        //     'index': i,
        //     'queryScore': queryScore / query.length,
        //     'srcScore': srcScore / src.length
        // });

        res.push({
            'index': i,
            'queryScore': queryScore,
            'srcScore': srcScore
        });
    }

    return res;
}

function topResults(strings, query) {
    var scores = fuzzySearch(strings, query);

    // remove zero scores
    scores = scores.filter(s => {
        return s.queryScore !== 0 || s.srcScore !== 0;
    });

    // pr(scores);

    // sort the scores
    scores = scores.sort((a,b) => {
        if (a.queryScore === b.queryScore) {
            return b.srcScore - a.srcScore;
        }
        return b.queryScore - a.queryScore;
    });

    // pr(scores);

    // extract the indexes
    scores = scores.map(s => s.index);

    return scores;
}

// function SL_subParse(str, i, searchList) {
//     // try to find an absolute match for the first characters of str in searchList
//     for (var sli = 0; sli < searchList.length; sli++) {
//         var searchStr = searchList[sli].str;
//         for (var si = 0; si < searchStr.length && i < str.length; si++) {
//             // strings do not match
//             if (searchStr[si] !== str[i]) {
//                 break;
//             }
//             i++;
//         }
//         if (si === searchStr.length) {
//             // found perfect match at index sli
//             var nextSearchList = searchList[sli].fcn(...searchList[sli].args);
//             if (nextSearchList === undefined) {
//                 // end command executed, so clean up
//                 removeCmdOverlay();
//             } else {
//                 reutrn SL_subParse(str, i, nextSearchList);
//             }

//             return;
//         }
//     }
// }