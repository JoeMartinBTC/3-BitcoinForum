import { useDrag } from 'react-dnd';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useContext } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Event } from '@db/schema';
import { EVENT_TEMPLATES } from '../lib/eventTemplates';
import { BookOpen, Wrench, Coffee, Users, Calendar, Star, Video, Music, Briefcase, Code, Gamepad, Heart, Image, Mail, Map, Phone, Rocket, ShoppingBag, Sun, Zap, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ICONS = {
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
  'shopping-bag': ShoppingBag,
  'sun': Sun,
  'zap': Zap
};

interface EventCardProps {
  event: Event;
  onUpdate: (updates: Partial<Event> & { id: number }) => void;
}

export function EventCard({ event, onUpdate }: EventCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EVENT',
    item: event,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      console.log('Drag ended:', { didDrop, item });
    },
  }));

  const [title, setTitle] = useState(event.title);
  const template = EVENT_TEMPLATES.find(t => t.id === event.templateId) || EVENT_TEMPLATES[0] || {
    id: 'default',
    title: 'Default',
    duration: 25,
    color: 'bg-gray-100',
    description: 'Default event',
    icon: 'users'
  };
  const iconKey = (template?.icon && template.icon in ICONS) ? template.icon : 'users';
  const Icon = ICONS[iconKey as keyof typeof ICONS] || ICONS.users;

  const password = localStorage.getItem('schedule-password');
  const isAdmin = password === '3';

  const handleDelete = async () => {
    try {
      await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: { 'x-password': password || '' }
      });
      onUpdate({ id: event.id, deleted: true });
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="h-full">
      <div className={`cursor-move hover:shadow-md transition-shadow w-full h-full overflow-hidden group ${template.color}`}>
        <div className="flex h-full items-center">
          <div className="flex flex-1 min-w-0 items-center">
            <div className="flex items-center gap-1">
              <span className={`font-medium text-left text-ellipsis ${
                event.title.length > 40 ? 'text-[0.6rem]' : 
                event.title.length > 25 ? 'text-[0.7rem]' : 
                'text-[0.75rem]'
              } leading-tight line-clamp-3 whitespace-normal`}>
                {event.title}
              </span>
              {event.info && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help opacity-50 hover:opacity-100" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">{event.info}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-1.5 ml-1">✎</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {EVENT_TEMPLATES.map((t) => {
                      const TemplateIcon = t.icon ? ICONS[t.icon as keyof typeof ICONS] : null;
                      return (
                        <Button
                          key={t.id}
                          variant={event.templateId === t.id ? "default" : "outline"}
                          className={`p-4 h-auto flex flex-col items-center gap-2 ${t.color}`}
                          onClick={() => onUpdate({ 
                            id: event.id, 
                            templateId: t.id,
                            color: t.color
                          })}
                        >
                          {TemplateIcon && <TemplateIcon className="h-6 w-6" />}
                          <span>{t.title}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <div className="space-y-4">
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Event title"
                    />
                    <Input
                      value={event.info || ''}
                      onChange={(e) => onUpdate({ id: event.id, info: e.target.value })}
                      placeholder="Event info (optional)"
                    />
                  </div>
                  <DialogPrimitive.Close asChild>
                    <Button onClick={() => onUpdate({ id: event.id, title })}>
                      Save Changes
                    </Button>
                  </DialogPrimitive.Close>
                </div>
              </DialogContent>
            </Dialog>
            {localStorage.getItem('schedule-password') === '99ballons' && (
              <button 
                onClick={handleDelete}
                className="absolute top-1 left-1 p-1.5 text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}