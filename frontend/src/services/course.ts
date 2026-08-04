import api from "@/lib/api";
import type { Listing } from "@/lib/admin-data";

export async function getCourses(): Promise<Listing[]> {
  const response = await api.get("/courses");
  return response.data;
}

export async function createCourse(course: Listing, file: File): Promise<Listing> {
  const formData = new FormData();
  formData.append("title", course.title);
  formData.append("tag", course.tag || "");
  formData.append("duration", course.duration || "");
  formData.append("price", String(course.price));
  formData.append("desc", course.desc || "");

  if (Array.isArray(course.items)) {
    formData.append("items", course.items.join(","));
  }

  if (file) {
    formData.append("image", file);
  }

  const response = await api.post("/courses", formData);
  return response.data;
}

export async function updateCourse(id: string, course: Partial<Listing>, file?: File): Promise<Listing> {
  const formData = new FormData();
  if (course.title !== undefined) formData.append("title", course.title);
  if (course.tag !== undefined) formData.append("tag", course.tag);
  if (course.duration !== undefined) formData.append("duration", course.duration);
  if (course.price !== undefined) formData.append("price", String(course.price));
  if (course.desc !== undefined) formData.append("desc", course.desc);
  if (course.active !== undefined) formData.append("active", String(course.active));

  if (Array.isArray(course.items)) {
    formData.append("items", course.items.join(","));
  }

  if (file) {
    formData.append("image", file);
  }

  const response = await api.put(`/courses/${id}`, formData);
  return response.data;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}