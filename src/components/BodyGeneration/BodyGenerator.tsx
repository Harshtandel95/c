import { useEffect, useState, useRef } from "react";
import { Editor } from "primereact/editor";
import { Toast } from "primereact/toast";
import { ClassNameManager } from "./ClassNameManager";
import { HTMLPreview } from "./HTMLPreview";


const BodyGenerator = () => {
  const [text, setText] = useState<string>("");
  const [processedText, setProcessedText] = useState<string>("");
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  {/*const classNameManager = useRef(new ClassNameManager()).current;*/}
  const toast = useRef<Toast>(null);


  // Function to process the HTML content and add spaces around href
  const processHTML = (text: string) => {
    // Use a regular expression to add spaces around href values in anchor tags
    const processedText = text.replace(/(<a[^>]+href=")([^"]+)(")/g, (match, p1, p2, p3) => {
      // Add spaces before and after href value
      return `${p1} ${p2} ${p3}`;
    });


    return { html: processedText };
  };


  useEffect(() => {
    const { html } = processHTML(text);
    setProcessedText(html);
  }, [text]);


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
