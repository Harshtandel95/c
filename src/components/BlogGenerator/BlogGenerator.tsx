import { PlusCircle, X, Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { useEffect, useState } from "react";
import useArticleStore from "./useArticlestore";
import useCompanyStore from "../TagsSettings/useCompanyStore";
interface BlogURL {
  id: string;
  fullUrl: string;
  extractedName: string;
}
const BlogGenerator = () => {
  const [urls, setUrls] = useState<BlogURL[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isFetchDisabled, setIsFetchDisabled] = useState<boolean>(true);
  const [isGenerateDisabled, setIsGenerateDisabled] = useState<boolean>(true);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { fetchArticles, articles } = useArticleStore();
  const { activeCompanyId } = useCompanyStore();
  useEffect(() => {
    setIsFetchDisabled(urls.length === 0 || isLoading || hasFetched);
    setIsGenerateDisabled(articles.length === 0 || !hasFetched || hasGenerated);
  }, [urls, articles, isLoading, hasFetched, hasGenerated]);
  const handleContainsExtractedName = (handle: string, extractedName: string): boolean => {
    return handle.toLowerCase().includes(extractedName.toLowerCase());
  };
  const generateRelatedBlogsHTML = () => {
    const matchedArticles = articles.filter(article => 
      urls.some(url => handleContainsExtractedName(article.handle, url.extractedName))
    );
    if (matchedArticles.length === 0) {
      return `
        <div class="related-blogs-wrapper">
          <h2 style="margin: 0;"><strong>Related Blogs</strong></h2>
          <p>No matching blog articles found.</p>
        </div>
      `;
    }
    const articleWithUrls = matchedArticles.map(article => {
      const matchingUrl = urls.find(url => 
        handleContainsExtractedName(article.handle, url.extractedName)
      );
      return {
        ...article,
        fullUrl: matchingUrl?.fullUrl || '#'
      };
    });
    const listItems = articleWithUrls.map(article => {
      const imageSrc = article.image?.src || '/placeholder-image.jpg';
      const imageAlt = article.image?.alt || `Thumbnail for ${article.title}`;
      return `
        <li>
          <img src="${imageSrc}" alt="${imageAlt}" width="150" height="100" loading="lazy">
          <a href="${article.fullUrl}">
            <h3 style="margin: 0;">${article.title}</h3>
          </a>
        </li>
      `;
    }).join('');
    return `
      <div class="related-blogs-wrapper">
        <h2 style="margin: 0;"><strong>Related Blogs</strong></h2>
        <ul>
          ${listItems}
        </ul>
      </div>
    `;
  };
  const handleFetch = async () => {
    const extractedNames = urls.map(url => url.extractedName);
    setIsLoading(true);
    setError('');
    try {
      await fetchArticles(activeCompanyId, extractedNames);
      setHasFetched(true);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to fetch articles');
      setHasFetched(false);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGenerate = () => {
    try {
      const html = generateRelatedBlogsHTML();
      setGeneratedHtml(html);
      setHasGenerated(true);
    } catch (err) {
      console.error('Error generating HTML:', err);
      setError('Failed to generate HTML');
    }
  };
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy to clipboard');
    }
  };
  const extractUrlName = (url: string): string => {
    try {
      const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const parts = cleanUrl.split('/');
      return parts[parts.length - 1] || '';
    } catch (error) {
      console.error('Error extracting URL name:', error);
      return '';
    }
  };
  const handleAddUrl = () => {
    if (!currentUrl.trim()) {
      setError('Please enter a URL');
      return;
    }
    try {
      new URL(currentUrl);
      const extractedName = extractUrlName(currentUrl);
      if (!extractedName) {
        setError('Could not extract a valid name from the URL');
        return;
      }
      const newUrl: BlogURL = {
        id: Date.now().toString(),
        fullUrl: currentUrl,
        extractedName
      };
      setUrls(prev => [...prev, newUrl]);
      setCurrentUrl('');
      setError('');
      setHasFetched(false);
      setHasGenerated(false);
      setGeneratedHtml('');
    } catch (err) {
      console.error(err);
      setError('Please enter a valid URL');
    }
  };
  const handleRemoveUrl = (id: string) => {
    setUrls(prev => prev.filter(url => url.id !== id));
    setHasFetched(false);
    setHasGenerated(false);
    setGeneratedHtml('');
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddUrl();
    }
  };
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-emerald-500 pl-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Blog Generator
        </h2>
        <p className="text-gray-600">
          Create engaging blog posts with proper structure
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL"
            className="flex-1"
          />
          <Button
            onClick={handleAddUrl}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add URL
          </Button>
          <Button 
            disabled={isFetchDisabled} 
            onClick={handleFetch}
          >
            {isLoading ? 'Fetching...' : 'Fetch'}
          </Button>
          <Button 
            disabled={isGenerateDisabled} 
            onClick={handleGenerate}
          >
            Generate
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          {urls.map((url) => (
            <div
              key={url.id}
              className="flex items-center justify-between rounded-lg border p-3 shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {url.extractedName}
                </p>
                <p className="text-sm text-gray-500">{url.fullUrl}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveUrl(url.id)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {generatedHtml && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Generated HTML:</h3>
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="whitespace-pre-wrap overflow-x-auto p-4 bg-gray-100 rounded border">
              <code>{generatedHtml}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
export default BlogGenerator;