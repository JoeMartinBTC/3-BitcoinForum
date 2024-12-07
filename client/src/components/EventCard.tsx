import { useDrag } from 'react-dnd';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { Event } from '@db/schema';

interface EventCardProps {
  event: Event;
  onUpdate: (id: number, title: string) => void;
}

export function EventCard({ event, onUpdate }: EventCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EVENT',
    item: event,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [title, setTitle] = useState(event.title);

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="p-3 cursor-move hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <span className="font-medium">{event.title}</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title"
                />
                <Button onClick={() => onUpdate(event.id, title)}>
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
}
