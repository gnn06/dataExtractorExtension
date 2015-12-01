myApp.factory('injector', function() {
    
    return {
        "extract": function(codeToInject, mainWindow, callback) {
            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                console.log('into onMessage');
                callback(request);
            });
            
            var code = "var result = {};";
            code += codeToInject;
            code += "chrome.runtime.sendMessage(result);";
            chrome.tabs.query({active:true, windowId : mainWindow}, function(tab) {
                var tabid = tab[0].id;
                chrome.tabs.executeScript(tabid, {file:'../lib/jquery.min.js'}, function() {
                  chrome.tabs.executeScript(tabid, {
                    code: code
                  })
                });
                //if ($scope.extractor.urlpattern == undefined) {
                //    $scope.extractor.urlexample = tab[0].url;
                //    $scope.extractor.urlpattern = tab[0].url;
                //    $scope.$apply();
                //}
            });
        }
    }
});