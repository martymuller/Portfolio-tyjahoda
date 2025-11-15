//VARIABLES & CONSTANTS---------------------------------------------
// HTML LINKY
let blobLinks = [];
let canvasContainer;
let invertedColors = false;

// Matter.js
let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Constraint = Matter.Constraint;

let engine;
let world;

let letterBodies = [];
let letterGraphics = [];

let blobs = [];
let showIntro = true;
let fadeOut = 0;
let started = false;
let draggingBlob = null;
let dragConstraint = null;

let overlayColor = [0, 0, 0, 0]; // r, g, b, a
let overlayActive = false;
let overlayTargetColor = [255, 0, 100]; // Start with any fun color
let overlayAlpha = 0;
let overlayDirection = 1; // 1 = fade in, -1 = fade out

//TEXTY
let name = "   Mart y  Müll er ";
let descriptionLines = [
  "",

  "Hello, I'm an AFAD BA  Digital Arts student.",
  "I make short films, animated  graphics and sound design.",
  "@tyjahoda",
];

//BLOB INFO
let blobData = [
  {
    label: "Portfolio",
    url:
      "https://drive.google.com/file/d/16cxcM6TZ5UROd9hoylLO6hE6vHEDncrn/view?usp=sharing",
  },
  { label: "Instagram", url: "https://www.instagram.com/tyjahoda" },
  { label: "YouTube", url: "https://youtube.com/@tyjahoda" },
  { label: "itch.io", url: "https://tyjahoda.itch.io/" },
];

let bounds = [];
let spriteFrames = [];
let currentSpriteIndex = 0;
let spriteTimer = 0;
let spriteInterval = 130; // milliseconds between frames

//SET UP SKETCHU----------------------------------------------------
function preload() {
  for (let i = 1; i <= 7; i++) {
    let frame = loadImage(`assets/m_${i}.png`);
    spriteFrames.push(frame);
  }

  refreshLight = loadImage("assets/refresh_light.png");
  refreshDark = loadImage("assets/refresh_dark.png");
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textStyle(BOLD);
  textAlign(CENTER);

  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 1;

  setupWorld();
}

function createBlobLinks() {
  for (let i = 0; i < blobs.length; i++) {
    let blob = blobs[i];
    if (blob.url) {
      let a = createA(blob.url, "", "_blank");
      a.position(blob.position.x, blob.position.y);
      a.style("position", "absolute");
      a.style("width", blob.circleRadius * 2 + "px");
      a.style("height", blob.circleRadius * 2 + "px");
      a.style("border-radius", "50%");
      a.style("z-index", "10");
      a.style("opacity", "0");
      blobLinks.push({ el: a, blob: blob });
    }
  }
}

function setupWorld() {
  blobs.forEach((b) => World.remove(world, b));
  bounds.forEach((b) => World.remove(world, b));
  blobs = [];
  bounds = [];

  let baseRadius = max(min(width, height) / 10, 40);
  let r = baseRadius * 1.8;
  let cx = width / 2;
  let cy = height * 0.7;

  for (let i = 0; i < blobData.length; i++) {
    let x = map(i, 0, blobData.length - 1, r * 1.2, width - r * 1.2);
    let y = random(cy, height - r * 1.2);
    let blob = Bodies.circle(x, y, r, {
      restitution: 0.5,
      friction: 0.8,
      frictionAir: 0.02,
      mass: 10,
    });
    blob.label = blobData[i].label;
    blob.url = blobData[i].url;
    blob.circleRadius = r;
    blobs.push(blob);
    World.add(world, blob);
  }

  for (let i = 0; i < 6; i++) {
    let randomRadius = random(baseRadius * 0.5, baseRadius * 1.2);
    let x = random(r, width - r);
    let y = random(cy, height - r * 1.2);
    let extraBlob = Bodies.circle(x, y, randomRadius, {
      restitution: 0.5,
      friction: 0.8,
      frictionAir: 0.02,
      mass: 8,
    });
    extraBlob.label = "";
    extraBlob.url = null;
    extraBlob.circleRadius = randomRadius;
    blobs.push(extraBlob);
    World.add(world, extraBlob);
  }
  let thickness = 150;
  let options = { isStatic: true, restitution: 0.5 };

  // REFRESH BUTTON COLLIDER
  let iconSize = min(-180 + width, -120 + height) * 0.18; // Match the draw size
  let iconX = 1 + iconSize / 2;
  let iconY = 1 + iconSize / 2;

  let refreshCollider = Bodies.rectangle(iconX, iconY, iconSize, iconSize, {
    isStatic: true,
    restitution: 0.5,
    friction: 0.6,
    label: "refresh",
  });

  //HRANICE PROSTREDIA
  bounds.push(refreshCollider);
  World.add(world, refreshCollider);

  let floor = Bodies.rectangle(
    width / 2,
    height + thickness / 2,
    width * 2,
    thickness,
    options
  );
  let ceiling = Bodies.rectangle(
    width / 2,
    -thickness / 2,
    width * 2,
    thickness,
    options
  );
  let leftWall = Bodies.rectangle(
    -thickness / 2,
    height / 2,
    thickness,
    height * 2,
    options
  );
  let rightWall = Bodies.rectangle(
    width + thickness / 2,
    height / 2,
    thickness,
    height * 2,
    options
  );

  bounds.push(floor, ceiling, leftWall, rightWall);
  World.add(world, bounds);

  blobLinks.forEach((link) => link.el.remove()); 
  blobLinks = [];
  createBlobLinks(); 
}

