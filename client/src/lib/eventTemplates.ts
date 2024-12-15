import { z } from 'zod';

export const eventTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(), // in minutes
  color: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export type EventTemplate = z.infer<typeof eventTemplateSchema>;

export const EVENT_TEMPLATES: EventTemplate[] = [
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
    id: 'michael-saylor',
    title: 'Michael Saylor',
    duration: 25,
    color: 'bg-yellow-50',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'alex-frankenberg',
    title: 'Alex von Frankenberg',
    duration: 25,
    color: 'bg-yellow-100',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'prof-schnabl',
    title: 'Prof. Schnabl',
    duration: 25,
    color: 'bg-amber-200',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'rahim-taghizadegan',
    title: 'Rahim Taghizadegan',
    duration: 25,
    color: 'bg-yellow-200',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'king-bhutan',
    title: 'König von Bhutan',
    duration: 25,
    color: 'bg-amber-300',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'ijoma-mangold',
    title: 'Ijoma Mangold',
    duration: 25,
    color: 'bg-yellow-300',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'dr-stelter',
    title: 'Dr. Stelter',
    duration: 25,
    color: 'bg-amber-400',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'isabell-schnabel',
    title: 'Isabell Schnabel',
    duration: 25,
    color: 'bg-yellow-400',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'florian-bruce',
    title: 'Florian Bruce',
    duration: 25,
    color: 'bg-amber-500',
    description: 'Speaker session',
    icon: 'users'
  }
];
