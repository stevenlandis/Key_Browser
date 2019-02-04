var cmdOverlay = {};
/*  Structure:
        overlay: whole thing
        box: element that stores all the interesting bits
*/

var commands = {}

function addCommand(name, callback) {
    commands[name] = {
        name: name,
        callback: callback
    };
}

addCommand('stuff', ()=>{});
addCommand('and', ()=>{});
addCommand('things', ()=>{});
addCommand('stuff and things', ()=>{});
addCommand('go to link', () => {
    // pr('going to link');
    var links = getLinks();
    pr(links);
    return links.map(l => {
        return {
            href: l.href,
            name: l.text,
            callback: ()=>{
                window.open(l.href, '_self');
            }
        };
    });
});
addCommand('exit', () => {
    removeCmdOverlay();
});

function isAlphaNumeric(c) {
    return /[a-zA-Z0-9]/.test(c)
}

function processString(txt) {
    var makeNewStr = true;
    var prevLower = true;
    var res = [];

    for (var c of txt) {
        if (isAlphaNumeric(c)) {
            if (/[A-Z]/.test(c) && prevLower) {
                makeNewStr = true;
            }

            if (makeNewStr) {
                res.push('');
                makeNewStr = false;
            }
            res[res.length-1] += c.toLowerCase();
            prevLower = /[a-z]/.test(c)
        } else {
            makeNewStr = true;
            prevLower = false;
        }
    }

    return res;
}

function startString(processedTxt) {
    return processedTxt.map(s => s[0]).join('');
}

var startSearchTerms = [
    'stuff',
    'and',
    'things',
    'stuff and things',
    'go to link',
    'exit'
].map(name => commands[name]);
var searchTerms = startSearchTerms;

function makeCmdOverlay() {
    if (cmdOverlay.overlay !== undefined) {
        // overlay already exists
        return;
    }
    searchTerms = startSearchTerms;

    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = 0;
    overlay.style.right = 0;
    overlay.style.top = 0;
    overlay.style.bottom = 0;
    overlay.style.zIndex = getMaxZLevel() + 1;
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    var box = document.createElement('div');
    box.style.width = '500px';
    box.style.height = 'auto';
    box.style.margin = 'auto';
    box.style.padding = '7px';
    // box.style.boxSizing = 'border-box';
    box.style.backgroundColor = 'lightGrey';
    overlay.appendChild(box);

    var execBar = document.createElement('div');
    // execBar.style.marginBottom = '7px';
    var str = document.createElement('div');
    str.textContent = '>>';
    str.style.display = 'inline-block';
    str.style.padding = '3px';
    str.style.backgroundColor = '#a6a6a6';
    str.style.borderRadius = '5px';
    str.style.marginBottom = '7px';
    str.style.marginRight = '7px';
    execBar.appendChild(str);
    box.appendChild(execBar);

    // var execBar = document.createElement('div');
    // execBar.style.display = 'inline-block';
    // execDiv.appendChild(execBar);

    var searchElem = document.createElement('div');
    searchElem.style.width = 'auto';
    searchElem.style.height = 'auto';
    searchElem.style.margin = 'auto';
    searchElem.style.backgroundColor = 'white';
    searchElem.contentEditable = true;
    searchElem.style.fontSize = '30px';
    searchElem.style.textOverflow = 'clip';
    searchElem.style.outline = 'none';
    searchElem.addEventListener('input', onCmdOverlayType, false);
    searchElem.addEventListener('keydown', onCmdOverlayPress);
    box.appendChild(searchElem);

    document.body.appendChild(overlay);

    // add objects to global object
    cmdOverlay.overlay = overlay;
    cmdOverlay.box = box;
    cmdOverlay.searchElem = searchElem;
    cmdOverlay.execBar = execBar;

    // focus the search bar after 1 ms instead of immediately
    // to prevent the triggering key press from also counting
    // as a typed key in the search bar
    setTimeout(() => {searchElem.focus();}, 1);
}

function onCmdOverlayType(event) {
    // console.log(cmdOverlay.searchElem.textContent);
    var res = topResults(
        searchTerms.map(e => e.name),
        cmdOverlay.searchElem.textContent);
    results = res.map(i => searchTerms[i]);

    setSearchResults(results);
}

function addExec(txt) {
    var newDiv = document.createElement('div');
    newDiv.style.display = 'inline-block';
    newDiv.style.padding = '3px';
    newDiv.style.backgroundColor = '#96b697';
    newDiv.style.borderRadius = '5px';
    newDiv.style.marginRight = '7px';
    newDiv.style.marginBottom = '7px';
    newDiv.textContent = txt;
    cmdOverlay.execBar.appendChild(newDiv);
}

function onCmdOverlayPress(event) {
    // handle special key presses
    if (
            event.key === 'Tab' ||
            event.key === 'Enter'
    ) {
        event.preventDefault();
    } else if (event.key === 'Escape') {
        removeCmdOverlay();
    } else if (event.key === ' ') {
        event.preventDefault();

        // get top result
        var res = topResults(
            searchTerms.map(e => e.name),
            cmdOverlay.searchElem.textContent);
        if (res.length > 0) {
            var topResult = searchTerms[res[0]];
            var newTerms = topResult.callback();

            // make sure callback didn't close the overlay
            if (cmdOverlay.overlay === undefined) {
                return;
            }

            pr(newTerms);

            if (newTerms === undefined) {
                while (cmdOverlay.execBar.childElementCount > 1) {
                    cmdOverlay.execBar.removeChild(cmdOverlay.execBar.lastChild);
                }
                searchTerms = startSearchTerms;
            } else {
                addExec(searchTerms[res[0]].name);
                searchTerms = newTerms;
            }

            setSearchResults([]);
        }
        cmdOverlay.searchElem.textContent = '';
    } else if (event.key === 'Backspace') {
        // if (cmdOverlay.searchElem.textContent.length == 0) {
        //     // try deleting from execs
        //     if (cmdOverlay.execBar.childElementCount > 1) {
        //         cmdOverlay.execBar.removeChild(cmdOverlay.execBar.lastChild);
        //     }
        // }
    }
}

function setSearchResults(results) {
    if (cmdOverlay.searchResults === undefined) {
        if (results.length > 0) {
            // create the search results box
            var searchResults = document.createElement('div');
            searchResults.style.width = '500px';
            searchResults.style.height =  'auto';
            // searchResults.style.margin = 'auto';
            searchResults.style.marginTop = '7px';
            searchResults.style.backgroundColor = 'white';
            cmdOverlay.box.appendChild(searchResults);
            cmdOverlay.searchResults = searchResults;
        } else {
            return;
        }
    } else {
        if (results.length > 0) {
            // clear all existing results
            delChildren(cmdOverlay.searchResults);
        } else {
            cmdOverlay.box.removeChild(cmdOverlay.searchResults);
            cmdOverlay.searchResults = undefined;
            return;
        }
    }

    // add the new results
    for (var s of results) {
        var newE = document.createElement('div');
        newE.textContent = s.name;
        cmdOverlay.searchResults.appendChild(newE);
    }
}

function removeCmdOverlay() {
    if (cmdOverlay.overlay !== undefined) {
        // delete the entire overlay
        cmdOverlay.overlay.parentNode.removeChild(cmdOverlay.overlay);

        // set variables back to undefined
        cmdOverlay = {};
    }
}

function delChildren(elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }
}