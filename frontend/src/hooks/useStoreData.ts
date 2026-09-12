import { useMemo } from "react";
import { api } from "../lib/api";
import type { Product, Sale } from "../lib/types";
import { useAsync } from "./useAsync";

export interface StoreData {
  products: Product[];
  sales: Sale[];
}

/** Products and sales are needed together on nearly every page. */
export function useStoreData() {
  const result = useAsync<StoreData>(async () => {
    const [products, sales] = await Promise.all([api.listProducts(), api.listSales()]);
    return { products, sales };
  });

  const productsById = useMemo(
    () => new Map((result.data?.products ?? []).map((product) => [product.id, product])),
    [result.data],
  );

  return { ...result, productsById };
}
