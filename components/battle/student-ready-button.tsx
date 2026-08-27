"use client";

import { useState } from "react";

import { setBattleReadyAction } from "@/actions/battle/invitation";

import { Button } from "@/components/ui/button";

interface Props {
  battleId: string;
  initialReady?: boolean;
}

export function StudentReadyButton({
  battleId,
  initialReady = false,
}: Props) {
  const [ready, setReady] =
    useState(initialReady);

  const [loading, setLoading] =
    useState(false);

  async function handleReady() {
    if (loading) return;

    setLoading(true);

    try {
      const result =
        await setBattleReadyAction(
          battleId,
          true,
        );

      if (!result.success) {
        console.error(
          result.error,
        );

        return;
      }

      setReady(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      disabled={loading || ready}
      onClick={handleReady}
      className="min-w-32"
    >
      {loading
        ? "جارٍ التأكيد..."
        : ready
          ? "✓ أنت جاهز"
          : "أنا جاهز"}
    </Button>
  );
}