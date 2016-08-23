var clearNode = function(node) {
	while (node.firstChild) {
	    node.removeChild(node.firstChild);
	}
};

var appendText = function(node, text) {
	return node.appendChild(document.createTextNode(text));
};

var appendElement = function(node, name) {
	child = document.createElement(name);
	node.appendChild(child);
	return child;
};

var yad2Store = {
	clear: function(callback) {
		chrome.runtime.sendMessage({type: 'clear'}, function(response) {
			if (!("clearDone" in response)) return;
			callback();
		});
	},
	update: function() {
		chrome.browserAction.setIcon({path: 'img/icon19.png'});
		var queriesElem = document.getElementById('queries');
		var divUrls = document.getElementById('divUrls');
		clearNode(queriesElem);
		clearNode(divUrls);
		var tableHeaderElem = appendElement(queriesElem, 'tr');
		appendText(appendElement(tableHeaderElem, 'th'), 'Last Inspected');
		appendText(appendElement(tableHeaderElem, 'th'), 'URL');
		chrome.storage.local.get(['queries', 'urls'], function (items) {
			var queries = items['queries'];
			if (queries === undefined) queries = [];
			for (var i = 0; i < queries.length; ++i) {
				var query = queries[i];
				var rowElem = appendElement(queriesElem, 'tr');
				appendText(appendElement(rowElem, 'td'), query.date);
				var linkElement = appendElement(appendElement(rowElem, 'td'), 'a');
				linkElement.setAttribute('href', query.url);
				linkElement.setAttribute('target', '_blank');
				appendText(linkElement, 'Link');
			}
			var urls = items['urls'];
			if (urls === undefined) urls = [];
			for (var i = 0; i < urls.length; ++i) {
				var url = urls[i];
				if (i > 0)
					appendElement(divUrls, 'br');
				var urlElem = appendElement(divUrls, 'a');
				urlElem.setAttribute('href', url);
				urlElem.setAttribute('target', '_blank');
				appendText(urlElem, url);
			}
		});
	}
};

yad2Store.update();

document.getElementById("clearButton").addEventListener("click", function () {
	var answer = window.confirm("Are you sure you want to clear all URLs?");
	if (answer) {
		yad2Store.clear(yad2Store.update);
	}
});

