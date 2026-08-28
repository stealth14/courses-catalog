"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A picked time slot. */
export type SlotSelection = {
  /** HH:mm */
  startTime: string;
  /** HH:mm */
  endTime: string;
};

type BookingState = {
  /** Slug of the product being purchased. */
  productSlug: string | null;
  /** Picked day, YYYY-MM-DD. */
  selectedDate: string | null;
  /** Picked time slot. */
  selectedSlot: SlotSelection | null;
  setProduct: (productSlug: string) => void;
  selectDay: (date: string) => void;
  selectSlot: (slot: SlotSelection) => void;
  clearSelection: () => void;
};

/**
 * Persistent state of the booking flow so the user can go back and forth
 * between steps without losing the product or appointment they chose.
 */
export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      productSlug: null,
      selectedDate: null,
      selectedSlot: null,
      setProduct: (productSlug) => set({ productSlug }),
      selectDay: (date) => set({ selectedDate: date, selectedSlot: null }),
      selectSlot: (slot) => set({ selectedSlot: slot }),
      clearSelection: () => set({ selectedDate: null, selectedSlot: null }),
    }),
    // Hydration is triggered manually on the client to avoid SSR mismatch.
    { name: "booking-store", skipHydration: true }
  )
);
