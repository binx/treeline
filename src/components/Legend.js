function Legend({ legend }) {
  return (
      <div className="legend">
        <div>Number of Visible Points:</div>
        <div>
          {legend.map(l => (
            <div key={l.value}>
              <span className="marker" style={{ backgroundColor: l.color }}></span>
              <div>{l.value}</div>
            </div>
          ))}
        </div>
      </div>
  );
}

export default Legend;
