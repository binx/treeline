import { useRef, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

function Map({ legend, features }) {

  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/binx/cleyiayif000101r4z2u9y49q',
      center: [-123.4588917, 48.930359],
      zoom: 11
    });

    map.current.on('load', () => {
      map.current.addSource('points', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': []
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
  }, [features, legend]);

  useEffect(() => {
    if (!map.current || !map.current.getSource('points')) return;

    map.current.getSource('points').setData({
      'type': 'FeatureCollection',
      'features': features
    });
  }, [features]);

  return (
    <div ref={mapContainer} className="map-container" />
  );
}

export default Map;
