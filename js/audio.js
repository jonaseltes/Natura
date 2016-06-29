var audioContext;
var webRtcSource; 
var tuna;
var convolver;
var convolver2;
var filter;
 
function handle_startMonitoring() {
    var aContext = window.AudioContext || window.webkitAudioContext;
    audioContext  = new aContext();
    tuna = new Tuna(audioContext);
    convolver = audioContext.createConvolver();
    var soundSource, concertHallBuffer;

    ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open('GET', 'data/forest.wav', true);
    ajaxRequest.responseType = 'arraybuffer';

    ajaxRequest.onload = function() {
      var audioData = ajaxRequest.response;
      audioContext.decodeAudioData(audioData, function(buffer) {
          concertHallBuffer = buffer;
          soundSource = audioContext.createBufferSource();
          soundSource.buffer = concertHallBuffer;
          convolver.buffer = concertHallBuffer;

          convolver2 = new tuna.Convolver({
              //highCut: 22050,                         //20 to 22050
              lowCut: 600,                             //20 to 22050
              dryLevel: 0,                            //0 to 1+
              wetLevel: 1,                            //0 to 1+
              level: 1,                               //0 to 1+, adjusts total output of both wet and dry
              impulse: "data/forest.wav",    //the path to your impulse response
              bypass: 0
          });

          filter = new tuna.Filter({
              frequency: 100, //20 to 22050
              Q: 1, //0.001 to 100
              gain: -40, //-40 to 40
              filterType: "bandpass", //lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
              bypass: 0
          });

          navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
          navigator.getUserMedia(
              { audio: true, video: false }, 
              function (mediaStream) {
                  webRtcSource = audioContext.createMediaStreamSource(mediaStream);
                  echo();
              }, 
              function (error) {
                  console.log("There was an error when getting microphone input: " + err);
              }
          );

        }, function(e){"Error with decoding audio data" + e.err});
    }

    ajaxRequest.send();
    console.log("convolver: " ,convolver);

}

function echo(){
    
    var gain = audioContext.createGain();
    // var mixGain = context.createGain();
    gain.gain.value = 10;
    // var convolverGain = audioContext.createGain();

    var delay = new tuna.Delay({
        feedback: 0.08,    //0 to 1+
        delayTime: 580,    //how many milliseconds should the wet signal be delayed?
        wetLevel: 1,    //0 to 1+
        dryLevel: 0,       //0 to 1+
        cutoff: 22050,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
        bypass: 0
    });

    webRtcSource.connect(delay);
    console.log("convolver: " ,convolver);
    delay.connect(gain);
    gain.connect(convolver2);
    convolver2.connect(filter);
    filter.connect(audioContext.destination);
}
 
function handle_stopMonitoring() {
    webRtcSource.disconnect(); 
    webRtcSource = null; 
}

// $(function(){
//   handle_startMonitoring();
//   //bindEvents();
// });