import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export function MapComponent() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const longitude = -87.701176;
    const latitude = 34.794222;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [longitude, latitude],
      zoom: 16,
      pitch: 60,
      antialias: true,
    });

    const modelOrigin = [-87.701056, 34.794222];
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      modelOrigin,
      modelAltitude
    );

    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() / 50,
    };

    function makeScene() {
      const scene = new THREE.Scene();

      const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, 70, 100).normalize();
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(0, -70, 100).normalize();
        scene.add(directionalLight2);

        const ambientLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        scene.add(ambientLight);

        return scene
    }

    const customLayer = {
      id: '3d-model',
      type: 'custom',
      renderingMode: '3d',
      onAdd: function (map, gl) {
        this.camera = new THREE.Camera();
        this.scene = makeScene();

        const loader = new GLTFLoader();
        loader.load(
          'https://mapbox-houses.onrender.com/houses/house1/scene.gltf',
          (gltf) => {
            this.scene.add(gltf.scene);
          }
        );
        this.map = map;      

        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });

        this.renderer.autoClear = false;
      },
      render: function (gl, matrix) {
        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );

        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
      },
    };

    map.on('style.load', () => {
      map.addLayer(customLayer, 'waterway-label');
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ height: '100vh' }} />;
}
