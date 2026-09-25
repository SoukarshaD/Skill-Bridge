import { skills, opps, resources, assessments, mentorshipPrograms, programsData, demoCerts, careerRolesData } from './seed-data';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. We will NOT delete existing data to avoid wiping production/demo data.
  console.log('Keeping existing data...');

  // 2. Seed Skills (Idempotent)
  // skills imported from seed-data.ts

  const skillRecords: any[] = [];
  for (const skill of skills) {
    const normalizedName = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-'); // Matches API normalization
    const record = await prisma.skillTaxonomy.upsert({
      where: { normalizedName },
      update: {},
      create: { ...skill, normalizedName }
    });
    skillRecords.push(record);
  }
  console.log('✅ Seeded skills.');

  // 3. Seed Organizations & Users (Only if empty to prevent conflicts on existing db)
  const existingOrg = await prisma.organization.findFirst();
  if (!existingOrg) {
    const org1 = await prisma.organization.create({
      data: {
        name: 'Google (Demo)',
        domain: 'google.com',
        type: 'INDUSTRY',
        isVerified: true
      }
    });
    console.log('✅ Seeded organizations.');

    // 4. Seed Users
    // Admin
    await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@portal.edu',
        passwordHash,
        role: 'ADMIN',
        isVerified: true
      }
    });

    // Industry Recruiter
    const recruiter = await prisma.user.create({
      data: {
        name: 'Jane Recruiter',
        email: 'jane@google.com',
        passwordHash,
        role: 'INDUSTRY',
        organizationId: org1.id,
        isVerified: true
      }
    });

    // Academician
    const academician = await prisma.user.create({
      data: {
        name: 'Dr. Alan Turing',
        email: 'alan@university.edu',
        passwordHash,
        role: 'ACADEMICIAN',
        isVerified: true,
        academicProfile: {
          create: {
            department: 'Computer Science',
            expertise: ['Artificial Intelligence', 'Cryptography'],
            researchAreas: ['Machine Learning', 'Computational Theory']
          }
        }
      }
    });

    // Student 1 (High Match)
    const student1 = await prisma.user.create({
      data: {
        name: 'Alice Hacker',
        email: 'alice@university.edu',
        passwordHash,
        role: 'STUDENT',
        isVerified: true,
        studentProfile: {
          create: {
            department: 'Computer Science',
            year: 3
          }
        }
      },
      include: { studentProfile: true }
    });

    await prisma.studentSkill.createMany({
      data: [
        { studentProfileId: student1.studentProfile!.id, skillId: skillRecords[0].id, proficiency: 5 },
        { studentProfileId: student1.studentProfile!.id, skillId: skillRecords[1].id, proficiency: 4 },
        { studentProfileId: student1.studentProfile!.id, skillId: skillRecords[2].id, proficiency: 4 },
        { studentProfileId: student1.studentProfile!.id, skillId: skillRecords[3].id, proficiency: 3 }
      ]
    });

    // Student 2 (Partial Match)
    const student2 = await prisma.user.create({
      data: {
        name: 'Bob Builder',
        email: 'bob@university.edu',
        passwordHash,
        role: 'STUDENT',
        isVerified: true,
        studentProfile: {
          create: {
            department: 'Data Science',
            year: 2
          }
        }
      },
      include: { studentProfile: true }
    });

    await prisma.studentSkill.createMany({
      data: [
        { studentProfileId: student2.studentProfile!.id, skillId: skillRecords[0].id, proficiency: 4 },
        { studentProfileId: student2.studentProfile!.id, skillId: skillRecords[4].id, proficiency: 5 }
      ]
    });
    console.log('✅ Seeded users and profiles.');
  } else {
    console.log('⚡ Organizations/Users already exist, skipping to avoid duplicates.');
  }

  // 5. Seed Opportunities (Idempotent by Title)
  let targetOrg = existingOrg;
  if (!targetOrg) {
    targetOrg = await prisma.organization.findFirst();
  }
  
  if (targetOrg) {
    // opps imported from seed-data.ts

    for (const oppData of opps) {
      const existing = await prisma.opportunity.findFirst({
        where: { title: oppData.title }
      });

      if (!existing) {
        const { skills: reqSkills, ...data } = oppData;
        const newOpp = await prisma.opportunity.create({
          data: {
            ...data as any,
            organizationId: targetOrg.id
          }
        });

        // Add skills
        for (const skillName of reqSkills) {
          const skillRecord = skillRecords.find(s => s.name === skillName);
          if (skillRecord) {
            await prisma.opportunitySkill.create({
              data: {
                opportunityId: newOpp.id,
                skillId: skillRecord.id,
                requiredProficiency: 3,
                weight: 1.0
              }
            });
          }
        }
        console.log(`✅ Created opportunity: ${oppData.title}`);
      } else {
        console.log(`⚡ Skipped existing opportunity: ${oppData.title}`);
      }
    }
  } else {
    console.log('❌ Could not seed opportunities because no organization was found.');
  }

  // 6. Seed Learning Resources (Idempotent by Title)
  if (targetOrg) {
    // resources imported from seed-data.ts

    for (const resData of resources) {
      const existing = await prisma.learningResource.findFirst({
        where: { title: resData.title }
      });

      if (!existing) {
        const { skills: targetSkills, ...data } = resData;
        const newResource = await prisma.learningResource.create({
          data: {
            ...data,
            organizationId: targetOrg.id
          }
        });

        for (const ts of targetSkills) {
          const skillRecord = skillRecords.find(s => s.name === ts.name);
          if (skillRecord) {
            await prisma.learningResourceSkill.create({
              data: {
                learningResourceId: newResource.id,
                skillId: skillRecord.id,
                targetProficiency: ts.level
              }
            });
          }
        }
        console.log(`✅ Created learning resource: ${resData.title}`);
      } else {
        console.log(`⚡ Skipped existing learning resource: ${resData.title}`);
      }
    }
  }

  // 7. Seed Applications (Skipped in idempotent mode)
  // 8. Seed Notifications (Skipped in idempotent mode)

  // 7. Seed Assessments (Idempotent)
  if (targetOrg) {
    // assessments imported from seed-data.ts

    for (const ass of assessments) {
      const existing = await prisma.assessment.findFirst({
        where: { title: ass.title }
      });

      if (!existing) {
        const newAssessment = await prisma.assessment.create({
          data: {
            title: ass.title,
            description: ass.description,
            // @ts-ignore
            type: ass.type,
            durationMinutes: ass.durationMinutes,
            isPublished: ass.isPublished,
          }
        });

        for (let i = 0; i < ass.questions.length; i++) {
          const q: any = ass.questions[i];
          let skillId = null;
          if (q.skillName) {
            const sk = skillRecords.find(s => s.name === q.skillName);
            if (sk) skillId = sk.id;
          }

          await prisma.assessmentQuestion.create({
            data: {
              assessmentId: newAssessment.id,
              questionText: q.questionText,
              options: JSON.parse(q.options),
              correctAnswer: q.correctAnswer,
              skillId,
              // @ts-ignore
              difficulty: q.difficulty,
              marks: q.marks,
              order: i
            }
          });
        }
        console.log(`✅ Created assessment: ${ass.title}`);
      } else {
        console.log(`⚡ Skipped existing assessment: ${ass.title}`);
      }
    }
  }

  // 8. Seed Mentorship Programs
  let industryUser = await prisma.user.findFirst({
    where: { role: 'INDUSTRY' }
  });

  if (!industryUser) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const org = await prisma.organization.findFirst({ where: { type: 'INDUSTRY' } });
    industryUser = await prisma.user.create({
      data: {
        name: 'Jane Recruiter (Mentor)',
        email: 'mentor@industry.com',
        passwordHash,
        role: 'INDUSTRY',
        organizationId: org?.id,
        isVerified: true
      }
    });
    console.log('✅ Created fallback industry mentor user.');
  }

  if (industryUser) {
    // mentorshipPrograms imported from seed-data.ts

    for (const prog of mentorshipPrograms) {
      const existingProg = await prisma.mentorshipProgram.findFirst({
        where: { title: prog.title }
      });

      if (!existingProg) {
        await prisma.mentorshipProgram.create({
          data: {
            title: prog.title,
            description: prog.description,
            maxMentees: prog.maxMentees,
            expertise: prog.expertise,
            status: 'PUBLISHED',
            mentorId: industryUser.id
          }
        });
        console.log(`✅ Created mentorship program: ${prog.title}`);
      } else {
        console.log(`⚡ Skipped existing mentorship program: ${prog.title}`);
      }
    }
  }

  // 9. Seed Internship and Accepted Application
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  const internshipOpp = await prisma.opportunity.findFirst({ where: { type: 'INTERNSHIP' } });
  if (student && internshipOpp) {
    const existingApp = await prisma.application.findFirst({
      where: { studentId: student.id, opportunityId: internshipOpp.id }
    });
    
    let appId;
    if (!existingApp) {
      const app = await prisma.application.create({
        data: {
          studentId: student.id,
          opportunityId: internshipOpp.id,
          status: 'ACCEPTED'
        }
      });
      appId = app.id;
      console.log('✅ Created ACCEPTED application for demo.');
    } else {
      appId = existingApp.id;
      if (existingApp.status !== 'ACCEPTED') {
        await prisma.application.update({ where: { id: appId }, data: { status: 'ACCEPTED' }});
      }
    }

    const existingInternship = await prisma.internship.findFirst({ where: { applicationId: appId } });
    if (!existingInternship) {
      const internship = await prisma.internship.create({
        data: {
          applicationId: appId,
          studentId: student.id,
          organizationId: internshipOpp.organizationId,
          opportunityId: internshipOpp.id,
          status: 'ACTIVE',
          startDate: new Date(),
        }
      });

      await prisma.internshipMilestone.create({
        data: { internshipId: internship.id, title: 'Project Setup & Onboarding', status: 'COMPLETED', completedAt: new Date() }
      });
      await prisma.internshipMilestone.create({
        data: { internshipId: internship.id, title: 'Implement Authentication', status: 'IN_PROGRESS' }
      });
      
      await prisma.internshipProgressUpdate.create({
        data: { internshipId: internship.id, authorId: student.id, content: 'Successfully set up the repository and completed onboarding. Starting on authentication today.' }
      });

      console.log('✅ Created ACTIVE internship with milestones and updates for demo.');
    }
  }

  // 10. Seed Programs (Workshops, FDP, etc.)
  if (targetOrg && industryUser) {
    // programsData imported from seed-data.ts

    for (const p of programsData) {
      const existing = await prisma.program.findFirst({ where: { title: p.title } });
      if (!existing) {
        const { skills: pSkills, ...pData } = p;
        const newProg = await prisma.program.create({
          data: {
            ...pData,
            organizationId: targetOrg.id,
            organizerId: industryUser.id,
            // @ts-ignore
            type: pData.type,
            // @ts-ignore
            mode: pData.mode,
            // @ts-ignore
            status: pData.status,
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          }
        });
        
        for (const sName of pSkills) {
          const sk = skillRecords.find(s => s.name === sName);
          if (sk) {
            await prisma.programSkill.create({
              data: {
                programId: newProg.id,
                skillId: sk.id,
                requiredProficiency: 2
              }
            });
          }
        }
        console.log(`✅ Created program: ${p.title}`);
      } else {
        console.log(`⚡ Skipped existing program: ${p.title}`);
      }
    }
  }
  // ─── PHASE: CERTIFICATE SEEDING ─────────────────────────────────────────────
  const seedStudent = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  if (seedStudent) {
    // demoCerts imported from seed-data.ts

    for (const cert of demoCerts) {
      const { skillNames, ...certData } = cert;
      
      const skillIds = (skillNames || [])
        .map((name: string) => skillRecords.find(s => s.normalizedName === name)?.id)
        .filter(Boolean) as string[];

      const existing = await prisma.certificate.findFirst({
        where: { studentId: seedStudent.id, title: cert.title },
      });
      if (!existing) {
        await prisma.certificate.create({
          data: {
            ...certData,
            studentId: seedStudent.id,
            skills: skillIds.length
              ? { create: skillIds.map(skillId => ({ skillId })) }
              : undefined,
          },
        });
        console.log(`✅ Seeded certificate: ${cert.title}`);
      } else {
        console.log(`⚡ Skipped existing certificate: ${cert.title}`);
      }
    }
  }

  // --- PHASE 3 SEEDING: Innovation Challenges & Live Projects ---
  let org = await prisma.organization.findFirst({ where: { type: 'INDUSTRY' } });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'Tech Innovations Ltd', type: 'INDUSTRY', isVerified: true }
    });
  }

  const pythonSkill = await prisma.skillTaxonomy.upsert({
    where: { normalizedName: 'python' },
    update: {},
    create: { name: 'Python', normalizedName: 'python', category: 'Programming Language', domain: 'Computer Science' }
  });

  const mlSkill = await prisma.skillTaxonomy.upsert({
    where: { normalizedName: 'machine-learning' },
    update: {},
    create: { name: 'Machine Learning', normalizedName: 'machine-learning', category: 'AI', domain: 'Data Science' }
  });

  const dataSkill = await prisma.skillTaxonomy.upsert({
    where: { normalizedName: 'data-analysis' },
    update: {},
    create: { name: 'Data Analysis', normalizedName: 'data-analysis', category: 'Data Science', domain: 'Data Science' }
  });
  
  if (org) {
    const existingChallenge = await prisma.opportunity.findFirst({ where: { type: 'INNOVATION_CHALLENGE' as any, title: 'Smart Campus AI Challenge' } });
    if (!existingChallenge) {
      await prisma.opportunity.create({
        data: {
          organizationId: org.id,
          type: 'INNOVATION_CHALLENGE' as any,
          title: 'Smart Campus AI Challenge',
          description: 'Build an AI solution to optimize campus energy consumption and predict peak usage.',
          status: 'PUBLISHED',
          workMode: 'REMOTE',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          minTeamSize: 2,
          maxTeamSize: 4,
          prizes: '$5000 + Tech Innovations Internship Interview',
          rules: '1. Code must be open source. 2. Must use a specified AI framework. 3. Submissions via GitHub URL.',
          evaluationCriteria: 'Innovation: 40%, Technical Execution: 30%, Practicality: 30%',
          certificateAvailable: true,
          requiredSkills: {
            create: [
              { skillId: pythonSkill.id, requiredProficiency: 4, weight: 1.5 },
              { skillId: mlSkill.id, requiredProficiency: 3, weight: 1.0 },
              { skillId: dataSkill.id, requiredProficiency: 3, weight: 1.0 }
            ]
          }
        }
      });
      console.log('✅ Seeded Innovation Challenge: Smart Campus AI Challenge');
    } else {
      console.log('⚡ Skipped existing Innovation Challenge');
    }

    const existingProject = await prisma.opportunity.findFirst({ where: { type: 'LIVE_PROJECT' as any, title: 'Blockchain Supply Chain Tracker' } });
    if (!existingProject) {
      const blockchainSkill = await prisma.skillTaxonomy.upsert({
        where: { normalizedName: 'blockchain' },
        update: {},
        create: { name: 'Blockchain', normalizedName: 'blockchain', category: 'Web3', domain: 'Computer Science' }
      });

      await prisma.opportunity.create({
        data: {
          organizationId: org.id,
          type: 'LIVE_PROJECT' as any,
          title: 'Blockchain Supply Chain Tracker',
          description: 'Develop a live dashboard that tracks supply chain data using a permissioned blockchain.',
          status: 'PUBLISHED',
          workMode: 'HYBRID',
          duration: '3 Months',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          certificateAvailable: true,
          requiredSkills: {
            create: [
              { skillId: blockchainSkill.id, requiredProficiency: 3, weight: 1.2 },
            ]
          }
        }
      });
      console.log('✅ Seeded Live Project: Blockchain Supply Chain Tracker');
    } else {
      console.log('⚡ Skipped existing Live Project');
    }
  }

  // --- PHASE 4 SEEDING: Career Roles ---
  // careerRolesData imported from seed-data.ts

  for (const roleDef of careerRolesData) {
    const existingRole = await prisma.careerRole.findFirst({ where: { title: roleDef.title } });
    if (!existingRole) {
      const createdRole = await prisma.careerRole.create({
        data: {
          title: roleDef.title,
          category: roleDef.category,
          description: `Determine your alignment and roadmap for becoming a ${roleDef.title}.`,
        }
      });
      
      for (const skillDef of roleDef.skills) {
        const normalizedName = skillDef.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const skillRecord = await prisma.skillTaxonomy.upsert({
          where: { normalizedName },
          update: {},
          create: { name: skillDef.name, normalizedName, category: skillDef.category, domain: skillDef.domain }
        });
        
        await prisma.careerRoleSkill.create({
          data: {
            careerRoleId: createdRole.id,
            skillId: skillRecord.id,
            requiredProficiency: skillDef.req,
            weight: skillDef.weight,
            importance: 'CORE'
          }
        });
      }
      console.log(`✅ Seeded Career Role: ${roleDef.title}`);
    } else {
      console.log(`⚡ Skipped existing Career Role: ${roleDef.title}`);
    }
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
