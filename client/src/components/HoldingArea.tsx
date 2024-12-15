
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { EVENT_TEMPLATES } from "../lib/eventTemplates";
import { BookOpen, Wrench, Coffee, Users, LucideIcon, Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSchedule } from "../hooks/useSchedule";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EventCard } from "./EventCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ICONS = {
  'book-open': BookOpen,
  'wrench': Wrench,
  'coffee': Coffee,
  'users': Users,
};

export function HoldingArea() {
  const { events, createEvent, updateEvent } = useSchedule();
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(EVENT_TEMPLATES[0]);
  const [selectedIcon, setSelectedIcon] = useState('users');

  const handleCreateEvent = () => {
    const now = new Date();
    createEvent({
      title: newEventTitle || selectedTemplate.title,
      inHoldingArea: true,
      day: 1,
      startTime: now,
      endTime: new Date(now.getTime() + selectedTemplate.duration * 60000),
      templateId: selectedTemplate.id,
      color: selectedTemplate.color,
    });
    setNewEventTitle('');
  };

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Add Events</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TEMPLATES.map((template) => {
                const Icon = template.icon ? ICONS[template.icon as keyof typeof ICONS] : null;
                return (
                  <Button
                    key={template.id}
                    variant={selectedTemplate.id === template.id ? "default" : "outline"}
                    className={`p-4 h-auto flex flex-col items-center gap-2 ${template.color}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {Icon && <Icon className="h-6 w-6" />}
                    <span>{template.title}</span>
                  </Button>
                );
              })}
            </div>
            <div className="space-y-2">
              <Input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder={`Custom ${selectedTemplate.title} title`}
              />
              <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ICONS).map(([key, Icon]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{key.replace('-', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreateEvent} className="w-full">Create Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {events
          .filter(e => e.inHoldingArea)
          .map(event => (
            <EventCard 
              key={event.id} 
              event={event}
              onUpdate={updateEvent}
            />
          ))}
      </div>
    </div>
  );
}
