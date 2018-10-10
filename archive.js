function makeOverLay() {
    if (overlay === undefined) {
        var div = document.createElement('div');
        div.style.width = 'auto';
        div.style.height = 'auto';
        div.style.position = 'fixed';
        div.style.zIndex = getMaxZLevel() + 1;
        div.style.bottom = 0;
        div.style.right = 0;
        div.style.border = 'none';
        div.style.backgroundColor = 'LightGreen';


        var frame = document.createElement('iframe');
        frame.tabIndex = 0;
        frame.style.width = 'auto';
        frame.style.height = 'auto';
        frame.style.border = 'none';
        // frame.addEventListener('blur', (event) => {
        //     // removeOverlay();
        // });

        // add to body
        div.appendChild(frame);
        document.body.appendChild(div);

        // add event listeners
        frame.contentDocument.addEventListener('keydown', (event) => {
            event.stopPropagation();
            handleKeyPress(event);
        });

        frame.contentDocument.addEventListener('keyup', (event) => {
            if (event.key === 'd' || event.key === 'e') {
                decScroll();
            }
        });

        // remove margin from iframe's body
        frame.contentDocument.body.style.margin = '1px';

        // add text
        var txt = document.createElement('div');
        txt.textContent = 'Locked';
        frame.contentDocument.body.appendChild(txt);
    }
    
    // focus on the element
    document.activeElement.blur();
    frame.focus();
    // console.log(document.activeElement);
}

function removeOverlay() {
    if (overlay === undefined) return;

    // remove overlay
    overlay.parentNode.removeChild(overlay);
    overlay = undefined;
}