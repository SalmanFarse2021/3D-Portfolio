import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIChatSidebar from '../AIChatSidebar';

// Mock fetch
global.fetch = jest.fn();

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('AIChatSidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders closed initially', () => {
        render(<AIChatSidebar />);
        // Sidebar container should be translated off-screen
        // Note: Testing CSS classes/styles is tricky with JSDOM, 
        // but we can check if the toggle button is visible
        expect(screen.getByLabelText('Toggle AI Chat')).toBeInTheDocument();
    });

    it('opens when toggle button is clicked', () => {
        render(<AIChatSidebar />);
        const toggleBtn = screen.getByLabelText('Toggle AI Chat');
        fireEvent.click(toggleBtn);

        expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('sends user message to API and displays response', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ response: 'AI Response' })
        });

        render(<AIChatSidebar />);

        // Open sidebar
        fireEvent.click(screen.getByLabelText('Toggle AI Chat'));

        // Type message
        const input = screen.getByPlaceholderText('Ask about projects...');
        fireEvent.change(input, { target: { value: 'Hello AI' } });

        // Send
        const sendBtn = screen.getByLabelText('Send message');
        fireEvent.click(sendBtn);

        // Check user message displayed immediately
        expect(screen.getByText('Hello AI')).toBeInTheDocument();

        // Check loading state (optional, might be too fast)
        // expect(screen.getByText('Typing...')).toBeInTheDocument();

        // Check API call
        expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ message: 'Hello AI' })
        }));

        // Wait for AI response
        await waitFor(() => {
            expect(screen.getByText('AI Response')).toBeInTheDocument();
        });
    });

    it('handles API error gracefully', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        render(<AIChatSidebar />);
        fireEvent.click(screen.getByLabelText('Toggle AI Chat'));

        const input = screen.getByPlaceholderText('Ask about projects...');
        fireEvent.change(input, { target: { value: 'Error Test' } });
        fireEvent.click(screen.getByLabelText('Send message'));

        await waitFor(() => {
            expect(screen.getByText('Sorry, I encountered an error.')).toBeInTheDocument();
        });
    });

    it('opens and sends message on custom event', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ response: 'Project Info' })
        });

        render(<AIChatSidebar />);

        // Dispatch custom event
        const event = new CustomEvent('open-ai-chat', {
            detail: { message: 'Tell me about Project X' }
        });

        // Need to wrap in act? usually fireEvent handles it, but window events might need care
        // React Testing Library handles most async updates automatically
        window.dispatchEvent(event);

        // Should be open and have user message
        await waitFor(() => {
            expect(screen.getByText('AI Assistant')).toBeInTheDocument();
        });

        expect(screen.getByText('Tell me about Project X')).toBeInTheDocument();

        // Should have called API
        expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
            body: JSON.stringify({ message: 'Tell me about Project X' })
        }));
    });
});
