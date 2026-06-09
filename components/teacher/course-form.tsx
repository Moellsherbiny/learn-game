"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { createCourse } from "@/actions/teacher/create-course";
import { uploadToCloudinary } from "@/actions/cloudinary";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CourseForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [preview, setPreview] = useState("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة فقط.");
      return;
    }

    // التحقق من الحجم (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب ألا يتجاوز 5MB.");
      return;
    }

    setSelectedFile(file);

    // إنشاء معاينة للصورة
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreview("");
    setThumbnail("");
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        let uploadedThumbnail = thumbnail;

        // رفع الصورة إلى Cloudinary إذا تم اختيار ملف
        if (selectedFile) {
          toast.loading("جاري رفع الصورة...", {
            id: "upload-image",
          });

          uploadedThumbnail = await uploadToCloudinary(
            selectedFile
          );

          toast.success("تم رفع الصورة بنجاح.", {
            id: "upload-image",
          });
        }

        // إنشاء الدورة التعليمية
        await createCourse({
          title,
          description,
          thumbnail: uploadedThumbnail,
        });

        // في حال لم يتم redirect
        router.refresh();
      } catch (error) {
        toast.dismiss("upload-image");

        const message =
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إنشاء الدورة التعليمية.";

        toast.error(message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">عنوان الدورة التعليمية</Label>
        <div className="relative">
          <BookOpen className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="تعلم البرمجة بلغة JavaScript"
            className="rounded-2xl pr-10"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">وصف الدورة التعليمية</Label>
        <div className="relative">
          <FileText className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر عن أهداف الدورة التعليمية وما سيتعلمه الطلاب."
            rows={5}
            className="rounded-2xl pr-10"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <Label htmlFor="thumbnail">صورة الدورة التعليمية</Label>

        {!preview ? (
          <label
            htmlFor="thumbnail"
            className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition hover:bg-muted/50"
          >
            <div className="mb-4 rounded-2xl bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>

            <h3 className="text-lg font-bold">
              اختر صورة للدورة التعليمية
            </h3>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              PNG, JPG, WEBP حتى 5MB
            </p>

            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border">
            <img
              src={preview}
              alt="Preview"
              className="h-64 w-full object-cover"
            />

            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute left-4 top-4 rounded-full"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4">
              <p className="text-sm font-medium text-white">
                سيتم رفع هذه الصورة إلى Cloudinary
              </p>
            </div>
          </div>
        )}

        {/* Hidden URL Field */}
        <Input
          type="hidden"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-2xl bg-linear-to-r from-primary to-accent font-bold text-white shadow-lg"
      >
        {isPending ? (
          <>
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            جاري إنشاء الدورة التعليمية...
          </>
        ) : (
          <>
            <Sparkles className="ml-2 h-5 w-5" />
            إنشاء الدورة التعليمية
          </>
        )}
      </Button>
    </form>
  );
}