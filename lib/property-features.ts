import { Feature, RoomType } from '@/types/property-valuation';

// Property features data - organized by room
// Weight scale: 1 (basic) to 5 (premium/luxury)
// All features in Dutch
export const propertyFeatures: Feature[] = [
  // Kitchen Features (Keuken)
  { id: 'k1', room: 'Kitchen', name: 'Kookeiland', weight: 4 },
  { id: 'k2', room: 'Kitchen', name: 'Gaggenau apparatuur', weight: 5 },
  { id: 'k3', room: 'Kitchen', name: 'Miele apparatuur', weight: 4 },
  { id: 'k4', room: 'Kitchen', name: 'Siemens apparatuur', weight: 2 },
  { id: 'k5', room: 'Kitchen', name: 'Bora kookplaat', weight: 3 },
  { id: 'k6', room: 'Kitchen', name: 'Quooker', weight: 2 },
  { id: 'k7', room: 'Kitchen', name: 'Wijnkoeler', weight: 2 },
  { id: 'k8', room: 'Kitchen', name: 'Combi-stoomoven', weight: 2 },
  { id: 'k9', room: 'Kitchen', name: 'Greepioze fronten', weight: 1 },
  { id: 'k10', room: 'Kitchen', name: 'Marmeren werkblad', weight: 4 },
  { id: 'k11', room: 'Kitchen', name: 'Soft-close lades', weight: 1 },
  { id: 'k12', room: 'Kitchen', name: 'Ingebouwde verlichting', weight: 1 },
  { id: 'k13', room: 'Kitchen', name: 'Open keuken / woonkeuken', weight: 3 },
  { id: 'k14', room: 'Kitchen', name: 'Afzuigkap', weight: 2 },
  { id: 'k15', room: 'Kitchen', name: 'Dubbele spoelbak', weight: 1 },
  { id: 'k16', room: 'Kitchen', name: 'Koffiehoek / Barista corner', weight: 3 },

  // Bathroom Features (Badkamer)
  { id: 'b1', room: 'Bathroom', name: 'Vrijstaand bad', weight: 4 },
  { id: 'b2', room: 'Bathroom', name: 'Villeroy & Boch sanitair', weight: 3 },
  { id: 'b3', room: 'Bathroom', name: 'Duravit toilet', weight: 2 },
  { id: 'b4', room: 'Bathroom', name: 'Hansgrohe kranen', weight: 2 },
  { id: 'b5', room: 'Bathroom', name: 'Wellness douche', weight: 3 },
  { id: 'b6', room: 'Bathroom', name: 'Sauna', weight: 5 },
  { id: 'b7', room: 'Bathroom', name: 'Sunshower', weight: 4 },
  { id: 'b8', room: 'Bathroom', name: 'Stoomcabine', weight: 4 },
  { id: 'b9', room: 'Bathroom', name: 'Design radiator', weight: 1 },
  { id: 'b10', room: 'Bathroom', name: 'Vloerverwarming', weight: 3 },
  { id: 'b11', room: 'Bathroom', name: 'Verlichte spiegel', weight: 1 },
  { id: 'b12', room: 'Bathroom', name: 'Inloopdouche', weight: 3 },
  { id: 'b13', room: 'Bathroom', name: 'Badkamermeubel op maat', weight: 2 },
  { id: 'b14', room: 'Bathroom', name: 'Goudkleurige kranen', weight: 1 },
  { id: 'b15', room: 'Bathroom', name: 'Marmeren afwerking', weight: 4 },
  { id: 'b16', room: 'Bathroom', name: 'Dubbele regendouche', weight: 4 },
  { id: 'b17', room: 'Bathroom', name: 'Dubbele wastafel', weight: 3 },
  { id: 'b18', room: 'Bathroom', name: 'Meerdere badkamers', weight: 5 },

  // Living Room Features (Woonkamer)
  { id: 'l1', room: 'Living Room', name: 'Design haard', weight: 4 },
  { id: 'l2', room: 'Living Room', name: 'Grote raampartijen', weight: 4 },
  { id: 'l3', room: 'Living Room', name: 'Domotica systeem', weight: 4 },
  { id: 'l4', room: 'Living Room', name: 'Hoog plafond', weight: 3 },
  { id: 'l5', room: 'Living Room', name: 'Inbouwspots', weight: 1 },
  { id: 'l6', room: 'Living Room', name: 'Home cinema systeem', weight: 3 },
  { id: 'l7', room: 'Living Room', name: 'Luxe vloer (visgraat/hout)', weight: 4 },
  { id: 'l8', room: 'Living Room', name: 'Slimme verlichting', weight: 2 },
  { id: 'l9', room: 'Living Room', name: 'Panoramisch uitzicht', weight: 5 },
  { id: 'l10', room: 'Living Room', name: 'Automatische gordijnen', weight: 2 },
  { id: 'l11', room: 'Living Room', name: 'Schuifpuien naar tuin', weight: 3 },
  { id: 'l12', room: 'Living Room', name: 'Maatwerk kastwand', weight: 2 },
  { id: 'l13', room: 'Living Room', name: 'Vloerverwarming', weight: 3 },
  { id: 'l14', room: 'Living Room', name: 'Haardwand / Cinewall', weight: 4 },

  // Outdoor Features (Buiten)
  { id: 'o1', room: 'Outdoor', name: 'Zwembad', weight: 5 },
  { id: 'o2', room: 'Outdoor', name: 'Verwarmd zwembad', weight: 5 },
  { id: 'o3', room: 'Outdoor', name: 'Jacuzzi', weight: 4 },
  { id: 'o4', room: 'Outdoor', name: 'Buitenkeuken', weight: 4 },
  { id: 'o5', room: 'Outdoor', name: 'Overkapping', weight: 2 },
  { id: 'o6', room: 'Outdoor', name: 'Terras met verwarming', weight: 1 },
  { id: 'o7', room: 'Outdoor', name: 'Dakterras', weight: 3 },
  { id: 'o8', room: 'Outdoor', name: 'Lounge gebied', weight: 1 },
  { id: 'o9', room: 'Outdoor', name: 'Tuinverlichting', weight: 1 },
  { id: 'o10', room: 'Outdoor', name: 'Automatisch irrigatiesysteem', weight: 2 },
  { id: 'o11', room: 'Outdoor', name: 'Tennisbaan', weight: 5 },
  { id: 'o12', room: 'Outdoor', name: 'Buitendouche', weight: 2 },
  { id: 'o13', room: 'Outdoor', name: 'Poolhouse', weight: 4 },
  { id: 'o14', room: 'Outdoor', name: 'Glazen schuifwanden', weight: 2 },
  { id: 'o15', room: 'Outdoor', name: 'Buitenhaard / Vuurtafel', weight: 3 },
  { id: 'o16', room: 'Outdoor', name: 'Verwarmde overkapping', weight: 3 },
  { id: 'o17', room: 'Outdoor', name: 'Luxe buitenspa / Plunge pool', weight: 5 },

  // Bedroom Features (Slaapkamer)
  { id: 'br1', room: 'Bedroom', name: 'Inloopkast', weight: 3 },
  { id: 'br2', room: 'Bedroom', name: 'Ensuite badkamer', weight: 3 },
  { id: 'br3', room: 'Bedroom', name: 'Balkon', weight: 2 },
  { id: 'br4', room: 'Bedroom', name: 'Slimme verlichting', weight: 1 },
  { id: 'br5', room: 'Bedroom', name: 'Luxe stoffering', weight: 1 },
  { id: 'br6', room: 'Bedroom', name: 'Panoramisch uitzicht', weight: 5 },
  { id: 'br7', room: 'Bedroom', name: 'Akoestische wandpanelen', weight: 1 },
  { id: 'br8', room: 'Bedroom', name: 'Automatische verduistering', weight: 2 },
  { id: 'br9', room: 'Bedroom', name: 'Maatwerk loungebank', weight: 1 },
  { id: 'br10', room: 'Bedroom', name: 'Ingebouwde kasten / maatwerkkasten', weight: 3 },
  { id: 'br11', room: 'Bedroom', name: 'Vloerverwarming', weight: 3 },
  { id: 'br12', room: 'Bedroom', name: 'Privé-terras / balkon', weight: 4 },

  // Extras Features (Extra's)
  { id: 'e1', room: 'Extras', name: 'Lift', weight: 5 },
  { id: 'e2', room: 'Extras', name: 'Gastenverblijf', weight: 5 },
  { id: 'e3', room: 'Extras', name: 'Paardenstal', weight: 5 },
  { id: 'e4', room: 'Extras', name: 'Garage met laadpaal', weight: 4 },
  { id: 'e5', room: 'Extras', name: 'Wijnkelder', weight: 4 },
  { id: 'e6', room: 'Extras', name: 'Fitnessruimte', weight: 4 },
  { id: 'e7', room: 'Extras', name: 'Wellnessruimte', weight: 5 },
  { id: 'e8', room: 'Extras', name: 'Kantoorruimte', weight: 2 },
  { id: 'e9', room: 'Extras', name: 'Mancave', weight: 2 },
  { id: 'e10', room: 'Extras', name: 'Bijkeuken', weight: 1 },
  { id: 'e11', room: 'Extras', name: 'Berging', weight: 1 },
  { id: 'e12', room: 'Extras', name: 'Technische ruimte', weight: 1 },
  { id: 'e13', room: 'Extras', name: 'Videobewaking', weight: 2 },
  { id: 'e14', room: 'Extras', name: 'Alarmcentrale', weight: 2 },
  { id: 'e15', room: 'Extras', name: 'Glasvezel internet', weight: 1 },
  { id: 'e16', room: 'Extras', name: 'Ontworpen door interieurontwerper', weight: 3 },
  { id: 'e17', room: 'Extras', name: 'Ontworpen door architect', weight: 4 },
  { id: 'e18', room: 'Extras', name: 'Garage voor meerdere auto\'s', weight: 4 },
  { id: 'e19', room: 'Extras', name: 'Carport / dubbele carport', weight: 3 },
  { id: 'e20', room: 'Extras', name: 'Hele woning voorzien van Domotica / smart home', weight: 5 },
];

