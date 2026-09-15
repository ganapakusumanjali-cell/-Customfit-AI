import * as THREE from 'three';
import { CustomGarmentConfig, MannequinPose } from '../../../types/garment';
import { createProceduralFabricTexture, getFabricMaterialConfig } from './threeUtils';

export interface ModelBuildOptions {
  config: CustomGarmentConfig;
  mannequinType: 'atelier_form' | 'full_body' | 'masculine' | 'feminine';
  mannequinFinish: 'ecru_linen' | 'noir_obsidian' | 'ivory_porcelain' | 'walnut_brass';
  pose: 'neutral' | 'runway' | 'hands_on_hip' | 'side_profile';
  showMeasurementGuides: boolean;
  isTensionHeatmap: boolean;
  wireframe: boolean;
}

export class ThreeDGarmentModel {
  public rootGroup: THREE.Group;
  public mannequinGroup: THREE.Group;
  public garmentGroup: THREE.Group;
  public guidesGroup: THREE.Group;

  private fabricTexture: THREE.CanvasTexture | null = null;
  private currentFabricType: string = '';

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'ThreeDGarmentRoot';

    this.mannequinGroup = new THREE.Group();
    this.mannequinGroup.name = 'MannequinGroup';
    this.rootGroup.add(this.mannequinGroup);

    this.garmentGroup = new THREE.Group();
    this.garmentGroup.name = 'GarmentGroup';
    this.rootGroup.add(this.garmentGroup);

