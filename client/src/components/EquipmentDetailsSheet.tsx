import { Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface EquipmentDetailsSheetProps {
  equipment: {
    name: string;
    type: string;
    description?: string;
    specifications?: string[];
  };
  onClose: () => void;
}

export default function EquipmentDetailsSheet({ equipment, onClose }: EquipmentDetailsSheetProps) {
  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto max-h-[70vh]">
        <SheetHeader>
          <SheetTitle className="text-lg flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            {equipment.name}
          </SheetTitle>
          <SheetDescription>
            {equipment.type}
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto py-6 space-y-4">
          {/* Equipment Icon/Image Section */}
          <div className="p-4">
            <div className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl bg-muted overflow-hidden flex items-center justify-center">
              <Dumbbell className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>

          {/* Description Section */}
          {equipment.description && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {equipment.description}
              </p>
            </Card>
          )}

          {/* Specifications Section */}
          {equipment.specifications && equipment.specifications.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Specifications</h3>
              <ul className="space-y-2">
                {equipment.specifications.map((spec, index) => (
                  <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary flex-shrink-0">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

