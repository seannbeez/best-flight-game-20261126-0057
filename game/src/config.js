// config.js — one job: all static data tables for STRATOSPHERE OBSERVATORY.
// Every matrix number is a real table here AND a working system in flight.js.
export const W = 1280, H = 720;
export const INK = '#1C1917';
export const PAL = {
  night: '#0B1120', aurora: '#10B981', magenta: '#D946EF', brass: '#D97706',
  cream: '#F5EFE6', cream2: '#EDE3D0', iron: '#2A2F3A', ice: '#BFE3F0',
  snow: '#EAF6FB', gold: '#F2B705', red: '#E5484D', steel: '#7A8699',
};
export const ALTITUDES = [
  { id: 0, name: 'LOWER ICE LAYER', ft: '2,400 FT', temp: -28, desc: 'Icing risk — heat wings', color: '#7FB8D8' },
  { id: 1, name: 'MIDDLE JET STREAM', ft: '9,800 FT', temp: -41, desc: 'Fast tailwind — save fuel', color: '#10B981' },
  { id: 2, name: 'AURORA STRATOSPHERE', ft: '18,500 FT', temp: -55, desc: 'Magnetic storms — overheat risk', color: '#D946EF' },
];
export const MODES = [
  { id: 'survey', name: 'SURVEY', goal: 'Map the sector — fly every ring' },
  { id: 'rescue', name: 'RESCUE', goal: 'Reach the beacon, hold steady 3s' },
  { id: 'sample', name: 'SAMPLE', goal: 'Collect 4 aurora samples in the rings' },
  { id: 'storm', name: 'STORM RUN', goal: 'Thread the gale — no ring missed' },
];
export const SECTORS = [
  { id: 1, name: 'FROSTBITE RIDGE', mode: 'survey', rings: 3, phen: [0, 1, 4], brief: 'Map the ridge gates before the whiteout.' },
  { id: 2, name: 'AURORA REACH', mode: 'sample', rings: 4, phen: [2, 5, 8], brief: 'Scoop aurora samples from the glowing rings.' },
  { id: 3, name: 'MAGNETIC GALE', mode: 'storm', rings: 4, phen: [3, 6, 9], brief: 'Thread the gale. One missed ring ends the run.' },
  { id: 4, name: 'SILENT MERIDIAN', mode: 'rescue', rings: 3, phen: [7, 10, 12], brief: 'A beacon crew waits on the ice. Hold steady.' },
  { id: 5, name: 'CROWN OF ICE', mode: 'survey', rings: 5, phen: [11, 13, 2], brief: 'Five gates over the highest peaks.' },
  { id: 6, name: 'POLAR THRONE', mode: 'storm', rings: 5, phen: [3, 5, 9], brief: 'Final storm. Every system at the edge.' },
];
export const CREW = [
  { name: 'CAPT. INGRID SOL', role: 'Expedition Leader', skin: '#E8B98A', hair: '#3A2E22', accent: '#D97706', line: 'Steady on the stick. The aurora is watching us.' },
  { name: 'NAV. ERIK HALVORSEN', role: 'Navigator', skin: '#D9A06B', hair: '#1C1917', accent: '#10B981', line: 'Next gate bears 042. Turn now, or we chase the wind.' },
  { name: 'MET. AYA KOBAYASHI', role: 'Meteorologist', skin: '#F0C8A0', hair: '#111827', accent: '#D946EF', line: 'Gale cell ahead — climb to the jet stream, quickly.' },
  { name: 'MECH. TOMASZ NOWAK', role: 'Engine Mechanic', skin: '#C98F5F', hair: '#6B4A2F', accent: '#B45309', line: 'Wing heat at 61°. One more notch and the de-icer sings.' },
  { name: 'RADIO. LENA FISCHER', role: 'Radio Operator', skin: '#EFC39A', hair: '#7A2E2E', accent: '#0EA5A5', line: 'Base confirms: samples secured. They are cheering for us.' },
  { name: 'MED. SOFIA LARSEN', role: 'Flight Surgeon', skin: '#DFA87E', hair: '#E8E0D0', accent: '#E5484D', line: 'Crew is green across the board. Keep her level.' },
];
export const MODULES = [
  { id: 'wing-heat', name: 'WING-HEATING TURBINE', set: 'THERMAL', cost: 1, fx: 'Wing heat +40%, icing halved', desc: 'Exhaust-fed turbine keeps the leading edge clear.' },
  { id: 'twin-tail', name: 'TWIN TAIL RUDDER', set: 'AIRFRAME', cost: 1, fx: 'Turn rate +35%, gale drift −30%', desc: 'Twin fins bite the storm instead of sliding.' },
  { id: 'anti-ice-prop', name: 'ANTI-ICE PROPELLERS', set: 'THERMAL', cost: 1, fx: 'Prop ice never forms above 40% throttle', desc: 'Heated blades shed rime before it can bite.' },
  { id: 'fuel-bladder', name: 'AUX FUEL BLADDER', set: 'FUEL', cost: 1, fx: 'Fuel capacity +35', desc: 'A second bladder slung under the gondola.' },
  { id: 'aurora-scoop', name: 'AURORA SCOOP', set: 'SCIENCE', cost: 1, fx: 'Samples worth double score', desc: 'Copper vanes drink the charged air.' },
  { id: 'gyro-compass', name: 'GYRO COMPASS', set: 'AIRFRAME', cost: 1, fx: 'Heading drift −50% in storms', desc: 'A brass gyro that ignores magnetic lies.' },
  { id: 'boiler-boost', name: 'BOILER BOOST VALVE', set: 'THERMAL', cost: 1, fx: 'Heat builds 2× faster, overheat cap +15°', desc: 'Open the valve and feel the wings warm.' },
  { id: 'ice-radar', name: 'ICE RADAR', set: 'SCIENCE', cost: 1, fx: 'Peaks glow 200m earlier', desc: 'Echoes off the ice before your eyes do.' },
  { id: 'trim-tabs', name: 'TRIM TABS', set: 'AIRFRAME', cost: 1, fx: 'Throttle discipline bonus +25%', desc: 'Small tabs, steady hands, big score.' },
  { id: 'storm-shield', name: 'STORM SHIELDING', set: 'SCIENCE', cost: 1, fx: 'Magnetic damage −50%', desc: 'Copper mesh around the instruments.' },
  { id: 'efficient-cruise', name: 'EFFICIENT CRUISE', set: 'FUEL', cost: 1, fx: 'Fuel burn −20% at cruise throttle', desc: 'Lean mixture, long legs over the ice.' },
  { id: 'de-ice-boots', name: 'DE-ICE BOOTS', set: 'THERMAL', cost: 1, fx: 'Ice sheds automatically every 10s', desc: 'Rubber boots that shrug off the frost.' },
  { id: 'cargo-rack', name: 'SAMPLE CARGO RACK', set: 'SCIENCE', cost: 1, fx: 'Carry +4 samples per sortie', desc: 'Insulated racks for aurora vials.' },
  { id: 'reinforced-spar', name: 'REINFORCED SPAR', set: 'AIRFRAME', cost: 1, fx: 'Hull +40, peak hits hurt less', desc: 'A second spar through the wing root.' },
  { id: 'jet-intake', name: 'JET INTAKE SCOOP', set: 'FUEL', cost: 1, fx: 'Jet stream gives +fuel per ring', desc: 'The wind itself tops up the tanks.' },
  { id: 'emergency-flare', name: 'EMERGENCY FLARES', set: 'SCIENCE', cost: 1, fx: 'One free rescue per expedition', desc: 'Light the sky and base will find you.' },
  { id: 'copper-wiring', name: 'COPPER WIRING', set: 'THERMAL', cost: 1, fx: 'Heat never leaks below 20°', desc: 'Warm veins through the whole airframe.' },
  { id: 'polar-compass', name: 'POLAR COMPASS', set: 'AIRFRAME', cost: 1, fx: 'Rings glow through cloud cover', desc: 'A needle that points at the next gate.' },
];
export const PHENOMENA = [
  { name: 'SNOW SQUALL', fx: 'Visibility drops, drift rises' },
  { name: 'AURORA CURTAIN', fx: 'Score ×2 inside the green light' },
  { name: 'MAGNETIC GALE', fx: 'Heading spins, compass lies' },
  { name: 'ICE FOG', fx: 'Rings hidden until 150m' },
  { name: 'RIME ICE', fx: 'Wings ice unless heated' },
  { name: 'JET STREAM', fx: 'Speed +40%, fuel −25%' },
  { name: 'ST. ELMO’S FIRE', fx: 'Prop tips glow, +50 style' },
  { name: 'POLAR NIGHT', fx: 'Instruments only — fly blind' },
  { name: 'LIGHTNING ARC', fx: 'Dodge the magenta bolts' },
  { name: 'WHITEOUT', fx: 'Peaks invisible for 8s' },
  { name: 'HAIL BURST', fx: 'Hull chips −2 per hit' },
  { name: 'AURORA LOCK', fx: 'Hold a ring 3s for ×3' },
  { name: 'COLD SNAP', fx: 'Wing temp falls fast' },
  { name: 'SOLAR FLARE', fx: 'Radio crackles, score ×2' },
];
export const FEATS = [
  'FIRST LIGHT', 'RING RUNNER', 'GALE TAMER', 'ICE BREAKER', 'AURORA SCOUT',
  'STEADY HANDS', 'FUEL MISER', 'STORM RIDER', 'PEAK DANCER', 'SAMPLE MASTER',
  'NIGHT OWL', 'COMPASS TRUE', 'WING WARMER', 'GATE KEEPER', 'THREE RINGS',
  'FULL HOUSE', 'POLAR VETERAN', 'ZERO DAMAGE', 'SPEED DEMON', 'RANK S PILOT',
];
export const EVENTS = [
  { name: 'CREW BANTER', text: 'Erik bets Lena a coffee the next gate is a fake. It is not.' },
  { name: 'FUEL LEAK SCARE', text: 'A gauge flickers. Tomasz taps it twice. False alarm.' },
  { name: 'AURORA FLARE', text: 'The sky ignites green. Everyone stops talking to watch.' },
  { name: 'RADIO STATIC', text: 'Base fades into static, then returns mid-sentence.' },
  { name: 'ICE ON THE GLASS', text: 'Frost creeps across the canopy. Heat on, now.' },
  { name: 'TAILWIND GIFT', text: 'A sudden tailwind shoves the old bird forward.' },
  { name: 'BEACON SIGNAL', text: 'A faint beacon blinks from the ice below.' },
  { name: 'GULL IN THE STORM', text: 'A lone gull rides the gale beside the wing. Impossible. Beautiful.' },
  { name: 'ENGINE COUGH', text: 'The port engine coughs, then roars back to life.' },
  { name: 'STAR FIX', text: 'Erik takes a star fix through a gap in the cloud.' },
  { name: 'HOT COCOA', text: 'Sofia passes cocoa around the cabin. Morale +10.' },
  { name: 'NORTHERN LIGHTS', text: 'Magenta ribbons join the green. The whole crew cheers.' },
];
export const SET_BONUS = {
  THERMAL: 'THERMAL SET 2/2: wings never freeze',
  AIRFRAME: 'AIRFRAME SET 2/2: turn +15% extra',
  FUEL: 'FUEL SET 2/2: burn −10% extra',
  SCIENCE: 'SCIENCE SET 2/2: samples ×2 score',
};
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
