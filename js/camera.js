import * as THREE from 'three';

export function updateCamera(camera, playerMesh) {
    if (!playerMesh) return;

    const idealOffset = new THREE.Vector3(0, 4, 6); // Posisi di belakang & atas karakter
    idealOffset.applyQuaternion(playerMesh.quaternion);
    const targetPos = playerMesh.position.clone().add(idealOffset);

    // Smooth follow (lerp) agar tidak kaku
    camera.position.lerp(targetPos, 0.1);
    camera.lookAt(playerMesh.position.clone().add(new THREE.Vector3(0, 1, 0)));
}
