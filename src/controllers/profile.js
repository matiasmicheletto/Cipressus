app.controller("profile", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $scope.editingReady = false; // Para habilitar edicion hay que descargar informacion extra de otros usuarios

    document.getElementById("imgInput").addEventListener('change', // Callback al subir foto de perfil
        function () { // Cuando sube una nueva foto, agregar a la vista como base64
            $rootScope.loading = true;
            $scope.$apply();
            var file = document.getElementById("imgInput").files[0];
            var reader = new FileReader();
            reader.onloadend = function () {
                $scope.newAvatar = reader.result; // Se muestra temporalmente esta imagen
                $scope.avatarFile = file; // Guardo el archivo para subir luego a storage
                $scope.newProfilePic = true;
                $rootScope.loading = false;
                $scope.$apply();
            }
            if (file) reader.readAsDataURL(file);
        });

    $scope.uploadPic = function () { // Redirigir el evento al input para cargar una foto
        document.getElementById("imgInput").click();
    };

    $scope.saveForm = function () { // Guardar cambios en db
        $rootScope.loading = true;

        // Valores de los formularios
        var newData = {
            name: document.getElementById("inputName").value,
            secondName: document.getElementById("inputSecondName").value,
            lu: document.getElementById("inputLU").value,
            degree: document.getElementById("inputDegree").value,
            partners: [] // Arreglo de companeros de comision, se completa luego
        }

        // Validar datos de formulario
        if (newData.name == "" || newData.secondName == "" || newData.lu == "" || newData.degree == "") {
            console.log("Uno de los campos queda vacio.");
            M.toast({
                html: "Complete todos los campos",
                classes: 'rounded red',
                displayLength: 2500
            });
            $rootScope.loading = false;
            return;
        }

        // Buscar companeros de comision ingresados y generar arreglo de uids
        var getUserUID = function (name) { // Obtener el uid a partir del nombre completo
            for (var k in $scope.users)
                if ($scope.users[k].name + " " + $scope.users[k].secondName == name) // Coincidencia
                    return k;
        };

        // Validar los nombres de companeros de comision (deben existir usuarios, no pueden ser iguales)
        if (document.getElementById("partner1").value != "") {
            var partUid = getUserUID(document.getElementById("partner1").value);
            if (partUid)
                newData.partners.push(partUid);
            else {
                M.toast({
                    html: "Nombre de usuario no válido",
                    classes: 'rounded red',
                    displayLength: 2500
                });
                $rootScope.loading = false;
                return;
            }
        }
        if (document.getElementById("partner2").value != "") {
            var partUid = getUserUID(document.getElementById("partner2").value);
            if (partUid)
                newData.partners.push(partUid);
            else {
                M.toast({
                    html: "Nombre de usuario no válido",
                    classes: 'rounded red',
                    displayLength: 2500
                });
                $rootScope.loading = false;
                return;
            }
        }
        if (newData.partners.length == 2) { // En caso de ingresar dos compañeros
            if (newData.partners[0] == newData.partners[1]) { // No pueden ser iguales
                M.toast({
                    html: "Nombres de compañeros iguales",
                    classes: 'rounded red',
                    displayLength: 2500
                });
                $rootScope.loading = false;
                return;
            }
        }
        // Falta verificar que ninguno de los dos companeros ingresado sean iguales al usuario actual

        // Habria que incluir referencia al usuario actual en los companeros indicados
        var updateNewData = function(){ // Actualizar entrada en la db
            Cipressus.db.update(newData, "users_public/" + $rootScope.user.uid) // Actualizar
                .then(function (res) {
                    M.toast({
                        html: "Datos actualizados!",
                        classes: 'rounded green darken-3',
                        displayLength: 2500
                    });
                    // Actualizar datos de view
                    $rootScope.user.name = newData.name;
                    $rootScope.user.secondName = newData.secondName;
                    $rootScope.user.lu = newData.lu;
                    $rootScope.user.degree = newData.degree;
                    $rootScope.user.partners = newData.partners;
                    $rootScope.loading = false;
                    $scope.edit = false;
                    $scope.$apply();
                })
                .catch(function (err) {
                    console.log(err);
                    M.toast({
                        html: "Ocurrió un problema al actualizar los datos",
                        classes: 'rounded red',
                        displayLength: 2500
                    });
                    $rootScope.loading = false;
                    $scope.$apply();
                });
        }

        if ($scope.newProfilePic) { // Si puso nueva foto
            var saveNewAvatar = function () { // Guardar nueva foto de perfil en storage
                var filename = Cipressus.utils.generateFileName(25) + "." + $scope.avatarFile.name.split(".")[1]; // Generar nombre de archivo
                Cipressus.storage.put($scope.avatarFile, "Images", filename) // Guardar imagen en storage
                    .then(function (res) {                        
                        // Datos que van al storage
                        newData.avatar = res.url;
                        newData.avatarFilename = filename;
                        // Actualizar datos de la vista
                        $rootScope.user.avatar = res.url; // Enlace a la imagen
                        $rootScope.user.avatarFilename = filename; // Nombre de archivo en storage
                        updateNewData(); // Finalmente, actualizar todos los datos
                    })
                    .catch(function (err) {
                        console.log(err);
                        M.toast({
                            html: "Ocurrió un error al actualizar imagen",
                            classes: 'rounded red',
                            displayLength: 2500
                        });
                        $rootScope.loading = false;
                        $scope.$apply();
                    });
            }
            // Si ya tenia foto de perfil, eliminar la anterior
            if ($rootScope.user.avatarFilename) {
                Cipressus.storage.delete($rootScope.user.avatarFilename, "Images")
                    .then(function (res) {
                        saveNewAvatar(); // Luego de borrar, guardar la nueva
                    })
                    .catch(function (err) {
                        console.log(err);
                        M.toast({
                            html: "Ocurrió un error al actualizar imagen",
                            classes: 'rounded red',
                            displayLength: 2500
                        });
                        saveNewAvatar(); // Intentar cargar nueva de todas maneras
                    });
            }else{ // Si no tenia foto de perfil, cargar directamente
                saveNewAvatar();
            }
        }else{ // Si no cambio la foto de perfil, actualizar solo los datos
            updateNewData();
        }
    };

    $scope.enableEditing = function(){ // Habilitar edicion
        if($scope.editingReady){ // Si ya entro al modo de edicion una vez, solo habilitar
            $scope.edit = true;
        }else{ // La primera vez que entra al modo de edicion, descargar datos adicionales
            $rootScope.loading = true;
            Cipressus.db.get("users_private")
            .then(function (users_private_data) {
                
                // Lista de usuarios para autocompletador (solo compañeros de curso y no pueden ser admins)
                var userList = {};
                for (var k in $scope.users){
                    // Copiar otros atributos aca si hacen falta
                    if(users_private_data[k].course == $rootScope.user.course && !users_private_data[k].admin && k != $rootScope.user.uid)
                        userList[$scope.users[k].name + " " + $scope.users[k].secondName] = $scope.users[k].avatar; // Lista de nombres y fotos
                }

                M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
                    data: userList
                }); 
                
                $rootScope.loading = false;
                $scope.edit = true;
                $scope.$apply();
            })
            .catch(function (err) {
                console.log(err);
                M.toast({
                    html: "Ocurrió un error al acceder a la base de datos",
                    classes: 'rounded red',
                    displayLength: 2000
                });
                $rootScope.loading = false;
                $scope.$apply();
            });

        }

    };

    ///// Inicialización controller
    $rootScope.loading = true;
    $rootScope.sidenav.close();

    $scope.edit = false; // Toggle para la edicion de los datos del perfil
    $scope.newProfilePic = false; // Indicador para saber si hay que actualizar foto de perfil
    $scope.created = $rootScope.user.enrolled > 0 ? moment($rootScope.user.enrolled).format("DD/MM/YYYY HH:mm") : "(Aún no aprobado)"; // Formato legible
    $scope.newAvatar = $rootScope.user.avatar; // Nuevo src si carga nueva foto de perfil

    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {}); // Inicializar tooltips      

    Cipressus.utils.activityCntr($rootScope.user.uid, "profile").catch(function (err) {
        console.log(err);
    });

    Cipressus.db.get("users_public") // Descargar datos de usuarios
        .then(function (users_public_data) {
            $scope.users = users_public_data;

            // Inicializar inputs
            document.getElementById("inputName").value = $rootScope.user.name;
            document.getElementById("inputSecondName").value = $rootScope.user.secondName;
            document.getElementById("inputLU").value = $rootScope.user.lu;
            document.getElementById("inputDegree").value = $rootScope.user.degree;
            if ($rootScope.user.partners) {
                if ($rootScope.user.partners[0])
                    document.getElementById("partner1").value = $scope.users[$rootScope.user.partners[0]].name + " " + $scope.users[$rootScope.user.partners[0]].secondName;
                if ($rootScope.user.partners[1])
                    document.getElementById("partner2").value = $scope.users[$rootScope.user.partners[1]].name + " " + $scope.users[$rootScope.user.partners[1]].secondName;
            }

            M.FormSelect.init(document.querySelectorAll('select'), {});
            M.updateTextFields(); // Para mostrar los placeholders
            $rootScope.loading = false;
            $scope.$apply();
        })
        .catch(function (err) {
            console.log(err);
            M.toast({
                html: "Ocurrió un error al acceder a la base de datos",
                classes: 'rounded red',
                displayLength: 2000
            });
            $rootScope.loading = false;
            $scope.$apply();
        });
}]);