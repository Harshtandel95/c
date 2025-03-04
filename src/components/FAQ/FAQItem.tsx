import { Button } from "@/components/ui/button";
import { Trash2, MoveUp, MoveDown } from "lucide-react";
import { FAQ } from "./types";
interface FAQItemProps {
  faq: FAQ;
  index: number;
  totalItems: number;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onRemove: (id: string) => void;
  getQuestionNumber: (index: number) => string;
  getAnswerPrefix: () => string;
}
export const FAQItem = ({
  faq,
  index,
  totalItems,
  onMove,
  onRemove,
  getQuestionNumber,
  getAnswerPrefix
}: FAQItemProps) => (
  <div className="bg-white border border-gray-200 p-4 rounded-lg relative hover:shadow-md transition-shadow">
    <div className="absolute right-2 top-2 flex gap-1">
      {index > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMove(index, 'up')}
          className="h-8 w-8"
        >
          <MoveUp size={16} />
        </Button>
      )}
      {index < totalItems - 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMove(index, 'down')}
          className="h-8 w-8"
        >
          <MoveDown size={16} />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(faq.id)}
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 size={16} />
      </Button>
    </div>
    <div className="pr-24">
      <p className="font-semibold mb-2 text-lg">
        {`${getQuestionNumber(index)} ${faq.question}`}
      </p>
      <p className="text-gray-600">
        <span className="mr-2">{getAnswerPrefix()}</span>
        {faq.answer}
      </p>
    </div>
  </div>
);