    this.guidesGroup = new THREE.Group();
    this.guidesGroup.name = 'GuidesGroup';
    this.rootGroup.add(this.guidesGroup);
  }

  /**
   * Rebuild the entire 3D model (mannequin + tailored garment + measurement guides)
   */
  public update(options: ModelBuildOptions) {
    // Clear previous children cleanly
    this.clearGroup(this.mannequinGroup);
    this.clearGroup(this.garmentGroup);
    this.clearGroup(this.guidesGroup);

    const { config, mannequinType, mannequinFinish, pose, showMeasurementGuides, isTensionHeatmap, wireframe } = options;

    // Measurement scale multipliers based on standard defaults: shoulder=45cm, chest=98cm, waist=83cm, hip=98cm
    const shoulderVal = config.measurements.shoulder || 45;
    const chestVal = config.measurements.chest || 98;
    const waistVal = config.measurements.waist || 83;
    const hipVal = config.measurements.hip || 98;

    const shoulderScale = Math.max(0.8, Math.min(1.25, shoulderVal / 45));
    const chestScale = Math.max(0.8, Math.min(1.25, chestVal / 98));
    const waistScale = Math.max(0.75, Math.min(1.3, waistVal / 83));
    const hipScale = Math.max(0.8, Math.min(1.25, hipVal / 98));

    // Determine fit ease (outer volume offset)
    let fitEase = 1.0;
    if (config.fit === 'ultra_slim') fitEase = 0.96;
    else if (config.fit === 'slim') fitEase = 0.98;
    else if (config.fit === 'relaxed') fitEase = 1.05;
    else if (config.fit === 'oversized') fitEase = 1.12;

    // 1. Build the Mannequin Form
    this.buildMannequin({
      mannequinType,
      mannequinFinish,
      shoulderScale,
      chestScale,
      waistScale,
      hipScale,
      pose
    });

    // 2. Build the Bespoke Garment Mesh
    this.buildGarment({
      config,
      shoulderScale,
      chestScale,
      waistScale,
      hipScale,
      fitEase,
      pose,
      mannequinType,
      isTensionHeatmap,
      wireframe
    });

    // 3. Build 3D Measurement Guidance Ribbons
    if (showMeasurementGuides) {
      this.buildMeasurementGuides({
        config,
        shoulderScale,
        chestScale,
        waistScale,
        hipScale
      });
    }
  }

  /**
   * Constructs anatomical couture mannequin form
   */
  private buildMannequin({
    mannequinType,
    mannequinFinish,
    shoulderScale,
    chestScale,
    waistScale,
    hipScale,
    pose
  }: {
    mannequinType: string;
    mannequinFinish: string;
    shoulderScale: number;
    chestScale: number;
    waistScale: number;
    hipScale: number;
    pose: string;
  }) {
    // Determine mannequin material
    let bodyMat: THREE.Material;
    let standMat: THREE.Material;
    let seamTapeMat: THREE.Material;

    if (mannequinFinish === 'noir_obsidian') {
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0x181619,
        roughness: 0.35,
        metalness: 0.25
      });
      standMat = new THREE.MeshStandardMaterial({
        color: 0x221f24,
        roughness: 0.2,
        metalness: 0.85
      });
      seamTapeMat = new THREE.MeshBasicMaterial({ color: 0x3d3542 });
    } else if (mannequinFinish === 'ivory_porcelain') {
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf3efe6,
        roughness: 0.2,
        metalness: 0.05
      });
      standMat = new THREE.MeshStandardMaterial({
        color: 0xc89d42, // polished gold/brass
        roughness: 0.25,
        metalness: 0.8
      });
      seamTapeMat = new THREE.MeshBasicMaterial({ color: 0x999084 });
    } else if (mannequinFinish === 'walnut_brass') {
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0x2e1b12,
        roughness: 0.4,
        metalness: 0.1
      });
      standMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.9
      });
      seamTapeMat = new THREE.MeshBasicMaterial({ color: 0x6e4a36 });
    } else {
      // Default: Classic French Atelier Ecru Linen Dress Form
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0xeae4d5,
        roughness: 0.85,
        metalness: 0.0
      });
      standMat = new THREE.MeshStandardMaterial({
        color: 0x1f1d1f, // Cast iron black stand
        roughness: 0.45,
        metalness: 0.75
      });
      seamTapeMat = new THREE.MeshBasicMaterial({ color: 0x2c272a }); // Black sartorial tape
    }

    // A. Mannequin Pedestal Stand
    const standGroup = new THREE.Group();
    // Heavy circular bevelled cast iron base
    const baseGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.04, 32);
    const baseMesh = new THREE.Mesh(baseGeo, standMat);
    baseMesh.position.y = -1.25;
    baseMesh.receiveShadow = true;
    standGroup.add(baseMesh);

    // Decorative stepped inner base ring
    const baseRingGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.03, 32);
    const baseRingMesh = new THREE.Mesh(baseRingGeo, standMat);
    baseRingMesh.position.y = -1.22;
    standGroup.add(baseRingMesh);

    // Vertical telescopic steel/brass pole
    const poleGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.7, 24);
    const poleMesh = new THREE.Mesh(poleGeo, standMat);
    poleMesh.position.y = -0.4;
    standGroup.add(poleMesh);

    // Top neck cap / finial (traditional wooden or brass finial)
    const finialGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.08, 24);
    const finialMesh = new THREE.Mesh(finialGeo, standMat);
    finialMesh.position.y = 0.82;
    standGroup.add(finialMesh);

    const finialTopGeo = new THREE.SphereGeometry(0.045, 20, 16);
    const finialTopMesh = new THREE.Mesh(finialTopGeo, standMat);
    finialTopMesh.position.y = 0.88;
    standGroup.add(finialTopMesh);

    this.mannequinGroup.add(standGroup);

    // B. Anatomical Dress Form Torso
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'TorsoGroup';

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.075, 0.088, 0.16, 24);
    const neckMesh = new THREE.Mesh(neckGeo, bodyMat);
    neckMesh.position.y = 0.72;
    torsoGroup.add(neckMesh);

    // Torso slices constructed via a contoured Lathe or compound spline
    // Upper Chest & Shoulders
    const chestWidth = 0.28 * shoulderScale;
    const chestDepth = 0.16 * chestScale;
    const chestGeo = new THREE.CylinderGeometry(chestWidth * 0.92, chestWidth, 0.26, 32);
    const chestMesh = new THREE.Mesh(chestGeo, bodyMat);
    chestMesh.position.y = 0.52;
    chestMesh.scale.set(1, 1, chestDepth / (0.28 * shoulderScale));
    torsoGroup.add(chestMesh);

    // Shoulder arm-hole caps (vintage padded dress form shoulder ends)
    const armCapGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const leftArmCap = new THREE.Mesh(armCapGeo, standMat);
    leftArmCap.position.set(-chestWidth * 1.04, 0.56, 0);
    leftArmCap.scale.set(0.6, 1.2, 0.8);
    torsoGroup.add(leftArmCap);

    const rightArmCap = new THREE.Mesh(armCapGeo, standMat);
    rightArmCap.position.set(chestWidth * 1.04, 0.56, 0);
    rightArmCap.scale.set(0.6, 1.2, 0.8);
    torsoGroup.add(rightArmCap);

    // Mid Torso (Bust to Waist cinch)
    const midTorsoGeo = new THREE.CylinderGeometry(chestWidth, 0.21 * waistScale, 0.28, 32);
    const midTorsoMesh = new THREE.Mesh(midTorsoGeo, bodyMat);
    midTorsoMesh.position.y = 0.26;
    midTorsoMesh.scale.set(1, 1, (chestDepth * 0.85) / chestWidth);
    torsoGroup.add(midTorsoMesh);

    // Lower Torso & Pelvis (Waist to Hip flare)
    const hipsWidth = 0.27 * hipScale;
    const hipsDepth = 0.17 * hipScale;
    const lowerTorsoGeo = new THREE.CylinderGeometry(0.21 * waistScale, hipsWidth, 0.32, 32);
    const lowerTorsoMesh = new THREE.Mesh(lowerTorsoGeo, bodyMat);
    lowerTorsoMesh.position.y = -0.04;
    lowerTorsoMesh.scale.set(1, 1, hipsDepth / hipsWidth);
    torsoGroup.add(lowerTorsoMesh);

    // Bottom base plate of dress form (under-crotch plate)
    const formBottomGeo = new THREE.CylinderGeometry(hipsWidth, hipsWidth * 0.9, 0.06, 32);
    const formBottomMesh = new THREE.Mesh(formBottomGeo, standMat);
    formBottomMesh.position.y = -0.22;
    formBottomMesh.scale.set(1, 1, hipsDepth / hipsWidth);
    torsoGroup.add(formBottomMesh);

    // C. Traditional Sartorial Seam Tape Lines
    // Center Front vertical line
    const cfLineGeo = new THREE.BoxGeometry(0.005, 0.82, 0.005);
    const cfLineMesh = new THREE.Mesh(cfLineGeo, seamTapeMat);
    cfLineMesh.position.set(0, 0.25, chestDepth * 0.98);
    torsoGroup.add(cfLineMesh);

    // Waistline horizontal tape ring
    const waistRingGeo = new THREE.TorusGeometry(0.215 * waistScale, 0.004, 8, 32);
    const waistRingMesh = new THREE.Mesh(waistRingGeo, seamTapeMat);
    waistRingMesh.rotation.x = Math.PI / 2;
    waistRingMesh.position.y = 0.12;
    waistRingMesh.scale.set(1, hipsDepth / hipsWidth, 1);
    torsoGroup.add(waistRingMesh);

    // Princess Seams (Left & Right chest)
    const princessGeo = new THREE.BoxGeometry(0.003, 0.55, 0.003);
    const leftPrincess = new THREE.Mesh(princessGeo, seamTapeMat);
    leftPrincess.position.set(-chestWidth * 0.45, 0.38, chestDepth * 0.92);
    leftPrincess.rotation.z = 0.06;
    torsoGroup.add(leftPrincess);

    const rightPrincess = new THREE.Mesh(princessGeo, seamTapeMat);
    rightPrincess.position.set(chestWidth * 0.45, 0.38, chestDepth * 0.92);
    rightPrincess.rotation.z = -0.06;
    torsoGroup.add(rightPrincess);

    // D. If Full Body or Pose is requested, add articulated limbs / legs
    if (mannequinType === 'full_body' || mannequinType === 'masculine' || mannequinType === 'feminine') {
      const legGeo = new THREE.CylinderGeometry(0.08 * hipScale, 0.055, 0.85, 20);

      // Left Leg
      const leftLeg = new THREE.Mesh(legGeo, bodyMat);
      leftLeg.position.set(-0.13 * hipScale, -0.68, 0);
      if (pose === 'runway') {
        leftLeg.position.z = 0.12;
        leftLeg.rotation.x = -0.15;
      }
      torsoGroup.add(leftLeg);

      // Right Leg
      const rightLeg = new THREE.Mesh(legGeo, bodyMat);
      rightLeg.position.set(0.13 * hipScale, -0.68, 0);
      if (pose === 'runway') {
        rightLeg.position.z = -0.12;
        rightLeg.rotation.x = 0.15;
      }
      torsoGroup.add(rightLeg);

      // Mannequin Head for full body
      const headGeo = new THREE.SphereGeometry(0.1, 24, 20);
      const headMesh = new THREE.Mesh(headGeo, bodyMat);
      headMesh.position.y = 0.96;
      headMesh.scale.set(0.85, 1.15, 0.95);
      torsoGroup.add(headMesh);
    }

    this.mannequinGroup.add(torsoGroup);
  }

  /**
   * Constructs the 3D bespoke tailored garment mesh around the mannequin
   */
  private buildGarment({
    config,
    shoulderScale,
    chestScale,
    waistScale,
    hipScale,
    fitEase,
    pose,
    mannequinType,
    isTensionHeatmap,
    wireframe
  }: {
    config: CustomGarmentConfig;
    shoulderScale: number;
    chestScale: number;
    waistScale: number;
    hipScale: number;
    fitEase: number;
    pose: string;
    mannequinType: string;
    isTensionHeatmap: boolean;
    wireframe: boolean;
  }) {
    const { garmentType, fabric, sleeve, neckline, length, closure, details, color } = config;

    // Cache or generate fabric bump texture
    if (!this.fabricTexture || this.currentFabricType !== fabric) {
      this.fabricTexture = createProceduralFabricTexture(fabric);
      this.currentFabricType = fabric;
    }

    // Material setup
    const matConfig = getFabricMaterialConfig(fabric, color.hex, isTensionHeatmap, config.fit);
    const garmentMat = new THREE.MeshPhysicalMaterial({
      ...matConfig,
      wireframe,
      bumpMap: isTensionHeatmap ? null : this.fabricTexture,
      side: THREE.DoubleSide
    });

    const isDark = isColorDark(color.hex);
    const accentMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xede8dd : 0x221f24,
      roughness: 0.3,
      metalness: 0.5
    });

    const goldBrassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });

    const isBottomOnly = garmentType === 'trousers' || garmentType === 'skirt';
    const isDress = garmentType === 'dress' || garmentType === 'blazer_dress' || garmentType === 'cocktail_dress' || garmentType === 'sundress';

    // 1. Bodice / Torso / Coat (Upper body)
    if (!isBottomOnly) {
      this.buildBodice({
        garmentType,
        shoulderScale,
        chestScale,
        waistScale,
        hipScale,
        fitEase,
        length,
        garmentMat,
        accentMat,
        goldBrassMat,
        closure,
        details,
        sleeve,
        neckline,
        pose
      });
    }

    // 2. Bottom Garment (Trousers, Skirt, or Dress extension)
    if (garmentType === 'trousers') {
      this.buildTrousers({
        waistScale,
        hipScale,
        fitEase,
        length,
        garmentMat,
        accentMat,
        pose
      });
    } else if (garmentType === 'skirt') {
      this.buildSkirt({
        waistScale,
        hipScale,
        fitEase,
        length,
        garmentMat
      });
    } else if (isDress) {
      this.buildDressSkirt({
        garmentType,
        waistScale,
        hipScale,
        fitEase,
        length,
        garmentMat
      });
    }
  }

  /**
   * Upper Body / Bodice Mesh Builder
   */
  private buildBodice({
    garmentType,
    shoulderScale,
    chestScale,
    waistScale,
    hipScale,
    fitEase,
    length,
    garmentMat,
    accentMat,
    goldBrassMat,
    closure,
    details,
    sleeve,
    neckline,
    pose
  }: any) {
    const bodiceGroup = new THREE.Group();
    bodiceGroup.name = 'BodiceGroup';

    const baseShoulder = 0.29 * shoulderScale * fitEase;
    const baseChest = 0.29 * shoulderScale * fitEase;
    const chestDepth = 0.175 * chestScale * fitEase;
    const waistRadius = 0.22 * waistScale * fitEase;

    // Hem Y calculation
    let hemY = -0.16; // standard shirt hem
    let hemRadius = 0.26 * hipScale * fitEase;
    if (length === 'cropped') {
      hemY = 0.08;
      hemRadius = waistRadius * 1.05;
    } else if (length === 'long' || garmentType === 'jacket' || garmentType === 'tuxedo') {
      hemY = -0.28;
      hemRadius = 0.29 * hipScale * fitEase;
    }

    // Upper Bodice Shell
    const upperBodiceGeo = new THREE.CylinderGeometry(baseShoulder, baseChest, 0.27, 32, 1, true);
    const upperBodiceMesh = new THREE.Mesh(upperBodiceGeo, garmentMat);
    upperBodiceMesh.position.y = 0.52;
    upperBodiceMesh.scale.set(1, 1, chestDepth / baseChest);
    bodiceGroup.add(upperBodiceMesh);

    // Mid Bodice Shell (Chest to Waist)
    const midBodiceGeo = new THREE.CylinderGeometry(baseChest, waistRadius, 0.29, 32, 1, true);
    const midBodiceMesh = new THREE.Mesh(midBodiceGeo, garmentMat);
    midBodiceMesh.position.y = 0.25;
    midBodiceMesh.scale.set(1, 1, (chestDepth * 0.9) / baseChest);
    bodiceGroup.add(midBodiceMesh);

    // Lower Bodice / Hem flare (Waist to Hem)
    if (length !== 'cropped') {
      const lowerBodiceHeight = 0.12 - hemY;
      const lowerBodiceGeo = new THREE.CylinderGeometry(waistRadius, hemRadius, lowerBodiceHeight, 32, 1, true);
      const lowerBodiceMesh = new THREE.Mesh(lowerBodiceGeo, garmentMat);
      lowerBodiceMesh.position.y = 0.12 - lowerBodiceHeight / 2;
      lowerBodiceMesh.scale.set(1, 1, (chestDepth * 0.95) / baseChest);
      bodiceGroup.add(lowerBodiceMesh);
    }

    // Neckline & Collar Geometry
    this.build3DCollar({
      neckline,
      garmentType,
      baseShoulder,
      garmentMat,
      bodiceGroup,
      accentMat
    });

    // Center Front Placket & Buttons / Zipper
    const placketEndY = hemY + 0.02;
    const placketHeight = 0.65 - placketEndY;
    const placketGeo = new THREE.BoxGeometry(0.024, placketHeight, 0.008);
    const placketMesh = new THREE.Mesh(placketGeo, garmentMat);
    placketMesh.position.set(0, 0.65 - placketHeight / 2, chestDepth * 0.99);
    bodiceGroup.add(placketMesh);

    // Closures: Buttons or Zipper Runner
    if (closure === 'zipper') {
      const zipGeo = new THREE.BoxGeometry(0.008, placketHeight * 0.9, 0.01);
      const zipMesh = new THREE.Mesh(zipGeo, goldBrassMat);
      zipMesh.position.set(0, 0.65 - placketHeight / 2, chestDepth * 1.005);
      bodiceGroup.add(zipMesh);

      const pullerGeo = new THREE.BoxGeometry(0.014, 0.03, 0.008);
      const pullerMesh = new THREE.Mesh(pullerGeo, goldBrassMat);
      pullerMesh.position.set(0, 0.42, chestDepth * 1.015);
      bodiceGroup.add(pullerMesh);
    } else {
      // 5 Realistic round buttons
      const buttonGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.005, 16);
      buttonGeo.rotateX(Math.PI / 2);
      const startY = 0.58;
      const endY = placketEndY + 0.06;
      const count = 5;
      for (let i = 0; i < count; i++) {
        const by = startY - (i / (count - 1)) * (startY - endY);
        const buttonMesh = new THREE.Mesh(buttonGeo, accentMat);
        buttonMesh.position.set(0, by, chestDepth * 1.006);
        bodiceGroup.add(buttonMesh);
      }
    }

    // Lapels if Jacket / Tuxedo / Blazer
    if (garmentType === 'jacket' || garmentType === 'tuxedo' || garmentType === 'blazer_dress') {
      const lapelGeo = new THREE.BoxGeometry(0.06, 0.28, 0.012);
      const leftLapel = new THREE.Mesh(lapelGeo, garmentMat);
      leftLapel.position.set(-0.11 * shoulderScale, 0.5, chestDepth * 1.02);
      leftLapel.rotation.z = -0.22;
      leftLapel.rotation.y = 0.2;
      bodiceGroup.add(leftLapel);

      const rightLapel = new THREE.Mesh(lapelGeo, garmentMat);
      rightLapel.position.set(0.11 * shoulderScale, 0.5, chestDepth * 1.02);
      rightLapel.rotation.z = 0.22;
      rightLapel.rotation.y = -0.2;
      bodiceGroup.add(rightLapel);

      // Tuxedo satin chest welt pocket
      const pocketGeo = new THREE.BoxGeometry(0.065, 0.016, 0.008);
      const pocketMesh = new THREE.Mesh(pocketGeo, accentMat);
      pocketMesh.position.set(-0.13 * shoulderScale, 0.48, chestDepth * 1.01);
      pocketMesh.rotation.z = 0.05;
      bodiceGroup.add(pocketMesh);
    }

    // Monogram embroidery plate
    if (details?.monogramText && details.monogramText.trim() !== '') {
      const badgeGeo = new THREE.BoxGeometry(0.045, 0.018, 0.006);
      const badgeMesh = new THREE.Mesh(badgeGeo, goldBrassMat);
      badgeMesh.position.set(0.12 * shoulderScale, 0.46, chestDepth * 1.01);
      badgeMesh.rotation.z = -0.04;
      bodiceGroup.add(badgeMesh);
    }

    // Build 3D Sleeves
    this.buildSleeves({
      sleeve,
      shoulderScale,
      fitEase,
      garmentMat,
      accentMat,
      bodiceGroup,
      pose
    });

    this.garmentGroup.add(bodiceGroup);
  }

  /**
   * 3D Collar & Neckline construction
   */
  private build3DCollar({ neckline, garmentType, baseShoulder, garmentMat, bodiceGroup, accentMat }: any) {
    if (neckline === 'mandarin' || garmentType === 'nehru_jacket') {
      // Upright mandarin band
      const collarGeo = new THREE.CylinderGeometry(0.092, 0.096, 0.07, 24, 1, true);
      const collarMesh = new THREE.Mesh(collarGeo, garmentMat);
      collarMesh.position.y = 0.69;
      bodiceGroup.add(collarMesh);
    } else if (neckline === 'turtleneck' || neckline === 'high_neck') {
      // Rolled ribbed turtleneck
      const turtleGeo = new THREE.CylinderGeometry(0.09, 0.094, 0.14, 24, 1, false);
      const turtleMesh = new THREE.Mesh(turtleGeo, garmentMat);
      turtleMesh.position.y = 0.72;
      bodiceGroup.add(turtleMesh);
    } else if (neckline === 'v_neck') {
      // V-neck plunge trim
      const vTrimGeo = new THREE.BoxGeometry(0.012, 0.18, 0.008);
      const leftV = new THREE.Mesh(vTrimGeo, accentMat);
      leftV.position.set(-0.06, 0.62, 0.17);
      leftV.rotation.z = -0.45;
      bodiceGroup.add(leftV);

      const rightV = new THREE.Mesh(vTrimGeo, accentMat);
      rightV.position.set(0.06, 0.62, 0.17);
      rightV.rotation.z = 0.45;
      bodiceGroup.add(rightV);
    } else {
      // Classic turned shirt collar leaves
      const leftCollarGeo = new THREE.BoxGeometry(0.09, 0.055, 0.012);
      const leftCollar = new THREE.Mesh(leftCollarGeo, garmentMat);
      leftCollar.position.set(-0.065, 0.64, 0.16);
      leftCollar.rotation.set(-0.2, 0.35, -0.4);
      bodiceGroup.add(leftCollar);

      const rightCollarGeo = new THREE.BoxGeometry(0.09, 0.055, 0.012);
      const rightCollar = new THREE.Mesh(rightCollarGeo, garmentMat);
      rightCollar.position.set(0.065, 0.64, 0.16);
      rightCollar.rotation.set(-0.2, -0.35, 0.4);
      bodiceGroup.add(rightCollar);

      // Back collar stand
      const backStandGeo = new THREE.CylinderGeometry(0.095, 0.1, 0.05, 16, 1, true, 0, Math.PI);
      const backStandMesh = new THREE.Mesh(backStandGeo, garmentMat);
      backStandMesh.position.set(0, 0.67, 0);
      backStandMesh.rotation.y = -Math.PI / 2;
      bodiceGroup.add(backStandMesh);
    }
  }

  /**
   * 3D Sleeves construction
   */
  private buildSleeves({ sleeve, shoulderScale, fitEase, garmentMat, accentMat, bodiceGroup, pose }: any) {
    if (sleeve === 'sleeveless') {
      // Armhole binding ring
      const ringGeo = new THREE.TorusGeometry(0.08, 0.008, 8, 24);
      const leftRing = new THREE.Mesh(ringGeo, garmentMat);
      leftRing.position.set(-0.31 * shoulderScale, 0.54, 0);
      leftRing.rotation.y = Math.PI / 2;
      bodiceGroup.add(leftRing);

      const rightRing = new THREE.Mesh(ringGeo, garmentMat);
      rightRing.position.set(0.31 * shoulderScale, 0.54, 0);
      rightRing.rotation.y = Math.PI / 2;
      bodiceGroup.add(rightRing);
      return;
    }

    // Determine sleeve length
    let sleeveLen = 0.58; // long
    let cuffRadius = 0.052 * fitEase;
    let shoulderRadius = 0.082 * fitEase;

    if (sleeve === 'cap') sleeveLen = 0.12;
    else if (sleeve === 'short') sleeveLen = 0.22;
    else if (sleeve === 'elbow') sleeveLen = 0.34;
    else if (sleeve === 'three_quarter') sleeveLen = 0.44;
    else if (sleeve === 'bell') {
      sleeveLen = 0.58;
      cuffRadius = 0.11 * fitEase; // flared
    } else if (sleeve === 'puff') {
      shoulderRadius = 0.12 * fitEase; // gathered puff
    }

    // Left Sleeve
    const leftSleeveGeo = new THREE.CylinderGeometry(shoulderRadius, cuffRadius, sleeveLen, 24);
    const leftSleeveMesh = new THREE.Mesh(leftSleeveGeo, garmentMat);
    leftSleeveMesh.position.set(-0.31 * shoulderScale - (sleeveLen * 0.25), 0.54 - sleeveLen * 0.42, 0);
    leftSleeveMesh.rotation.z = 0.35; // gentle natural arm angle
    if (pose === 'hands_on_hip') {
      leftSleeveMesh.rotation.z = 0.65;
      leftSleeveMesh.position.z = 0.06;
    }
    bodiceGroup.add(leftSleeveMesh);

    // Right Sleeve
    const rightSleeveGeo = new THREE.CylinderGeometry(shoulderRadius, cuffRadius, sleeveLen, 24);
    const rightSleeveMesh = new THREE.Mesh(rightSleeveGeo, garmentMat);
    rightSleeveMesh.position.set(0.31 * shoulderScale + (sleeveLen * 0.25), 0.54 - sleeveLen * 0.42, 0);
    rightSleeveMesh.rotation.z = -0.35;
    if (pose === 'hands_on_hip') {
      rightSleeveMesh.rotation.z = -0.65;
      rightSleeveMesh.position.z = 0.06;
    }
    bodiceGroup.add(rightSleeveMesh);

    // Cuffs for long sleeves
    if (sleeve === 'long' || sleeve === 'french_cuff') {
      const cuffBandGeo = new THREE.CylinderGeometry(cuffRadius * 1.05, cuffRadius * 1.05, 0.04, 20);
      const leftCuff = new THREE.Mesh(cuffBandGeo, garmentMat);
      leftCuff.position.set(-0.31 * shoulderScale - (sleeveLen * 0.46), 0.54 - sleeveLen * 0.85, 0);
      leftCuff.rotation.z = 0.35;
      bodiceGroup.add(leftCuff);

      const rightCuff = new THREE.Mesh(cuffBandGeo, garmentMat);
      rightCuff.position.set(0.31 * shoulderScale + (sleeveLen * 0.46), 0.54 - sleeveLen * 0.85, 0);
      rightCuff.rotation.z = -0.35;
      bodiceGroup.add(rightCuff);
    }
  }

  /**
   * 3D Tailored Trousers Builder
   */
  private buildTrousers({ waistScale, hipScale, fitEase, length, garmentMat, accentMat, pose }: any) {
    const trouserGroup = new THREE.Group();
    trouserGroup.name = 'TrouserGroup';

    const waistRad = 0.225 * waistScale * fitEase;
    const hipRad = 0.275 * hipScale * fitEase;

    // Waistband
    const waistbandGeo = new THREE.CylinderGeometry(waistRad, waistRad * 1.02, 0.05, 32);
    const waistbandMesh = new THREE.Mesh(waistbandGeo, garmentMat);
    waistbandMesh.position.y = 0.12;
    trouserGroup.add(waistbandMesh);

    // Front button & belt loops
    const buttonGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.005, 16);
    buttonGeo.rotateX(Math.PI / 2);
    const btn = new THREE.Mesh(buttonGeo, accentMat);
    btn.position.set(0, 0.12, waistRad * 1.03);
    trouserGroup.add(btn);

    // Pelvis upper block
    const pelvisGeo = new THREE.CylinderGeometry(waistRad * 1.02, hipRad, 0.22, 32);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, garmentMat);
    pelvisMesh.position.y = -0.01;
    pelvisMesh.scale.set(1, 1, 0.75);
    trouserGroup.add(pelvisMesh);

    // Trouser Legs
    const legLen = length === 'cropped' ? 0.72 : 0.88;
    const legTopRad = 0.12 * hipScale * fitEase;
    const legBottomRad = 0.075 * fitEase;

    // Left Trouser Leg
    const leftLegGeo = new THREE.CylinderGeometry(legTopRad, legBottomRad, legLen, 24);
    const leftLegMesh = new THREE.Mesh(leftLegGeo, garmentMat);
    leftLegMesh.position.set(-0.13 * hipScale, -0.12 - legLen / 2, 0);
    if (pose === 'runway') {
      leftLegMesh.rotation.x = -0.15;
      leftLegMesh.position.z = 0.1;
    }
    trouserGroup.add(leftLegMesh);

    // Right Trouser Leg
    const rightLegGeo = new THREE.CylinderGeometry(legTopRad, legBottomRad, legLen, 24);
    const rightLegMesh = new THREE.Mesh(rightLegGeo, garmentMat);
    rightLegMesh.position.set(0.13 * hipScale, -0.12 - legLen / 2, 0);
    if (pose === 'runway') {
      rightLegMesh.rotation.x = 0.15;
      rightLegMesh.position.z = -0.1;
    }
    trouserGroup.add(rightLegMesh);

    // Front Tailored Crease / Pleat lines
    const creaseGeo = new THREE.BoxGeometry(0.004, legLen * 0.95, 0.004);
    const leftCrease = new THREE.Mesh(creaseGeo, accentMat);
    leftCrease.position.set(-0.13 * hipScale, -0.12 - legLen / 2, legTopRad * 0.95);
    trouserGroup.add(leftCrease);

    const rightCrease = new THREE.Mesh(creaseGeo, accentMat);
    rightCrease.position.set(0.13 * hipScale, -0.12 - legLen / 2, legTopRad * 0.95);
    trouserGroup.add(rightCrease);

    this.garmentGroup.add(trouserGroup);
  }

  /**
   * 3D Skirt Builder
   */
  private buildSkirt({ waistScale, hipScale, fitEase, length, garmentMat }: any) {
    const skirtGroup = new THREE.Group();
    skirtGroup.name = 'SkirtGroup';

    const waistRad = 0.225 * waistScale * fitEase;
    let skirtLen = 0.55;
    let hemRad = 0.42 * hipScale * fitEase; // A-line flare

    if (length === 'cropped') {
      skirtLen = 0.38;
      hemRad = 0.34 * hipScale * fitEase;
    } else if (length === 'long') {
      skirtLen = 0.85;
      hemRad = 0.56 * hipScale * fitEase;
    }

    const skirtGeo = new THREE.CylinderGeometry(waistRad, hemRad, skirtLen, 32, 1, true);
    const skirtMesh = new THREE.Mesh(skirtGeo, garmentMat);
    skirtMesh.position.y = 0.12 - skirtLen / 2;
    skirtGroup.add(skirtMesh);

    // Waistband
    const bandGeo = new THREE.CylinderGeometry(waistRad * 1.01, waistRad * 1.01, 0.04, 32);
    const bandMesh = new THREE.Mesh(bandGeo, garmentMat);
    bandMesh.position.y = 0.12;
    skirtGroup.add(bandMesh);

    this.garmentGroup.add(skirtGroup);
  }

  /**
   * 3D Continuous Dress Skirt Builder
   */
  private buildDressSkirt({ garmentType, waistScale, hipScale, fitEase, length, garmentMat }: any) {
    const dressSkirtGroup = new THREE.Group();
    dressSkirtGroup.name = 'DressSkirtGroup';

    const waistRad = 0.22 * waistScale * fitEase;
    let skirtLen = 0.65;
    let hemRad = 0.44 * hipScale * fitEase;

    if (length === 'cropped') {
      skirtLen = 0.42;
      hemRad = 0.35 * hipScale * fitEase;
    } else if (length === 'long') {
      skirtLen = 0.95;
      hemRad = 0.58 * hipScale * fitEase;
    }

    if (garmentType === 'cocktail_dress') {
      hemRad *= 1.2; // Extra romantic flare
    }

    const dressGeo = new THREE.CylinderGeometry(waistRad, hemRad, skirtLen, 32, 1, true);
    const dressMesh = new THREE.Mesh(dressGeo, garmentMat);
    dressMesh.position.y = 0.12 - skirtLen / 2;
    dressSkirtGroup.add(dressMesh);

    this.garmentGroup.add(dressSkirtGroup);
  }

  /**
   * 3D Biometric Measurement Guidance Ribbons (Shoulder, Chest, Waist, Hips)
   */
  private buildMeasurementGuides({ config, shoulderScale, chestScale, waistScale, hipScale }: any) {
    const ribbonMat = new THREE.MeshBasicMaterial({
      color: 0xc9365e,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });

    const m = config.measurements;

    // 1. Shoulder Span Ribbon
    const shoulderGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.62 * shoulderScale, 12);
    shoulderGeo.rotateZ(Math.PI / 2);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, ribbonMat);
    shoulderMesh.position.set(0, 0.68, 0);
    this.guidesGroup.add(shoulderMesh);

    // End pins
    const pinGeo = new THREE.SphereGeometry(0.014, 12, 12);
    const leftPin = new THREE.Mesh(pinGeo, ribbonMat);
    leftPin.position.set(-0.31 * shoulderScale, 0.68, 0);
    this.guidesGroup.add(leftPin);

    const rightPin = new THREE.Mesh(pinGeo, ribbonMat);
    rightPin.position.set(0.31 * shoulderScale, 0.68, 0);
    this.guidesGroup.add(rightPin);

    // 2. Chest Circumference Ring
    const chestTorus = new THREE.TorusGeometry(0.31 * chestScale, 0.005, 8, 36);
    const chestRing = new THREE.Mesh(chestTorus, ribbonMat);
    chestRing.rotation.x = Math.PI / 2;
    chestRing.position.set(0, 0.45, 0);
    chestRing.scale.set(1, 0.65, 1);
    this.guidesGroup.add(chestRing);

    // 3. Waist Circumference Ring
    const waistTorus = new THREE.TorusGeometry(0.235 * waistScale, 0.005, 8, 36);
    const waistRing = new THREE.Mesh(waistTorus, ribbonMat);
    waistRing.rotation.x = Math.PI / 2;
    waistRing.position.set(0, 0.12, 0);
    waistRing.scale.set(1, 0.72, 1);
    this.guidesGroup.add(waistRing);

    // 4. Hip Circumference Ring
    const hipTorus = new THREE.TorusGeometry(0.29 * hipScale, 0.005, 8, 36);
    const hipRing = new THREE.Mesh(hipTorus, ribbonMat);
    hipRing.rotation.x = Math.PI / 2;
    hipRing.position.set(0, -0.15, 0);
    hipRing.scale.set(1, 0.7, 1);
    this.guidesGroup.add(hipRing);
  }

  /**
   * Helper to clean up Three.js groups and materials
   */
  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
      group.remove(child);
    }
  }

  public dispose() {
    this.clearGroup(this.mannequinGroup);
    this.clearGroup(this.garmentGroup);
    this.clearGroup(this.guidesGroup);
    if (this.fabricTexture) {
      this.fabricTexture.dispose();
      this.fabricTexture = null;
    }
  }
}

function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return true;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
