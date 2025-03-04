import { Copy } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
interface HTMLPreviewProps {
  processedText: string;
  onCopy: () => void;
  showCopiedAlert: boolean;
}
export const HTMLPreview: React.FC<HTMLPreviewProps> = ({ 
  processedText, 
  onCopy, 
  showCopiedAlert 
}) => {
  return (
    <>
      <pre className="html-output">
        <div className="flex cursor-pointer flex-row-reverse justify-between">
          <Copy onClick={onCopy} />
        </div>
        <code>{processedText}</code>
      </pre>
      {showCopiedAlert && (
        <Alert className="fixed bottom-4 right-4 w-auto">
          <AlertDescription>Code copied to clipboard!</AlertDescription>
        </Alert>
      )}
    </>
  );
};