import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';
import { getProjects } from '@/lib/getProjects';

// Mock getProjects
jest.mock('@/lib/getProjects');
const mockGetProjects = getProjects as jest.MockedFunction<typeof getProjects>;

// Mock ThreeScene to avoid canvas issues in tests
jest.mock('@/components/ThreeScene', () => {
    return function DummyScene({ projects }: { projects: any[] }) {
        return (
            <div data-testid="three-scene">
                {projects.map((p) => (
                    <div key={p.id} data-testid="project-item">{p.title}</div>
                ))}
            </div>
        );
    };
});

// Mock other components
jest.mock('@/components/AIChatSidebar', () => {
    const MockAIChatSidebar = () => <div data-testid="ai-sidebar" />;
    MockAIChatSidebar.displayName = 'AIChatSidebar';
    return MockAIChatSidebar;
});
jest.mock('@/components/ProjectModal', () => {
    const MockProjectModal = () => <div data-testid="project-modal" />;
    MockProjectModal.displayName = 'ProjectModal';
    return MockProjectModal;
});

describe('Home Page Progressive Loading', () => {
    const mockProjects = [
        { id: '1', title: 'Project 1', description: 'Desc 1', technologies: [], image: '', link: '' },
        { id: '2', title: 'Project 2', description: 'Desc 2', technologies: [], image: '', link: '' },
        { id: '3', title: 'Project 3', description: 'Desc 3', technologies: [], image: '', link: '' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads 2 projects initially', async () => {
        mockGetProjects.mockResolvedValueOnce({
            projects: mockProjects.slice(0, 2),
            total: 3
        });

        render(<Home />);

        // Check initial loading state
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

        // Wait for projects to load
        await waitFor(() => {
            expect(screen.getAllByTestId('project-item')).toHaveLength(2);
        });

        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
        expect(screen.queryByText('Project 3')).not.toBeInTheDocument();
    });

    it('loads more projects when "See More" is clicked', async () => {
        // Initial load
        mockGetProjects.mockResolvedValueOnce({
            projects: mockProjects.slice(0, 2),
            total: 3
        });

        // Second load
        mockGetProjects.mockResolvedValueOnce({
            projects: mockProjects.slice(2, 3),
            total: 3
        });

        render(<Home />);

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getAllByTestId('project-item')).toHaveLength(2);
        });

        // Click See More
        const button = screen.getByText(/See More Projects/i);
        fireEvent.click(button);

        // Should show loading on button
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

        // Wait for new projects
        await waitFor(() => {
            expect(screen.getAllByTestId('project-item')).toHaveLength(3);
        });

        expect(screen.getByText('Project 3')).toBeInTheDocument();
    });

    it('disables/hides button when all projects loaded', async () => {
        // Total 2 projects, limit 2. Should load all and disable button.
        mockGetProjects.mockResolvedValueOnce({
            projects: mockProjects.slice(0, 2),
            total: 2
        });

        render(<Home />);

        await waitFor(() => {
            expect(screen.getAllByTestId('project-item')).toHaveLength(2);
        });
        // Button should not be present or should be replaced by "All projects loaded"
        expect(screen.queryByText(/See More Projects/i)).not.toBeInTheDocument();
        expect(screen.getByText(/All projects loaded/i)).toBeInTheDocument();
    });
});
