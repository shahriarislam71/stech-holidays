// app/components/Map.jsx
'use client';

import { useEffect, useRef } from 'react';

const Map = ({ location }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // In a real implementation, you would initialize your map here
    // This is just a placeholder for the map visualization
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div style="height:100%; background:linear-gradient(135deg,#e0f2fe,#bae6fd); display:flex; align-items:center; justify-content:center; color:#0369a1; font-weight:500;">
          <div style="text-align:center; padding:1rem;">
            <div style="font-size:1.5rem; margin-bottom:0.5rem;">📍</div>
            <div>Map of ${location}</div>
            <div style="font-size:0.875rem; margin-top:0.5rem;">(Actual map would be displayed here)</div>
          </div>
        </div>
      `;
    }
  }, [location]);

  return <div ref={mapRef} className="h-full w-full" />;
};

export default Map;