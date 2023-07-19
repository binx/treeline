import mapboxgl from "mapbox-gl";

import towers from "./towers.json";
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export const loadInitialMap = function (mapContainer, map, marker, legend) {
  const towerPoints = towers.map((t) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [t.lng, t.lat],
    },
    properties: {
      name: t.name,
    },
  }));

  map.current = new mapboxgl.Map({
    container: mapContainer.current,
    style: "mapbox://styles/binx/cleyiayif000101r4z2u9y49q",
    center: [-123.4588917, 48.930359],
    zoom: 11,
  });

  map.current.on("load", () => {
    map.current.addSource("points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    map.current.addSource("radius-circle", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    map.current.addLayer({
      id: "radius-circle",
      type: "line",
      source: "radius-circle",
      layout: {},
      paint: {
        "line-color": "rgba(174,111,160, 1)",
        "line-width": 2,
      },
    });

    const legendString = legend
      .map((l, index) =>
        index < legend.length - 1 ? [l.value, l.color] : l.color
      )
      .flat();

    const colorString = ["match", ["get", "type"], ...legendString];
    const layer = {
      id: "points",
      type: "circle",
      source: "points",
      paint: {
        "circle-radius": {
          base: 1.75,
          stops: [
            [11, 1],
            [16, 5],
          ],
        },
        "circle-color": colorString,
      },
    };
    map.current.addLayer(layer);

    for (const feature of towerPoints) {
      // create a HTML element for each feature
      const el = document.createElement("div");
      el.className = "marker";

      console.log(feature);

      // make a marker for each feature and add to the map
      new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML(
              `<h3 style="margin: 10px 0 0;">${feature.properties.name}</h3>`
            )
        )
        .addTo(map.current);
    }

    marker.current = new mapboxgl.Marker().setLngLat([0, 0]).addTo(map.current);
  });
};

export const createGeoJSONCircle = function (center, radiusInKm) {
  const points = 64;

  var coords = {
    latitude: center[1],
    longitude: center[0],
  };

  var km = radiusInKm;

  var ret = [];
  var distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  var distanceY = km / 110.574;

  var theta, x, y;
  for (var i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);

    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [ret],
          },
        },
      ],
    },
  };
};
