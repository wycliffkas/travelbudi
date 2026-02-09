import { Conversation } from '@/types';

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    user: {
      id: 'u3',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    },
    tripContext: 'Iceland Northern Lights',
    lastMessage: 'Can\'t wait for the trip! Have you packed warm clothes?',
    lastMessageTime: '2:30 PM',
    unreadCount: 2,
    messages: [
      { id: 'msg1', text: 'Hey! So excited we matched for Iceland!', senderId: 'u3', timestamp: '1:00 PM' },
      { id: 'msg2', text: 'Me too! It\'s going to be amazing!', senderId: 'me', timestamp: '1:15 PM' },
      { id: 'msg3', text: 'Have you seen the northern lights before?', senderId: 'u3', timestamp: '1:45 PM' },
      { id: 'msg4', text: 'Never! This will be my first time. You?', senderId: 'me', timestamp: '2:00 PM' },
      { id: 'msg5', text: 'Can\'t wait for the trip! Have you packed warm clothes?', senderId: 'u3', timestamp: '2:30 PM' },
    ],
  },
  {
    id: 'c2',
    user: {
      id: 'u4',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    },
    tripContext: 'Tokyo Adventure',
    lastMessage: 'I found this amazing ramen place we should try!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: 'msg6', text: 'Hey Alex! Ready for Tokyo?', senderId: 'me', timestamp: 'Yesterday 10:00 AM' },
      { id: 'msg7', text: 'Absolutely! Been studying Japanese phrases haha', senderId: 'u4', timestamp: 'Yesterday 10:30 AM' },
      { id: 'msg8', text: 'I found this amazing ramen place we should try!', senderId: 'u4', timestamp: 'Yesterday 11:00 AM' },
    ],
  },
];
