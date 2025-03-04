import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
interface FAQFormProps {
  question: string;
  answer: string;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onAdd: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}
export const FAQForm = ({
  question,
  answer,
  onQuestionChange,
  onAnswerChange,
  onAdd,
  onKeyPress
}: FAQFormProps) => (
  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
    <div className="space-y-2">
      <label htmlFor="question" className="text-sm font-medium">
        Question
      </label>
      <Input
        id="question"
        placeholder="Enter your question"
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        onKeyDown={onKeyPress}
      />
    </div>
    <div className="space-y-2">
      <label htmlFor="answer" className="text-sm font-medium">
        Answer
      </label>
      <Textarea
        id="answer"
        placeholder="Enter your answer"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={3}
        onKeyDown={onKeyPress}
      />
    </div>
    <Button 
      onClick={onAdd}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
      disabled={!question.trim() || !answer.trim()}
    >
      <Plus size={16} />
      Add FAQ (Ctrl + Enter)
    </Button>
  </div>
);