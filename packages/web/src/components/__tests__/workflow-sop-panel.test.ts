import type { WorkflowSop } from '@cat-cafe/shared';
import React, { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowSopPanel } from '../mission-control/WorkflowSopPanel';
import { mockResponse } from './mission-control-page.test-helpers';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'business',
    config: {},
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    isLoaded: true,
  }),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => createElement('a', { href }, children),
}));

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/utils/api-client', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function makeSopFixture(overrides?: Partial<WorkflowSop>): WorkflowSop {
  return {
    featureId: 'F073',
    backlogItemId: 'b-1',
    stage: 'impl',
    batonHolder: 'opus',
    nextSkill: 'tdd',
    resumeCapsule: {
      goal: 'Build SOP tab',
      done: ['Created types', 'Built API'],
      currentFocus: 'Frontend panel',
    },
    checks: {
      remoteMainSynced: 'verified',
      qualityGatePassed: 'attested',
      reviewApproved: 'unknown',
      visionGuardDone: 'unknown',
    },
    version: 1,
    updatedAt: Date.now(),
    updatedBy: 'opus',
    ...overrides,
  };
}

describe('WorkflowSopPanel', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (globalThis as { React?: typeof React }).React = React;
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    apiFetchMock.mockReset();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  afterAll(() => {
    delete (globalThis as { React?: typeof React }).React;
    delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  async function renderPanel(backlogItemId: string | null) {
    await act(async () => {
      root.render(createElement(WorkflowSopPanel, { backlogItemId }));
    });
    await flush();
  }

  it('shows placeholder when no backlogItemId', async () => {
    await renderPanel(null);
    const section = container.querySelector('[data-testid="mc-workflow-sop"]');
    expect(section).toBeTruthy();
    expect(section?.className).toContain('bg-[var(--oc-bg-surface)]');
    expect(section?.textContent).toContain('backlog');
  });

  it('shows empty state when API returns 404', async () => {
    apiFetchMock.mockResolvedValue(mockResponse(404, { error: 'not found' }));
    await renderPanel('b-1');
    const section = container.querySelector('[data-testid="mc-workflow-sop"]');
    expect(section?.textContent).toContain('SOP');
  });

  it('shows error when API fails', async () => {
    apiFetchMock.mockResolvedValue(mockResponse(500, { error: 'internal error' }));
    await renderPanel('b-1');
    const section = container.querySelector('[data-testid="mc-workflow-sop"]');
    expect(section?.textContent).toContain('internal error');
  });

  it('renders SOP data with all sections', async () => {
    const sop = makeSopFixture();
    apiFetchMock.mockResolvedValue(mockResponse(200, sop));
    await renderPanel('b-1');

    const section = container.querySelector('[data-testid="mc-workflow-sop"]');
    expect(section).toBeTruthy();
    expect(section?.className).toContain('border-[var(--oc-border-default)]');
    expect(section?.textContent).toContain('F073');

    const pills = container.querySelector('[data-testid="sop-stage-pills"]');
    expect(pills).toBeTruthy();

    const implPill = container.querySelector('[data-testid="sop-stage-impl"]');
    expect(implPill).toBeTruthy();
    expect(implPill?.className).toContain('bg-[#171717]');

    const kickoffPill = container.querySelector('[data-testid="sop-stage-kickoff"]');
    expect(kickoffPill?.className).toContain('bg-[var(--oc-bg-surface-muted)]');

    const reviewPill = container.querySelector('[data-testid="sop-stage-review"]');
    expect(reviewPill?.className).toContain('bg-[var(--oc-bg-surface-soft)]');

    const baton = container.querySelector('[data-testid="sop-baton-holder"]');
    expect(baton?.textContent).toBe('opus');
    expect(section?.textContent).toContain('tdd');

    const capsule = container.querySelector('[data-testid="sop-resume-capsule"]');
    expect(capsule?.textContent).toContain('Build SOP tab');
    expect(capsule?.textContent).toContain('Created types');
    expect(capsule?.textContent).toContain('Frontend panel');

    const checks = container.querySelector('[data-testid="sop-checks"]');
    expect(checks?.textContent).toContain('verified');
    expect(checks?.textContent).toContain('attested');
    expect(checks?.textContent).toContain('unknown');
  });

  it('calls correct API endpoint with encoded backlogItemId', async () => {
    apiFetchMock.mockResolvedValue(mockResponse(404, {}));
    await renderPanel('b-special/id');
    expect(apiFetchMock).toHaveBeenCalledWith('/api/backlog/b-special%2Fid/workflow-sop');
  });

  it('re-fetches when backlogItemId changes', async () => {
    const sop1 = makeSopFixture({ featureId: 'F073', stage: 'impl' });
    const sop2 = makeSopFixture({ featureId: 'F074', stage: 'review' });
    apiFetchMock.mockResolvedValue(mockResponse(200, sop1));
    await renderPanel('b-1');
    expect(container.textContent).toContain('F073');

    apiFetchMock.mockResolvedValue(mockResponse(200, sop2));
    await act(async () => {
      root.render(createElement(WorkflowSopPanel, { backlogItemId: 'b-2' }));
    });
    await flush();
    expect(container.textContent).toContain('F074');
    expect(apiFetchMock).toHaveBeenCalledTimes(2);
  });

  it('handles completion stage as current', async () => {
    const sop = makeSopFixture({ stage: 'completion' });
    apiFetchMock.mockResolvedValue(mockResponse(200, sop));
    await renderPanel('b-1');
    const completionPill = container.querySelector('[data-testid="sop-stage-completion"]');
    expect(completionPill?.className).toContain('bg-[#171717]');
    const mergePill = container.querySelector('[data-testid="sop-stage-merge"]');
    expect(mergePill?.className).toContain('bg-[var(--oc-bg-surface-muted)]');
  });

  it('hides next skill when null', async () => {
    const sop = makeSopFixture({ nextSkill: null });
    apiFetchMock.mockResolvedValue(mockResponse(200, sop));
    await renderPanel('b-1');
    expect(container.textContent).not.toContain('Skill');
  });

  it('handles empty done list in resume capsule', async () => {
    const sop = makeSopFixture({
      resumeCapsule: { goal: 'Test', done: [], currentFocus: 'Testing' },
    });
    apiFetchMock.mockResolvedValue(mockResponse(200, sop));
    await renderPanel('b-1');
    const capsule = container.querySelector('[data-testid="sop-resume-capsule"]');
    expect(capsule?.textContent).toContain('Test');
    expect(capsule?.textContent).not.toContain('Done');
  });
});
