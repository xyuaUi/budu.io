import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Game {
    constructor() {
        this.initPhysics();
        this.initGraphics();
        this.loadModels();
        this.setupControls();
        this.animate();
    }

    initPhysics() {
        this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
        this.world.allowSleep = true;
        this.physicsMaterials = {
            ground: new CANNON.Material('ground'),
            player: new CANNON.Material('player')
        };
    }

    initGraphics() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky Blue

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimasi mobile
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(5, 10, 5);
        sun.castShadow = true;
        this.scene.add(sun);
    }

    loadModels() {
        const loader = new GLTFLoader();
        
        // Load Map (Relative Path)
        loader.load('./models/Parking.glb', (gltf) => {
            const map = gltf.scene;
            map.traverse(child => { if(child.isMesh) child.receiveShadow = true; });
            this.scene.add(map);
            
            // Sederhanakan collider map sebagai lantai statis untuk performa
            const groundBody = new CANNON.Body({ mass: 0, material: this.physicsMaterials.ground });
            groundBody.addShape(new CANNON.Plane());
            groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
            this.world.addBody(groundBody);
        });

        // Load Player
        this.player = new Player(this.scene, this.world, './models/a.glb');
    }

    setupControls() {
        // Simple Touch Handlers
        document.getElementById('btn-jump').ontouchstart = () => this.player.jump();
        document.getElementById('btn-grab').ontouchstart = () => this.player.grab();
        document.getElementById('btn-punch').ontouchstart = () => this.player.punch();
        document.getElementById('btn-throw').ontouchstart = () => this.player.throw();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const timeStep = 1 / 60;
        this.world.step(timeStep);

        if(this.player) this.player.update(this.camera);

        this.renderer.render(this.scene, this.camera);
    }
}

new Game();
