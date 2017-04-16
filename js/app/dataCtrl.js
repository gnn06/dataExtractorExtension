myApp.controller('dataCtrl',
  ["$scope", "$compile", "storage", "$routeParams", '$timeout',
   'injector', 'merge', "$uibModal", "$log", "$document",
  function ($scope, $compile, storage, $routeParams, $timeout, injector, merge, $uibModal, $log, $document) {

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

  /**
    * Extrait l'onglet en cours.
    * Uniquement si objet courant est celui de la page courante
    * Pas de merge. Ecrase l'objet courant. Ne modifie pas les items (besoin d'un commit).
    * Si aucun extractor dispo, fait une extraction manuelle.
    */
  $scope.extract = function () {
    var BP = chrome.extension.getBackgroundPage();
  	var mainWindow = BP.mainWindow;
  	chrome.tabs.query({active:true, windowId : mainWindow}, function(tab) {
      var url = tab[0].url;
      var tabid = tab[0].id;
      storage.readCodeByURL($scope.dataSource, url, function(result) {
        if (result == null) {
          /* si aucun extractor trouvé, génère juste un objet avec l'url */
          result = { url : url };
          $scope.model.currentjson = JSON.stringify(result, null, 2);
          $scope.$apply();
        } else {
          injector.extract(result.code, mainWindow, tabid, function(result){
            result.url = url;
            // TODO quid si l'objet est déjà extrait (merge ? écrasement ?)
            /* si objet extrait est celui en cours de visu alors stoppe le process */
            if ($scope.model.currentIndex != undefined && $scope.model.currentIndex != -1 &&
                result.url != $scope.model.items[$scope.model.currentIndex].url)
            {
              alert('La page courante ne correspond pas à la source de la donnée courante.');
              return;
            }
            $scope.model.currentjson = JSON.stringify(result, null, 2);
            $scope.$apply();
          });
        }
      });
    });
  };

  /**
    * Lancer une extraction de tous les onglets ouverts.
    * Si l'onglet a déjà été extrait, ne fait rien.
    * Les objets sont crés AVEC un id demandé en live.
    */
  $scope.extractTabs = function () {
    var BP = chrome.extension.getBackgroundPage();
    var mainWindow = BP.mainWindow;
    chrome.tabs.query({windowId : mainWindow}, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
        let url = tabs[i].url;
    	  let tabid = tabs[i].id;
        var index = searchItemByURL(url);
        // si item déjà extrait, on ne fait rien. Pas possible d'avoir deux item avec la même url
        if (index == -1) {
          storage.readCodeByURL($scope.dataSource, url, function(result) {
            if (result != null) {
              injector.extract(result.code, mainWindow, tabid, function(result){
                result.url = url;
                var id = prompt("id à utiliser ?" + result.titre);
                result.id = id;
                $scope.model.items.push(result);
                $scope.$apply();
              });
            }
          });
        } else {
          console.error('extract aborted, url already');
        }
      } // for
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

  /**
    * Lance un rafraichissement pour tous les onglets ouverts
  * Les onglets qui n'ont pas déjà été extraits ne le sont pas.
  */
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

  /**
    * lance un rafraichissement pour tous les items (filtrage non pris en compte)
  */
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
   *  lance une recherche pour le searcher (string) fourni et evalue
   * l'expression fournie comme terme de recherche (filtrage non pris en compte)
   */
  $scope.searchAll = function (searchOptions) {
    var BP = chrome.extension.getBackgroundPage();
    var mainWindow = BP.mainWindow;
    storage.readSearcher($scope.dataSource, searchOptions.searcher, function(result) {
      var newURL = result.searchurlpattern;
      for (let i = 0; i < $scope.model.items.length; i++) {
        chrome.tabs.create({ url: newURL }, function(tab) {
          var tabid = tab.id;
          var item = $scope.model.items[i];
          // TODO gérer le cas où l'expression est invalide
          var toSearch = $scope.$eval(searchOptions.property, {item : item});
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

  $scope.openModalSearcher = function (size, parentSelector) {
    var parentElem = parentSelector ?
      angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
    var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      size: "",
      appendTo: parentElem,
      resolve: {
        items: function () {
          return $scope.model.items;
        },
        univer: function () {
          return $scope.dataSource;
        }
      }
    });
    modalInstance.result.then(function (result) {
      $scope.searchAll(result);
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

}]);

myApp.controller('ModalInstanceCtrl', function ($uibModalInstance, items, univer, storage, $scope) {
  var $ctrl = this;
  $ctrl.items = items;
  $ctrl.property = "item.titre";

  storage.readSearcherList(univer, function (result) {
    $ctrl.items = result;
  });

  $ctrl.ok = function () {
    $uibModalInstance.close({ searcher : $ctrl.selectedSearcher, property : $ctrl.property });
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
