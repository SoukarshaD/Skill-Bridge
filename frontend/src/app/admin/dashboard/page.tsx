"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { GraduationCap, Briefcase, FileText, CheckCircle2, Users } from "lucide-react";

interface FunnelData {
  stage: string;
  count: number;
}

interface OutcomeData {
  department: string;
  offered: number;
  accepted: number;
}

interface DemandData {
  skillName: string;
  count: number;
  avgRequiredProficiency: number;
}

interface SkillGapData {
  skillName: string;
  required: number;
  studentAvg: number;
}

interface ReadinessData {
  readinessPercentage: number;
  readyStudents: number;
  totalStudents: number;
}

export default function AdminDashboardPage() {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [outcomesData, setOutcomesData] = useState<OutcomeData[]>([]);
  const [demandData, setDemandData] = useState<DemandData[]>([]);
  const [skillGapsData, setSkillGapsData] = useState<SkillGapData[]>([]);
  const [readinessData, setReadinessData] = useState<ReadinessData | null>(null);
  const [academicianData, setAcademicianData] = useState<any>(null);
  const [demandScope, setDemandScope] = useState("current");
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [f, o, d, gaps, ready, acad] = await Promise.all([
          api.get<any>("/analytics/institution/funnel"),
          api.get<any>("/analytics/institution/outcomes"),
          api.get<any>(`/analytics/institution/demand?scope=${demandScope}`),
          api.get<any>("/analytics/institution/skill-gaps"),
          api.get<any>("/analytics/institution/readiness"),
          api.get<any>("/analytics/institution/academicians"),
        ]);

        setFunnelData([
          { stage: "Applied", count: f.APPLIED },
          { stage: "Shortlisted", count: f.SHORTLISTED },
          { stage: "Interview", count: f.INTERVIEW },
          { stage: "Offered", count: f.OFFERED },
          { stage: "Accepted", count: f.ACCEPTED },
        ]);

        setOutcomesData(o);
        setDemandData(d);
        setSkillGapsData(gaps);
        setReadinessData(ready);
        setAcademicianData(acad);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [demandScope]);

  // Premium SaaS Color Palette
  const CHART_COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];
  const OFFERED_COLOR = '#94A3B8'; // Slate 400
  const ACCEPTED_COLOR = '#10B981'; // Emerald 500
  const RADAR_PRIMARY = '#4F46E5';
  const RADAR_SECONDARY = '#F59E0B'; // Amber 500

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground border border-border/50 shadow-md rounded-md p-3 text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground border border-border/50 shadow-md rounded-md p-3 text-sm">
          <p className="font-semibold mb-1">{data.skillName}</p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Required:</span>
            <span className="font-medium">{data.count} times</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Avg. Lvl:</span>
            <span className="font-medium">{data.avgRequiredProficiency.toFixed(1)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Institution Analytics</h1>
            <p className="text-muted-foreground mt-2 text-base">
              Real-time insights into student readiness, skill gaps, and placement outcomes.
            </p>
          </div>

          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Placement Readiness</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "-" : `${readinessData?.readinessPercentage.toFixed(1)}%`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {loading ? "-" : `${readinessData?.readyStudents} out of ${readinessData?.totalStudents} students`}
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-border/50 bg-green-500/5 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-500">Accepted Offers</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-500">
                  {loading ? "-" : funnelData.find(f => f.stage === "Accepted")?.count || 0}
                </div>
                <p className="text-xs text-green-700/70 dark:text-green-500/70 mt-1">
                  Successfully placed students
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "-" : funnelData.find(f => f.stage === "Applied")?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All-time student submissions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Opportunities</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* Derived dynamically or stubbed for UX placeholder since we don't fetch opp total here */}
                  {loading ? "-" : (demandData.reduce((acc, curr) => acc + curr.count, 0) || "N/A")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Skill demand frequency
                </p>
              </CardContent>
            </Card>

            
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Academician Engagements</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "-" : academicianData?.totalProposals + academicianData?.fdpRegistrations || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Collaborations & Program participations
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Funnel */}
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Placement Funnel</CardTitle>
                <CardDescription>Pipeline conversion across all applications</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pb-4">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="stage" type="category" width={85} tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                      <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Department Outcomes */}
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Department Outcomes</CardTitle>
                <CardDescription>Offers vs Acceptances by department</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pb-4">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Loading...</div>
                ) : outcomesData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No outcomes recorded yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={outcomesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="department" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                      <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} iconType="circle" />
                      <Bar dataKey="offered" name="Offered" fill={OFFERED_COLOR} radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar dataKey="accepted" name="Accepted" fill={ACCEPTED_COLOR} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Skill Gap Analysis */}
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Skill Gap Analysis</CardTitle>
                <CardDescription>Industry requirements vs Student average</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Loading...</div>
                ) : skillGapsData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No gap data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillGapsData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skillName" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <Radar name="Industry Required" dataKey="required" stroke={RADAR_PRIMARY} fill={RADAR_PRIMARY} fillOpacity={0.4} strokeWidth={2} />
                      <Radar name="Student Average" dataKey="studentAvg" stroke={RADAR_SECONDARY} fill={RADAR_SECONDARY} fillOpacity={0.4} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} iconType="circle" />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Industry Demand */}
            <Card className="shadow-sm border-border/50 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Industry Demand</CardTitle>
                  <CardDescription>Top required skills globally</CardDescription>
                </div>
                <Select value={demandScope} onValueChange={setDemandScope}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current" className="text-xs">Current (Active)</SelectItem>
                    <SelectItem value="historical" className="text-xs">Historical (All)</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="h-[350px] flex-1">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Loading...</div>
                ) : demandData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No demand data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demandData}
                        dataKey="count"
                        nameKey="skillName"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        label={({ name, percent }) => percent !== undefined && percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
                        labelLine={false}
                      >
                        {demandData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
