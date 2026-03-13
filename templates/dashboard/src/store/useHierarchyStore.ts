import { create } from "zustand";

// Types for hierarchy data from SQLite
export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
}

export interface Squad {
  id: string;
  product_id: string | null;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  format: string | null;
}

export interface Run {
  id: string;
  squad_id: string;
  status: "running" | "completed" | "failed";
  topic: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  step_count: number | null;
  current_step: number;
  error_message: string | null;
}

export interface RunStep {
  id: string;
  run_id: string;
  step_number: number;
  agent_id: string;
  agent_name: string;
  status: "pending" | "running" | "completed" | "failed";
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  output_file: string | null;
}

interface HierarchyStore {
  // Data
  companies: Company[];
  products: Product[];
  squads: Squad[];
  runs: Run[];
  runSteps: Map<string, RunStep[]>;

  // Active selections
  activeCompanyId: string | null;
  activeProductId: string | null;
  selectedRunId: string | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setCompanies: (companies: Company[]) => void;
  setProducts: (products: Product[]) => void;
  setSquads: (squads: Squad[]) => void;
  setRuns: (runs: Run[]) => void;
  setRunSteps: (runId: string, steps: RunStep[]) => void;
  selectCompany: (id: string | null) => void;
  selectProduct: (id: string | null) => void;
  selectRun: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed helpers
  getCompanyProducts: (companyId: string) => Product[];
  getProductSquads: (productId: string) => Squad[];
  getSquadRuns: (squadCode: string) => Run[];
}

export const useHierarchyStore = create<HierarchyStore>((set, get) => ({
  // Initial state
  companies: [],
  products: [],
  squads: [],
  runs: [],
  runSteps: new Map(),
  activeCompanyId: null,
  activeProductId: null,
  selectedRunId: null,
  isLoading: false,
  error: null,

  // Actions
  setCompanies: (companies) => set({ companies }),

  setProducts: (products) => set({ products }),

  setSquads: (squads) => set({ squads }),

  setRuns: (runs) => set({ runs }),

  setRunSteps: (runId, steps) =>
    set((state) => ({
      runSteps: new Map(state.runSteps).set(runId, steps),
    })),

  selectCompany: (id) =>
    set({
      activeCompanyId: id,
      activeProductId: null, // Reset product when company changes
    }),

  selectProduct: (id) => set({ activeProductId: id }),

  selectRun: (id) => set({ selectedRunId: id }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  // Computed helpers
  getCompanyProducts: (companyId) => {
    return get().products.filter((p) => p.company_id === companyId);
  },

  getProductSquads: (productId) => {
    return get().squads.filter((s) => s.product_id === productId);
  },

  getSquadRuns: (squadCode) => {
    const squad = get().squads.find((s) => s.code === squadCode);
    if (!squad) return [];
    return get().runs.filter((r) => r.squad_id === squad.id);
  },
}));
