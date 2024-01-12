import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Threebox } from 'threebox-plugin';
import "threebox-plugin/dist/threebox.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function getCoordinates(limit) {
  var coordList = []
  var lngOrigin = -87.69956
  var lng = lngOrigin
  var lat = 34.797902
  var rot = 0

  for (var i = 1; i < limit; i += 1){
      lng = lng - 0.0003
      coordList.push({lng: lng, lat: lat, rot: rot})

      if (i % 20 == 0){
          if (i % 40 == 0){
              lng = lngOrigin
              lat = lat - 0.0004
              rot = 0
          } else {
              lng = lngOrigin + 0.000299
              lat = lat - 0.0001
              rot = 180
          } 
      }
  }
  return coordList
}

function makeMap(container) {
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

export function MapComponent() {
  const mapContainer = useRef(null);
  const coordinates = getCoordinates(501)

  useEffect(() => {
    const longitude = -87.701176;
    const latitude = 34.794222;

    var map = new mapboxgl.Map({
      container: mapContainer.current,
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: { lng: longitude, lat: latitude },
      zoom: 15.5,
      pitch: 60,
      bearing: 0,
      antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
  });

  const tb = (window.tb = new Threebox(
    map,
    map.getCanvas().getContext('webgl'),
    {
        defaultLights: true
    }
  ));

  map.on('style.load', () => {
    map.addLayer({
        id: 'custom-threebox-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function () {
            const scale = 1/100;
            const options = {
                obj: 'https://mapbox-houses.onrender.com/houses/house1/scene.gltf',
                type: 'gltf',
                scale: { x: scale, y: scale, z: scale },
                units: 'meters',
                rotation: { x: 90, y: -90, z: 0 }
            };



            for (const coordinate of coordinates) {
                tb.loadObj(options, (model) => {
                model.setCoords([coordinate.lng, coordinate.lat]);
                model.setRotation({ x: 0, y: 0, z: coordinate.rot });
                tb.add(model);
            });
            }
        },

        render: function () {
            tb.update();
        }
    });
});

  // window.tb = new Threebox(map, map.getCanvas().getContext("webgl"), {
  //   realSunlight: true
  // });

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

    // function makeScene() {
    //   const scene = new THREE.Scene();

    //   const directionalLight = new THREE.DirectionalLight(0xffffff);
    //     directionalLight.position.set(0, 70, 100).normalize();
    //     scene.add(directionalLight);

    //     const directionalLight2 = new THREE.DirectionalLight(0xffffff);
    //     directionalLight2.position.set(0, -70, 100).normalize();
    //     scene.add(directionalLight2);

    //     const ambientLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    //     scene.add(ambientLight);

    //     return scene
    // }

    // const customLayer = {
    //   id: '3d-model',
    //   type: 'custom',
    //   renderingMode: '3d',
    //   onAdd: function (map, gl) {
    //     this.camera = new THREE.Camera();
    //     this.scene = makeScene();

    //     function getSpriteMatrix(position, altitude, center) {
    //       // const model = 'https://mapbox-houses.onrender.com/houses/house1/scene.gltf'
    //       const scale = 1/50
    //       const rotate = [ 0 , 0, 0 ].map(deg => (Math.PI / 180) * deg)
    //       const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), rotate[0]);
    //       const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), rotate[1]);
    //       const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), rotate[2]);
        
    //       const coord = mapboxgl.MercatorCoordinate.fromLngLat(position, altitude);
    //       return new THREE.Matrix4()
    //         .makeTranslation(coord.x - center.x, coord.y - center.y, coord.z - center.z)
    //         .scale(new THREE.Vector3(scale, -scale, scale))
    //         .multiply(rotationX)
    //         .multiply(rotationY)
    //         .multiply(rotationZ);
    //     }


    //     const coodinates = [{lng: -87.701176, lat: 34.794222}, {lng: -87.701056, lat: 34.794222}] 
    //     const modelCollection = coodinates.map(c => {
    //       console.log('generating model scene')
    //       const scene = this.scene.clone()
    //     });

    //     const loader = new GLTFLoader();
    //     loader.load(
    //       'https://mapbox-houses.onrender.com/houses/house1/scene.gltf',
    //       (gltf) => {
    //         this.scene.add(gltf.scene);
    //       }
    //     );
    //     for(const scene of modelCollection){
    //       console.log("adding model scene")
    //       this.scene.add(scene);
    //     }

    //     this.map = map;

    //     this.renderer = new THREE.WebGLRenderer({
    //       canvas: map.getCanvas(),
    //       context: gl,
    //       antialias: true,
    //     });

    //     this.renderer.autoClear = false;
    //   },
    //   render: function (gl, matrix) {
    //     const rotationX = new THREE.Matrix4().makeRotationAxis(
    //       new THREE.Vector3(1, 0, 0),
    //       modelTransform.rotateX
    //     );
    //     const rotationY = new THREE.Matrix4().makeRotationAxis(
    //       new THREE.Vector3(0, 1, 0),
    //       modelTransform.rotateY
    //     );
    //     const rotationZ = new THREE.Matrix4().makeRotationAxis(
    //       new THREE.Vector3(0, 0, 1),
    //       modelTransform.rotateZ
    //     );

    //     const m = new THREE.Matrix4().fromArray(matrix);
    //     const l = new THREE.Matrix4()
    //       .makeTranslation(
    //         modelTransform.translateX,
    //         modelTransform.translateY,
    //         modelTransform.translateZ
    //       )
    //       .scale(
    //         new THREE.Vector3(
    //           modelTransform.scale,
    //           -modelTransform.scale,
    //           modelTransform.scale
    //         )
    //       )
    //       .multiply(rotationX)
    //       .multiply(rotationY)
    //       .multiply(rotationZ);

    //     this.camera.projectionMatrix = m.multiply(l);
    //     this.renderer.resetState();
    //     this.renderer.render(this.scene, this.camera);
    //     this.map.triggerRepaint();
    //   },
    // };

    // map.on('style.load', () => {
    //   map.addLayer(customLayer, 'waterway-label');
    // });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ height: '100vh' }} />;
}
