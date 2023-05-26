function Legend({ legend }) {
  return (
    <div className="legend">
      <div>
        {legend.map(l => (
          <div key={l.value}>
            <span className="marker" style={{ backgroundColor: l.color }}></span>
            <div>{l.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Legend;
