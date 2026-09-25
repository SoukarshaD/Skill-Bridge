"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface AssessmentQuestion {
  id: string;
  questionText: string;
  options: string[];
  order: number;
}

interface AssessmentData {
  id: string;
  title: string;
  durationMinutes: number;
  questions: AssessmentQuestion[];
}

function TakeAssessmentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const attemptId = searchParams.get("attemptId");
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!attemptId) {
      router.push("/student/assessment");
      return;
    }
    
    const fetchQuestions = async () => {
      try {
        const data = await api.get<AssessmentData>(`/assessments/${params.id}`);
        setAssessment(data);
      } catch (error) {
        console.error("Failed to load assessment", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [params.id, attemptId, router]);

  const handleSelectOption = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (assessment && currentIdx < assessment.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit your assessment? You cannot change your answers later.")) return;
    
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      };
      
      await api.post(`/assessments/attempts/${attemptId}/submit`, payload);
      router.push(`/student/assessment/results/${attemptId}`);
    } catch (error: any) {
      alert(error.message || "Failed to submit assessment");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground animate-pulse">Loading questions...</p>
      </div>
    );
  }

  if (!assessment || !attemptId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> Invalid attempt session.
        </p>
      </div>
    );
  }

  const currentQ = assessment.questions[currentIdx];
  const progress = ((Object.keys(answers).length) / assessment.questions.length) * 100;
  const isLastQuestion = currentIdx === assessment.questions.length - 1;

  return (
    <div className="min-h-screen bg-muted/10 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentIdx + 1} of {assessment.questions.length}
            </p>
          </div>
          <div className="w-full sm:w-1/3">
            <div className="flex justify-between text-xs mb-1 text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}% answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="min-h-[400px] flex flex-col shadow-md border-primary/10">
          <CardHeader className="bg-muted/30 pb-6 border-b">
            <CardTitle className="text-xl leading-relaxed">
              <span className="text-primary mr-2">{currentIdx + 1}.</span>
              {currentQ.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 py-8">
            <RadioGroup 
              value={answers[currentQ.id] || ""} 
              onValueChange={(val) => handleSelectOption(currentQ.id, val)}
              className="space-y-4"
            >
              {currentQ.options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={opt} id={`q${currentIdx}-opt${i}`} />
                  <Label htmlFor={`q${currentIdx}-opt${i}`} className="flex-1 cursor-pointer text-base">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between bg-muted/10">
            <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0}>
              Previous
            </Button>
            
            {!isLastQuestion ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                {submitting ? "Submitting..." : "Submit Assessment"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function TakeAssessmentPage() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Suspense fallback={<div className="p-8 text-center">Loading session...</div>}>
        <TakeAssessmentContent />
      </Suspense>
    </ProtectedRoute>
  );
}
