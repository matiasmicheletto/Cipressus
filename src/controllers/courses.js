app.controller("courses", ['$scope', '$rootScope', '$location', function ($scope, $rootScope) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();
    
    // Modal de confirmacion de eliminacion de curso
    var deleteCourseModal = M.Modal.init(document.getElementById("confirm_delete_modal"), {preventScrolling: false}); 


    // Registrar actividad
    Cipressus.utils.activityCntr($rootScope.user.uid, "courses").catch(function (err) {
        console.log(err)
    });

    // Eliminación de curso
    $scope.deleteCourse = function(key){
        if(key){ // Si se pasa clave, abrir modal para confirmar
            $scope.selectedCourseKey = key;
            $scope.selectedCourseIndex = $scope.courses.findIndex(function(el){return el.key == key});
            deleteCourseModal.open();
        }else{ // Si no tiene clave (key == null), es confirmacion de eliminacion del curso seleccionado
            if($scope.selectedCourseKey){ // Debe estar definido

            }else{
                M.toast({html: "La clave de curso no es válida.",classes: 'rounded red',displayLength: 2000});
            }
        }
    }

    $scope.selectCourse = function(key){
        Cipressus.db.update({course: key},'users_private/'+$rootScope.user.uid)   
        .then(function(res){
            M.toast({html: "Se actualizó el curso actual",classes: 'rounded green',displayLength: 2000});
            setTimeout(function(){
                location.reload();
            }, 1000);
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });
    }

    // Descargar informacion sobre los cursos
    Cipressus.db.get("metadata/courses") // Descargar datos de los cursos disponibles
    .then(function(courses){
        $scope.courses = [];
        for(var k in courses){
            courses[k].key = k;
            $scope.courses.push(courses[k]);
        }
        //console.log($scope.courses);
        $rootScope.loading = false;
        $rootScope.$apply();
        M.FormSelect.init(document.querySelectorAll('select'), {});
    })
    .catch(function(err){
        console.log(err);
        M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
    });

}]);