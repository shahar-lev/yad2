var yad2Store = {
	clear: function(callback) {
		chrome.runtime.sendMessage({type: 'clear'}, function(response) {
			if (!("clearDone" in response)) return;
			callback();
		});
	},
	update: function() {
		chrome.browserAction.setIcon({path: 'img/icon19.png'});
		$("#queries tr").not(":first").remove();
		$("#divUrls").empty();
		chrome.storage.local.get(['queries', 'urls'], function (items) {
			$("#queries").append($.map(items.queries, function(query) {
				var linkElem = $('<a>')
					.prop('href', query.url)
					.prop('target', '_blank')
					.text('Link');
				return $('<tr>')
					.append($('<td>').text(query.date))
					.append($('<td>').append(linkElem));
			}));
			$("#divUrls").append($.map(items.urls, function(url) {
				return [
				        $('<a>')
						.prop('href', url)
						.prop('target', '_blank')
						.text(url),
					$('<br>')];
			}));
		});
	}
};

yad2Store.update();

$("#refreshButton").on("click", yad2Store.update);

$("#clearButton").on("click", function () {
	var answer = window.confirm("Are you sure you want to clear all URLs?");
	if (answer) {
		yad2Store.clear(yad2Store.update);
	}
});