// Get features by room
export function getFeaturesByRoom(room: RoomType): Feature[] {
  return propertyFeatures.filter((f) => f.room === room);
}

// Get max points for a room
export function getMaxPointsForRoom(room: RoomType): number {
  return getFeaturesByRoom(room).reduce((sum, f) => sum + f.weight, 0);
}

// Get feature by ID
export function getFeatureById(id: string): Feature | undefined {
  return propertyFeatures.find((f) => f.id === id);
}

// Get total feature count per room
export function getFeatureCountByRoom(room: RoomType): number {
  return getFeaturesByRoom(room).length;
}

// Room display configuration
export const roomConfig: Record<RoomType, { icon: string; color: string; bgColor: string }> = {
  Kitchen: { icon: 'ChefHat', color: '#FF6B35', bgColor: '#FFF4F0' },
  Bathroom: { icon: 'Bath', color: '#4ECDC4', bgColor: '#F0FFFE' },
  'Living Room': { icon: 'Sofa', color: '#7B68EE', bgColor: '#F5F3FF' },
  Outdoor: { icon: 'TreePine', color: '#2ECC71', bgColor: '#F0FFF4' },
  Bedroom: { icon: 'Bed', color: '#E91E63', bgColor: '#FFF0F5' },
  Extras: { icon: 'Sparkles', color: '#FFD700', bgColor: '#FFFEF0' },
};
