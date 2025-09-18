// Scene, Camera, Renderer
let renderer = new THREE.WebGLRenderer();
let scene = new THREE.Scene();
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1500);
let cameraRotation = 0;
let cameraRotationSpeed = 0.002;
let cameraAutoRotation = true;
let orbitControls = new THREE.OrbitControls(camera);

// Lights
let spotLight = new THREE.SpotLight(0xffffff, 1, 0, 15, 2);

// Texture Loader
let textureLoader = new THREE.TextureLoader();

// Planet Proto
let planetProto = {
  sphere: function (size) {
    let sphere = new THREE.SphereGeometry(size, 32, 32);
    return sphere;
  },
  material: function (options) {
    let material = new THREE.MeshPhongMaterial();
    if (options) {
      for (var property in options) {
        material[property] = options[property];
      }
    }
    return material;
  },
  glowMaterial: function (intensity, fade, color) {
    let glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        'c': { type: 'f', value: intensity },
        'p': { type: 'f', value: fade },
        glowColor: { type: 'c', value: new THREE.Color(color) },
        viewVector: { type: 'v3', value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * viewVector );
          intensity = pow( c - dot(vNormal, vNormel), p );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
        }`,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    return glowMaterial;
  },
  texture: function (material, property, uri) {
    textureLoader.crossOrigin = true;
    textureLoader.load(uri, function (texture) {
      material[property] = texture;
      material.needsUpdate = true;
    });
  }
};

// Function to create a planet
let createPlanet = function (options) {
  // Create the planet's Surface
  let surfaceGeometry = planetProto.sphere(options.surface.size);
  let surfaceMaterial = planetProto.material(options.surface.material);
  let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

  // Create the planet's Atmosphere
  let atmosphereGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size);
  let atmosphereMaterialDefaults = { side: THREE.DoubleSide, transparent: true };
  let atmosphereMaterialOptions = Object.assign(atmosphereMaterialDefaults, options.atmosphere.material);
  let atmosphereMaterial = planetProto.material(atmosphereMaterialOptions);
  let atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

  // Create the planet's Atmospheric glow
  let atmosphericGlowGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size + options.atmosphere.glow.size);
  let atmosphericGlowMaterial = planetProto.glowMaterial(options.atmosphere.glow.intensity, options.atmosphere.glow.fade, options.atmosphere.glow.color);
  let atmosphericGlow = new THREE.Mesh(atmosphericGlowGeometry, atmosphericGlowMaterial);

  // Nest the planet's Surface and Atmosphere into a planet object
  let planet = new THREE.Object3D();
  surface.name = 'surface';
  atmosphere.name = 'atmosphere';
  atmosphericGlow.name = 'atmosphericGlow';
  planet.add(surface);
  planet.add(atmosphere);
  planet.add(atmosphericGlow);

  // Load the Surface's textures
  for (let textureProperty in options.surface.textures) {
    planetProto.texture(surfaceMaterial, textureProperty, options.surface.textures[textureProperty]);
  }

  // Load the Atmosphere's texture
  for (let textureProperty in options.atmosphere.textures) {
    planetProto.texture(atmosphereMaterial, textureProperty, options.atmosphere.textures[textureProperty]);
  }

  return planet;
};

// Create Mars
let mars = createPlanet({
  surface: {
    size: 0.7,
    material: {
      bumpScale: 0.05,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'scripts/Asset/map.jpg',
      bumpMap: 'scripts/Asset/bump_map.png',
      specularMap: 'scripts/Asset/rgb_sketchmap.jpg'
    }
  },
  atmosphere: {
    size: 0.004,
    material: { opacity: 0.8 },
    textures: {
      map: 'scripts/Asset/cloud_map.png',
      alphaMap: 'scripts/Asset/cloud_map.png'
    },
    glow: {
      size: 0.02,
      intensity: 0.7,
      fade: 7,
      color: 0x9C2E35
    }
  }
});

// Galaxy
let galaxyGeometry = new THREE.SphereGeometry(100, 32, 32);
let galaxyMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
let galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);

// Load Galaxy Textures
textureLoader.crossOrigin = true;
textureLoader.load('scripts/Asset/background.jpg', function (texture) {
  galaxyMaterial.map = texture;
  scene.add(galaxy);
});

// Scene, Camera, Renderer Configuration
renderer.setSize(window.innerWidth, window.innerHeight);

// Attach the renderer to the threejs-section div
let threejsSection = document.getElementById('threejs-section');
threejsSection.appendChild(renderer.domElement);

camera.position.set(1, 1, 12);
orbitControls.enabled = !cameraAutoRotation;

scene.add(camera);
scene.add(spotLight);
scene.add(mars);

// Light Configurations
spotLight.position.set(0, 6, 0);

// Mesh Configurations
mars.receiveShadow = true;
mars.castShadow = true;
mars.getObjectByName('surface').geometry.center();

// On window resize, adjust camera aspect ratio and renderer size
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main render function
let render = function () {
  mars.getObjectByName('surface').rotation.y += 1 / 32 * 0.01;
  mars.getObjectByName('atmosphere').rotation.y += 1 / 16 * 0.01;
  if (cameraAutoRotation) {
    cameraRotation += cameraRotationSpeed;
    camera.position.y = 0;
    camera.position.x = 2 * Math.sin(cameraRotation);
    camera.position.z = 2 * Math.cos(cameraRotation);
    camera.lookAt(mars.position);
  }
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

// Start the render loop
render();

// // dat.gui
// var gui = new dat.GUI();
// var guiCamera = gui.addFolder('Camera');
// var guiSurface = gui.addFolder('Surface');
// var guiMarkers = guiSurface.addFolder('Markers');
// var guiAtmosphere = gui.addFolder('Atmosphere');
// var guiAtmosphericGlow = guiAtmosphere.addFolder('Glow');
// // dat.gui controls object
// var cameraControls = new function () {
//   this.speed = cameraRotationSpeed;
//   this.orbitControls = !cameraAutoRotation;
// }();

// var surfaceControls = new function () {
//   this.rotation = 0;
//   this.bumpScale = 0.05;
//   this.shininess = 10;
// }();

// var markersControls = new function () {
//   this.address = '';
//   this.color = 0xff0000;
//   this.placeMarker = function () {
//     placeMarkerAtAddress(this.address, this.color);
//   };
// }();

// var atmosphereControls = new function () {
//   this.opacity = 0.8;
// }();

// var atmosphericGlowControls = new function () {
//   this.intensity = 0.7;
//   this.fade = 7;
//   this.color = 0x9C2E35;
// }();

// // dat.gui controls
// guiCamera.add(cameraControls, 'speed', 0, 0.1).step(0.001).onChange(function (value) {
//   cameraRotationSpeed = value;
// });
// guiCamera.add(cameraControls, 'orbitControls').onChange(function (value) {
//   cameraAutoRotation = !value;
//   orbitControls.enabled = value;
// });

// guiSurface.add(surfaceControls, 'rotation', 0, 6).onChange(function (value) {
//   mars.getObjectByName('surface').rotation.y = value;
// });
// guiSurface.add(surfaceControls, 'bumpScale', 0, 1).step(0.01).onChange(function (value) {
//   mars.getObjectByName('surface').material.bumpScale = value;
// });
// guiSurface.add(surfaceControls, 'shininess', 0, 30).onChange(function (value) {
//   mars.getObjectByName('surface').material.shininess = value;
// });

// guiMarkers.add(markersControls, 'address');
// guiMarkers.addColor(markersControls, 'color');
// guiMarkers.add(markersControls, 'placeMarker');

// guiAtmosphere.add(atmosphereControls, 'opacity', 0, 1).onChange(function (value) {
//   mars.getObjectByName('atmosphere').material.opacity = value;
// });

// guiAtmosphericGlow.add(atmosphericGlowControls, 'intensity', 0, 1).onChange(function (value) {
//   mars.getObjectByName('atmosphericGlow').material.uniforms['c'].value = value;
// });
// guiAtmosphericGlow.add(atmosphericGlowControls, 'fade', 0, 50).onChange(function (value) {
//   mars.getObjectByName('atmosphericGlow').material.uniforms['p'].value = value;
// });
// guiAtmosphericGlow.addColor(atmosphericGlowControls, 'color').onChange(function (value) {
//   mars.getObjectByName('atmosphericGlow').material.uniforms.glowColor.value.setHex(value);
// });


// document.onpointerdown = function(event) {
//   switch ( event.button ) {
//       case 0: console.log("Left Button is down."); 
//           break;
//       case 1: console.log("Middle Button is down."); 
//       //Beware this work not on mac with magic mouse!
//           break;
//       case 2: console.log("Right Button is down.");
//           break;
//   }
// }

