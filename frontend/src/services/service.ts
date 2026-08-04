// frontend/src/services/service.ts
import api from "@/lib/api";
import type { Listing } from "@/lib/admin-data";

export async function getServices(): Promise<Listing[]> {
  const response = await api.get("/services");
  return response.data;
}

export async function createService(service: Listing, file: File): Promise<Listing> {
  const formData = new FormData();
  formData.append("title", service.title);
  formData.append("tag", service.tag || "");
  formData.append("duration", service.duration || "");
  formData.append("price", String(service.price));
  formData.append("desc", service.desc || "");
  
  if (Array.isArray(service.items)) {
    formData.append("items", service.items.join(","));
  }

  if (file) {
    formData.append("image", file);
  }

  const response = await api.post("/services", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function updateService(id: string, service: Partial<Listing>, file?: File | null): Promise<Listing> {
  const formData = new FormData();
  if (service.title !== undefined) formData.append("title", service.title);
  if (service.tag !== undefined) formData.append("tag", service.tag);
  if (service.duration !== undefined) formData.append("duration", service.duration);
  if (service.price !== undefined) formData.append("price", String(service.price));
  if (service.desc !== undefined) formData.append("desc", service.desc);
  if (service.active !== undefined) formData.append("active", String(service.active));

  if (Array.isArray(service.items)) {
    formData.append("items", service.items.join(","));
  }

  if (file) {
    formData.append("image", file);
  }

  const response = await api.put(`/services/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function deleteService(id: string): Promise<void> {
  await api.delete(`/services/${id}`);
}