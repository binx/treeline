import { useEffect, useState } from 'react';
import './App.css';
import 'antd/dist/reset.css';

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
  { value: 'intersection', color: "#BD86AF", label: "tree is seen by all selected towers" },
  { value: 'subtraction', color: "#6A7091", label: "tree is only seen by these towers" },
  { value: 'default', color: "#DEC286", label: "tree is also seen by other towers" }
]

function App() {

  const [data, setData] = useState([])
  const [features, setFeatures] = useState([]);
  const [towers, setTowers] = useState([]);
  const [selectedTowers, setSelectedTowers] = useState([]);

  useEffect(() => {
    fetch(trees)
      .then(resp => resp.text())
      .then(result => {
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
            const seenTowers = obj.aps.split(";").map(a => a.replace(/\([^()]*\)$/, "").trim());

            obj.aps = seenTowers;
            uniqueTowers = [...new Set([...uniqueTowers, ...seenTowers])]
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

    data.forEach(obj => {
      if (!selectedTowers.length ||
        !obj.aps.filter(t => selectedTowers.includes(t)).length
      )
        return;

      function isSubset(array1, array2) {
        for (const value of array1) {
          if (array2.indexOf(value) === -1) {
            return false;
          }
        }
        return true;
      }

      let type;

      const intersection = isSubset(selectedTowers, obj.aps);
      const subtraction = isSubset(obj.aps, selectedTowers);

      // intersection is only interesting if there's a 2+ set
      if (selectedTowers.length > 1 && intersection) type = "intersection";
      else if (subtraction) type = "subtraction";

      treeFeatures.push({
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            obj.lon, obj.lat
          ]
        },
        'properties': {
          "type": type
        }
      });
    })

    setFeatures(treeFeatures);
  }, [data, selectedTowers]);

  return (
    <div>
      <Towers legend={legend} towers={towers} setSelectedTowers={setSelectedTowers} />
      <Map legend={legend} features={features} />
    </div>
  );
}

export default App;
