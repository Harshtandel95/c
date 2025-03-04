import { Edit, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ClassNameEntry } from './types';
interface ClassNameListProps {
  entries: ClassNameEntry[];
  onEdit: (tagType: string) => void;
  onSave: (tagType: string, className: string) => void;
  onChange: (index: number, value: string) => void;
}
export const ClassNameList: React.FC<ClassNameListProps> = ({
  entries,
  onEdit,
  onSave,
  onChange,
}) => {
  return (
    <div>
      <h3>Generated Classes:</h3>
      <ul className="space-y-2">
        {entries.map((entry, index) => (
          <li key={index} className="flex items-center space-x-2">
            {entry.isEditing ? (
              <>
                <Input
                  value={entry.className}
                  onChange={(e) => onChange(index, e.target.value)}
                  className="w-48"
                  placeholder="Edit class name"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSave(entry.tagType, entry.className)}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(entry.tagType)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span>Tag: {entry.tagType}</span>
                <span>Class: {entry.className}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(entry.tagType)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};