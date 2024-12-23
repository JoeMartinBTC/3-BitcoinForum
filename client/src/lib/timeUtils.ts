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
  
  // Add morning slots with specific labels
  slots.push({ time: '08:30', isTransition: false, showTime: false });
  slots.push({ time: '08:55', isTransition: true, showTime: false });
  slots.push({ time: '09:00', isTransition: false, showTime: true });
  slots.push({ time: '09:25', isTransition: true, showTime: false });
  slots.push({ time: '09:30', isTransition: false, showTime: true });
  slots.push({ time: '09:55', isTransition: true, showTime: false });
  
  const startTime = moment().set({ hour: 10, minute: 0 });
  const endTime = moment().set({ hour: 20, minute: 25 });  // Include the break after 20:00

  while (startTime.isBefore(endTime)) {
    const timeString = startTime.format('HH:mm');
    const minutes = startTime.minutes();
    
    // Mark transition periods at :25 and :55
    const isTransition = minutes === 25 || minutes === 55;
    
    slots.push({
      time: timeString,
      isBreak: isTransition,
      isTransition,
      duration: isTransition ? 5 : 25,
      label: isTransition ? 'Transition Period' : timeString
    });

    startTime.add(isTransition ? 5 : 25, 'minutes');
  }

  return slots;
}

export function calculateTimeSlot(clientY: number, gridTop: number, slotHeight: number) {
  const relativeY = clientY - gridTop;
  const slotIndex = Math.floor(relativeY / slotHeight);
  return slotIndex;
}