import { useState, useMemo, useRef, useEffect } from "react";
import { Editor } from "primereact/editor";
import './type.css';
import { Copy } from "lucide-react";
import { Toast } from "primereact/toast";
import { Alert, AlertDescription } from "../ui/alert";
import { ClassNameManager } from "../BodyGeneration/ClassNameManager";

const tagOptions = ['ul', 'li', 'a', 'div', 'h2'];

interface HeadingNode {
  text: string;
  level: number;
  id: string;
  children: HeadingNode[];
}

type GenerateAnchorId = (text: string) => string;
type ParseHeadings = (text: string) => HeadingNode[];
type GenerateHTML = (nodes: HeadingNode[], classNameManager: ClassNameManager) => string;

const sanitizeText = (text: string | null | undefined): string => {
  return text?.trim() ?? '';
};

const generateAnchorId: GenerateAnchorId = (text) => {
  return sanitizeText(text)
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Allow hyphens
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .toLowerCase() || 'heading';
};

const parseHeadings: ParseHeadings = (text) => {
  if (!text) return [];
  const lines = text.split('\n');
  const root: HeadingNode[] = [];
  const levelMap: Record<number, HeadingNode | null> = { 2: null, 3: null, 4: null };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim().replace(/^●\s*/, ''); // Remove bullet points
    if (!trimmedLine) return;

    const headingText = trimmedLine
      .replace(/\(h[1-6]\)/gi, '') // Remove (h1), (h2), etc.
      .replace(/^\d+\.\s*/, '') // Remove indexing digits like 1., 2., etc.
      .trim();
    if (!headingText) return;

    const baseId = generateAnchorId(headingText);
    const id = root.some(node => node.id === baseId)
       ? `${baseId}-${index}`
      : baseId;

    const levelMatch = trimmedLine.match(/\(h([1-6])\)/i);
    const level = levelMatch ? parseInt(levelMatch[1], 10) : 2;

    const node: HeadingNode = {
      text: headingText,
      level,
      id,
      children: []
    };

    if (level === 2) {
      // Top-level heading
      root.push(node);
      levelMap[2] = node;
      levelMap[3] = null;
      levelMap[4] = null;
    } else if (level === 3) {
      // Subheading under H2
      const parent = levelMap[2];
      if (parent) {
        parent.children.push(node);
        levelMap[3] = node;
        levelMap[4] = null;
      }
    } else if (level === 4) {
      // Subheading under H3
      const parent = levelMap[3];
      if (parent) {
        parent.children.push(node);
        levelMap[4] = node;
      }
    }
  });

  return root;
};

const generateHTML: GenerateHTML = (nodes, classNameManager) => {
  if (!nodes || !Array.isArray(nodes)) return '';

  const renderList = (items: HeadingNode[], level = 2): string => {
    if (!items.length) return '';

    const ulClass = classNameManager.getClassName('ul') || '';
    const liClass = classNameManager.getClassName('li') || '';
    const aClass = classNameManager.getClassName('a') || '';

    return `
    <ul class="${ulClass}">
      ${items
        .map((item) => {
          const childList =
            item.children.length > 0
              ? renderList(item.children, level + 1)
              : '';

          return `
          <li class="${liClass}">
            <a class="${aClass}" href="#${item.id}">${sanitizeText(item.text)}</a>
            ${childList}
          </li>`;
        })
        .join('')}
    </ul>`;
  };

  const tocClass = classNameManager.getClassName('div') || '';
  const headerClass = classNameManager.getClassName('h2') || '';

  return `
    <div class="${tocClass}">
      <h2 class="${headerClass}"><strong>Table of Contents</strong></h2>
      ${renderList(nodes)}
    </div>`;
};

