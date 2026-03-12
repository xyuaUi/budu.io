import * as CANNON from 'cannon-es';

export function initPhysics() {
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // Gravitasi standar
    world.allowSleep = true;
    
    // Material agar karakter tidak terlalu licin tapi tetap bisa terpental
    const defaultMaterial = new CANNON.Material('default');
    const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
        friction: 0.1,
        restitution: 0.5, // Sedikit membal agar lucu
    });
    world.addContactMaterial(contactMaterial);

    return { world, defaultMaterial };
}
