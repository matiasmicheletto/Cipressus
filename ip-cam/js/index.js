
// Ocultar los controles durante la inactividad
var frm = document.getElementById("form"); 
setInterval(function(){ // Efecto de fadeout de los controles
    if(frm.style.opacity > 0) frm.style.opacity -= 0.1;
},500);
// Al mover el mouse u oprimir teclas, ocultar controles
window.onmousemove = function(){
    frm.style.opacity = 1;
};
window.onkeydown = function(){
    frm.style.opacity = 1;
};


// Configuracion del cliente (IP y puerto)
var config = JSON.parse(localStorage.getItem("config"));
if(config){ // Si habia configuracion cargada, presetear
    document.getElementById("camera-ip-input").value = config.cameraIp;
    document.getElementById("port-input").value = config.port;
    document.getElementById("audio-enabled-input").checked = config.audio;
}else{
    config = {
        cameraIp: "192.168.0.143",
        port: "4747",
        audio: false,
        rotate: false
    };
    localStorage.setItem("config", JSON.stringify(config));
}

const readConfig = function(form) { // Conectar a la camara IP
    config = {
        cameraIp: form["camera-ip-input"].value,
        port: form["port-input"].value,
        audio: form["audio-enabled-input"].checked
    };

    localStorage.setItem("config", JSON.stringify(config));

    var videoSrc = "http://" + config.cameraIp + ":" + config.port + "/video";
    var audioSrc = "http://" + config.cameraIp + ":" + config.port + "/audio.opus";
    
    document.getElementById("video").setAttribute('src', videoSrc);
    if(config.audio)
        document.getElementById("audio").setAttribute('data', audioSrc);
};

const toggleAudio = function(){ // Alternar audio
    config.audio = document.getElementById("audio-enabled-input").checked;
    if(config.audio){
        var audioSrc = "http://" + config.cameraIp + ":" + config.port + "/audio.opus";
        document.getElementById("audio").setAttribute('data', audioSrc);
    }else{
        document.getElementById("audio").setAttribute('data', "");
    }
    localStorage.setItem("config", JSON.stringify(config));
};

const rotateVideo = function(){ // Alternar landscape/portrait
    config.rotate = document.getElementById("rotate-enabled-input").checked;
    var video = document.getElementById("video");
    if(config.rotate){
        video.classList.add("rotate90");
    }else{
        video.classList.remove("rotate90");
    }
    localStorage.setItem("config", JSON.stringify(config));
};

setInterval(function(){ // Solicitud de autofoco para app DroidCam
    $.get("http://" + config.cameraIp + ":" + config.port + "/cam/1/af");    
},3000);
