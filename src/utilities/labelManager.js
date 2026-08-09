import * as THREE from "three";

export const LABEL_CONFIG = {
  fadeStart: 2500,
  fadeEnd: 16000,
  minScale: 0.85,
  hoverScale: 1.05,
  collisionPadding: 18,
  collisionHysteresis: 6,
  passIntervalMs: 100,
};

export const LABEL_PRIORITY = {
  SELECTED: 4,
  HOVERED: 3,
  FEATURED: 2,
  PLANET: 1,
};

const entries = new Map();
const visibilityState = new Map();

const cameraPosition = new THREE.Vector3();
const projected = new THREE.Vector3();

export function registerLabel(entry) {
  entries.set(entry.id, entry);
  return () => {
    entries.delete(entry.id);
    visibilityState.delete(entry.id);
  };
}

function clamp01(value) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function resolveElement(entry) {
  if (typeof entry.el === "function") return entry.el();
  return entry.el && entry.el.current ? entry.el.current : entry.el;
}

function applyState(el, opacity, scale, interactive) {
  el.style.opacity = String(opacity);
  el.style.transform = `scale(${scale.toFixed(3)})`;
  el.style.pointerEvents = interactive ? "auto" : "none";
}

export function shortLabelName(targetname) {
  if (!targetname) return "";
  const beforeBarycenter = targetname.split("Barycenter")[0];
  if (beforeBarycenter !== targetname) return beforeBarycenter.trim();
  const properName = /^\d+\s+([^()]*)\(/.exec(targetname);
  if (properName && properName[1].trim()) {
    return properName[1]
      .trim()
      .replace(/^[''`]+|[''`]+$/g, "")
      .trim();
  }
  const leadingNumber = /^\d+/.exec(targetname);
  return leadingNumber ? leadingNumber[0] : targetname;
}

export function runLabelPass(camera, gl, size, options = {}) {
  const fadeStart = options.fadeStart ?? LABEL_CONFIG.fadeStart;
  const fadeEnd = options.fadeEnd ?? LABEL_CONFIG.fadeEnd;
  const padding = options.collisionPadding ?? LABEL_CONFIG.collisionPadding;
  const hysteresis =
    options.collisionHysteresis ?? LABEL_CONFIG.collisionHysteresis;

  camera.getWorldPosition(cameraPosition);
  const offscreenMargin = 40;
  const candidates = [];

  for (const entry of entries.values()) {
    const el = resolveElement(entry);
    if (!el || !el.isConnected) continue;

    const position = entry.getPosition ? entry.getPosition() : null;
    if (!position) continue;

    const dist = position.distanceTo(cameraPosition);
    projected.copy(position).project(camera);

    if (projected.z > 1 || projected.z < -1) {
      visibilityState.set(entry.id, false);
      applyState(el, 0, LABEL_CONFIG.minScale, false);
      continue;
    }

    const sx = (projected.x * 0.5 + 0.5) * size.width;
    const sy = (-projected.y * 0.5 + 0.5) * size.height;

    if (
      sx < -offscreenMargin ||
      sx > size.width + offscreenMargin ||
      sy < -offscreenMargin ||
      sy > size.height + offscreenMargin
    ) {
      visibilityState.set(entry.id, false);
      applyState(el, 0, LABEL_CONFIG.minScale, false);
      continue;
    }

    const rect = el.getBoundingClientRect();
    const w = rect.width || 80;
    const h = rect.height || 16;

    candidates.push({
      el,
      dist,
      box: { x: sx - w / 2, y: sy - h / 2, w, h },
      priority: entry.priority ? entry.priority() : LABEL_PRIORITY.PLANET,
      force: entry.force ? entry.force() : false,
      hovered: entry.isHovered ? entry.isHovered() : false,
      interactive: entry.interactive !== false,
      wasVisible: visibilityState.get(entry.id) ?? false,
    });
  }

  candidates.sort((a, b) => b.priority - a.priority || a.dist - b.dist);

  const accepted = [];

  for (const candidate of candidates) {
    const boosted = candidate.force || candidate.hovered;
    const fade = clamp01((fadeEnd - candidate.dist) / (fadeEnd - fadeStart));
    const opacity = boosted ? Math.max(fade, 0.95) : fade;

    let intersects = false;
    if (!candidate.force) {
      const collisionPadding = candidate.wasVisible
        ? Math.max(padding - hysteresis, 0)
        : padding + hysteresis;
      for (const box of accepted) {
        if (
          candidate.box.x < box.x + box.w + collisionPadding &&
          candidate.box.x + candidate.box.w + collisionPadding > box.x &&
          candidate.box.y < box.y + box.h + collisionPadding &&
          candidate.box.y + candidate.box.h + collisionPadding > box.y
        ) {
          intersects = true;
          break;
        }
      }
    }

    if (intersects || opacity <= 0.01) {
      visibilityState.set(candidate.id, false);
      applyState(candidate.el, 0, LABEL_CONFIG.minScale, false);
      continue;
    }

    accepted.push(candidate.box);
    const scale = boosted
      ? LABEL_CONFIG.hoverScale
      : LABEL_CONFIG.minScale + (1 - LABEL_CONFIG.minScale) * opacity;
    visibilityState.set(candidate.id, true);
    applyState(candidate.el, opacity, scale, candidate.interactive);
  }
}
