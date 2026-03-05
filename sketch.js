let stars = [];
const STAR_COUNT = 300;

let v = [];
let cols = 360, rows = 45;

let t_D;
let r_D;

let openingVal = 2, vDensityVal = 8, pAlignVal = 3.6, curve1Val = 2, curve2Val = 1.3;

let thetaSin = [];
let thetaCos = [];
let phiArr = [];
let sinPhi = [];
let cosPhi = [];
let petalCut = [];

let started = false;

function initGrid(){

  t_D = 180*15 / cols;
  r_D = 1 / rows;

  for(let theta = 0; theta <= cols; theta++){

    let ang = theta * t_D;

    thetaSin[theta] = sin(ang);
    thetaCos[theta] = cos(ang);

    let ph = (180/openingVal) * Math.exp(-theta * t_D / (vDensityVal * 180));

    phiArr[theta] = ph;
    sinPhi[theta] = sin(ph);
    cosPhi[theta] = cos(ph);

    petalCut[theta] =
    1 - 0.5 * pow((5/4) * pow(1 - ((pAlignVal * theta * t_D % 360) / 180), 2) - 1/4, 2);
  }

  for(let r = 0; r <= rows; r++){

    v[r] = new Array(cols+1);

    for(let theta = 0; theta <= cols; theta++){
      v[r][theta] = {x:0,y:0,z:0};
    }

  }

}

function startFlower(){

  if(started) return;

  started = true;

  let canvas = createCanvas(700,700,WEBGL);
  canvas.parent("flower3D");

  colorMode(HSB);
  angleMode(DEGREES);

  smooth();
  noStroke();

  lights();
  ambientLight(120);
  directionalLight(255,255,255,0.3,-0.8,-0.5);

  initGrid();

  for(let i = 0; i < STAR_COUNT; i++){

    let theta = random(0,360);
    let phi = random(0,180);
    let rad = random(500,900);

    let x = rad * sin(phi) * sin(theta);
    let y = -rad * cos(phi);
    let z = rad * sin(phi) * cos(theta);

    stars.push({
      x:x,
      y:y,
      z:z,
      phase:random(0,360),
      speed:random(0.5,2),
      size:random(1,4)
    });
  }

}

function draw(){

  if(!started) return;

  background(230,50,15);

  orbitControl(4,4);

  rotateX(-30);
  rotateY(frameCount * 0.4);

  push();
  blendMode(ADD);
  noStroke();

  for(let s of stars){

    push();
    translate(s.x,s.y,s.z);

    let b = 150 + 105 * sin((frameCount*5*s.speed)+s.phase);

    fill(0,0,constrain(b,0,255),220);

    ellipse(0,0,s.size*2,s.size*2);

    pop();
  }

  blendMode(BLEND);
  pop();

  for(let r=0;r<=rows;r++){

    let rr = r*r_D;
    let rr2 = rr*rr;

    for(let theta=0;theta<=cols;theta++){

      let sPhi = sinPhi[theta];
      let cPhi = cosPhi[theta];
      let pCut = petalCut[theta];

      let tmp = curve2Val*rr - 1;

      let hangDown = curve1Val*rr2*tmp*tmp*sPhi;

      let base1 = pCut*(rr*sPhi + hangDown*cPhi);
      let base2 = pCut*(rr*cPhi - hangDown*sPhi);

      let px = 260*base1*thetaSin[theta];
      let py = -260*base2;
      let pz = 260*base1*thetaCos[theta];

      v[r][theta] = {x:px,y:py,z:pz};
    }
  }

  for(let r=0;r<rows;r++){

    let rr = r*r_D;

    fill(340,100,-20+rr*120);

    beginShape(TRIANGLE_STRIP);

    for(let theta=0;theta<=cols;theta++){

      let a = v[r][theta];
      let b = v[r+1][theta];

      vertex(a.x,a.y,a.z);
      vertex(b.x,b.y,b.z);
    }

    endShape();
  }

}

function openFlower(){

  document.getElementById("flower3D").style.display = "block";

  startFlower();

}