import { Card, CardContent } from "@/components/ui/card";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { ChevronDown, Edit, Trash, Loader } from "lucide-react";
import useCompanyStore from "./useCompanyStore";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import CardCompanyContent from "./CardCompanyContent";
import { Company } from "./types";
function CardCompany() {
  const {
    companies,
    deleteCompany,
    updateCompany,
    selectGenerator,
    generator,
    setActiveCompany,
    activeCompanyId,
    fetchcompanies
  } = useCompanyStore();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [editingName, setEditingName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchcompanies();
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchcompanies]);
  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const handleUpdate = async (companyId: string) => {
    if (!editingName.trim()) return;
    try {
      await updateCompany(companyId, {
        company: editingName,
        Generator: companies.find(c => c._id === companyId)?.Generator || {
          BodyGenerator: [],
          TOCgenerator: [],
          UIcomponents: [],
          FAQgenerator: [],
        }
      });
      setIsEditing(null);
      setEditingName("");
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };
  const handleTrash = (id: string) => {
    deleteCompany(id);
  };
  const startEditing = (company: Company) => {
    setIsEditing(company._id);
    setEditingName(company.company);
  };
  const handleActiveChange = (id: string, checked: boolean) => {
    if (checked) {
      setActiveCompany(id);
    } else if (activeCompanyId === id) {
      setActiveCompany('');
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm text-gray-500">Loading companies...</p>
        </div>
      </div>
    );
  }
  return (
    <ScrollArea className="h-full">
      {companies?.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No companies found. Add a company to get started.
        </div>
      ) : (
        companies?.map((company) => (
          <div key={company._id} className="p-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Input
                    type="text"
                    value={isEditing === company._id ? editingName : company.company}
                    onChange={(e) => isEditing === company._id && setEditingName(e.target.value)}
                    className="w-40 bg-transparent border-none p-0 focus-visible:ring-0"
                    readOnly={isEditing !== company._id}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && isEditing === company._id) {
                        handleUpdate(company._id);
                      }
                    }}
                  />
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={activeCompanyId === company._id}
                      onCheckedChange={(checked) => handleActiveChange(company._id, checked)}
                    />
                    <span className="text-sm text-gray-500">
                      {activeCompanyId === company._id ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Delete"
                        onClick={() => handleTrash(company._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          selectGenerator(company.Generator, generator);
                          toggleCard(company._id);
                        }}
                        title="Expand"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedCards[company._id] ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (isEditing === company._id) {
                            handleUpdate(company._id);
                          } else {
                            startEditing(company);
                          }
                        }}
                        title={isEditing === company._id ? "Save" : "Edit"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {expandedCards[company._id] && (
                  <CardCompanyContent company={company} />
                )}
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </ScrollArea>
  );
}
export default CardCompany;