const TableOfContentsGenerator: React.FC = () => {
  const [text, setText] = useState<string>(() => {
    // Load text from localStorage on initial render
    return localStorage.getItem("tocText") || '';
  });
  const [tagClassMap, setTagClassMap] = useState<Record<string, string>>(() => {
    //Load tagClassMap from localStorage on initial render
    const savedTagClassMap = localStorage.getItem("tocTagClassMap");
    return savedTagClassMap ? JSON.parse(savedTagClassMap) : {};
  });
  const [selectedTag, setSelectedTag] = useState<string>(tagOptions[0]);
  const classNameManager = useRef<ClassNameManager>(new ClassNameManager());
  const toast = useRef<Toast>(null);
  const [showCopiedAlert, setShowCopiedAlert] = useState<boolean>(false);

  // Update classNameManager with saved classes when the component mounts
  useEffect(() => {
    Object.entries(tagClassMap).forEach(([tag, className]) => {
      classNameManager.current.setClassName(tag, className || undefined);
    });
  }, [tagClassMap]);

  // Save tagClassMap to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("tocTagClassMap", JSON.stringify(tagClassMap));
  }, [tagClassMap]);

  // Save text to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("tocText", text);
  }, [text]);

  const handleTagClassChange = (tag: string, className: string) => {
    setTagClassMap((prev) => ({ ...prev, [tag]: className }));
    classNameManager.current.setClassName(tag, className || undefined);
  };

  const handleResetTagClassMap = () => {
    setTagClassMap({});
    localStorage.removeItem("tocTagClassMap");
  };

  const tocStructure = useMemo(() => parseHeadings(text), [text]);

  const htmlOutput = useMemo(() => {
    try {
      return generateHTML(tocStructure, classNameManager.current);
    } catch (error) {
      console.error('Error generating HTML:', error);
      return '';
    }
  }, [tocStructure, tagClassMap]);

  const handlecopy = async () => {
    try {
      if (!htmlOutput) {
        throw new Error('No content to copy');
      }
      await navigator.clipboard.writeText(htmlOutput);
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy to clipboard';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000,
      });
    }
  };

  return (
    <div className="card flex h-full">
      <Toast ref={toast} />

      {/* Editor Section */}
      <div
        className="editor-container flex-1 relative p-4 overflow-auto"
        style={{ height: "300px", wordWrap: "break-word", whiteSpace: "pre-wrap" }}
      >
        <Editor
          value={text}
          onTextChange={(e) => setText(e.textValue ?? '')}
          style={{ height: '100%', padding: '10px', boxSizing: 'border-box' }}
          headerTemplate={<h1 className="text-lg font-semibold mb-2">Table Of Content:</h1>}
          placeholder="Enter each heading on a new line. Add a space after your heading text. Everything after the space will be ignored."
          className="w-full h-full border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        {/* Copy Icon for Editor */}
        <div className="absolute top-2 right-2 cursor-pointer">
          <Copy
            onClick={handlecopy}
            className="text-gray-500 hover:text-gray-700"
            size={20}
          />
        </div>
      </div>

      {/* Tag Classes Section */}
      <div className="tag-class-manager flex-1 p-4 max-h-[400px] overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Tag Classes</h3>
        <div className="flex items-center space-x-2 mb-4">
          <select
            id="tag-selector"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          >
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {`<${tag}>`}
              </option>
            ))}
          </select>
          <input
            id={`class-${selectedTag}`}
            type="text"
            value={tagClassMap[selectedTag] || ''}
            onChange={(e) => handleTagClassChange(selectedTag, e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder={`Class for <${selectedTag}>`}
          />
        </div>
        <ul className="space-y-1">
          {Object.entries(tagClassMap)
            .filter(([_, className]) => className.trim() !== '') // Only show tags with assigned values
            .map(([tag, className]) => (
              <li
                key={tag}
                className="flex justify-between items-center p-1 border rounded bg-gray-50"
              >
                <span className="font-medium text-gray-700">{`<${tag}>`}</span>
                <span className="text-sm text-gray-500">{className}</span>
              </li>
            ))}
        </ul>
        <button
          onClick={handleResetTagClassMap}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
        >
          Reset Tag Classes
        </button>
      </div>

      {/* Output Section */}
      <div
        className="html-output flex-1 relative border-r p-4 max-h-[400px] overflow-auto"
        style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
      >
        <div className="absolute top-2 right-2 cursor-pointer">
          <Copy
            onClick={handlecopy}
            className="text-gray-500 hover:text-gray-700"
            size={20}
          />
        </div>
        <code>{htmlOutput}</code>
      </div>
      

            {/* copied alert */}
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

export default TableOfContentsGenerator;
