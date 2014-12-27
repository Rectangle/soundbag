
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
        w += v * vh[i] * Math.pow(-1,i) * Math.cos(2 * Math.PI * f * harmonics[i] * t) *(2*Math.PI*f)/sampleRate;
        
      }
      
      
      w *= (1 + amp_move(t,d)/sampleRate);
      v *= (1 + amp_move(t,d)/sampleRate);
      f *= (1 + freq_move(t,d)/sampleRate);
      
      t += 1/sampleRate;
      
      return w;
      
    }
  };
  
}



var ridiculous_harmonics = [1,1.01,1.02,1.03,1.04,1.05,1.06,1.07,1.08,1.09,1.1,1.11,1.12,1.13];//[1, 1.27, 2.05, 2.62, 3.77, 4.22, 5.6, 6.31, 8.11, 9.82, 10.2, 13.7, 14.6];

var ting = CrazyDrum(440, ridiculous_harmonics, 0, 1, 1);


function CrazyDrum(freq, harmonics, harmonic_power, decay, base_amp){
  
  var w = 0;
  var v = 0;
  var f = 0;
  var t = 0;
  
  var h = new Array(harmonics.length);
  for (var i = 0; i < harmonics.length; i++){
    h[i] = 0.0;
  }
  
  return{
    
    set_decay : function (d){
      decay = d;
    },
    
    hit : function (vel) {
      t = 0;
      f = freq;
      v = vel*base_amp;
      
    },
    play : function(){
      
      if (v * f < 0.001){
        v = 0;
        return 0;
      }
      
      for (var i in harmonics){
        h[i] += (2*Math.random() - 1) * 100 / sampleRate;
        
        w += Math.pow(-1,i) * v * h[i] * Math.cos(2 * Math.PI * f * harmonics[i] * t) / Math.pow(harmonics[i],harmonic_power) *(2*Math.PI*f)/sampleRate;
      }
      
      w *= 1 - 10/sampleRate;
      v *= (1 - decay/sampleRate);
      
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
  [1, 2, 3, 4], //hamonics
  function(h){return h/(h+1)/(h+1);}, //harmonic_curve
  function(t,h){return 0;}, //harmonic_move
  function(t,d){return -1/d;}, //amp_move
  function(t,d){return 0;}, //freq_move
  2.0);

var Bowed = CustomTone(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], //hamonics
  function(h){return 1/h;}, //harmonic_curve
  function(t,h){return (2*Math.random()-1)*200;}, //harmonic_move
  function(t,d){return -t/d;}, //amp_move
  function(t,d){return 0;}, //freq_move
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
    return Simple.play() + Chime.play() + Bowed.play();
  }
};

export function dsp(t) {
  
  beats += 1/sampleRate/60*bpm;
  
  if (each(0,2)) Bowed.hit(220, 0.5, 0.4);
  
  output = board.play();
  
  return output;
}
