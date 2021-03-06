var tabN = 0;
var tabChar = "   "

// print
function pr(text) {
	if (tabN === 0) {
		console.log(text);
		return;
	}
	text = ""+text;
	var tabText = "";
	for (var i = 0; i < tabN; i++) {
		tabText += tabChar;
	}
	console.log(tabText + text.replace(/\n/g, "\n" + tabText));
}

// increase indent
function pi() {
	tabN++;
}

// decrease indent
function pd() {
	if (tabN > 0) {
		tabN--;
	}
}

// redundant, should use console.assert instead
function assert(a) {
	if (!a) {
		throw Error('Assert Failed');
	}
}

// start a grouped section
function pg(title) {
	console.groupCollapsed(title);
}

function pw(text) {
	console.warn(text);
}

// end a grouped section
function pe() {
	console.groupEnd();
}