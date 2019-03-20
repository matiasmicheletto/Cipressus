app.controller("stats", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    

    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    //$rootScope.loading = true;
    $rootScope.sidenav.close();

}]);