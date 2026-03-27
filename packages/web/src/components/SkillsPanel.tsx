'use client';

import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { HubCapabilityTab } from './HubCapabilityTab';
import { HubSkillsTab } from './HubSkillsTab';

const SKILL_TITLE = '技能';
const SKILL_DESC = '统一管理 OfficeClaw 能力、已安装技能与技能广场。';
const INSTALLED = '\u5df2\u5b89\u88c5';
const SKILL_PLAZA = '\u6280\u80fd\u5e7f\u573a';
const IMPORT_SKILL = '\u5bfc\u5165';

export function SkillsPanel() {
  const { theme } = useTheme();
  const isBusinessTheme = theme === 'business';
  const [activeTab, setActiveTab] = useState<'installed' | 'plaza'>('installed');

  return (
    <div
      className={`flex h-full min-h-0 flex-col ${isBusinessTheme ? 'gap-4 bg-[var(--oc-bg-surface)] text-[var(--oc-text-body)]' : 'gap-3 bg-[#FFFFFF]'}`}
      data-testid="skills-panel-shell"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h1
              className={isBusinessTheme ? 'text-[26px] font-bold leading-none tracking-[-0.02em] text-[var(--oc-text-title)]' : 'text-[24px] font-bold text-[#1F2329]'}
              data-testid="skills-panel-title"
            >
              {isBusinessTheme ? SKILL_TITLE : INSTALLED}
            </h1>
            {isBusinessTheme && <p className="text-[13px] text-[var(--oc-text-secondary)]">{SKILL_DESC}</p>}
          </div>
          <button
            type="button"
            className={
              isBusinessTheme
                ? 'rounded-[10px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-[18px] py-2 text-[13px] font-semibold text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-bg-surface-soft)] hover:text-[var(--oc-text-title)]'
                : 'rounded-2xl border border-[#DADFE5] bg-white px-[18px] py-2 text-[13px] font-semibold text-[#5F6775] transition-colors hover:bg-[#F7F8FA]'
            }
          >
            {IMPORT_SKILL}
          </button>
        </div>
        <div
          className={
            isBusinessTheme
              ? 'inline-flex w-fit items-center gap-1 rounded-[14px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface-soft)] p-1'
              : 'flex flex-col gap-1'
          }
          data-testid="skills-panel-segments"
        >
          <div className={isBusinessTheme ? 'flex items-center gap-1' : 'flex items-center gap-5'}>
            <button
              type="button"
              onClick={() => setActiveTab('installed')}
              className={`transition-colors ${
                isBusinessTheme
                  ? activeTab === 'installed'
                    ? 'rounded-[10px] bg-[var(--oc-bg-surface)] px-4 py-2 text-[13px] font-semibold text-[var(--oc-text-title)]'
                    : 'rounded-[10px] px-4 py-2 text-[13px] font-medium text-[var(--oc-text-secondary)] hover:text-[var(--oc-text-title)]'
                  : activeTab === 'installed'
                    ? 'text-[24px] font-bold text-[#1F2329]'
                    : 'text-[24px] font-bold text-[#6F7888]'
              }`}
            >
              {INSTALLED}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('plaza')}
              className={`transition-colors ${
                isBusinessTheme
                  ? activeTab === 'plaza'
                    ? 'rounded-[10px] bg-[var(--oc-bg-surface)] px-4 py-2 text-[13px] font-semibold text-[var(--oc-text-title)]'
                    : 'rounded-[10px] px-4 py-2 text-[13px] font-medium text-[var(--oc-text-secondary)] hover:text-[var(--oc-text-title)]'
                  : activeTab === 'plaza'
                    ? 'text-[22px] font-semibold text-[#1F2329]'
                    : 'text-[22px] font-semibold text-[#6F7888]'
              }`}
            >
              {SKILL_PLAZA}
            </button>
          </div>
          {!isBusinessTheme && (
            <div
              className="h-0.5 w-[58px] bg-[#1F2329] transition-all"
              style={{
                transform: activeTab === 'plaza' ? 'translateX(110px)' : 'translateX(0)',
              }}
            />
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className={
            isBusinessTheme
              ? 'rounded-[18px] border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-4 shadow-none'
              : 'rounded-xl border border-[#ECEFF3] bg-white p-4'
          }
        >
          {activeTab === 'plaza' ? <HubSkillsTab /> : <HubCapabilityTab />}
        </div>
      </div>
    </div>
  );
}
