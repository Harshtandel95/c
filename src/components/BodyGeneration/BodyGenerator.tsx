import { useEffect, useState, useRef } from "react";
import { Editor } from "primereact/editor";
import { Toast } from "primereact/toast";
import { ClassNameManager } from "./ClassNameManager";
import { useHTMLProcessor } from "../../hooks/useHTMLProcessor";
import { HTMLPreview } from "./HTMLPreview";
import useCompanyStore from "../TagsSettings/useCompanyStore";
const BodyGenerator = () => {
  const [text, setText] = useState<string>("");
  const [processedText, setProcessedText] = useState<string>("");
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const classNameManager = useRef(new ClassNameManager()).current;
  const toast = useRef<Toast>(null);
  const { companies, activeCompanyId} = useCompanyStore();
  const activeCompany = companies.find(company => company._id === activeCompanyId);
  const processHTML = useHTMLProcessor(classNameManager);
  useEffect(() => {
    if (activeCompany?.Generator.BodyGenerator && activeCompany?.Generator.BodyGenerator.length > 0) {
      activeCompany?.Generator.BodyGenerator.forEach(gen => {
        if (gen.tags && gen.class) {
          classNameManager.replaceClassName(gen.tags, gen.class);
        }
      });
    }
    const { html } = processHTML(text);
    setProcessedText(html);
  }, [text, processHTML, activeCompany?.Generator.BodyGenerator]);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedText);
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `${err}`,
        life: 3000,
      });
    }
  };
  if (!activeCompany) {
    return <div>Please select a company first</div>;
  }
  return (
    <div className="space-y-4">
      <Editor
        value={text}
        onTextChange={(e) => setText(e.htmlValue || "")}
        style={{ height: "320px" }}
        placeholder="Enter headings in format: 'Heading Text (H1)' or 'Heading Text (h2)'"
      />
      
      <HTMLPreview 
        processedText={processedText}
        onCopy={handleCopy}
        showCopiedAlert={showCopiedAlert}
      />
      
      <Toast ref={toast} />
    </div>
  );
};
export default BodyGenerator;