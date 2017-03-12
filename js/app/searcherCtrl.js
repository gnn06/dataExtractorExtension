myApp.controller('searcherListCtrl',
  ["$scope", 'storage', '$routeParams',
  function ($scope, storage, $routeParams) {

  $scope.univer = $routeParams.univer;

  $scope.read = function () {
  	storage.readSearcherList($routeParams.univer, function(result) {
  		if (result != null) {
  		  $scope.searchers = result;
  		  $scope.$apply();
  		}
    });
  };

  $scope.read();

  $scope.delete = function (id) {
	   storage.deleteSearch($scope.univer, id, function(result) {});
	   $scope.read();
  };

}]);

myApp.controller('searcherCtrl',
  ["$scope", '$timeout', 'storage', '$routeParams', 'injector',
  function ($scope, $timeout, storage, $routeParams, injector)
  {
    var oldId = null;

  	$scope.univer = $routeParams.univer;

    if ($routeParams.searcher != undefined) {
  	  storage.readSearcher($scope.univer, $routeParams.searcher, function(result) {
  		if (result != null) {
  		  $scope.searcher = result;
  		  oldId = $scope.seacherId;
  		  $scope.$apply();
  		}
  	  });
  	  $scope.searcherId = $routeParams.searcher;
  	}

    $scope.write = function () {
  	  storage.writeSearcher($scope.univer, $scope.searcherId, oldId, $scope.searcher, function(result) {
    		if (result == "SUCCESS") {
    		  oldId = $scope.searcherId;
    		  $scope.writeSuccess = true;
    		  $scope.myForm.$setPristine();
    		  $scope.$apply();
    		}
  	  });
  	};

    $scope.search = function () {
      var newURL = $scope.searcher.searchurlpattern;
      var itemsToSearch = $scope.itemsToSearch.split("\n");
      var BP = chrome.extension.getBackgroundPage();
      var mainWindow = BP.mainWindow;
      for (let i = 0; i < itemsToSearch.length; i++) {
        chrome.tabs.create({ url: newURL }, function(tab) {
          var tabid = tab.id;
          var codeToInject = $scope.searcher.searchCode;
          codeToInject = codeToInject.replace("SEARCH", itemsToSearch[i]);
          injector.extract(codeToInject, mainWindow, tabid, function(result) {
          });
        });
      }
    }
  }]

);
