import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useCalendar() {
  const queryClient = useQueryClient();

  const { data: calendarBgColors } = useQuery({
    queryKey: ["calendar-bg-colors"],
    queryFn: async () => {
      const password = localStorage.getItem("schedule-password");
      const res = await fetch("/api/calendar/bg-colors", {
        headers: {
          "x-password": password || "",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch event types");
      }
      const data = await res.json();
      return data ?? {};
    },
    refetchOnMount: true,
    refetchInterval: 5000, // Refetch data every 5 seconds
  });

  const updateCalendarBgColorsMutation = useMutation({
    mutationFn: (colors) => {
      const password = localStorage.getItem("schedule-password");
      return fetch(`/api/calendar/bg-colors`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-password": password || "",
        },
        body: JSON.stringify(colors),
      }).then((res) => res.json());
    },
    onMutate: ({ id, deleted }) => {
      if (deleted) {
        const previousEvents = queryClient.getQueryData(["calendar-bg-colors"]);
        queryClient.setQueryData(["calendar-bg-colors"], (old: Event[]) =>
          old.filter((e) => e.id !== id),
        );
        return { previousEvents };
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(
          ["calendar-bg-colors"],
          context.previousEvents,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-bg-colors"] });
    },
  });

  return {
    calendarBgColors,
    updateCalendarBgColors: updateCalendarBgColorsMutation.mutate,
  };
}
