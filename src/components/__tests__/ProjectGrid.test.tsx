import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectGrid from '../ProjectGrid';

// Mock the projectUtils module
jest.mock('@/lib/projectUtils', () => ({
    getProjects: jest.fn(() => [
        { id: '1', title: 'Project 1', description: 'Desc 1', category: 'web', featured: true, technologies: [], image: '', images: [], completedDate: '2025-01-01', longDescription: '' },
        { id: '2', title: 'Project 2', description: 'Desc 2', category: 'web', featured: false, technologies: [], image: '', images: [], completedDate: '2025-01-02', longDescription: '' },
        { id: '3', title: 'Project 3', description: 'Desc 3', category: 'mobile', featured: false, technologies: [], image: '', images: [], completedDate: '2025-01-03', longDescription: '' },
        { id: '4', title: 'Project 4', description: 'Desc 4', category: '3d', featured: false, technologies: [], image: '', images: [], completedDate: '2025-01-04', longDescription: '' },
        { id: '5', title: 'Project 5', description: 'Desc 5', category: 'ai', featured: false, technologies: [], image: '', images: [], completedDate: '2025-01-05', longDescription: '' },
        { id: '6', title: 'Project 6', description: 'Desc 6', category: 'web', featured: false, technologies: [], image: '', images: [], completedDate: '2025-01-06', longDescription: '' },
    ]),
}));

describe('ProjectGrid', () => {
    it('should render initial 4 projects', () => {
        render(<ProjectGrid />);
        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
        expect(screen.getByText('Project 3')).toBeInTheDocument();
        expect(screen.getByText('Project 4')).toBeInTheDocument();
        expect(screen.queryByText('Project 5')).not.toBeInTheDocument();
    });

    it('should show "See More" button when there are more projects', () => {
        render(<ProjectGrid />);
        expect(screen.getByText(/See More Projects/)).toBeInTheDocument();
    });

    it('should load 2 more projects when "See More" is clicked', async () => {
        render(<ProjectGrid />);

        const seeMoreButton = screen.getByText(/See More Projects/);
        fireEvent.click(seeMoreButton);

        await waitFor(() => {
            expect(screen.getByText('Project 5')).toBeInTheDocument();
            expect(screen.getByText('Project 6')).toBeInTheDocument();
        });
    });

    it('should show loading state when loading more projects', async () => {
        render(<ProjectGrid />);

        const seeMoreButton = screen.getByText(/See More Projects/);
        fireEvent.click(seeMoreButton);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide "See More" button when all projects are loaded', async () => {
        render(<ProjectGrid />);

        const seeMoreButton = screen.getByText(/See More Projects/);
        fireEvent.click(seeMoreButton);

        await waitFor(() => {
            expect(screen.queryByText(/See More Projects/)).not.toBeInTheDocument();
        });
    });

    it('should show completion message when all projects are loaded', async () => {
        render(<ProjectGrid />);

        const seeMoreButton = screen.getByText(/See More Projects/);
        fireEvent.click(seeMoreButton);

        await waitFor(() => {
            expect(screen.getByText(/You've seen all 6 projects/)).toBeInTheDocument();
        });
    });

    it('should update remaining count correctly', () => {
        render(<ProjectGrid />);
        expect(screen.getByText(/2 remaining/)).toBeInTheDocument();
    });
});
