import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Threebox } from 'threebox-plugin';
import "threebox-plugin/dist/threebox.css";
import { Button, Modal, Carousel} from 'react-bootstrap';
import houseImage1 from '../images/house1.jpg'
import houseImage2 from '../images/house2.jpg'
import houseImage3 from '../images/house3.jpg'
import houseImage4 from '../images/house4.jpg'
import houseImage5 from '../images/house5.jpg'

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
  const longitude = -87.701176;
  const latitude = 34.794222;

  var map = new mapboxgl.Map({
    container: container.current,
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: { lng: longitude, lat: latitude },
    zoom: 15.5,
    pitch: 20,
    bearing: 0,
    antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
})

  return map
}

function makeThreeBox(map){
  return(window.tb = new Threebox(
    map,
    map.getCanvas().getContext('webgl'),
    {
        defaultLights: true
    }
  ))
}

function addMultipleModel(modelOptions, coordinatesList){
  for (const modelCoordinates of coordinatesList) {
    addSingleModel(modelOptions, modelCoordinates)
  }
}

function addSingleModel(modelOptions, coordinates){
  tb.loadObj(modelOptions, (model) => {
    model.setCoords([coordinates.lng, coordinates.lat]);
    model.setRotation({ x: 0, y: 0, z: coordinates.rot });
    tb.add(model)
  })
}

function getModelOptions(){
  const scale= 1/100
  const options = {
    obj: 'https://mapbox-houses.onrender.com/houses/house1/scene.gltf',
    type: 'gltf',
    scale: { x: scale, y: scale, z: scale },
    units: 'meters',
    rotation: { x: 90, y: -90, z: 0 }
}
  return options
}

export function MapComponent() {
  const mapContainer = useRef(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const handleCloseMapModal = () => setShowMapModal(false);
  const handleShowMapModal = () => setShowMapModal(true);
  const handleClick = () => addHouseOnSlot();
  const [coordinatesList, setCoordinatesList] = useState(getCoordinates(501))
  const [selectedSlot, setselectedSlot] = useState({})

  function callModal(e){
    const coordinates = e.features[0].geometry.coordinates[0][0].slice();
    const slotId = e.features[0].properties.slotId
    setselectedSlot({id: slotId, properties: {lng: coordinates[0], lat: coordinates[1], rot: 0}})
    handleShowMapModal()
  }

  function addHouseOnSlot(){
    const newHouseCoordinates = selectedSlot.properties
    setCoordinatesList([...coordinatesList, newHouseCoordinates])
    setShowMapModal(false)
  }

  useEffect(() => {
    const map = makeMap(mapContainer)
    const tb = makeThreeBox(map);

    map.on('style.load', () => {
      map.addSource('slot', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {
                        'slotId': 'slot1',
                    },
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                    [
                        [-87.698416, 34.796822],
                        [-87.698116, 34.796822],
                        [-87.698116, 34.797002],
                        [-87.698416, 34.797002],
                        [-87.698416, 34.796822]
                    ]
                ]
                    }
                },
                {
                  'type': 'Feature',
                  'properties': {
                      'slotId': 'slot2',
                  },
                  'geometry': {
                      'type': 'Polygon',
                      'coordinates': [
                  [
                    [-87.698916, 34.796822],
                    [-87.698616, 34.796822],
                    [-87.698616, 34.797002],
                    [-87.698916, 34.797002],
                    [-87.698916, 34.796822]
                  ]
              ]
                  }
              },
                {
                  'type': 'Feature',
                  'properties': {
                      'slotId': 'slot3',
                  },
                  'geometry': {
                      'type': 'Polygon',
                      'coordinates': [
                  [
                    [-87.699416, 34.796822],
                    [-87.699116, 34.796822],
                    [-87.699116, 34.797002],
                    [-87.699416, 34.797002],
                    [-87.699416, 34.796822]
                  ]
              ]
                  }
              },
            ]
        }
      });
      map.addLayer({
        id: 'slot',
        type: 'fill',
        source: 'slot', // reference the data source
        layout: {},
        paint: {
            'fill-color': '#7C3030', // blue color fill
            'fill-opacity': 0.5
        },
        render: function () {
          tb.update();
      }
      });
      map.addLayer({
        id: 'custom-threebox-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function () {
            const options = getModelOptions();
            addMultipleModel(options, coordinatesList)
        },
        render: function () {
            tb.update();
        }
      });
      map.on('click', 'slot', (e) => {
        callModal(e)
      });
      map.on('mouseenter', 'slot', (e) => {      
          map.getCanvas().style.cursor = 'pointer'
      });
      map.on('mouseleave', 'slot', () => {
          map.getCanvas().style.cursor = '';
      });
    });

    return () => map.remove();
  }, [coordinatesList]);

  return(
    <>
      <Modal show={showMapModal} onHide={handleCloseMapModal}>
        <Modal.Header closeButton>
          <Modal.Title>Choose your house to add on {selectedSlot.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <style>
          {`
            /* Custom styles for darker carousel arrows */
            .carousel-control-prev-icon,
            .carousel-control-next-icon {
              filter: brightness(50%); /* Adjust the brightness as needed */
            }

            .carousel-control-prev,
            .carousel-control-next {
              opacity: 1;
            }
          `}
        </style>
        <Carousel>
          <Carousel.Item>
          <img className="d-block w-50 mx-auto" src={houseImage1} alt="House Image 1" />
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-50 mx-auto" src={houseImage2} alt="House Image 2" />
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-50 mx-auto" src={houseImage3} alt="House Image 3" />
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-50 mx-auto" src={houseImage4} alt="House Image 4" />
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-50 mx-auto" src={houseImage5} alt="House Image 5" />
          </Carousel.Item>
        </Carousel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMapModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClick}>
            Choose this one!
          </Button>
        </Modal.Footer>
      </Modal>

      <div ref={mapContainer} style={{ height: '100vh' }} />
    </>
  );
}
