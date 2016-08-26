var bgPage = chrome.extension.getBackgroundPage();
var tabId = undefined;

var updatePatron = function() {
	request = {
		type: 'monitor',
		tabId: tabId,
		seconds: parseInt($("#monitorSelect").val()),
		realtors: $("#realtorsCheckbox").prop("checked"),
	};
	chrome.runtime.sendMessage(request, function(response) {
		if (response === undefined ||
		    response.monitorSet === undefined)
			return;
		updatePopup();
	});
};

var updatePopup = function() {
	$("#tabCount").text(Object.keys(bgPage.club).length);
	var patron = bgPage.club[tabId];
	$("#monitorSelect").val(patron === undefined ? 0 : patron.seconds);
	if (patron !== undefined)
		$("#realtorsCheckbox").prop("checked", patron.realtors);
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
		$("#monitorSelect").on("change", updatePatron);
		$("#realtorsCheckbox").on("change", updatePatron);
	});
};

chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
	tabId = tabArray[0].id;
	pingTab();
});
