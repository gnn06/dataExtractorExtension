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

myApp.directive('jsonText', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {
		 /* désactive la validation pour les objects avec tableau qui n'ont pas d'ID */
		 ngModel.$validators.id = function(value) {
      // nsole.log(value);
			if (value == undefined) {
				return true;
			} else {
				return value.hasOwnProperty("id");
			}
		 };
		 function into(input) {
			return JSON.parse(input);
          };
          function out(data) {
            return JSON.stringify(data, null, 2);
          };
          ngModel.$parsers.push(into);
          ngModel.$formatters.push(out);
        }
    };
})
.directive('textcomplete', ['Textcomplete', function(Textcomplete) {
    return {
        restrict: 'EA',
        scope: {
            model: '='
        },
        template: '<textarea ng-model=\'model.currentjson\' type=\'text\'></textarea>',
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
