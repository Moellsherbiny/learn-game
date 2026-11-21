
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

type StoredState = {
  challengeId: string;
  data: ChallengeLiveState | null;
  error: string | null;
};

export function useGroupChallengeRealtime(
  challengeId: string,
  interval = 2000
) {
  const [state, setState] = useState<StoredState>({
    challengeId,
    data: null,
    error: null,
  });

  const [isLoading, setIsLoading] = useState(true);

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
        setState({
          challengeId,
          data: result,
          error: null,
        });
      }
    } catch (err) {
      if (mounted.current) {
        setState((previous) => ({
          challengeId,
          data:
            previous.challengeId === challengeId
              ? previous.data
              : null,
          error:
            err instanceof Error
              ? err.message
              : "حدث خطأ أثناء تحديث بيانات التحدي.",
        }));
      }
    } finally {
      requestInProgress.current = false;

      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [challengeId]);

  useEffect(() => {
    let active = true;

    mounted.current = true;
    requestInProgress.current = false;

    const runFetch = async () => {
      if (!active || requestInProgress.current) {
        return;
      }

      requestInProgress.current = true;

      try {
        const result =
          await getStudentGroupChallengeLiveStateAction(challengeId);

        if (active) {
          setState({
            challengeId,
            data: result,
            error: null,
          });
        }
      } catch (err) {
        if (active) {
          setState((previous) => ({
            challengeId,
            data:
              previous.challengeId === challengeId
                ? previous.data
                : null,
            error:
              err instanceof Error
                ? err.message
                : "حدث خطأ أثناء تحديث بيانات التحدي.",
          }));
        }
      } finally {
        requestInProgress.current = false;

        if (active) {
          setIsLoading(false);
        }
      }
    };

    const initialRequest = setTimeout(() => {
      void runFetch();
    }, 0);

    const timer = setInterval(() => {
      void runFetch();
    }, interval);

    return () => {
      active = false;
      mounted.current = false;

      clearTimeout(initialRequest);
      clearInterval(timer);
    };
  }, [challengeId, interval]);

  const isCurrentChallenge = state.challengeId === challengeId;

  return {
    data: isCurrentChallenge ? state.data : null,
    isLoading: isCurrentChallenge ? isLoading : true,
    error: isCurrentChallenge ? state.error : null,
    refresh: fetchState,
  };
}
