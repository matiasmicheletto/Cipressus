app.controller("kMaps", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();

    M.Modal.init(document.getElementById("tutorial_modal"), {});

    qmc = new QuineMcCluskey("", 2, 4, 0);
    qmc.init();
    karnaugh = new KarnaughMap("myKarnaughMap", qmc);
    karnaugh.init();

    $scope.varsNum = 4;
    $scope.showDCares = false;

    setTimeout(function(){
        M.updateTextFields();
    },200);

    $scope.varNumChange = function() {
        karnaugh.setNoOfVars($scope.varsNum);
    };

    $scope.dCareChange = function() {
        karnaugh.allowDontCares($scope.showDCares);
    };

    Cipressus.utils.activityCntr($rootScope.user.uid, "kMaps").catch(function (err) {
        console.log(err)
    });
}]);