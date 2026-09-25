"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  BarChart4
} from "lucide-react";
import { cn } from "@/lib/utils";


export default function HomePage() {
  const { user, isLoading } = useAuth();

  const getDashboardLink = (role?: string) => {
    switch (role) {
      case "STUDENT": return "/student/dashboard";
      case "INDUSTRY": return "/industry/dashboard";
      case "ACADEMICIAN": return "/academician/dashboard";
      case "ADMIN": return "/admin/dashboard";
      default: return "/login";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground">
      {/* Top Navbar / Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">SkillBridge</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Ecosystem</Link>
            <Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-md"></div>
            ) : user ? (
              <Link href={getDashboardLink(user.role)} className={buttonVariants({ variant: "default", size: "sm" })}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:inline-flex")}>
                  Sign In
                </Link>
                <Link href="/register" className={buttonVariants({ variant: "default", size: "sm" })}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40 border-b border-border/50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          
          <div className="container relative mx-auto px-4 md:px-8 flex flex-col items-center text-center space-y-8 max-w-5xl">
            <Badge variant="outline" className="px-4 py-1.5 text-sm bg-primary/5 text-primary border-primary/20 rounded-full font-medium tracking-wide">
              Skill Bridge — Setu-Kaushal Platform
            </Badge>
            
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-[5rem] leading-[1.1] text-foreground">
              Bridge the Gap Between <br className="hidden md:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                Industry Demand and Skill Development
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal">
              SkillBridge aligns academic training with emerging industry requirements through intelligent skill mapping, curriculum collaboration, and data-driven gap analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              {!user ? (
                <>
                  <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base shadow-sm")}>
                    <UserPlus className="mr-2 h-5 w-5" /> Join the Platform
                  </Link>
                  <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-8 text-base bg-background shadow-sm hover:bg-muted")}>
                    <LogIn className="mr-2 h-5 w-5" /> Sign In
                  </Link>
                </>
              ) : (
                <Link href={getDashboardLink(user.role)} className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base shadow-sm")}>
                  Access your Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Roles / Ecosystem Section */}
        <section id="features" className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">One Platform. <br className="sm:hidden" /> Complete Ecosystem.</h2>
              <p className="text-lg text-muted-foreground">
                Tailored, premium experiences for every stakeholder in the educational and professional collaboration lifecycle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Student */}
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Trainee / Candidate</CardTitle>
                      <CardDescription className="text-base mt-1">Explore skills, training programs and career information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {["Dynamic skill profiling & gap analysis", "Targeted skill development programs", "Curated learning resource recommendations"].map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-muted-foreground">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-border/50">
                    <Link href={user ? getDashboardLink(user.role) : "/register"} className="text-primary text-sm font-medium hover:underline inline-flex items-center mt-4">
                      {user?.role === "STUDENT" ? "Continue to Dashboard" : "Join as Trainee / Candidate"} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Industry */}
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-500/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Industry / Employer</CardTitle>
                      <CardDescription className="text-base mt-1">Share industry demand and validate skills and training programs</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {["Publish industry skill requirements", "Validate curriculum & training programs", "Collaborate on joint skill development"].map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-muted-foreground">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-border/50">
                    <Link href={user ? getDashboardLink(user.role) : "/register"} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline inline-flex items-center mt-4">
                      {user?.role === "INDUSTRY" ? "Continue to Dashboard" : "Join as Industry / Employer"} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Academician */}
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-500/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Training Provider</CardTitle>
                      <CardDescription className="text-base mt-1">Manage training programs, skill gaps and curriculum alignment</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {["Propose curriculum alignment", "Access industry training supply", "Collaborate on joint skill development"].map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-muted-foreground">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-border/50">
                    <Link href={user ? getDashboardLink(user.role) : "/register"} className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline inline-flex items-center mt-4">
                      {user?.role === "ACADEMICIAN" ? "Continue to Dashboard" : "Join as Training Provider"} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Admin */}
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-amber-500/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <BarChart4 className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Government / Scheme Administrator</CardTitle>
                      <CardDescription className="text-base mt-1">Analyze district intelligence and generate evidence-based training plans</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {["Real-time skill gap tracking", "Curriculum alignment analytics", "Department-wise zero-filled skill gap analysis"].map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-muted-foreground">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-border/50">
                    <Link href={user ? getDashboardLink(user.role) : "/register"} className="text-amber-600 dark:text-amber-400 text-sm font-medium hover:underline inline-flex items-center mt-4">
                      {user?.role === "ADMIN" ? "Continue to Dashboard" : "Join as Scheme Administrator"} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4 md:px-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold tracking-tight text-foreground">SkillBridge</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Made by Skil Bridge
            </p>
          </div>
          <div className="flex flex-col text-sm text-muted-foreground items-center md:items-end gap-1">
            <p>&copy; {new Date().getFullYear()} Academia-Industry Portal. All rights reserved.</p>
            <p>
              Contact: <a href="mailto:dsoukarsha@gmail.com" className="hover:underline text-foreground">dsoukarsha@gmail.com</a>, <a href="mailto:dev.sayann@gmail.com" className="hover:underline text-foreground">dev.sayann@gmail.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
