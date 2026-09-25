"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

interface Skill {
  id: string;
  name: string;
  category: string;
  domain: string;
}

interface SelectedSkill {
  skillId: string;
  proficiency: number; // 1-5
  name?: string; // For display
}

interface SkillSelectorProps {
  initialSkills?: SelectedSkill[];
  onSkillsChange: (skills: SelectedSkill[]) => void;
}

export function SkillSelector({ initialSkills = [], onSkillsChange }: SkillSelectorProps) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await api.get<{ skills: Skill[] }>("/skills");
        if (data && data.skills) {
          setAllSkills(data.skills);
        } else if (Array.isArray(data)) {
          // Fallback if backend doesn't wrap in { skills: [] }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setAllSkills(data as any);
        }
      } catch (error) {
        console.error("Failed to fetch skills", error);
      }
    };
    fetchSkills();
  }, []);

  const handleAddSkill = (skill: Skill | undefined) => {
    if (!skill) return;
    
    if (initialSkills.some((s) => s.skillId === skill.id)) {
      return;
    }
    
    const newSelection = [...initialSkills, { skillId: skill.id, proficiency: 3, name: skill.name }];
    
    onSkillsChange(newSelection);
    setSearchTerm("");
  };

  const handleRemoveSkill = (skillId: string) => {
    const newSelection = initialSkills.filter((s) => s.skillId !== skillId);
    onSkillsChange(newSelection);
  };

  const handleProficiencyChange = (skillId: string, prof: number) => {
    const newSelection = initialSkills.map((s) => 
      s.skillId === skillId ? { ...s, proficiency: prof } : s
    );
    onSkillsChange(newSelection);
  };

  const filteredSkills = searchTerm 
    ? allSkills.filter(
        (s) => 
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !initialSkills.some((sel) => sel.skillId === s.id)
      )
    : allSkills.filter((s) => !initialSkills.some((sel) => sel.skillId === s.id)).slice(0, 20); // Show top 20 by default

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Search and Add Skills</Label>
        <Input 
          placeholder="e.g. Python, SQL..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              console.log("SKILL ADD INPUT (Enter):", searchTerm);
              if (filteredSkills.length > 0) {
                handleAddSkill(filteredSkills[0]);
              } else {
                console.log("SKILL ADD REJECTED: no matching taxonomy skill for input");
              }
            }
          }}
        />
        {isFocused && filteredSkills.length > 0 && (
          <div className="border rounded-md max-h-40 overflow-y-auto bg-background p-1 space-y-1 mt-1 shadow-sm">
            {filteredSkills.map((skill) => (
              <div 
                key={skill.id} 
                className="p-2 hover:bg-muted cursor-pointer text-sm rounded-sm"
                onClick={() => {
                  console.log("SKILL ADD INPUT (Click):", skill.name);
                  handleAddSkill(skill);
                }}
              >
                <span className="font-medium">{skill.name}</span>
                <span className="text-muted-foreground text-xs ml-2">({skill.domain})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {initialSkills.length > 0 && (
        <div className="space-y-3 mt-4 border-t pt-4">
          <Label>Your Skills & Proficiency (1-5)</Label>
          <div className="space-y-2">
            {initialSkills.map((sel) => (
              <div key={sel.skillId} className="flex items-center justify-between p-3 border rounded-md bg-card">
                <span className="font-medium text-sm flex-1">
                  {sel.name || allSkills.find((a) => a.id === sel.skillId)?.name || "Unknown"}
                </span>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleProficiencyChange(sel.skillId, num)}
                        className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                          sel.proficiency >= num 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveSkill(sel.skillId)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
