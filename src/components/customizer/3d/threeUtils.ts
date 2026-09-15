import * as THREE from 'three';
import { FabricType, FitStyle } from '../../../types/garment';

/**
 * Generate procedural fabric bump/normal maps using HTML5 2D Canvas
 */
export function createProceduralFabricTexture(fabric: FabricType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  // Neutral mid-gray base for bump maps
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  switch (fabric) {
    case 'linen':
      // Cross-hatch irregular woven linen slub texture
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 256; i += 6) {
        ctx.beginPath();
        ctx.moveTo(0, i + (Math.random() * 2 - 1));
        ctx.lineTo(256, i + (Math.random() * 2 - 1));
        ctx.stroke();
      }
      ctx.strokeStyle = '#666666';
      for (let j = 0; j < 256; j += 6) {
        ctx.beginPath();
        ctx.moveTo(j + (Math.random() * 2 - 1), 0);
        ctx.lineTo(j + (Math.random() * 2 - 1), 256);
        ctx.stroke();
      }
      break;

    case 'denim':
      // Distinct 45-degree diagonal twill lines
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 1.5;
      for (let offset = -256; offset < 512; offset += 5) {
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset + 256, 256);
        ctx.stroke();
      }
      ctx.strokeStyle = '#9a9a9a';
      ctx.lineWidth = 0.8;
      for (let offset = -256; offset < 512; offset += 5) {
        ctx.beginPath();
        ctx.moveTo(offset + 2, 0);
        ctx.lineTo(offset + 258, 256);
        ctx.stroke();
      }
      break;

    case 'wool':
    case 'cashmere':
      // Fine organic grain/fuzz
      const imgData = ctx.getImageData(0, 0, 256, 256);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 35;
        const val = Math.min(255, Math.max(0, 128 + noise));
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
      break;

    case 'cotton':
    case 'oxford':
    case 'organic_cotton':
      // Balanced mini basket weave
      ctx.strokeStyle = '#737373';
      ctx.lineWidth = 1;
      for (let i = 0; i < 256; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
      }
      for (let j = 0; j < 256; j += 4) {
        ctx.beginPath();
        ctx.moveTo(j, 0);
        ctx.lineTo(j, 256);
        ctx.stroke();
      }
      break;

    case 'silk':
    case 'satin':
      // Very smooth, subtle micro-sheen gradient
      const grad = ctx.createLinearGradient(0, 0, 256, 256);
      grad.addColorStop(0, '#828282');
      grad.addColorStop(0.5, '#888888');
      grad.addColorStop(1, '#828282');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      break;

    default:
      // Standard subtle weave
      ctx.strokeStyle = '#777777';
      ctx.lineWidth = 1;
      for (let i = 0; i < 256; i += 8) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
      }
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/**
 * Fabric material properties based on textile physics
 */
export function getFabricMaterialConfig(fabric: FabricType, baseColor: string, isHeatmap: boolean, fit: FitStyle) {
  if (isHeatmap) {
    // Return tension heatmap shader colors
    let heatColor = '#10b981'; // optimal green
    if (fit === 'ultra_slim') heatColor = '#ef4444'; // high pressure tension red
    else if (fit === 'slim') heatColor = '#f97316'; // snug tension orange
    else if (fit === 'regular') heatColor = '#10b981'; // optimal green
    else if (fit === 'relaxed') heatColor = '#06b6d4'; // relaxed ease cyan
    else if (fit === 'oversized') heatColor = '#3b82f6'; // loose drape blue

    return {
      color: new THREE.Color(heatColor),
      roughness: 0.5,
      metalness: 0.05,
      clearcoat: 0.2,
      clearcoatRoughness: 0.3,
      bumpScale: 0.01,
      wireframe: false
    };
  }

  const color = new THREE.Color(baseColor);

  switch (fabric) {
    case 'silk':
    case 'satin':
      return {
        color,
        roughness: 0.22,
        metalness: 0.12,
        clearcoat: 0.45,
        clearcoatRoughness: 0.15,
        bumpScale: 0.003
      };
    case 'linen':
      return {
        color,
        roughness: 0.88,
        metalness: 0.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.9,
        bumpScale: 0.02
      };
    case 'denim':
      return {
        color,
        roughness: 0.78,
        metalness: 0.02,
        clearcoat: 0.05,
        clearcoatRoughness: 0.8,
        bumpScale: 0.025
      };
    case 'wool':
    case 'cashmere':
      return {
        color,
        roughness: 0.92,
        metalness: 0.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.95,
        bumpScale: 0.018
      };
    case 'velvet':
      return {
        color,
        roughness: 0.65,
        metalness: 0.08,
        clearcoat: 0.25,
        clearcoatRoughness: 0.4,
        bumpScale: 0.012
      };
    case 'cotton':
    case 'oxford':
    case 'organic_cotton':
    default:
      return {
        color,
        roughness: 0.7,
        metalness: 0.01,
        clearcoat: 0.05,
        clearcoatRoughness: 0.7,
        bumpScale: 0.01
      };
  }
}
