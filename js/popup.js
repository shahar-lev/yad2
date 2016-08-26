var bgPage = chrome.extension.getBackgroundPage();
// TODO use jQuery
var monitorElem = document.getElementById("monitorSelect");
var realtorsElem = document.getElementById("realtorsCheckbox");
var tabCountElem = document.getElementById("tabCount");
var tabId = undefined;

var updatePatron = function() {
	request = {
		type: 'monitor',
		tabId: tabId,
		seconds: parseInt(monitorElem.value),
		realtors: realtorsElem.checked,
	};
	chrome.runtime.sendMessage(request, function(response) {
		if (response === undefined ||
		    response.monitorSet === undefined)
			return;
		updatePopup();
	});
};

var clearNode = function(node) {
	while (node.firstChild) {
	    node.removeChild(node.firstChild);
	}
};

var updatePopup = function() {
	clearNode(tabCountElem);
	var tabCount = Object.keys(bgPage.club).length;
	tabCountElem.appendChild(document.createTextNode(tabCount));
	var patron = bgPage.club[tabId];
	monitorElem.value = patron === undefined ? 0 : patron.seconds;
	if (patron !== undefined)
		realtorsElem.checked = patron.realtors;
};

var pingTab = function() {
	chrome.tabs.sendMessage(tabId, {pingRequest: true}, function (response) {
		if (response === undefined ||
		    response.pongResponse === undefined) {
			chrome.tabs.reload(tabId);
			window.close();
			return;
		}
		updatePopup();
		monitorElem.addEventListener("change", updatePatron);
		realtorsElem.addEventListener("change", updatePatron);
	});
};

chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
	tabId = tabArray[0].id;
	pingTab();
});
