const kinds = new Set([
  'person', 'heart', 'speech', 'book', 'card', 'circle', 'rect', 'text', 'line',
  'city_street', 'subway_window', 'bus_window', 'overpass_night', 'desk_room',
  'party_night', 'window_sunrise', 'window_rain', 'hourglass', 'lamp', 'bicycle',
  'rain_cafe', 'park_autumn', 'crossroads', 'bedroom_night', 'rooftop_stars',
  'nature_hill', 'beach_sunset', 'office_desk', 'cozy_kitchen', 'clock_time',
  'coffee_cup', 'tree', 'plant', 'umbrella'
]);
function validateProject(p) {
  const fail = message => { throw new Error(`Project: ${message}`); };
  if (!p || !Array.isArray(p.segments) || !p.segments.length) fail('segments must not be empty');
  for (const key of ['width', 'height']) if (p[key] !== undefined && (!Number.isInteger(p[key]) || p[key] < 64 || p[key] > 4096 || p[key] % 2)) fail(`${key} must be an even integer, 64..4096`);
  if (p.fps !== undefined && (!Number.isFinite(p.fps) || p.fps < 1 || p.fps > 60)) fail('fps must be 1..60');
  for (const key of ['outroDuration','pauseBetweenSegments']) if (p[key] !== undefined && (!Number.isFinite(p[key]) || p[key] < 0)) fail(`${key} must be nonnegative`);
  p.segments.forEach((seg, i) => {
    if (typeof seg.vi !== 'string' || !seg.vi.trim()) fail(`segment ${i}: vi is required`);
    if (p.layoutMode !== 'illustrated-story') return;
    if (!seg.visual || !Array.isArray(seg.visual.objects) || !seg.visual.objects.length) fail(`segment ${i}: visual.objects is required`);
    const ids = new Set();
    seg.visual.objects.forEach(o => {
      if (!o.id || ids.has(o.id)) fail(`segment ${i}: object IDs must be unique`);
      ids.add(o.id);
      if (!kinds.has(o.kind)) fail(`segment ${i}: unsupported kind ${o.kind}`);
      if (o.text !== undefined && typeof o.text !== 'string') fail('object text must be a string');
      if (o.keyframes !== undefined && (!Array.isArray(o.keyframes) || !o.keyframes.length)) fail('keyframes must be a nonempty array');
      let previous = -1;
      for (const f of o.keyframes || []) {
        if (!Number.isFinite(f.at) || f.at < 0 || f.at > 1 || f.at <= previous) fail('keyframe at must increase within 0..1');
        previous = f.at;
      }
      for (const f of [o, ...(o.keyframes || [])]) {
        for (const k of ['x','y','w','h','scale','rotation','opacity']) if (f[k] !== undefined && !Number.isFinite(f[k])) fail(`${k} must be finite`);
        for (const k of ['w','h','scale']) if (f[k] !== undefined && f[k] <= 0) fail(`${k} must be positive`);
        if (f.opacity !== undefined && (f.opacity < 0 || f.opacity > 1)) fail('opacity must be 0..1');
      }
    });
  });
  return p;
}
module.exports = { validateProject };
