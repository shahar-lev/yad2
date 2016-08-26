chrome.notifications.onClicked.addListener(function() {
	chrome.notifications.clear('Yad2Notification');
	window.open('yad2.htm');
});

var club = {};

var refreshStop = function(patron) {
	if (patron.handle !== undefined) {
		clearTimeout(patron.handle);
	}
	delete club[patron.tabId];
	patron.tabId = undefined;
	patron.seconds = 0;
	patron.handle = undefined;
};

var refreshStopByTabId = function(tabId) {
	var patron = club[tabId];
	if (patron === undefined) return;
	refreshStop(patron);
};

var storageUrls = undefined;
var storageQueries = undefined;

var refreshStart = function(patron) {
	if (patron.tabId === undefined) return;
	chrome.tabs.get(patron.tabId, function (tab) {
		if (patron.tabId === undefined) return;
		if (tab === undefined) {
			refreshStop(patron);
			return;
		}
		chrome.tabs.sendMessage(patron.tabId, {extractRent: {realtors: patron.realtors}}, function (response) {
			if (patron.tabId === undefined) return;
			if (response === undefined) {
				refreshStop(patron);
				return;
			}
			var extractVals = response.extractRentDone;
			if (extractVals === undefined) {
				refreshStop(patron);
				return;
			}
			var urlsDiff = extractVals.urls.filter(function(x) { return storageUrls.indexOf(x) < 0 });
			storageUrls = Array.from(new Set(urlsDiff)).sort().concat(storageUrls);
			var found = false;
			for (var i = 0; i < storageQueries.length; ++i) {
				var query = storageQueries[i];
				if (extractVals.queryUrl == query.url) {
					found = true;
					query.date = extractVals.inspectDate;
				}
			}
			if (!found) {
				storageQueries.unshift({
					url: extractVals.queryUrl,
					date: extractVals.inspectDate,
				});
			}
			var storageVals = {
				urls: storageUrls,
				queries: storageQueries,
			};
			chrome.storage.local.set(storageVals, function() {
				if (patron.tabId === undefined) return;
				if (urlsDiff.length > 0) {
					chrome.browserAction.setIcon({path: 'img/new.png'});
					chrome.notifications.create('Yad2Notification', {
						type: 'basic',
						iconUrl: 'img/icon128.png',
						title: 'Yad2 Barvaz',
						message: 'New URLs Found!',
						isClickable: true,
					});
				}
				patron.handle = setTimeout(refreshStart, patron.seconds * 1000, patron);
				console.log('Reloading tabId ' + patron.tabId + ' at ' + new Date());
				chrome.tabs.reload(patron.tabId);
			});
		});
	});
};

chrome.tabs.onRemoved.addListener(function (tabId) {
	refreshStopByTabId(tabId);
});

var handlers = {
	clear: function (request, sender, sendResponse) {
		storageUrls = [];
		storageQueries = [];
		chrome.storage.local.clear(function () {
			sendResponse({clearDone: true});
		});
		return true;
	},
	monitor: function (request, sender, sendResponse) {
		refreshStopByTabId(request.tabId);
		if (request.seconds == 0) {
			sendResponse({monitorSet: false});
			return;
		}
		patron = {
			tabId: request.tabId,
			seconds: request.seconds,
			realtors: request.realtors,
		};
		club[request.tabId] = patron;
		refreshStart(patron);
		sendResponse({monitorSet: true});
	},
};

var handleMessage = function (request, sender, sendResponse) {
	var handler = handlers[request.type];
	if (handler !== undefined)
		return handler(request, sender, sendResponse);
};

chrome.storage.local.get(['urls', 'queries'], function (items) {
	storageUrls = items['urls'] || [];
	storageQueries = items['queries'] || [];
	chrome.runtime.onMessage.addListener(handleMessage);
});
