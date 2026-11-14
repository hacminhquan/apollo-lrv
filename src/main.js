import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  LineLoop,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Quaternion,
  Raycaster,
  Scene,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const smoother = (n) => { const t = clamp01(n); return t * t * (3 - 2 * t); };
const easeInOut = (n) => { const t = clamp01(n); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
const lerp = (a, b, n) => a + (b - a) * n;
const formatTime = (seconds) => { const s = Math.max(0, seconds); const mins = Math.floor(s / 60).toString().padStart(2, '0'); const secs = Math.floor(s % 60).toString().padStart(2, '0'); const hundredths = Math.floor((s % 1) * 100).toString().padStart(2, '0'); return `${mins}:${secs}.${hundredths}`; };

const palette = {
  bg: 0x776963,
  ink: 0x292522,
  ivory: 0xe6ded1,
  aluminium: 0xc3b8a8,
  aluminiumBright: 0xd4cabc,
  gold: 0xb58a50,
  goldLight: 0xd2a766,
  bronze: 0x95673e,
  dark: 0x34302d,
  rubber: 0x272523,
  orange: 0xf5793a,
  green: 0xa8c78e,
  fabric: 0xc7b39a,
  blue: 0x7193a2,
};

const scene = new Scene();
scene.background = new Color(palette.bg);

const camera = new PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(7.4, 4.8, 8.8);

const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = 2;
renderer.outputColorSpace = 'srgb';
renderer.toneMapping = 4;
renderer.toneMappingExposure = 1.08;
renderer.domElement.setAttribute('aria-label', 'Apollo LRV 3D model');
$('#stage').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.enablePan = false;
controls.minDistance = 4.8;
controls.maxDistance = 13.5;
controls.minPolarAngle = 0.34;
controls.maxPolarAngle = 1.45;
controls.target.set(0, 1.0, 0);

const ambient = new AmbientLight(0xffeee4, 1.8);
scene.add(ambient);
const hemi = new HemisphereLight(0xffe7d0, 0x382e2a, 1.65);
scene.add(hemi);
const key = new DirectionalLight(0xffead6, 4.8);
key.position.set(4, 9, 6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -9; key.shadow.camera.right = 9; key.shadow.camera.top = 9; key.shadow.camera.bottom = -7;
key.shadow.bias = -0.0005;
scene.add(key);
const rim = new DirectionalLight(0xd6e4ff, 2.4);
rim.position.set(-6, 4, -6);
scene.add(rim);
const orangeLight = new PointLight(palette.orange, 8, 8, 2);
orangeLight.position.set(-2.5, 2.4, 1.5);
scene.add(orangeLight);

const mat = {
  aluminium: new MeshPhysicalMaterial({ color: palette.aluminium, metalness: 0.93, roughness: 0.28, clearcoat: 0.35, clearcoatRoughness: 0.2 }),
  aluminiumBright: new MeshPhysicalMaterial({ color: palette.aluminiumBright, metalness: 0.96, roughness: 0.18, clearcoat: 0.45 }),
  gold: new MeshPhysicalMaterial({ color: palette.gold, metalness: 0.84, roughness: 0.34, clearcoat: 0.24, clearcoatRoughness: 0.24 }),
  foil: new MeshPhysicalMaterial({ color: palette.goldLight, metalness: 0.74, roughness: 0.23, clearcoat: 0.55, clearcoatRoughness: 0.18, sheen: 0.24, sheenColor: 0xe5c58d }),
  bronze: new MeshStandardMaterial({ color: palette.bronze, metalness: 0.84, roughness: 0.35 }),
  dark: new MeshStandardMaterial({ color: palette.dark, metalness: 0.74, roughness: 0.38 }),
  rubber: new MeshStandardMaterial({ color: palette.rubber, metalness: 0.18, roughness: 0.72 }),
  fabric: new MeshStandardMaterial({ color: palette.fabric, metalness: 0.06, roughness: 0.86 }),
  ivory: new MeshStandardMaterial({ color: palette.ivory, metalness: 0.08, roughness: 0.65 }),
  orange: new MeshStandardMaterial({ color: palette.orange, metalness: 0.34, roughness: 0.28, emissive: palette.orange, emissiveIntensity: 0.22 }),
  screen: new MeshStandardMaterial({ color: palette.blue, metalness: 0.22, roughness: 0.26, emissive: 0x163b48, emissiveIntensity: 0.4 }),
  ground: new MeshStandardMaterial({ color: 0x61544f, metalness: 0.05, roughness: 0.96 }),
};

function box(parent, size, position, material, rotation = [0, 0, 0], name = '') {
  const mesh = new Mesh(new BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}
function cylinder(parent, radiusTop, radiusBottom, height, position, material, rotation = [0, 0, 0], segments = 16, name = '') {
  const mesh = new Mesh(new CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}
function beam(parent, a, b, thickness, material, name = '') {
  const start = new Vector3(...a);
  const end = new Vector3(...b);
  const direction = end.clone().sub(start);
  const mesh = new Mesh(new CylinderGeometry(thickness, thickness, direction.length(), 8), material);
  mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}
function ring(parent, radius, tube, position, material, rotation = [0, 0, 0], name = '') {
  const mesh = new Mesh(new TorusGeometry(radius, tube, 10, 48), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}
function addBolt(parent, position, radius = 0.035, material = mat.dark) {
  return cylinder(parent, radius, radius, 0.04, position, material, [Math.PI / 2, 0, 0], 8);
}
function addFoilStripes(parent, width, height, depth, position) {
  const panel = box(parent, [width, height, depth], position, mat.foil);
  for (let i = 0; i < 5; i += 1) {
    const stripe = box(panel, [width * 0.92, 0.008, depth + 0.006], [-width * 0.01 + (i % 2) * 0.01, -height * 0.35 + i * height * 0.17, 0], i % 2 ? mat.gold : mat.goldLight, [0, 0, (i % 2 ? -0.12 : 0.08)]);
    stripe.castShadow = false;
  }
  return panel;
}
function createLabel(name, text, anchor) {
  const el = document.createElement('div');
  el.className = 'component-label';
  el.textContent = text;
  el.dataset.label = name;
  $('#label-layer').appendChild(el);
  labels.push({ el, anchor, name });
}

const stageGround = new Mesh(new CircleGeometry(8.2, 96), mat.ground);
stageGround.rotation.x = -Math.PI / 2;
stageGround.position.y = -0.015;
stageGround.receiveShadow = true;
scene.add(stageGround);
const groundHalo = new Mesh(new CircleGeometry(5.2, 96), new MeshBasicMaterial({ color: 0x88776e, transparent: true, opacity: 0.46, depthWrite: false }));
groundHalo.rotation.x = -Math.PI / 2;
groundHalo.position.y = 0.002;
scene.add(groundHalo);

const orbitalGroup = new Group();
orbitalGroup.position.set(0, 1.3, 1.35);
for (let i = 0; i < 5; i += 1) {
  const orbit = ring(orbitalGroup, 3.2 + i * 0.58, 0.008, [0, 0, 0], new MeshBasicMaterial({ color: 0xb6a499, transparent: true, opacity: 0.28 }), [Math.PI / 2 + (i % 2) * 0.2, i * 0.14, i * 0.18]);
  orbit.castShadow = false;
}
scene.add(orbitalGroup);

const markerGroup = new Group();
for (let i = 0; i < 7; i += 1) {
  const angle = i * Math.PI * 2 / 7 + .18;
  const x = Math.cos(angle) * (4.2 + (i % 2) * .5);
  const z = Math.sin(angle) * (3.7 + (i % 3) * .2);
  const g = new Group();
  g.position.set(x, .01, z);
  beam(g, [-0.12, 0, 0], [0.12, 0, 0], 0.006, new MeshBasicMaterial({ color: palette.orange, transparent: true, opacity: .45 }));
  beam(g, [0, 0, -0.12], [0, 0, 0.12], 0.006, new MeshBasicMaterial({ color: palette.orange, transparent: true, opacity: .45 }));
  markerGroup.add(g);
}
scene.add(markerGroup);

const roverRoot = new Group();
roverRoot.position.set(0, 0.06, 0);
roverRoot.scale.setScalar(1.18);
scene.add(roverRoot);

const chassis = new Group();
chassis.name = 'ALUMINIUM CHASSIS';
chassis.userData.assembly = 'chassis';
roverRoot.add(chassis);
const frontFrame = new Group(); const centerFrame = new Group(); const rearFrame = new Group();
frontFrame.userData.assembly = 'chassis'; centerFrame.userData.assembly = 'chassis'; rearFrame.userData.assembly = 'chassis';
chassis.add(frontFrame, centerFrame, rearFrame);

function createFrame(frame, z, width, depth) {
  box(frame, [width, .1, .1], [0, .66, z - depth / 2], mat.aluminiumBright, [0, 0, 0], 'frame rail');
  box(frame, [width, .1, .1], [0, .66, z + depth / 2], mat.aluminium, [0, 0, 0], 'frame rail');
  box(frame, [.1, .1, depth], [-width / 2, .66, z], mat.aluminium, [0, 0, 0], 'frame cross member');
  box(frame, [.1, .1, depth], [width / 2, .66, z], mat.aluminiumBright, [0, 0, 0], 'frame cross member');
  [-width / 2 + .16, width / 2 - .16].forEach((x) => { addBolt(frame, [x, .73, z - depth / 2]); addBolt(frame, [x, .73, z + depth / 2]); });
}
createFrame(frontFrame, -1.34, 2.18, .5);
createFrame(centerFrame, 0, 2.08, 1.82);
createFrame(rearFrame, 1.34, 2.18, .5);
box(centerFrame, [1.7, .08, 1.48], [0, .57, 0], mat.aluminium, [0, 0, 0], 'central floor');
box(centerFrame, [1.82, .09, .08], [0, .84, -.7], mat.aluminiumBright);
box(centerFrame, [1.82, .09, .08], [0, .84, .7], mat.aluminiumBright);
for (const x of [-.86, .86]) for (const z of [-.7, .7]) addBolt(centerFrame, [x, .64, z], .042, mat.bronze);

const cableGroup = new Group();
for (const x of [-.9, .9]) {
  const curve = new CatmullRomCurve3([new Vector3(x, .78, -.8), new Vector3(x * 1.1, .93, -.3), new Vector3(x * .8, .86, .4), new Vector3(x * .95, .71, .95)]);
  const tube = new Mesh(new TubeGeometry(curve, 18, .018, 6, false), mat.dark);
  tube.castShadow = true;
  cableGroup.add(tube);
}
centerFrame.add(cableGroup);

const batteryGroup = new Group();
batteryGroup.name = 'BATTERY ASSEMBLY';
batteryGroup.userData.assembly = 'chassis';
for (const x of [-.73, .73]) {
  const pack = new Group(); pack.userData.assembly = 'chassis';
  addFoilStripes(pack, .54, .22, .72, [x, .82, .42]);
  box(pack, [.56, .06, .74], [x, .96, .42], mat.aluminiumBright);
  for (const z of [.17, .42, .67]) addBolt(pack, [x + (x > 0 ? .24 : -.24), .99, z]);
  batteryGroup.add(pack);
}
roverRoot.add(batteryGroup);

const wheelGroups = [];
const wheelMeshes = [];
const wheelPositions = [
  { x: -1.38, z: -1.43, key: 'fl' }, { x: 1.38, z: -1.43, key: 'fr' },
  { x: -1.38, z: 1.43, key: 'rl' }, { x: 1.38, z: 1.43, key: 'rr' },
];
function createWheel(spec, index) {
  const suspension = new Group();
  suspension.name = `${spec.key.toUpperCase()} SUSPENSION`;
  suspension.userData.assembly = 'suspension';
  suspension.position.set(spec.x, .67, spec.z);
  roverRoot.add(suspension);
  const wheel = new Group();
  wheel.name = `${spec.key.toUpperCase()} WIRE-MESH WHEEL`;
  wheel.userData.assembly = 'wheels';
  wheel.position.set(0, -.1, 0);
  suspension.add(wheel);
  wheelGroups.push({ group: wheel, suspension, spec });
  wheelMeshes.push(wheel);

  const tire = ring(wheel, .7, .055, [0, 0, 0], mat.rubber, [0, Math.PI / 2, 0], 'wire mesh wheel');
  tire.rotation.z = Math.PI / 2;
  const outer = ring(wheel, .63, .022, [0, 0, 0], mat.aluminiumBright, [0, Math.PI / 2, 0]);
  outer.rotation.z = Math.PI / 2;
  const inner = ring(wheel, .43, .018, [0, 0, 0], mat.aluminium, [0, Math.PI / 2, 0]);
  inner.rotation.z = Math.PI / 2;
  for (let s = 0; s < 18; s += 1) {
    const spoke = box(wheel, [.035, 1.12, .025], [0, 0, 0], s % 3 === 0 ? mat.aluminiumBright : mat.aluminium, [s * Math.PI / 9, 0, 0], 'mesh spoke');
    spoke.castShadow = true;
  }
  for (let tread = 0; tread < 18; tread += 1) {
    const angle = tread * Math.PI * 2 / 18;
    const chevron = box(wheel, [.12, .12, .23], [0, Math.sin(angle) * .69, Math.cos(angle) * .69], mat.bronze, [angle * .55, 0, angle * .18], 'chevron tread');
    chevron.castShadow = true;
  }
  cylinder(wheel, .28, .28, .17, [0, 0, 0], mat.aluminiumBright, [0, 0, Math.PI / 2], 24, 'hub');
  cylinder(wheel, .12, .14, .25, [0, 0, 0], mat.dark, [0, 0, Math.PI / 2], 16, 'central axle');
  box(wheel, [.26, .42, .38], [0, .08, 0], mat.dark, [0, 0, 0], 'wheel motor housing');
  const fender = new Group(); fender.name = 'GOLD FENDER'; fender.userData.assembly = 'wheels';
  const fenderArc = new Mesh(new TorusGeometry(.79, .075, 8, 24, Math.PI), mat.gold);
  fenderArc.rotation.set(0, Math.PI / 2, Math.PI / 2);
  fenderArc.position.set(0, .04, 0);
  fender.add(fenderArc);
  suspension.add(fender);

  beam(suspension, [0, .25, 0], [-Math.sign(spec.x) * .62, .56, -.08], .055, mat.aluminiumBright, 'upper suspension arm');
  beam(suspension, [0, .05, 0], [-Math.sign(spec.x) * .56, -.02, .08], .055, mat.aluminium, 'lower suspension arm');
  beam(suspension, [-Math.sign(spec.x) * .58, .52, -.08], [-Math.sign(spec.x) * .72, .2, .02], .032, mat.bronze, 'connecting strut');
  cylinder(suspension, .09, .09, .12, [-Math.sign(spec.x) * .64, .52, -.08], mat.dark, [0, 0, Math.PI / 2], 12, 'pivot joint');
  cylinder(suspension, .07, .06, .28, [-Math.sign(spec.x) * .42, .22, 0], mat.dark, [0, 0, Math.PI / 2], 12, 'shock absorber');
  return suspension;
}
wheelPositions.forEach(createWheel);

const seatGroup = new Group();
seatGroup.name = 'ASTRONAUT SEATS';
seatGroup.userData.assembly = 'seats';
roverRoot.add(seatGroup);
const seatUnits = [];
for (const x of [-.48, .48]) {
  const seat = new Group(); seat.userData.assembly = 'seats'; seat.position.set(x, .88, .16); seatUnits.push(seat); seatGroup.add(seat);
  const frame = new Group();
  beam(frame, [-.28, -.25, 0], [-.28, .43, 0], .026, mat.aluminiumBright);
  beam(frame, [.28, -.25, 0], [.28, .43, 0], .026, mat.aluminiumBright);
  beam(frame, [-.28, .43, 0], [.28, .43, 0], .026, mat.aluminiumBright);
  beam(frame, [-.28, -.25, 0], [.28, -.25, 0], .026, mat.aluminiumBright);
  seat.add(frame);
  box(seat, [.56, .09, .48], [0, 0, 0], mat.fabric, [0, 0, 0]);
  box(seat, [.54, .62, .09], [0, .34, 0], mat.fabric, [0, 0, 0]);
  beam(seat, [-.19, .1, -.06], [-.19, .52, -.06], .016, mat.dark);
  beam(seat, [.19, .1, -.06], [.19, .52, -.06], .016, mat.dark);
  box(seat, [.04, .04, .5], [0, .35, .08], mat.bronze);
}

const consoleGroup = new Group();
consoleGroup.name = 'NAVIGATION CONSOLE';
consoleGroup.userData.assembly = 'control';
consoleGroup.position.set(0, 1.17, -.18);
roverRoot.add(consoleGroup);
box(consoleGroup, [.72, .18, .5], [0, 0, 0], mat.dark, [-.14, 0, 0]);
box(consoleGroup, [.57, .035, .35], [0, .11, -.03], mat.aluminium, [-.14, 0, 0]);
box(consoleGroup, [.18, .02, .11], [-.14, .14, -.15], mat.screen, [-.14, 0, 0]);
box(consoleGroup, [.13, .02, .11], [.11, .14, -.15], mat.screen, [-.14, 0, 0]);
for (let i = 0; i < 4; i += 1) cylinder(consoleGroup, .018, .018, .035, [-.25 + i * .09, .14, .06], i % 2 ? mat.orange : mat.ivory, [Math.PI / 2, 0, 0], 8);
const steering = new Group(); steering.userData.assembly = 'control'; steering.position.set(0, .31, .14); consoleGroup.add(steering);
ring(steering, .21, .025, [0, 0, 0], mat.aluminiumBright, [Math.PI / 2, 0, 0]);
beam(steering, [-.16, 0, 0], [.16, 0, 0], .018, mat.dark);
beam(steering, [0, -.16, 0], [0, .16, 0], .018, mat.dark);
cylinder(steering, .045, .045, .18, [0, 0, 0], mat.bronze, [Math.PI / 2, 0, 0], 12);

const antennaGroup = new Group();
antennaGroup.name = 'HIGH-GAIN ANTENNA';
antennaGroup.userData.assembly = 'antenna';
antennaGroup.position.set(0, 1.03, -1.33);
roverRoot.add(antennaGroup);
cylinder(antennaGroup, .19, .22, .14, [0, 0, 0], mat.dark, [0, 0, 0], 20, 'rotating antenna base');
const mast = new Group(); mast.userData.assembly = 'antenna'; mast.position.set(0, .12, 0); antennaGroup.add(mast);
beam(mast, [0, 0, 0], [0, .82, 0], .035, mat.aluminiumBright, 'telescopic mast');
beam(mast, [0, .42, 0], [0, .82, 0], .08, mat.dark, 'mast collar');
const dish = new Group(); dish.userData.assembly = 'antenna'; dish.position.set(0, .86, -.03); mast.add(dish);
const dishMesh = new Mesh(new SphereGeometry(.72, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat.gold);
dishMesh.scale.set(1, .28, 1); dishMesh.rotation.x = Math.PI / 2; dish.add(dishMesh);
for (let rib = 0; rib < 12; rib += 1) {
  const angle = rib * Math.PI * 2 / 12;
  beam(dish, [0, 0, 0], [Math.cos(angle) * .66, Math.sin(angle) * .16, Math.sin(angle) * .66], .014, mat.aluminiumBright, 'dish rib');
}
cylinder(dish, .06, .06, .32, [0, .06, 0], mat.dark, [Math.PI / 2, 0, 0], 12, 'feed assembly');

const cameraGroup = new Group();
cameraGroup.name = 'TELEVISION CAMERA';
cameraGroup.userData.assembly = 'camera';
cameraGroup.position.set(.58, 1.12, 1.06);
roverRoot.add(cameraGroup);
beam(cameraGroup, [0, 0, 0], [0, .46, -.06], .03, mat.aluminiumBright, 'camera bracket');
box(cameraGroup, [.32, .25, .3], [0, .61, -.08], mat.dark, [0, .12, 0], 'television camera housing');
cylinder(cameraGroup, .09, .09, .07, [0, .61, -.25], mat.aluminiumBright, [Math.PI / 2, 0, 0], 18, 'camera lens');
cylinder(cameraGroup, .055, .055, .075, [0, .61, -.29], mat.screen, [Math.PI / 2, 0, 0], 18, 'camera lens glass');

const equipmentGroup = new Group();
equipmentGroup.name = 'EQUIPMENT STORAGE'; equipmentGroup.userData.assembly = 'chassis';
roverRoot.add(equipmentGroup);
box(equipmentGroup, [.52, .35, .65], [-.86, 1.0, 1.05], mat.dark, [0, 0, 0], 'tool carrier');
box(equipmentGroup, [.56, .035, .68], [-.86, 1.18, 1.05], mat.foil);
box(equipmentGroup, [.44, .22, .22], [1.0, .93, .99], mat.bronze, [0, 0, -.08], 'equipment storage');
for (let i = 0; i < 5; i += 1) beam(equipmentGroup, [-1.18 + i * .12, 1.2, .72], [-1.16 + i * .12, 1.2, 1.38], .008, mat.goldLight);

const labels = [];
createLabel('wheel', 'WIRE-MESH WHEEL', new Vector3(1.38, .72, -1.43));
createLabel('suspension', 'INDEPENDENT SUSPENSION', new Vector3(-1.35, 1.28, -1.4));
createLabel('chassis', 'ALUMINIUM CHASSIS', new Vector3(0, .84, .35));
createLabel('console', 'NAVIGATION CONSOLE', new Vector3(0, 1.55, -.2));
createLabel('antenna', 'HIGH-GAIN ANTENNA', new Vector3(0, 2.85, -1.35));
createLabel('camera', 'TELEVISION CAMERA', new Vector3(.72, 1.85, 1.0));
createLabel('battery', 'BATTERY ASSEMBLY', new Vector3(-.85, 1.3, .4));
createLabel('seat', 'ASTRONAUT SEAT', new Vector3(-.58, 1.72, .18));

const mission = [
  { start: 0, end: 2.5, mode: 'ARRIVAL', short: 'ENTRY VECTOR', description: 'Rover enters the lunar test field / suspension response nominal' },
  { start: 2.5, end: 4, mode: 'STATIONARY', short: 'FRONT APPROACH', description: 'Static chassis hold / camera approach to front assembly' },
  { start: 4, end: 6, mode: 'WHEEL INSPECTION', short: 'MESH INSPECTION', description: 'Independent wheel rotation / hub and tread geometry exposed' },
  { start: 6, end: 8, mode: 'SUSPENSION OPEN', short: 'LOAD PATH TRACE', description: 'Four suspension arms extend / pivot joints reveal travel' },
  { start: 8, end: 10, mode: 'CHASSIS OPEN', short: 'FRAME SEPARATION', description: 'Front, centre and rear frame sections separate on rails' },
  { start: 10, end: 12, mode: 'SEAT DEPLOYMENT', short: 'CREW POSITION', description: 'Astronaut seats fold upward / tubular frames release' },
  { start: 12, end: 14, mode: 'CONTROL SYSTEM', short: 'BUS INTERFACE', description: 'Navigation console rises / switches and steering control live' },
  { start: 14, end: 16, mode: 'ANTENNA DEPLOYMENT', short: 'COMMUNICATION LINK', description: 'High-gain dish unfolds / mast extends and acquires link' },
  { start: 16, end: 19, mode: 'FULL TEARDOWN', short: 'MECHANICAL STUDY', description: '330° turntable / major assemblies move to inspection offsets' },
  { start: 19, end: 21, mode: 'REASSEMBLY', short: 'RETURN TO CONFIG', description: 'Assembly offsets reverse / structural interfaces align' },
  { start: 21, end: 23, mode: 'HERO HOLD', short: 'MISSION READY', description: 'Fully assembled vehicle / cinematic three-quarter hold' },
  { start: 23, end: 25, mode: 'DEPARTURE', short: 'EXIT VECTOR', description: 'Drive motors spin up / rover exits the engineering field' },
];

const state = {
  t: 0,
  playing: true,
  section: 0,
  labels: true,
  exploded: false,
  wheelSpin: true,
  turntable: false,
  selected: 'hero',
  pointerDown: false,
  pointerStart: new Vector2(),
  pointerMoved: false,
  cameraAuto: true,
  cameraProgrammatic: false,
};

controls.addEventListener('start', () => {
  if (!state.cameraProgrammatic) state.cameraAuto = false;
});

const powerCells = [];
for (let i = 0; i < 50; i += 1) { const cell = document.createElement('i'); cell.className = 'power-cell'; $('#power-strip').appendChild(cell); powerCells.push(cell); }
const tractionBars = [];
for (let i = 0; i < 18; i += 1) { const bar = document.createElement('i'); $('#traction-bars').appendChild(bar); tractionBars.push(bar); }
const actions = $$('#operator-actions .operator-action');

const raycaster = new Raycaster();
const pointer = new Vector2();
const tmpVector = new Vector3();
const inspectionPresets = {
  hero: { t: 21.5, camera: [7.4, 4.8, 8.8], target: [0, 1, 0] },
  wheels: { t: 4.7, camera: [4.1, 2.8, 4.5], target: [1.05, .75, -1.1] },
  suspension: { t: 6.8, camera: [-4.1, 2.7, 4.2], target: [-1, .9, -1.1] },
  chassis: { t: 8.8, camera: [5.4, 3.1, 5.3], target: [0, .82, 0] },
  seats: { t: 10.8, camera: [3.4, 3.2, 4.2], target: [0, 1.15, .1] },
  control: { t: 12.7, camera: [2.4, 2.4, 3.7], target: [0, 1.4, -.2] },
  antenna: { t: 14.7, camera: [3.6, 3.9, 4.1], target: [0, 1.75, -1.2] },
  camera: { t: 12.5, camera: [3.5, 2.4, 3.8], target: [.5, 1.3, .8] },
};

function currentMissionSection(t = state.t) {
  return mission.findIndex((item, index) => t >= item.start && (t < item.end || index === mission.length - 1)) || 0;
}
function markAssemblyActive(name) {
  $$('.assembly-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.assembly === name));
}
function showToast(text) {
  const toast = $('#toast'); toast.textContent = text; toast.classList.add('show'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1300);
}
function setTimelineTime(next, shouldReset = true) {
  state.t = MathUtils.euclideanModulo(next, 25);
  if (shouldReset) state.cameraAuto = true;
}
function applyInspection(name) {
  const preset = inspectionPresets[name];
  if (!preset) return;
  setTimelineTime(preset.t);
  state.cameraProgrammatic = true;
  camera.position.set(...preset.camera);
  controls.target.set(...preset.target);
  controls.update();
  state.cameraProgrammatic = false;
  state.cameraAuto = false;
  state.selected = name;
  markAssemblyActive(name);
  showToast(`${name.toUpperCase()} / INSPECTION PRESET`);
}

function resetManualDisplayForSection() {
  state.labels = true;
  state.exploded = false;
  state.wheelSpin = true;
  state.cameraAuto = true;
  $$('.toggle-btn').forEach((btn) => btn.classList.toggle('active', state[btn.dataset.toggle]));
}

const cameraKeyframes = [
  { t: 0, position: [8.0, 5.0, 10.0], target: [0, 1.0, 0] },
  { t: 2.5, position: [7.3, 4.5, 8.7], target: [0, 1.0, -.15] },
  { t: 4, position: [4.7, 3.0, 5.4], target: [1.0, .78, -1.05] },
  { t: 6, position: [-4.4, 3.2, 5.1], target: [-.9, .92, -1.0] },
  { t: 8, position: [5.7, 3.4, 6.3], target: [0, .84, 0] },
  { t: 10, position: [3.7, 3.3, 4.8], target: [0, 1.15, .1] },
  { t: 12, position: [2.7, 2.6, 4.0], target: [0, 1.35, -.2] },
  { t: 14, position: [4.3, 4.2, 4.8], target: [0, 1.72, -1.2] },
  { t: 16, position: [7.6, 4.9, 8.5], target: [0, 1.0, 0] },
  { t: 19, position: [7.0, 4.6, 8.2], target: [0, 1.0, 0] },
  { t: 21, position: [7.4, 4.8, 8.8], target: [0, 1.0, 0] },
  { t: 23, position: [8.3, 4.7, 9.4], target: [0, 1.0, .05] },
  { t: 25, position: [8.0, 5.0, 10.0], target: [0, 1.0, 0] },
];
const cameraPositionTarget = new Vector3();
const cameraLookTarget = new Vector3();
function updateMissionCamera(t) {
  if (!state.cameraAuto) return;
  let from = cameraKeyframes[0];
  let to = cameraKeyframes[cameraKeyframes.length - 1];
  for (let i = 0; i < cameraKeyframes.length - 1; i += 1) {
    if (t >= cameraKeyframes[i].t && t <= cameraKeyframes[i + 1].t) { from = cameraKeyframes[i]; to = cameraKeyframes[i + 1]; break; }
  }
  const amount = smoother((t - from.t) / Math.max(.001, to.t - from.t));
  cameraPositionTarget.set(
    lerp(from.position[0], to.position[0], amount),
    lerp(from.position[1], to.position[1], amount),
    lerp(from.position[2], to.position[2], amount),
  );
  cameraLookTarget.set(
    lerp(from.target[0], to.target[0], amount),
    lerp(from.target[1], to.target[1], amount),
    lerp(from.target[2], to.target[2], amount),
  );
  camera.position.lerp(cameraPositionTarget, .075);
  controls.target.lerp(cameraLookTarget, .075);
}

function updateMissionPose(t) {
  const arrival = 1 - smoother(t / 2.5);
  const departure = t >= 23 ? smoother((t - 23) / 2) : 0;
  roverRoot.position.x = lerp(0, -3.2, arrival) + lerp(0, 3.4, departure);
  roverRoot.rotation.y = 0;
  const teardown = smoother((t - 16) / 3);
  const reassembly = t >= 19 ? 1 - smoother((t - 19) / 2) : 0;
  const explode = Math.max(teardown * (1 - smoother((t - 19) / 2)), state.exploded ? 1 : 0);
  const wheelBounce = Math.sin(t * 5.2) * 0.018 * (t < 2.5 || t > 23 ? 1 : 0.12);
  roverRoot.position.y = .06 + wheelBounce;
  roverRoot.rotation.z = Math.sin(t * .9) * .008 * (t < 2.5 || t > 23 ? 1 : .25);
  if (t >= 16 && t < 19) roverRoot.rotation.y = smoother((t - 16) / 3) * Math.PI * 2 * (330 / 360);
  if (t >= 19 && t < 21) roverRoot.rotation.y = Math.PI * 2 * (330 / 360) * (1 - smoother((t - 19) / 2));
  if (state.turntable) roverRoot.rotation.y += t * .28;

  frontFrame.position.z = lerp(0, -.28, explode);
  rearFrame.position.z = lerp(0, .28, explode);
  centerFrame.position.y = lerp(0, .1, explode);
  batteryGroup.position.set(0, lerp(0, .38, explode), lerp(0, .28, explode));
  equipmentGroup.position.set(0, lerp(0, .38, explode), lerp(0, .38, explode));
  cableGroup.position.y = lerp(0, .28, explode);

  wheelGroups.forEach(({ group, suspension, spec }, index) => {
    const side = Math.sign(spec.x);
    const front = Math.sign(spec.z);
    const inspect = smoother((t - 4) / 2);
    const suspensionOpen = smoother((t - 6) / 2) * (1 - smoother((t - 8) / 2));
    const out = explode * (.36 + (index % 2) * .04);
    suspension.position.x = spec.x + side * (suspensionOpen * .22 + out);
    suspension.position.z = spec.z + front * (suspensionOpen * .1 + out * .55);
    suspension.position.y = .67 + Math.sin(t * 5 + index) * .025 * (t < 2.5 || t > 23 ? 1 : .1);
    const spin = state.wheelSpin ? (t * (1.4 + index * .08) + (t < 2.5 ? t * 1.6 : 0)) : 0;
    group.rotation.x = spin * (index % 2 ? -1 : 1);
    group.rotation.z = Math.sin(t * 2 + index) * .025 * inspect;
    suspension.rotation.z = Math.sin(t * 2.4 + index) * .07 * suspensionOpen;
    suspension.userData.travel = suspensionOpen;
  });

  const seatOpen = smoother((t - 10) / 2) * (1 - smoother((t - 12) / 2));
  seatUnits.forEach((seat, index) => {
    seat.rotation.x = -seatOpen * (.38 + index * .06);
    seat.position.y = .88 + seatOpen * .1;
    seat.position.z = .16 + seatOpen * (index ? -.06 : .06);
  });
  seatGroup.position.y = lerp(0, .32, explode);
  seatGroup.position.x = lerp(0, .25, explode);

  const controlOpen = smoother((t - 12) / 2) * (1 - smoother((t - 14) / 2));
  consoleGroup.position.y = 1.17 + controlOpen * .32 + explode * .62;
  consoleGroup.rotation.z = controlOpen * -.04;

  const antennaOpen = t < 14 ? 0 : smoother((t - 14) / 2);
  antennaGroup.position.y = 1.03 + antennaOpen * .32 + explode * .9;
  antennaGroup.rotation.y = antennaOpen * .22 + t * .08 * antennaOpen;
  mast.scale.y = .65 + antennaOpen * .35;
  dish.rotation.x = -antennaOpen * .42;
  dish.rotation.z = Math.sin(t * .7) * .08 * antennaOpen;

  cameraGroup.rotation.y = Math.sin(t * .6) * .18 * (t >= 12 && t < 14 ? 1 : .2);
  cameraGroup.position.y = 1.12 + explode * .58;
  cameraGroup.position.x = .58 + explode * .35;
  cameraGroup.position.z = 1.06 + explode * .28;
  roverRoot.userData.explode = explode;
  roverRoot.userData.reassembly = reassembly;
}

function updateHud(t, dt) {
  const idx = currentMissionSection(t);
  const item = mission[idx];
  if (idx !== state.section) { state.section = idx; resetManualDisplayForSection(); }
  $('#mode-name').textContent = item.mode;
  $('#mode-description').textContent = item.description;
  $('#operation-description').textContent = `${item.short} / ${item.description.split(' / ')[0]}`.toUpperCase();
  $('#timecode').textContent = `${formatTime(t)} / 00:25.00`;
  $('#runtime').textContent = `00:${formatTime(t).slice(3)}`;
  const moving = (t < 2.5 || t > 23) ? 1 : .18;
  const speed = (Math.sin(t * 1.4) * .15 + .45) * moving + (t > 23 ? (t - 23) * 1.4 : 0);
  const spin = state.wheelSpin ? Math.round(speed * 120 + Math.abs(Math.sin(t * 1.4)) * 7) : 0;
  const battery = 86 - (t / 25) * 6 - Math.max(0, speed - .7) * 5;
  const load = Math.round(45 + speed * 30 + (idx >= 6 && idx <= 7 ? 12 : 0));
  $('#speed').textContent = speed.toFixed(1);
  $('#wheel-rate').textContent = `${spin} RPM`;
  $('#distance').textContent = `${(t * speed * .12).toFixed(1).padStart(5, '0')} M`;
  $('#power-load').textContent = `${load}%`;
  $('#battery-capacity').textContent = `${Math.round(battery)}%`;
  $('#remaining-energy').textContent = `${(battery * .098).toFixed(2)} KWH`;
  $('#power-consumption').textContent = `${Math.round(310 + load * 2.7)} W`;
  $('#battery-temp').textContent = `−${(12.4 + load * .025).toFixed(1)} °C`;
  $('#motor-status').textContent = idx === 8 ? '4 / 4 HOLD' : idx === 6 || idx === 7 ? '4 / 4 ACTIVE' : '4 / 4 ACTIVE';
  $('#status').textContent = idx === 8 ? 'INSPECTION' : idx === 9 ? 'REASSEMBLY' : 'NOMINAL';
  $('#drive-state').textContent = moving > .5 ? 'NOMINAL' : 'TRIM';
  $('#steering-state').textContent = idx === 3 ? 'TRACE' : 'TRIM';
  $('#suspension-state').textContent = idx === 3 ? 'EXTENDED' : idx === 0 || idx === 11 ? 'ACTIVE' : 'LOCKED';
  $('#heading').textContent = `${String(Math.round(42 + (t * 8) % 17)).padStart(3, '0')}°`;
  $('#pitch').textContent = `${(Math.sin(t * .7) * 2.2).toFixed(1).padStart(5, '0')}°`;
  $('#roll').textContent = `${(Math.cos(t * .55) * .8).toFixed(1).padStart(5, '0')}°`;
  $('#compass-arrow').style.transform = `rotate(${42 + t * 8}deg)`;
  $('#timeline-progress').style.width = `${t / 25 * 100}%`;
  $('#timeline-thumb').style.left = `${t / 25 * 100}%`;
  actions.forEach((action, i) => action.classList.toggle('active', i <= Math.floor(t / 25 * actions.length)));
  powerCells.forEach((cell, i) => cell.classList.toggle('active', i < Math.round(load / 2)));
  tractionBars.forEach((bar, i) => { const v = 28 + Math.abs(Math.sin(t * 1.6 + i * .6)) * 66 * moving; bar.style.height = `${v}%`; bar.classList.toggle('live', i === Math.floor(t * 1.8) % tractionBars.length); });
  const susp = ['fl', 'fr', 'rl', 'rr'];
  susp.forEach((key, i) => {
    const travel = Math.round((.35 + Math.abs(Math.sin(t * 1.4 + i)) * .45 + (idx === 3 ? .18 : 0)) * 100);
    $(`#susp-${key}`).style.width = `${Math.min(100, travel)}%`;
    $(`#susp-${key}-status`).textContent = idx === 3 ? 'EXTENDED' : idx === 0 || idx === 11 ? 'ACTIVE' : travel > 70 ? 'COMPRESSED' : 'ACTIVE';
  });
  const labelsVisible = state.labels && (idx >= 1 && idx <= 10 || state.selected !== 'hero');
  updateLabels(labelsVisible);
}

function updateLabels(visible) {
  const labelKey = { wheels: 'wheel', suspension: 'suspension', chassis: 'chassis', seats: 'seat', control: 'console', antenna: 'antenna', camera: 'camera', hero: 'chassis' };
  const selectedLabel = labelKey[state.selected] || state.selected;
  const activeNames = state.selected === 'hero' ? ['wheel', 'suspension', 'chassis', 'antenna'] : [selectedLabel, 'chassis', 'antenna'];
  labels.forEach((label) => {
    tmpVector.copy(label.anchor).applyMatrix4(roverRoot.matrixWorld).project(camera);
    const x = (tmpVector.x * .5 + .5) * window.innerWidth;
    const y = (-tmpVector.y * .5 + .5) * window.innerHeight;
    const onScreen = tmpVector.z > -1 && tmpVector.z < 1 && x > 220 && x < window.innerWidth - 220 && y > 110 && y < window.innerHeight - 120;
    label.el.style.left = `${x}px`;
    label.el.style.top = `${y}px`;
    label.el.classList.toggle('show', visible && activeNames.includes(label.name) && onScreen);
  });
}

function handleTimelinePointer(event) {
  const rect = $('#timeline-track').getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
  setTimelineTime(x / rect.width * 25);
  updateMissionPose(state.t);
  updateHud(state.t, 0);
}
let timelineDragging = false;
$('#timeline-track').addEventListener('pointerdown', (event) => { timelineDragging = true; $('#timeline-track').setPointerCapture(event.pointerId); handleTimelinePointer(event); });
$('#timeline-track').addEventListener('pointermove', (event) => { if (timelineDragging) handleTimelinePointer(event); });
$('#timeline-track').addEventListener('pointerup', () => { timelineDragging = false; });
$('#timeline-track').addEventListener('pointercancel', () => { timelineDragging = false; });

$('#play-btn').addEventListener('click', () => {
  state.playing = !state.playing;
  $('#play-btn').setAttribute('aria-label', state.playing ? 'Pause mission' : 'Play mission');
  $('#play-btn span').textContent = state.playing ? 'PAUSE' : 'PLAY';
  $('#play-btn .play-icon').classList.toggle('pause', state.playing);
  if (!state.playing) $('#play-btn .play-icon').style.marginLeft = '2px'; else $('#play-btn .play-icon').style.marginLeft = '';
});
window.addEventListener('keydown', (event) => { if (event.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); $('#play-btn').click(); } });
$$('.assembly-btn').forEach((btn) => btn.addEventListener('click', () => applyInspection(btn.dataset.assembly)));
$$('.toggle-btn').forEach((btn) => btn.addEventListener('click', () => {
  const key = btn.dataset.toggle;
  state[key] = !state[key];
  btn.classList.toggle('active', state[key]);
  if (key === 'exploded' && state.exploded) showToast('EXPLODED / MANUAL VIEW');
}));

renderer.domElement.addEventListener('pointerdown', (event) => { state.pointerDown = true; state.pointerMoved = false; state.pointerStart.set(event.clientX, event.clientY); });
renderer.domElement.addEventListener('pointermove', (event) => { if (state.pointerDown && state.pointerStart.distanceTo(new Vector2(event.clientX, event.clientY)) > 5) state.pointerMoved = true; });
renderer.domElement.addEventListener('pointerup', (event) => {
  if (!state.pointerDown || state.pointerMoved) { state.pointerDown = false; return; }
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(roverRoot.children, true);
  const hit = hits.find((item) => item.object.userData.assembly || item.object.parent?.userData?.assembly);
  if (hit) {
    let node = hit.object;
    while (node && !node.userData.assembly) node = node.parent;
    const assembly = node?.userData.assembly || 'hero';
    applyInspection(assembly);
  }
  state.pointerDown = false;
});

function resize() { const width = window.innerWidth; const height = window.innerHeight; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); }
window.addEventListener('resize', resize);
resize();

let previous = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(.05, (now - previous) / 1000); previous = now;
  if (state.playing && !timelineDragging) state.t = MathUtils.euclideanModulo(state.t + dt, 25);
  updateMissionPose(state.t);
  updateMissionCamera(state.t);
  controls.update();
  updateHud(state.t, dt);
  renderer.render(scene, camera);
}

window.setTimeout(() => $('#loading-cover').classList.add('hidden'), 850);
updateMissionPose(0);
updateHud(0, 0);
animate(performance.now());
