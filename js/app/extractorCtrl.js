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

	$scope.extract = function () {
	  var BP = chrome.extension.getBackgroundPage();
	  var mainWindow = BP.mainWindow;
	  chrome.tabs.query({active:true, windowId : mainWindow}, function(tab) {
  		var codeToInject = $scope.extractor.code;
  		injector.extract(codeToInject, mainWindow, tab[0].id, function(result/*request, sender, sendResponse*/) {
				$scope.resultObject = result;
				$scope.resultJSON = result;
  		  if ($scope.extractor.urlpattern == undefined) {
  		      $scope.extractor.urlexample = tab[0].url;
  		      $scope.extractor.urlpattern = tab[0].url;
  		      $scope.$apply();
  		  }
  		  $scope.$apply();
  		});
	  });
	};

		$scope.copy = function () {
			var text = objectToText($scope.resultJSON);
			navigator.clipboard.writeText(text).then(function() {
				console.log('Async: Copying to clipboard was successful!');
			}, function(err) {
				console.error('Async: Could not copy text: ', err);
			});
		};

		objectToText = function(obj) {
			return Object.values(obj).join("\t");
		};

		$scope.analyse = function () {
			console.log("goi");
		};
	}]

);
