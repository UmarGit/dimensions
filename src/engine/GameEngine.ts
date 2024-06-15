import * as THREE from "three";
import CameraControls from "camera-controls";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  PixelationEffect,
  RenderPass,
} from "postprocessing";
import {
  Gyroscope,
  MD2CharacterComplex,
  OrbitControls,
} from "three/examples/jsm/Addons.js";

import grassTexture from "./textures/grasslight-big.jpg";
import Stats from "three/examples/jsm/libs/stats.module.js";

export enum MoveType {
  JUMP,
  DUCK,

  LEFT,
  RIGHT,

  FORWARD,
  BACKWARD,
}

enum ViewType {
  Top,
  Front,
  Right,
  Left,
}

class GameEngine {
  private window3D: HTMLElement;
  private window2D: HTMLElement;

  private stats: Stats | null = null;

  private scene3D: THREE.Scene | null = null;
  private scene2D: THREE.Scene | null = null;

  private Renderer3D: THREE.WebGLRenderer | null = null;
  private Renderer2D: THREE.WebGLRenderer | null = null;

  private Camera3D: THREE.PerspectiveCamera | null = null;
  private Camera2D: THREE.OrthographicCamera | null = null;

  private CameraControls3D: CameraControls | null = null;

  private CameraClock3D: THREE.Clock | null = null;

  private composer3D: EffectComposer | null = null;
  private composer2D: EffectComposer | null = null;

  private characterControls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,

