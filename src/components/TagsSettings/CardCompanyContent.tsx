import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X, Plus, Trash2, Loader } from "lucide-react";
import useCompanyStore from "./useCompanyStore";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Company, GeneratorSchema } from "./types";
interface CardCompanyContentProps {
  company: Company;
}
function CardCompanyContent({ company }: CardCompanyContentProps) {
  const {
    slectedGenerator,
    updateGenerator,
    fetchcompanies,
    addGenerator,
    generator,
    deleteGenerator,
    updateCompanyCredentials
  } = useCompanyStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null| undefined>(null);
  const [editData, setEditData] = useState<{ tags: string; class: string }>({
    tags: "",
    class: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addingnewItem, setAddingnewItem] = useState(false);
  const [newItem, setNewItem] = useState<{ tags: string; class: string }>({
    tags: "",
    class: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [shopifyCredentials, setShopifyCredentials] = useState<{
    shopify_id: string;
    shopify_url: string;
  }>({
    shopify_id: company.shopify_id || "",
    shopify_url: company.shopify_url || "",
  });
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);
  const handleEdit = (item: GeneratorSchema) => {
    setEditData({
      tags: item.tags,
      class: item.class,
    });
  };
  const handleCancel = () => {
    setEditingItem(null);
    setEditData({ tags: "", class: "" });
  };
  const handleSave = async (generatorId: string | undefined) => {
    setIsSaving(true);
    try {
      await updateGenerator(company._id, generator, generatorId, editData);
      setEditingItem(null);
      setEditData({ tags: "", class: "" });
    } catch (error) {
      console.error("Error updating generator:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleAdd = async () => {
    setAddingnewItem(true);
    try {
      await addGenerator(company._id, generator, newItem);
      await fetchcompanies();
      setNewItem({ tags: "", class: "" });
    } catch (error) {
      console.error("Error adding generator:", error);
    } finally {
      setAddingnewItem(false);
      setIsAddDialogOpen(false);
    }
  };
  const handleDelete = async (generatorId: string) => {
    try {
      await deleteGenerator(company._id, generator, generatorId);
      await fetchcompanies();
      setSelectedItemId(null);
    } catch (error) {
      console.error("Error deleting generator:", error);
    }
  };
  const handleRowClick = (itemId: string) => {
    setSelectedItemId(itemId === selectedItemId ? null : itemId);
  };
  const handleEditCredentials = () => {
    setIsEditingCredentials(true);
    setShopifyCredentials({
      shopify_id: company.shopify_id || "",
      shopify_url: company.shopify_url || "",
    });
  };
  const handleCancelEditCredentials = () => {
    setIsEditingCredentials(false);
  };
  const handleSaveCredentials = async () => {
    setIsSavingCredentials(true);
    try {
      await updateCompanyCredentials(company._id, shopifyCredentials);
      setIsEditingCredentials(false);
      await fetchcompanies();
    } catch (error) {
      console.error("Error updating Shopify credentials:", error);
    } finally {
      setIsSavingCredentials(false);
    }
  };
  return (
    <Card className="mt-4 border-none shadow-none">
      <CardContent className="p-4">
        <div className="mb-6 p-4 border rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Shopify Credentials</h3>
            {!isEditingCredentials && (
              <Button onClick={handleEditCredentials}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Credentials
              </Button>
            )}
          </div>
          {isEditingCredentials ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopify-id">Shopify ID:</Label>
                <Input
                  id="shopify-id"
                  value={shopifyCredentials.shopify_id}
                  onChange={(e) =>
                    setShopifyCredentials((prev) => ({
                      ...prev,
                      shopify_id: e.target.value,
                    }))
                  }
                  placeholder="Enter Shopify ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopify-url">Shopify URL:</Label>
                <Input
                  id="shopify-url"
                  value={shopifyCredentials.shopify_url}
                  onChange={(e) =>
                    setShopifyCredentials((prev) => ({
                      ...prev,
                      shopify_url: e.target.value,
                    }))
                  }
                  placeholder="https://yourstorename.myshopify.com"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelEditCredentials}
                  disabled={isSavingCredentials}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCredentials}
                  disabled={isSavingCredentials}
                >
                  {isSavingCredentials ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Credentials
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Shopify ID:</p>
                <p className="text-sm text-muted-foreground">
                  {company.shopify_id ?  '...........': "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Shopify URL:</p>
                <p className="text-sm text-muted-foreground">
                  {company.shopify_url ?  '...........': "Not set"}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Content Items</h3>
          <Dialog 
            open={isAddDialogOpen} 
            onOpenChange={(open) => {
              if (!addingnewItem) {
                setIsAddDialogOpen(open);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Generator Item</DialogTitle>
                <DialogDescription>
                  Create a new tag and class pair for the body generator.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="new-tags"
                    value={newItem.tags}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, tags: e.target.value }))
                    }
                    className="col-span-3"
                    disabled={addingnewItem}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-class" className="text-right">
                    Class
                  </Label>
                  <Input
                    id="new-class"
                    value={newItem.class}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, class: e.target.value }))
                    }
                    className="col-span-3"
                    disabled={addingnewItem}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAdd} 
                  disabled={addingnewItem}
                >
                  {addingnewItem ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" /> 
                      Adding...
                    </>
                  ) : (
                    "Add Item"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {slectedGenerator.length === 0 ? (
          <p className="text-muted-foreground">
            No body generator content available. Add your first item!
          </p>
        ) : (
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {slectedGenerator.map((item) => (
                <Card 
                  key={item._id}
                  className={`cursor-pointer transition-colors ${
                    selectedItemId === item._id ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleRowClick(item._id as string)}
                >
                  <CardContent className="pt-6">
                    {editingItem === item._id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-tags-${item._id}`}>Tag:</Label>
                          <Input
                            id={`edit-tags-${item._id}`}
                            value={editData.tags}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                tags: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`edit-class-${item._id}`}>
                            Class:
                          </Label>
                          <Input
                            id={`edit-class-${item._id}`}
                            value={editData.class}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                class: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel();
                            }}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(item._id);
                            }}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Tag:</p>
                            <p className="text-sm text-muted-foreground">
                              {item.tags}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Class:</p>
                            <p className="text-sm text-muted-foreground">
                              {item.class}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(item._id);
                                handleEdit(item);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {selectedItemId === item._id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item._id as string);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
export default CardCompanyContent;