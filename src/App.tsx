import { useState } from "react";
import "react-quill/dist/quill.snow.css";
import BasicDemo from "./components/ToCGeneteratored/TOC";
import MarketingCardGenerator from "./components/UITEMPLATE/UItemplate";
import FAQGenerator from "./components/FAQ/Faqgnerator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Layout, FileText, Box, HelpCircle, Edit } from "lucide-react";
import { TagSettingsButton } from "./components/TagsSettings/TagsSEttings";
import BodyGenerator from "./components/BodyGeneration/BodyGenerator";
import useCompanyStore from "./components/TagsSettings/useCompanyStore";
import BlogGenerator from "./components/BlogGenerator/BlogGenerator";
const App = () => {
  const [activeTab, setActiveTab] = useState("BodyGenerator");
  const { companies, activeCompanyId, setTabgenerator } = useCompanyStore();
  let id = "";
  if (activeCompanyId != null) {
    id = activeCompanyId;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <TagSettingsButton />
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-200 opacity-20 blur-3xl"></div>
      </div>
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <header className="relative mb-12 text-center">
          <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Content Generator
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Create beautiful content with our intuitive tools
          </p>
        </header>
        <Tabs
          value={activeTab}
          onValueChange={(e: string) => {
            setTabgenerator(e, companies, id);
            setActiveTab(e);
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 gap-4 rounded-2xl bg-white/50 p-2 backdrop-blur-lg md:grid-cols-5">
            <TabsTrigger
              value="BodyGenerator"
              className="flex items-center gap-2 rounded-xl transition-all data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              <span>Body Generator</span>
            </TabsTrigger>
            <TabsTrigger
              value="TOCgenerator"
              className="flex items-center gap-2 rounded-xl transition-all data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <Layout className="h-4 w-4" />
              <span>Table of Contents</span>
            </TabsTrigger>
            <TabsTrigger
              value="UIcomponents"
              className="flex items-center gap-2 rounded-xl transition-all data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              <Box className="h-4 w-4" />
              <span>UI Templates</span>
            </TabsTrigger>
            <TabsTrigger
              value="FAQgenerator"
              className="flex items-center gap-2 rounded-xl transition-all data-[state=active]:bg-rose-500 data-[state=active]:text-white"
            >
              <HelpCircle className="h-4 w-4" />
              <span>FAQ Generator</span>
            </TabsTrigger>
            <TabsTrigger
              value="BlogGenerator"
              className="flex items-center gap-2 rounded-xl transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Edit className="h-4 w-4" />
              <span>Blog Generator</span>
            </TabsTrigger>
          </TabsList>
          <div className="relative">
            <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-lg">
              <CardContent className="p-6">
                <TabsContent value="BodyGenerator" className="mt-0">
                  <div className="space-y-6">
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Body Content Generator
                      </h2>
                      <p className="text-gray-600">
                        Create structured content with proper heading hierarchy
                      </p>
                    </div>
                    <BodyGenerator />
                  </div>
                </TabsContent>
                <TabsContent value="TOCgenerator" className="mt-0">
                  <div className="space-y-6">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Table of Contents Generator
                      </h2>
                      <p className="text-gray-600">
                        Generate structured table of contents
                      </p>
                    </div>
                    <BasicDemo />
                  </div>
                </TabsContent>
                <TabsContent value="UIcomponents" className="mt-0">
                  <div className="space-y-6">
                    <div className="border-l-4 border-pink-500 pl-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        UI Template Generator
                      </h2>
                      <p className="text-gray-600">
                        Create marketing cards and UI components
                      </p>
                    </div>
                    <MarketingCardGenerator />
                  </div>
                </TabsContent>
                <TabsContent value="FAQgenerator" className="mt-0">
                  <div className="space-y-6">
                    <div className="border-l-4 border-rose-500 pl-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        FAQ Generator
                      </h2>
                      <p className="text-gray-600">
                        Generate FAQ sections with questions and answers
                      </p>
                    </div>
                    <FAQGenerator />
                  </div>
                </TabsContent>
                <TabsContent value="BlogGenerator" className="mt-0">
                <BlogGenerator />
                </TabsContent>
              </CardContent>
            </Card>
            <div className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-indigo-500"></div>
            <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-purple-500"></div>
            <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-pink-500"></div>
            <div className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-rose-500"></div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
export default App;