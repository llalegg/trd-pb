import { useLocation } from "wouter";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import type { Program } from "@shared/schema";

export default function Programs() {
  const [, setLocation] = useLocation();
  
  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Program Builder
            </h1>
            <Button
              onClick={() => setLocation("/add-program")}
              className="gap-2"
              data-testid="button-add-program"
            >
              <Plus className="h-4 w-4" />
              Add Program
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-12">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[15%]">Program ID</TableHead>
                <TableHead className="w-[30%]">Athlete Name</TableHead>
                <TableHead className="w-[20%]">Start Date</TableHead>
                <TableHead className="w-[20%]">End Date</TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Loading programs...
                  </TableCell>
                </TableRow>
              ) : programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No programs found. Create your first program to get started.
                  </TableCell>
                </TableRow>
              ) : (
                programs.map((program, index) => (
                  <TableRow
                    key={program.id}
                    className={cn(
                      "group hover-elevate",
                      index % 2 === 1 && "bg-muted/30"
                    )}
                    data-testid={`row-program-${program.id}`}
                  >
                    <TableCell className="font-mono text-sm" data-testid={`text-program-id-${program.id}`}>
                      {program.programId}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-athlete-${program.id}`}>
                      {program.athleteName}
                    </TableCell>
                    <TableCell data-testid={`text-start-date-${program.id}`}>
                      {format(new Date(program.startDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell data-testid={`text-end-date-${program.id}`}>
                      {format(new Date(program.endDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit program"
                          data-testid={`button-edit-${program.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                          aria-label="Delete program"
                          data-testid={`button-delete-${program.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
