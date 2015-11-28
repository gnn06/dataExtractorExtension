var mainWindow = -1;
console.log("background script");
chrome.browserAction.onClicked.addListener(
	function (tab) {		
		console.log(tab);
		mainWindow = tab.windowId;
		var viewTabUrl = chrome.extension.getURL('image.html');
		chrome.windows.create({url: 'popup.html', type: 'popup'});
	}
);
