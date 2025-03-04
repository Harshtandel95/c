import { useState } from "react"
import TagsHeader from "./TagsHeader"
import GenerateTypeSelection from "./GenerateTypeSelection"
import AddCompany from "./AddCompany"
import Cardcompany from "./Cardcompany"
import useCompanyStore from "./useCompanyStore"
export default function StyleSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const { setGenerator } = useCompanyStore()
  const handleTabChange = (tab:string) => {
    setActiveTab(tab)
    if (tab === "shopify") {
      setGenerator("UIcomponents")
    }
  }
  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-6 border-b">
        <button 
          className={`py-2 px-4 font-medium transition-colors ${activeTab === "general" ? "border-b-2 border-purple-600 text-purple-700" : "text-gray-600 hover:text-purple-500"}`}
          onClick={() => handleTabChange("general")}
        >
          General
        </button>
      </div>
      {activeTab === "general" && (
        <>
          <TagsHeader />
          <GenerateTypeSelection />
          <AddCompany />
          <Cardcompany />
        </>
      )}
    </div>
  )
}