chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if ("pingRequest" in request) {
		sendResponse({pongResponse: true});
		return;
	}
	if (!("extractRent" in request)) return;
	var nodes = document.getElementsByClassName('feed_item')
	var urlsNow = [];
	for (var i = 0; i < nodes.length; ++i) {
		var item_id = nodes[i].getAttribute('item-id')
		if (!item_id || (nodes[i].classList.contains('agency') && !request.extractRent.realtors))
			continue
		var url = "https://www.yad2.co.il/item/" + item_id;
		urlsNow.push(url);
	}
	urlsNow = Array.from(new Set(urlsNow)).sort();
	var extractVals = {
		urls: urlsNow,
		queryUrl: window.location.href,
		inspectDate: (new Date()).toString(),
	};
	sendResponse({extractRentDone: extractVals});
});
