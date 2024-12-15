
import { Input } from "@/components/ui/input";
import React, { useState } from 'react';
import { EVENT_TEMPLATES } from "../lib/eventTemplates";
import { BookOpen, Wrench, Coffee, Users, Calendar, Star, Video, Music, 
         Briefcase, Code, Gamepad, Heart, Image, Mail, Map, Phone,
         Rocket, ShoppingBag, Sun, Zap } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventTemplate } from "../lib/eventTemplates";
import { useSchedule } from "../hooks/useSchedule";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EventCard } from "./EventCard";

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
  'shopping': ShoppingBag,
  'sun': Sun,
  'zap': Zap
};

export function HoldingArea() {
  const { events, createEvent, updateEvent } = useSchedule();
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(EVENT_TEMPLATES[0]);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateIcon, setNewTemplateIcon] = useState('users');
  const [newTemplateColor, setNewTemplateColor] = useState('bg-purple-100');

  const handleCreateTemplate = () => {
    if (!newTemplateTitle) return;
    
    const newTemplate: EventTemplate = {
      id: newTemplateTitle.toLowerCase().replace(/\s+/g, '-'),
      title: newTemplateTitle,
      duration: 25,
      color: newTemplateColor,
      description: 'Custom event type',
      icon: newTemplateIcon
    };
    
    EVENT_TEMPLATES.push(newTemplate);
    setSelectedTemplate(newTemplate);
    setIsCreatingTemplate(false);
    setNewTemplateTitle('');
  };

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
          <Button className="w-full">Add Events or Speakers</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Event Types</h3>
              <Button variant="outline" onClick={() => setIsCreatingTemplate(!isCreatingTemplate)}>
                {isCreatingTemplate ? 'Cancel' : 'New Type'}
              </Button>
            </div>

            {isCreatingTemplate && (
              <div className="space-y-4 mb-4 p-4 border rounded-lg">
                <Input
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  placeholder="Event type name"
                />
                <Select value={newTemplateIcon} onValueChange={setNewTemplateIcon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ICONS).map(([key]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {React.createElement(ICONS[key as keyof typeof ICONS], { className: "h-4 w-4" })}
                          <span className="capitalize">{key.replace('-', ' ')}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newTemplateColor} onValueChange={setNewTemplateColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {['bg-purple-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-red-100', 'bg-orange-100'].map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className={`w-full h-6 rounded ${color}`} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateTemplate} className="w-full">
                  Create Event Type
                </Button>
              </div>
            )}

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
            <Input
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder={`Custom ${selectedTemplate.title} title`}
            />
            <Button onClick={handleCreateEvent}>Create Event</Button>
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
