(function ($s, $t) {

    // Instrumentos
    var kick, snare, piano, bass;
    var setupInstruments = function(){ // Inicializar
        kick = new $t.MembraneSynth({
            "volume": 6,
            "envelope": {
                "sustain": 0,
                "attack": 0.02,
                "decay": 0.8
            },
            "octaves": 8
        }).toMaster();
        
        snare = new $t.NoiseSynth({
            "volume": -5,
            "envelope": {
                "attack": 0.001,
                "decay": 0.2,
                "sustain": 0
            },
            "filterEnvelope": {
                "attack": 0.001,
                "decay": 0.1,
                "sustain": 0
            }
        }).toMaster();
        
        piano = new $t.PolySynth(4, $t.Synth, {
            "volume": -8,
            "oscillator": {
                "partials": [1, 2, 2],
            },
            "portamento": 0.05
        }).toMaster();
        
        bass = new $t.MonoSynth({
            "volume": -10,
            "envelope": {
                "attack": 0.01,
                "decay": 0.3,
                "release": 1,
            },
            "filterEnvelope": {
                "attack": 0.001,
                "decay": 0.01,
                "sustain": 0.5,
                "baseFrequency": 200,
                "octaves": 2.6
            }
        }).toMaster();
    }

    var audioPortManager = function () {

        var devices = {};
        var idCount = 0;

        var register = function (device) {
            var id = 'id' + idCount++;
            device.$ui
            .on('deviceAdd', function () {
                devices[id] = device;
            })
            .on('deviceRemove', function () {
                delete devices[id];
            });
        };

        var clearDevices = function(){ // Restablecer manager al abrir nuevo circuito
            idCount = 0;
            devices = {};
        };

        return {
            register: register,
            clearDevices: clearDevices
        };
    }();

    $s.registerDevice('Audio-Out', function (device) {
        audioPortManager.register(device);
        var in1 = device.addInput();
        var in2 = device.addInput();
        var in3 = device.addInput();
        var in4 = device.addInput();
        device.$ui
        .on('inputValueChange', function () {            
            if(in1.getValue()){
                if(!kick) setupInstruments();
                kick.triggerAttack('50');
            }
            if(in2.getValue()){
                if(!snare) setupInstruments();
                snare.triggerAttackRelease('50');
            }
            if(in3.getValue()){
                if(!bass) setupInstruments();
                bass.triggerAttackRelease('50','8n');
            }
            if(in4.getValue()){
                if(!piano) setupInstruments();
                piano.triggerAttackRelease(["D4", "F4", "A4", "C5"], "8n");
            }
        });
    });


    if(!$s.clearDevices)
        $s.clearDevices = audioPortManager.clearDevices;
    else{ // Si ya existe, concatenar operaciones
        var temp = $s.clearDevices;
        $s.clearDevices = function(){
            temp();
            audioPortManager.clearDevices();
        };
    }

})(simcir, Tone);



