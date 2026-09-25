import { prisma } from '../../config/database';
import { DemandSourceType } from '@prisma/client';

export interface RawDemandSignal {
  title: string;
  role?: string;
  location?: string;
  skills: { name: string; evidence?: string }[];
  organization?: string;
  sourceType: DemandSourceType;
  sourceReference?: string;
  description?: string;
  observedAt: string;
}

export class LmiNormalizationService {
  async normalizePreview(raw: RawDemandSignal) {
    // 1. Role Normalization
    let normalizedRole: any = null;
    if (raw.role) {
       // exact or simple substring match (case insensitive)
       normalizedRole = await prisma.careerRole.findFirst({
         where: {
            title: { equals: raw.role, mode: 'insensitive' }
         }
       });
       
       if (!normalizedRole) {
         // simple alias matching if needed, or fallback to contains
         normalizedRole = await prisma.careerRole.findFirst({
            where: {
               title: { contains: raw.role, mode: 'insensitive' }
            }
         });
       }
    }

    // 2. Location Normalization
    let normalizedLocation = raw.location?.trim();
    if (normalizedLocation) {
        const lowerLoc = normalizedLocation.toLowerCase();
        if (lowerLoc === 'mumbai' || lowerLoc === 'mumbai, mh') {
            normalizedLocation = 'Mumbai, Maharashtra';
        } else if (lowerLoc === 'pune' || lowerLoc === 'pune, mh') {
            normalizedLocation = 'Pune, Maharashtra';
        } else if (lowerLoc === 'bangalore' || lowerLoc === 'bengaluru') {
            normalizedLocation = 'Bengaluru, Karnataka';
        }
        // If it doesn't match obvious deterministic aliases, we leave it as trimmed raw
    }

    // 3. Skill Normalization
    const normalizedSkills = [];
    const allTaxonomySkills = await prisma.skillTaxonomy.findMany();
    
    // Deterministic aliases dictionary
    const aliases: Record<string, string> = {
       'js': 'JavaScript',
       'javascript': 'JavaScript',
       'java script': 'JavaScript',
       'reactjs': 'React',
       'react.js': 'React',
       'react js': 'React',
       'nodejs': 'Node.js',
       'node.js': 'Node.js',
       'node js': 'Node.js',
       'c++': 'C++',
       'cpp': 'C++',
       'sql': 'SQL',
       'ml': 'Machine Learning',
       'ai': 'Artificial Intelligence',
       'aws': 'AWS Cloud Practitioner', // Map broadly for demo
       'ux': 'User Experience Design',
       'ui': 'User Interface Design'
    };

    for (const rawSkill of raw.skills) {
       const lowerName = rawSkill.name.toLowerCase().trim();
       let canonicalName = aliases[lowerName] || rawSkill.name.trim();
       
       const matchedSkill = allTaxonomySkills.find(s => s.name.toLowerCase() === canonicalName.toLowerCase());
       
       if (matchedSkill) {
          normalizedSkills.push({
             rawSkillName: rawSkill.name,
             skillId: matchedSkill.id,
             canonicalName: matchedSkill.name,
             evidence: rawSkill.evidence,
             normalizationMethod: aliases[lowerName] ? 'ALIAS' : 'EXACT',
             confidence: aliases[lowerName] ? 0.9 : 1.0,
             isUnresolved: false
          });
       } else {
          normalizedSkills.push({
             rawSkillName: rawSkill.name,
             skillId: null,
             canonicalName: null,
             evidence: rawSkill.evidence,
             normalizationMethod: 'UNRESOLVED',
             confidence: 0.0,
             isUnresolved: true
          });
       }
    }

    return {
       rawTitle: raw.title,
       rawRoleTitle: raw.role || null,
       normalizedRole: normalizedRole ? { id: normalizedRole.id, title: normalizedRole.title } : null,
       rawLocation: raw.location || null,
       normalizedLocation,
       skills: normalizedSkills,
       sourceType: raw.sourceType,
       sourceReference: raw.sourceReference,
       organizationId: raw.organization,
       description: raw.description,
       observedAt: raw.observedAt
    };
  }
}