//ZOBRAZENIE--------------------------------------------------------
function draw() {
  if (showIntro) {
    background(invertedColors ? "#000bf3" : "#ff3200");

    //INTRO NADPIS
    fill(invertedColors ? "#ff3200" : "#FFDA5D");
    let baseTextSize = min(width, height) / 7;
    textSize(baseTextSize);
    let totalWidth = textWidth(name);
    let maxNameWidth = width * 0.9;

    if (totalWidth > maxNameWidth) {
      let scale = maxNameWidth / totalWidth;
      baseTextSize *= scale;
      textSize(baseTextSize);
      totalWidth = textWidth(name);
    }

    //SPRITE ANIMATION MACO
    if (spriteFrames.length > 0) {
      spriteTimer += deltaTime;
      if (spriteTimer >= spriteInterval) {
        currentSpriteIndex = (currentSpriteIndex + 1) % spriteFrames.length;
        spriteTimer = 0;
      }
      let img = spriteFrames[currentSpriteIndex];
      let spriteW = img.width * 0.5;
      let spriteH = img.height * 0.5;
      let spriteX = width / 2;
      let spriteY = height * 0.75;

      push();
      let alpha = 255 * (95 - fadeOut);
      tint(255, alpha); // Uniform fade, same as text
      imageMode(CENTER);
      image(img, spriteX, spriteY, spriteW, spriteH);
      pop();
    }
    let x = (width - totalWidth) / 2;
    let y = height * 0.18;

    for (let i = 0; i < name.length; i++) {
      let c = name[i];
      let jitterX = sin(frameCount * 0.05 + i * 5) * 0.8;
      let jitterY = cos(frameCount * 0.05 + i * 5) * 0.9;
      text(c, x + jitterX, y + jitterY);
      x += textWidth(c);
    }

    // BIO TEXT
    let descMaxWidth = width * 0.85;
    let descSize = min(width, height) / 25;
    textSize(descSize);
    textAlign(CENTER, CENTER);
    let startY = height * 0.3;
    let lineHeight = descSize * 1.6;
    fill(invertedColors ? "#FFDA5D" : "#FFDA5D");
    for (let i = 0; i < descriptionLines.length; i++) {
      let line = descriptionLines[i];
      while (textWidth(line) > descMaxWidth && descSize > 7) {
        descSize *= 0.95;
        textSize(descSize);
        lineHeight = descSize * 1.6;
      }
      let lineY = startY + i * lineHeight;
      text(line, width / 2, lineY);
    }

    //ZEMENA SCENY
    if (started) {
      fadeOut += 0.02;
      if (fadeOut >= 1) {
        showIntro = false;
        createLetters();
      }
    }
    //INVERZIA PROSTREDIA
  } else {
    background(invertedColors ? "#FFDA5D" : "#ff3200");
    Engine.update(engine);

    //BLOBS
    for (let b of blobs) {
      fill(invertedColors ? "#000bf3" : "#FFDA5D");
      noStroke();
      ellipse(b.position.x, b.position.y, b.circleRadius * 2);

      if (b.label) {
        fill(invertedColors ? "#FFDA5D" : "#ff3200");
        textSize(b.circleRadius / 4);
        textAlign(CENTER, CENTER);
        text(b.label, b.position.x, b.position.y);
      }
    }
    //TEXT V SCENE
    for (let i = 0; i < letterBodies.length; i++) {
      let body = letterBodies[i];
      let gfx = letterGraphics[i];
      push();
      translate(body.position.x, body.position.y);
      rotate(body.angle);
      fill(invertedColors ? "#000bf3" : "#FFDA5D");
      textSize(gfx.size);
      text(gfx.char, 0, 0);
      pop();
    }

    //UPDATE BLOB LINKS
    for (let link of blobLinks) {
      let pos = link.blob.position;
      let r = link.blob.circleRadius;
      link.el.position(pos.x - r, pos.y - r);
      link.el.style("display", "block");
    }
    //RESET BUTTON
    let refreshImg = invertedColors ? refreshDark : refreshLight;
    let iconTargetHeight = min(width, height) * 0.18;
    let aspectRatio = refreshImg.width / refreshImg.height;
    let iconTargetWidth = iconTargetHeight * aspectRatio;
    imageMode(CORNER);
    image(refreshImg, 0, -10, iconTargetWidth, iconTargetHeight);
  }
}

