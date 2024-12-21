import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@db/schema';

export function useSchedule() {
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

  const saveConfigMutation = useMutation({
    mutationFn: async (config: { name: string; description?: string }) => {
      // First save locally
      const configData = {
        ...config,
        events: events,
        dayTitles: dayTitlesQuery.data,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      const existingConfigs = JSON.parse(localStorage.getItem('calendar_configs') || '[]');
      existingConfigs.push(configData);
      localStorage.setItem('calendar_configs', JSON.stringify(existingConfigs));

      // Then try to sync with server
      try {
        const response = await fetch('/api/configs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configData)
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.log('Server sync failed, using local storage only');
      }
      
      return configData;
    }
  });

  // Add this to load configs
  const loadConfigs = () => {
    return JSON.parse(localStorage.getItem('calendar_configs') || '[]');
  };

  const loadConfig = (configId: number) => {
    const configs = loadConfigs();
    return configs.find((c: any) => c.id === configId);
  };

  const { data: savedConfigs = [] } = useQuery({
    queryKey: ['configs'],
    queryFn: () => fetch('/api/configs').then(res => res.json())
  });

  const loadConfig = async (configId: number) => {
    const config = await fetch(`/api/configs/${configId}`).then(res => res.json());
    if (config.events) {
      queryClient.setQueryData(['events'], config.events);
    }
    if (config.dayTitles) {
      queryClient.setQueryData(['dayTitles'], config.dayTitles);
    }
  };

  return {
    events,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    saveConfig: saveConfigMutation.mutate,
    savedConfigs,
    loadConfig
  };
}
