interface EventType {
  id: number;
  name: string;
  icon?: string; 
}

// Example usage (add more as needed)
const eventTypes: EventType[] = [
  { id: 1, name: 'Event 1', icon: 'icon1' },
  { id: 2, name: 'Event 2', icon: 'icon2' },
];


//Example function using EventType
function logEventTypes(types:EventType[]){
    types.forEach(type => console.log(type.name))
}

logEventTypes(eventTypes);