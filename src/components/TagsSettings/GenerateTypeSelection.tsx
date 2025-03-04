import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cog, FileText, HelpCircle, List } from 'lucide-react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import useCompanyStore from './useCompanyStore';
function GenerateTypeSelection() {
  const { setGenerator, generator } = useCompanyStore();
  const handleGeneratorChange = (value: string) => {
    setGenerator(value);
  }
  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-purple-600 flex items-center gap-2">
            Generator Type
            <Cog className="h-5 w-5 text-purple-600/60" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={generator} onValueChange={handleGeneratorChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
              <SelectItem value="TOCgenerator">
                  <span className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Table of Contents Generator
                  </span>
                </SelectItem>
                <SelectItem value="BodyGenerator">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Body Generator
                  </span>
                </SelectItem>
                <SelectItem value="UIcomponents">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    UI Template Generator
                  </span>
                </SelectItem>
                <SelectItem value="FAQgenerator">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQ Generator
                  </span>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
export default GenerateTypeSelection;