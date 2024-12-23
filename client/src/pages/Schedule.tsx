import { TimeGrid } from "../components/TimeGrid";
import { HoldingArea } from "../components/HoldingArea";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { useCallback } from 'react';
import { usePDF } from 'react-to-pdf';
import { useSchedule } from '../hooks/useSchedule';

export default function Schedule() {
  const { toPDF, targetRef } = usePDF({
    filename: 'event-schedule.pdf',
    page: {
      format: 'A4',
      orientation: 'landscape',
      margin: 5
    }
  });

  React.useEffect(() => {
    const element = targetRef.current;
    if (element) {
      element.classList.add('pdf-export');
    }
    return () => {
      if (element) {
        element.classList.remove('pdf-export');
      }
    };
  }, [targetRef]);

  const handlePDFExport = useCallback(() => {
    const element = targetRef.current;
    if (element) {
      element.classList.add('pdf-export');
      toPDF();
      setTimeout(() => {
        element.classList.remove('pdf-export');
      }, 100);
    }
  }, [targetRef, toPDF]);

  const { events } = useSchedule();
  
  const handleExcelExport = useCallback(() => {
    import('xlsx').then(XLSX => {
      const data = events.map(event => ({
        Title: event.title,
        Status: event.inHoldingArea ? 'Unscheduled' : 'Scheduled',
        Day: event.inHoldingArea ? 'N/A' : event.day,
        StartTime: event.inHoldingArea ? 'N/A' : new Date(event.startTime).toLocaleTimeString(),
        EndTime: event.inHoldingArea ? 'N/A' : new Date(event.endTime).toLocaleTimeString(),
        Type: event.templateId,
        Color: event.color
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Schedule");
      XLSX.writeFile(wb, "schedule.xlsx");
    });
  }, [events]);

  return (
    <div className="container mx-auto p-4" ref={targetRef}>
      <h1 className="text-xl font-bold mb-6">Event Schedule <span className="text-sm ml-2 text-gray-600">v0.5.0</span></h1>
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <TimeGrid />
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Events and Speakers</h2>
          <HoldingArea />
          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePDFExport}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Export Excel
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                  Clear All Events
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Events</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all events from the schedule. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => fetch('/api/events', { method: 'DELETE' }).then(() => window.location.reload())}>
                    Clear Events
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </div>
  );
}