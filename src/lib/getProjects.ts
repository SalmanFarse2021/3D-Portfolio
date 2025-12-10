import { Project } from '@/types/project';

export async function getProjects(offset: number = 0, limit: number = 2): Promise<{ projects: Project[], total: number }> {
  try {
    // In a real app, this would be a server-side query with offset/limit
    // Here we fetch the full JSON and slice it client-side to simulate pagination

    let allProjects: Project[] = [];

    if (typeof window !== 'undefined') {
      const res = await fetch('/projects.json');
      if (!res.ok) throw new Error('Failed to fetch projects');
      allProjects = await res.json();
    } else {
      // Server-side fallback
      const res = await fetch('http://localhost:3003/projects.json');
      allProjects = await res.json();
    }

    // Simulate network delay for loading spinner demo
    await new Promise(resolve => setTimeout(resolve, 800));

    const paginatedProjects = allProjects.slice(offset, offset + limit);

    return {
      projects: paginatedProjects,
      total: allProjects.length
    };
  } catch (error) {
    console.error("Error loading projects:", error);
    return { projects: [], total: 0 };
  }
}
