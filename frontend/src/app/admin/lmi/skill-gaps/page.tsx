"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Cell
} from "recharts";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkillGapData {
  skillId: string;
  skillName: string;
  category: string;
  domain: string;
  demandScore: number;
  demandSignalCount: number;
  supplyScore: number;
  supplyProgramCount: number;
  gapScore: number;
  gapClassification: string;
  confidence: string;
  roleId: string | null;
  location: string;
  methodology: any;
}

export default function LMISkillGapsPage() {
  const [data, setData] = useState<SkillGapData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [locationFilter, setLocationFilter] = useState("");
  const [roleIdFilter, setRoleIdFilter] = useState("");
  const [gapFilter, setGapFilter] = useState("");
  
  const fetchGaps = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (locationFilter) query.append("location", locationFilter);
      if (roleIdFilter) query.append("roleId", roleIdFilter);
      if (gapFilter) query.append("gapClassification", gapFilter);

      const res = await api.get<{ skillGaps: SkillGapData[] }>(`/lmi/skill-gaps?${query.toString()}`);
      setData(res.skillGaps || []);
    } catch (err) {
      console.error("Failed to fetch skill gaps", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, []);

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'HIGH GAP': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'MODERATE GAP': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'BALANCED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'HIGH SUPPLY': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'HIGH GAP': return <TrendingUp className="w-4 h-4 mr-1" />;
      case 'MODERATE GAP': return <TrendingUp className="w-4 h-4 mr-1" />;
      case 'BALANCED': return <Minus className="w-4 h-4 mr-1" />;
      case 'HIGH SUPPLY': return <TrendingDown className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'bg-emerald-500/10 text-emerald-600';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-600';
      case 'LOW': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Top 10 for charts
  const chartData = data.slice(0, 10).map(item => ({
    name: item.skillName,
    Demand: item.demandScore,
    Supply: item.supplyScore,
    Gap: item.gapScore,
  }));

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "INDUSTRY"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Labour Market Intelligence</h1>
              <p className="text-muted-foreground mt-2 text-base max-w-2xl">
                Derived skill gap analysis based on observed platform demand signals versus active training supply coverage. 
                <span className="block mt-1 text-xs italic text-muted-foreground">
                  * Note: This is platform-derived intelligence, not official national market statistics.
                </span>
              </p>
            </div>
            
            <div className="flex gap-2 items-center flex-wrap">
              <Input 
                placeholder="Filter by Location (e.g., Mumbai)" 
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full md:w-[200px]"
              />
              <select 
                className="flex h-10 w-full md:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={gapFilter}
                onChange={e => setGapFilter(e.target.value)}
              >
                <option value="">All Classifications</option>
                <option value="HIGH GAP">High Gap</option>
                <option value="MODERATE GAP">Moderate Gap</option>
                <option value="BALANCED">Balanced</option>
                <option value="HIGH SUPPLY">High Supply</option>
              </select>
              <Button onClick={fetchGaps} disabled={loading} className="w-full md:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            </div>
          </div>

          <div className="grid gap-6 mb-8">
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Derived Skill Gaps (Top 10)</CardTitle>
                <CardDescription>Visual comparison of derived Demand vs Training Supply.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Calculating Intelligence...</div>
                ) : chartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data available for the selected filters.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="Demand" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Supply" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Detailed Intelligence Report</CardTitle>
                <CardDescription>Comprehensive breakdown of derived gaps and signal provenance.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Canonical Skill</TableHead>
                        <TableHead>Demand Score</TableHead>
                        <TableHead>Training Supply</TableHead>
                        <TableHead>Gap Score</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Loading intelligence...
                          </TableCell>
                        </TableRow>
                      ) : data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No skill gap data found. Try adjusting filters or ingesting more demand signals.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((row) => (
                          <TableRow key={row.skillId}>
                            <TableCell className="font-medium">
                              {row.skillName}
                              <div className="text-xs text-muted-foreground mt-0.5">{row.category}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">{row.demandScore}</div>
                              <div className="text-xs text-muted-foreground">{row.demandSignalCount} signals</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">{row.supplyScore}</div>
                              <div className="text-xs text-muted-foreground">{row.supplyProgramCount} programs</div>
                            </TableCell>
                            <TableCell>
                              <span className={`font-bold ${row.gapScore > 0 ? 'text-destructive' : row.gapScore < 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                {row.gapScore > 0 ? '+' : ''}{row.gapScore}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`whitespace-nowrap ${getClassificationColor(row.gapClassification)}`}>
                                {getClassificationIcon(row.gapClassification)}
                                {row.gapClassification}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`whitespace-nowrap ${getConfidenceColor(row.confidence)}`}>
                                {row.confidence}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-[300px] p-4 text-sm leading-relaxed">
                                    <p className="font-bold mb-2">Explainability Report</p>
                                    <p><strong>Demand:</strong> Derived from {row.demandSignalCount} platform signals. Recent signals are weighted 1.0, older &gt;90d weighted 0.5.</p>
                                    <p className="mt-2"><strong>Supply:</strong> Derived from {row.supplyProgramCount} training vehicles (Programs=1.0, Resources=0.5).</p>
                                    <p className="mt-2 text-xs italic opacity-80">This data represents localized platform ingestion, not official statistical records.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
