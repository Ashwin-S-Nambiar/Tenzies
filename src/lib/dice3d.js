import {
  CanvasTexture,
  Color,
  DirectionalLight,
  HemisphereLight,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  NoColorSpace,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const GROUPS = [3, 4, 2, 5, 1, 6];

const BASE = {
  1: [0, 0],
  6: [0, 180],
  2: [90, 0],
  5: [-90, 0],
  3: [0, -90],
  4: [0, 90],
};

const SPOTS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const PALETTE = {
  red: '#c2101f',
  ivory: '#f4ede0',
  ink: '#0d0b0a',
};

const RAD = Math.PI / 180;

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const spin = (t) => 1 - (1 - t) ** 3;
const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
const out = (t) => 1 - (1 - t) ** 2;
const inq = (t) => t * t;

function track(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, fn = ease] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * fn((t - t0) / (t1 - t0));
  }
  return keys[keys.length - 1][1];
}

function mask(value) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, size, size);
  const at = [0.28, 0.5, 0.72];
  const r = size * 0.068;
  for (const spot of SPOTS[value]) {
    const x = at[spot % 3] * size;
    const y = at[Math.floor(spot / 3)] * size;
    const grad = g.createRadialGradient(x, y - r * 0.25, 0, x, y, r);
    grad.addColorStop(0, 'rgb(255,190,0)');
    grad.addColorStop(0.75, 'rgb(255,235,0)');
    grad.addColorStop(1, 'rgb(255,255,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = NoColorSpace;
  tex.anisotropy = 4;
  tex.minFilter = LinearFilter;
  return tex;
}

function patch(uniforms) {
  return (shader) => {
    shader.uniforms.uBody = uniforms.body;
    shader.uniforms.uPip = uniforms.pip;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        'uniform vec3 uBody;\nuniform vec3 uPip;\nvoid main() {',
      )
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
  vec4 texel = texture2D( map, vMapUv );
  diffuseColor.rgb = mix( uBody, uPip * ( 0.78 + 0.22 * texel.g ), texel.r );
#endif`,
      );
  };
}

const eulerFor = (d) => {
  const [x, y] = BASE[d.value];
  return { x: x + d.tx * 360, y: y + d.ty * 360, z: (d.tz ?? 0) * 90 };
};

const same = (a, b) => a.x === b.x && a.y === b.y && a.z === b.z;
const mix = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
});

