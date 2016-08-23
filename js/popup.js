var bgPage = chrome.extension.getBackgroundPage();
// TODO use jQuery
var monitorElem = document.getElementById("monitorSelect");
var realtorsElem = document.getElementById("realtorsCheckbox");
var tabCountElem = document.getElementById("tabCount");

var clearNode = function(node) {
	while (node.firstChild) {
	    node.removeChild(node.firstChild);
	}
}

var updateTabCount = function() {
	clearNode(tabCountElem);
	var tabCount = Object.keys(bgPage.club).length;
	tabCountElem.appendChild(document.createTextNode(tabCount));
}

updateTabCount();

chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
	var tabId = tabArray[0].id;
	var patron = bgPage.club[tabId];
	monitorElem.value = patron === undefined ? 0 : patron.seconds;
	realtorsElem.checked = patron === undefined || patron.realtors;
	var updatePatron = function() {
		request = {
			type: 'monitor',
			tabId: tabId,
			seconds: parseInt(monitorElem.value),
			realtors: realtorsElem.checked,
		};
		chrome.runtime.sendMessage(request, function(response) {
			if (!("monitorSet" in response)) return;
			updateTabCount();
		});
	};
	monitorElem.addEventListener("change", updatePatron);
	realtorsElem.addEventListener("change", updatePatron);
});
