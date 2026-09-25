"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "ACADEMICIAN", "INDUSTRY", "ADMIN"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "STUDENT",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError("");

      const result = await api.post<any>("/auth/register", data);
      
      login(result.user);
      router.push(`/${result.user.role.toLowerCase()}/dashboard`);
    } catch (_err: any) {
      if (_err.errors && Array.isArray(_err.errors) && _err.errors.length > 0) {
        setError(_err.errors[0].message || "Registration failed. Please check your inputs.");
      } else {
        setError(_err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 py-10 px-4">
      <Card className="w-full max-w-lg my-8 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create your SkillBridge account</CardTitle>
          <CardDescription>
            Join SkillBridge
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label>Choose your role</Label>
              <p className="text-xs text-muted-foreground mb-4">Your role determines the dashboards and tools available to you.</p>
              
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full h-auto py-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACADEMICIAN" className="py-3 cursor-pointer items-start">
                        <div className="font-medium text-left">Training Provider</div>
                        <div className="text-xs text-muted-foreground text-left mt-1 whitespace-normal">Manage training programs, skill gaps and curriculum alignment.</div>
                      </SelectItem>
                      <SelectItem value="INDUSTRY" className="py-3 cursor-pointer items-start">
                        <div className="font-medium text-left">Industry / Employer</div>
                        <div className="text-xs text-muted-foreground text-left mt-1 whitespace-normal">Share industry demand and validate skills and training programs.</div>
                      </SelectItem>
                      <SelectItem value="ADMIN" className="py-3 cursor-pointer items-start">
                        <div className="font-medium text-left">Government / Scheme Administrator</div>
                        <div className="text-xs text-muted-foreground text-left mt-1 whitespace-normal">Analyze district intelligence and generate evidence-based training plans.</div>
                      </SelectItem>
                      <SelectItem value="STUDENT" className="py-3 cursor-pointer items-start">
                        <div className="font-medium text-left">Trainee / Candidate</div>
                        <div className="text-xs text-muted-foreground text-left mt-1 whitespace-normal">Explore skills, training programs and career information.</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-primary">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
