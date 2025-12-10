import { render, screen, fireEvent } from '@testing-library/react';
import ProjectModal from '../ProjectModal';
import { Project } from '@/types/project';

const mockProject: Project = {
    id: '1',
    title: 'Test Project',
    description: 'Test Description',
    technologies: ['React', 'TypeScript'],
    image: '/test-image.jpg',
    link: 'https://example.com',
    position: [0, 0, 0]
};

describe('ProjectModal', () => {
    it('renders nothing when closed', () => {
        render(<ProjectModal project={mockProject} isOpen={false} onClose={() => { }} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders project details when open', () => {
        render(<ProjectModal project={mockProject} isOpen={true} onClose={() => { }} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn();
        render(<ProjectModal project={mockProject} isOpen={true} onClose={onClose} />);

        const closeButton = screen.getByLabelText('Close modal');
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when ESC key is pressed', () => {
        const onClose = jest.fn();
        render(<ProjectModal project={mockProject} isOpen={true} onClose={onClose} />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('dispatches open-ai-chat event when "Ask AI" is clicked', () => {
        const onClose = jest.fn();
        const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

        render(<ProjectModal project={mockProject} isOpen={true} onClose={onClose} />);

        const askButton = screen.getByText(/Ask AI About This/i);
        fireEvent.click(askButton);

        expect(dispatchEventSpy).toHaveBeenCalled();
        const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
        expect(event.type).toBe('open-ai-chat');
        expect(event.detail.message).toContain('Test Project');

        // Should also close the modal
        expect(onClose).toHaveBeenCalled();

        dispatchEventSpy.mockRestore();
    });
});
