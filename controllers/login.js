app.controller("login", ['$scope', '$rootScope', '$location', function ($scope, $rootScope) {

    $scope.keypressed = function (code) { // Al oprimir enter hacer login con los datos de autenticacion
        if (code === 13) // Verificar codigo de tecla
            $scope.btn_click();
    };

    $scope.loginAttempt = function () { // Intentar logear usuario
        if (typeof $scope.userForm !== 'undefined') { // Verificar si se ingreso algo en los campos
            Cipressus.users.signIn($scope.userForm).then(function (res) {
                console.log(res);                
                M.toast({
                    html: "Bienvenido!",
                    classes: 'rounded green',
                    displayLength: 5000
                });
                $rootScope.$apply();
            }).catch(function (err) {
                console.log("Login incorrecto");
                $scope.userForm.password = null;
                console.log(err);
                M.toast({
                    html: err.text,
                    classes: 'rounded red',
                    displayLength: 2500
                });
            });
        } else {
            console.log("Formulario vacío");
            M.toast({
                html: "Debe completar el formulario!",
                classes: 'rounded red',
                displayLength: 2500
            });
        }
    };

    $scope.retrievePassword = function () {
        if (typeof $scope.userForm !== 'undefined') { // Verificar si se ingreso algo en los campos
            Cipressus.users.resetPwd($scope.userForm.email).then(function (res) {
                console.log(res);
                M.toast({
                    html: "Listo! Te enviamos el formulario a tu correo electrónico",
                    classes: 'rounded green',
                    displayLength: 2500
                });
            }).catch(function (err) {
                console.log(err[0]);
                M.toast({
                    html: err[1],
                    classes: 'rounded red',
                    displayLength: 2500
                });
            });
        }else{
            console.log("Formulario vacío");
            M.toast({
                html: "Debe completar el formulario!",
                classes: 'rounded red',
                displayLength: 2500
            });
        }
    };

    $scope.registerNewUser = function () {
        if (typeof $scope.userForm !== 'undefined') {
            Cipressus.users.signUp($scope.userForm).then(function (res) {
                console.log(res);
                M.toast({
                    html: "Bienvenido!",
                    classes: 'rounded green',
                    displayLength: 2500
                });
            }).catch(function (err) {
                console.log(err[0]);
                M.toast({
                    html: err[1],
                    classes: 'rounded red',
                    displayLength: 2500
                });
            });
        }else{ 
            console.log("Formulario vacío");
            M.toast({
                html: "Debe completar el formulario!",
                classes: 'rounded red',
                displayLength: 2500
            });
        }
    };

    $scope.updateButtons = function () { // De acuerdo al modo, cambia el texto de los botones y los callbacks
        switch ($scope.login_mode) {
            case 0: // login
                $scope.btn_text = "Iniciar sesión";
                $scope.menu_left = "Registrarse";
                $scope.menu_right = "¿Olvidó su contraseña?";
                $scope.btn_click = $scope.loginAttempt;
                break;
            case 1: // registro
                $scope.btn_text = "Registrarse";
                $scope.menu_left = "¿Olvidó su contraseña?";
                $scope.menu_right = "Iniciar sesión";
                $scope.btn_click = $scope.registerNewUser;
                break;
            case 2: // recuperacion
                $scope.btn_text = "Recuperar contraseña";
                $scope.menu_left = "Iniciar sesión";
                $scope.menu_right = "Registrarse";
                $scope.btn_click = $scope.retrievePassword;
                break;
        }
    };

    // Valores por defecto de los botones (modo inicio de sesión)
    $scope.login_mode = 0; // 0->login; 1->registro; 2->recuperacion de clave
    $scope.updateButtons();
}]);