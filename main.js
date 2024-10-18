import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OutlineEffect } from "three/addons/effects/OutlineEffect.js";
import "./style.css";

(() => {
    const canvas = document.querySelector(".webgl");
    if (!canvas) return;
    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    const loading = document.querySelector("#loader");

    // Base camera
    const camera = new THREE.PerspectiveCamera(
        10,
        sizes.width / sizes.height,
        0.1,
        500
    );
    camera.position.x = 8;
    camera.position.y = 4;
    camera.position.z = 20;
    scene.add(camera);

    // Add AxesHelper to show the 3D axes (X: red, Y: green, Z: blue)
    const axesHelper = new THREE.AxesHelper(5); // The number indicates the length of the axes
    scene.add(axesHelper);

    //Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    controls.minPolarAngle = Math.PI / 5;
    controls.maxPolarAngle = Math.PI / 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Materials
    //const bakedTextureZZZ = textureLoader.load('https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room13/47b05e2db4e49eec33d63729e920894a906cb693/static/baked.jpg')

    const bakedTexture = textureLoader.load(
        "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room13/f6d2eeb487a3d1bcd9944e23621c21f60055b280/static/baked-alt.jpg"
    );
    bakedTexture.flipY = false;
    bakedTexture.encoding = THREE.sRGBEncoding;

    const bakedMaterial = new THREE.MeshBasicMaterial({
        map: bakedTexture,
        side: THREE.DoubleSide,
    });

    bakedMaterial.userData.outlineParameters = {
        // thickness: 0.0025,
        thickness: 0.003,
        color: [0, 0, 0],
        alpha: 1,
        keepAlive: true,
        visible: true,
    };

    //Loader
    const loader = new GLTFLoader();
    loader.load(
        "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room13/47b05e2db4e49eec33d63729e920894a906cb693/static/model.glb",
        (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => (child.material = bakedMaterial));
            scene.add(model);
            scene.position.set(0, 0.2, 0);
            loading.style.display = "none";
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        }
    );

    // Animation
    const minPan = new THREE.Vector3(-5, -2, -5);
    const maxPan = new THREE.Vector3(5, 2, 5);
    const effect = new OutlineEffect(renderer);

    const tick = () => {
        controls.update();
        controls.target.clamp(minPan, maxPan);
        effect.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();

    window.addEventListener("resize", () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    let isZooming;
    window.gl_animation = false;
    window.addEventListener("keypress", function (key) {
        if (key.key === "p") {
            camera.position.set(8, 4, 20);
            clearInterval(isZooming);
            document.getElementById("redOverlay").style.opacity = 0;
            window.gl_animation = false;
            window.website_reset();
        } else if (key.key === "Enter") {
            const startPos = camera.position;
            const endPos = { x: 0, y: 3, z: 20 };
            const duration = 1;
            let startTime = null;

            function animateCameraToTarget(time, onComplete) {
                if (!startTime) startTime = time;
                const elapsedTime = (time - startTime) / 1000; // convert to seconds
                const t = Math.min(elapsedTime / duration, 1); // normalize to [0, 1]

                // Interpolate positions
                camera.position.x = startPos.x + (endPos.x - startPos.x) * t;
                camera.position.y = startPos.y + (endPos.y - startPos.y) * t;
                camera.position.z = startPos.z + (endPos.z - startPos.z) * t;

                if (t < 1) {
                    requestAnimationFrame((newTime) =>
                        animateCameraToTarget(newTime, onComplete)
                    ); // continue animation
                } else {
                    // Once the animation is done, execute the callback function (start the next animation)
                    if (onComplete) onComplete();
                }
            }

            function animateCameraInsideModel() {
                const zoomDuration = 3; // duration of zoom animation
                let zoomStartTime = null;

                function animateZoom(time) {
                    if (!zoomStartTime) zoomStartTime = time;
                    const elapsedTime = (time - zoomStartTime) / 1000;
                    const t = Math.min(elapsedTime / zoomDuration, 1);

                    camera.position.x = endPos.x;
                    camera.position.y = endPos.y;

                    // Continue moving inside the model along the z-axis (increase z value)
                    camera.position.z = endPos.z - endPos.z * t; // Moves from 15 to 0

                    if (t < 1) {
                        requestAnimationFrame(animateZoom);
                    } else {
                        document.getElementById("redOverlay").style.opacity = 1;
                        window.gl_animation = true;
                        setTimeout(() => {
                            window.gl_animation = false;
                            window.location.href = "/website.html";
                        }, 4000);
                    }
                }

                // Start zoom animation
                requestAnimationFrame(animateZoom);
            }

            // Start the first animation and chain the second one as a callback
            requestAnimationFrame((time) =>
                animateCameraToTarget(time, animateCameraInsideModel)
            );
        }
    });
})();
