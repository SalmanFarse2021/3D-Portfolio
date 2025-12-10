import { Project } from '@/types/project';
import projectsData from '@/data/projects.json';

// Cast JSON data to Project type
const projects: Project[] = projectsData as unknown as Project[];

/**
 * Get all projects
 */
export function getProjects(): Project[] {
    return projects;
}

/**
 * Get paginated projects
 */
export function getPaginatedProjects(page: number = 1, pageSize: number = 4): {
    projects: Project[];
    hasMore: boolean;
    total: number;
} {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    return {
        projects: paginatedProjects,
        hasMore: endIndex < projects.length,
        total: projects.length,
    };
}

/**
 * Load more projects
 */
export function loadMoreProjects(currentCount: number, loadCount: number = 2): {
    projects: Project[];
    hasMore: boolean;
} {
    const nextProjects = projects.slice(currentCount, currentCount + loadCount);

    return {
        projects: nextProjects,
        hasMore: currentCount + loadCount < projects.length,
    };
}
