import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
interface CodeDisplayProps {
  code: string;
  onCopy: () => void;
}
export const CodeDisplay = ({ code, onCopy }: CodeDisplayProps) => (
  <div className="relative">
    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
      <code>{code}</code>
    </pre>
    <Button 
      variant="outline" 
      size="icon"
      className="absolute top-2 right-2"
      onClick={onCopy}
    >
      <Copy className="h-4 w-4" />
    </Button>
  </div>
);