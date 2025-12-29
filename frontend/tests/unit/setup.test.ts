import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have jest-dom matchers available', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    document.body.appendChild(div);

    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('Hello');

    document.body.removeChild(div);
  });

  it('should have window.matchMedia mocked', () => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    expect(mediaQuery.matches).toBe(false);
    expect(mediaQuery.media).toBe('(min-width: 768px)');
  });
});
