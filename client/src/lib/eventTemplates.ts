
import { z } from 'zod';
import { BookOpen, Wrench, Coffee, Users, Calendar, Star, Video, Music, 
         Briefcase, Code, Gamepad, Heart, Image, Mail, Map, Phone,
         Rocket, ShoppingBag, Sun, Zap } from 'lucide-react';

export const ICONS = {
  'book-open': BookOpen,
  'wrench': Wrench,
  'coffee': Coffee,
  'users': Users,
  'calendar': Calendar,
  'star': Star,
  'video': Video,
  'music': Music,
  'briefcase': Briefcase,
  'code': Code,
  'gamepad': Gamepad,
  'heart': Heart,
  'image': Image,
  'mail': Mail,
  'map': Map,
  'phone': Phone,
  'rocket': Rocket,
  'shopping': ShoppingBag,
  'sun': Sun,
  'zap': Zap
};

export const eventTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(),
  color: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export type EventTemplate = z.infer<typeof eventTemplateSchema>;

const storedTemplates = localStorage.getItem('eventTemplates');
const defaultTemplates = [
  {
    id: 'roman-reher',
    title: 'Roman Reher',
    duration: 25,
    color: 'bg-amber-50',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'jack-mallers',
    title: 'Jack Mallers',
    duration: 25,
    color: 'bg-amber-100',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'speaker',
    title: 'Speaker',
    duration: 25,
    color: 'bg-yellow-100',
    description: 'Guest speaker session',
    icon: 'users'
  },
  {
    id: 'lecture',
    title: 'Lecture',
    duration: 25,
    color: 'bg-blue-100',
    description: 'Standard lecture session',
    icon: 'book-open'
  },
  {
    id: 'workshop',
    title: 'Workshop',
    duration: 25,
    color: 'bg-green-100',
    description: 'Interactive workshop session',
    icon: 'wrench'
  },
  {
    id: 'break',
    title: 'Break',
    duration: 25,
    color: 'bg-orange-100',
    description: 'Break or rest period',
    icon: 'coffee'
  },
  {
    id: 'meeting',
    title: 'Meeting',
    duration: 25,
    color: 'bg-purple-100',
    description: 'Team meeting or discussion',
    icon: 'users'
  }
];

export let EVENT_TEMPLATES: EventTemplate[] = storedTemplates ? JSON.parse(storedTemplates) : defaultTemplates;

export const saveEventTemplates = () => {
  localStorage.setItem('eventTemplates', JSON.stringify(EVENT_TEMPLATES));
};

export const deleteEventTemplate = (id: string) => {
  EVENT_TEMPLATES = EVENT_TEMPLATES.filter(t => t.id !== id);
  saveEventTemplates();
};

export const editEventTemplate = (id: string, updates: Partial<EventTemplate>) => {
  EVENT_TEMPLATES = EVENT_TEMPLATES.map(t => 
    t.id === id ? { ...t, ...updates } : t
  );
  saveEventTemplates();
};
