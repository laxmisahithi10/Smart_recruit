import pdfParse from 'pdf-parse';

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return 'PDF content could not be extracted';
  }
}

export async function parsePDFResume(pdfBuffer: Buffer) {
  try {
    const text = await extractTextFromPDF(pdfBuffer);

    // Extract name (try multiple patterns)
    let name = 'Unknown Candidate';
    
    // Pattern 1: Name at the beginning of document
    const namePattern1 = text.match(/^\s*([A-Z][a-zA-Z\s]{2,30})\s*$/m);
    if (namePattern1) {
      name = namePattern1[1].trim();
    } else {
      // Pattern 2: Name before email
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        const beforeEmail = text.substring(0, emailMatch.index).split('\n').slice(-3);
        for (const line of beforeEmail.reverse()) {
          const cleanLine = line.trim();
          if (cleanLine.length > 2 && cleanLine.length < 50 && /^[A-Za-z\s]+$/.test(cleanLine)) {
            name = cleanLine;
            break;
          }
        }
      } else {
        // Pattern 3: First meaningful line
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
        if (lines.length > 0 && /^[A-Za-z\s]+$/.test(lines[0]) && lines[0].length < 50) {
          name = lines[0];
        }
      }
    }

    // Extract email
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const email = emailMatch ? emailMatch[1] : 'unknown@example.com';

    // Extract position/title (look for common job titles)
    const positionKeywords = [
      'Software Engineer', 'Software Developer', 'Frontend Developer', 'Backend Developer',
      'Full Stack Developer', 'Data Scientist', 'Product Manager', 'Designer',
      'DevOps Engineer', 'QA Engineer', 'Project Manager', 'Analyst'
    ];
    let position = 'Not specified';
    for (const keyword of positionKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        position = keyword;
        break;
      }
    }

    // Extract skills (look for common tech skills)
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
      'HTML', 'CSS', 'SASS', 'SCSS', 'Bootstrap', 'Tailwind',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git',
      'REST', 'GraphQL', 'API', 'Microservices', 'Agile', 'Scrum'
    ];
    const skills = skillKeywords.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    // Extract experience (look for years of experience)
    const experienceMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i);
    const experience = experienceMatch ? parseInt(experienceMatch[1], 10) : 0;

    return {
      name,
      email,
      position,
      skills: skills.length > 0 ? skills : ['General Skills'],
      experience
    };
  } catch (error) {
    console.error('Resume parsing error:', error);
    return {
      name: 'Unknown Candidate',
      email: 'unknown@example.com',
      position: 'General',
      skills: ['General Skills'],
      experience: 1
    };
  }
}
