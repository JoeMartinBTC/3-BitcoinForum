import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EventType } from "@db/schema";

export function useEventTypes() {
  const queryClient = useQueryClient();

  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: ["event-types"],
    queryFn: async () => {
      const password = localStorage.getItem("schedule-password");
      const res = await fetch("/api/event-types", {
        headers: {
          "x-password": password || "",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch event types");
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const createEventTypeMutation = useMutation({
    mutationFn: (newEventType: EventType) => {
      const payload = {
        ...newEventType,
      };
      const password = localStorage.getItem("schedule-password");
      return fetch("/api/event-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-password": password || "",
        },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => Promise.reject(err));
        }
        return res.json();
      });
    },
    onMutate: ({ id, deleted }) => {
      if (deleted) {
        const previousEvents = queryClient.getQueryData(["event-types"]);
        queryClient.setQueryData(["event-types"], (old: Event[]) =>
          old.filter((e) => e.id !== id),
        );
        return { previousEvents };
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(["event-types"], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event-types"] });
    },
  });

  return {
    eventTypes,
    createEventType: createEventTypeMutation.mutate,
  };
}
