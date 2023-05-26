import { useState, useEffect } from "react";
import { Select, Checkbox, InputNumber } from 'antd';

import Legend from "./Legend";

function Towers({
  legend,
  towers,
  setSelectedTowers,
  kmFilter,
  setKmFilter
}) {
  const [options, setOptions] = useState([]);
  const [filterKmBool, setFilterKmBool] = useState(false);

  useEffect(() => {
    setOptions(towers.map(t => ({ value: t })));
  }, [towers])

  const handleChange = (value) => {
    setSelectedTowers(value)
  };

  return (
    <div className="top-right">
      <Select
        mode="tags"
        allowClear
        style={{ width: '300px' }}
        placeholder="Search for a towers"
        onChange={handleChange}
        options={options}
      />
      <Legend legend={legend} />
      <div style={{ marginTop: "18px", display: "flex", alignItems: "center" }}>
        <Checkbox
          checked={filterKmBool}
          onChange={() => {
            if (filterKmBool) {
              setKmFilter(null)
            } else {
              setKmFilter(5)
            }
            setFilterKmBool(!filterKmBool)
          }}
        >
          Filter to km:
        </Checkbox>
        <InputNumber
          min={1} max={30}
          value={kmFilter}
          onChange={value => setKmFilter(value)}
          disabled={!filterKmBool}
          style={{ width: "48px" }}
        ></InputNumber>
      </div>
    </div>
  );
}

export default Towers;