    jump: false,
    crouch: false,
    attack: false,
  };

  private character3D: MD2CharacterComplex | null = null;
  private character2D: MD2CharacterComplex | null = null;

  private character3DClock: THREE.Clock | null = null;
  private character2DClock: THREE.Clock | null = null;

  constructor(window3d: HTMLElement, window2d: HTMLElement) {
    CameraControls.install({ THREE: THREE });

    this.window3D = window3d;
    this.window2D = window2d;

    this.initializeGame();

    // this.createHelpers();

    this.createLights();

    this.createGround();

    this.createCharacter3D();
    this.createCharacter2D();

    this.stats = new Stats();
    this.window3D.appendChild(this.stats.dom);
  }

  private initializeGame() {
    this.initialize3DView();
    this.initialize2DView();

    // // Function to set the 2D view based on the selected view type
    const set2DView = (viewType: ViewType) => {
      if (!this.Camera2D) {
        return;
      }

      switch (viewType) {
        case ViewType.Top:
          this.Camera2D.position.set(0, 500, 0);
          break;
        case ViewType.Front:
          this.Camera2D.position.set(0, 0, 500);
          break;
        case ViewType.Right:
          this.Camera2D.position.set(500, 0, 0);
          break;
        case ViewType.Left:
          this.Camera2D.position.set(-500, 100, 0);
          break;
      }

      this.Camera2D.lookAt(new THREE.Vector3(0, 0, 0));
      this.Camera2D.zoom = 0.0075;
      this.Camera2D.updateProjectionMatrix();
    };

    set2DView(ViewType.Left);

    this.animate();
  }

  private createHelpers() {
    const GridHelper = new THREE.GridHelper(50, 50);
    const AxisHelper = new THREE.AxesHelper(50);

    if (this.scene3D && this.scene2D) {
      this.scene3D.add(GridHelper, AxisHelper);
      this.scene2D.add(GridHelper.clone(), AxisHelper.clone());
    }
  }

  createLights() {
    if (!this.scene3D || !this.scene2D) {
      return;
    }

    const ambientLight = new THREE.AmbientLight(0x666666, 3);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 7);

    directionalLight.position.set(200, 450, 500);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 100;
    directionalLight.shadow.camera.far = 1200;
    directionalLight.shadow.camera.left = -1000;
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.top = 350;
    directionalLight.shadow.camera.bottom = -350;

    this.scene3D.add(ambientLight, directionalLight);
    this.scene2D.add(ambientLight.clone(), directionalLight.clone());
  }

  createGround() {
    if (!this.scene3D || !this.scene2D) {
      return;
    }

    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load(grassTexture);
    const groundGeometry = new THREE.PlaneGeometry(16000, 16000);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: groundTexture,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.rotation.x = -Math.PI / 2;

    if (ground.material.map) {
      ground.material.map.repeat.set(64, 64);
      ground.material.map.wrapS = THREE.RepeatWrapping;
      ground.material.map.wrapT = THREE.RepeatWrapping;
      ground.material.map.colorSpace = THREE.SRGBColorSpace;
    }
    ground.receiveShadow = true;

    this.scene3D.add(ground);
    this.scene2D.add(ground.clone());
  }

  createCharacter3D() {
    const VM = this;
    const character = new MD2CharacterComplex();
    const configOgro = {
      baseUrl: "./models/ogro/",
      body: "ogro.md2",
      skins: ["ctf_r.png"],
      weapons: [["weapon.md2", "weapon.jpg"]],
      animations: {
        move: "run",
        idle: "stand",
        jump: "jump",
        attack: "attack",
        crouchMove: "cwalk",
        crouchIdle: "cstand",
        crouchAttack: "crattack",
      },
      walkSpeed: 350,
      crouchSpeed: 175,
    };

    this.character3DClock = new THREE.Clock();

    character.controls = this.characterControls;
    character.root.position.x = 0;
    character.root.position.z = 0;
    character.scale = 3;

    character.enableShadows(true);
    character.setWeapon(0);
    character.setSkin(0);
    character.setAnimation("stand");

    character.onLoadComplete = function () {
      if (VM.scene3D) {
        VM.scene3D.add(character.root);
      }
    };

    character.loadParts(configOgro);

    this.character3D = character;
  }
  createCharacter2D() {
    const VM = this;
    const character = new MD2CharacterComplex();
    const configOgro = {
      baseUrl: "./models/ogro/",
      body: "ogro.md2",
      skins: ["ctf_r.png"],
      weapons: [["weapon.md2", "weapon.jpg"]],
      animations: {
        move: "run",
        idle: "stand",
        jump: "jump",
        attack: "attack",
        crouchMove: "cwalk",
        crouchIdle: "cstand",
        crouchAttack: "crattack",
      },
      walkSpeed: 350,
      crouchSpeed: 175,
    };

    this.character2DClock = new THREE.Clock();

    character.controls = this.characterControls;

    character.root.position.x = 0;
    character.root.position.z = 0;
    character.scale = 3;

    character.enableShadows(true);
    character.setWeapon(0);
    character.setSkin(0);
    character.setAnimation("stand");

    character.onLoadComplete = function () {
      if (VM.scene2D) {
        VM.scene2D.add(character.root);
      }
    };

    character.loadParts(configOgro);

    this.character2D = character;
  }

  private initialize3DView() {
    const initializeScene = () => {
      this.scene3D = new THREE.Scene();
      this.scene3D.background = new THREE.Color(0xffffff);
      this.scene3D.fog = new THREE.Fog(0xffffff, 1000, 4000);
    };

    const initializeCamera = () => {
      this.Camera3D = new THREE.PerspectiveCamera(
        45,
        this.window3D.clientWidth / this.window3D.clientHeight,
        1,
        4000
      );
    };

    const initializeRenderer = () => {
      if (!this.scene3D || !this.Camera3D) {
        return;
      }

      this.Renderer3D = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        stencil: false,
        depth: false,
      });
      this.Renderer3D.setSize(
        this.window3D.clientWidth,
        this.window3D.clientHeight
      );
      this.Renderer3D.shadowMap.enabled = true;
      this.Renderer3D.shadowMap.type = THREE.PCFSoftShadowMap;
      this.window3D.appendChild(this.Renderer3D.domElement);

      this.composer3D = new EffectComposer(this.Renderer3D);

      const renderPass2D = new RenderPass(this.scene3D, this.Camera3D);
      const bloomEffect = new BloomEffect({
        intensity: 0.75,
        luminanceThreshold: 0.5,
        luminanceSmoothing: 0.5,
      });
      const effectPass2D = new EffectPass(this.Camera3D, bloomEffect);

      this.composer3D.addPass(renderPass2D);
      this.composer3D.addPass(effectPass2D);
    };

    const initializeControls = () => {
      if (!this.Camera3D || !this.Renderer3D) {
        return;
      }

      this.CameraClock3D = new THREE.Clock();
      this.CameraControls3D = new CameraControls(this.Camera3D, this.window3D);
      this.CameraControls3D.setLookAt(0, 270, -500, 0, 0, 0, true);
    };

    initializeScene();
    initializeCamera();
    initializeRenderer();
    initializeControls();
  }

  private initialize2DView() {
    const initializeScene2D = () => {
      this.scene2D = new THREE.Scene();
      this.scene2D.background = new THREE.Color(0xffffff);
      this.scene2D.fog = new THREE.Fog(0xffffff, 1000, 4000);
    };

    const initializeCamera2D = () => {
      const aspect = this.window2D.clientWidth / this.window2D.clientHeight;
      const frustumSize = 2;
      this.Camera2D = new THREE.OrthographicCamera(
        -frustumSize * aspect,
        frustumSize * aspect,
        frustumSize,
        -frustumSize,
        0.1,
        1000
      );
    };

    const initializeRenderer2D = () => {
      if (!this.scene2D || !this.Camera2D) {
        return;
      }

      this.Renderer2D = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        stencil: false,
        depth: false,
      });
      this.Renderer2D.setSize(
        this.window2D.clientWidth,
        this.window2D.clientHeight
      );
      this.Renderer2D.shadowMap.enabled = true;
      this.Renderer2D.shadowMap.type = THREE.PCFSoftShadowMap;
      this.window2D.appendChild(this.Renderer2D.domElement);

      this.composer2D = new EffectComposer(this.Renderer2D);

      const renderPass2D = new RenderPass(this.scene2D, this.Camera2D);
      const pixelationEffect = new PixelationEffect(2);
      const bloomEffect = new BloomEffect({
        intensity: 0.25,
      });
      const effectPixel = new EffectPass(this.Camera2D, pixelationEffect);
      const effectBloom = new EffectPass(this.Camera2D, bloomEffect);

      this.composer2D.addPass(renderPass2D);
      this.composer2D.addPass(effectPixel);
      this.composer2D.addPass(effectBloom);
    };

    const initializeCameraControls = () => {
      if (!this.Camera2D || !this.Renderer2D) {
        return;
      }

      const cameraControls = new OrbitControls(
        this.Camera2D,
        this.Renderer2D.domElement
      );
      cameraControls.update();
    };

    initializeScene2D();
    initializeCamera2D();
    initializeRenderer2D();
    // initializeCameraControls();
  }

  private animate() {
    const VM = this;

    function animateFrame() {
      requestAnimationFrame(animateFrame);

      if (VM.CameraControls3D && VM.character3D) {
        const isCharacterMoving = Object.values(VM.characterControls).some(
          (control) => control
        );

        if (isCharacterMoving) {
          VM.CameraControls3D.setLookAt(
            VM.character3D.root.position.x,
            VM.character3D.root.position.y + 200,
            VM.character3D.root.position.z - 500,
            VM.character3D.root.position.x,
            VM.character3D.root.position.y,
            VM.character3D.root.position.z,
            true
          );
        }
      }

      if (VM.Camera2D && VM.character3D) {
        const isCharacterMoving = Object.values(VM.characterControls).some(
          (control) => control
        );

        if (isCharacterMoving) {
          VM.Camera2D.lookAt(VM.character3D.root.position);
          VM.Camera2D.updateProjectionMatrix();
        }
      }

      //restrict the camera zoom in and out
      if (VM.CameraControls3D && VM.CameraClock3D) {
        VM.CameraControls3D.update(VM.CameraClock3D.getDelta());
      }

      if (VM.character3D && VM.character3DClock) {
        VM.character3D.update(VM.character3DClock.getDelta());
      }
      if (VM.character2D && VM.character2DClock) {
        VM.character2D.update(VM.character2DClock.getDelta());
      }

      if (VM.stats) {
        VM.stats.update();
      }

      if (VM.composer3D) {
        VM.composer3D.render();
      }
      if (VM.composer2D) {
        VM.composer2D.render();
      }
    }

    animateFrame();
  }

  enableControls() {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "w":
          this.characterControls.moveForward = true;
          break;
        case "s":
          this.characterControls.moveBackward = true;
          break;
        case "a":
          this.characterControls.moveLeft = true;
          break;
        case "d":
          this.characterControls.moveRight = true;
          break;
        case " ":
          this.characterControls.jump = true;
          break;
        case "Shift":
          this.characterControls.crouch = true;
          break;
        case "x":
          this.characterControls.attack = true;
          break;
      }
    });
    document.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "w":
          this.characterControls.moveForward = false;
          break;
        case "s":
          this.characterControls.moveBackward = false;
          break;
        case "a":
          this.characterControls.moveLeft = false;
          break;
        case "d":
          this.characterControls.moveRight = false;
          break;
        case " ":
          this.characterControls.jump = false;
          break;
        case "Shift":
          this.characterControls.crouch = false;
          break;
        case "x":
          this.characterControls.attack = false;
          break;
      }
    });
  }

  resize3DView() {
    if (this.Camera3D && this.Renderer3D) {
      this.Camera3D.aspect =
        this.window3D.clientWidth / this.window3D.clientHeight;
      this.Camera3D.updateProjectionMatrix();
      this.Renderer3D.setSize(
        this.window3D.clientWidth,
        this.window3D.clientHeight
      );
    }
  }
  resize2DView() {
    if (this.Camera2D && this.Renderer2D) {
      const aspect = this.window2D.clientWidth / this.window2D.clientHeight;
      const frustumSize = 2;

      const screenshot = this.Renderer2D.domElement.toDataURL();
      const screenshotElement = document.createElement("img");

      screenshotElement.src = screenshot;
      screenshotElement.style.position = "absolute";
      screenshotElement.style.top = "0";
      screenshotElement.style.left = "0";
      screenshotElement.style.zIndex = "100";
      screenshotElement.style.width = "100%";
      screenshotElement.style.height = "100%";

      this.window2D.appendChild(screenshotElement);

      setTimeout(() => {
        if (!this.Camera2D || !this.Renderer2D) {
          return;
        }

        this.Camera2D.left = -frustumSize * aspect;
        this.Camera2D.right = frustumSize * aspect;
        this.Camera2D.top = frustumSize;
        this.Camera2D.bottom = -frustumSize;
        this.Camera2D.updateProjectionMatrix();

        this.Renderer2D.setSize(
          this.window2D.clientWidth,
          this.window2D.clientHeight
        );

        this.window2D.removeChild(screenshotElement);
      }, 100);
    }
  }
}

export default GameEngine;
