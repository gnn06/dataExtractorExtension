myApp.controller('universCtrl', ["$scope", "storage", function ($scope, storage) {
 
  storage.readUniver(function(result) {
	  if (result != null) {
		$scope.univers = result;
		$scope.$apply();
	  }
  });
  
  $scope.create = function () {
	var univer = prompt("Nom de l'univers à crééer ?");
	$scope.univers.push(univer);
	storage.writeUniver(univer, function(result){});	
  }
  
}]);