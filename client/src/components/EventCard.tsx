
import { useDrag } from 'react-dnd';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { Event } from '@db/schema';
import { EVENT_TEMPLATES } from '../lib/eventTemplates';
import { BookOpen, Wrench, Coffee, Users } from 'lucide-react';

const ICONS = {
  'book-open': BookOpen,
  'wrench': Wrench,
  'coffee': Coffee,
  'users': Users,
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
  const template = EVENT_TEMPLATES.find(t => t.id === event.templateId) || EVENT_TEMPLATES[0];
  const Icon = template.icon ? ICONS[template.icon as keyof typeof ICONS] : null;

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className={`p-1.5 cursor-move hover:shadow-md transition-shadow ${template.color} w-[calc(100%+2rem)]`}>
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
            <span className="font-medium truncate">{event.title}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-1.5 hover:bg-red-100"
              onClick={() => fetch(`/api/events/${event.id}`, { method: 'DELETE' })
                .then(() => window.location.reload())
              }
            >
              ✕
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-1.5">✎</Button>
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
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event title"
                  />
                  <Button onClick={() => onUpdate({ id: event.id, title })}>
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>
    </div>
  );
}
