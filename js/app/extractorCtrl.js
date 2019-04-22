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
  ["$scope", '$timeout', 'storage', 'clipboard', '$routeParams', 'injector',
  function ($scope, $timeout, storage, clipboard, $routeParams, injector)
  {
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
		  $scope.writeSuccess = true;
		  $scope.myForm.$setPristine();
		  $scope.$apply();
		}
	  });
	};

		function inject(codeToInject, func) {
			var BP = chrome.extension.getBackgroundPage();
			var mainWindow = BP.mainWindow;
			chrome.tabs.query({active:true, windowId : mainWindow}, function(tab) {
				injector.extract(codeToInject, mainWindow, tab[0].id, func);
			});
		}

		$scope.extract = function () {
			inject($scope.extractor.code, function(result/*request, sender, sendResponse*/) {
				$scope.resultObject = result;
				$scope.resultJSON = result;
				if ($scope.extractor.urlpattern == undefined) {
						$scope.extractor.urlexample = tab[0].url;
						$scope.extractor.urlpattern = tab[0].url;
						$scope.$apply();
				}
				$scope.$apply();
			});
		};

		$scope.copy = function () {
			clipboard.copyPromise($scope.resultJSON, navigator)
			.then(function() {
				console.log('Async: Copying to clipboard was successful!');
			}, function(err) {
				console.error('Async: Could not copy text: ', err);
			});
		};

		$scope.analyse = function () {
			var result = $scope.resultObject;
			var words = splitWords($scope.resultObject.title + " " + $scope.resultObject.text);
			eval($scope.extractor.codeAnalyse);
		};
	}]

);
