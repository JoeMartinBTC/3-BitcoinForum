
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "@/components/ui/input";
import React, { useState } from 'react';
import { EVENT_TEMPLATES, ICONS, EventTemplate, saveEventTemplates, deleteEventTemplate, editEventTemplate } from "../lib/eventTemplates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchedule } from "../hooks/useSchedule";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EventCard } from "./EventCard";

export function HoldingArea() {
  const { events, createEvent, updateEvent } = useSchedule();
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(EVENT_TEMPLATES[0]);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateIcon, setNewTemplateIcon] = useState('users');
  const [newTemplateColor, setNewTemplateColor] = useState('bg-purple-100');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const handleCreateOrUpdateTemplate = () => {
    if (!newTemplateTitle) return;
    
    if (editingTemplateId) {
      editEventTemplate(editingTemplateId, {
        title: newTemplateTitle,
        color: newTemplateColor,
        icon: newTemplateIcon
      });
      setEditingTemplateId(null);
    } else {
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
    }
    
    saveEventTemplates();
    setIsCreatingTemplate(false);
    setNewTemplateTitle('');
    setNewTemplateIcon('users');
    setNewTemplateColor('bg-purple-100');
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

              {EVENT_TEMPLATES.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-2 border rounded mb-2">
                  <div className="flex items-center gap-2">
                    {template.icon && React.createElement(ICONS[template.icon as keyof typeof ICONS], { className: "h-4 w-4" })}
                    <span>{template.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setNewTemplateTitle(template.title);
                        setNewTemplateIcon(template.icon || 'users');
                        setNewTemplateColor(template.color);
                        setEditingTemplateId(template.id);
                        setIsCreatingTemplate(true);
                      }}
                    >
                      ✎
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          deleteEventTemplate(template.id);
                        }
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}

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
                              <span className="capitalize">{color.replace('bg-', '').replace('-100', '')} (Light)</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateOrUpdateTemplate} className="w-full">
                    {editingTemplateId ? 'Update Event Type' : 'Create Event Type'}
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
                        className={`p-4 h-auto flex flex-col items-center gap-2 ${template.color}`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        {Icon && <Icon className="h-6 w-6" />}
                        <span>{template.title}</span>
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
      </div>
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-2 gap-2 pr-4">
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
      </ScrollArea>
    </div>
  );
}
