myApp.factory('storage', function() {
    
	// TODO sauvegarder le template dans l'univers
	
    var service = {    
        readItems : function  (dataSource, callback) {
            chrome.storage.local.get([dataSource + ".items"], function(objects) {
                if (chrome.runtime.lastError) {
                    console.log("get error");
                    callback(null);
                    return ;
                } else {
                    console.log("get succesful");
                    var result = objects[dataSource + ".items"];			
                    callback(result);
                }
            });
        },
        
        writeItems: function (dataSource, items, callback) {
            // var url = $window.location.ref;
            // var regExpResult = new RegExp("/https?://(.+)/").exec(url);
            // var pageSetID = regExpResult[0];
              
            var value = { };
            value[dataSource + ".items"] = items;
            chrome.storage.local.set(value, function() {
                // Notify that we saved.
                if (chrome.runtime.lastError) {
                    console.log('ERROR');
                    callback("ERROR");
                } else {
                    console.log('Settings saved');
                    callback("SUCCESS");
                }
            });
        },
        
        readTemplate : function (dataSource, callback) {
            chrome.storage.local.get([dataSource + ".template"], function(object) {
                if (chrome.runtime.lastError) {
                    console.log("template read error");
                    callback(null);
                } else {
                    console.log("template read succesful");
                    var result = object[dataSource + ".template"];
                    callback(result);
                }
            });
        },
        
        writeTemplate : function (dataSource, template, callback) {
            var value = { };
            value[dataSource + ".template"] = template;
            chrome.storage.local.set(value, function() {
                // Notify that we saved.*
                if (chrome.runtime.lastError) {
                    console.log('template write error');
                    callback("error");
                } else {
                    console.log('template write succesful');
                    callback("success");
                }
            });
        }
    };

  return service;
});