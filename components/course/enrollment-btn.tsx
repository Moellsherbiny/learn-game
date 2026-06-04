"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { enrollInCourse } from "@/actions/courses/enroll-in-course";

interface EnrollButtonProps {
  courseId: string;
}

export default function EnrollButton({
  courseId,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEnroll = () => {
    startTransition(async () => {
      try {
        const result = await enrollInCourse(courseId);

        toast.success(result.message);
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء التسجيل.";

        toast.error(message);
      }
    });
  };

  return (
    <Button
      size="lg"
      onClick={handleEnroll}
      disabled={isPending}
      className="w-full rounded-2xl"
    >
      {isPending ? (
        <>
          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
          جاري التسجيل...
        </>
      ) : (
        <>
          <Rocket className="ml-2 h-5 w-5" />
          التسجيل في الكورس
        </>
      )}
    </Button>
  );
}