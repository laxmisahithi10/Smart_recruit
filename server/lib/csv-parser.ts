export interface ParsedCandidate {
  name: string;
  email: string;
  phone?: string;
  position: string;
  skills: string[];
  experience: number;
  education?: string;
}

export function parseCSV(csvContent: string): ParsedCandidate[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const candidates: ParsedCandidate[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length < headers.length) continue;

    const candidate: any = {};
    headers.forEach((header, index) => {
      candidate[header] = values[index];
    });

    // Extract skills from skills column (comma-separated or pipe-separated)
    const skillsStr = candidate.skills || candidate.skill || "";
    const skills = skillsStr
      .split(/[,|;]/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    // Parse experience as number
    const experience = parseInt(candidate.experience || candidate.years || "0", 10) || 0;

    candidates.push({
      name: candidate.name || candidate.full_name || "Unknown",
      email: candidate.email || "",
      phone: candidate.phone || candidate.mobile || undefined,
      position: candidate.position || candidate.role || candidate.job_title || "Not specified",
      skills,
      experience,
      education: candidate.education || candidate.degree || undefined,
    });
  }

  return candidates;
}
