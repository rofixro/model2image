import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function model2image(modelUrl) {
  return new Promise((resolve, reject) => {
    try {
      let camera, scene, renderer;
      init();
      render();

      function init() {
        const container = document.createElement("div");
        document.body.appendChild(container);

        renderer = new THREE.WebGLRenderer({
          antialias: true,
          preserveDrawingBuffer: true,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        container.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          1,
          20000
        );
        camera.position.set(-200, 100, 400);

        const environment = new RoomEnvironment();
        const pmremGenerator = new THREE.PMREMGenerator(renderer);

        scene = new THREE.Scene();
        const axesHelper = new THREE.AxesHelper(100);
        scene.add(axesHelper);
        scene.background = new THREE.Color(0xe8e8e8);
        scene.environment = pmremGenerator.fromScene(environment).texture;

        const grid = new THREE.GridHelper(500, 10, 0xffffff, 0xffffff);
        grid.material.opacity = 0.09;
        grid.material.depthWrite = false;
        grid.material.transparent = true;
        scene.add(grid);

        const ktx2Loader = new KTX2Loader()
          .setTranscoderPath("js/libs/basis/")
          .detectSupport(renderer);

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();

        dracoLoader.setDecoderPath("./draco/");
        loader.setDRACOLoader(dracoLoader);
        loader.setKTX2Loader(ktx2Loader);
        loader.setMeshoptDecoder(MeshoptDecoder);
        loader.load(
          modelUrl,
          (gltf) => {
            const mesh = gltf.scene;
            const boundingBox = new THREE.Box3();
            boundingBox.setFromObject(mesh);

            const vector = new THREE.Vector3();
            const height = boundingBox.getSize(vector).y;
            const width = boundingBox.getSize(vector).x / 2;
            const length = boundingBox.getSize(vector).z / 2;

            let maxDimension;
            if (height > width && height > length) {
              maxDimension = height;
            } else if (width > length) {
              maxDimension = width;
            } else {
              maxDimension = length;
            }

            const requiredMaxDimension = 200;
            const requiredScale = requiredMaxDimension / maxDimension;

            mesh.scale.setScalar(requiredScale);

            const boundingBox2 = new THREE.Box3();
            boundingBox2.setFromObject(mesh);

            const centeredObject = moveObjectToCenter(mesh, true);
            centeredObject.position.y = 8;
            scene.add(centeredObject);
            render();

            const href = renderer.domElement
              .toDataURL("image/png")
              .replace("image/png", "image/octet-stream");
            resolve(href);
          },
          () => {},
          (error) => {
            reject(error);
            throw new Error(error);
          }
        );

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener("change", render);
        controls.minDistance = 400;
        controls.maxDistance = 1000;
        controls.target.set(10, 90, -16);
        controls.update();
        window.addEventListener("resize", onWindowResize);
      }
      function moveObjectToCenter(inObject, YBottomBool = false) {
        const parent = new THREE.Object3D();
        parent.add(inObject);

        const box = new THREE.Box3();
        box.setFromObject(inObject);

        const center = new THREE.Vector3();
        box.getCenter(center);

        center.negate();

        inObject.position.copy(center);

        if (YBottomBool) {
          const box2 = new THREE.Box3();
          box2.setFromObject(parent);

          const minY = box2.min.y;
          const translateY = -minY;
          inObject.translateY(translateY);
        }
        return parent;
      }
      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        render();
      }
      function render() {
        renderer.render(scene, camera);
      }
    } catch (error) {
      reject(error);
      throw new Error(error);
    }
  });
}
