myApp.controller('dataCtrl',
  ["$scope", "$compile", "storage", "$routeParams", '$timeout',
   'injector', 'merge',
  function ($scope, $compile, storage, $routeParams, $timeout, injector, merge) {

  $scope.dataSource = $routeParams.univer;
  // currentIndex = -1 permet d'ajouter immédiatement un item à la liste
  $scope.model = {
	items : [],
	currentIndex : -1
  };

  $scope.read = function() {
	// need to use [] acces to properties to make key dynamic
	var dataSource = $scope.dataSource;
	storage.readItems(dataSource, function(result) {
		if (result != null) {
			$scope.model.items = result;
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
			$scope.writeSuccess = true;
			$scope.$apply();
		}
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

  function extract(callback) {
    var BP = chrome.extension.getBackgroundPage();
  	var mainWindow = BP.mainWindow;
  	chrome.tabs.query({active:true, windowId : mainWindow}, function(tab) {
      var url = tab[0].url;
  	  var tabid = tab[0].id;
  	  storage.readCodeByURL($scope.dataSource, url, function(result) {
    		injector.extract(result.code, mainWindow, tabid, function(result){
    		  result.url = url;
    		  callback(result);
    		});
  	  });
  	});
  }

  $scope.extract = function () {
	   extract(function(result){
			if ($scope.model.currentItem != null && result.url != $scope.model.currentItem.url){
				alert('La page courante ne correspond pas à la source de la donnée courante.');
				return;
			}
			$scope.model.currentItem = result;
			$scope.$apply();
		})
  };

  $scope.refresh = function () {
  	extract(function(result){
		  // console.log('into refresh callback');
  	  if ($scope.model.currentItem != null && result.url != $scope.model.currentItem.url){
          alert('La page courante ne correspond pas à la source de la donnée courante.');
  		    return;
      }
  	  var temp = {};
  	  merge.refresh(temp, $scope.model.currentItem);
  	  merge.refresh(temp, result);
  	  $scope.model.currentItem = temp;
  	  $scope.$apply();
  	});
  };

  $scope.refreshAll = function () {
    for (let i = 0; i < $scope.model.items.length; i++) {
  		var BP = chrome.extension.getBackgroundPage();
  		var mainWindow = BP.mainWindow;
  		let newURL = $scope.model.items[i].url;
  		chrome.tabs.create({ url: newURL }, function(tab){
  			var tabid = tab.id;
  			storage.readCodeByURL($scope.dataSource, newURL, function(result) {
  				injector.extract(result.code, mainWindow, tabid, function(result) {
  					result.url = newURL;
  					var temp = {};
  					merge.refresh(temp, $scope.model.items[i]);
  					merge.refresh(temp, result);
  					$scope.model.items[i] = temp;
  					console.log('refresh for ' + newURL);
  					chrome.tabs.remove([tabid]);
            if ($scope.model.currentIndex == i) {
              console.log('ui refresh');
              $scope.model.currentItem = temp;
              $scope.$apply();
            }
  				});
  			});
  		});
   }
  //  $scope.$apply();
  };

  $scope.create = function () {
	$scope.model.currentIndex = -1;
	$scope.model.currentItem = undefined;
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
				$scope.writeSuccess = true;
				$scope.myForm.$setPristine();
				$scope.$apply();
			}
		  });
	}, 3000, false);
  }, true);

}]);
