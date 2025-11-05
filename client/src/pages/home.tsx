import { useLocation } from "wouter";
import { Plus, Users, List } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full px-6">
        {/* Programs Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/50"
          onClick={() => setLocation("/programs")}
          data-testid="card-programs"
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <List className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Programs</CardTitle>
            <CardDescription>
              View and manage all training programs for athletes. Filter, search, and sort programs.
            </CardDescription>
          </CardHeader>
        </Card>

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
          onClick={() => setLocation("/home")}
          data-testid="card-athlete-home"
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Athlete Home</CardTitle>
            <CardDescription>
              Mobile-first home view for athletes to execute their training programs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

