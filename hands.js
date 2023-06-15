const video = document.getElementsByClassName('input_video')[0];
const canvas = document.getElementsByClassName('output')[0];
const gestureOutput = document.getElementById("gesture_output");
const controlsElement3 = document.getElementsByClassName('control3')[0];
const canvasCtx = canvas.getContext('2d');
const fpsControl = new FPS();

const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

makep();
function onResultsHands(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  canvasCtx.drawImage(
    results.image, 0, 0, canvas.width, canvas.height);
  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const landmarks = results.multiHandLandmarks[i];
      drawConnectors(
        canvasCtx, landmarks, HAND_CONNECTIONS,
        { color: '#0000ff', lineWidth: 8 })
    }
  }
  canvasCtx.restore();
  if (results.multiHandLandmarks !== undefined) {
    try {
      let l = false;
      let r = false;
      const landmarks = results.multiHandLandmarks[0];
      const handedness = results.multiHandedness;
      for (let i = 0; i < results.multiHandLandmarks.length; i++){
        if(handedness[i].label === "Left"){
          l = true;
        }
        if(handedness[i].label === "Right"){
          r = true;
        }
      }
      if (results.multiHandLandmarks.length > 0) {
        gestureOutput.style.display = "block";
        gestureOutput.style.width = canvas.width;
        gestureOutput.innerText = `Mão Direita ${r}\nMão Esquerda ${l}`
        changeText(landmarks);
      }
    } catch (e) {
      console.log(e);
    }
  }
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
  }
});
hands.onResults(onResultsHands);

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 800
});
camera.start();

new ControlPanel(controlsElement3, {
  selfieMode: true,
  maxNumHands: 2,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
}).add([
  new StaticText({ title: 'MediaPipe Hands' }),
  fpsControl,
  new Toggle({
    title: 'Selfie Mode',
    field: 'selfieMode'
  }),
  new Slider({
    title: 'Max Number of Hands',
    field: 'maxNumHands',
    range: [1, 4],
    step: 1
  }),
  new Slider({
    title: 'Min Detection Confidence',
    field: 'minDetectionConfidence',
    range: [0, 1],
    step: 0.01
  }),
  new Slider({
    title: 'Min Tracking Confidence',
    field: 'minTrackingConfidence',
    range: [0, 1],
    step: 0.01
  }),
]).on(options => {
  video.classList.toggle('selfie', options.selfieMode);
  hands.setOptions(options);
});

function makep(){
  const toAdd = document.getElementById('toAdd');
  for(let i=0; i<=20; i++){
    var newp = document.createElement('p');
    newp.id = 'p'+i;
    toAdd.appendChild(newp);
  }
}

function changeText(pontos){
  for(let i=0; i<=20; i++){
    let j = document.getElementById('p'+i);
    let x = parseFloat(pontos[i].x).toFixed(2)*100;
    let y = parseFloat(pontos[i].y).toFixed(2)*100;
    let z = parseFloat(pontos[i].z).toFixed(2)*100;
    let media = ((x+y)/2);
    if(media > 49){
      j.style.background = "#22b5ed";
    }else{
      j.style.background = "red";
    }
    j.innerText = `Ponto ${i}:\nx: ${x}\ny: ${y}\nz: ${z}\nmedia: ${media}`
  }
}