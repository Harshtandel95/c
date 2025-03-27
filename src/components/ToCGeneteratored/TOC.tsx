import { useState, useMemo, useRef } from "react";
import { Editor } from "primereact/editor";
import './type.css';
import { Copy } from "lucide-react";
import { Toast } from "primereact/toast";
import { Alert, AlertDescription } from "../ui/alert";
import { ClassNameManager } from "../BodyGeneration/ClassNameManager";

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
    const node: HeadingNode = {
      text: headingText,
      level: 2,
      id,
      children: []
    };

    root.push(node);
    levelMap[2] = node;
    levelMap[3] = null;
    levelMap[4] = null;
  });
  return root;
};

const generateHTML: GenerateHTML = (nodes, classNameManager) => {
  if (!nodes || !Array.isArray(nodes)) return '';
  const renderList = (items: HeadingNode[]): string => {
    if (!items.length) return '';
    const ulClass = classNameManager.getClassName('ul') || 'default-ul-class';
    const liClass = classNameManager.getClassName('li') || 'default-li-class';
    const aClass = classNameManager.getClassName('a') || 'default-a-class';
    return `
    <ul class="${ulClass}">${items.map(item => 
      `<li class="${liClass}"><a class="${aClass}" href="#${item.id}">${
        sanitizeText(item.text)
      }</a>${item.children.length > 0 ? 
        `\n<ul class="${ulClass}">${renderList(item.children)}</ul>` : 
        ''}</li>`
    ).join('\n')}</ul>`;
  };

  let html = renderList(nodes)
    .replace(/\n<\/li>/g, '</li>')
    .replace(/^\s+/gm, '')
    .trim();
  html = html.replace(/● /g, '');

  // Dynamically fetch tag and class names
  const tocTag = classNameManager.getClassName('tocTag')?.trim() || 'div';
  const tocClass = classNameManager.getClassName('div')?.trim() || 'default-div-class';
  const headerTag = classNameManager.getClassName('headerTag')?.trim() || 'h2';
  const headerClass = classNameManager.getClassName('h2')?.trim() || 'default-h2-class';

  // Debugging: Log the fetched tag and class names
  console.log('Custom Tag:', tocTag);
  console.log('Custom Class:', tocClass);

  // Ensure valid HTML tags are used
  const validTags = ['div', 'section', 'article', 'header', 'footer', 'nav', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const safeTocTag = validTags.includes(tocTag) ? tocTag : 'div';
  const safeHeaderTag = validTags.includes(headerTag) ? headerTag : 'h2';

  return (`<${safeTocTag} class="${tocClass}">
  <${safeHeaderTag} class="${headerClass}"><strong>Table of Contents</strong></${safeHeaderTag}>
${html}</${safeTocTag}>`);
};

const TableOfContentsGenerator: React.FC = () => {
  const [text, setText] = useState<string>('');
  const classNameManager = useRef<ClassNameManager>(new ClassNameManager());
  const toast = useRef<Toast>(null);
  const [showCopiedAlert, setShowCopiedAlert] = useState<boolean>(false);

  const tocStructure = useMemo(() => parseHeadings(text), [text]);
  const htmlOutput = useMemo(() => {
    try {
      return generateHTML(tocStructure, classNameManager.current);
    } catch (error) {
      console.error('Error generating HTML:', error);
      return '';
    }
  }, [tocStructure]);

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
    <div className="card">
      <Toast ref={toast} />
      <div className="editor-container">
        <Editor
          value={text}
          onTextChange={(e) => setText(e.textValue ?? '')}
          style={{ height: '320px' }}
          headerTemplate={<h1>Table Of Content:</h1>}
          placeholder="Enter each heading on a new line. Add a space after your heading text. Everything after the space will be ignored."
        />
      </div>
      <pre className="html-output">
        <div className="flex cursor-pointer flex-row-reverse justify-between">
          <Copy onClick={handlecopy} />
          <code>{htmlOutput}</code>
        </div>
      </pre>
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
