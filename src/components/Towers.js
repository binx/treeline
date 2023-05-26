import { useState, useEffect } from "react";
import { Select } from 'antd';

function Towers({ towers, setSelectedTowers }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(towers.map(t => ({ value: t })));
  }, [towers])

  const handleChange = (value) => {
    setSelectedTowers(value)
  };

  return (
    <div className="select">
      <Select
        mode="tags"
        allowClear
        style={{ width: '300px' }}
        placeholder="Search for a towers"
        onChange={handleChange}
        options={options}
      />
    </div>
  );
}

export default Towers;
