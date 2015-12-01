myApp.controller('extractorListCtrl',
  ["$scope", 'storage', '$routeParams',
  function ($scope, storage, $routeParams) {
  
  $scope.univer = $routeParams.univer;
  
  $scope.read = function () {
	storage.readCodeList($routeParams.univer, function(result) {
		if (result != null) {
		  $scope.codes = result;
		  $scope.$apply();
		}
    });
  };
	
  $scope.read();
  
  $scope.delete = function (id) {
	storage.deleteCode($scope.univer, id, function(result) {});
	$scope.read();
  };
  
}]);

myApp.controller('extractorCtrl',
  ["$scope", '$timeout', 'storage', '$routeParams', 'injector',
  function ($scope, $timeout, storage, $routeParams, injector)
  {
	var BP = chrome.extension.getBackgroundPage();
	var mainWindow = BP.mainWindow;
    var oldId = null;
	
	$scope.univer = $routeParams.univer;
	// $routeParams.extractorId
	
	if ($routeParams.extractor != undefined) {
	  storage.readCode($scope.univer, $routeParams.extractor, function(result) {
		if (result != null) {
		  $scope.extractor = result;
		  oldId = $scope.extractorId;
		  $scope.$apply();
		}
	  });
	  $scope.extractorId = $routeParams.extractor;
	}

	$scope.write = function () {
	  storage.writeCode($scope.univer, $scope.extractorId, oldId, $scope.extractor, function(result) {
		if (result == "SUCCESS") {
		  oldId = $scope.extractorId;
		  $scope.myForm.$setPristine();
		  $scope.$apply();
		}
	  });
	};
	
	$scope.extract = function () {
	  var codeToInject = $scope.extractor.code;
	  injector.extract(codeToInject, mainWindow, function(result) {
		$scope.resultJSON = result;
        $scope.$apply();
	  });
	};

  }]

);