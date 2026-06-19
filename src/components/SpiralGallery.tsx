import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Artwork, HelixSettings } from "../types";

interface SpiralGalleryProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  settings: HelixSettings;
  currentTime: string;
}

// ==========================================
// GLSL SHADER CODE
// ==========================================
const vertexShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;
#define PI 3.14159265359

uniform float uScrollSpeed;
uniform float uBowingStrength;
uniform float uScrollLagWeight;

void main() {
    vUv = uv;
    vec3 newPosition = position;
    
    // Local physical plane curvature rounding
    newPosition.z += sin(uv.x * PI) * 0.2;
    
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vWorldPosition = worldPosition;
    
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    
    // The Cinematic Secrets: View-space parabolic global bowing distortion
    viewPosition.x += pow(worldPosition.y, 2.0) * (0.1 * uBowingStrength);
    
    // Dynamic scroll lag weight deformation
    viewPosition.x += sin(uv.y * PI) * uScrollSpeed * (2.0 * uScrollLagWeight);
    
    gl_Position = projectionMatrix * viewPosition;
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;

uniform sampler2D uTexture;
uniform float uColorStrength;
uniform float uZoom;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;
uniform float uRevealProgress;

#define PI 3.14159265359

float roundedRectSDF(vec2 uv, vec2 size, float radius) {
    vec2 d = abs(uv - 0.5) - size * 0.5 + radius;
    return length(max(d, 0.0)) - radius;
}

void main() {
    // Precise Aspect-Ratio Safety Fit (GPU Object-fit Cover)
    vec2 ratio = vec2(
        min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
        min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );
    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    
    vec2 zoomedUv = (uv - 0.5) / uZoom + 0.5;
    vec4 color = texture2D(uTexture, zoomedUv);
    
    // Mix dark layer on hover selection strength
    color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), uColorStrength);
    
    // Dynamic SDF Rounded Corners
    float baseRadius = 0.05;
    float radius = baseRadius * uRevealProgress;
    float sdf = roundedRectSDF(vUv, vec2(uRevealProgress), radius);
    
    float edge = 0.002;
    float alpha = 1.0 - smoothstep(0.0, edge, sdf);
    
    gl_FragColor = vec4(color.rgb, alpha);
}
`;

export default function SpiralGallery({
  artworks,
  onSelectArtwork,
  settings,
  currentTime,
}: SpiralGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Maintain mutable controls reference across state updates
  const controlsRef = useRef({
    easing: 0.1,
    minWheelSpeed: 0.002,
    wheelDirection: 1,
    dragThreshold: 8,
    wheelDeltaY: 0,
    targetWheelDeltaY: 0,
    scrollOffset: 0,
    normalizedMouse: new THREE.Vector2(0, 0),
    isDragging: false,
    lastTouchX: 0,
    touchStartX: 0,
    touchVelocityX: 0,
    isPaused: false,
  });

  // Track reactive parameters in a ref to avoid recreating the Three.js loop
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
    controlsRef.current.minWheelSpeed = settings.autoScrollSpeed;
  }, [settings]);

  const artworksRef = useRef(artworks);
  // Track artwork lists to dynamically swap textures when playlist changes
  useEffect(() => {
    artworksRef.current = artworks;
  }, [artworks]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Exact 32 FOV Lens mapping
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.z = 9.5;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Load Texture Cache
    const textureLoader = new THREE.TextureLoader();
    const textureCache = new Map<string, THREE.Texture>();

    // Fallback colored placeholder generator in case image fails loading
    const createPlaceholderTexture = (colorString: string, text: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 384;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = colorString;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Grid pattern
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(i * 90, 0, 45, canvas.height);
        }

        // Draw elegant metadata typography inside placeholder
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.fillText(text.slice(0, 30), 256, 170);

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "14px monospace";
        ctx.fillText("WebGL Texture Fallback", 256, 210);
      }
      const textur = new THREE.CanvasTexture(canvas);
      textur.minFilter = THREE.LinearFilter;
      return textur;
    };

    const getOrLoadTexture = (url: string, id: string, title: string) => {
      if (textureCache.has(url)) {
        return textureCache.get(url)!;
      }

      // Generate colorful signature from id
      const colors = ["#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6", "#3b82f6"];
      let sum = 0;
      for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
      const color = colors[sum % colors.length];

      // Instant placeholder
      const fallbackTex = createPlaceholderTexture(color, title);
      textureCache.set(url, fallbackTex);

      // Async fetch real image using cross-origin support
      textureLoader.load(
        url,
        (loadedTex) => {
          loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
          loadedTex.generateMipmaps = true;
          fallbackTex.image = loadedTex.image as any;
          fallbackTex.minFilter = loadedTex.minFilter;
          fallbackTex.generateMipmaps = loadedTex.generateMipmaps;
          fallbackTex.needsUpdate = true;
        },
        undefined,
        (err) => {
          console.warn(`Failed loading texture for ${title}, maintaining fallback:`, err);
        }
      );

      return fallbackTex;
    };

    // 5. Build dynamic mesh cards (Double array for comfortable tracking)
    const cardGeometry = new THREE.PlaneGeometry(1.7, 1.0, 32, 2);
    const meshes: THREE.Mesh[] = [];
    const totalCardsCount = 16; // Maintain 16 spiral cylinder slots

    for (let i = 0; i < totalCardsCount; i++) {
      // Loop available artworks
      const artwork = artworksRef.current[i % artworksRef.current.length];
      const tex = getOrLoadTexture(artwork.url, artwork.id, artwork.title);

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexture: { value: tex },
          uColorStrength: { value: 0.0 },
          uZoom: { value: 1.0 },
          uPlaneSizes: { value: new THREE.Vector2(1.7, 1.0) },
          uImageSizes: { value: new THREE.Vector2(512, 384) },
          uRevealProgress: { value: 1.0 },
          uScrollSpeed: { value: 0.0 },
          uBowingStrength: { value: settingsRef.current.bowingStrength },
          uScrollLagWeight: { value: settingsRef.current.scrollSpeedLag },
        },
        side: THREE.DoubleSide,
        transparent: true,
      });

      const mesh = new THREE.Mesh(cardGeometry, material);
      // Custom metadata key to resolve target on click/hover
      mesh.userData = { index: i % artworksRef.current.length, slot: i };
      scene.add(mesh);
      meshes.push(mesh);
    }

    // 6. Inertial Kinetic Physics Listeners
    const controls = controlsRef.current;
    
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      if (controls.isPaused) return;
      controls.targetWheelDeltaY += e.deltaY * 0.00015;
      controls.targetWheelDeltaY = Math.max(Math.min(controls.targetWheelDeltaY, 2.0), -2.0);
      controls.wheelDirection = e.deltaY > 0 ? 1 : -1;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (controls.isPaused) return;
      controls.touchStartX = e.clientX;
      controls.lastTouchX = e.clientX;
      controls.touchVelocityX = 0;
      controls.isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Raycaster screen matrix coordinate calibration
      const rect = renderer.domElement.getBoundingClientRect();
      controls.normalizedMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      controls.normalizedMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (controls.isPaused) return;
      const deltaX = e.clientX - controls.touchStartX;
      if (!controls.isDragging && Math.abs(deltaX) > controls.dragThreshold) {
        controls.isDragging = true;
      }

      if (controls.isDragging) {
        const movementX = -(e.clientX - controls.lastTouchX) * 0.5;
        controls.targetWheelDeltaY -= movementX * 0.003;
        controls.targetWheelDeltaY = Math.max(Math.min(controls.targetWheelDeltaY, 2.0), -2.0);
        controls.wheelDirection = movementX < 0 ? 1 : -1;
        controls.touchVelocityX = movementX;
      }
      controls.lastTouchX = e.clientX;
    };

    const handleMouseUp = () => {
      if (controls.isDragging) {
        controls.targetWheelDeltaY -= controls.touchVelocityX * 0.002;
        controls.targetWheelDeltaY = Math.max(Math.min(controls.targetWheelDeltaY, 2.0), -2.0);
      }
      controls.isDragging = false;
      controls.touchVelocityX = 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (controls.isPaused) return;
      if (e.touches.length > 0) {
        controls.touchStartX = e.touches[0].clientX;
        controls.lastTouchX = e.touches[0].clientX;
        controls.touchVelocityX = 0;
        controls.isDragging = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Calibrate coordinates from touch
      if (e.touches.length > 0) {
        const rect = renderer.domElement.getBoundingClientRect();
        controls.normalizedMouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
        controls.normalizedMouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;

        if (controls.isPaused) return;
        const deltaX = e.touches[0].clientX - controls.touchStartX;
        if (!controls.isDragging && Math.abs(deltaX) > controls.dragThreshold) {
          controls.isDragging = true;
        }

        if (controls.isDragging) {
          const movementX = -(e.touches[0].clientX - controls.lastTouchX) * 0.5;
          controls.targetWheelDeltaY -= movementX * 0.003;
          controls.targetWheelDeltaY = Math.max(Math.min(controls.targetWheelDeltaY, 2.0), -2.0);
          controls.wheelDirection = movementX < 0 ? 1 : -1;
          controls.touchVelocityX = movementX;
        }
        controls.lastTouchX = e.touches[0].clientX;
      }
    };

    // Binding interactions locally on renderer card container
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: true });
    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    renderer.domElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);

    // Click handler for detail selection via Raycaster
    const handleCanvasClick = (e: MouseEvent) => {
      if (controls.isDragging) return;
      raycaster.setFromCamera(controls.normalizedMouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const artIndex = hit.userData.index;
        const activeArtwork = artworksRef.current[artIndex];
        if (activeArtwork) {
          onSelectArtwork(activeArtwork);
        }
      }
    };
    renderer.domElement.addEventListener("click", handleCanvasClick);

    // 7. Raycast hover tracking
    const raycaster = new THREE.Raycaster();
    let hoveredMesh: THREE.Mesh | null = null;

    // 8. Live animation render frame
    let animId: number;
    const tick = () => {
      // Ticking controls inertia exactly following physics update guidelines
      controls.wheelDeltaY += (controls.targetWheelDeltaY - controls.wheelDeltaY) * controls.easing;
      controls.scrollOffset += controls.wheelDeltaY;

      // Perpetual floor mechanics
      if (Math.abs(controls.targetWheelDeltaY) < controls.minWheelSpeed) {
        controls.targetWheelDeltaY = controls.wheelDirection * controls.minWheelSpeed;
      }
      controls.targetWheelDeltaY *= 0.9; // 10% Decay profile

      // Check raycast hovers
      raycaster.setFromCamera(controls.normalizedMouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hoveredMesh !== hit) {
          if (hoveredMesh) {
            const prevMat = hoveredMesh.material as THREE.ShaderMaterial;
            prevMat.uniforms.uZoom.value = 1.0;
            prevMat.uniforms.uColorStrength.value = 0.0;
          }
          hoveredMesh = hit;
        }
        // Smooth interpolation towards hovered state
        const activeMat = hoveredMesh.material as THREE.ShaderMaterial;
        activeMat.uniforms.uZoom.value = THREE.MathUtils.lerp(
          activeMat.uniforms.uZoom.value,
          1.07,
          0.1
        );
        activeMat.uniforms.uColorStrength.value = THREE.MathUtils.lerp(
          activeMat.uniforms.uColorStrength.value,
          0.15,
          0.1
        );
      } else {
        if (hoveredMesh) {
          const activeMat = hoveredMesh.material as THREE.ShaderMaterial;
          activeMat.uniforms.uZoom.value = THREE.MathUtils.lerp(
            activeMat.uniforms.uZoom.value,
            1.0,
            0.1
          );
          activeMat.uniforms.uColorStrength.value = THREE.MathUtils.lerp(
            activeMat.uniforms.uColorStrength.value,
            0.0,
            0.1
          );
          if (Math.abs(activeMat.uniforms.uZoom.value - 1.0) < 0.001) {
            hoveredMesh = null;
          }
        }
      }

      // 9. Calculate cylindrical positions and apply texture swaps on playlist updates
      const centerIndex = Math.floor(totalCardsCount / 2);
      const activeSpecs = settingsRef.current;

      meshes.forEach((mesh, i) => {
        const meshMat = mesh.material as THREE.ShaderMaterial;

        // Sync active uniform parameters in real time
        meshMat.uniforms.uBowingStrength.value = activeSpecs.bowingStrength;
        meshMat.uniforms.uScrollLagWeight.value = activeSpecs.scrollSpeedLag;
        meshMat.uniforms.uScrollSpeed.value = controls.wheelDeltaY;

        // Perform reactive swapping of images if they differ
        const expectedArtwork = artworksRef.current[i % artworksRef.current.length];
        if (expectedArtwork) {
          mesh.userData.index = i % artworksRef.current.length;
          const currentTex = meshMat.uniforms.uTexture.value as THREE.Texture;
          const targetTex = getOrLoadTexture(expectedArtwork.url, expectedArtwork.id, expectedArtwork.title);
          
          if (currentTex !== targetTex) {
            meshMat.uniforms.uTexture.value = targetTex;
            meshMat.uniforms.uTexture.value.needsUpdate = true;
          }
        }

        let N = i - controls.scrollOffset;
        // Double Modulo Recycling boundary math
        N = ((N % totalCardsCount) + totalCardsCount) % totalCardsCount;
        const B = N - centerIndex;

        const U = B * activeSpecs.verticalGap - 0.2;
        const V = B * activeSpecs.angleGap;

        // Maintain the cylindrical coordinate placement geometry
        mesh.position.set(Math.cos(V) * activeSpecs.radius, U, Math.sin(V) * activeSpecs.radius);
        mesh.rotation.y = -V + Math.PI / 2;

        // Focus mode: Dim cards placed further back or highlight center slot
        if (activeSpecs.focusMode) {
          const depthFactor = Math.abs(B) / centerIndex; // 0 at center, 1 at wings
          meshMat.uniforms.uRevealProgress.value = THREE.MathUtils.lerp(
            meshMat.uniforms.uRevealProgress.value,
            1.0 - depthFactor * 0.6,
            0.1
          );
          meshMat.uniforms.uColorStrength.value = THREE.MathUtils.lerp(
            meshMat.uniforms.uColorStrength.value,
            depthFactor * 0.7,
            0.1
          );
        } else {
          meshMat.uniforms.uRevealProgress.value = THREE.MathUtils.lerp(
            meshMat.uniforms.uRevealProgress.value,
            1.0,
            0.1
          );
        }
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    tick();

    // 10. Elastic resize adaptation
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    observer.observe(container);

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      renderer.domElement.removeEventListener("wheel", handleWheel);
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      
      try {
        container.removeChild(renderer.domElement);
      } catch (e) {
        // silent safe catch
      }

      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        }
      });
      textureCache.forEach((tex) => tex.dispose());
    };
  }, [onSelectArtwork]); // Bind purely once, handle configuration reactively inside refs

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full select-none"
      id="canvas-container"
      style={{ cursor: "grab" }}
    />
  );
}
