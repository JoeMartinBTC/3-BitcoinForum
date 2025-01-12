
import { ScrollArea } from "./ui/scroll-area";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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

export function HoldingArea({ level }: { level: string }) {
  const { events, createEvent, updateEvent } = useSchedule();
  const canCreateEvents = level === '2' || level === '3';
  const [newEventTitle, setNewEventTitle] = useState('');
  const defaultTemplate = {
    id: 'default',
    title: 'Default Event',
    duration: 25,
    color: 'bg-gray-100',
    description: 'Default event template',
    icon: 'calendar'
  };
  const [selectedTemplate, setSelectedTemplate] = useState(EVENT_TEMPLATES?.[0] || defaultTemplate);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateIcon, setNewTemplateIcon] = useState('users');
  const [newTemplateColor, setNewTemplateColor] = useState('bg-purple-100');

  const saveEventTemplates = () => {
    localStorage.setItem('eventTemplates', JSON.stringify(EVENT_TEMPLATES));
  };

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
    localStorage.setItem('eventTemplates', JSON.stringify(EVENT_TEMPLATES));
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
      <div>
        {canCreateEvents && (
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color</label>
                      <Select value={newTemplateColor} onValueChange={setNewTemplateColor}>
                        <SelectTrigger>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${newTemplateColor}`} />
                              <span>Select color</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'bg-rose-100',
                            'bg-pink-100',
                            'bg-fuchsia-100',
                            'bg-purple-100',
                            'bg-violet-100',
                            'bg-indigo-100',
                            'bg-blue-100',
                            'bg-sky-100',
                            'bg-cyan-100',
                            'bg-teal-100',
                            'bg-emerald-100',
                            'bg-green-100',
                            'bg-lime-100',
                            'bg-yellow-100',
                            'bg-amber-100',
                            'bg-orange-100',
                            'bg-red-100',
                            'bg-stone-100',
                            'bg-zinc-100',
                            'bg-slate-100'
                          ].map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${color}`} />
                                <span className="capitalize">{color.replace('bg-', '').replace('-100', '')}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateTemplate} className="w-full">
                      Create Event Type
                    </Button>
                  </div>
                )}

                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-2 gap-2">
                    {EVENT_TEMPLATES.map((template) => {
                      const Icon = template.icon ? ICONS[template.icon as keyof typeof ICONS] : null;
                      return (
                        <Button
                          key={template.id}
                          variant={selectedTemplate.id === template.id ? "default" : "outline"}
                          className={`p-4 h-auto flex flex-col items-center gap-2 ${template.color} relative group`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          {Icon && <Icon className="h-6 w-6" />}
                          <span>{template.title}</span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <span 
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewTemplateTitle(template.title);
                                  setNewTemplateIcon(template.icon || 'users');
                                  setNewTemplateColor(template.color);
                                }}
                              >
                                ✎
                              </span>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Event Type</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
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
                                    <SelectValue>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded ${newTemplateColor}`} />
                                        <span>Select color</span>
                                      </div>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[
                                      'bg-rose-100', 'bg-pink-100', 'bg-fuchsia-100',
                                      'bg-purple-100', 'bg-violet-100', 'bg-indigo-100',
                                      'bg-blue-100', 'bg-sky-100', 'bg-cyan-100',
                                      'bg-teal-100', 'bg-emerald-100', 'bg-green-100',
                                      'bg-lime-100', 'bg-yellow-100', 'bg-amber-100',
                                      'bg-orange-100', 'bg-red-100', 'bg-stone-100',
                                      'bg-zinc-100', 'bg-slate-100'
                                    ].map((color) => (
                                      <SelectItem key={color} value={color}>
                                        <div className="flex items-center gap-2">
                                          <div className={`w-4 h-4 rounded ${color}`} />
                                          <span className="capitalize">{color.replace('bg-', '').replace('-100', '')}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex gap-2">
                                  <DialogPrimitive.Close asChild>
                                    <Button onClick={() => {
                                      const updatedTemplate = {
                                        ...template,
                                        title: newTemplateTitle,
                                        icon: newTemplateIcon,
                                        color: newTemplateColor
                                      };
                                      const index = EVENT_TEMPLATES.findIndex(t => t.id === template.id);
                                      EVENT_TEMPLATES[index] = updatedTemplate;
                                      saveEventTemplates();
                                      setSelectedTemplate(updatedTemplate);
                                    }} className="flex-1">
                                      Save Changes
                                    </Button>
                                  </DialogPrimitive.Close>
                                  <DialogPrimitive.Close asChild>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => {
                                        fetch(`/api/events/${template.id}`, { method: 'DELETE' })
                                          .then(() => {
                                            const index = EVENT_TEMPLATES.findIndex(t => t.id === template.id);
                                            EVENT_TEMPLATES.splice(index, 1);
                                            saveEventTemplates();
                                            setSelectedTemplate(EVENT_TEMPLATES[0]);
                                          });
                                      }}
                                      className="flex-1"
                                    >
                                      Delete
                                    </Button>
                                  </DialogPrimitive.Close>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
                <Input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder={`Custom ${selectedTemplate.title} title`}
                />
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <div className="grid grid-cols-6 gap-2">
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
    </div>
  );
}
