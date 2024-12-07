import { useDrop } from 'react-dnd';
import { EventCard } from "./EventCard";
import { useSchedule } from "../hooks/useSchedule";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

export function HoldingArea() {
  const { events, createEvent, updateEvent } = useSchedule();
  const [newEventTitle, setNewEventTitle] = useState('');

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'EVENT',
    drop: (item: any) => {
      updateEvent(item.id, { ...item, inHoldingArea: true });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleCreateEvent = () => {
    createEvent({
      title: newEventTitle,
      inHoldingArea: true,
      day: 1,
      startTime: new Date(),
      endTime: new Date(),
    });
    setNewEventTitle('');
  };

  return (
    <div 
      ref={drop}
      className={`min-h-[200px] space-y-2 p-4 rounded-lg ${
        isOver ? 'bg-gray-100' : 'bg-white'
      }`}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Add New Event</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Event title"
            />
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </div>
        </DialogContent>
      </Dialog>

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
  );
}
