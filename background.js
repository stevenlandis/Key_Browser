chrome.runtime.onInstalled.addListener(function() {
    console.log('just installed');

    // respond to content script requests
    // these are actions that the content script cannot execute
    chrome.runtime.onMessage.addListener(
        function(message, sender, callback) {
            console.log("message: " + message + ', id: ' + sender.tab.id + ', index: ' + sender.tab.index);

            // close the tab
            switch (message) {
            case 'close tab':
                console.log('closing the tab');
                chrome.tabs.remove([sender.tab.id]);
                break;
            case 'highlight left tab':
                console.log('highlighting left tab');
                highlight_left(sender.tab);
                break;
            case 'highlight right tab':
                console.log('highlighting right tab');
                highlight_right(sender.tab);
                break;
            case 'new tab':
                console.log('making a new tab');
                chrome.tabs.create({});
                break;
            }
        }
    );

    console.log('finished installing');
});

function highlight_left(tab) {
    // query tabs to get length
    chrome.tabs.query({'windowId': chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        console.log(tabs.length + ' tabs');
        leftTabI = posMod(tab.index-1, tabs.length);
        console.log('switching to tab: ' + leftTabI);
        chrome.tabs.highlight({'tabs': leftTabI});        
    });
}

function highlight_right(tab) {
    // query tabs to get length
    chrome.tabs.query({'windowId': chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        console.log(tabs.length + ' tabs');
        rightTabI = posMod(tab.index+1, tabs.length);
        console.log('switching to tab: ' + rightTabI);
        chrome.tabs.highlight({'tabs': rightTabI});        
    });
}

function get_tab_i(tabs, tabID) {
    currTabI = undefined;
    for (var tabI in tabs) {
        if (tabs[tabI].id === tabID) {
            currTabI = tabI;
        }
    }
    return currTabI;
}

function posMod(n, m) {
    n = n % m;
    if (n < 0) {
        n += m;
    }
    return n;
}