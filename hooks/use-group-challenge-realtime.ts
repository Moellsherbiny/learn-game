
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getStudentGroupChallengeLiveStateAction,
} from "@/actions/student/group-challenge-live";

type ChallengeLiveState = Awaited<
  ReturnType<typeof getStudentGroupChallengeLiveStateAction>
>;

export function useGroupChallengeRealtime(
  challengeId: string,
  interval = 2000
) {
  const [data, setData] = useState<ChallengeLiveState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestInProgress = useRef(false);
  const mounted = useRef(false);

  const fetchState = useCallback(async () => {
    if (!challengeId || requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;

    try {
      const result =
        await getStudentGroupChallengeLiveStateAction(challengeId);

      if (mounted.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mounted.current) {
        setError(
          err instanceof Error
            ? err.message
            : "حدث خطأ أثناء تحديث بيانات التحدي."
        );
      }
    } finally {
      requestInProgress.current = false;

      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [challengeId]);

  useEffect(() => {
    mounted.current = true;

    const initialRequest = setTimeout(() => {
      void fetchState();
    }, 0);

    const timer = setInterval(() => {
      void fetchState();
    }, interval);

    return () => {
      mounted.current = false;
      clearTimeout(initialRequest);
      clearInterval(timer);
    };
  }, [fetchState, interval]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchState,
  };
}
