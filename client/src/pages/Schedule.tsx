import { TimeGrid } from "../components/TimeGrid";
import { HoldingArea } from "../components/HoldingArea";
import { Card } from "@/components/ui/card";
import React, { useCallback } from 'react';
import { usePDF } from 'react-to-pdf';
import { useSchedule } from '../hooks/useSchedule'; // Assuming this hook exists and provides events data


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

  const handleHTMLExport = useCallback(() => {
    const element = targetRef.current;
    if (element) {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Schedule Export</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .schedule-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .day { padding: 1rem; }
    .time-slot { margin: 0.5rem 0; padding: 0.5rem; background: #f0f0f0; }
    .event { padding: 0.5rem; margin: 0.25rem 0; background: #e0e0e0; }
  </style>
</head>
<body>
  ${element.outerHTML}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schedule.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [targetRef]);

  const { events } = useSchedule();
  
  const handleExcelExport = useCallback(() => {
    import('xlsx').then(XLSX => {
      const data = events.map(event => ({
        Title: event.title,
        Day: event.day,
        StartTime: new Date(event.startTime).toLocaleTimeString(),
        EndTime: new Date(event.endTime).toLocaleTimeString(),
        Type: event.templateId
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Schedule");
      XLSX.writeFile(wb, "schedule.xlsx");
    });
  }, [events]);

  return (
    <div className="container mx-auto p-4" ref={targetRef}>
      <h1 className="text-3xl font-bold mb-6">Event Schedule</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="p-4">
            <TimeGrid />
          </Card>
        </div>
        <div>
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
              <button
                onClick={handleHTMLExport}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                Export HTML
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}