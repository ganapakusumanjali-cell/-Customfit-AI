import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Play, 
  Pause, 
  Camera, 
  Layers, 
  Ruler, 
  Activity, 
  Sun, 
  Sparkles,
  RefreshCw,
  User,
  Sliders,
  Flame
} from 'lucide-react';
import { CustomGarmentConfig } from '../../../types/garment';
import { ThreeDGarmentModel, ModelBuildOptions } from './ThreeDGarmentModel';

interface ThreeDMannequinCanvasProps {
  config: CustomGarmentConfig;
  className?: string;
  onSnapshotTaken?: (imgDataUrl: string) => void;
  onRequestExpand?: () => void;
  showExpandButton?: boolean;
}

export const ThreeDMannequinCanvas: React.FC<ThreeDMannequinCanvasProps> = ({
  config,
  className = '',
  onSnapshotTaken,
  onRequestExpand,
  showExpandButton = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<ThreeDGarmentModel | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Lighting references
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.PointLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Interactive 3D Orbit & Camera State
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Model orientation target
  const targetRotationYRef = useRef<number>(0);
  const targetRotationXRef = useRef<number>(0);
  const currentRotationYRef = useRef<number>(0);
  const currentRotationXRef = useRef<number>(0);

  // Camera zoom target
  const targetZoomDistanceRef = useRef<number>(2.5);
  const currentZoomDistanceRef = useRef<number>(2.5);
  const cameraTargetYRef = useRef<number>(0.15);

  // User Interactive Toggles
  const [isTurntableOn, setIsTurntableOn] = useState<boolean>(false);
  const [showMeasurements, setShowMeasurements] = useState<boolean>(false);
  const [isTensionHeatmap, setIsTensionHeatmap] = useState<boolean>(false);
  const [mannequinType, setMannequinType] = useState<'atelier_form' | 'full_body' | 'masculine' | 'feminine'>('atelier_form');
  const [mannequinFinish, setMannequinFinish] = useState<'ecru_linen' | 'noir_obsidian' | 'ivory_porcelain' | 'walnut_brass'>('ecru_linen');
  const [lightingPreset, setLightingPreset] = useState<'atelier_warm' | 'studio_spotlight' | 'daylight' | 'dramatic'>('atelier_warm');
  const [pose, setPose] = useState<'neutral' | 'runway' | 'hands_on_hip' | 'side_profile'>('neutral');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [snapshotFeedback, setSnapshotFeedback] = useState<boolean>(false);

  // Initialize Three.js Scene, Camera, Renderer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.2, 2.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Required for camera snapshot feature
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xfff7f0, 0.9);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.2);
    keyLight.position.set(2, 3, 2.5);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0xe8eeff, 1.2);
    fillLight.position.set(-2.5, 1.5, 2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.PointLight(0xc9365e, 3.5, 8);
    rimLight.position.set(0, 1.5, -2.2);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Studio floor circular shadow pad
    const shadowGeo = new THREE.CircleGeometry(0.65, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.24;
    scene.add(shadowMesh);

    // 5. Build 3D Garment Model
    const model = new ThreeDGarmentModel();
    scene.add(model.rootGroup);
    modelRef.current = model;

    // 6. Animation Render Loop
    const renderLoop = () => {
      // Smooth turntable auto-spin
      if (isTurntableOn) {
        targetRotationYRef.current += 0.008;
      }

      // Smooth damping interpolation (slerp-like smoothing)
      currentRotationYRef.current += (targetRotationYRef.current - currentRotationYRef.current) * 0.12;
      currentRotationXRef.current += (targetRotationXRef.current - currentRotationXRef.current) * 0.12;
      currentZoomDistanceRef.current += (targetZoomDistanceRef.current - currentZoomDistanceRef.current) * 0.12;

      if (modelRef.current) {
        modelRef.current.rootGroup.rotation.y = currentRotationYRef.current;
        modelRef.current.rootGroup.rotation.x = currentRotationXRef.current;
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = currentZoomDistanceRef.current;
        cameraRef.current.position.y = cameraTargetYRef.current;
        cameraRef.current.lookAt(0, cameraTargetYRef.current, 0);
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    // 7. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Clean up
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      if (modelRef.current) modelRef.current.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Lighting Rig on Preset Change
  useEffect(() => {
    if (!ambientLightRef.current || !keyLightRef.current || !fillLightRef.current || !rimLightRef.current) return;

    switch (lightingPreset) {
      case 'studio_spotlight':
        ambientLightRef.current.color.setHex(0xffffff);
        ambientLightRef.current.intensity = 0.8;
        keyLightRef.current.color.setHex(0xffffff);
        keyLightRef.current.intensity = 2.6;
        fillLightRef.current.color.setHex(0xebf2ff);
        fillLightRef.current.intensity = 1.4;
        rimLightRef.current.color.setHex(0xffffff);
        rimLightRef.current.intensity = 1.8;
        break;

      case 'daylight':
        ambientLightRef.current.color.setHex(0xffffff);
        ambientLightRef.current.intensity = 1.1;
        keyLightRef.current.color.setHex(0xfffef5);
        keyLightRef.current.intensity = 2.4;
        fillLightRef.current.color.setHex(0xddf0ff);
        fillLightRef.current.intensity = 1.2;
        rimLightRef.current.color.setHex(0xffea9f);
        rimLightRef.current.intensity = 1.5;
        break;

      case 'dramatic':
        ambientLightRef.current.color.setHex(0x1a121d);
        ambientLightRef.current.intensity = 0.4;
        keyLightRef.current.color.setHex(0xff88a3);
        keyLightRef.current.intensity = 2.8;
        fillLightRef.current.color.setHex(0x7a152d);
        fillLightRef.current.intensity = 1.8;
        rimLightRef.current.color.setHex(0xd4af37);
        rimLightRef.current.intensity = 4.5;
        break;

      case 'atelier_warm':
      default:
        ambientLightRef.current.color.setHex(0xfff5ea);
        ambientLightRef.current.intensity = 0.9;
        keyLightRef.current.color.setHex(0xffebd2);
        keyLightRef.current.intensity = 2.3;
        fillLightRef.current.color.setHex(0xf3e6d8);
        fillLightRef.current.intensity = 1.1;
        rimLightRef.current.color.setHex(0xc9365e);
        rimLightRef.current.intensity = 3.2;
        break;
    }
  }, [lightingPreset]);

  // Rebuild 3D Model whenever garment config or visual options change
  useEffect(() => {
    if (!modelRef.current) return;

    const buildOptions: ModelBuildOptions = {
      config,
      mannequinType,
      mannequinFinish,
      pose,
      showMeasurementGuides: showMeasurements,
      isTensionHeatmap,
      wireframe
    };

    modelRef.current.update(buildOptions);
  }, [
    config,
    mannequinType,
    mannequinFinish,
    pose,
    showMeasurements,
    isTensionHeatmap,
    wireframe
  ]);

  // Pointer / Drag Orbit Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    targetRotationYRef.current += deltaX * 0.009;
    targetRotationXRef.current = Math.max(-0.4, Math.min(0.4, targetRotationXRef.current + deltaY * 0.007));

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.0018;
    targetZoomDistanceRef.current = Math.max(1.3, Math.min(4.0, targetZoomDistanceRef.current + zoomDelta));
  };

  // Quick View Preset Angles
  const setPresetAngle = (angle: 'front' | 'back' | 'left' | 'right' | 'collar') => {
    targetRotationXRef.current = 0;
    cameraTargetYRef.current = 0.15;
    targetZoomDistanceRef.current = 2.5;

    switch (angle) {
      case 'front':
        targetRotationYRef.current = 0;
        break;
      case 'back':
        targetRotationYRef.current = Math.PI;
        break;
      case 'left':
        targetRotationYRef.current = Math.PI / 2;
        break;
      case 'right':
        targetRotationYRef.current = -Math.PI / 2;
        break;
      case 'collar':
        targetRotationYRef.current = 0;
        cameraTargetYRef.current = 0.55;
        targetZoomDistanceRef.current = 1.6;
        break;
    }
  };

  const handleReset = () => {
    targetRotationYRef.current = 0;
    targetRotationXRef.current = 0;
    cameraTargetYRef.current = 0.15;
    targetZoomDistanceRef.current = 2.5;
  };

  const handleZoomStep = (delta: number) => {
    targetZoomDistanceRef.current = Math.max(1.3, Math.min(4.0, targetZoomDistanceRef.current + delta));
  };

  // High-Resolution Snapshot Capture
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    // Render current frame cleanly
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');

    setSnapshotFeedback(true);
    setTimeout(() => setSnapshotFeedback(false), 2000);

    if (onSnapshotTaken) {
      onSnapshotTaken(dataUrl);
    } else {
      // Trigger download
      const link = document.createElement('a');
      link.download = `bespoke_${config.garmentType}_3d_model.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const m = config.measurements;
  const unit = m.unit || 'cm';

  return (
    <div className={`relative flex flex-col h-full bg-gradient-to-b from-[#131115] via-[#0d0c0e] to-[#080709] rounded-2xl border border-[#2b252d] overflow-hidden select-none ${className}`}>
      
      {/* Top 3D Studio HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: View Angles & Turntable */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap">
          {/* Quick Perspective Switcher */}
          <div className="flex items-center bg-[#18141a]/90 backdrop-blur-md rounded-full p-1 border border-[#362e3a] shadow-lg">
            <button
              onClick={() => setPresetAngle('front')}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider text-[#dfd8cb] hover:text-white hover:bg-[#2e2632] transition-colors"
              title="Front Perspective"
            >
              Front
            </button>
            <button
              onClick={() => setPresetAngle('left')}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider text-[#dfd8cb] hover:text-white hover:bg-[#2e2632] transition-colors"
              title="Profile"
            >
              Side
            </button>
            <button
              onClick={() => setPresetAngle('back')}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider text-[#dfd8cb] hover:text-white hover:bg-[#2e2632] transition-colors"
              title="Dorsal Back Seam"
            >
              Back
            </button>
            <button
              onClick={() => setPresetAngle('collar')}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider text-[#dfd8cb] hover:text-white hover:bg-[#2e2632] transition-colors"
              title="Collar & Lapel Close-up"
            >
              Collar
            </button>
          </div>

          {/* Turntable 360 Spin Button */}
          <button
            onClick={() => setIsTurntableOn(!isTurntableOn)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shadow-lg backdrop-blur-md transition-all ${
              isTurntableOn
                ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                : 'bg-[#18141a]/90 border-[#362e3a] text-[#8c8588] hover:text-[#fbf9f6]'
            }`}
            title={isTurntableOn ? 'Pause 360° Turntable' : 'Play 360° Auto-Turntable'}
          >
            {isTurntableOn ? <Pause className="w-3.5 h-3.5 text-rose-400" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[11px]">360°</span>
          </button>
        </div>

        {/* Center Live 3D Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-[#18141a]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#362e3a] text-xs text-[#dfd8cb] pointer-events-auto shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide text-[11px] uppercase text-amber-200">3D Virtual Model</span>
          <span className="text-[#6d666a]">•</span>
          <span className="text-[11px] text-stone-300 capitalize">{config.fit} Fit</span>
        </div>

        {/* Right: Quick Tools: Measurement guides, Tension, Camera Snapshot, Expand */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#18141a]/90 backdrop-blur-md p-1 rounded-full border border-[#362e3a] shadow-lg">
          
          {/* Tension / Fit Heatmap Mode */}
          <button
            onClick={() => setIsTensionHeatmap(!isTensionHeatmap)}
            className={`p-1.5 rounded-full transition-colors ${
              isTensionHeatmap
                ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white'
                : 'text-[#8c8588] hover:text-[#fbf9f6]'
            }`}
            title="Biometric Tension / Ease Heatmap"
          >
            <Flame className="w-4 h-4" />
          </button>

          {/* 3D Measurement Ribbons */}
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`p-1.5 rounded-full transition-colors ${
              showMeasurements ? 'bg-[#7a152d] text-[#fbf9f6]' : 'text-[#8c8588] hover:text-[#fbf9f6]'
            }`}
            title="Toggle 3D Biometric Measurement Rings"
          >
            <Ruler className="w-4 h-4" />
          </button>

          {/* Snapshot Capture */}
          <button
            onClick={handleCaptureSnapshot}
            className="p-1.5 rounded-full text-[#8c8588] hover:text-[#fbf9f6] transition-colors relative"
            title="Capture High-Res 3D Snapshot"
          >
            <Camera className="w-4 h-4" />
            {snapshotFeedback && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-600 text-[10px] text-white whitespace-nowrap shadow">
                Captured!
              </span>
            )}
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full text-[#8c8588] hover:text-[#fbf9f6] transition-colors"
            title="Reset 3D Perspective"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Expand Fitting Room Modal */}
          {showExpandButton && onRequestExpand && (
            <button
              onClick={onRequestExpand}
              className="p-1.5 rounded-full bg-[#251e28] hover:bg-[#342b38] text-rose-300 transition-colors ml-0.5"
              title="Expand 3D Fitting Room Studio"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 3D Canvas Stage with Orbit Drag & Wheel Zoom */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing touch-none overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Visual Cue Overlay for first time users */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#110e13]/80 backdrop-blur-md border border-stone-800/80 text-[11px] text-stone-400 pointer-events-none flex items-center gap-1.5 opacity-80 transition-opacity">
          <RotateCw className="w-3 h-3 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Drag to rotate 360° • Scroll to zoom</span>
        </div>

        {/* 3D Measurement Overlay Badges if toggled */}
        {showMeasurements && (
          <div className="absolute top-16 right-4 pointer-events-none flex flex-col gap-2 z-10 animate-in fade-in duration-300">
            <div className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-rose-500/50 shadow-xl text-right">
              <span className="text-[10px] text-rose-400 font-mono uppercase block">Shoulder Span</span>
              <span className="font-bold text-sm text-white font-mono">{m.shoulder || 45} {unit}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-rose-500/50 shadow-xl text-right">
              <span className="text-[10px] text-rose-400 font-mono uppercase block">Chest Circumference</span>
              <span className="font-bold text-sm text-white font-mono">{m.chest || 98} {unit}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-rose-500/50 shadow-xl text-right">
              <span className="text-[10px] text-rose-400 font-mono uppercase block">Waistline</span>
              <span className="font-bold text-sm text-white font-mono">{m.waist || 83} {unit}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-rose-500/50 shadow-xl text-right">
              <span className="text-[10px] text-rose-400 font-mono uppercase block">Hips / Seat</span>
              <span className="font-bold text-sm text-white font-mono">{m.hip || 98} {unit}</span>
            </div>
          </div>
        )}

        {/* Tension Heatmap Legend if active */}
        {isTensionHeatmap && (
          <div className="absolute top-16 left-4 pointer-events-none p-3 rounded-xl bg-black/90 backdrop-blur-md border border-stone-800 shadow-xl z-10 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[11px] font-semibold text-white uppercase tracking-wider">Tension Analysis</span>
            </div>
            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500" />
                <span className="text-stone-300">High Stress (Snug)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-stone-300">Fitted Pull</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-stone-300">Optimal Ease</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-cyan-500" />
                <span className="text-stone-300">Relaxed Drape</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom 3D Studio Settings Drawer */}
      <div className="px-4 py-3 bg-[#110e13]/95 border-t border-[#272129] flex flex-wrap items-center justify-between gap-3 z-10">
        
        {/* Model Form Switcher */}
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#8c8588]" />
          <span className="text-[11px] text-[#8c8588] uppercase tracking-wider">Form:</span>
          <div className="flex items-center bg-[#1d1820] rounded-lg p-0.5 border border-[#342b38]">
            <button
              onClick={() => setMannequinType('atelier_form')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                mannequinType === 'atelier_form' ? 'bg-[#7a152d] text-white font-medium' : 'text-[#8c8588] hover:text-[#dfd8cb]'
              }`}
            >
              Atelier Bust
            </button>
            <button
              onClick={() => setMannequinType('full_body')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                mannequinType === 'full_body' ? 'bg-[#7a152d] text-white font-medium' : 'text-[#8c8588] hover:text-[#dfd8cb]'
              }`}
            >
              Full Body
            </button>
          </div>
        </div>

        {/* Lighting Atmosphere Selector */}
        <div className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-[#8c8588]" />
          <span className="text-[11px] text-[#8c8588] uppercase tracking-wider">Light:</span>
          <select
            value={lightingPreset}
            onChange={(e) => setLightingPreset(e.target.value as any)}
            className="bg-[#1d1820] border border-[#342b38] rounded-lg px-2 py-0.5 text-[11px] text-[#dfd8cb] focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="atelier_warm">Atelier Chandelier</option>
            <option value="studio_spotlight">Studio Spotlight</option>
            <option value="daylight">Natural Daylight</option>
            <option value="dramatic">Dramatic Runway</option>
          </select>
        </div>

        {/* Zoom In / Out Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoomStep(0.25)}
            className="p-1 rounded-lg bg-[#1d1820] text-[#8c8588] hover:text-white border border-[#342b38] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoomStep(-0.25)}
            className="p-1 rounded-lg bg-[#1d1820] text-[#8c8588] hover:text-white border border-[#342b38] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
