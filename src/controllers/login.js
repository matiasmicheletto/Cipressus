app.controller("login", ['$scope', '$rootScope', function ($scope, $rootScope) {

    $scope.keypressed = function (code) { // Al oprimir enter hacer login con los datos de autenticacion
        if (code === 13) // Verificar codigo de tecla
            $scope.btn_click();
    };

    $scope.loginAttempt = function () { // Intentar logear usuario
        if (typeof $scope.userForm !== 'undefined') { // Verificar si se ingreso algo en los campos
            $rootScope.loading = true;
            Cipressus.users.signIn($scope.userForm).then(function (res) {
                console.log(res);                
                setTimeout(function(){
                    if($rootScope.user) // Si ya se realizo el chequeo y descarga de datos
                        M.toast({
                            html: $rootScope.greetings()+" "+$rootScope.user.name+"!",
                            classes: 'rounded green darken-3',
                            displayLength: 5000
                        });
                },2000);
                $rootScope.$apply();
            }).catch(function (err) {                
                $scope.userForm.password = null;
                console.log(err[0]);
                M.toast({
                    html: err[1],
                    classes: 'rounded red',
                    displayLength: 2500
                });
                $rootScope.loading = false;
                $rootScope.$apply();
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
                    classes: 'rounded green darken-3',
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
        var formOk = false; // Chequeo de formulario
        if (typeof($scope.userForm) != 'undefined'){ // Al menos un dato
            $scope.userForm.degree = document.getElementById("degreeSelect").value; // No funciona el ng-model
            if($scope.userForm.name != "" && $scope.userForm.secondName != "" && typeof($scope.userForm.lu) != 'undefined' && $scope.userForm.degree != "") // Chequeo de campos
                formOk = true;
        }
        if (formOk) { // Registrar usuario
            if($scope.userForm.password == $scope.passwordConfirm){ // Contraseñas ingresadas deben coincidir
                Cipressus.users.signUp($scope.userForm).then(function (res) {
                    console.log(res);
                    M.toast({
                        html:  $rootScope.greetings()+" "+$scope.userForm.name+"!",
                        classes: 'rounded green darken-3',
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
            }else{ // Si no coinciden, avisar
                console.log("Confirmación de contraseña fallida");                
                M.toast({
                    html: "Verificación de contraseña incorrecto!",
                    classes: 'rounded red',
                    displayLength: 2000
                });
            }
        }else{ 
            console.log("Formulario incompleto");
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
                $scope.welcomeText = "Iniciar sesión en ";
                break;
            case 1: // registro
                $scope.btn_text = "Registrarse";
                $scope.menu_left = "¿Olvidó su contraseña?";
                $scope.menu_right = "Iniciar sesión";
                $scope.btn_click = $scope.registerNewUser;
                $scope.welcomeText = "Registrarse en ";
                break;
            case 2: // recuperacion
                $scope.btn_text = "Recuperar contraseña";
                $scope.menu_left = "Iniciar sesión";
                $scope.menu_right = "Registrarse";
                $scope.btn_click = $scope.retrievePassword;
                $scope.welcomeText = "Recuperar contraseña de ";
                break;
        }
    };

    $scope.login_mode = 0; // 0->login; 1->registro; 2->recuperacion de clave
    $scope.updateButtons();
    $rootScope.bodyClass = "body-login";
    M.FormSelect.init(document.querySelectorAll('select'), {});    
    setTimeout(function(){M.updateTextFields();},1500); // Esto no funciona 
}]);