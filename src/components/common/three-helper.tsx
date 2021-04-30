declare const THREE: any;



export function load(type: string, url: string, sel: string) {

    function cb(texture: any) {
        const elem = (document.querySelector('#' + sel) as HTMLElement)
        if (elem.children.length > 0) { return; }
        console.log('Texture is loaded');
        let camera = new THREE.PerspectiveCamera(25, 1, 1, 20000);
        let renderer = new THREE.WebGLRenderer({ alpha: false });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(elem.clientWidth, elem.clientHeight);
        elem.appendChild(renderer.domElement);
        camera.position.set(1, 1, 20);
        let scene = new THREE.Scene();
        var light = new THREE.AmbientLight(0xffffff, 5);
        scene.add(light);
        texture.scene.position.x = 0;
        texture.scene.position.y = 0;
        texture.scene.position.z = 0;
        scene.add(texture.scene);
        renderer.render(scene, camera);
    }

    console.log(type, url, sel, type.indexOf("gltf"));

    // if (type.indexOf("drc") > -1) {
    //     THREE.DRACOLoader();
    // }
    if (/^\/gltf\/.*/.test(type)) {
        (new THREE.GLTFLoader()).load(url, cb);
    }
    // else if (type.indexOf("ktx2")) {
    //     THREE.KTX2Loader(url, cb);
    // }
    // else if (type.indexOf("pmd")) {
    //     THREE.MMDLoader(url, cb);
    // }
    // else if (type.indexOf("obj")) {
    //     THREE.OBJLoader(url, cb);
    // }
    // else if (type.indexOf("pcd")) {
    //     THREE.PCDLoader(url, cb);
    // }
    // else if (type.indexOf("pdb")) {
    //     THREE.PDBLoader(url, cb);
    // }
    // else if (type.indexOf("prwm")) {
    //     THREE.PRWMLoader(url, cb);
    // }
    // else if (type.indexOf("tga")) {
    //     THREE.TGALoader(url, cb);
    // }
    // else if (type.indexOf("fbx")) {
    //     THREE.FBXLoader(url, cb);
    // }

}
