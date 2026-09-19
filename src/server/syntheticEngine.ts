import { ComplaintRecord, ComplaintCategory, ComplaintStatus, PriorityLevel } from '../types';
import { METRO_ZONES } from './dataStore';

interface SyntheticOptions {
  count?: number;
  seed?: number;
  anomalyRate?: number;
  duplicateRate?: number;
  daysBack?: number;
}

// Pseudo-random generator with seed
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STREET_NAMES: Record<string, string[]> = {
  'Downtown North': ['Lexington Ave', '5th Ave', 'Broadway', 'Madison Ave', '42nd St', 'Vanderbilt Blvd', 'Grand Central Way'],
  'River District': ['Water Street', 'Pier 17 Promenade', 'West St', 'Fulton St', 'Battery Place', 'Hudson River Green'],
  'Industrial Heights': ['Manufacturing Parkway', 'Railroad Way', 'Depot St', 'Warehouse Row', 'Foundry Lane', 'Ironworks Ave'],
  'West Hills': ['Oak Ridge Road', 'Panoramic Way', 'Highland Crest', 'Summit Ave', 'Skyline Blvd', 'Timberline Trail'],
  'South Quarter': ['Martin Luther King Jr Blvd', 'Liberty Ave', 'Atlantic Blvd', 'Flatbush Way', 'Dean Street', 'Prospect Ave'],
  'East Park & Greenbelt': ['Boulevard of the Allies', 'Meadowbrook Lane', 'Flushing Ave', 'Parkside Walk', 'Botanical Way', 'Greenway Blvd'],
};

