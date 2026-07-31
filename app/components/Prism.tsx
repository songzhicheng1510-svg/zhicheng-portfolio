"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./Prism.css";

type PrismProps = {
  height?: number;
  baseWidth?: number;
  animationType?: "rotate" | "hover" | "3drotate";
  glow?: number;
  offset?: { x?: number; y?: number };
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
};

export default function Prism({
  height = 3.5,
  baseWidth = 5.5,
  animationType = "rotate",
  glow = 1,
  offset = { x: 0, y: 0 },
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = false,
  timeScale = 0.5,
}: PrismProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prismHeight = Math.max(0.001, height);
    const baseHalf = Math.max(0.001, baseWidth) * 0.5;
    const glowAmount = Math.max(0, glow);
    const noiseAmount = Math.max(0, noise);
    const offX = offset.x ?? 0;
    const offY = offset.y ?? 0;
    const saturation = transparent ? 1.5 : 1;
    const screenScale = Math.max(0.001, scale);
    const hue = hueShift || 0;
    const frequency = Math.max(0, colorFrequency || 1);
    const bloomAmount = Math.max(0, bloom || 1);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const motionScale = reducedMotion ? 0 : Math.max(0, timeScale || 1);
    const hoverAmount = Math.max(0, hoverStrength || 1);
    const inertiaAmount = Math.max(0, Math.min(1, inertia || 0.12));

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const renderer = new Renderer({
      dpr,
      alpha: transparent,
      antialias: false,
      powerPreference: "high-performance",
    });
    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    Object.assign(gl.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });
    container.appendChild(gl.canvas);

    const vertex = /* glsl */ `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = /* glsl */ `
      precision highp float;

      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHeight;
      uniform float uBaseHalf;
      uniform mat3 uRot;
      uniform int uUseBaseWobble;
      uniform float uGlow;
      uniform vec2 uOffsetPx;
      uniform float uNoise;
      uniform float uSaturation;
      uniform float uScale;
      uniform float uHueShift;
      uniform float uColorFreq;
      uniform float uBloom;
      uniform float uCenterShift;
      uniform float uInvBaseHalf;
      uniform float uInvHeight;
      uniform float uMinAxis;
      uniform float uPxScale;
      uniform float uTimeScale;

      vec4 tanh4(vec4 x) {
        vec4 e2x = exp(2.0 * x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float sdOctaAnisoInv(vec3 p) {
        vec3 q = vec3(
          abs(p.x) * uInvBaseHalf,
          abs(p.y) * uInvHeight,
          abs(p.z) * uInvBaseHalf
        );
        float m = q.x + q.y + q.z - 1.0;
        return m * uMinAxis * 0.5773502691896258;
      }

      float sdPyramidUpInv(vec3 p) {
        return max(sdOctaAnisoInv(p), -p.y);
      }

      mat3 hueRotation(float a) {
        float c = cos(a);
        float s = sin(a);
        mat3 w = mat3(
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114
        );
        mat3 u = mat3(
           0.701, -0.587, -0.114,
          -0.299,  0.413, -0.114,
          -0.300, -0.588,  0.886
        );
        mat3 v = mat3(
           0.168, -0.331,  0.500,
           0.328,  0.035, -0.500,
          -0.497,  0.296,  0.201
        );
        return w + u * c + v * s;
      }

      void main() {
        vec2 f = (
          gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx
        ) * uPxScale;
        float z = 5.0;
        float d = 0.0;
        vec3 p;
        vec4 o = vec4(0.0);
        mat2 wob = mat2(1.0);

        if (uUseBaseWobble == 1) {
          float t = iTime * uTimeScale;
          float c0 = cos(t);
          float c1 = cos(t + 33.0);
          float c2 = cos(t + 11.0);
          wob = mat2(c0, c1, c2, c0);
        }

        const int STEPS = 100;
        for (int i = 0; i < STEPS; i++) {
          p = vec3(f, z);
          p.xz = p.xz * wob;
          p = uRot * p;
          vec3 q = p;
          q.y += uCenterShift;
          d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
          z -= d;
          o += (
            sin((p.y + z) * uColorFreq + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0
          ) / d;
        }

        o = tanh4(o * o * (uGlow * uBloom) / 1e5);
        vec3 col = o.rgb;
        float n = rand(gl_FragCoord.xy + vec2(iTime));
        col += (n - 0.5) * uNoise;
        col = clamp(col, 0.0, 1.0);

        float lightness = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = clamp(
          mix(vec3(lightness), col, uSaturation),
          0.0,
          1.0
        );

        if (abs(uHueShift) > 0.0001) {
          col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
        }

        gl_FragColor = vec4(col, o.a);
      }
    `;

    const geometry = new Triangle(gl);
    const resolution = new Float32Array(2);
    const offsetPixels = new Float32Array(2);
    const rotation = new Float32Array(9);
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent,
      depthTest: false,
      cullFace: false,
      uniforms: {
        iResolution: { value: resolution },
        iTime: { value: 0 },
        uHeight: { value: prismHeight },
        uBaseHalf: { value: baseHalf },
        uUseBaseWobble: { value: 1 },
        uRot: { value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) },
        uGlow: { value: glowAmount },
        uOffsetPx: { value: offsetPixels },
        uNoise: { value: noiseAmount },
        uSaturation: { value: saturation },
        uScale: { value: screenScale },
        uHueShift: { value: hue },
        uColorFreq: { value: frequency },
        uBloom: { value: bloomAmount },
        uCenterShift: { value: prismHeight * 0.25 },
        uInvBaseHalf: { value: 1 / baseHalf },
        uInvHeight: { value: 1 / prismHeight },
        uMinAxis: { value: Math.min(baseHalf, prismHeight) },
        uPxScale: {
          value:
            1 /
            ((gl.drawingBufferHeight || 1) * 0.1 * screenScale),
        },
        uTimeScale: { value: motionScale },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = container.clientWidth || 1;
      const containerHeight = container.clientHeight || 1;
      renderer.setSize(width, containerHeight);
      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
      offsetPixels[0] = offX * dpr;
      offsetPixels[1] = offY * dpr;
      program.uniforms.uPxScale.value =
        1 / ((gl.drawingBufferHeight || 1) * 0.1 * screenScale);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const setRotation = (
      yawY: number,
      pitchX: number,
      rollZ: number,
    ) => {
      const cy = Math.cos(yawY);
      const sy = Math.sin(yawY);
      const cx = Math.cos(pitchX);
      const sx = Math.sin(pitchX);
      const cz = Math.cos(rollZ);
      const sz = Math.sin(rollZ);

      rotation[0] = cy * cz + sy * sx * sz;
      rotation[1] = cx * sz;
      rotation[2] = -sy * cz + cy * sx * sz;
      rotation[3] = -cy * sz + sy * sx * cz;
      rotation[4] = cx * cz;
      rotation[5] = sy * sz + cy * sx * cz;
      rotation[6] = sy * cx;
      rotation[7] = -sx;
      rotation[8] = cy * cx;
      return rotation;
    };

    let raf = 0;
    let yaw = 0;
    let pitch = 0;
    let roll = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let visible = true;
    const startTime = performance.now();
    const random = () => Math.random();
    const speedX = 0.3 + random() * 0.6;
    const speedY = 0.2 + random() * 0.7;
    const speedZ = 0.1 + random() * 0.5;
    const phaseX = random() * Math.PI * 2;
    const phaseZ = random() * Math.PI * 2;
    const pointer = { x: 0, y: 0, inside: true };
    const lerp = (from: number, to: number, amount: number) =>
      from + (to - from) * amount;

    const render = (timestamp: number) => {
      const time = (timestamp - startTime) * 0.001;
      program.uniforms.iTime.value = time;
      let continueAnimation = motionScale > 0;

      if (animationType === "hover") {
        targetYaw =
          (pointer.inside ? -pointer.x : 0) * 0.6 * hoverAmount;
        targetPitch =
          (pointer.inside ? pointer.y : 0) * 0.6 * hoverAmount;
        yaw = lerp(yaw, targetYaw, inertiaAmount);
        pitch = lerp(pitch, targetPitch, inertiaAmount);
        roll = lerp(roll, 0, 0.1);
        program.uniforms.uRot.value = setRotation(yaw, pitch, roll);

        if (noiseAmount < 1e-6) {
          continueAnimation =
            Math.abs(yaw - targetYaw) >= 1e-4 ||
            Math.abs(pitch - targetPitch) >= 1e-4 ||
            Math.abs(roll) >= 1e-4;
        }
      } else if (animationType === "3drotate") {
        const scaledTime = time * motionScale;
        yaw = scaledTime * speedY;
        pitch = Math.sin(scaledTime * speedX + phaseX) * 0.6;
        roll = Math.sin(scaledTime * speedZ + phaseZ) * 0.5;
        program.uniforms.uRot.value = setRotation(yaw, pitch, roll);
      } else {
        program.uniforms.uRot.value = setRotation(0, 0, 0);
      }

      renderer.render({ scene: mesh });
      if (continueAnimation && visible && !document.hidden) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    const start = () => {
      if (!raf && visible && !document.hidden) {
        raf = requestAnimationFrame(render);
      }
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const width = Math.max(1, window.innerWidth);
      const viewportHeight = Math.max(1, window.innerHeight);
      pointer.x = Math.max(
        -1,
        Math.min(1, (event.clientX - width * 0.5) / (width * 0.5)),
      );
      pointer.y = Math.max(
        -1,
        Math.min(
          1,
          (event.clientY - viewportHeight * 0.5) /
            (viewportHeight * 0.5),
        ),
      );
      pointer.inside = true;
      start();
    };
    const onPointerLeave = () => {
      pointer.inside = false;
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    if (animationType === "hover") {
      program.uniforms.uUseBaseWobble.value = 0;
      window.addEventListener("pointermove", onPointerMove, {
        passive: true,
      });
      window.addEventListener("mouseleave", onPointerLeave);
      window.addEventListener("blur", onPointerLeave);
    } else if (animationType === "3drotate") {
      program.uniforms.uUseBaseWobble.value = 0;
    }

    let intersectionObserver: IntersectionObserver | null = null;
    if (suspendWhenOffscreen) {
      intersectionObserver = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) start();
        else stop();
      });
      intersectionObserver.observe(container);
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
      );
      if (animationType === "hover") {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("mouseleave", onPointerLeave);
        window.removeEventListener("blur", onPointerLeave);
      }
      if (gl.canvas.parentElement === container) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    height,
    baseWidth,
    animationType,
    glow,
    noise,
    offset.x,
    offset.y,
    scale,
    transparent,
    hueShift,
    colorFrequency,
    timeScale,
    hoverStrength,
    inertia,
    bloom,
    suspendWhenOffscreen,
  ]);

  return <div className="prism-container" ref={containerRef} />;
}

