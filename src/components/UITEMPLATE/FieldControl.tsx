import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { FieldType } from './types';
interface FieldControlProps {
  fieldKey: string;
  field: FieldType;
  onToggle: () => void;
  onChange: (value: string) => void;
}
export const FieldControl = ({ fieldKey, field, onToggle, onChange }: FieldControlProps) => (
  <div className="flex items-center gap-4">
    <Switch 
      checked={field.enabled}
      onCheckedChange={onToggle}
    />
    <Input
      placeholder={`Enter ${fieldKey}`}
      value={field.value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!field.enabled}
      className="flex-1"
    />
  </div>
);