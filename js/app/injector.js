myApp.factory('injector', function() {
    
            var injectorFunction;

            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                console.log('into onMessage');
                injectorFunction(request);
            });
            
    return {
        "extract": function(codeToInject, mainWindow, tabid, callback) {
            injectorFunction = callback;
            
            var code = "var result = {};";
            code += codeToInject;
            code += "chrome.runtime.sendMessage(result);";
            chrome.tabs.executeScript(tabid, {file:'../lib/jquery.min.js'}, function() {
                chrome.tabs.executeScript(tabid, {
                    code: code
                })
            });
        }
    }
});