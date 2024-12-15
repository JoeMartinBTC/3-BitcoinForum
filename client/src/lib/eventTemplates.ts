
import { z } from 'zod';

export const eventTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(),
  color: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export type EventTemplate = z.infer<typeof eventTemplateSchema>;

export let EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'keynote',
    title: 'Keynote',
    duration: 25,
    color: 'bg-rose-100',
    description: 'Main presentation',
    icon: 'star'
  },
  {
    id: 'panel',
    title: 'Panel',
    duration: 25,
    color: 'bg-sky-100',
    description: 'Discussion panel',
    icon: 'users'
  },
  {
    id: 'workshop',
    title: 'Workshop',
    duration: 25,
    color: 'bg-emerald-100',
    description: 'Interactive session',
    icon: 'wrench'
  },
  {
    id: 'networking',
    title: 'Networking',
    duration: 25,
    color: 'bg-violet-100',
    description: 'Networking session',
    icon: 'users'
  },
  {
    id: 'presentation',
    title: 'Presentation',
    duration: 25,
    color: 'bg-amber-100',
    description: 'Speaker presentation',
    icon: 'video'
  },
  {
    id: 'break',
    title: 'Break',
    duration: 25,
    color: 'bg-slate-100',
    description: 'Break time',
    icon: 'coffee'
  },
  {
    id: 'qa-session',
    title: 'Q&A Session',
    duration: 25,
    color: 'bg-lime-100',
    description: 'Questions & Answers',
    icon: 'message'
  },
  {
    id: 'demo',
    title: 'Demo',
    duration: 25,
    color: 'bg-orange-100',
    description: 'Product demonstration',
    icon: 'rocket'
  },
  {
    id: 'roundtable',
    title: 'Roundtable',
    duration: 25,
    color: 'bg-teal-100',
    description: 'Group discussion',
    icon: 'users'
  },
  {
    id: 'technical',
    title: 'Technical',
    duration: 25,
    color: 'bg-cyan-100',
    description: 'Technical session',
    icon: 'code'
  },
  {
    id: 'meetup',
    title: 'Meetup',
    duration: 25,
    color: 'bg-fuchsia-100',
    description: 'Casual meetup',
    icon: 'users'
  },
  {
    id: 'lightning',
    title: 'Lightning Talk',
    duration: 25,
    color: 'bg-yellow-100',
    description: 'Quick presentation',
    icon: 'zap'
  },
  {
    id: 'interview',
    title: 'Interview',
    duration: 25,
    color: 'bg-indigo-100',
    description: 'Interview session',
    icon: 'users'
  },
  {
    id: 'awards',
    title: 'Awards',
    duration: 25,
    color: 'bg-purple-100',
    description: 'Awards ceremony',
    icon: 'star'
  },
  {
    id: 'research',
    title: 'Research',
    duration: 25,
    color: 'bg-blue-100',
    description: 'Research presentation',
    icon: 'book-open'
  },
  {
    id: 'exhibition',
    title: 'Exhibition',
    duration: 25,
    color: 'bg-red-100',
    description: 'Exhibition time',
    icon: 'image'
  },
  {
    id: 'social',
    title: 'Social Event',
    duration: 25,
    color: 'bg-pink-100',
    description: 'Social gathering',
    icon: 'heart'
  },
  {
    id: 'planning',
    title: 'Planning',
    duration: 25,
    color: 'bg-green-100',
    description: 'Planning session',
    icon: 'calendar'
  },
  {
    id: 'feedback',
    title: 'Feedback',
    duration: 25,
    color: 'bg-stone-100',
    description: 'Feedback session',
    icon: 'message'
  },
  {
    id: 'closing',
    title: 'Closing',
    duration: 25,
    color: 'bg-zinc-100',
    description: 'Closing remarks',
    icon: 'flag'
  }
];
