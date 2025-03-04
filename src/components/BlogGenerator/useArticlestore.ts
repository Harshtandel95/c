import { create } from 'zustand';
import axios from 'axios';
import { BackEndUrl } from '@/config';
interface Article {
  title: string;
  image: {
    created_at: string;
    alt: string;
    width: number;
    height: number;
    src: string;
  };
  handle:string; 
}
interface ArticleStore {
  articles: Article[];
  loading: boolean;
  error: string | null;
  fetchArticles: (url: string|null, token: string[]) => Promise<void>;
}
const useArticleStore = create<ArticleStore>((set) => ({
  articles: [],
  loading: false,
  error: null,
  fetchArticles: async ( id,handle ) => {
    set({ loading: true, error: null });
    try {
      const data = { id:id,Handle:handle };
      const response = await axios.post(`${BackEndUrl}/api/articles`, data);
      set({ articles: response.data.articles, loading: false });
    } catch (error) {
      set({
        error: axios.isAxiosError(error) ? error.message : 'Failed to fetch articles',
        loading: false
      });
    }
  }
}));
export default useArticleStore;