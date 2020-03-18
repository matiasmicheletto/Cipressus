var kick = new Tone.MembraneSynth({
    "volume": 6,
    "envelope": {
        "sustain": 0,
        "attack": 0.02,
        "decay": 0.8
    },
    "octaves": 8
}).toMaster();

var snare = new Tone.NoiseSynth({
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

var snare2 = new Tone.NoiseSynth({
    "volume": -5,
    "envelope": {
        "attack": 0.001,
        "decay": 2,
        "sustain": 0
    },
    "filterEnvelope": {
        "attack": 0.001,
        "decay": 0.1,
        "sustain": 0
    }
}).toMaster();

var piano = new Tone.PolySynth(4, Tone.Synth, {
    "volume": -8,
    "oscillator": {
        "partials": [1, 2, 2],
    },
    "portamento": 0.05
}).toMaster();

var bass = new Tone.MonoSynth({
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

var play = function(instrument){
    switch(instrument){
        case 0:
            kick.triggerAttack('50');
            break;
        case 1:
            snare.triggerAttackRelease('50');
            break;
        case 2:
            bass.triggerAttackRelease('60','8n');
            break;
        case 3:
            piano.triggerAttackRelease(["D4", "F4"], "8n");
            break;
        case 4:
            kick.triggerAttack('90');
            break;
        case 5:
            snare2.triggerAttackRelease('50');
            break;
        case 6:
            bass.triggerAttackRelease('120','8n');
            break;
        case 7:
            piano.triggerAttackRelease(["D3", "F3"], "8n");
            break;
        default:
            break;
    }    
};

piano.triggerAttackRelease(["D3", "F3"], "8n");
piano.triggerAttackRelease(["D4", "F4"], "8n");