function returnToIntro() {
  for (let link of blobLinks) {
    link.el.style("display", "none");
  }
  for (let b of blobs) {
    World.remove(world, b);
  }
  for (let b of letterBodies) {
    World.remove(world, b);
  }
  blobs = [];
  letterBodies = [];
  letterGraphics = [];
  fadeOut = 0;
  showIntro = true;
  started = false;
  setupWorld();
}

//JITTER INTRO PISMA
function createLetters() {
  let scaleFactor = 1.7;
  let baseTextSize = min(width, height) / 10;
  let textSizeName = baseTextSize * scaleFactor;
  textSize(textSizeName);

  let totalWidth = 0;
  for (let i = 0; i < name.length; i++) {
    totalWidth += textWidth(name[i]) + 1.5;
  }
  let startX = width / 2 - totalWidth / 2;
  let y = height / 4;

  let x = startX;
  for (let i = 0; i < name.length; i++) {
    let char = name.charAt(i);
    let w = textWidth(char);

    let b = Bodies.rectangle(x + w / 2, y, w, textSizeName, {
      restitution: 0.8,
      friction: 0.5,
      density: 0.001,
    });

    let jitterStrength = 0.05;
    let forceX = random(-jitterStrength, jitterStrength);
    let forceY = random(-jitterStrength, jitterStrength);
    let angleJitter = random(-0.2, 0.2);

    Body.applyForce(b, b.position, { x: forceX, y: forceY });
    Body.setAngularVelocity(b, angleJitter);

    letterBodies.push(b);
    letterGraphics.push({ char: char, size: textSizeName });
    World.add(world, b);

    x += w + 1.5;
  }
}
//INPUT-------------------------------------------------------------
function mousePressed() {
  if (showIntro && !started) {
    started = true;
  } else {
    // UPDATE REFRESH ICON CHECK
    let iconTargetHeight = min(width, height) * 0.18;
    let aspectRatio = refreshLight.width / refreshLight.height;
    let iconTargetWidth = iconTargetHeight * aspectRatio;
    let iconX = 0;
    let iconY = -10;

    if (
      mouseX >= iconX &&
      mouseX <= iconX + iconTargetWidth &&
      mouseY >= iconY &&
      mouseY <= iconY + iconTargetHeight
    ) {
      returnToIntro(); 
      invertedColors = false;
      return; 
    }

    //BLOB DRAGGING
    for (let b of blobs) {
      if (dist(mouseX, mouseY, b.position.x, b.position.y) < b.circleRadius) {
        draggingBlob = b;
        dragConstraint = Constraint.create({
          pointA: { x: mouseX, y: mouseY },
          bodyB: draggingBlob,
          pointB: { x: 0, y: 0 },
          stiffness: 0.1,
          damping: 0.1,
        });
        World.add(world, dragConstraint);
        invertedColors = true;
        break;
      }
    }
  }
}

function mouseDragged() {
  if (dragConstraint) {
    dragConstraint.pointA.x = mouseX;
    dragConstraint.pointA.y = mouseY;
  } else if (!showIntro) {
    let overBlob = false;

    for (let b of blobs) {
      let d = dist(mouseX, mouseY, b.position.x, b.position.y);
      if (d < b.circleRadius) {
        overBlob = true;
        break;
      }
    }

    // IBA MALE BLOBS PRIDAVAT MIMO OBJEKTOV!!
    if (!overBlob) {
      let r = random(8, 20);
      let smallBlob = Bodies.circle(
        mouseX + random(-5, 5),
        mouseY + random(-5, 5),
        r,
        {
          restitution: 0.6,
          friction: 0.8,
          frictionAir: 0.03,
          mass: 2,
        }
      );

      smallBlob.label = "";
      blobs.push(smallBlob);
      World.add(world, smallBlob);
    }
  }
}

function mouseReleased() {
  if (dragConstraint) {
    World.remove(world, dragConstraint);
    dragConstraint = null;
    draggingBlob = null;

    invertedColors = false; // Vypnutie inverzie
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupWorld();
  letterBodies.forEach((b) => World.remove(world, b));
  letterBodies = [];
  letterGraphics = [];
  if (!showIntro) {
    createLetters();
  }
}

//MOBILNE OVLADANIE
function touchStarted() {
  mousePressed(); 
}
