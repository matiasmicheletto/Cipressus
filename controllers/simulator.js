app.controller("simulator", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    //$rootScope.loading = true;
    $rootScope.sidenav.close();    

    var $s = simcir;
    var $simcir = $('#mySimcir');
    $s.setupSimcir($simcir, { width:900, height:500 }); // Hacer responsive
}]);