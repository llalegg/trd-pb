import { useLocation } from "wouter";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Programs() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full px-6">
        {/* Add Program Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/50"
          onClick={() => setLocation("/add-program")}
          data-testid="card-add-program"
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Add Program</CardTitle>
            <CardDescription>
              Create a new training program for an athlete with custom blocks, phases, and routines.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Program Athlete View Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/50"
          onClick={() => setLocation("/athlete-view")}
          data-testid="card-athlete-view"
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Program Athlete View</CardTitle>
            <CardDescription>
              Mobile-first view for athletes to execute their training programs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
