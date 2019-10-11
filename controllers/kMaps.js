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

    Cipressus.utils.activityCntr($rootScope.user.uid, "kMap").catch(function (err) {console.log(err)});
}]);