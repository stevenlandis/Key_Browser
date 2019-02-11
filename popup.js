var GRAY = 'rgb(199, 203, 209)';
var evaler = new BigEval();

document.addEventListener('DOMContentLoaded', () => {
    var input = document.getElementById('CommandInput');
    input.addEventListener('input', () => {
        // console.log(input.value);
        results.clear();
        var res = evaler.exec(input.value);
        console.log(res);
        if (res !== 'ERROR' && res !== undefined) {
            results.add(' = ' + res);
        }
    }, false);
    input.addEventListener('keydown', e => {
        // console.log(e);
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (e.key === 'ArrowUp') {
                results.changeFocused(results.focused-1);
            } else {
                results.changeFocused(results.focused+1);
            }
            e.preventDefault();
        }
    }, false);

    var results = new ResultList();
}, false);

class Command {
    constructor(name, callback) {
        this.name = name;
        this.callback = callback;

        this.words = name.split(' ');
        this.acronym = this.words.map(w=>w[0]).join('');
    }
}

class ResultList {
    constructor() {
        this.results = [];
        this.focused = 0;
        this.container = document.getElementById('ResultContainer');
    }

    clear() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.results = [];
        this.focused = 0;
    }

    add(txt) {
        var newElem = document.createElement('div');
        newElem.classList.add('Result');
        newElem.textContent = txt;
        this.results.push({
            text: txt,
            elem: newElem
        });
        if (this.results.length === 1) {
            this.markFocused();
        }
        this.container.appendChild(newElem);
    }

    markFocused() {
        this.results[this.focused].elem.style.background = GRAY;
    }

    unmarkFocused() {
        this.results[this.focused].elem.style.background = 'white';
    }

    changeFocused(n) {
        if (n < 0 || n >= this.results.length) {
            return;
        }

        this.unmarkFocused();
        this.focused = n;
        this.markFocused();
    }
}