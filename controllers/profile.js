app.controller("profile", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

  if (!$rootScope.userLogged) {
    $location.path("/login");
    return;
  }


  // Callback al subir foto de perfil
  document.getElementById("imgInput").addEventListener('change',
    function () {
      var file = document.getElementById("imgInput").files[0];
      var reader = new FileReader();
      reader.onloadend = function () {
        $scope.newAvatar = reader.result;
        $scope.$apply();
      }
      if (file) reader.readAsDataURL(file);
    });

  $scope.getUserNames = function (userUids) { // Devuelve los apellidos de los usuarios cuyos uid se pasa como arreglo
    if ($scope.users) { // Esperar a que se bajen de la db
      var names = [];
      for (var k in userUids)
        names.push($scope.users[userUids[k]].secondName);
      return names.join(); // Apellidos separados por coma
    }
  };

  $scope.uploadPic = function () { // Redirigir el evento al input para cargar una foto
    document.getElementById("imgInput").click();
  };

  $scope.saveForm = function () { // Guardar cambios en db
    $rootScope.loading = true;

    // Valores de los formularios
    var name = document.getElementById("inputName").value;
    var secondName = document.getElementById("inputSecondName").value;
    var lu = document.getElementById("inputLU").value;
    var degree = document.getElementById("inputDegree").value;
    // Nueva foto de perfil
    $rootScope.user.avatar = $scope.newAvatar;

    // Validar inputs y actualizar 
    if (name != "") $rootScope.user.name = name;
    if (secondName != "") $rootScope.user.secondName = secondName;
    if (lu != "") $rootScope.user.lu = lu;
    if (degree != "") $rootScope.user.degree = degree;

    // Buscar companeros de comision
    var getUserUID = function (name) { // Obtener el uid a partir del nombre completo
      for (var k in $scope.users)
        if ($scope.users[k].name + " " + $scope.users[k].secondName == name) // Coincidencia
          return k;
    };
    var partners = [];
    if (document.getElementById("partner1").value != "") {
      var partUid = getUserUID(document.getElementById("partner1").value);
      if (partUid)
        partners.push(partUid);
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
        partners.push(partUid);
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

    if(partners.length == 2){ // En caso de ingresar dos compañeros
      if(partners[0] == partners[1]){ // No pueden ser iguales
        M.toast({
          html: "Nombres de compañeros iguales",
          classes: 'rounded red',
          displayLength: 2500
        });
        $rootScope.loading = false;
        return;
      }
    }

    $rootScope.user.partners = partners;

    var newData = { // Objeto para subir a la db
      name: $rootScope.user.name,
      secondName: $rootScope.user.secondName,
      lu: $rootScope.user.lu,
      degree: $rootScope.user.degree,
      avatar: $rootScope.user.avatar,
      partners: partners
    };

    // Faltaria incluir en los otros usuarios la referencia a este
    Cipressus.db.update(newData, "users_public/" + $rootScope.user.uid) // Actualizar
      .then(function (res) {
        M.toast({
          html: "Datos actualizados!",
          classes: 'rounded green darken-3',
          displayLength: 2500
        });
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
  };


  ///// Inicialización controller
  $rootScope.loading = true;
  $rootScope.sidenav.close();

  $scope.edit = false; // Toggle para la edicion de los datos del perfil
  $scope.created = $rootScope.user.enrolled > 0 ? moment($rootScope.user.enrolled).format("DD/MM/YYYY HH:mm") : "(Aún no aprobado)"; // Formato legible
  $scope.newAvatar = $rootScope.user.avatar; // Nuevo src si carga nueva foto de perfil

  M.Tooltip.init(document.querySelectorAll('.tooltipped'), {}); // Inicializar tooltips      

  Cipressus.utils.activityCntr($rootScope.user.uid, "profile").catch(function (err) {console.log(err)});

  Cipressus.db.get("users_public") // Descargar datos de usuarios
    .then(function (users_public_data) {
      $scope.users = users_public_data;
      // Lista de usuarios para autocompletador
      var userList = {};
      for (var k in $scope.users) // Para excluir admins hay que bajar users_private
        userList[$scope.users[k].name + " " + $scope.users[k].secondName] = $scope.users[k].avatar; // Lista de nombres y fotos
      M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
        data: userList
      });

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
    });
}]);