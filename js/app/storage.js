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
                    callback("SUCCESS");
                }
            });
        },
        
        //---------------------------------------------------------------------
        
        readUniver : function (callback) {
            chrome.storage.local.get(["univers"], function(object) {
                if (chrome.runtime.lastError) {
                    console.log("univer read error");
                    callback(null);
                } else {
                    console.log("univer read succesful");
                    var result = object.univers;
                    callback(result);
                }
            });
        },
        
        writeUniver : function (univer, callback) {
            var service = this;
            this.read(null, "univers", function (result) {
                result.push(univer);
                service.write(null, "univers", result, callback);
            });
        },
        
        //---------------------------------------------------------------------
        
        readCodeList : function (dataSource, callback) {
            chrome.storage.local.get(null, function(objects) {
                var result = new Array();
                for (var attrname in objects) {
                    var i = attrname.indexOf(".code.");
                    var j = attrname.indexOf(dataSource);
                    if (i > -1 && j == 0) {
                        result.push(attrname.substring(i + 6));
                    }
                }
                if (result.length == 0) {
                    result = null;
                }
                callback(result);
            });
        },
        
        readCodeByURL : function (dataSource, url, callback) {
            chrome.storage.local.get(null, function(objects) {
                var result = new Array();
                for (var attrname in objects) {
                    var i = attrname.indexOf(".code.");
                    var j = attrname.indexOf(dataSource);
                    if (i > -1 && j == 0) {
                        var code = objects[attrname];
                        if (url.indexOf(code.urlpattern) > -1) {
                            callback(code);
                        }
                    }
                }
                if (result.length == 0) {
                    result = null;
                }
                callback(result);
            });
        },
        
        readCode : function (dataSource, id, callback) {
            this.read(dataSource, "code." + id, callback);
        },

        writeCode : function (univer, id, oldId, code, callback) {
            this.write(univer, "code." + id, code, callback);
            if (oldId != id) {
                this.deleteCode(univer, oldId, callback);
            }
        },
        
        deleteCode : function (univer, id, callback) {
            this.delete(univer, "code." + id, callback);
        },
        
        //---------------------------------------------------------------------

        read : function (dataSource, key, callback) {
            if (dataSource != null) {
                key = dataSource + "." + key;
            }
            chrome.storage.local.get([key], function(object) {
                if (chrome.runtime.lastError) {
                    console.log("template read error");
                    callback("ERROR");
                } else {
                    console.log("template read succesful");
                    var result = object[key];
                    callback(result);
                }
            });
        },
        
        write : function (dataSource, key, value, callback) {
            var valuePair = { };
            if (dataSource != null) {
                key = dataSource + "." + key;
            }
            valuePair[key] = value;
            chrome.storage.local.set(valuePair, function() {
                // Notify that we saved.*
                if (chrome.runtime.lastError) {
                    console.log('code write error');
                    callback("ERROR");
                } else {
                    console.log('code write succesful');
                    callback("SUCCESS");
                }
            });
        },
        
        delete : function (univer, key, callback) {
            chrome.storage.local.remove([univer + "." + key],
                function() {
                    if (chrome.runtime.lastError) {
                        console.log('delete write error');
                        callback("ERROR");
                    } else {
                        callback("SUCCESS");
                    }
                });
        }
        
	};

  return service;
});