const CATEGORY_TEMPLATES: Record<ComplaintCategory, { subcategories: string[]; titles: string[]; descriptions: string[] }> = {
  'Potholes & Pavement Cracks': {
    subcategories: ['Deep Wheel Impact Pothole', 'Longitudinal Asphalt Fissure', 'Alligator Cracking Zone', 'Sunken Utility Trench'],
    titles: [
      'Hazardous pothole causing vehicle swerving near intersection',
      'Expanding wheel-impact crater near storm drain',
      'Severe alligator cracking spreading across eastbound lane',
      'Sunken asphalt depression following utility cut',
      'Broken road edge damaging bicycle lane tires'
    ],
    descriptions: [
      'Vehicles are forced to swerve into oncoming lanes to avoid deep asphalt crater measuring roughly 30cm across and 12cm deep.',
      'Significant surface decay and loose gravel scattered across traffic lanes. Risk of tire blowout during heavy transit hours.',
      'Asphalt has collapsed following recent freeze-thaw cycle. Multiple complaints already noted by delivery drivers.',
      'Deep groove along lane boundary exposing underlying gravel substrate. Water pooling heavily when raining.',
      'Pavement depression near bus stop causing buses to scrape undercarriages upon arrival.'
    ]
  },
  'Water Main & Drainage': {
    subcategories: ['Blocked Storm Grate', 'Pressurized Water Main Leak', 'Sewage Odor & Overflow', 'Urban Catch Basin Failure'],
    titles: [
      'Severe street flooding due to clogged catch basin',
      'Pressurized potable water bubbling through asphalt seam',
      'Storm drain completely obstructed by silt and autumn leaves',
      'Backflow odor and standing greywater near pedestrian crosswalk',
      'Low municipal water pressure and bubbling ground leak'
    ],
    descriptions: [
      'Persistent water accumulation across both lanes of traffic. Pedestrians unable to cross without walking into traffic.',
      'Clear pressurized stream escaping through cracked asphalt. Estimated loss exceeding 40 gallons per minute.',
      'Catch basin covered in urban debris. Water depth over 10 inches after mild precipitation.',
      'Foul odor emanating from subterranean storm collector during warm afternoon hours. Suspected grease blockage.',
      'Water pooling around utility box with audible subterranean hiss indicating cracked supply line.'
    ]
  },
  'Streetlight & Electrical': {
    subcategories: ['Exposed Electrical Conduit', 'Lamp Head Dark / Burnt Out', 'Flickering High-Pressure Sodium', 'Knocked-Down Luminaire'],
    titles: [
      'Complete blackout of four consecutive municipal streetlights',
      'Exposed junction box wiring at pedestrian walking height',
      'High-mast luminaire swaying precariously in gusty winds',
      'Rapid strobe flickering of roadway LED luminaire',
      'Light pole base corrosion with leaning structural mast'
    ],
    descriptions: [
      'Critical pedestrian corridor completely unlit between 8pm and 5am. Safety risk for transit commuters.',
      'Ground-level handhole cover is missing, leaving high-voltage wires exposed to rain and curious pedestrians.',
      'Luminaire fixture loose on bracket arm; risks detaching onto oncoming commuter traffic.',
      'Erratic strobe effect distracting motor vehicle drivers at night. Reported by neighborhood watch.',
      'Heavy rust pitting at anchor base plate. Structural integrity compromised.'
    ]
  },
  'Illegal Dumping & Waste': {
    subcategories: ['Commercial Construction Rubble', 'Abandoned Bulky Mattress/Furniture', 'Hazardous Chemical Drums', 'Overflowing Municipal Receptacle'],
    titles: [
      'Large pile of drywall and demolition waste obstructing alleyway',
      'Discarded commercial refrigerators and appliances on sidewalk',
      'Multiple unlabeled plastic chemical containers abandoned on verge',
      'Municipal trash cans overflowing onto storm drains',
      'Illegal tire stockpile creating fire and rodent hazard'
    ],
    descriptions: [
      'Over two cubic yards of contractor demolition debris dumped under cover of darkness. Blocks fire escape access.',
      'Appliances dumped with doors intact. Urgent safety hazard for neighborhood children.',
      'Strong chemical solvent odor radiating from three 55-gallon drums abandoned beside industrial rail spur.',
      'Receptacle capacity exceeded; wind scattering plastic wrappers across parkland.',
      'Dozens of worn tires stacked adjacent to electrical substation. High fire load.'
    ]
  },
  'Traffic Signal Outage': {
    subcategories: ['All-Red Flash Mode', 'Dark Intersection / Power Lost', 'Stuck Signal Cycle', 'Damaged Pedestrian Pushbutton'],
    titles: [
      'Four-way traffic signal flashing red during peak morning rush',
      'Complete signal blackout at major multi-lane arterial',
      'Pedestrian countdown head completely shattered',
      'Left-turn arrow stuck green causing severe cross-traffic gridlock',
      'Traffic controller cabinet door swung open with exposed relays'
    ],
    descriptions: [
      'Intersection of major transit lines reverted to default fail-safe all-red flash. Gridlock backed up 6 blocks.',
      'Signals completely unpowered following local utility brownout. Police presence requested for manual direction.',
      'Pedestrian crossing signal non-functional; school crossing guard unable to halt cross traffic safely.',
      'Actuator loop malfunction holding side street green indefinitely while main arterial queues.',
      'Metal cabinet unlatched and vandalized. Control electronics exposed to elements.'
    ]
  },
  'Noise & Public Nuisance': {
    subcategories: ['Unpermitted Rooftop HVAC Resonance', 'After-Hours Construction Machinery', 'Commercial Loading Bay Idling', 'Defective Acoustic Alarm'],
    titles: [
      'Rooftop chiller producing continuous low-frequency hum exceeding decibel code',
      'Heavy excavator operating during restricted quiet hours',
      'Refrigerated delivery trucks idling continuously beside residential facade',
      'Faulty security horn blaring continuously for over three hours',
      'Industrial metal shearing operating with open bay doors at night'
    ],
    descriptions: [
      'Continuous low-frequency vibration measured at 74 dB(A) inside residential bedrooms from adjacent commercial building.',
      'Pneumatic rock breaker operating before 6:00 AM on Sunday in direct violation of municipal noise ordinance.',
      'Diesel exhaust fumes and compressor drone penetrating ground floor residential windows all night long.',
      'Building alarm triggering false positive siren repeatedly, disrupting entire neighborhood.',
      'Loud metallic impacts echoing across residential district after permitted construction curfew.'
    ]
  },
  'Structural Hazard & Sidewalk': {
    subcategories: ['Trip Hazard / Heaved Concrete Slab', 'Retaining Wall Bulge & Spalling', 'Cracked Pedestrian Bridge Parapet', 'Damaged Scaffold Canopy'],
    titles: [
      'Tree root causing 3-inch sidewalk slab heave directly outside clinic',
      'Stone masonry retaining wall displaying progressive outward bulge',
      'Concrete spalling on underside of elevated pedestrian overpass',
      'Loose pedestrian safety barricade fallen into active bicycle lane',
      'Deteriorated basement access hatch lid flexing under foot traffic'
    ],
    descriptions: [
      'Concrete flag lifted over 75mm creating acute trip hazard. Multiple senior citizen falls reported this week.',
      'Mortar failure and visible 4-inch deflection in granite block wall along public walkway. Collapse danger.',
      'Fist-sized chunks of concrete fell onto pedestrian footpath beneath overpass. Rebar corrosion visible.',
      'Wooden scaffold protective shelter damaged by box truck impact. Overhead debris net tearing.',
      'Rusted diamond-plate cellar door gives way under moderate foot pressure. Immediate puncture/fall risk.'
    ]
  }
};

