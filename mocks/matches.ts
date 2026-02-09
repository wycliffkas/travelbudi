import { Match } from '@/types';

export const mockMatches: Match[] = [
  {
    id: 'm1',
    user: {
      id: 'u1',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      bio: 'Love exploring art galleries and trying local cuisine!',
    },
    compatibility: 95,
    trip: {
      id: '1',
      title: 'Paris City of Lights',
      location: 'Paris, France',
      dates: 'Mar 15-20, 2026',
    },
    status: 'pending',
  },
  {
    id: 'm2',
    user: {
      id: 'u2',
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      bio: 'Yoga enthusiast and adventure seeker.',
    },
    compatibility: 88,
    trip: {
      id: '2',
      title: 'Bali Beach & Wellness',
      location: 'Bali, Indonesia',
      dates: 'Apr 10-24, 2026',
    },
    status: 'pending',
  },
  {
    id: 'm3',
    user: {
      id: 'u3',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      bio: 'Photographer who loves capturing sunsets around the world.',
    },
    compatibility: 92,
    trip: {
      id: '4',
      title: 'Iceland Northern Lights',
      location: 'Reykjavik, Iceland',
      dates: 'Feb 20-26, 2026',
    },
    status: 'accepted',
  },
  {
    id: 'm4',
    user: {
      id: 'u4',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
      bio: 'Foodie and culture enthusiast. Always planning the next trip!',
    },
    compatibility: 85,
    trip: {
      id: '3',
      title: 'Tokyo Adventure',
      location: 'Tokyo, Japan',
      dates: 'May 1-8, 2026',
    },
    status: 'accepted',
  },
];
