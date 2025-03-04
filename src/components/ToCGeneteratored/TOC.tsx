/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo, useRef, useEffect } from "react";
import { Editor } from "primereact/editor";
import './type.css';
import { Copy } from "lucide-react";
import { Toast } from "primereact/toast";
import { Alert, AlertDescription } from "../ui/alert";
import { ClassNameManager } from "../BodyGeneration/ClassNameManager";
import useCompanyStore from "../TagsSettings/useCompanyStore";
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
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'heading';
};
const parseHeadings: ParseHeadings = (text) => {
  if (!text) return [];
  const lines = text.split('\n');
  const root: HeadingNode[] = [];
  const levelMap: Record<number, HeadingNode | null> = { 2: null, 3: null, 4: null };
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    const parts = trimmedLine.split(/\s+/);
    if (parts.length < 1) return;
    const headingText = parts.slice(0, -1).join(' ').trim();
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
    const ulClass = classNameManager.getClassName('ul') || '';
    const liClass = classNameManager.getClassName('li') || '';
    const aClass = classNameManager.getClassName('a') || '';
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
  const tocClass = classNameManager.getClassName('div') || '';
  const headerClass = classNameManager.getClassName('h2') || '';
  return (`<div class="${tocClass}">
  <h2 class="${headerClass}"><strong>Table of Contents</strong></h2>
${html}</div>`);
};
const TableOfContentsGenerator: React.FC = () => {
  const [text, setText] = useState<string>('');
  const classNameManager = useRef<ClassNameManager>(new ClassNameManager());
  const toast = useRef<Toast>(null);
  const [showCopiedAlert, setShowCopiedAlert] = useState<boolean>(false);
  const { companies, activeCompanyId, setTabgenerator } = useCompanyStore() ;
  const activeCompany = companies.find(company => company._id === activeCompanyId);
  const id = activeCompanyId ?? '';
  useEffect(() => {
    if (companies && id) {
      setTabgenerator("TOCgenerator", companies, id);
    }
  }, [companies, id, setTabgenerator]);
  const tocStructure = useMemo(() => parseHeadings(text), [text]);
  const htmlOutput = useMemo(() => {
    if (!activeCompany?.Generator?.TOCgenerator) return '';
    try {
      activeCompany.Generator.TOCgenerator.forEach(gen => {
        if (gen.tags && gen.class && classNameManager.current) {
          classNameManager.current.replaceClassName(gen.tags, gen.class);
        }
      });
      return generateHTML(tocStructure, classNameManager.current);
    } catch (error) {
      console.error('Error generating HTML:', error);
      return '';
    }
  }, [tocStructure, activeCompany?.Generator?.TOCgenerator]);
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
  if (!activeCompany) {
    return <div className="p-4 text-red-500">Please select a company first</div>;
  }
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