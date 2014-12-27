
/**
 * @name soundbag
 */
 
function CustomTone(harmonics, harmonic_curve, harmonic_move, amp_move, freq_move, base_amp){
  
  
  var w = 0;
  var v = 0;
  var vh = new Array(harmonics.length);
  for (var i = 0; i < vh.length; i++) vh[i] = 1;
  
  var f = 0;
  
  var d = 0;
  var t = 0;
  
  
  return{
    
    hit : function(pitch, dur, vel){
      f = pitch;
      v = vel*base_amp;
      d = dur;
      
      for (i = 0; i < vh.length; i++) vh[i] = harmonic_curve(harmonics[i]);
      t = 0;
    },
    
    play : function(){
      
      if (v * f < 0.001){
        v = 0;
        return 0;
      }
      
      
      for (var i in harmonics){
        vh[i] *= (1 + harmonic_move(t,harmonics[i])/sampleRate);
        w += v * vh[i] * Math.pow(-1,i) * Math.cos(2 * Math.PI * f * harmonics[i] * t) *(2*Math.PI*200)/sampleRate;
        
      }
      
      
      w *= (1 - 10/sampleRate);
      v *= (1 + amp_move(t,d)/sampleRate);
      f *= (1 + freq_move(t,d)/sampleRate);
      
      t += 1/sampleRate;
      
      return w;
      
    }
  };
  
}


var Simple = CustomTone(
  [1], //hamonics
  function(h){return 1;}, //harmonic_curve
  function(t,h){return 0;}, //harmonic_move
  function(t,d){return -1/d;}, //amp_move
  function(t,d){return 0;}, //freq_move
  1.0);

var Chime = CustomTone(
  [1.0, 2.36, 1.72, 1.86, 2.72, 3.64], //hamonics
  function(h){return 1/h;}, //harmonic_curve
  function(t,h){return 0;}, //harmonic_move
  function(t,d){return -1/d;}, //amp_move
  function(t,d){return 0;}, //freq_move
  0.5);

var Bowed = CustomTone(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], //hamonics
  function(h){return 1/h;}, //harmonic_curve
  function(t,h){return (2*Math.random()-1)*200;}, //harmonic_move
  function(t,d){return -t/d;}, //amp_move
  function(t,d){return 0;}, //freq_move
  1.0);
  
var Alien = CustomTone(
  [1, Math.pow(2,0.2), Math.pow(2,0.4), Math.pow(2,0.6), Math.pow(2,0.8), Math.pow(2,1), Math.pow(2,1.2), Math.pow(2,1.4)], //hamonics
  function(h){return 1/h;}, //harmonic_curve
  function(t,h){return (2*Math.random()-1)*600;}, //harmonic_move
  function(t,d){return -1/d-t/d;}, //amp_move
  function(t,d){return Math.sin(t*30)/50;}, //freq_move
  0.2);
  
var DarkChirp = CustomTone(
  [1, 1.01, 1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.10, 1.11, 1.12, 1.13], //hamonics
  function(h){return 1;}, //harmonic_curve
  function(t,h){return (2*Math.random()-1)*100;}, //harmonic_move
  function(t,d){return -1/d;}, //amp_move
  function(t,d){return 0;}, //freq_move
  1);
  
var Drum = CustomTone(
  [1.0, 2.36, 1.72, 1.86, 2.72, 3.64], //hamonics
  function(h){return 1/h/h;}, //harmonic_curve
  function(t,h){return 0;}, //harmonic_move
  function(t,d){return -1/d;}, //amp_move
  function(t,d){if (t < 0.1) return (t-0.1)*10; else return 0;}, //freq_move
  1);
  
  
var Test = CustomTone(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], //hamonics
  function(h){return 1/h;}, //harmonic_curve
  function(t,h){return 0;}, //harmonic_move
  function(t,d){return -1/d;}, //amp_move
  function(t,d){return Math.sin(t*30)/50;}, //freq_move
  1.0);

var bpm = 120;

function at(t1,t2){return (t1 >= t2 && t1 <= t2+1/sampleRate);}

function each(at_beat, per_beat){
  return at(beats%per_beat*60/bpm, at_beat%per_beat*60/bpm);
}

var beats = 0.0;
var output = 0.0;

function compress(w){
  return Math.atan(w*(Math.PI/2))/(Math.PI/2);
}

var board = {
  play : function(){
    return Simple.play() + Chime.play() + Bowed.play() + Alien.play() + DarkChirp.play() + Drum.play() + Test.play();
  }
};

export function dsp(t) {
  
  beats += 1/sampleRate/60*bpm;
  
  if (each(0,5)) Alien.hit(220, 1, 0.4);
  
  if (each(1,5)) Alien.hit(220*Math.pow(2,0.2), 1, 0.4);
  
  if (each(2,5)) Alien.hit(220*Math.pow(2,0.4), 1, 0.4);
  
  if (each(3,5)) Alien.hit(220*Math.pow(2,0.6), 1, 0.4);
  
  if (each(4,5)) Alien.hit(220*Math.pow(2,0.8), 1, 0.4);
  
  
  if (each(0,20)) DarkChirp.hit(440, 1, 0.1);
  
  if (each(0,1)) Drum.hit(55, 0.1, 0.1);
  
  output = board.play();
  
  return output;
}
