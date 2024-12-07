import moment from 'moment';

export function generateTimeSlots() {
  const slots = [];
  const startTime = moment().set({ hour: 10, minute: 0 });
  const endTime = moment().set({ hour: 22, minute: 0 });

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
