
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStudentGroupChallengeLiveStateAction } from "@/actions/student/group-challenge-live";

type LiveState = Awaited<
  ReturnType<typeof getStudentGroupChallengeLiveStateAction>
>;

type HookState = {
  challengeId: string;
  data: LiveState | null;
  isLoading: boolean;
  error: string | null;
};

export function useGroupChallengeRealtime(
  challengeId: string,
  interval = 2000
) {
  const [state, setState] = useState<HookState>({
    challengeId,
    data: null,
    isLoading: true,
    error: null,
  });

  // Shared lock between polling and manual refresh.
  // Store the challenge ID to avoid blocking a new challenge
  // while an old challenge request is still running.
  const busyChallengeRef = useRef<string | null>(null);

  const mountedRef = useRef(false);
  const activeChallengeRef = useRef(challengeId);

  const refresh = useCallback(async () => {
    if (!challengeId) return;

    if (busyChallengeRef.current === challengeId) {
      return;
    }

    busyChallengeRef.current = challengeId;

    try {
      const result =
        await getStudentGroupChallengeLiveStateAction(challengeId);

      if (
        mountedRef.current &&
        activeChallengeRef.current === challengeId
      ) {
        setState({
          challengeId,
          data: result,
          isLoading: false,
          error: null,
        });
      }
    } catch (cause) {
      if (
        mountedRef.current &&
        activeChallengeRef.current === challengeId
      ) {
        setState({
          challengeId,
          data: null,
          isLoading: false,
          error:
            cause instanceof Error
              ? cause.message
              : "حدث خطأ أثناء تحديث بيانات التحدي.",
        });
      }
    } finally {
      if (busyChallengeRef.current === challengeId) {
        busyChallengeRef.current = null;
      }
    }
  }, [challengeId]);

useEffect(() => {
  mountedRef.current = true;
  activeChallengeRef.current = challengeId;

  // Defer the initial request outside the effect execution.
  const initialRequest = window.setTimeout(() => {
    void refresh();
  }, 0);

  const timer = window.setInterval(() => {
    void refresh();
  }, interval);

  return () => {
    mountedRef.current = false;

    window.clearTimeout(initialRequest);
    window.clearInterval(timer);
  };
}, [challengeId, interval, refresh]);
  // Only expose state belonging to the current challenge.
  const isCurrentChallenge = state.challengeId === challengeId;

  return {
    data: isCurrentChallenge ? state.data : null,
    isLoading: !isCurrentChallenge || state.isLoading,
    error: isCurrentChallenge ? state.error : null,
    refresh,
  };
}
