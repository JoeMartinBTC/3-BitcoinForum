import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@db/schema';

interface User {
  id: number;
  role: string;
  replitUsername: string;
}

export function useSchedule() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(setUser)
      .catch(console.error);
  }, []);

  const canEdit = user?.role === 'editor' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';
  const dayTitlesQuery = useQuery({
    queryKey: ['dayTitles'],
    queryFn: () => fetch('/api/day-titles').then(res => res.json()),
  });
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events');
      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const createEventMutation = useMutation({
    mutationFn: (newEvent: Partial<Event>) => {
      const payload = {
        ...newEvent,
        startTime: newEvent.startTime?.toISOString(),
        endTime: newEvent.endTime?.toISOString(),
      };
      return fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(res => {
        if (!res.ok) {
          return res.json().then(err => Promise.reject(err));
        }
        return res.json();
      });
    },
    onMutate: ({ id, deleted }) => {
      if (deleted) {
        const previousEvents = queryClient.getQueryData(['events']);
        queryClient.setQueryData(['events'], (old: Event[]) => 
          old.filter(e => e.id !== id)
        );
        return { previousEvents };
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Event> & { id: number }) =>
      fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then(res => res.json()),
    onMutate: ({ id, deleted }) => {
      if (deleted) {
        const previousEvents = queryClient.getQueryData(['events']);
        queryClient.setQueryData(['events'], (old: Event[]) => 
          old.filter(e => e.id !== id)
        );
        return { previousEvents };
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    events,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
  };
}
