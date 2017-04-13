myApp.factory('injector', function() {

  // use tabCallBacks to call extract function several time at once.
  var tabCallBacks = new Array(0);

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // console.log('into onMessage');
    var callback = tabCallBacks[sender.tab.id];
    if (callback == null) {
      console.error('no callback function');
    }
    callback(request);
    tabCallBacks[sender.tab.id] = null;
  });


  return {
    "extract": function(codeToInject, mainWindow, tabid, callback) {
      tabCallBacks[tabid] = callback;

      var code = "console.log('injected code');var result = {};";
      code += codeToInject;
      code += "chrome.runtime.sendMessage(result);";
      /* jquery.min.js doit être à la racine de l'extension */
      chrome.tabs.executeScript(tabid, {file : 'js/contentscript/jquery.min.js'}, function() {
        chrome.tabs.executeScript(tabid, {
          code: code
        })
      }
    );
  }
}
});
