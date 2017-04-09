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
.directive('textcomplete', ['Textcomplete', function(Textcomplete) {
    return {
        restrict: 'EA',
        scope: {
            model: '='
        },
        template: '<textarea ng-model=\'model.currentjson\' name=\'jsonitem\' type=\'text\' hasid></textarea>',
        link: function(scope, iElement, iAttrs) {

            var ta = iElement.find('textarea');
            var textcomplete = new Textcomplete(ta, [
              {
                match: /("id"\s*:\s*)(\w*)$/,
                search: function(term, callback) {
                    callback($.map(scope.model.items, function(item) {
                        return item.id.toLowerCase().indexOf(term.toLowerCase()) === 0 ? item.id : null;
                    }));
                },
                index: 2,
                replace: function(mention) {
                    return '$1"' + mention + '"';
                }
              }
            ]);

            $(textcomplete).on({
              'textComplete:select': function (e, value) {
                scope.$apply(function() {
                  scope.model.currentjson = value
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
