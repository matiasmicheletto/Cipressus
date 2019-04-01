app.controller("simulator", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    M.Modal.init(document.getElementById("tutorial_modal"),{});

    //$rootScope.loading = true;
    $rootScope.sidenav.close();  
    
    var divHeight = document.getElementById("mySimcir").clientHeight;
    var divWidth = document.getElementById("mySimcir").clientWidth;

    var $s = simcir;
    var $simcir = $('#mySimcir');
    $s.setupSimcir($simcir, { width:divWidth, height:divHeight });
}]);