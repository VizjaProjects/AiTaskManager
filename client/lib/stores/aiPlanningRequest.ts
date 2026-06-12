import { create } from "zustand";

interface AiPlanningRequest {
  id: number;
  text: string;
}

interface AiPlanningRequestState {
  pendingRequest: AiPlanningRequest | null;
  enqueue: (text: string) => void;
  consume: () => AiPlanningRequest | null;
}

let nextRequestId = 1;

export const useAiPlanningRequestStore = create<AiPlanningRequestState>(
  (set, get) => ({
    pendingRequest: null,

    enqueue: (text) => {
      set({
        pendingRequest: {
          id: nextRequestId++,
          text,
        },
      });
    },

    consume: () => {
      const request = get().pendingRequest;
      if (request) set({ pendingRequest: null });
      return request;
    },
  }),
);