const SAMPLE_TAGS: Record<ComplaintCategory, string[]> = {
  'Potholes & Pavement Cracks': ['asphalt', 'roadway', 'transit_delay', 'vehicle_damage', 're-paving'],
  'Water Main & Drainage': ['flooding', 'infrastructure', 'drinking_water', 'catch_basin', 'leakage'],
  'Streetlight & Electrical': ['pedestrian_safety', 'electrical', 'night_visibility', 'luminaire'],
  'Illegal Dumping & Waste': ['sanitation', 'hazardous', 'blight', 'bulk_waste', 'code_enforcement'],
  'Traffic Signal Outage': ['traffic_safety', 'gridlock', 'signal_cabinet', 'sensor_loop', 'pedestrian'],
  'Noise & Public Nuisance': ['decibels', 'night_disturbance', 'diesel_idle', 'chiller_vibration'],
  'Structural Hazard & Sidewalk': ['trip_hazard', 'ada_compliance', 'structural', 'pedestrian', 'masonry']
};

export function generateSyntheticDataset(options: SyntheticOptions = {}): ComplaintRecord[] {
  const count = options.count || 480;
  const seed = options.seed || 1337;
  const anomalyRate = options.anomalyRate ?? 0.06;
  const duplicateRate = options.duplicateRate ?? 0.08;
  const daysBack = options.daysBack || 45;

  const rand = createRandom(seed);
  const categories = Object.keys(CATEGORY_TEMPLATES) as ComplaintCategory[];
  const records: ComplaintRecord[] = [];

  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // Pick zone with slight weighted probability
    const zoneIndex = Math.floor(rand() * METRO_ZONES.length);
    const zone = METRO_ZONES[zoneIndex];

    // Pick category
    const catIndex = Math.floor(rand() * categories.length);
    const category = categories[catIndex];
    const template = CATEGORY_TEMPLATES[category];

    // Subcategory, title, description
    const subIdx = Math.floor(rand() * template.subcategories.length);
    const titleIdx = Math.floor(rand() * template.titles.length);
    const descIdx = Math.floor(rand() * template.descriptions.length);

    const subcategory = template.subcategories[subIdx];
    const title = template.titles[titleIdx];
    const description = template.descriptions[descIdx];

    // Generate coordinate clustered near zone center with realistic jitter
    // ~ 0.01 degree is ~ 1.1 km
    const latOffset = (rand() - 0.5) * 0.032;
    const lngOffset = (rand() - 0.5) * 0.045;
    const lat = Math.round((zone.centerLat + latOffset) * 100000) / 100000;
    const lng = Math.round((zone.centerLng + lngOffset) * 100000) / 100000;

    const streets = STREET_NAMES[zone.name] || ['Main Street', 'Civic Way'];
    const street = streets[Math.floor(rand() * streets.length)];
    const houseNum = Math.floor(rand() * 850) + 12;
    const address = `${houseNum} ${street}, ${zone.name}`;

    // Timestamp within daysBack
    const daysAgo = rand() * daysBack;
    const createdTimestamp = now - Math.floor(daysAgo * 86400000);
    const createdAt = new Date(createdTimestamp).toISOString();

    // Priority
    const priorityRoll = rand();
    let priority: PriorityLevel = 'MEDIUM';
    let slaTargetHours = 72;

    if (priorityRoll < 0.12 || (category === 'Traffic Signal Outage' && rand() < 0.4)) {
      priority = 'CRITICAL';
      slaTargetHours = 12;
    } else if (priorityRoll < 0.40) {
      priority = 'HIGH';
      slaTargetHours = 24;
    } else if (priorityRoll < 0.85) {
      priority = 'MEDIUM';
      slaTargetHours = 72;
    } else {
      priority = 'LOW';
      slaTargetHours = 168;
    }

    // Status: older items more likely resolved
    const elapsedHours = (now - createdTimestamp) / 3600000;
    let status: ComplaintStatus = 'NEW';
    let resolvedAt: string | null = null;
    let actualResolutionHours: number | null = null;

    if (elapsedHours > 72 && rand() < 0.72) {
      status = 'RESOLVED';
      actualResolutionHours = Math.round((rand() * slaTargetHours * 1.3 + 4) * 10) / 10;
      resolvedAt = new Date(createdTimestamp + (actualResolutionHours * 3600000)).toISOString();
    } else if (elapsedHours > 36 && rand() < 0.45) {
      status = 'IN_PROGRESS';
    } else if (elapsedHours > 12 && rand() < 0.55) {
      status = 'ASSIGNED';
    } else if (elapsedHours > 3 && rand() < 0.6) {
      status = 'TRIAGED';
    }

    const slaBreached = status !== 'RESOLVED' 
      ? elapsedHours > slaTargetHours 
      : (actualResolutionHours !== null && actualResolutionHours > slaTargetHours);

    // Source channel
    const chanRoll = rand();
    const sourceChannel = chanRoll < 0.50 ? 'MOBILE_APP' : chanRoll < 0.75 ? 'HOTLINE_311' : chanRoll < 0.90 ? 'WEB_PORTAL' : 'FIELD_INSPECTOR';

    // Sentiment and urgency
    const sentimentScore = Math.round((-0.2 - rand() * 0.7) * 100) / 100; // generally negative citizen frustration
    const urgencyScore = priority === 'CRITICAL' ? Math.floor(rand() * 15 + 85) : priority === 'HIGH' ? Math.floor(rand() * 20 + 65) : Math.floor(rand() * 40 + 30);

    const trackingNumber = `CP-${new Date(createdAt).getFullYear()}-${String(i + 1001).padStart(5, '0')}`;
    const id = `rec-${i + 1}`;

    const tags = SAMPLE_TAGS[category] || ['urban', 'maintenance'];
    const estimatedCost = Math.round((rand() * 1800 + 150) / 10) * 10;

    records.push({
      id,
      trackingNumber,
      category,
      subcategory,
      title,
      description,
      createdAt,
      updatedAt: createdAt,
      resolvedAt,
      status,
      priority,
      location: {
        lat,
        lng,
        address,
        zone: zone.name,
        districtId: zone.zoneId,
      },
      sourceChannel,
      reporterType: sourceChannel === 'FIELD_INSPECTOR' ? 'CITY_CREW' : 'CITIZEN',
      daysOpen: Math.round(elapsedHours / 24 * 10) / 10,
      slaBreached,
      slaTargetHours,
      actualResolutionHours,
      upvotes: Math.floor(rand() * 22),
      sentimentScore,
      urgencyScore,
      assignedTeam: `Crew ${zone.zoneId.split('-')[1]}-${(i % 4) + 1}`,
      estimatedRepairCostUSD: estimatedCost,
      tags: [...tags].sort(() => 0.5 - rand()).slice(0, 3),
      imageUrl: rand() < 0.18 ? `/sample-damage-${(i % 5) + 1}.jpg` : undefined,
    });
  }

  // Inject duplicate references
  const duplicateCount = Math.floor(count * duplicateRate);
  for (let d = 0; d < duplicateCount; d++) {
    const origIdx = Math.floor(rand() * (records.length - 20));
    const targetIdx = origIdx + Math.floor(rand() * 15) + 1;
    if (targetIdx < records.length) {
      records[targetIdx].duplicateOfId = records[origIdx].id;
      records[targetIdx].similarityScore = Math.round((0.78 + rand() * 0.19) * 100) / 100;
      records[targetIdx].category = records[origIdx].category;
      records[targetIdx].location = { ...records[origIdx].location, address: records[origIdx].location.address + ' (Corner)' };
    }
  }

  // Inject localized anomaly clusters if requested
  if (anomalyRate > 0) {
    const anomalySpikeZone = METRO_ZONES[2]; // Industrial Heights Pothole Spike
    for (let a = 0; a < Math.floor(count * anomalyRate); a++) {
      const target = records[Math.floor(rand() * records.length)];
      target.category = 'Potholes & Pavement Cracks';
      target.location.zone = anomalySpikeZone.name;
      target.location.districtId = anomalySpikeZone.zoneId;
      target.location.lat = anomalySpikeZone.centerLat + (rand() - 0.5) * 0.006;
      target.location.lng = anomalySpikeZone.centerLng + (rand() - 0.5) * 0.008;
      target.priority = 'CRITICAL';
      target.urgencyScore = 95;
    }
  }

  // Sort descending by creation date
  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return records;
}
