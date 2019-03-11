app.controller("sources", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }


    $scope.pushFiles = function (folderName) { // Agregar archivos a un directorio
        
        var uploadFiles = function(folderKey){ // Subir los archivos al storage (es metodo porque se llama de distintos lugares)
            if (document.getElementById("filesInput").files.length > 0) { // Si se cargaron las fotos al storage        
                var fileList = [];
                var filenames = [];
                var uploadingFiles = document.getElementById("filesInput").files; // Lo copio para usar mas adelante fuera de scope            
                for (var k in uploadingFiles) {
                    if (typeof (uploadingFiles[k]) == "object") {
                        fileList.push(uploadingFiles[k]);
                        filenames.push(Cipressus.utils.generateFileName(25) + "." + uploadingFiles[k].name.split(".")[1]); // Nombre aleatorio mas formato de archivo
                    }
                }
    
                Cipressus.storage.putMultiple(fileList, "Files", filenames)
                    .then(function (res) { // res contiene el arreglo de urls asignadas por firebase y los pesos
                        $scope.fileListQueue = []; // LIsta de archivos que hay que guardar en database
                        for (var k in res.urls) { // Para cada url
                            $scope.fileListQueue.push({
                                name: uploadingFiles[k].name.split(".")[0], // Extraer nombre de archivo
                                size: res.sizes[k], // Tamanio de archivo
                                format: uploadingFiles[k].name.split(".")[1], // Extension del archivo
                                link: res.urls[k], // Url de la foto
                                filename: filenames[k], // Nombre de archivo en el storage
                                uploaded: Date.now(),
                                downloads: 0
                            });
                        }
                        Cipressus.db.pushMultiple($scope.fileListQueue, "sources/" + folderKey + "/files")
                            .then(function (snapshot) {
                                // Actualizar tablas (carpetas) de archivos
                                var idx = 0; // Contador para items de carpeta o directorio
                                if(!$scope.sources){ // Para la primera vez cuando no hay ningun directorio
                                    $scope.sources = {};
                                    $scope.sources[folderKey] = {name: folderName, files:{}}; // Crear el arreglo de archivos
                                }else{ // Existen directorios
                                    if(!$scope.sources[folderKey]){ // Si se creo el directorio por primera vez
                                        $scope.sources[folderKey] = {name: folderName, files:{}}; // Crear el arreglo de archivos
                                    }
                                }
                                for(var k in snapshot){ // Para cada key   
                                    $scope.sources[folderKey].files[snapshot[k].key]=$scope.fileListQueue[idx];
                                    idx++;
                                }
                                // Cerrar dialogo
                                M.toast({
                                    html: "Direcetorio actualizado.",
                                    classes: 'rounded green darken-3',
                                    displayLength: 1500
                                });
                                $rootScope.loading = false;
                                files_modal.close();
                                document.getElementById("filesInput").value = null;
                                document.getElementById("filesInputText").value = null;
                                $scope.$apply();
                            })
                            .catch(function (err) {
                                console.log(err);
                                M.toast({
                                    html: "Ocurrio un error guardar archivos.",
                                    classes: 'rounded red',
                                    displayLength: 1500
                                });
                                $rootScope.loading = false;
                                files_modal.close();
                                $scope.$apply();
                            });
                    })
                    .catch(function (err) {
                        console.log(err);
                        M.toast({
                            html: "Ocurrio un error al subir archivos",
                            classes: 'rounded red',
                            displayLength: 1500
                        });
                        $rootScope.loading = false;
                        $scope.$apply();
                    });
    
            } else {
                M.toast({
                    html: "Debe seleccionar los archivos primero",
                    classes: 'rounded red',
                    displayLength: 1500
                });
                return;
            }
        };

        if(!folderName){ // Si no eligio nombre de carpeta, no continuar
            M.toast({
                html: "Debe indicar el nombre del directorio",
                classes: 'rounded red',
                displayLength: 1500
            });            
        }else{ // Si hay al menos algun caracter, continuar
            
            $rootScope.loading = true;

            /// Buscar el key del directorio que tenga este name
            var folderKey = "";
            for(var k in $scope.sources)
                if(folderName == $scope.sources[k].name) // Coincidencia
                    folderKey = k; // Identificador a donde van los archivos subidos

            if(folderKey == ""){ // Si no se encontro, crear nueva entrada                
                Cipressus.db.push({name:folderName},"sources")
                .then(function(res){
                    folderKey = res.key;
                    uploadFiles(folderKey); // Continuar con la carga de archivos
                })
                .catch(function(err){
                    console.log(err);
                    M.toast({
                        html: "Error al generar directorio",
                        classes: 'rounded red',
                        displayLength: 1500
                    });    
                    $rootScope.loading = false;
                    $scope.$apply();
                });
            }else{ // Si la entrada ya existe
                uploadFiles(folderKey);  // Continuar con la carga de archivos
            }
        }
    };

    $scope.deleteFile = function(folder,key){ // Marcar el archivo a borrar para que el usuario confirme        
        fileKeyToDelete = [folder,key];
        $scope.fileToDelete = $scope.sources[folder].files[key];
    };

    $scope.confirmDelete = function () { // Borrar el archivo seleccionado luego de que el usuario confirme
        $rootScope.loading = true;
        Cipressus.storage.delete($scope.fileToDelete.filename, "Files")
            .then(function (res) {
                // Ahora hay que borrar la referencia de la db
                Cipressus.db.set(null, "sources/"+fileKeyToDelete[0]+"/files/"+fileKeyToDelete[1]) // TODO: indicar path de la referencia
                    .then(function (res2) {
                        // Eliminar los elementos de la vista                                        
                        delete $scope.sources[fileKeyToDelete[0]].files[fileKeyToDelete[1]];
                        fileKeyToDelete = [];
                        M.toast({
                            html: "Archivo eliminado!",
                            classes: 'rounded green darken-3',
                            displayLength: 1500
                        });
                        $rootScope.loading = false;
                        confirm_delete_modal.close();
                        $scope.$apply();
                    })
                    .catch(function (err2) {
                        console.log(err2);
                        M.toast({
                            html: "Ocurrio un error al eliminar archivos",
                            classes: 'rounded red',
                            displayLength: 1500
                        });
                        $rootScope.loading = false;
                        $scope.$apply();
                    });
            })
            .catch(function (err) {
                console.log(err);
                M.toast({
                    html: "Ocurrio un error al eliminar archivos",
                    classes: 'rounded red',
                    displayLength: 1500
                });
                $rootScope.loading = false;
                $scope.$apply();
            });
    };


    $scope.openImage = function (link) { // Abrir archivos de imagen en modal
        document.getElementById("image_viewer").src = link;
        image_viewer_modal.open();
    };

    //// Funciones de control del visor de pdf
    $scope.prevPdfPage = function () { // Volver a pagina anterior
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            pdfGoToPage($scope.currentPage);
        }
    };

    $scope.nextPdfPage = function () { // Pasar a pagina siguiente
        if ($scope.currentPage < $scope.maxPages) {
            $scope.currentPage++;
            pdfGoToPage($scope.currentPage);
        }
    };

    var pdfGoToPage = function (page) { // Mostrar pagina especifica del pdf
        $scope.pdf.getPage(page).then(function (pag) {
            //console.log('Pagina cargada');
            var viewport = pag.getViewport({
                scale: $scope.scale
            });
            var canvas = document.getElementById('pdf_viewer_canvas');
            var context = canvas.getContext('2d');
            canvas.height = viewport.height; // VER!
            canvas.width = viewport.width;
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            pag.render(renderContext);
            //var renderTask = page.render(renderContext);
            //renderTask.promise.then(function () {
            //    console.log('Pagina renderizada');                    
            //});
        });
    };

    $scope.openPdfViewer = function (url) { // Abrir el pdf en un modal
        $rootScope.loading = true;
        var pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.js';
        var loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function (pdf) {
            $scope.pdf = pdf; // Objeto para controlar pdf
            $scope.currentPage = 1; // Pagina actual
            $scope.scale = 3;
            $scope.maxPages = pdf.numPages; // Cantidad de paginas
            //console.log('PDF cargado');            
            pdf_viewer_modal.open();
            pdfGoToPage($scope.currentPage);
            $rootScope.loading = false;
            $scope.$apply();
        }, function (err) { // Error al abrir pdf
            console.error(err);
            M.toast({
                html: "Ocurrio un error al mostrar archivo.",
                classes: 'rounded red',
                displayLength: 1500
            });
            $rootScope.loading = false;
            pdf_viewer_modal.close();
            $scope.$apply();
        });
    };


    ///// Inicialización controller
    var files_modal = M.Modal.init(document.getElementById("files_modal"), {preventScrolling: false}); // Dialogo para subir imagenes a la galeria    
    var confirm_delete_modal = M.Modal.init(document.getElementById("confirm_delete_modal"), {preventScrolling: false}); // Dialogo para confirmar borrado
    var pdf_viewer_modal = M.Modal.init(document.getElementById("pdf_viewer_modal"), {preventScrolling: false});
    var image_viewer_modal = M.Modal.init(document.getElementById("image_viewer_modal"), {preventScrolling: false});

    var fileKeyToDelete = [];

    $rootScope.loading = true; // Preloader hasta que se descarguen los enlaces
    $rootScope.sidenav.close();
    Cipressus.db.get('sources') // Descargar lista de novedades
        .then(function (snapshot) {
            //console.log(snapshot);
            $scope.sources = snapshot;
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