import { z } from "zod";

export const registerSchema = z.object({
    firstName: z.string().min(2, "First name too short").trim(),
    lastName: z.string().min(2, "Last name too short").trim(),
    email: z.email("Invalid email format").lowercase(),
    
    gender: z.enum(["male", "female"], {
        error: "Please select a valid gender",
    }),

    location: z.string().min(2, "Please enter your city or country").trim(),

    password: z.string().min(8, "Password must be at least 8 characters"),

    dateOfBirth: z.string()
        .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" })
        .transform((val) => new Date(val))
        .refine((date) => {
            const thirteenYearsAgo = new Date();
            thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
            return date <= thirteenYearsAgo;
        }, { message: "You must be at least 13 years old" }),
});

export type registerSchemaType = z.infer<typeof registerSchema>; 