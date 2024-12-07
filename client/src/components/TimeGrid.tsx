import { useDrop } from 'react-dnd';
import { Card } from "@/components/ui/card";
import { EventCard } from "./EventCard";
import { useSchedule } from "../hooks/useSchedule";
import { generateTimeSlots } from "../lib/timeUtils";

export function TimeGrid() {
  const { events, updateEvent } = useSchedule();
  const timeSlots = generateTimeSlots();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'EVENT',
    drop: (item: any, monitor) => {
      const dropPos = monitor.getClientOffset();
      // Calculate time slot from position and update event
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((day) => (
        <div key={day} className="space-y-2">
          <h3 className="text-lg font-semibold text-center">Day {day}</h3>
          <div className="space-y-1">
            {timeSlots.map((slot) => (
              <Card 
                key={`${day}-${slot.time}`}
                className={`p-2 ${
                  slot.isTransition 
                    ? 'min-h-[30px] bg-gray-50 border-dashed border-gray-200' 
                    : 'min-h-[60px] bg-white'
                }`}
              >
                <div className={`flex items-center gap-2 ${
                  slot.isTransition ? 'text-[10px] text-gray-400' : 'text-xs text-gray-500'
                }`}>
                  {slot.isTransition && (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m-12 6h12m-12 6h12M4 7h0m0 6h0m0 6h0" />
                    </svg>
                  )}
                  {slot.label}
                </div>
                {!slot.isTransition && events
                  .filter(e => e.day === day && !e.inHoldingArea)
                  .map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event}
                      onUpdate={updateEvent}
                    />
                  ))}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
