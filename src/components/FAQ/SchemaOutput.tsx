import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
interface SchemaOutputProps {
  markup: string;
  showCopySuccess: boolean;
  onCopy: () => void;
}
export const SchemaOutput = ({ markup, showCopySuccess, onCopy }: SchemaOutputProps) => (
  <div className="mt-6 space-y-2">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-lg">Generated Schema Markup</h3>
      <Button 
        variant="outline" 
        onClick={onCopy}
        className="flex items-center gap-2"
      >
        <Copy size={16} />
        {showCopySuccess ? 'Copied!' : 'Copy HTML'}
      </Button>
    </div>
    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap border border-gray-200 text-sm">
      {markup}
    </pre>
  </div>
);