// scripts/earthFooter.js

const container = document.getElementById('footer-earth-container');
if (container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  container.appendChild(renderer.domElement);

  let lastWidth = 0;
  let lastHeight = 0;

  function setRendererSize() {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width;
    lastHeight = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  setRendererSize();

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      setRendererSize();
    });
    resizeObserver.observe(container);
  } else {
    window.addEventListener('resize', setRendererSize);
    window.addEventListener('load', setRendererSize);
  }

  // Determine asset path based on current page location
  const currentPath = window.location.pathname;
  
  // Count the depth level by counting forward slashes after the domain
  const pathParts = currentPath.split('/').filter(part => part !== '');
  let depthLevel = 0;
  
  // Check if we're in a subfolder and determine depth
  if (pathParts.length > 1) {
    // Remove the HTML file name from the count
    depthLevel = pathParts.length - 1;
  }
  
  // Build the relative path based on depth
  let assetPath = '';
  if (depthLevel === 0) {
    assetPath = 'scripts/Asset/';
  } else if (depthLevel === 1) {
    assetPath = '../scripts/Asset/';
  } else if (depthLevel === 2) {
    assetPath = '../../scripts/Asset/';
  } else {
    // For deeper nesting, add more "../" as needed
    assetPath = '../'.repeat(depthLevel) + 'scripts/Asset/';
  }
  
  // Debug log to help troubleshoot path issues
  /*
  console.log('Current path:', currentPath);
  console.log('Path parts:', pathParts);
  console.log('Depth level:', depthLevel);
  console.log('Asset path:', assetPath);
  */

  // Load starfield texture for background
  const loader = new THREE.TextureLoader();
  const starTexture = loader.load(assetPath + 'stars_milky_way.jpg');

  // Create a large sphere for the starfield (inside-out)
  const starGeometry = new THREE.SphereGeometry(50, 64, 64);
  const starMaterial = new THREE.MeshBasicMaterial({
    map: starTexture,
    side: THREE.BackSide
  });
  const starField = new THREE.Mesh(starGeometry, starMaterial);
  scene.add(starField);

  // Load Earth textures
  const earthTexture = loader.load(assetPath + 'earth_daymap.jpg');
  const bumpMap = loader.load(assetPath + 'earth_specular_map.tif');
  const nightMap = loader.load(assetPath + 'earth_nightmap.jpg');

  // Earth geometry/material
  const sphereRadius = 3.35; // Adjusted radius for better visibility
  const geometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
  const material = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: bumpMap,
    bumpScale: 0.05,
    specular: 0x222222,
    shininess: 10,
    emissiveMap: nightMap,
    emissive: 0xffffff,
    emissiveIntensity: 1.3
  });
  const earth = new THREE.Mesh(geometry, material);
  earth.position.y = -sphereRadius * 0.6; // Position Earth below center
  scene.add(earth);

  // Load cloud texture
  const cloudTexture = loader.load(assetPath + 'earth_clouds.jpg');

  // Create cloud sphere (slightly larger than Earth)
  const cloudGeometry = new THREE.SphereGeometry(sphereRadius * 1.02, 64, 64);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
  });
  const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloudMesh.position.copy(earth.position);
  scene.add(cloudMesh);

  // Lighting
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
  scene.add(sunLight);
  const ambient = new THREE.AmbientLight(0x222222);
  scene.add(ambient);

  // Real-time day/night: update sun direction based on UTC
  function getSunDirection() {
    const now = new Date();
    const seconds = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
    const siderealDay = 86164; // 23h 56m 4s
    const angle = (seconds / siderealDay) * 2 * Math.PI;
    return new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.0001; // Earth rotation speed
    cloudMesh.rotation.y += 0.00022; // Clouds move slightly faster
    starField.rotation.y += 0.0002; // Starfield rotation for subtle movement
    const sunDir = getSunDirection(); // Get sun direction based on current time
    sunLight.position.copy(sunDir); // Update sun light position
    sunLight.lookAt(earth.position); // Ensure light points at Earth
    renderer.render(scene, camera);
  }
  animate();
}

