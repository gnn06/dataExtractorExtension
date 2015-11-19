myApp.factory('merge', function() {
    var service = {
        mergeCollection : function (collection) {
            var found = false;
            var result = angular.copy(collection);
            for (var i  = 0; i < result.length - 1; i++) {
                var item1 = result[i];
                for (var j  = i + 1; j < result.length; j++) {
                    var item2 = result[j];
                    if (item1.id == item2.id) {
                        this.mergeTwoItems(item1, item2);
                        result.splice(j, 1);
                        break;
                    }
                }
            }
            for (var k  = 0; k < result.length; k++) {
                var item3 = result[k];
				// TODO gérer le nom de la propriète contenant les items
                if (item3.hasOwnProperty("items") && angular.isArray(item3.items)) {
                    for (var l = 0; l < item3.items.length; l++) {
                        var item4 = item3.items[l];
                        for (var m = 0; m < result.length; m++) {
                            var item5 = result[m];
                            if (item4.id == item5.id) {
                                this.mergeTwoItems(item5, item4);
                                item3.items.splice(l, 1);
                            }
                        }
                    }
                    result.splice(k, 1);
                    i--;
                }
            }
            return result;
        },
        
        mergeItemCollection : function (itemToMerge, collection) {
            var found = false;
            for (var i  = 0; i < collection.length; i++) {
                var item = collection[i];
                if (item.id == itemToMerge.id) {
                    this.mergeTwoItems(item, itemToMerge);
                    collection.slice(i);
                    return true;
                }
            }
            return false;
        },
        
        mergeTwoItems : function (item1, item2) {
            for (var attrname in item2) {
                if (item1.hasOwnProperty(attrname) == false) {
                    item1[attrname] = item2[attrname];
                }
            }
            return item1;
        },
        
        mergeTwoCollections : function (callback) {
            var zeperfs = null;
            var autoplus = null;
            readStorage("zeperfs", function(result) {zeperfs = result});
            readStorage("autoplus", function(result) {
                autoplus = result;
                var resultMerge = zeperfs.slice(0);
                for (var i = 0; i < resultMerge.length; i++) {
                    var ZI = resultMerge[i];
                    for (var j = 0; j < autoplus.length; j++) {
                        var AI = autoplus[j];
                        if (ZI.id == AI.id) {
                            for (var attrname in AI) {
                                if (ZI.hasOwnProperty(attrname) == false) {
                                    ZI[attrname] = AI[attrname];
                                }
                            }
                            autoplus.splice(j, 1);
                        }
                    }
                }
                callback(resultMerge);
            });
        }
    };
    return service;
});
