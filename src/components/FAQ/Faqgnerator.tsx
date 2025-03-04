import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Plus, Trash2, MoveUp, MoveDown, AlertCircle } from 'lucide-react';
interface FAQ {
  question: string;
  answer: string;
  id: string;
}
const CustomFAQGenerator = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [numberingStyle, setNumberingStyle] = useState<string>('numeric');
  const [customPrefix, setCustomPrefix] = useState<string>('Q');
  const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };
  const getQuestionNumber = (index: number): string => {
    switch (numberingStyle) {
      case 'alphabetic':
        return String.fromCharCode(65 + index) + '.';
      case 'roman':
        return toRoman(index + 1) + '.';
      case 'custom':
        return `${customPrefix}${index + 1}.`;
      default:
        return `${index + 1}.`;
    }
  };
  const toRoman = (num: number): string => {
    const romanNumerals = [
      { value: 10, symbol: 'X' },
      { value: 9, symbol: 'IX' },
      { value: 5, symbol: 'V' },
      { value: 4, symbol: 'IV' },
      { value: 1, symbol: 'I' }
    ];
    let result = '';
    for (let i = 0; i < romanNumerals.length; i++) {
      while (num >= romanNumerals[i].value) {
        result += romanNumerals[i].symbol;
        num -= romanNumerals[i].value;
      }
    }
    return result;
  };
  const addFAQ = (): void => {
    if (newQuestion.trim() && newAnswer.trim()) {
      setFaqs([...faqs, {
        question: newQuestion,
        answer: newAnswer,
        id: generateId()
      }]);
      setNewQuestion('');
      setNewAnswer('');
    }
  };
  const removeFAQ = (id: string): void => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };
  const moveFAQ = (currentIndex: number, direction: 'up' | 'down'): void => {
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < faqs.length) {
      const updatedFaqs = [...faqs];
      [updatedFaqs[currentIndex], updatedFaqs[newIndex]] = 
      [updatedFaqs[newIndex], updatedFaqs[currentIndex]];
      setFaqs(updatedFaqs);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && e.ctrlKey) {
      addFAQ();
    }
  };
  useEffect(() => {
    generateSchemaCode();
  }, [faqs, numberingStyle, customPrefix]);
  const generateSchemaCode = () => {
    let code = '<div itemscope="" itemtype="https://schema.org/FAQPage">\n';
    code += '  <h2 id="faqs">FAQs</h2>\n';
    faqs.forEach((faq, index) => {
      code += ' <div itemscope="" itemprop="mainEntity" itemtype="https://schema.org/Question">\n';
      code += ` <h3 itemprop="name">${getQuestionNumber(index)} ${faq.question}</h3>\n`;
      code += ' <div itemscope="" itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">\n';
      code += ` <p itemprop="text">${faq.answer}</p>\n`;
      code += ' </div>\n';
      code += ' </div>\n';
    });
    code += '</div>';
    setGeneratedCode(code);
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
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom FAQ Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Style Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Question Numbering Style
            </label>
            <Select
              value={numberingStyle}
              onValueChange={(value) => setNumberingStyle(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select question style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numeric">Numeric (1, 2, 3)</SelectItem>
                <SelectItem value="alphabetic">Alphabetic (A, B, C)</SelectItem>
                <SelectItem value="roman">Roman (I, II, III)</SelectItem>
                <SelectItem value="custom">Custom Prefix</SelectItem>
              </SelectContent>
            </Select>
            {numberingStyle === 'custom' && (
              <Input
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                placeholder="Enter question prefix"
                className="mt-2"
              />
            )}
          </div>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <label htmlFor="question" className="text-sm font-medium">
                Question
              </label>
              <Input
                id="question"
                placeholder="Enter your question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full"
                onKeyDown={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">
                Answer
              </label>
              <Textarea
                id="answer"
                placeholder="Enter your answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full"
                rows={3}
                onKeyDown={handleKeyPress}
              />
            </div>
            <Button 
              onClick={addFAQ}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={!newQuestion.trim() || !newAnswer.trim()}
            >
              <Plus size={16} />
              Add FAQ (Ctrl + Enter)
            </Button>
          </div>
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No FAQs added yet. Start by adding your first FAQ above.
                </AlertDescription>
              </Alert>
            ) : (
              faqs.map((faq, index) => (
                <div 
                  key={faq.id} 
                  className="bg-white border border-gray-200 p-4 rounded-lg relative hover:shadow-md transition-shadow"
                >
                  <div className="absolute right-2 top-2 flex gap-1">
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveFAQ(index, 'up')}
                        className="h-8 w-8"
                      >
                        <MoveUp size={16} />
                      </Button>
                    )}
                    {index < faqs.length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveFAQ(index, 'down')}
                        className="h-8 w-8"
                      >
                        <MoveDown size={16} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFAQ(faq.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="pr-24">
                    <p className="font-semibold mb-2 text-lg">
                      {`${getQuestionNumber(index)} ${faq.question}`}
                    </p>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      {faqs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h2>FAQs</h2>
              {faqs.map((faq, index) => (
                <div key={index} className="mb-4">
                  <h3>{getQuestionNumber(index)} {faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {faqs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Schema Code</CardTitle>
          </CardHeader>
          <CardContent>
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
      )}
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
export default CustomFAQGenerator;