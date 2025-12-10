import { getProjects, getPaginatedProjects, loadMoreProjects } from '../projectUtils';

describe('projectUtils', () => {
    describe('getProjects', () => {
        it('should return all projects', () => {
            const projects = getProjects();
            expect(projects.length).toBeGreaterThan(0);
        });
    });

    describe('getPaginatedProjects', () => {
        it('should return first page with correct number of projects', () => {
            // Assuming we have at least 3 projects in the mock data
            const result = getPaginatedProjects(1, 2);
            expect(result.projects.length).toBe(2);
            expect(result.hasMore).toBe(true);
        });

        it('should return correct total count', () => {
            const result = getPaginatedProjects(1, 2);
            expect(result.total).toBeGreaterThan(0);
        });
    });

    describe('loadMoreProjects', () => {
        it('should load 2 more projects by default', () => {
            // Start with 0 loaded, load next 2
            const result = loadMoreProjects(0);
            expect(result.projects.length).toBe(2);
        });

        it('should load specified number of projects', () => {
            const result = loadMoreProjects(0, 1);
            expect(result.projects.length).toBe(1);
        });

        it('should return correct hasMore flag', () => {
            const result = loadMoreProjects(0, 100); // Request more than available
            expect(result.hasMore).toBe(false);
        });
    });
});
