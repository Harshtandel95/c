import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { Company, Generator, GeneratorSchema } from './types';
import { BackEndUrl } from '@/config';
interface shopify{
  shopify_id: string;
  shopify_url: string;
}
interface CompanyStore {
  companies: Company[];
  slectedGenerator: GeneratorSchema[];
  slectedgenerator: GeneratorSchema[];
  activeCompanyId: string | null;
  loading: boolean;
  error: string | null;
  generator: string;
  sameTagAlert:boolean;
  fetchcompanies: () => Promise<void>;
  createCompany: (companyData: Omit<Company, '_id'>) => Promise<void>;
  updateCompany: (id: string, companyData: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  addGenerator: (companyId: string, generatorType: string, generatorData: { tags: string; class: string }) => Promise<void>;
  updateGenerator: (companyId: string, generatorType: string, generatorId: string | undefined, generatorData: { tags: string; class: string }) => Promise<void>;
  setActiveCompany: (id: string) => void;
  setGenerator: (generate: string) => void;
  selectGenerator: (generator: Generator, value: string) => void;
  deleteGenerator: (companyId: string, generatorType: string, generatorId: string) => Promise<void>;
  setTabgenerator: (tabs:string,companies:Company[],activeCompanyId:string)=> void; 
  updateCompanyCredentials: (companyId:string,shopifyCredentials:shopify)=>void; 
}
const api = axios.create({
  baseURL: BackEndUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      companies: [],
      activeCompanyId: null,
      loading: false,
      error: null,
      slectedGenerator: [{ tags: '', class: '', id: '' }],
      slectedgenerator:[{ tags: '', class: '', id: '' }],
      generator: 'BodyGenerator',
      sameTagAlert:false,
      fetchcompanies: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/api/companies');
          set({ companies: response.data.companies, loading: false });
        } catch (error) {
          set({
            error: axios.isAxiosError(error) ? error.message : 'Failed to fetch companies',
            loading: false
          });
        }
      },
      createCompany: async (companyData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/api/companies', companyData);
          set((state) => ({
            companies: [response.data, ...state.companies],
            loading: false
          }));
        } catch (error) {
          set({
            error: axios.isAxiosError(error) ? error.message : 'Failed to create company',
            loading: false
          });
        }
      },
      updateCompany: async (id, companyData) => {
        set({ loading: true, error: null });
        try {
          console.log(companyData); 
          const response = await api.put<Company>(`/api/companies/${id}`, companyData);
          set((state) => ({
            companies: state.companies.map((c) => (c._id === id ? response.data : c)),
            loading: false,
          }));
        } catch (error) {
          set({
            error: axios.isAxiosError(error) ? error.message : 'Failed to update company',
            loading: false
          });
        }
      },
      deleteCompany: async (id) => {
        set({ loading: true, error: null });
        try {
          await api.delete(`/api/companies/${id}`);
          set((state) => ({
            companies: state.companies.filter((c) => c._id !== id),
            loading: false,
          }));
        } catch (error) {
          set({
            error: axios.isAxiosError(error) ? error.message : 'Failed to delete company',
            loading: false
          });
        }
      },
       addGenerator : async (companyId, generatorType, generatorData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post(
            `/api/companies/${companyId}/generators/${generatorType}`,
            generatorData
          );
          set((currentState) => {
            const updatedCompanies = currentState.companies.map((c) =>
              c._id === companyId ? response.data : c
            );
            const updatedCompany = response.data;
            let updatedSelectedGenerator;
            switch (currentState.generator) {
              case 'BodyGenerator':
                updatedSelectedGenerator = updatedCompany.Generator.BodyGenerator;
                break;
              case 'TOCgenerator':
                updatedSelectedGenerator = updatedCompany.Generator.TOCgenerator;
                break;
              case 'UIcomponents':
                updatedSelectedGenerator = updatedCompany.Generator.UIcomponents;
                break;
              case 'FAQgenerator':
                updatedSelectedGenerator = updatedCompany.Generator.FAQgenerator;
                break;
            }
            return {
              companies: updatedCompanies,
              slectedGenerator: updatedSelectedGenerator,
              loading: false,
            };
          });
        } catch (error) {
          let errorMessage = 'Failed to add generator';
          if (axios.isAxiosError(error) && error.response?.data) {
            if (error.response.data.error === 'DUPLICATE_TAG') {
              set({sameTagAlert:true});
              errorMessage = 'This tag already exists in this generator type';
            }
          }
          set({
            error: errorMessage,
            loading: false
          });
        }
      },
      updateGenerator: async (companyId, generatorType, generatorId, generatorData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.put<Company>(
            `/api/companies/${companyId}/generators/${generatorType}/${generatorId}`,
            generatorData
          );
          set((currentState) => {
            const updatedCompanies = currentState.companies.map((c) =>
              c._id === companyId ? response.data : c
            );
            let updatedSelectedGenerator;
            switch (currentState.generator) {
              case 'BodyGenerator':
                updatedSelectedGenerator = response.data.Generator.BodyGenerator;
                break;
              case 'TOCgenerator':
                updatedSelectedGenerator = response.data.Generator.TOCgenerator;
                break;
              case 'UIcomponents':
                updatedSelectedGenerator = response.data.Generator.UIcomponents;
                break;
              case 'FAQgenerator':
                updatedSelectedGenerator = response.data.Generator.FAQgenerator;
                break;
            }
            return {
              companies: updatedCompanies,
              slectedGenerator: updatedSelectedGenerator,
              loading: false
            };
          });
        } catch (error) {
          let errorMessage = 'Failed to update generator';
          if (axios.isAxiosError(error) && error.response?.data) {
            if (error.response.data.error === 'DUPLICATE_TAG') {
              errorMessage = 'This tag already exists in this generator type';
            }
          }
          set({
            error: errorMessage,
            loading: false
          });
        }
      },
      updateCompanyCredentials: async (companyId,shopifyCredentials)=>{
        set({ loading: true, error: null });
        console.log(companyId,shopifyCredentials); 
        try {
          const response = await api.post(`/api/updateUrlAndId/${companyId}`, shopifyCredentials);
          console.log(response); 
        } catch (error) {
          set({
            error: axios.isAxiosError(error) ? error.message : 'Failed to update company',
            loading: false
          });
        }
      },
      setActiveCompany: (id: string | null) => {
        set({ activeCompanyId: id });
      },
      setGenerator: (generate: string) => {
        set({ generator: generate });
      },
      selectGenerator: (generator: Generator, value: string) => {
        if (value == "BodyGenerator") { set({ slectedGenerator: generator.BodyGenerator }) }
        else if (value == "TOCgenerator") { set({ slectedGenerator: generator.TOCgenerator }) }
        else if (value == "UIcomponents") { set({ slectedGenerator: generator.UIcomponents }) }
        else { set({ slectedGenerator: generator.FAQgenerator }) }
      },
      deleteGenerator: async (companyId, generatorType, generatorId) => {
        set({ loading: true, error: null });
        try {
          const response = await api.delete(
            `/api/companies/${companyId}/generators/${generatorType}/${generatorId}`
          );
          set((state) => {
            const updatedCompanies = state.companies.map((c) =>
              c._id === companyId ? response.data : c
            );
            const updatedCompany = response.data;
            switch (state.generator) {
              case 'BodyGenerator':
                set({ slectedGenerator: updatedCompany.Generator.BodyGenerator });
                break;
              case 'TOCgenerator':
                set({ slectedGenerator: updatedCompany.Generator.TOCgenerator });
                break;
              case 'UIcomponents':
                set({ slectedGenerator: updatedCompany.Generator.UIcomponents });
                break;
              case 'FAQgenerator':
                set({ slectedGenerator: updatedCompany.Generator.FAQgenerator });
                break;
            }
            return {
              companies: updatedCompanies,
              loading: false,
            };
          });
        } catch (error) {
          set({
            error: axios.isAxiosError(error) ? error.message : 'Failed to update generator',
            loading: false
          });
        }
      },
      setTabgenerator: (tabs:string,companies:Company[],activeCompanyId:string)=>{
        const company = companies.find((company) => company._id === activeCompanyId);
        if (tabs == "BodyGenerator") { set({ slectedgenerator: company?.Generator.BodyGenerator }) }
        else if (tabs == "TOCgenerator") { set({ slectedgenerator: company?.Generator.TOCgenerator }) }
        else if (tabs == "UIcomponents") { set({ slectedgenerator: company?.Generator.UIcomponents }) }
        else { set({ slectedgenerator: company?.Generator.FAQgenerator }) } 
      }
    }),
    {
      name: 'company-store',
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({
        companies: state.companies,
        activeCompanyId: state.activeCompanyId,
        generator: state.generator,
        slectedGenerator: state.slectedGenerator,
      }),
    }
  )
);
export default useCompanyStore;