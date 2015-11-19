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
		 	console.log(value);
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
});

