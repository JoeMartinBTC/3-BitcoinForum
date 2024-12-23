
import moment from 'moment';

export function generateTimeSlots() {
  interface TimeSlot {
    time: string;
    isTransition: boolean;
    showTime?: boolean;
    isBreak?: boolean;
    duration?: number;
    label?: string;
  }
  const slots: TimeSlot[] = [];
  
  // Morning slots
  slots.push({ time: '08:30', isTransition: false, showTime: true });
  slots.push({ time: '08:55', isTransition: true, showTime: false });
  slots.push({ time: '09:00', isTransition: false, showTime: true });
  slots.push({ time: '09:25', isTransition: true, showTime: false });
  slots.push({ time: '09:30', isTransition: false, showTime: true });
  slots.push({ time: '09:55', isTransition: true, showTime: false });
  
  const startTime = moment().set({ hour: 10, minute: 0 });
  const endTime = moment().set({ hour: 19, minute: 30 });

  while (startTime.isSameOrBefore(endTime)) {
    const timeString = startTime.format('HH:mm');
    const minutes = startTime.minutes();
    const isTransitionTime = minutes === 25 || minutes === 55;
    
    slots.push({
      time: timeString,
      isTransition: isTransitionTime,
      showTime: !isTransitionTime
    });

    startTime.add(isTransitionTime ? 5 : 25, 'minutes');
  }

  // Add final slots
  slots.push({ time: '19:55', isTransition: true, showTime: false });
  slots.push({ time: '20:00', isTransition: false, showTime: true });

  return slots;
}

export function calculateTimeSlot(clientY: number, gridTop: number, slotHeight: number) {
  const relativeY = clientY - gridTop;
  const slotIndex = Math.floor(relativeY / slotHeight);
  return slotIndex;
}
