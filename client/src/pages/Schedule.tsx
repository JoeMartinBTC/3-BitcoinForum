import { TimeGrid } from "../components/TimeGrid";
import { HoldingArea } from "../components/HoldingArea";
import { Card } from "@/components/ui/card";
import React from 'react';
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
          </Card>
        </div>
      </div>
    </div>
  );
}