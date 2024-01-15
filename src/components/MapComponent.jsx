import { useEffect, useRef, useState } from 'react';
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
  const longitude = -87.701176;
  const latitude = 34.794222;

  var map = new mapboxgl.Map({
    container: container.current,
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: { lng: longitude, lat: latitude },
    zoom: 15.5,
    pitch: 0,
    //pitch: 60,
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

function addMultipleModel(modelOptions, quantity){
  const coordinatesList = getCoordinates(quantity)

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
                        'id': 'bla1',
                        'description':
                            '<strong>Choose your house</strong><p>Choose your house <a href="http://www.google.com" target="_blank" title="Opens in a new window">Add my house in here</a></p>',
                    },
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                    [
                        [-87.698916, 34.796622],
                        [-87.698116, 34.796622],
                        [-87.698116, 34.797002],
                        [-87.698916, 34.797002],
                        [-87.698916, 34.796622]
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
      },
      onMouseEnter: function(){
        console.log('yahooooo')
      },
      onClick: function(){
        console.log('yahooooo')
      }
  });
      map.addLayer({
        id: 'custom-threebox-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function () {
            const options = getModelOptions();
            addMultipleModel(options, 501)
        },
        render: function () {
            tb.update();
        }
      });
    //   map.on('click', 'slot', (e) => {
    //     // Copy coordinates array.
    //     console.log(e.features[0].geometry.coordinates[0][0].slice())
    //     const coordinates = e.features[0].geometry.coordinates[0][0].slice();
    //     const description = e.features[0].properties.description;

    //     // Ensure that if the map is zoomed out such that multiple
    //     // copies of the feature are visible, the popup appears
    //     // over the copy being pointed to.
    //     while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //         coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    //     }

    //     new mapboxgl.Popup()
    //         .setLngLat(coordinates)
    //         .setHTML(description)
    //         .addTo(map);
    // });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'slot', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        e.target.style.cursor = 'pointer';
        console.log(`type ${e.type}`)
        console.log(e)
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'slot', () => {
      console.log("mouse leave")
        // map.getCanvas().style.cursor = '';
        console.log(map.getCanvas().style.cursor)


    });
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ height: '100vh' }} />;
}
