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

  function indexOfItem(itemToSearch) {
    for (var i = 0; i < $scope.model.items.length; i++) {
      var item = $scope.model.items[i];
      if (item == itemToSearch) {
        return i;
      }
    }
    return -1;
  }

  $scope.view = function (item) {
	  var index = indexOfItem(item);
	  $scope.model.currentIndex = index;
	  $scope.model.currentjson = JSON.stringify($scope.model.items[index], null, 2);
  };

  $scope.open = function (index) {
	  var newURL = index.url;
	  chrome.tabs.create({ url: newURL });
  };

  $scope.delete = function (item) {
	  $scope.model.items.splice(indexOfItem(item), 1);
  };

  $scope.commit = function () {
	  if ($scope.model.currentIndex != -1) {
			$scope.model.items[$scope.model.currentIndex] = JSON.parse($scope.model.currentjson);
	  } else {
			if ($scope.model.items == undefined) {
				$scope.model.items = new Array();
			}
			$scope.model.items.push(JSON.parse($scope.model.currentjson));
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
			if ($scope.model.currentIndex != undefined && $scope.model.currentIndex != -1 &&
                result.url != $scope.model.items[$scope.model.currentIndex].url){
				alert('La page courante ne correspond pas à la source de la donnée courante.');
				return;
			}
			$scope.model.currentjson = JSON.stringify(result, null, 2);
			$scope.$apply();
		})
  };

  $scope.extractTabs = function () {
    var BP = chrome.extension.getBackgroundPage();
    var mainWindow = BP.mainWindow;
    chrome.tabs.query({windowId : mainWindow}, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
        let url = tabs[i].url;
    	  let tabid = tabs[i].id;
    	  storage.readCodeByURL($scope.dataSource, url, function(result) {
      		injector.extract(result.code, mainWindow, tabid, function(result){
            result.url = url;
            var id = prompt("id à utiliser ?" + result.titre);
            result.id = id;
            $scope.model.items.push(result);
      			$scope.$apply();
      		});
    	  });
      }
    });
  };

  function searchItemByURL (url) {
    for (var i = 0; i < $scope.model.items.length; i++) {
      var item = $scope.model.items[i];
      if (item.url == url) {
        return i;
      }
    }
    return -1;
  }

  $scope.refreshTabs = function () {
    var BP = chrome.extension.getBackgroundPage();
    var mainWindow = BP.mainWindow;
    chrome.tabs.query({windowId : mainWindow}, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
        let url = tabs[i].url;
    	  let tabid = tabs[i].id;
        storage.readCodeByURL($scope.dataSource, url, function(result) {
      		injector.extract(result.code, mainWindow, tabid, function(result) {
            var index = searchItemByURL(url);
            if (index != -1) {
              var temp = $scope.model.items[index]
              merge.refresh(temp, result);
              $scope.model.items[index] = temp;
              console.log('refresh for ' + url);
              if ($scope.model.currentIndex == index) {
                console.log('ui refresh');
                $scope.model.currentjson = JSON.stringify(temp, null, 2);
                $scope.$apply();
              }
            }
          });
        });
      }
    });
  };

  $scope.refreshAll = function () {
    var BP = chrome.extension.getBackgroundPage();
    var mainWindow = BP.mainWindow;
    for (let i = 0; i < $scope.model.items.length; i++) {
  		let newURL = $scope.model.items[i].url;
  		chrome.tabs.create({ url: newURL }, function (tab) {
        var url = tab.url;
    	  var tabid = tab.id;
        storage.readCodeByURL($scope.dataSource, url, function(result) {
      		injector.extract(result.code, mainWindow, tabid, function(result){
            var temp = {};
            merge.refresh(temp, $scope.model.items[i]);
            merge.refresh(temp, result);
            $scope.model.items[i] = temp;
            console.log('refresh for ' + newURL);
            if ($scope.model.currentIndex == i) {
              console.log('ui refresh');
              $scope.model.currentjson = JSON.stringify(temp, null, 2);
              $scope.$apply();
            }
            chrome.tabs.remove([tabid]);
        	});
    	  });
      });
    }
  };

  /**
   *  lance une recherche amazon avec le titre de tous les items
   */   
  $scope.searchAll = function () {
    var BP = chrome.extension.getBackgroundPage();
    var mainWindow = BP.mainWindow;
	// TODO amazon en dur
    storage.readCode($scope.dataSource, "amazonsmartphone", function(result) {
      var newURL = result.searchurlpattern;
      for (let i = 0; i < $scope.model.items.length; i++) {
        chrome.tabs.create({ url: newURL }, function(tab) {
          var tabid = tab.id;
          var toSearch = $scope.model.items[i].titre;
          var codeToInject = result.searchCode.repeat(1);
          codeToInject = codeToInject.replace("SEARCH", toSearch);
          injector.extract(codeToInject, mainWindow, tabid, function(result) {
          });
        });
      }
    });
  };

  $scope.create = function () {
	$scope.model.currentIndex = -1;
	$scope.model.currentjson = "";
  };

  /* initialise items and template */
  $scope.read();

  $scope.$watch("model.items", $scope.merge, true);

  var savePromiseItems = null;
  
  /**
   * obsolète, utile pour sauvegarde manuelle versus automatique
   */
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
  
  $scope.refreshJsonArea = function () {
	  console.log("dans refreshJsonArea");
	  var ctrl = $scope.myForm.jsonArea;
	  var modelValue = ctrl.$modelValue;
	  var viewValue  = ctrl.$viewValue;

      /** détermine la viewValue pour la modelValue actuelle.
	   *  Si different alors la view est désynchro, un refresh graphique est nécessaire.
	   *  Le controller de la jsonArea a pu être changé par l'input de l'ID.
	   *	 
	   *  Le listerner ngChange est lancé :
	   *    - après que le controller et le scope aient été mis à jour
	   *    - avant les $watch.		  
	   *	  
	   *  Copier-Coller de ngModelController.$watch
	   */	   
	  var formatters = ctrl.$formatters,
          idx = formatters.length;

      var viewValue = modelValue;
      while (idx--) {
        viewValue = formatters[idx](viewValue);
      }
      if (ctrl.$viewValue !== viewValue) {
        ctrl.$viewValue = ctrl.$$lastCommittedViewValue = viewValue;
        ctrl.$render();
		ctrl.$$runValidators(modelValue, viewValue, ctrl.noop);
	  }	  
  };
	 
}]);
