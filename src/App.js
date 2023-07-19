import { useEffect, useState } from "react";
import "./App.css";
import "antd/dist/reset.css";

import trees from "./trees.csv";

import Map from "./components/Map";
import Towers from "./components/Towers";

// const legend = [
//   { value: '1', color: '#FFD4B4' },
//   { value: '2', color: '#F5BCB0' },
//   { value: '3', color: '#FAA8A0' },
//   { value: '4', color: '#E17289' },
//   { value: '5+', color: '#FA599C' }
// ]
const legend = [
  {
    value: "intersection",
    color: "#BD86AF",
    label: "tree is seen by all selected towers",
  },
  {
    value: "subtraction",
    color: "#6A7091",
    label: "tree is only seen by these towers",
  },
  {
    value: "default",
    color: "#DEC286",
    label: "tree is also seen by other towers",
  },
];

function App() {
  const [data, setData] = useState([]);
  const [features, setFeatures] = useState([]);
  const [kmFilter, setKmFilter] = useState(null);

  const [towers, setTowers] = useState([]);
  const [selectedTowers, setSelectedTowers] = useState([]);
  const [candidateMode, toggleCandidateMode] = useState(false);

  useEffect(() => {
    fetch(trees)
      .then((resp) => resp.text())
      .then((result) => {
        const array = [];
        let uniqueTowers = [];

        const lines = result.split("\n");
        const headers = lines[0].split(",");

        for (let i = 1; i < lines.length; i++) {
          var obj = {};
          var currentline = lines[i].split(",");
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
          }

          if (obj.aps) {
            const seenTowers = obj.aps.split(";").map((a) => {
              //a.replace(/\([^()]*\)$/, "").trim()

              // messy :)
              const parts = a.split("(");
              return {
                tower: parts[0].trim(),
                distance: +parts[1].split("km")[0],
              };
            });

            obj.aps = seenTowers;
            const towerList = seenTowers.map((t) => t.tower);
            uniqueTowers = [...new Set([...uniqueTowers, ...towerList])];
          }

          array.push(obj);
        }

        setData(array);
        setTowers(uniqueTowers.sort());
      });
  }, []);

  useEffect(() => {
    if (!data.length) return;
    const treeFeatures = [];

    function isSubset(array1, array2) {
      for (const value of array1) {
        if (array2.indexOf(value) === -1) {
          return false;
        }
      }
      return true;
    }

    if (!selectedTowers.length) {
      setFeatures([]);
      return;
    }

    data.forEach((obj) => {
      const towerList = obj.aps
        .filter((t) => (kmFilter ? t.distance <= kmFilter : true))
        .map((t) => t.tower);
      if (!towerList.filter((t) => selectedTowers.includes(t)).length) return;

      const intersection = isSubset(selectedTowers, towerList);
      const subtraction = isSubset(towerList, selectedTowers);

      // leave null as default for mapbox coloring default
      let type;
      // intersection is only interesting if there's a 2+ set
      if (selectedTowers.length > 1 && intersection) type = "intersection";
      else if (subtraction) type = "subtraction";

      treeFeatures.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [obj.lon, obj.lat],
        },
        properties: {
          type: type,
        },
      });
    });

    setFeatures(treeFeatures);
  }, [data, selectedTowers, kmFilter]);

  return (
    <div>
      <Towers
        legend={legend}
        towers={towers}
        setSelectedTowers={setSelectedTowers}
        kmFilter={kmFilter}
        setKmFilter={setKmFilter}
        candidateMode={candidateMode}
        toggleCandidateMode={toggleCandidateMode}
      />
      <Map
        legend={legend}
        features={features}
        candidateMode={candidateMode}
        toggleCandidateMode={toggleCandidateMode}
      />
    </div>
  );
}

export default App;
