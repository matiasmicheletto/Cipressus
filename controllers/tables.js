app.controller("tables", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();

    M.Modal.init(document.getElementById("tutorial_modal"), {});

    $scope.varsNum = 4;
    $scope.showDCares = false;

    setTimeout(function(){
        M.updateTextFields();
    },200);

    $scope.varNumChange = function() {

    };

    $scope.dCareChange = function() {

    };

    Cipressus.utils.activityCntr($rootScope.user.uid, "tables").catch(function (err) {
        console.log(err)
    });
}]);