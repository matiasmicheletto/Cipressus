app.controller("profile", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {
  
  if(!$rootScope.userLogged)
    $location.path("/login");

  $rootScope.sidenav.close();
  
  $scope.newAvatar = "";
  $scope.edit = false;
  $scope.created = moment($rootScope.user.data.created).format("DD/MM/YYYY HH:mm");

  M.Tooltip.init(document.querySelectorAll('.tooltipped'),{}); // Inicializar tooltips

  $scope.saveForm = function(){ // Guardar cambios 
    // Valores de los formularios
    var name = document.getElementById("inputName").value;
    var secondName = document.getElementById("inputSecondName").value;
    var lu = document.getElementById("inputLU").value;
    var degree = document.getElementById("inputDegree").value;
    
    // Validar imputs
    if(name != "") $rootScope.user.data.name = name;
    if(secondName != "") $rootScope.user.data.secondName = secondName;
    if(lu != "") $rootScope.user.data.lu = name;
    if(degree != "") $rootScope.user.data.degree = degree;
    
    // TODO: Guardar en FireBase
    M.toast({html: "Aún no implementamos esta utilidad!",classes: 'rounded blue',displayLength: 2500});
  };

  M.updateTextFields(); // Para mostrar los placeholders
}]);