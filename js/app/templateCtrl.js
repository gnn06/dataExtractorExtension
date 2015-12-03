myApp.controller('templateCtrl', ["$scope", "storage", "merge", "$routeParams", '$timeout', function ($scope, storage, merge, $routeParams, $timeout) {
 
  $scope.dataSource = $routeParams.univer;
  
  $scope.read = function() {	  
	// need to use [] acces to properties to make key dynamic
	var dataSource = $scope.dataSource;
	storage.readItems(dataSource, function(result) {
		if (result != null) {
			$scope.nbItems = result.length;
			$scope.mergeItems = merge.mergeCollection(result);
			$scope.$apply();
		}
	});
	storage.readTemplate(dataSource, function(result){
		if (result != null) {
			$scope.template = result;
			$scope.$apply();
		}
	});
  };
  
  /*$scope.write = function () {
	var dataSource = $scope.dataSource;
	storage.writeTemplate(dataSource, $scope.template, function (result){
		if (result == "SUCCESS") {
			$scope.IOmessage = "write succesful";
		} else {
			$scope.IOmessage = "write error";
		}
		// issue because form is now into a tab
		//$scope.templateForm.$setPristine();
		$scope.$apply();
	});
  };*/
  
  $scope.merge = function () {
	console.log("merge function");
	var result = merge.mergeCollection($scope.items);
	$scope.mergeItems = result;
  };

  var savePromiseTemplate = null;
  $scope.$watch("template", function() {
      if (savePromiseTemplate != null)  {
		   $timeout.cancel(savePromiseTemplate);
	  }
	  savePromiseTemplate = $timeout(function(){
		  console.log('template autosaved');
		  savePromiseTemplate = null;
		  storage.writeTemplate($scope.dataSource, $scope.template, function(result) {
			if (result == "SUCCESS") {
				$scope.writeSuccess = true;
				$scope.templateForm.$setPristine();
				$scope.$apply();
			}
		  });
	}, 3000); 
  });
  
  /* initialise items and template */
  $scope.read();
  
}]);