chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (!("extractRent" in request)) return;
	var nodes = document.querySelectorAll('*[onclick*="NadlanID"]');
	var urlsNow = [];
	for (var i = 0; i < nodes.length; ++i) {
		var onClickAttrib = nodes[i].getAttribute("onclick");
		var groups = /([a-zA-Z]*)Details.php','NadlanID','([0-9a-f]+)'/.exec(onClickAttrib);
		if (!groups) continue;
		if (["tivsales", "tivrent"].indexOf(groups[1]) != -1 && !request.extractRent.realtors) continue;
		var url = "http://www.yad2.co.il/Nadlan/" + groups[1] + "_info.php?NadlanID=" + groups[2];
		urlsNow[urlsNow.length] = url;
	}
	urlsNow = Array.from(new Set(urlsNow)).sort();
	var extractVals = {
		urls: urlsNow,
		queryUrl: window.location.href,
		inspectDate: (new Date()).toString(),
	};
	sendResponse({extractRentDone: extractVals});
});
