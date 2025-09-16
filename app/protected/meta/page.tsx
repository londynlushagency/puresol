"use client";

import { useTransition, useEffect } from "react";
// import { scaleAdSetsByROAS } from "@/lib/meta/api/scaleAdSetsByROAS";
import { readCampaigns } from "@/lib/meta/api/scaleCampaign";

export default function MetaPage() {
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    readCampaigns();
  }, []);

  return (
    <div>
      {/* <button
        onClick={() =>
          startTransition(() => scaleAdSetsByROAS(2.0, 5.0, 1.2))
        }
        disabled={isPending}
      >
        {isPending ? "Scaling..." : "Scale Ad Sets"}
      </button> */}
    </div>
  );
}