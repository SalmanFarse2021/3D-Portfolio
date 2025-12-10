import { render, screen } from '@testing-library/react';
import ProjectCard from '../ProjectCard';
import { Project } from '@/types/project';

const mockProject: Project = {
    id: '1',
    title: 'Test Project',
    description: 'A test project description',
    technologies: ['React', 'TypeScript', 'Node.js'],
    image: '/test-image.jpg',
    link: 'https://example.com',
    position: [0, 0, 0]
};

describe('ProjectCard', () => {
    it('should render project title', () => {
        render(<ProjectCard project={mockProject} />);
        expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should render project description', () => {
        render(<ProjectCard project={mockProject} />);
        expect(screen.getByText('A test project description')).toBeInTheDocument();
    });

    it('should render technology badges', () => {
        render(<ProjectCard project={mockProject} />);
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Node.js')).toBeInTheDocument();
    });

    it('should render project link', () => {
        render(<ProjectCard project={mockProject} />);
        const link = screen.getByText('View Project').closest('a');
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('should limit displayed technologies to 4', () => {
        const projectWithManyTechs: Project = {
            ...mockProject,
            technologies: ['Tech1', 'Tech2', 'Tech3', 'Tech4', 'Tech5', 'Tech6'],
        };
        render(<ProjectCard project={projectWithManyTechs} />);
        expect(screen.getByText('Tech1')).toBeInTheDocument();
        expect(screen.getByText('Tech4')).toBeInTheDocument();
        expect(screen.queryByText('Tech5')).not.toBeInTheDocument();
        expect(screen.getByText('+2')).toBeInTheDocument();
    });
});
