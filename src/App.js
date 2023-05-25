import { useRef, useEffect, /*useState*/ } from 'react';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import trees from "./trees.csv";

import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const legend = [
  { value: '1', color: '#FFD4B4' },
  { value: '2', color: '#F5BCB0' },
  { value: '3', color: '#FAA8A0' },
  { value: '4', color: '#E17289' },
  { value: '5+', color: '#FA599C' }
]

function App() {

  const mapContainer = useRef(null);
  const map = useRef(null);
  // const [lng, setLng] = useState(-123.4588917);
  // const [lat, setLat] = useState(48.930359);
  // const [zoom, setZoom] = useState(11);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/binx/cleyiayif000101r4z2u9y49q',
      center: [-123.4588917, 48.930359],
      zoom: 11
    });

    map.current.on('load', () => {
      fetch(trees)
        .then(resp => resp.text())
        .then(result => {
          const treeFeatures = [];
          const lines = result.split("\n");
          const headers = lines[0].split(",");

          for (let i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");
            for (var j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentline[j];
            }

            treeFeatures.push({
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [
                  obj.lon, obj.lat
                ]
              },
              'properties': {
                "n": obj.n
              }
            });
          }

          map.current.addSource('points', {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': treeFeatures
            }
          });

          const legendString = legend.map((l, index) => 
            index < legend.length - 1 ? [l.value, l.color] : l.color
          ).flat()

          const colorString = [
            'match',
            ['get', 'n'],
            ...legendString
          ]
          const layer = {
            'id': 'points',
            'type': 'circle',
            'source': 'points',
            'paint': {
              // Make circles larger as the user zooms from z12 to z22.
              'circle-radius': {
                'base': 1.75,
                'stops': [
                  [11, 1],
                  [16, 5]
                ]
              },
              'circle-color': colorString
            }
          }
          map.current.addLayer(layer);
        });
    });
  }, []);


  return (
    <div>
      <div className="legend">
        <div>Number of Visible Points:</div>
        { legend.map(l => (
          <div key={l.value}>
            <span className="marker" style={{ backgroundColor: l.color }}></span>
            <div>{l.value}</div>
          </div>
        ))}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
