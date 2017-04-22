myApp.factory('merge', function() {
    var service = {
        /**
          *
          * @param []
          * @return merged collection
          * 1) Pour les items avec une propriété item de type tableau, la sous-collection
          *    est ajoutée à la fin de la collection. L'item n'est pas mergé. L'item
          *    est supprimé de la collection.
          * 2) Si deux items ont le même ID, le second est mergé au premier.
          *    le second est supprimé de la liste.
          */
        mergeCollection : function (collection) {
            var result = angular.copy(collection);

            for (var k  = 0; k < result.length; k++) {
                var parentItem = result[k];
				        // TODO gérer le nom de la propriète contenant les items
                if (parentItem.hasOwnProperty("items") && angular.isArray(parentItem.items)) {
                    for (var l = 0; l < parentItem.items.length; l++) {
                        var subItem = this.mergeSubItem(parentItem.items[l], parentItem.id, l + 1);
                        result = result.concat(subItem);
                    }
                    result.splice(k, 1);
                    k--;
                }
            }

            var found = false;
            for (var i  = 0; i < result.length - 1; i++) {
                var item1 = result[i];
                for (var j  = i + 1; j < result.length; j++) {
                    var item2 = result[j];
                    if (item1.id == item2.id) {
                        this.mergeTwoItems(item1, item2);
                        result.splice(j, 1);
                        j--;
                    }
                }
            }
            return result;
        },

        mergeSubItem (subItem, parentId, index) {
          var result = {};
          if (typeof subItem == "string") {
            result["id"] = subItem;
          }
          result[parentId] = index;
          return result;
        },

        /**
          * @obsolete
          */
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

        /**
         * utilisé pour rafraichir les objets.
         */
        refresh : function (dst, src) {
            for (var attrname in src) {
                dst[attrname] = src[attrname];
            }
            return dst;
        },

        /**
         * @obsolete
         */
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
