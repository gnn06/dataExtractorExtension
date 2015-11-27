myApp.controller('universCtrl', ["$scope", "storage", function ($scope, storage) {
 
  storage.readUniver(function(result) {
	  if (result != null) {
		$scope.univers = result;
		$scope.$apply();
	  }
  });  
}]);

myApp.controller('dataExtractorCtrl', ["$scope", "$compile", "storage", "merge", "$routeParams", '$timeout', function ($scope, $compile, storage, merge, $routeParams, $timeout) {
 
  $scope.dataSource = $routeParams.univer;
  // currentIndex = -1 permet d'ajouter immédiatement un item à la liste
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
	var items = $scope.model.items;
	storage.writeItems(dataSource, items, function(result) {
		if (result == "SUCCESS") {
			$scope.IOmessage = "write succesful";
			$scope.$apply();
		}
	});
	storage.writeTemplate(dataSource, $scope.model.template, function (result){
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
	  $scope.model.currentIndex = index;
	  $scope.model.currentItem = $scope.model.items[index];
  };
  
  $scope.open = function (index) {
	  var newURL = $scope.model.items[index].url;
	  chrome.tabs.create({ url: newURL });  
  };
  
  $scope.delete = function (index) {
	  $scope.model.items.splice(index, 1);
  };
    
  $scope.commit = function () {
	  if ($scope.model.currentIndex != -1) {
			$scope.model.items[$scope.model.currentIndex] = $scope.model.currentItem;
	  } else {
			if ($scope.model.items == undefined) {
				$scope.model.items = new Array();
			}
			$scope.model.items.push($scope.model.currentItem);
			$scope.model.currentIndex = $scope.model.items.length - 1;
	  }
	  $scope.IOmessage = "commited";
  };
  
  $scope.merge = function () {
	console.log("merge function");

	// mergeTwoCollections(function(result){

	//});

	var result = merge.mergeCollection($scope.model.items);

	$scope.mergeItems = result;
  };

  /* initialise items and template */
  $scope.read();
  
  $scope.$watch("model.items", $scope.merge, true);
  
  var savePromiseItems = null;
  $scope.$watch("model.items", function() {
      if (savePromiseItems != null)  {
		   $timeout.cancel(savePromiseItems);
	  }
	  savePromiseItems = $timeout(function(){
		  console.log('items autosaved');
		  savePromiseItems = null;
		  storage.writeItems($scope.dataSource, $scope.model.items, function(result) {
			if (result == "SUCCESS") {
				$scope.IOmessage = "write succesful";
				$scope.$apply();
			}
		  });
	}, 3000, false); 
  }, true);
  
  var savePromiseTemplate = null;
  $scope.$watch("model.template", function() {
      if (savePromiseTemplate != null)  {
		   $timeout.cancel(savePromiseTemplate);
	  }
	  savePromiseTemplate = $timeout(function(){
		  console.log('template autosaved');
		  savePromiseTemplate = null;
		  storage.writeTemplate($scope.dataSource, $scope.model.template, function(result) {
			if (result == "SUCCESS") {
				$scope.IOmessage = "write succesful";
				$scope.$apply();
			}
		  });
	}, 3000); 
  });
  
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
  .when("/extractors/", {
	templateUrl : "extractors.html",
	controller : "extractorCtrl"
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

myApp.controller('extractorCtrl', ["$scope", '$timeout', 'storage', function ($scope, $timeout, storage) {
  $scope.tabid = 546;
  $scope.scopeToInject = "var toto = ";
  $scope.extract = function () {
		// with no tabid, target = missed
		// with tabid, from global, target = OK
		// with tabid, from extract, target = OK
		var tabid = parseInt($scope.tabid);
		var codeToInject = $scope.codeToInject;
		var code = "var result = {};";
		code += codeToInject;
		code += "chrome.runtime.sendMessage(result);";
		chrome.tabs.executeScript(tabid, {file:'../lib/jquery.min.js'}, function() {
		  chrome.tabs.executeScript(tabid, {
			code: code
		  })
		});
	// var temp = { title : "temp"};
	// $scope.currentItem = temp;
	// return;
	//var BP = chrome.extension.getBackgroundPage();
	//var mainWindow = BP.mainWindow;
	
	//chrome.tabs.query({active:true, windowId : mainWindow}, function(tab) {
		//var url = tab[0].url;
		//chrome.tabs.sendRequest(
		//	tab[0].id, {/* request */},
		//	function(response) {
		//		response.response.url = url;
		//		$scope.$apply($scope.model.currentItem = response.response);
		//		$scope.$apply($scope.model.currentIndex = -1)
		//	}
		//);
		//chrome.tabs.executeScript(tab[0].id, {file:'../lib/jquery.min.js'}, function() {
		//  chrome.tabs.executeScript(tab[0].id, {
		//	code: 'console.log(\'injected code\');'
		//  });
		 //});
	//});
  };

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('into onMessage');
	$scope.resultJSON = request;
	$scope.$apply();
  });

  $scope.read = function () {
	storage.readCode($scope.url, function(result) {
		if (result != null) {
			$scope.codeToInject = result;
			$scope.$apply();
		}
    });
  };
	
  $scope.write = function () {
	storage.writeCode($scope.url, $scope.codeToInject, function(result) {
	  if (result == "SUCCESS") {
		  $scope.IOmessage = "write succesful";
		  $scope.$apply();
	  }
	});
  };
  
}]);