import { TimeGrid } from "../components/TimeGrid";
import { HoldingArea } from "../components/HoldingArea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generatePDF } from "react-to-pdf";

export default function Schedule() {
  const handleDownload = () => {
    generatePDF({
      filename: 'event-schedule.pdf',
      element: document.querySelector('.schedule-content'),
      configuration: {
        useCORS: true,
        format: 'a4',
        margin: 20
      },
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Schedule</h1>
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 schedule-content">
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
