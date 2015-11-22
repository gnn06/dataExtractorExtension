myApp.controller('universCtrl', ["$scope", "storage", function ($scope, storage) {
 
  storage.readUniver(function(result) {
	  if (result != null) {
		$scope.univers = result;
		$scope.$apply();
	  }
  });  
}]);

myApp.controller('dataExtractorCtrl', ["$scope", "$compile", "storage", "merge", "$routeParams", function ($scope, $compile, storage, merge, $routeParams) {
 
  $scope.dataSource = $routeParams.univer;
  // currentIndex = -1 permet d'ajouter immÃƒÂ©diatement un item ÃƒÂ  la liste
  $scope.model = { 
	items : [], 
	template : "", 
	currentIndex : -1
  };
  
  
  $scope.read = function() {
	  
	// need to use [] acces to properties to make key dynamic
	var dataSource = $scope.dataSource;
	storage.readItems(dataSource, function(result) {
		if (result != null) {
			$scope.model.items = result;
			$scope.IOmessage = $scope.model.items.length + "item(s) readed";
			/* apply necessary because we are into a callback */
			$scope.$apply();
		}
	});
	storage.readTemplate(dataSource, function(result){
		if (result != null) {
			$scope.model.template = result;
			$scope.IOmessage += " template readed";
			/* apply necessary because we are into a callback */
			$scope.$apply();
		}
	});
  };
  
  $scope.write = function () {
	var dataSource = $scope.dataSource;
	var items = $scope.items;
	storage.writeItems(dataSource, items, function(result) {
		if (result == "SUCCESS") {
			$scope.IOmessage = "write succesful";
			$scope.$apply();
		}
	});
	storage.writeTemplate(dataSource, $scope.model.template, function(result){
		if (result == "success") {
			$scope.IOmessage = "write succesful";
		} else {
			$scope.IOmessage = "write error";
		}
		// issue because form is now into a tab
		//$scope.templateForm.$setPristine();
		$scope.$apply();
	});
  };
  
  $scope.view = function (index) {
	  $scope.currentIndex = index;
	  $scope.currentItem = $scope.items[index];
  };
  
  $scope.open = function (index) {
	  var newURL = $scope.items[index].url;
	  chrome.tabs.create({ url: newURL });  
  };
  
  $scope.delete = function (index) {
	  $scope.items.splice(index, 1);
  };
    
  $scope.extract = function () {
	// var temp = { title : "temp"};
	// $scope.currentItem = temp;
	// return;
	var BP = chrome.extension.getBackgroundPage();
	var mainWindow = BP.mainWindow;
	
	chrome.tabs.query({active:true, windowId : mainWindow}, function(tab)
						  {
		var url = tab[0].url;
		chrome.tabs.sendRequest(
			tab[0].id, {/* request */},
			function(response) {
				response.response.url = url;
				$scope.$apply($scope.currentItem = response.response);
				$scope.$apply($scope.currentIndex = -1)
			}
		);						  });
  };
  
  $scope.commit = function () {
	  if ($scope.currentIndex != -1) {
			$scope.items[$scope.currentIndex] = $scope.currentItem;
	  } else {
			if ($scope.items == undefined) {
				$scope.items = new Array();
			}
			$scope.items.push($scope.currentItem);
			$scope.currentIndex = $scope.items.length - 1;
	  }
	  $scope.IOmessage = "commited";
  };
  
  $scope.merge = function () {
	console.log("merge function");

	// mergeTwoCollections(function(result){

	//});

	var result = merge.mergeCollection($scope.items);

	$scope.mergeItems = result;
  };

  /* initialise items and template */
  $scope.read();
  
  $scope.$watch("items", $scope.merge, true);
  
}]);

myApp.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when("/univers/", {
	templateUrl : "univers.html",
	controller : "universCtrl"
  })
  .when("/univers/:univer", {
	templateUrl : "index.html",
	controller : "dataExtractorCtrl"
  })
  .otherwise({redirectTo: '/univers/'});
});

/* needed to make href without unsafe
 * cf https://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page/15769779#15769779
 */
myApp.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);
