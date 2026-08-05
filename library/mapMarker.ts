// Inline SVG marker so the map never needs a network round-trip for its icon.
// Bold amber-on-white so it reads clearly against any basemap (light or dark),
// with a baked-in drop shadow for separation from busy map imagery.
const busStopMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <ellipse cx="64" cy="104" rx="28" ry="7" fill="rgba(0,0,0,0.32)"/>
  <circle cx="64" cy="58" r="50" fill="#ffffff"/>
  <circle cx="64" cy="58" r="42" fill="#d97706"/>
  <rect x="36" y="36" width="56" height="36" rx="10" fill="#ffffff"/>
  <rect x="44" y="44" width="40" height="12" rx="4" fill="#d97706"/>
  <circle cx="48" cy="74" r="7" fill="#ffffff"/>
  <circle cx="80" cy="74" r="7" fill="#ffffff"/>
  <circle cx="48" cy="74" r="3" fill="#d97706"/>
  <circle cx="80" cy="74" r="3" fill="#d97706"/>
</svg>
`.trim();

export const busStopMarkerDataUri = `data:image/svg+xml;base64,${btoa(busStopMarkerSvg)}`;
