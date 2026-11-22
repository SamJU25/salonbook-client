import { z } from "zod";
import { PREDEFINED_TIME_SLOTS } from "./constants";

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter");

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name cannot exceed 120 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: passwordSchema,
  image: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || val.startsWith("https://") || val.startsWith("http://"),
      "Please provide a valid image URL or upload an image"
    )
    .optional()
    .default(""),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const bookingSchema = z.object({
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid appointment date"),
  timeSlot: z.enum(PREDEFINED_TIME_SLOTS, {
    errorMap: () => ({ message: "Please select an available time slot" }),
  }),
  message: z
    .string()
    .trim()
    .max(500, "Message cannot exceed 500 characters")
    .optional()
    .default(""),
});

export const serviceFormSchema = z.object({
  serviceName: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(120, "Service name cannot exceed 120 characters"),
  category: z.string().trim().min(2, "Please select a category"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a valid number" })
    .positive("Price must be greater than 0"),
  duration: z.coerce
    .number({ invalid_type_error: "Duration must be a whole number" })
    .int("Duration must be a whole number of minutes")
    .positive("Duration must be greater than 0"),
  image: z
    .string()
    .trim()
    .min(1, "Please upload a service image"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name cannot exceed 120 characters"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .default(""),
  image: z
    .string()
    .trim()
    .refine(
      (val) =>
        val === "" ||
        val.startsWith("https://") ||
        val.startsWith("http://") ||
        val.startsWith("/images/"),
      "Please provide a valid image URL or upload an image"
    )
    .optional()
    .default(""),
});
