import { Timeline } from './types';

export const INITIAL_TIMELINES: Timeline[] = [
  {
    id: 'ancient-wonders',
    title: 'Seven Wonders of the Ancient World',
    description: 'A journey through the architectural marvels of the classical antiquity period.',
    category: 'historical',
    events: [
      {
        id: '1',
        year: '2560 BC',
        title: 'Great Pyramid of Giza',
        description: 'Completed as a tomb for Pharaoh Khufu. It is the oldest of the Ancient Wonders and the only one to remain largely intact.',
        imageUrl: 'https://picsum.photos/seed/pyramid/800/600'
      },
      {
        id: '2',
        year: '600 BC',
        title: 'Hanging Gardens of Babylon',
        description: 'Built by Nebuchadnezzar II for his wife Amytis, who missed the green hills of her homeland. Its actual existence remains unverified by archaeology.',
        imageUrl: 'https://picsum.photos/seed/gardens/800/600'
      },
      {
        id: '3',
        year: '435 BC',
        title: 'Statue of Zeus at Olympia',
        description: 'A giant seated figure made by the Greek sculptor Phidias. It was erected in the Temple of Zeus at the sanctuary of Olympia.',
        imageUrl: 'https://picsum.photos/seed/zeus/800/600'
      },
      {
        id: '4',
        year: '350 BC',
        title: 'Mausoleum at Halicarnassus',
        description: 'A tomb built for Mausolus, a satrap in the Persian Empire, and his sister-wife Artemisia II of Caria.',
        imageUrl: 'https://picsum.photos/seed/mausoleum/800/600'
      },
      {
        id: '5',
        year: '280 BC',
        title: 'Colossus of Rhodes',
        description: 'A statue of the Greek sun-god Helios, erected in the city of Rhodes on the Greek island of the same name.',
        imageUrl: 'https://picsum.photos/seed/colossus/800/600'
      },
      {
        id: '6',
        year: '280 BC',
        title: 'Lighthouse of Alexandria',
        description: 'Built by the Ptolemaic Kingdom, it was estimated to be at least 100 metres in overall height.',
        imageUrl: 'https://picsum.photos/seed/lighthouse/800/600'
      }
    ]
  },
  {
    id: 'moon-landing',
    title: 'The Space Race & Moon Landing',
    description: 'Key events leading up to humanity\'s first steps on the lunar surface.',
    category: 'historical',
    events: [
      {
        id: 'm1',
        year: '1957',
        title: 'Sputnik 1 Launch',
        description: 'The Soviet Union launches the first artificial satellite into orbit, marking the start of the Space Race.',
        imageUrl: 'https://picsum.photos/seed/sputnik/800/600'
      },
      {
        id: 'm2',
        year: '1961',
        title: 'Yuri Gagarin in Space',
        description: 'Soviet cosmonaut Yuri Gagarin becomes the first human to journey into outer space.',
        imageUrl: 'https://picsum.photos/seed/gagarin/800/600'
      },
      {
        id: 'm3',
        year: '1962',
        title: 'JFK Rice University Speech',
        description: 'President Kennedy delivers his famous "We choose to go to the Moon" speech.',
        imageUrl: 'https://picsum.photos/seed/jfk/800/600'
      },
      {
        id: 'm4',
        year: '1969',
        title: 'Apollo 11 Landing',
        description: 'Neil Armstrong and Buzz Aldrin land the Lunar Module Eagle on the Moon.',
        imageUrl: 'https://picsum.photos/seed/apollo/800/600'
      }
    ]
  }
];
