myApp.factory('modelService', function() {
  var service = {
    getId : function (collection) {
      var result = new Array();
      for (var i = 0; i < collection.length; i++) {
        var item = collection[i];
        if (result.indexOf(item.id) == -1) {
          result.push(item.id);
        }
        if (item.hasOwnProperty("items") && angular.isArray(item.items)) {
          for (var j = 0; j < item.items.length; j++) {
            var subItem = item.items[j];
            if (result.indexOf(subItem) == -1) {
              result.push(subItem);
            }
          }
        }
      }
      return result;
    }
  };
  return service;
});
