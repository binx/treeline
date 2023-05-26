import { useEffect, useState } from 'react';
import './App.css';
import 'antd/dist/reset.css';

import trees from "./trees.csv";

import Map from "./components/Map";
import Towers from "./components/Towers";
import Legend from "./components/Legend";

const legend = [
  { value: '1', color: '#FFD4B4' },
  { value: '2', color: '#F5BCB0' },
  { value: '3', color: '#FAA8A0' },
  { value: '4', color: '#E17289' },
  { value: '5+', color: '#FA599C' }
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

  function hasCommonStrings(array1, array2) {
    const commonStrings = array1.filter((string) => array2.includes(string));
    return commonStrings.length > 0;
  }

  useEffect(() => {
    if (!data.length) return;
    const treeFeatures = [];

    data.forEach(obj => {
      if (!selectedTowers.length
        || !obj.aps.filter(t => selectedTowers.includes(t)).length
      )
        return;


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
    })

    setFeatures(treeFeatures);
  }, [data, selectedTowers]);

  return (
    <div>
      <Legend legend={legend} />
      <Towers towers={towers} setSelectedTowers={setSelectedTowers} />
      <Map legend={legend} features={features} />
    </div>
  );
}

export default App;
