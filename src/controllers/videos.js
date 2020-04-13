app.controller("videos", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();


    $scope.selectVideo = function (key) { // Seleccion de video para actualizar, borrar o crear nuevo
        if(key){ // Seleccionar video para actualizar/borrar
            $scope.selectedVideoKey = key;
            $scope.selectedVideo = { // Otro objeto para que no quede referenciado al original en caso de cancelar
                title: $scope.videos[key].title,
                source: $scope.videos[key].source,
                link: $scope.videos[key].source == 'youtube' ? 
                    "https://www.youtube.com/watch?v="+$scope.videos[key].link : 
                    "https://drive.google.com/file/d/"+$scope.videos[key].link+"/view?usp=sharing",
                uploaded: $scope.videos[key].uploaded
            };
            setTimeout(function(){
                M.updateTextFields();
            },250);
        }else{ // Nuevo video
            $scope.selectedVideoKey = null;
            $scope.selectedVideo = {
                title: "",
                source: "",
                link: "",
                uploaded: 0
            };
        }
    };

    $scope.saveVideo = function () { // Al confirmar, guardar el nuevo nombre de la foto
        if($scope.selectedVideo.title != ""){ // Chequear campos
            $rootScope.loading = true;
            $scope.selectedVideo.source = document.getElementById("video_source").value; // Tipo de origen del link de video (youtube o drive)
            if($scope.selectedVideo.source == "youtube"){
                if($scope.selectedVideo.link.includes("?v=")){ // Verificar si el string tiene el identificador
                    $scope.selectedVideo.link = $scope.selectedVideo.link.split("?v=")[1]; // Extraer el identificador yt
                }else{
                    M.toast({html: "Ingrese un enlace válido!",classes: 'rounded red',displayLength: 1500});
                    $rootScope.loading = false;   
                    return;
                }
            }else{
                //$scope.selectedVideo.link = $scope.selectedVideo.link.split("?id=")[1]; // Extraer el identificador drive 
                if($scope.selectedVideo.link.includes("/d/")){ // Verificar si el string tiene el identificador
                    $scope.selectedVideo.link = ($scope.selectedVideo.link.split("/d/")[1]); // Extraer el identificador drive
                    $scope.selectedVideo.link = $scope.selectedVideo.link.substring(0,$scope.selectedVideo.link.indexOf("/"));
                    //console.log($scope.selectedVideo.link);
                }else{
                    M.toast({html: "Ingrese un enlace válido!",classes: 'rounded red',displayLength: 1500});
                    $rootScope.loading = false;   
                    return;
                }
            }
            if($scope.selectedVideoKey){ // Actualizar existente
                Cipressus.db.update($scope.selectedVideo,"videos/"+$rootScope.user.course+"/"+$scope.selectedVideoKey)
                .then(function(res){            
                    $scope.videos[$scope.selectedVideoKey]= { // Actualizar el local
                        title: $scope.selectedVideo.title,
                        link: $scope.selectedVideo.link,
                        source: $scope.selectedVideo.source,
                        uploaded: $scope.selectedVideo.uploaded
                    }; 
                    delete $scope.selectedVideo;
                    delete $scope.selectedVideoKey;
                    M.toast({html: "Datos actualizados!",classes: 'rounded green darken-3',displayLength: 1500});
                    video_edit_modal.close();
                    $rootScope.loading = false;                
                    $scope.$apply();
                })
                .catch(function (err) {
                    console.log(err);
                    M.toast({html: "Ocurrió un error al actualizar cambios.",classes: 'rounded red',displayLength: 1500});
                    $rootScope.loading = false;
                    $scope.$apply();
                });
            }else{ // Crear nuevo
                $scope.selectedVideo.uploaded = Date.now();
                //console.log($scope.selectedVideo);
                Cipressus.db.push($scope.selectedVideo,"videos/"+$rootScope.user.course)
                .then(function(res1){       
                    if(!$scope.videos){
                        $scope.videos = {};
                    }
                    $scope.videos[res1.key]= { // Actualizar el local
                        title: $scope.selectedVideo.title,
                        link: $scope.selectedVideo.link,
                        source: $scope.selectedVideo.source,
                        uploaded: $scope.selectedVideo.uploaded
                    }; 
                    delete $scope.selectedVideo;
                    delete $scope.selectedVideoKey;
                    M.toast({html: "Nuevo video creado!",classes: 'rounded green darken-3',displayLength: 1500});
                    video_edit_modal.close();
                    $rootScope.loading = false;                
                    $scope.$apply(); 
                })
                .catch(function (err) {
                    console.log(err);
                    M.toast({html: "Ocurrio un error al actualizar cambios.",classes: 'rounded red',displayLength: 1500});
                    $rootScope.loading = false;
                    $scope.$apply();
                });
            }
        }else{
            M.toast({html: "Debe indicar un nombre",classes: 'rounded red',displayLength: 1500});
            return;            
        }
    };

    $scope.confirmDelete = function(){ // Borrar el archivo seleccionado luego de que el usuario confirme
        $rootScope.loading = true;
        Cipressus.db.set(null,"videos/"+$rootScope.user.course+"/"+$scope.selectedVideoKey)
        .then(function(res){
            // Eliminar los elementos de la vista
            delete $scope.videos[$scope.selectedVideoKey];
            delete $scope.selectedVideo;
            delete $scope.selectedVideoKey;
            M.toast({html: "Video eliminado!",classes: 'rounded green darken-3',displayLength: 1500});
            $rootScope.loading = false;
            confirm_delete_modal.close();
            $scope.$apply();
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrio un error al eliminar el video",classes: 'rounded red',displayLength: 1500});
            $rootScope.loading = false;            
            $scope.$apply();
        });        
    };

    // Componentes de materialize
    var video_edit_modal = M.Modal.init(document.getElementById("video_edit_modal"), {});
    var confirm_delete_modal = M.Modal.init(document.getElementById("confirm_delete_modal"), {});
    M.FormSelect.init(document.querySelectorAll('select'), {}); // Select para origen de links video
    
    Cipressus.utils.activityCntr($rootScope.user.uid, "videos").catch(function (err) {
        console.log(err);
    });

    $rootScope.loading = true;
    Cipressus.db.get("videos/"+$rootScope.user.course)
    .then(function(snapshot){
        $scope.videos = snapshot;
        //console.log($scope.videos);
        $rootScope.loading = false;            
        $scope.$apply();
    })
    .catch(function(err){
        console.log(err);
        $rootScope.loading = false;            
        $scope.$apply();
    })
}]);