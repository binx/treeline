import { useRef, useEffect, useCallback } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";

import { loadInitialMap, createGeoJSONCircle } from "./util";

function Map({ legend, features, candidateMode, toggleCandidateMode }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (map.current) return;
    loadInitialMap(mapContainer, map, marker, legend);
  }, [legend]);

  useEffect(() => {
    if (!map.current || !map.current.getSource("points")) return;

    map.current.getSource("points").setData({
      type: "FeatureCollection",
      features: features,
    });
  }, [features]);

  const selectCandidate = useCallback((event) => {
    if (!map.current || !map.current.getSource("radius-circle")) return;

    const coordinates = event.lngLat;
    marker.current.setLngLat([coordinates.lng, coordinates.lat]);

    const point = turf.point([coordinates.lng, coordinates.lat]);
    const buffered = turf.buffer(point, 5.5, { units: "kilometers" });
    const bbox = turf.bbox(buffered);
    map.current.fitBounds(bbox);

    map.current
      .getSource("radius-circle")
      .setData(createGeoJSONCircle([coordinates.lng, coordinates.lat], 5).data);

    toggleCandidateMode(false);
  }, []);

  useEffect(() => {
    map.current.getCanvas().style.cursor = candidateMode ? "crosshair" : "grab";

    const currentMap = map.current;

    // do this to avoid adding multiple event handlers on the map
    if (candidateMode) currentMap.on("click", selectCandidate);
    return () => currentMap.off("click", selectCandidate);
  }, [candidateMode, selectCandidate]);

  return <div ref={mapContainer} className="map-container" />;
}

export default Map;