export function createDice(canvas, { tumble, stagger }) {
  let renderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, -1, -2000, 2000);
  camera.position.z = 1000;

  scene.add(new HemisphereLight(0xfff8ef, 0x2f6f6d, 1.9));
  const key = new DirectionalLight(0xfffaf2, 2.9);
  key.position.set(-0.45, 0.75, 0.85);
  scene.add(key);
  const fill = new DirectionalLight(0x9fd0cc, 0.4);
  fill.position.set(0.8, -0.3, 0.6);
  scene.add(fill);

  const geometry = new RoundedBoxGeometry(1, 1, 1, 10, 0.14);
  const masks = {};
  for (const v of [1, 2, 3, 4, 5, 6]) masks[v] = mask(v);

  const dice = [];
  let pad = 0;
  let size = 60;
  let frame = 0;
  let reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener(
    'change',
    (e) => {
      reduce = e.matches;
    },
  );

  function make(id) {
    const uniforms = {
      body: { value: new Color(PALETTE.red) },
      pip: { value: new Color(PALETTE.ivory) },
    };
    const materials = GROUPS.map((v) => {
      const m = new MeshStandardMaterial({
        map: masks[v],
        roughness: 0.65,
        metalness: 0,
      });
      m.onBeforeCompile = patch(uniforms);
      m.customProgramCacheKey = () => 'die';
      return m;
    });
    const mesh = new Mesh(geometry, materials);
    scene.add(mesh);
    return {
      id,
      mesh,
      uniforms,
      x: 0,
      y: 0,
      euler: null,
      roll: null,
      colors: null,
      look: null,
      cheer: null,
      shake: null,
      press: 0,
      pressTo: 0,
    };
  }

  function place(d, now) {
    if (!d.euler) {
      d.mesh.visible = false;
      return false;
    }
    d.mesh.visible = true;
    let a = d.euler;
    let lift = 0;
    let dx = 0;
    let dy = 0;
    let rz = 0;
    if (d.roll) {
      const t = clamp01((now - d.roll.start) / tumble);
      const split = 0.74;
      a =
        t < split
          ? mix(d.roll.from, d.roll.settle, spin(t / split))
          : mix(d.roll.settle, d.roll.to, ease((t - split) / (1 - split)));
      lift = track(t, [
        [0, 0],
        [0.3, 0.1, out],
        [0.62, 0, inq],
        [0.76, 0.02, out],
        [0.88, 0, inq],
      ]);
      if (t >= 1) d.roll = null;
    }
    if (d.cheer) {
      const t = clamp01((now - d.cheer) / 560);
      dy += track(t, [
        [0, 0],
        [0.38, 0.34, out],
        [0.7, 0, inq],
        [0.84, 0.05, out],
        [1, 0, inq],
      ]);
      rz += track(t, [
        [0, 0],
        [0.38, -6],
        [0.7, 0],
      ]);
      if (t >= 1 && now > d.cheer) d.cheer = null;
    }
    if (d.shake) {
      const t = clamp01((now - d.shake.start) / d.shake.dur);
      const k = d.shake.amp;
      dx += track(t, [
        [0, 0],
        [0.2, -0.06 * k],
        [0.45, 0.05 * k],
        [0.7, -0.03 * k],
        [1, 0],
      ]);
      rz += track(t, [
        [0, 0],
        [0.2, -4 * k],
        [0.45, 3 * k],
        [0.7, -1 * k],
        [1, 0],
      ]);
      if (t >= 1 && now > d.shake.start) d.shake = null;
    }
    if (d.colors) {
      const t = clamp01((now - d.colors.start) / 200);
      const e = out(t);
      d.uniforms.body.value.lerpColors(d.colors.body0, d.colors.body1, e);
      d.uniforms.pip.value.lerpColors(d.colors.pip0, d.colors.pip1, e);
      if (t >= 1) d.colors = null;
    }
    d.press += (d.pressTo - d.press) * (reduce ? 1 : 0.35);
    if (Math.abs(d.pressTo - d.press) < 0.002) d.press = d.pressTo;
    const scale = size * (1 - 0.05 * d.press);
    d.mesh.scale.setScalar(scale);
    d.mesh.position.set(d.x + dx * size, -(d.y - (lift + dy) * size), 0);
    d.mesh.rotation.set(a.x * RAD, a.y * RAD, (a.z + rz) * RAD, 'ZXY');
    return d.roll || d.cheer || d.shake || d.colors || d.press !== d.pressTo;
  }

  function draw() {
    frame = 0;
    const now = performance.now();
    let busy = false;
    for (const d of dice) if (place(d, now)) busy = true;
    renderer.render(scene, camera);
    if (busy) frame = requestAnimationFrame(draw);
  }

  const kick = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };

  function lookFor(d, flags) {
    const white = d.locked || d.held;
    return {
      body: white ? PALETTE.ivory : PALETTE.red,
      pip: flags.odd?.has(d.id)
        ? PALETTE.red
        : white
          ? PALETTE.ink
          : PALETTE.ivory,
    };
  }

  return {
    layout(rects, s, p) {
      size = s;
      pad = p;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.left = 0;
      camera.right = w;
      camera.top = 0;
      camera.bottom = -h;
      camera.updateProjectionMatrix();
      rects.forEach((r, i) => {
        if (!dice[i]) dice[i] = make(i);
        dice[i].x = r.x + pad;
        dice[i].y = r.y + pad;
      });
      for (const d of dice) place(d, performance.now());
      renderer.render(scene, camera);
    },
    sync(list, flags) {
      const now = performance.now();
      let changed = false;
      list.forEach((die, i) => {
        const d = dice[i];
        if (!d) return;
        const to = eulerFor(die);
        if (!d.euler) {
          d.euler = to;
          changed = true;
        } else if (!same(d.euler, to)) {
          const from = d.euler;
          d.euler = to;
          if (!reduce && !document.hidden) {
            const dir = Math.sign(to.x - from.x) || 1;
            d.roll = {
              from,
              to,
              settle: { ...to, x: to.x + 8 * dir, z: to.z - 3 * dir },
              start: now + (flags.orders?.[i] ?? 0) * stagger,
            };
          } else {
            d.roll = null;
          }
          changed = true;
        }
        const look = lookFor(die, flags);
        if (!d.look || d.look.body !== look.body || d.look.pip !== look.pip) {
          if (!d.look || reduce) {
            d.uniforms.body.value.set(look.body);
            d.uniforms.pip.value.set(look.pip);
          } else {
            d.colors = {
              start: now,
              body0: d.uniforms.body.value.clone(),
              pip0: d.uniforms.pip.value.clone(),
              body1: new Color(look.body),
              pip1: new Color(look.pip),
            };
          }
          d.look = look;
          changed = true;
        }
      });
      if (!changed) return;
      cancelAnimationFrame(frame);
      draw();
    },
    press(i, down) {
      if (!dice[i]) return;
      dice[i].pressTo = down ? 1 : 0;
      kick();
    },
    cheer() {
      if (reduce) return;
      const now = performance.now();
      for (const d of dice) d.cheer = now + d.id * 55 + 80;
      kick();
    },
    shake(ids, amp = 1, dur = 420, gap = 40) {
      if (reduce) return;
      const now = performance.now();
      for (const d of dice) {
        if (ids.has(d.id)) d.shake = { start: now + d.id * gap, amp, dur };
      }
      kick();
    },
    dispose() {
      cancelAnimationFrame(frame);
      geometry.dispose();
      for (const t of Object.values(masks)) t.dispose();
      for (const d of dice) for (const m of d.mesh.material) m.dispose();
      renderer.dispose();
    },
  };
}
