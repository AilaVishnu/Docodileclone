import { useEffect, useState } from "react";
import { listDirectory, dtoToBody } from "../api/directory";

// The clinic's referral doctors from the Catalog directory — feeds the Rx pad's
// "Referred by" picker. Name + specialty (the directory entry's subtitle).
export type ReferralDoctor = { id: string; name: string; specialty?: string };

export function useReferralDoctors(): ReferralDoctor[] {
  const [list, setList] = useState<ReferralDoctor[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dtos = await listDirectory("Referral doctors");
        if (cancelled) return;
        setList(dtos.map((d) => {
          const b = dtoToBody(d);
          return { id: b.id, name: b.name, specialty: b.subtitle };
        }));
      } catch {
        /* leave empty — the picker just shows "add them in Catalog" */
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return list;
}
