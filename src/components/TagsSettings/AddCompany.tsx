import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useCompanyStore from "./useCompanyStore";
function AddCompany() {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { createCompany, fetchcompanies } = useCompanyStore();
  const [loading, setLoading] = useState(false);
  const handleAddCompany = async () => {
    if (!companyName.trim()) {
      return;
    }
    setLoading(true);
    const companyData = {
      company: companyName,
      Generator: {
        BodyGenerator: [],
        TOCgenerator: [],
        UIcomponents: [],
        FAQgenerator: [],
      },
    };
    try {
      await createCompany(companyData);
      await fetchcompanies();
      setCompanyName("");
      setOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search tags or properties..."
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
            >
              <span className="mr-2">+</span> Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setCompanyName("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCompany}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Company"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
export default AddCompany;