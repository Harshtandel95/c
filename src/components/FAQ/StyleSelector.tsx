import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberingStyle, AnswerStyle } from "./types";
import { Input } from "../ui/input";
interface StyleSelectorProps {
  type: 'question' | 'answer';
  value: NumberingStyle | AnswerStyle;
  onChange: (value: string ) => void;
  customPrefix: string;
  onCustomPrefixChange?: (value: string) => void;
}
export const StyleSelector = ({
  type,
  value,
  onChange,
  customPrefix,
  onCustomPrefixChange
}: StyleSelectorProps) => (
  <div className="space-y-2">
    <label className="text-sm font-medium block">
      {type === 'question' ? 'Question Style' : 'Answer Style'}
    </label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={`Select ${type} style`} />
      </SelectTrigger>
      <SelectContent>
        {type === 'question' ? (
          <>
            <SelectItem value="numeric">Numeric (1, 2, 3)</SelectItem>
            <SelectItem value="alphabetic">Alphabetic (A, B, C)</SelectItem>
            <SelectItem value="roman">Roman (I, II, III)</SelectItem>
            <SelectItem value="custom">Custom Prefix</SelectItem>
          </>
        ) : (
          <>
            <SelectItem value="bullet">Bullet (•)</SelectItem>
            <SelectItem value="arrow">Arrow (→)</SelectItem>
            <SelectItem value="dash">Dash (—)</SelectItem>
            <SelectItem value="custom">Custom Prefix</SelectItem>
            <SelectItem value="none">No Prefix</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
    {value === 'custom' && onCustomPrefixChange && (
      <Input
        value={customPrefix}
        onChange={(e) => onCustomPrefixChange(e.target.value)}
        placeholder={`Enter ${type} prefix`}
        className="mt-2"
      />
    )}
  </div>
);