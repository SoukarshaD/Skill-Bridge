"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { Sparkles, UserCircle, LogOut, ChevronDown, GraduationCap, Building2, BookOpen, BarChart4 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  const getRoleIcon = () => {
    switch(user?.role) {
      case "STUDENT": return <GraduationCap className="h-4 w-4 mr-2 text-primary" />;
      case "INDUSTRY": return <Building2 className="h-4 w-4 mr-2 text-blue-500" />;
      case "ACADEMICIAN": return <BookOpen className="h-4 w-4 mr-2 text-purple-500" />;
      case "ADMIN": return <BarChart4 className="h-4 w-4 mr-2 text-amber-500" />;
      default: return <UserCircle className="h-4 w-4 mr-2" />;
    }
  };

  const getRoleColorClass = () => {
    switch(user?.role) {
      case "STUDENT": return "bg-primary/10 text-primary";
      case "INDUSTRY": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "ACADEMICIAN": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "ADMIN": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Logo & Primary Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline-block">SkillBridge</span>
          </Link>

          {user && (
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {user.role === "STUDENT" && (
                <>
                  <NavLink href="/student/dashboard" active={isActive("/student/dashboard")}>Dashboard</NavLink>
                  <NavLink href="/student/opportunities/browse" active={isActive("/student/opportunities/browse")}>Browse</NavLink>
                  <NavLink href="/student/opportunities" active={isActive("/student/opportunities") && !isActive("/student/opportunities/browse")}>Matches</NavLink>
                  <NavLink href="/student/applications" active={isActive("/student/applications")}>Applications</NavLink>
                  <NavLink href="/student/mentorship" active={isActive("/student/mentorship")}>Mentorship</NavLink>
                  <NavLink href="/student/programs" active={isActive("/student/programs")}>Programs</NavLink>
                  <NavLink href="/student/challenges" active={isActive("/student/challenges")}>Challenges</NavLink>
                  <NavLink href="/student/projects" active={isActive("/student/projects")}>Live Projects</NavLink>
                  <NavLink href="/student/career" active={isActive("/student/career")}>Career Pathway</NavLink>
                  <NavLink href="/student/certifications" active={isActive("/student/certifications")}>Certificates</NavLink>
                  <NavLink href="/student/internships" active={isActive("/student/internships")}>Internships</NavLink>
                  <NavLink href="/student/assessment" active={isActive("/student/assessment")}>Assessments</NavLink>
                  <NavLink href="/student/learning" active={isActive("/student/learning")}>Learning</NavLink>
                  <NavLink href="/student/documents" active={isActive("/student/documents")}>Documents</NavLink>
                  <NavLink href="/student/portfolio" active={isActive("/student/portfolio")}>Portfolio</NavLink>
                  <NavLink href="/student/profile" active={isActive("/student/profile")}>Profile</NavLink>
                </>
              )}
              {user.role === "ACADEMICIAN" && (
                <>
                  <NavLink href="/academician/dashboard" active={isActive("/academician/dashboard")}>Dashboard</NavLink>
                  <NavLink href="/academician/opportunities" active={isActive("/academician/opportunities")}>Opportunities</NavLink>
                  <NavLink href="/academician/applications" active={isActive("/academician/applications")}>Applications</NavLink>
                  <NavLink href="/academician/programs" active={isActive("/academician/programs")}>Programs</NavLink>
                  <NavLink href="/academician/collaborations" active={isActive("/academician/collaborations")}>Proposals</NavLink>
                  <NavLink href="/academician/profile" active={isActive("/academician/profile")}>Profile</NavLink>
                </>
              )}
              {user.role === "INDUSTRY" && (
                <>
                  <NavLink href="/industry/dashboard" active={isActive("/industry/dashboard")}>Dashboard</NavLink>
                  <NavLink href="/industry/opportunities" active={isActive("/industry/opportunities")}>Pipeline</NavLink>
                  <NavLink href="/industry/internships" active={isActive("/industry/internships")}>Internships</NavLink>
                  <NavLink href="/industry/collaborations" active={isActive("/industry/collaborations")}>Proposals</NavLink>
                  <NavLink href="/industry/programs" active={isActive("/industry/programs")}>Programs</NavLink>
                  <NavLink href="/industry/mentorship" active={isActive("/industry/mentorship")}>Mentorship</NavLink>
                  <NavLink href="/industry/academicians" active={isActive("/industry/academicians")}>Experts</NavLink>
                  <NavLink href="/industry/opportunities" active={isActive("/industry/opportunities") && pathname?.includes('challenge')}>Challenges</NavLink>
                  <NavLink href="/industry/opportunities" active={isActive("/industry/opportunities") && pathname?.includes('project')}>Live Projects</NavLink>
                  <NavLink href="/industry/learning" active={isActive("/industry/learning")}>Learning</NavLink>
                  <NavLink href="/industry/profile" active={isActive("/industry/profile")}>Profile</NavLink>
                </>
              )}
              {user.role === "ADMIN" && (
                <>
                  <NavLink href="/admin/dashboard" active={isActive("/admin/dashboard")}>Dashboard</NavLink>
                  <NavLink href="/admin/skills" active={isActive("/admin/skills")}>Skills Matrix</NavLink>
                  <NavLink href="/admin/certifications" active={isActive("/admin/certifications")}>Certifications</NavLink>
                  <NavLink href="/admin/profile" active={isActive("/admin/profile")}>Institution</NavLink>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationsDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger className={cn("h-9 px-2 flex items-center gap-2 hover:bg-muted/50 rounded-full md:rounded-md md:px-3 focus:outline-none focus:bg-muted/50", buttonVariants({ variant: "ghost" }))}>
                    <span className="hidden md:flex flex-col items-end">
                      <span className="text-sm font-medium leading-none">{user.name}</span>
                      <span className="text-xs text-muted-foreground mt-1 capitalize">{user.role.toLowerCase()}</span>
                    </span>
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase", getRoleColorClass())}>
                      {user.name.charAt(0)}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `/${user.role.toLowerCase()}/profile`}>
                      {getRoleIcon()}
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:inline-flex")}>
                Sign In
              </Link>
              <Link href="/register" className={buttonVariants({ variant: "default", size: "sm" })}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "px-3 py-2 rounded-md text-sm transition-colors",
        active 
          ? "bg-muted text-foreground font-semibold" 
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
