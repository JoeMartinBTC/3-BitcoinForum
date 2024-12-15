
import { useDrop } from 'react-dnd';
import { useRef, useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { EventCard } from "./EventCard";
import { useSchedule } from "../hooks/useSchedule";
import { generateTimeSlots } from "../lib/timeUtils";
import type { Event } from '@db/schema';

function TimeSlot({ 
  day, 
  slot, 
  events, 
  updateEvent 
}: { 
  day: number;
  slot: ReturnType<typeof generateTimeSlots>[number] & { backgroundColor?: string };
  events: Event[];
  updateEvent: (updates: Partial<Event> & { id: number }) => void;
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'EVENT',
    canDrop: () => !slot.isTransition,
    drop: (item: Event) => {
      const today = new Date();
      const [hours, minutes] = slot.time.split(':').map(Number);
      const startTime = new Date(today);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 25);

      updateEvent({
        id: item.id,
        day,
        startTime,
        endTime,
        inHoldingArea: false
      });
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    })
  });

  const [showColorMenu, setShowColorMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [bgColor, setBgColor] = useState(slot.backgroundColor || 'bg-white');

  const colors = [
    { name: 'White', class: 'bg-white' },
    { name: 'Blue', class: 'bg-blue-50' },
    { name: 'Green', class: 'bg-green-50' },
    { name: 'Yellow', class: 'bg-yellow-50' },
    { name: 'Red', class: 'bg-red-50' },
    { name: 'Purple', class: 'bg-purple-50' },
    { name: 'Orange', class: 'bg-orange-50' },
    { name: 'Pink', class: 'bg-pink-50' },
    { name: 'Gray', class: 'bg-gray-50' }
  ];

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowColorMenu(true);
  };

  const handleColorSelect = async (colorClass: string) => {
    setBgColor(colorClass);
    slot.backgroundColor = colorClass;
    setShowColorMenu(false);
    // Here you would update the database
    try {
      const response = await fetch(`/api/slots/${day}/${slot.time}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backgroundColor: colorClass })
      });
      if (!response.ok) throw new Error('Failed to update slot color');
    } catch (error) {
      console.error('Failed to update slot color:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setShowColorMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const slotEvents = (events || []).filter(event => {
    if (!event || event.inHoldingArea || event.day !== day) return false;
    const eventTime = new Date(event.startTime);
    const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
    return (
      eventTime.getHours() === slotHours && 
      eventTime.getMinutes() === slotMinutes
    );
  });

  return (
    <Card 
      ref={drop}
      onContextMenu={handleRightClick}
      className={`p-1 transition-all relative ${
        slot.isTransition 
          ? 'h-[21px] bg-gray-50 border-dashed border-gray-200 cursor-not-allowed' 
          : `h-[60px] ${bgColor} hover:brightness-95 cursor-pointer`
      } ${
        isOver && canDrop
          ? 'border-2 border-primary bg-primary/10 ring-2 ring-primary/20'
          : canDrop
          ? 'border border-primary/50 hover:border-primary'
          : ''
      } ${
        !canDrop && isOver
          ? 'border-2 border-destructive/50 bg-destructive/10'
          : ''
      }`}
    >
      {showColorMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                className={`w-8 h-8 rounded ${color.class} hover:ring-2 ring-black/5 transition-all`}
                onClick={() => handleColorSelect(color.class)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}
      <div className="flex h-full">
        <div className={`w-16 shrink-0 flex items-center px-2 ${
          slot.isTransition ? 'text-[6px] text-gray-400' : 'text-[8px] text-gray-500'
        }`}>
          <div className="flex items-center gap-1 whitespace-nowrap">
            {slot.isTransition ? (
              <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m-12 6h12m-12 6h12M4 7h0m0 6h0m0 6h0" />
              </svg>
            ) : null}
            {slot.label}
          </div>
        </div>
        <div className="flex-1 relative">
          {!slot.isTransition && slotEvents.map(event => (
            <div key={event.id} className="-ml-[20%] w-[120%]">
              <EventCard 
                event={event}
                onUpdate={updateEvent}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function TimeGrid() {
  const { events, updateEvent } = useSchedule();
  const timeSlots = generateTimeSlots();

  return (
    <div className="w-full min-h-[600px]">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((day) => (
          <div key={day} className="space-y-2">
            <h3 className="text-lg font-semibold text-center">Day {day}</h3>
            <div className="space-y-1">
              {timeSlots.map((slot) => (
                <TimeSlot
                  key={`${day}-${slot.time}`}
                  day={day}
                  slot={slot}
                  events={events}
                  updateEvent={updateEvent}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
