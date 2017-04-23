myApp.directive('dynamic', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
	  scope.$watch(attrs.dynamic, function(html) {
	     ele.html(html);
        $compile(ele.contents())(scope);
      });
    }
  };
});

myApp.directive('hasid', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ctrl) {
		 /* désactive la validation pour les objects avec tableau qui n'ont pas d'ID */
		 ctrl.$validators.hasid = function(value) {
			if (value == undefined) {
				return true;
			} else {
				try {
					var obj = JSON.parse(value);
				} catch (Ex) {
					return false;
				}
				return obj.hasOwnProperty("id");
			}
		 };
        }
    };
})
.directive('textcomplete', ['Textcomplete', 'modelService', function(Textcomplete, modelService) {
    return {
        restrict: 'EA',
		require: 'ngModel',
		scope : {
			itemList : '=textcompleteItemList',
			idProperty : '@textcompleteValueProperty',
			model: '=ngModel'
		},
        link: function(scope, iElement, iAttrs, ngModel) {

            var ta = iElement;
            var textcomplete = new Textcomplete(ta, [
              {
                match: /("id"\s*:\s*)(\w*)$/,
                search: function(term, callback) {
                  var ids = modelService.getId(scope.itemList);
                  callback($.map(ids, function (word) {
                    return word.indexOf(term) === 0 ? word : null;
                  }));
					        // callback($.map(scope.itemList, function(item) {
						      //   var val = item[scope.idProperty];
                  //   return val.toLowerCase().indexOf(term.toLowerCase()) === 0 ? val : null;
                  // }));
                },
                index: 2,
                replace: function(mention) {
                    return '$1"' + mention + '"';
                }
              },
              {
                match: /("items"\s*:\s*\[\s*(?:"\w+",\s*)*)(\w*)$/,
                search: function(term, callback) {
                  var ids = modelService.getId(scope.itemList);
                  callback($.map(ids, function (word) {
                    return word.indexOf(term) === 0 ? word : null;
                  }));
                },
                index:2,// la sous-expression a transmettre à search
                replace : function (mention) {
                  // la sous-expression utilisée par string.replace dans la partie pre
                  return '$1"' + mention + '"';
                }
              }
            ]);

            $(textcomplete).on({
              'textComplete:select': function (e, value) {
                scope.$apply(function() {
                  scope.model = value;
                })
              },
              'textComplete:show': function (e) {
                $(this).data('autocompleting', true);
              },
              'textComplete:hide': function (e) {
                $(this).data('autocompleting', false);
              }
            });
        }
    }
}]);

/*
 * Use flte like this | intersect: 'frandroid_meilleurs_moins_5_pouces'
 */
myApp.filter('intersect', function () {
  return function(input, property) {
    return input.filter(function(element){return element.hasOwnProperty(property)});
  };
});
