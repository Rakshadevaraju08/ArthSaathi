import { create } from "zustand";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
};

type Store = {
  transactions: Transaction[];
};

export const useStore = create<Store>(() => ({
  transactions: [
    {
      id: "1",
      title: "Milk Sale",
      amount: 4000,
      type: "income",
    },
    {
      id: "2",
      title: "Fertilizer",
      amount: 1200,
      type: "expense",
    },
  ],
}));