import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function RefreshNotice() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Show notice after 5 minutes
    const timer = setTimeout(() => {
      setShowNotice(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timer);
  }, []);

  if (!showNotice) return null;

  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Data Refresh Recommended</AlertTitle>
      <AlertDescription>
        You've been viewing this page for a while. Consider refreshing to get the latest data.
        <button
          onClick={() => window.location.reload()}
          className="ml-2 text-sm font-medium underline hover:text-blue-600"
        >
          Refresh Now
        </button>
      </AlertDescription>
    </Alert>
  );
} 