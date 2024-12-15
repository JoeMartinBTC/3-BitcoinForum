import { TimeGrid } from "../components/TimeGrid";
import { HoldingArea } from "../components/HoldingArea";
import { Card } from "@/components/ui/card";
import React, { useCallback } from 'react';
import { usePDF } from 'react-to-pdf';


export default function Schedule() {
  const { toPDF, targetRef } = usePDF({
    filename: 'event-schedule.pdf',
    page: {
      format: 'A4',
      orientation: 'landscape',
      margin: 10
    }
  });

  const handleExport = useCallback(() => {
    const element = targetRef.current;
    if (element) {
      element.classList.add('pdf-export');
      toPDF();
      setTimeout(() => {
        element.classList.remove('pdf-export');
      }, 100);
    }
  }, [targetRef, toPDF]);

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

  return (
    <div className="container mx-auto p-4" ref={targetRef}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Schedule</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Export PDF
        </button>
      </div>
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
          </Card>
        </div>
      </div>
    </div>
  );
}