import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AvatarImg from '../../../../src/app/components/avatar-img/AvatarImg';

describe('AvatarImg', () => {
  it('should render image with correct src for valid avatar id', () => {
    render(<AvatarImg avatarId="1" />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    // Avatar 1 should have a valid src (Carer 1)
    expect(img).toHaveAttribute('src');
    expect(img.getAttribute('src')).not.toBe('');
    expect(img).toHaveAttribute('alt', 'Carer 1');
  });

  it('should apply size prop to width and height', () => {
    render(<AvatarImg avatarId="1" size={50} />);

    const img = screen.getByRole('img');
    expect(img).toHaveStyle({ width: '50px', height: '50px' });
  });

  it('should use default size of 100 when not specified', () => {
    render(<AvatarImg avatarId="1" />);

    const img = screen.getByRole('img');
    expect(img).toHaveStyle({ width: '100px', height: '100px' });
  });

  it('should handle missing avatar gracefully with fallback', () => {
    render(<AvatarImg avatarId="invalid-id-99999" />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    // Should have 'Avatar' as fallback alt text for unknown avatar
    expect(img).toHaveAttribute('alt', 'Avatar');
    // The src may be empty or null depending on how React handles it
    const src = img.getAttribute('src');
    expect(src === '' || src === null).toBe(true);
  });

  it('should apply rotateY transform when direction is right', () => {
    render(<AvatarImg avatarId="1" direction="right" />);

    const img = screen.getByRole('img');
    expect(img).toHaveStyle({ transform: 'rotateY(180deg)' });
  });

  it('should not apply transform when direction is left (default)', () => {
    render(<AvatarImg avatarId="1" direction="left" />);

    const img = screen.getByRole('img');
    expect(img).toHaveStyle({ transform: 'none' });
  });
});
