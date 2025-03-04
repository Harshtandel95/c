import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import TagSettingsContent from "./TagSettingsContent";
import useCompanyStore from "./useCompanyStore";
const TagSettingsButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { fetchcompanies, sameTagAlert } = useCompanyStore();
  useEffect(() => {
    if (sameTagAlert) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sameTagAlert]);
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      fetchcompanies();
    }
  };
  return (
    <TooltipProvider>
      <div className="relative">
        {showAlert && (
          <div className="fixed top-4 right-4 z-[60] animate-in fade-in slide-in-from-top-5 duration-300">
            <Alert variant="destructive" className="bg-red-500 text-white border-red-600">
              <AlertDescription>
                This tag already exists! Please use a different tag.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed right-4 top-4 z-50 rounded-full hover:text-white bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg backdrop-blur-sm transition-all hover:from-violet-600 hover:to-purple-700 hover:shadow-xl"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="h-full w-full overflow-y-auto p-6 sm:max-w-[1200px]">
            <div className="min-h-[600px]">
              <TagSettingsContent />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
export { TagSettingsButton };