
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { EVENT_TEMPLATES } from "../lib/eventTemplates";
import { BookOpen, Wrench, Coffee, Users } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ICONS = {
  'book-open': BookOpen,
  'wrench': Wrench,
  'coffee': Coffee,
  'users': Users,
};

export function HoldingArea() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = EVENT_TEMPLATES.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search templates..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <div className="grid gap-2">
        {filteredTemplates.map((template) => {
          const Icon = template.icon ? ICONS[template.icon as keyof typeof ICONS] : null;
          return (
            <Card key={template.id} className={`p-3 ${template.color} hover:shadow-md transition-all`}>
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                <span className="font-medium">{template.title}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
