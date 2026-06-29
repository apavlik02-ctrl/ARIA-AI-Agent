// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ARIAModal from '@/components/ARIAModal';

vi.mock('@/components/aria-agent-with-quiz', () => ({
  default: () => <div data-testid="aria-agent" />,
}));

const mockUser = { id: 'user-1', email: 'test@example.com' };

// ── Visibility ────────────────────────────────────────────────────────────────

describe('ARIAModal — visibility', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ARIAModal isOpen={false} onClose={vi.fn()} user={mockUser} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(<ARIAModal isOpen={true} onClose={vi.fn()} user={mockUser} />);
    expect(screen.getByText('ARIA')).toBeInTheDocument();
  });

  it('mounts the ARIAAgentWithQuiz sub-component when open', () => {
    render(<ARIAModal isOpen={true} onClose={vi.fn()} user={mockUser} />);
    expect(screen.getByTestId('aria-agent')).toBeInTheDocument();
  });
});

// ── Header content ────────────────────────────────────────────────────────────

describe('ARIAModal — header', () => {
  it('shows "ARIA" brand name', () => {
    render(<ARIAModal isOpen={true} onClose={vi.fn()} user={mockUser} />);
    expect(screen.getByText('ARIA')).toBeInTheDocument();
  });

  it('shows the product subtitle', () => {
    render(<ARIAModal isOpen={true} onClose={vi.fn()} user={mockUser} />);
    expect(screen.getByText(/WISCONSIN LIFE \+ PASSPRO/)).toBeInTheDocument();
  });

  it('renders a Close button', () => {
    render(<ARIAModal isOpen={true} onClose={vi.fn()} user={mockUser} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});

// ── Close interactions ────────────────────────────────────────────────────────

describe('ARIAModal — close interactions', () => {
  it('calls onClose when the Close button is clicked', () => {
    const onClose = vi.fn();
    render(<ARIAModal isOpen={true} onClose={onClose} user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ARIAModal isOpen={true} onClose={onClose} user={mockUser} />
    );
    // The outermost div is the backdrop
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when the inner modal card is clicked', () => {
    const onClose = vi.fn();
    render(<ARIAModal isOpen={true} onClose={onClose} user={mockUser} />);
    fireEvent.click(screen.getByText('ARIA'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
