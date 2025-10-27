import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 p-4">
      <Card className="w-full max-w-md bg-neutral-900 border-neutral-700">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center">
            {/* 404 Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>

            {/* 404 Text */}
            <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
            <h2 className="text-xl font-semibold text-foreground mb-4">Page Not Found</h2>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setLocation("/")}
                className="bg-primary text-primary-foreground h-12 rounded-full w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
                className="border-border bg-background text-foreground hover:bg-accent h-10 rounded-full w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
