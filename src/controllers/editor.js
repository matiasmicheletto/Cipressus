app.controller("editor", ['$scope','$rootScope','$location','localStorageService', function ($scope,$rootScope,$location,localStorageService) {    

    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();

    $scope.select = function(key){ // Seleccionar noticia para ver, editar o borrar
        // Aunque no edite se inicializa el editor igual. Para evitarlo hay que meter esto en otra funcion
        var quilleditor = document.createElement("div"); // Crear el contenedor cada vez para reiniciar
        quilleditor.id = "quill";
        document.getElementById("quill_container").innerHTML = "";
        document.getElementById("quill_container").appendChild(quilleditor);            
        quill = new Quill('#quill', { // Controlador del editor (inicializo cada vez)
            modules: {            
                toolbar: [ // Botones de la barra de tareas
                    ['bold', 'italic', 'underline', 'strike'],        
                    [{ 'size': ['small', false, 'large', 'huge'] }], 
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],            
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],      
                    [{ 'indent': '-1'}, { 'indent': '+1' }],         
                    [{ 'direction': 'rtl' }],                         
                    [{ 'color': [] }, { 'background': [] }],          
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['link', 'image'],
                    ['clean']                                         
                ],
                imageResize: {} // Este funciona con un script adicional
            },
            theme: 'snow'
        });        
        if(key != undefined){ // Editar, ver o eliminar existente
            $scope.selected = angular.copy($scope.news[key]);
            quill.container.firstChild.innerHTML = $scope.selected.content;
        }else{ // Editar nueva
            quill.container.firstChild.innerHTML = "";
            $scope.selected = {
                title: "",
                content: "",
                order: $scope.news.length,
                timestamp: 0,
                author: $rootScope.user.uid
            }
        }
    };

    var updateTimestamp = function(){ // Actualizar fecha de actualizacion de noticias en db
        var ts = {}; ts[$rootScope.user.course] = Date.now(); // Siempre se actualizan los datos como objetos
        Cipressus.db.update(ts,"metadata/updates/news")
        .then(function(){
            console.log("Actualización de metadata");
            // Actualizar informacion en localstorage
            newsData = { // Objeto a guardar en localStorage
                news: $scope.news,
                authors: $scope.users,
                last_update: Date.now()
            };
            localStorageService.set("newsData_"+$rootScope.user.course,newsData);
        })
        .catch(function(err){
            console.log(err);
        });
    };

    $scope.deleteSelected = function(){ // Borrar noticia seleccionada
        $rootScope.loading = true;
        Cipressus.db.set(null,"news/"+$rootScope.user.course+"/"+$scope.selected.key)
        .then(function(snapshot){
            $scope.news.splice($scope.selected.order,1); // Quitar del view
            // Actualizar orden de cada elemento
            var updates = {};
            for(k in $scope.news){ 
                $scope.news[k].order = parseInt(k);
                var updates = {};
                updates["news/"+$rootScope.user.course+"/"+$scope.news[k].key+"/order"] = parseInt(k);
            }
            Cipressus.db.update(updates)
            .then(function(snapshot){
                M.toast({html: "Listo!",classes: 'rounded green darken-3',displayLength: 1000});
                $rootScope.loading = false;
                $scope.$apply();
            })
            .catch(function(err){
                $rootScope.loading = false;
                console.log(err);
                M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
            });
        })
        .catch(function(err){
            $rootScope.loading = false;
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });
        updateTimestamp();
        confirmModal.close();
    };

    $scope.moveSelected = function(up, key){ // Mover noticia hacia arriba(true) o abajo(false). key es el numero de elemento
        if(up){ // Subir
            if(key > 0){ // No puede subirse el primero
                $rootScope.loading = true;
                var updates = {};
                // Hacer un swap con el de arriba
                updates["news/"+$rootScope.user.course+"/"+$scope.news[key].key+"/order"] = $scope.news[key].order - 1;
                updates["news/"+$rootScope.user.course+"/"+$scope.news[key-1].key+"/order"] = $scope.news[key].order;
                Cipressus.db.update(updates)
                .then(function(snapshot){
                    // Luego de actualizar en DB, cambiar orden de los arreglos que se muestra en la tabla
                    $scope.news[key].order = $scope.news[key].order-1;
                    $scope.news[key-1].order = $scope.news[key-1].order+1;
                    var temp = angular.copy($scope.news[key]);
                    $scope.news[key] = angular.copy($scope.news[key-1]);
                    $scope.news[key-1] = angular.copy(temp);
                    M.toast({html: "Orden actualizado",classes: 'rounded green darken-3',displayLength: 1000});
                    $rootScope.loading = false;
                    $scope.$apply();
                })
                .catch(function(err){
                    $rootScope.loading = false;
                    console.log(err);
                    M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
                });
            }
        }else{ // Bajar
            if(key < $scope.news.length - 1){ // No puede bajarse el ultimo
                console.log($scope.news[key].key);
                console.log($scope.news[key+1].key);
                $rootScope.loading = true;
                var updates = {};
                updates["news/"+$rootScope.user.course+"/"+$scope.news[key].key+"/order"] = $scope.news[key].order + 1;
                updates["news/"+$rootScope.user.course+"/"+$scope.news[key+1].key+"/order"] = $scope.news[key].order;
                Cipressus.db.update(updates).then(function(snapshot){
                    // Luego de actualizar en DB, cambiar orden de los arreglos que se muestra en la tabla
                    $scope.news[key].order = $scope.news[key].order + 1;
                    $scope.news[key+1].order = $scope.news[key+1].order - 1;
                    var temp = angular.copy($scope.news[key]);
                    $scope.news[key] = angular.copy($scope.news[key+1]);
                    $scope.news[key+1] = angular.copy(temp);
                    M.toast({html: "Orden actualizado",classes: 'rounded green darken-3',displayLength: 1000});
                    $rootScope.loading = false;
                    $scope.$apply();
                })
                .catch(function(err){
                    $rootScope.loading = false;
                    console.log(err);
                    M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
                }); 
            }
        }
        updateTimestamp();
    };

    $scope.saveSelected = function(){ // Guardar nueva noticia o guardar cambios editados
        
        $rootScope.loading = true;
        
        if($scope.scheduledNew){ // Si es publicacion programada
            var date = document.getElementById("schedule_date").value;
            var time = document.getElementById("schedule_time").value;
            var timestamp = moment(time+" "+date,"HH:mm YYYY-MM-DD").unix()*1000;
            if(timestamp){ // Chequear que haya puesto bien la fecha
                $scope.selected.timestamp = timestamp;
            }else{
                M.toast({html: "Ingrese fecha de publicación programada",classes: 'rounded red',displayLength: 2000});
                $rootScope.loading = false;
                return;
            }
        }else{ // Si no es publicación programada, usar fecha actual
            $scope.selected.timestamp = Date.now(); // Fecha:hora actuales
        }

        $scope.selected.content = quill.container.firstChild.innerHTML.replace(new RegExp("<img src=", 'g'), "<img class='responsive-img' src="); // Agregar clase responsive a las imagenes
        
        if($scope.selected.key){ // Si ya tiene una clave, hay que sobreescribir noticia en DB
            var key = $scope.selected.key;            
            $scope.selected.key = null; // Borro la clave para que no quede en la db
            Cipressus.db.update($scope.selected,'news/'+$rootScope.user.course+"/"+key)
            .then(function(snapshot){
                $scope.selected.key = key; // Volver a poner la clave para que no se pierda
                var index = $scope.news.findIndex(function(el){return el.key == key;});
                $scope.news[index] = angular.copy($scope.selected); // Actualizar local
                M.toast({html: "Comunicado actualizado",classes: 'rounded green darken-3',displayLength: 1500});
                editModal.close();
                $rootScope.loading = false;
                $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
                M.toast({html: "Ocurrió un error al intentar guardar",classes: 'rounded red',displayLength: 2000});
                $rootScope.loading = false;
                $scope.$apply();
            });
        }else{ // Si no tiene key, hacer push
            $rootScope.loading = true;
            Cipressus.db.push($scope.selected,'news/'+$rootScope.user.course)
            .then(function(snapshot){
                // Si el autor aun no habia creado noticias, guardar su avatar y nombre
                if(!$scope.users[$rootScope.user.uid]){
                    $scope.users[$rootScope.user.uid] = {
                        name: $rootScope.user.name,
                        avatar:$rootScope.user.avatar
                    }
                }
                $scope.selected.key = snapshot.key;
                $scope.news.push($scope.selected);
                editModal.close();
                $rootScope.loading = false;
                $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
                M.toast({html: "Ocurrió un error al intentar guardar",classes: 'rounded red',displayLength: 2000});
                $rootScope.loading = false;
                $scope.$apply();
            });
        }
        updateTimestamp();
    };

    
    //// Inicializacion del controller

    M.Modal.init(document.getElementById("view_modal"), {preventScrolling: false});
    var confirmModal = M.Modal.init(document.getElementById("confirm_modal"), {preventScrolling: false, dismissible: false});
    var editModal = M.Modal.init(document.getElementById("edit_modal"), {preventScrolling: false, dismissible: false});
    $scope.selected = {};
    $scope.scheduledNew = false;
    var quill; // El editor se inicializa al seleccionar una entrada

    var downloadNews = function(){ // Descargar noticias y usuarios de la db
        $scope.news = []; // Para que las noticias aparezcan en orden, se guardan en array
        var authors = []; // Uids de usuarios que hicieron publicaciones
        Cipressus.db.getSorted('news/'+$rootScope.user.course,'order') // Descargar lista de novedades
        .then(function(snapshot){
            snapshot.forEach(function(childSnapshot){ // Lista ordenada
                var child = childSnapshot.val();
                child.content = Cipressus.utils.quillToHTML(child.content); // Parsear para quitar formato de quill
                child.key = childSnapshot.key; // Hay que guardar el key para actualizar
                if(authors.indexOf(child.author) == -1) // Si todavia no se guardo el uid del autor de esta publicacion
                    authors.push(child.author); // Agregar a la lista
                $scope.news.push(child);
            });  
            $scope.users = {};
            if(authors.length > 0){
                var job = [];
                for(var k in authors)
                    job.push(Cipressus.db.get('users_public/'+authors[k])) // Descargar datos de los autores de publicaciones solamente
                Promise.all(job)
                .then(function(users_data){
                    for(var k in users_data)
                        $scope.users[authors[k]] = users_data[k]; 
                    newsData = { // Objeto a guardar en localStorage
                        news: $scope.news,
                        authors: $scope.users,
                        last_update: Date.now()
                    };
                    localStorageService.set("newsData_"+$rootScope.user.course,newsData);
                    $rootScope.loading = false;
                    $rootScope.$apply(); 
                })
                .catch(function(err){
                    console.log(err);
                    M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
                });
            }else{
                $rootScope.loading = false;
                $rootScope.$apply(); 
            }
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });
    };

    // Monitoreo de actividad
    Cipressus.utils.activityCntr($rootScope.user.uid,"editor").catch(function(err){console.log(err)});

    var newsData = localStorageService.get("newsData_"+$rootScope.user.course); // Localmente se guarda news, authors y last_update
    if(newsData){ // Si hay datos en local storage
        $scope.news = newsData.news;
        $scope.users = newsData.authors;
        Cipressus.db.get("metadata/updates/news/"+$rootScope.user.course) // Descargar estampa de tiempo de ultima actualizacion de esta seccion
        .then(function(updateTimestamp){
            if(newsData.last_update < updateTimestamp) // Hay cambios en la base de datos
                downloadNews(); // Descargar
            else{ // Si no hay cambios, terminar
                $rootScope.loading = false;
                $rootScope.$apply();
            }
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });
    }else{ // Si no hay datos, descargar si o si
        downloadNews();
    }

}]);