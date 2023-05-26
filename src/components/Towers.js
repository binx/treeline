import { useState, useEffect } from "react";
import { Select } from 'antd';

import Legend from "./Legend";

function Towers({ towers, setSelectedTowers, legend }) {
  const [options, setOptions] = useState([]);

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
    </div>
  );
}

export default Towers;
