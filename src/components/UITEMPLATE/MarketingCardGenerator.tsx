import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarketingCardPreview } from './MarketingCardPreview';
import { CodeDisplay } from './CodeDisplay';
interface FieldConfig {
  enabled: boolean;
  value: string;
  classes: string;
}
interface Fields {
  containerClass: FieldConfig;
  heading: FieldConfig;
  description: FieldConfig;
  button: FieldConfig;
}
const MarketingCardGenerator = () => {
  const [fields, setFields] = useState<Fields>({
    containerClass: {
      enabled: true,
      value: 'Are Clear Aligners Right for You?',
      classes: 'bg-blue-50 p-6 rounded-lg max-w-md'
    },
    heading: {
      enabled: true,
      value: 'Are Clear Aligners Right for You?',
      classes: 'text-2xl font-bold text-gray-900 mb-2'
    },
    description: {
      enabled: true,
      value: 'Take our free smile assessment to find out if clear aligners are right fit for you.',
      classes: 'text-gray-600 mb-4'
    },
    button: {
      enabled: true,
      value: 'Take Free Assessment Today!',
      classes: 'bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors'
    }
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  useEffect(() => {
    generateCode();
  }, [fields]);
  const generateCode = () => {
    let code = `<div class="${fields.containerClass.classes}">\n`;
    if (fields.heading.enabled && fields.heading.value) {
      code += `  <h1 class="${fields.heading.classes}">${fields.heading.value}</h1>\n`;
    }
    if (fields.description.enabled && fields.description.value) {
      code += `  <p class="${fields.description.classes}">${fields.description.value}</p>\n`;
    }
    if (fields.button.enabled && fields.button.value) {
      code += `  <button class="${fields.button.classes}">${fields.button.value}</button>\n`;
    }
    code += '</div>';
    setGeneratedCode(code);
  };
  const handleFieldChange = (field: keyof Fields, value: string, type: 'value' | 'classes') => {
    setFields(prev => ({
      ...prev,
      [field]: { ...prev[field], [type]: value }
    }));
  };
  const handleToggle = (field: keyof Fields) => {
    setFields(prev => ({
      ...prev,
      [field]: { ...prev[field], enabled: !prev[field].enabled }
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          {Object.entries(fields).map(([key, field]) => (
            <div key={key} className="space-y-4 border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${key}-classes`} className="text-lg font-semibold capitalize">
                  {key.replace('Class', '')}
                </Label>
                {key !== 'containerClass' && (
                  <button
                    onClick={() => handleToggle(key as keyof Fields)}
                    className={`px-3 py-1 rounded ${
                      field.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {field.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${key}-classes`}>Classes</Label>
                <Input
                  id={`${key}-classes`}
                  value={field.classes}
                  onChange={(e) => handleFieldChange(key as keyof Fields, e.target.value, 'classes')}
                  placeholder={`Enter ${key} classes`}
                  className="w-full"
                />
              </div>

              {key !== 'containerClass' && (
                <div className="space-y-2">
                  <Label htmlFor={`${key}-value`}>Content</Label>
                  <Input
                    id={`${key}-value`}
                    value={field.value}
                    onChange={(e) => handleFieldChange(key as keyof Fields, e.target.value, 'value')}
                    placeholder={`Enter ${key} content`}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <MarketingCardPreview fields={fields} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <CodeDisplay code={generatedCode} onCopy={copyToClipboard} />
        </CardContent>
      </Card>

      {showCopiedAlert && (
        <Alert className="fixed bottom-4 right-4 w-auto">
          <AlertDescription>
            Code copied to clipboard!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MarketingCardGenerator;