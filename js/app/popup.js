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
			$scope.IOmessage = "write succesful";
			$scope.$apply();
		}
	  });
	  if ($scope.new) {
        storage.readCodeList($scope.univer, function(result) {
		  result.push($scope.extractorId);
		  storage.writeCodeList($scope.univer, result, function(result){});
		});
		$scope.new = false;
      }
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
            $scope.extractor.url = tab[0].url;
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
