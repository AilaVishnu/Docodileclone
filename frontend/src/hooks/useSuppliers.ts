import { useEffect, useState } from "react";
import { listDirectory, dtoToBody } from "../api/directory";

// Supplier names from the Catalog "Suppliers" directory — feeds the Add Stock
// supplier picker so procurement is recorded against a known supplier.
export function useSuppliers(): string[] {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dtos = await listDirectory("Suppliers");
        if (cancelled) return;
        setList(dtos.map((d) => dtoToBody(d).name).filter(Boolean));
      } catch {
        /* leave empty — the picker just has no options until suppliers are added */
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return list;
}
