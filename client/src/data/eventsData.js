/**
 * CampusConnect Event Categories Configuration
 * Provides UI metadata, icons, and accent colors for event disciplines.
 * Note: Real event data is fetched directly from the Express/MySQL backend API.
 */
export const CATEGORIES = [
  {
    id: 'Technical',
    name: 'Technical',
    tagline: 'Hackathons, Web3 sprints, robotics arenas, & dev meetups.',
    count: 'Live Events',
    number: '01',
    accentColor: '#C6F24E',
    icon: 'Cpu'
  },
  {
    id: 'Cultural',
    name: 'Cultural',
    tagline: 'Concerts, indie stages, dance battles, and theatre nights.',
    count: 'Live Events',
    number: '02',
    accentColor: '#FF6B6B',
    icon: 'Music'
  },
  {
    id: 'Sports',
    name: 'Sports',
    tagline: 'LAN arenas, night leagues, cricket cups, and turf derbies.',
    count: 'Live Events',
    number: '03',
    accentColor: '#4ECDC4',
    icon: 'Trophy'
  },
  {
    id: 'Workshops',
    name: 'Workshops',
    tagline: 'Spatial design, generative AI, cloud arch, and sound production.',
    count: 'Live Events',
    number: '04',
    accentColor: '#FFBE0B',
    icon: 'Lightbulb'
  },
  {
    id: 'Entrepreneurship',
    name: 'Entrepreneurship',
    tagline: 'VC pitch battles, founder mixers, and angel grant showcases.',
    count: 'Live Events',
    number: '05',
    accentColor: '#A855F7',
    icon: 'Rocket'
  }
];
