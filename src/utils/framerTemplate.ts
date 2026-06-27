export const GET_FRAMER_COMPONENT_CODE = (accentColor: string) => `import * as React from "react"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { addPropertyControls, ControlType } from "framer"

// ==========================================
// 1. DYNAMIC VERTEXT & FRAGMENT SHADERS
// ==========================================
const vertexShader = \`
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
    
    // Parabolic global bowing distortion
    viewPosition.x += pow(worldPosition.y, 2.0) * (0.1 * uBowingStrength);
    
    // Dynamic scroll lag weight deformation
    viewPosition.x += sin(uv.y * PI) * uScrollSpeed * (2.0 * uScrollLagWeight);
    
    gl_Position = projectionMatrix * viewPosition;
}
\`;

const fragmentShader = \`
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
\`;

// ==========================================
// 2. MAIN FRAMER CODE COMPONENT
// ==========================================
export default function SpiralHelixGallery(props) {
    const {
        items,
        radius,
        verticalGap,
        angleGap,
        autoScrollSpeed,
        focusMode,
        bowingStrength,
        scrollSpeedLag,
        placeholderColor,
        onClickItem
    } = props

    const containerRef = useRef<HTMLDivElement>(null)

    // Maintain kinetic controls delta references
    const controlsRef = useRef({
        easing: 0.1,
        minWheelSpeed: autoScrollSpeed,
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
    })

    // Track dynamic props reactively
    useEffect(() => {
        controlsRef.current.minWheelSpeed = autoScrollSpeed
    }, [autoScrollSpeed])

    const itemsRef = useRef(items)
    useEffect(() => {
        itemsRef.current = items
    }, [items])

    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const width = container.clientWidth || 800
        const height = container.clientHeight || 600

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100)
        camera.position.z = 9.5

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        container.appendChild(renderer.domElement)

        const textureLoader = new THREE.TextureLoader()
        const textureCache = new Map<string, THREE.Texture>()

        const createFallbackTexture = (colorString: string, titleStr: string) => {
            const canvas = document.createElement("canvas")
            canvas.width = 512
            canvas.height = 384
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.fillStyle = colorString
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                
                // Grid markings
                ctx.fillStyle = "rgba(255,255,255,0.06)"
                for (let i = 0; i < 6; i++) {
                    ctx.fillRect(i * 90, 0, 45, canvas.height)
                }

                ctx.fillStyle = "rgba(255,255,255,0.8)"
                ctx.font = "bold 22px system-ui, sans-serif"
                ctx.textAlign = "center"
                ctx.fillText(titleStr || "Framer CMS Card", 256, 180)
                
                ctx.fillStyle = "rgba(255,255,255,0.4)"
                ctx.font = "14px monospace"
                ctx.fillText("WebGL Canvas Texture", 256, 210)
            }
            const txt = new THREE.CanvasTexture(canvas)
            txt.minFilter = THREE.LinearFilter
            return txt
        }

        const resolveTexture = (url: string, titleText: string, index: number) => {
            if (url && textureCache.has(url)) {
                return textureCache.get(url)!
            }

            const defaultColors = ["#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"]
            const color = defaultColors[index % defaultColors.length]
            const fallback = createFallbackTexture(placeholderColor || color, titleText)

            if (!url) return fallback
            textureCache.set(url, fallback)

            textureLoader.load(
                url,
                (loadedTex) => {
                    loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
                    loadedTex.generateMipmaps = true;
                    fallback.image = loadedTex.image as any;
                    fallback.minFilter = loadedTex.minFilter;
                    fallback.generateMipmaps = loadedTex.generateMipmaps;
                    fallback.needsUpdate = true;
                },
                undefined,
                () => {
                    console.warn(\`Framer Loader: fallback active for \${titleText}\`)
                }
            )

            return fallback
        }

        const cardGeometry = new THREE.PlaneGeometry(1.7, 1.0, 32, 2)
        const meshes: THREE.Mesh[] = []
        const totalSlotsCount = 16

        for (let i = 0; i < totalSlotsCount; i++) {
            const list = itemsRef.current || []
            const item = list[i % Math.max(list.length, 1)] || { title: "Card " + i, url: "" }
            const tex = resolveTexture(item.url, item.title, i)

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
                    uBowingStrength: { value: bowingStrength },
                    uScrollLagWeight: { value: scrollSpeedLag },
                },
                side: THREE.DoubleSide,
                transparent: true,
            })

            const mesh = new THREE.Mesh(cardGeometry, material)
            mesh.userData = { index: i % Math.max(list.length, 1), slot: i }
            scene.add(mesh)
            meshes.push(mesh)
        }

        // Kinetic Drag Engine
        const controls = controlsRef.current

        const onWheel = (e: WheelEvent) => {
            if (controls.isPaused) return
            controls.targetWheelDeltaY += e.deltaY * 0.00015
            controls.targetWheelDeltaY = Math.max(Math.min(controls.targetWheelDeltaY, 2.0), -2.0)
            controls.wheelDirection = e.deltaY > 0 ? 1 : -1
        }

        const onMouseDown = (e: MouseEvent) => {
            if (controls.isPaused) return
            controls.touchStartX = e.clientX
            controls.lastTouchX = e.clientX
            controls.touchVelocityX = 0
            controls.isDragging = false
        }

        const onMouseMove = (e: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect()
            controls.normalizedMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
            controls.normalizedMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

            if (controls.isPaused) return
            const deltaX = e.clientX - controls.touchStartX
            if (!controls.isDragging && Math.abs(deltaX) > controls.dragThreshold) {
                controls.isDragging = true
            }

            if (controls.isDragging) {
                const moveX = -(e.clientX - controls.lastTouchX) * 0.5
                controls.targetWheelDeltaY -= moveX * 0.003
                controls.targetWheelDeltaY = Math.max(Math.min(controls.targetWheelDeltaY, 2.0), -2.0)
                controls.wheelDirection = moveX < 0 ? 1 : -1
                controls.touchVelocityX = moveX
            }
            controls.lastTouchX = e.clientX
        }

        const onMouseUp = () => {
            if (controls.isDragging) {
                controls.targetWheelDeltaY -= controls.touchVelocityX * 0.002
                controls.targetWheelDeltaY = Math.max(Math.min(controls.targetWheelDeltaY, 2.0), -2.0)
            }
            controls.isDragging = false
            controls.touchVelocityX = 0
        }

        const onTouchStart = (e: TouchEvent) => {
            if (controls.isPaused) return
            if (e.touches.length > 0) {
                controls.touchStartX = e.touches[0].clientX
                controls.lastTouchX = e.touches[0].clientX
                controls.touchVelocityX = 0
                controls.isDragging = false
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const rect = renderer.domElement.getBoundingClientRect()
                controls.normalizedMouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1
                controls.normalizedMouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1

                if (controls.isPaused) return
                const deltaX = e.touches[0].clientX - controls.touchStartX
                if (!controls.isDragging && Math.abs(deltaX) > controls.dragThreshold) {
                    controls.isDragging = true
                }

                if (controls.isDragging) {
                    const moveX = -(e.touches[0].clientX - controls.lastTouchX) * 0.5
                    controls.targetWheelDeltaY -= moveX * 0.003
                    controls.targetWheelDeltaY = Math.max(Math.min(controls.targetWheelDeltaY, 2.0), -2.0)
                    controls.wheelDirection = moveX < 0 ? 1 : -1
                    controls.touchVelocityX = moveX
                }
                controls.lastTouchX = e.touches[0].clientX
            }
        }

        renderer.domElement.addEventListener("wheel", onWheel, { passive: true })
        renderer.domElement.addEventListener("mousedown", onMouseDown)
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
        renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true })
        window.addEventListener("touchmove", onTouchMove, { passive: true })
        window.addEventListener("touchend", onMouseUp)

        const onCanvasClick = () => {
            if (controls.isDragging) return
            raycaster.setFromCamera(controls.normalizedMouse, camera)
            const hits = raycaster.intersectObjects(meshes)
            if (hits.length > 0 && onClickItem) {
                const hit = hits[0].object
                const targetIndex = hit.userData.index
                const activeList = itemsRef.current || []
                if (activeList[targetIndex]) {
                    onClickItem(activeList[targetIndex], targetIndex)
                }
            }
        }
        renderer.domElement.addEventListener("click", onCanvasClick)

        const raycaster = new THREE.Raycaster()
        let hoveredMesh: THREE.Mesh | null = null

        let animationFrameId: number
        const renderLoop = () => {
            controls.wheelDeltaY += (controls.targetWheelDeltaY - controls.wheelDeltaY) * controls.easing
            controls.scrollOffset += controls.wheelDeltaY

            if (Math.abs(controls.targetWheelDeltaY) < controls.minWheelSpeed) {
                controls.targetWheelDeltaY = controls.wheelDirection * controls.minWheelSpeed
            }
            controls.targetWheelDeltaY *= 0.9

            raycaster.setFromCamera(controls.normalizedMouse, camera)
            const intersections = raycaster.intersectObjects(meshes)

            if (intersections.length > 0) {
                const hit = intersections[0].object as THREE.Mesh
                if (hoveredMesh !== hit) {
                    if (hoveredMesh) {
                        const m = hoveredMesh.material as THREE.ShaderMaterial
                        m.uniforms.uZoom.value = 1.0
                        m.uniforms.uColorStrength.value = 0.0
                    }
                    hoveredMesh = hit
                }
                const m = hoveredMesh.material as THREE.ShaderMaterial
                m.uniforms.uZoom.value = THREE.MathUtils.lerp(m.uniforms.uZoom.value, 1.07, 0.1)
                m.uniforms.uColorStrength.value = THREE.MathUtils.lerp(m.uniforms.uColorStrength.value, 0.15, 0.1)
            } else {
                if (hoveredMesh) {
                    const m = hoveredMesh.material as THREE.ShaderMaterial
                    m.uniforms.uZoom.value = THREE.MathUtils.lerp(m.uniforms.uZoom.value, 1.0, 0.1)
                    m.uniforms.uColorStrength.value = THREE.MathUtils.lerp(m.uniforms.uColorStrength.value, 0.0, 0.1)
                    if (Math.abs(m.uniforms.uZoom.value - 1.0) < 0.001) {
                        hoveredMesh = null
                    }
                }
            }

            const centerSlot = Math.floor(totalSlotsCount / 2)
            meshes.forEach((mesh, index) => {
                const mat = mesh.material as THREE.ShaderMaterial
                mat.uniforms.uBowingStrength.value = bowingStrength
                mat.uniforms.uScrollLagWeight.value = scrollSpeedLag
                mat.uniforms.uScrollSpeed.value = controls.wheelDeltaY

                const currentList = itemsRef.current || []
                const expectedItem = currentList[index % Math.max(currentList.length, 1)]
                if (expectedItem) {
                    mesh.userData.index = index % Math.max(currentList.length, 1)
                    const curTex = mat.uniforms.uTexture.value as THREE.Texture
                    const wantedTex = resolveTexture(expectedItem.url, expectedItem.title, index)
                    if (curTex !== wantedTex) {
                        mat.uniforms.uTexture.value = wantedTex
                        mat.uniforms.uTexture.value.needsUpdate = true
                    }
                }

                let relativePos = index - controls.scrollOffset
                relativePos = ((relativePos % totalSlotsCount) + totalSlotsCount) % totalSlotsCount
                const deltaCenter = relativePos - centerSlot

                const currentY = deltaCenter * verticalGap - 0.2
                const rotationAngle = deltaCenter * angleGap

                mesh.position.set(Math.cos(rotationAngle) * radius, currentY, Math.sin(rotationAngle) * radius)
                mesh.rotation.y = -rotationAngle + Math.PI / 2

                if (focusMode) {
                    const normalizedDepth = Math.abs(deltaCenter) / centerSlot
                    mat.uniforms.uRevealProgress.value = THREE.MathUtils.lerp(mat.uniforms.uRevealProgress.value, 1.0 - normalizedDepth * 0.6, 0.1)
                    mat.uniforms.uColorStrength.value = THREE.MathUtils.lerp(mat.uniforms.uColorStrength.value, normalizedDepth * 0.7, 0.1)
                } else {
                    mat.uniforms.uRevealProgress.value = THREE.MathUtils.lerp(mat.uniforms.uRevealProgress.value, 1.0, 0.1)
                }
            })

            renderer.render(scene, camera)
            animationFrameId = requestAnimationFrame(renderLoop)
        }

        renderLoop()

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = entry.contentRect.width
                const h = entry.contentRect.height
                camera.aspect = w / h
                camera.updateProjectionMatrix()
                renderer.setSize(w, h)
            }
        })
        resizeObserver.observe(container)

        return () => {
            cancelAnimationFrame(animationFrameId)
            resizeObserver.disconnect()
            renderer.domElement.removeEventListener("wheel", onWheel)
            renderer.domElement.removeEventListener("mousedown", onMouseDown)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
            renderer.domElement.removeEventListener("touchstart", onTouchStart)
            window.removeEventListener("touchmove", onTouchMove)
            window.removeEventListener("touchend", onMouseUp)
            renderer.domElement.removeEventListener("click", onCanvasClick)
            
            try {
                container.removeChild(renderer.domElement)
            } catch (err) {}

            meshes.forEach((m) => {
                m.geometry.dispose()
                if (m.material instanceof THREE.Material) {
                    m.material.dispose()
                }
            })
            textureCache.forEach((t) => t.dispose())
        }
    }, [radius, verticalGap, angleGap, focusMode, bowingStrength, scrollSpeedLag, placeholderColor])

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                cursor: "grab",
                backgroundColor: "transparent",
            }}
        />
    )
}

// ==========================================
// 3. FRAMER PROPERTY STUDIO CONTROLS
// ==========================================
SpiralHelixGallery.defaultProps = {
    radius: 2.0,
    verticalGap: 0.5,
    angleGap: 0.85,
    autoScrollSpeed: 0.002,
    focusMode: true,
    bowingStrength: 1.0,
    scrollSpeedLag: 1.0,
    placeholderColor: "#06b6d4",
    items: [
        {
            title: "Genesis Matrix",
            artist: "Curator Prime",
            url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80",
            description: "Default premium stellar placeholder artwork.",
            category: "cosmic",
            year: "2026"
        },
        {
            title: "Cyberpunk Rain",
            artist: "Sora T",
            url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
            description: "Rain-swept reflections running in electric Tokyo avenues.",
            category: "cyberpunk",
            year: "2025"
        },
        {
            title: "Brutalist Curve",
            artist: "Ando T",
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            description: "Minimal monochromatic structural curvatures.",
            category: "minimalist",
            year: "2025"
        }
    ]
}

addPropertyControls(SpiralHelixGallery, {
    items: {
        type: ControlType.Array,
        title: "CMS Collection mapping",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title (CMS String)" },
                artist: { type: ControlType.String, title: "Artist (CMS String)" },
                url: { type: ControlType.String, title: "Image CDN URL (CMS Link/Image)" },
                description: { type: ControlType.String, title: "Description (CMS Paragraph)" },
                category: { type: ControlType.String, title: "Category Tag (CMS Option)" },
                year: { type: ControlType.String, title: "Creation Year (CMS Number/String)" },
            }
        }
    },
    radius: {
        type: ControlType.Number,
        title: "Helix Radius Cyl",
        min: 1.0,
        max: 4.0,
        step: 0.1,
        defaultValue: 2.0,
    },
    verticalGap: {
        type: ControlType.Number,
        title: "Vertical pitch",
        min: 0.1,
        max: 1.5,
        step: 0.05,
        defaultValue: 0.5,
    },
    angleGap: {
        type: ControlType.Number,
        title: "Angular spacing",
        min: 0.3,
        max: 2.0,
        step: 0.05,
        defaultValue: 0.85,
    },
    autoScrollSpeed: {
        type: ControlType.Number,
        title: "Perpetual speed",
        min: 0,
        max: 0.01,
        step: 0.0005,
        defaultValue: 0.002,
    },
    bowingStrength: {
        type: ControlType.Number,
        title: "Bowing matrix",
        min: 0,
        max: 3.0,
        step: 0.1,
        defaultValue: 1.0,
    },
    scrollSpeedLag: {
        type: ControlType.Number,
        title: "Inertial lag weight",
        min: 0,
        max: 3.0,
        step: 0.1,
        defaultValue: 1.0,
    },
    focusMode: {
        type: ControlType.Boolean,
        title: "Focus depth shaders",
        defaultValue: true,
    },
    placeholderColor: {
        type: ControlType.Color,
        title: "Loading Accent Color",
        defaultValue: "#06b6d4"
    }
})
`;
