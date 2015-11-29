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
  
}]);

myApp.controller('extractorCtrl',
  ["$scope", '$timeout', 'storage', '$routeParams',
  function ($scope, $timeout, storage, $routeParams)
  {
	var BP = chrome.extension.getBackgroundPage();
	var mainWindow = BP.mainWindow;
	
	$scope.univer = $routeParams.univer;
	$scope.extractorId = $routeParams.extractor;
	$scope.new = $routeParams.extractor == undefined;
	
	if ($routeParams.extractor != undefined) {
	  storage.readCode($scope.univer, $scope.extractorId, function(result) {
		if (result != null) {
		  $scope.extractor = result;
		  $scope.$apply();
		}
	  });
	}

	$scope.write = function () {
	  storage.writeCode($scope.univer, $scope.extractorId, $scope.extractor, function(result) {
		if (result == "SUCCESS") {
		  if ($scope.new) {
			storage.readCodeList($scope.univer, function(result) {
			  result.push($scope.extractorId);
			  storage.writeCodeList($scope.univer, result, function(result){});
			});
			$scope.new = false;
		  }
		  $scope.myForm.$setPristine();
		  $scope.IOmessage = "write succesful";
		  $scope.$apply();
		}
	  });
	};
	
	$scope.extract = function () {
	  var codeToInject = $scope.extractor.code;
	  var code = "var result = {};";
	  code += codeToInject;
	  code += "chrome.runtime.sendMessage(result);";
	  chrome.tabs.query({active:true, windowId : mainWindow}, function(tab) {
		var tabid = tab[0].id;
		chrome.tabs.executeScript(tabid, {file:'../lib/jquery.min.js'}, function() {
		  chrome.tabs.executeScript(tabid, {
			code: code
		  })
		});
		if ($scope.new) {
            $scope.extractor.urlexample = tab[0].url;
			$scope.extractor.urlpattern = tab[0].url;
			$scope.$apply();
        }
	  });
	};

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	  console.log('into onMessage');
	  $scope.resultJSON = request;
	  $scope.$apply();
	});  

  }]

);