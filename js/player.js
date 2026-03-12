import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player {
    constructor(scene, world, modelPath) {
        this.scene = scene;
        this.world = world;
        this.grabConstraint = null;

        // Physics Body (Capsule)
        const radius = 0.4;
        const height = 1;
        this.body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Sphere(radius), // Simple sphere for performance
            position: new CANNON.Vec3(0, 5, 0),
            fixedRotation: true // Mencegah karakter guling-guling saat jalan
        });
        this.world.addBody(this.body);

        // Visual
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.scale.set(0.5, 0.5, 0.5);
            this.scene.add(this.mesh);
        });
    }

    update(camera) {
        if (!this.mesh) return;

        // Sync Mesh with Physics
        this.mesh.position.copy(this.body.position);
        this.mesh.position.y -= 0.4; // Offset visual agar kaki menyentuh tanah

        // Third Person Camera Follow
        const offset = new THREE.Vector3(0, 3, 5);
        camera.position.lerp(this.mesh.position.clone().add(offset), 0.1);
        camera.lookAt(this.mesh.position);

        // Respawn logic
        if (this.body.position.y < -5) {
            this.body.position.set(0, 5, 0);
            this.body.velocity.set(0, 0, 0);
        }
    }

    jump() {
        if (Math.abs(this.body.velocity.y) < 0.1) {
            this.body.applyImpulse(new CANNON.Vec3(0, 300, 0));
        }
    }

    grab() {
        // Logika Grab: Deteksi objek terdekat dan pasang LockConstraint
        console.log("Grab Attempt");
    }

    punch() {
        // Impulse kecil ke depan
        const force = 150;
        this.body.applyImpulse(new CANNON.Vec3(0, 0, -force));
    }

    throw() {
        if (this.grabConstraint) {
            this.world.removeConstraint(this.grabConstraint);
            this.grabConstraint = null;
        }
    }
}
