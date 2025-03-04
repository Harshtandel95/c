import { useState, useEffect, useMemo, useRef } from 'react';
import { Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useCompanyStore from '../TagsSettings/useCompanyStore';
import { ClassNameManager } from "../BodyGeneration/ClassNameManager";
const MarketingCardGenerator = () => {
  const [fields, setFields] = useState({
    heading: {
      enabled: true,
      value: 'Are Clear Aligners Right for You?'
    },
    description: {
      enabled: true,
      value: 'Take our free smile assessment to find out if clear aligners are right fit for you.'
    },
    button: {
      enabled: true,
      value: 'Take Free Assessment Today!'
    }
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const classNameManager = useRef(new ClassNameManager()).current;
  const { companies, activeCompanyId} = useCompanyStore();
  const activeCompany = companies.find(company => company._id === activeCompanyId);
  const [url,seturl]=useState(''); 
  useMemo(() => {
    if (activeCompany?.Generator.UIcomponents && activeCompany?.Generator.UIcomponents.length > 0) {
      activeCompany?.Generator.UIcomponents.forEach(gen => {
        if (gen.tags && gen.class) {
          classNameManager.replaceClassName(gen.tags, gen.class);
        }
      });
    }
  }, [activeCompany?.Generator.UIcomponents]);
  const mappedClasses = useMemo(() => {
    return {
      container: classNameManager.getClassName('div') || 'bg-blue-50 p-6 rounded-lg max-w-md',
      heading: classNameManager.getClassName('h3') || 'text-2xl font-bold text-gray-900 mb-2',
      description: classNameManager.getClassName('p') || 'text-gray-600 mb-4',
      button: classNameManager.getClassName('a') || 'bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors'
    };
  }, [activeCompany?.Generator.UIcomponents]);
  useEffect(() => {
    generateCode();
  }, [fields, mappedClasses,url]);
  const generateCode = () => {
    let code = `<div class="${mappedClasses.container}">\n`;
    if (fields.heading.enabled && fields.heading.value) {
      code += `  <h3 class="${mappedClasses.heading}">${fields.heading.value}</h3>\n`;
    }
    if (fields.description.enabled && fields.description.value) {
      code += `  <p class="${mappedClasses.description}">${fields.description.value}</p>\n`;
    }
    if (fields.button.enabled && fields.button.value) {
      code += `  <a href="${url}" class="${mappedClasses.button}">${fields.button.value}</a>\n`;
    }
    code += '</div>';
    setGeneratedCode(code);
  };
  const handleFieldChange = (field: keyof typeof fields, value: string) => {
    setFields(prev => ({
      ...prev,
      [field]: { ...prev[field], value }
    }));
  };
  const handleToggle = (field: keyof typeof fields) => {
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
            <div key={key} className="flex items-center gap-4">
              <Switch 
                checked={field.enabled}
                onCheckedChange={() => handleToggle(key as keyof typeof fields)}
              />
              <Input
                placeholder={`Enter ${key}`}
                value={field.value}
                onChange={(e) => handleFieldChange(key as keyof typeof fields, e.target.value)}
                disabled={!field.enabled}
                className="flex-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className={mappedClasses.container}>
            {fields.heading.enabled && fields.heading.value && (
              <h3 className={mappedClasses.heading}>{fields.heading.value}</h3>
            )}
            {fields.description.enabled && fields.description.value && (
              <p className={mappedClasses.description}>{fields.description.value}</p>
            )}
            {fields.button.enabled && fields.button.value && (
              <button className={mappedClasses.button}>
                {fields.button.value}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{generatedCode}</code>
            </pre>
            <Button 
              variant="outline" 
              size="icon"
              className="absolute top-2 right-2"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
        <Input placeholder='Write your url' onChange={(e)=>seturl(e.target.value)} />
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