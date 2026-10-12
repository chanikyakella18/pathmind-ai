import { Roadmap } from '../types/roadmap';

export function exportRoadmapAsMarkdown(roadmap: Roadmap): void {
  let md = `# ${roadmap.title}\n\n`;
  md += `**Target Career:** ${roadmap.userProfile.targetCareer}\n`;
  md += `**Study Commitment:** ${roadmap.userProfile.hoursPerDay} hr/day • ${roadmap.userProfile.daysPerWeek} days/week\n`;
  md += `**Learning Pace:** ${roadmap.userProfile.learningPace}\n`;
  md += `**Summary:** ${roadmap.summary}\n\n`;

  md += `## Baseline Current Skills\n`;
  roadmap.userProfile.currentSkills.forEach((s) => {
    md += `- ${s.name} (${s.level})\n`;
  });
  md += `\n`;

  md += `## Staged Learning Roadmap\n\n`;
  roadmap.phases.forEach((phase) => {
    md += `### Phase ${phase.phaseNumber}: ${phase.title}\n`;
    md += `*${phase.tagline}*\n`;
    md += `**Focus:** ${phase.focus}\n`;
    md += `**Estimated:** ${phase.estimatedTotalHours} hours (~${phase.estimatedWeeks} weeks)\n\n`;

    md += `#### Core Topics:\n`;
    phase.topics.forEach((t) => {
      const check = t.isCompleted ? '[x]' : '[ ]';
      md += `- ${check} **${t.title}** (~${t.estimatedHours}h)\n`;
      md += `  ${t.description}\n`;
      if (t.keyOutcomes && t.keyOutcomes.length > 0) {
        md += `  *Key Outcomes:*\n`;
        t.keyOutcomes.forEach((o) => {
          md += `  - ${o}\n`;
        });
      }
    });

    if (phase.projects && phase.projects.length > 0) {
      md += `\n#### Practice Projects:\n`;
      phase.projects.forEach((p) => {
        const pCheck = p.isCompleted ? '[x]' : '[ ]';
        md += `- ${pCheck} **${p.title}** (${p.difficulty})\n`;
        md += `  ${p.description}\n`;
        md += `  *Deliverables:* ${p.deliverables?.join(', ')}\n`;
      });
    }

    md += `\n---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${roadmap.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_roadmap.md`;
  a.click();
  URL.revokeObjectURL(url);
}
