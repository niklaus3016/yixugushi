import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { DocumentModal } from './DocumentModal';
import { PrivacyPolicyContent } from './PrivacyPolicyContent';
import { UserAgreementContent } from './UserAgreementContent';

interface PrivacyConsentGateProps {
  onAccept: () => void;
}

type DocView = 'agreement' | 'privacy' | null;

export const PrivacyConsentGate: React.FC<PrivacyConsentGateProps> = ({
  onAccept,
}) => {
  const [docView, setDocView] = useState<DocView>(null);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    if (!docView && !showDeclineConfirm) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeclineConfirm) setShowDeclineConfirm(false);
        else if (docView) setDocView(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [docView, showDeclineConfirm]);

  // 已拒绝：展示无法使用的遮罩态，允许重新查看
  if (declined) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--bg-canvas)] flex items-center justify-center p-6">
        <div className="modal-pop w-full max-w-sm text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            暂无法使用
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            您尚未同意《用户服务协议》与《隐私政策》，忆序古诗的功能暂不可用。您可重新查看后选择同意。
          </p>
          <button
            type="button"
            onClick={() => setDeclined(false)}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl text-sm font-medium bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
          >
            重新查看
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 主同意弹窗 */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        <div className="modal-pop bg-[var(--bg-surface)] w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto rounded-[28px]">
          <div className="p-6">
            <h3
              id="consent-title"
              className="text-xl font-bold text-[var(--text-primary)] mb-6 text-center pt-4"
            >
              用户协议与隐私政策
            </h3>
            <div className="mb-6">
              <p className="text-base text-[var(--text-primary)] mb-3">
                (1)《隐私政策》中关于您自建清单、收藏标记与阅览偏好等数据的本地存储说明。
              </p>
              <p className="text-base text-[var(--text-primary)]">
                (2)《隐私政策》中关于我们如何保护您的数据及您所享有权利的说明。
              </p>
            </div>
            <div className="mb-6">
              <p className="text-sm text-[var(--text-muted)] mb-2">
                用户协议和隐私政策说明：
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                阅读完整的
                <span
                  onClick={() => setDocView('agreement')}
                  className="text-[var(--accent)] hover:underline cursor-pointer font-medium"
                >
                  《用户服务协议》
                </span>
                和
                <span
                  onClick={() => setDocView('privacy')}
                  className="text-[var(--accent)] hover:underline cursor-pointer font-medium"
                >
                  《隐私政策》
                </span>
                了解详细内容。
              </p>
            </div>
          </div>
          <div className="flex border-t border-[var(--border-hairline)]">
            <button
              type="button"
              onClick={() => setShowDeclineConfirm(true)}
              className="flex-1 py-4 text-base font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] border-r border-[var(--border-hairline)] rounded-bl-[28px] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            >
              不同意
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="flex-1 py-4 text-base font-medium text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-br-[28px] transition-colors cursor-pointer"
            >
              同意并继续
            </button>
          </div>
        </div>
      </div>

      {/* 协议 / 隐私 正文弹窗 */}
      {docView === 'agreement' && (
        <DocumentModal
          title="用户服务协议"
          onClose={() => setDocView(null)}
        >
          <UserAgreementContent />
        </DocumentModal>
      )}
      {docView === 'privacy' && (
        <DocumentModal title="隐私政策" onClose={() => setDocView(null)}>
          <PrivacyPolicyContent />
        </DocumentModal>
      )}

      {/* 拒绝确认弹窗 */}
      {showDeclineConfirm && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowDeclineConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="decline-confirm-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-pop bg-[var(--bg-surface)] rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl border border-[var(--border-hairline)] flex flex-col"
          >
            <div className="flex-1 p-6">
              <h2
                id="decline-confirm-title"
                className="text-xl font-bold text-[var(--text-primary)] mb-4"
              >
                确认拒绝
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                您确定要拒绝吗？拒绝后将无法使用忆序古诗的服务。
              </p>
            </div>
            <div className="flex border-t border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() => setShowDeclineConfirm(false)}
                className="flex-1 py-4 text-center text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              >
                取消
              </button>
              <div className="w-px bg-[var(--border-hairline)]"></div>
              <button
                type="button"
                onClick={() => {
                  setShowDeclineConfirm(false);
                  setDeclined(true);
                }}
                className="flex-1 py-4 text-center text-[var(--accent)] font-medium hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
