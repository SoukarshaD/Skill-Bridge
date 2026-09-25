"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { Sparkles, UserCircle, LogOut, ChevronDown, GraduationCap, Building2, BookOpen, BarChart4, Menu } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
    <>
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <div className="lg:hidden ml-2 flex items-center">
               <MobileNav user={user} logout={logout} />
            </div>
          )}

          {user && (
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {user.role === "STUDENT" && (
                <>
                  <NavLink href="/student/dashboard" active={isActive("/student/dashboard")}>Dashboard</NavLink>
                  <NavLink href="/student/assessment" active={isActive("/student/assessment")}>Skill Gaps</NavLink>
                  <NavLink href="/student/programs" active={isActive("/student/programs")}>Programs</NavLink>
                  <NavLink href="/student/learning" active={isActive("/student/learning")}>Learning</NavLink>
                  <NavLink href="/student/career" active={isActive("/student/career")}>Career Pathways</NavLink>
                  <DesktopMoreMenu items={[
                    { href: "/student/opportunities/browse", label: "Opportunities" },
                    { href: "/student/internships", label: "Internships" },
                    { href: "/student/mentorship", label: "Mentorship" },
                    { href: "/student/challenges", label: "Challenges" },
                    { href: "/student/projects", label: "Live Projects" },
                    { href: "/student/portfolio", label: "Portfolio" }
                  ]} />
                </>
              )}
              {user.role === "ACADEMICIAN" && (
                <>
                  <NavLink href="/academician/dashboard" active={isActive("/academician/dashboard")}>Dashboard</NavLink>
                  <NavLink href="/academician/programs" active={isActive("/academician/programs")}>Programs</NavLink>
                  <NavLink href="/academician/collaborations" active={isActive("/academician/collaborations")}>Program Alignment</NavLink>
                  <DesktopMoreMenu items={[
                    { href: "/academician/opportunities", label: "Opportunities" }
                  ]} />
                </>
              )}
              {user.role === "INDUSTRY" && (
                <>
                  <NavLink href="/industry/dashboard" active={isActive("/industry/dashboard")}>Demand Intelligence</NavLink>
                  <NavLink href="/industry/collaborations" active={isActive("/industry/collaborations")}>Curriculum Validation</NavLink>
                  <NavLink href="/industry/programs" active={isActive("/industry/programs")}>Employer Validation</NavLink>
                  <DesktopMoreMenu items={[
                    { href: "/industry/opportunities", label: "Opportunities" },
                    { href: "/industry/internships", label: "Internships" },
                    { href: "/industry/academicians", label: "Experts" }
                  ]} />
                </>
              )}
              {user.role === "ADMIN" && (
                <>
                  <NavLink href="/admin/dashboard" active={isActive("/admin/dashboard")}>Dashboard</NavLink>
                  <NavLink href="/admin/lmi/district-plans" active={isActive("/admin/lmi/district-plans")}>District Intelligence</NavLink>
                  <NavLink href="/admin/lmi/skill-gaps" active={isActive("/admin/lmi/skill-gaps")}>Skill Gaps</NavLink>
                  <NavLink href="/admin/lmi/review-flags" active={isActive("/admin/lmi/review-flags")}>Curriculum Review</NavLink>
                  <DesktopMoreMenu items={[
                    { href: "/admin/skills", label: "Skills Matrix" },
                    { href: "/admin/certifications", label: "Certifications" },
                    { href: "/admin/lmi/employer-validation", label: "Employer Validation" }
                  ]} />
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
                      <span className="text-xs text-muted-foreground mt-1 capitalize">
                        {user.role === "ACADEMICIAN" ? "Training Provider" : 
                         user.role === "INDUSTRY" ? "Industry / Employer" : 
                         user.role === "ADMIN" ? "Scheme Admin" : 
                         "Trainee"}
                      </span>
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
    <div className="h-16 w-full shrink-0" />
    </>
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

function DesktopMoreMenu({ items }: { items: {href: string, label: string}[] }) {
  if (items.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn("px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground flex items-center gap-1 focus:outline-none")}>
        More <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map(item => (
          <DropdownMenuItem key={item.href} render={<Link href={item.href} className="cursor-pointer w-full" />}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav({ user, logout }: { user: any, logout: () => void }) {
  const pathname = usePathname();

  const getMainLinks = () => {
    switch(user.role) {
      case "STUDENT": return [
        { href: "/student/dashboard", label: "Dashboard" },
        { href: "/student/assessment", label: "Skill Gaps" },
        { href: "/student/programs", label: "Programs" },
        { href: "/student/learning", label: "Learning" },
        { href: "/student/career", label: "Career Pathways" },
      ];
      case "ACADEMICIAN": return [
        { href: "/academician/dashboard", label: "Dashboard" },
        { href: "/academician/programs", label: "Programs" },
        { href: "/academician/collaborations", label: "Program Alignment" },
      ];
      case "INDUSTRY": return [
        { href: "/industry/dashboard", label: "Demand Intelligence" },
        { href: "/industry/collaborations", label: "Curriculum Validation" },
        { href: "/industry/programs", label: "Employer Validation" },
      ];
      case "ADMIN": return [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/lmi/district-plans", label: "District Intelligence" },
        { href: "/admin/lmi/skill-gaps", label: "Skill Gaps" },
        { href: "/admin/lmi/review-flags", label: "Curriculum Review" },
      ];
      default: return [];
    }
  };

  const getMoreLinks = () => {
    switch(user.role) {
      case "STUDENT": return [
        { href: "/student/opportunities/browse", label: "Opportunities" },
        { href: "/student/internships", label: "Internships" },
        { href: "/student/mentorship", label: "Mentorship" },
        { href: "/student/challenges", label: "Challenges" },
        { href: "/student/projects", label: "Live Projects" },
        { href: "/student/portfolio", label: "Portfolio" },
      ];
      case "ACADEMICIAN": return [
        { href: "/academician/opportunities", label: "Opportunities" },
      ];
      case "INDUSTRY": return [
        { href: "/industry/opportunities", label: "Opportunities" },
        { href: "/industry/internships", label: "Internships" },
        { href: "/industry/academicians", label: "Experts" },
      ];
      case "ADMIN": return [
        { href: "/admin/skills", label: "Skills Matrix" },
        { href: "/admin/certifications", label: "Certifications" },
        { href: "/admin/lmi/employer-validation", label: "Employer Validation" },
      ];
      default: return [];
    }
  };

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden text-foreground hover:bg-muted/50" />}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="mb-6 mt-4 text-left">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            SkillBridge
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-8 mt-4">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Core</h4>
            {getMainLinks().map(link => (
              <SheetTrigger key={link.href} render={<Link href={link.href} className="text-sm font-medium py-2 px-3 rounded-md hover:bg-muted transition-colors" />}>
                {link.label}
              </SheetTrigger>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">More</h4>
            {getMoreLinks().map(link => (
              <SheetTrigger key={link.href} render={<Link href={link.href} className="text-sm font-medium py-2 px-3 rounded-md hover:bg-muted transition-colors" />}>
                {link.label}
              </SheetTrigger>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t pt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</h4>
            <SheetTrigger render={<Link href={`/${user.role.toLowerCase()}/profile`} className="text-sm font-medium py-2 px-3 rounded-md hover:bg-muted transition-colors" />}>
              Profile Settings
            </SheetTrigger>
            <SheetTrigger render={<button onClick={() => logout()} className="text-sm font-medium py-2 px-3 rounded-md text-left text-destructive hover:bg-destructive/10 transition-colors" />}>
              Log out
            </SheetTrigger>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
