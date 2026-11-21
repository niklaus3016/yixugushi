import React from 'react';

export const UserAgreementContent: React.FC = () => (
  <div className="max-w-none">
    <h1 className="text-2xl font-bold text-[var(--accent)] text-center mb-4">
      用户服务协议
    </h1>
    <p className="text-center text-[var(--text-muted)] mb-8">
      更新日期：2026年11月22日
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-4">1. 协议的接受</h2>
    <p className="mb-3 text-[var(--text-secondary)]">
      欢迎使用「忆序古诗」应用（以下简称「本应用」）。
    </p>
    <p className="mb-3 text-[var(--text-secondary)]">
      本协议是您与光年跃迁（温州）科技有限公司（以下简称「我们」）之间关于使用本应用的法律协议。
    </p>
    <p className="mb-3 text-[var(--text-secondary)]">
      通过下载、安装或使用本应用，您表示同意接受本协议的全部条款和条件。
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-4">2. 服务内容</h2>
    <p className="mb-3 text-[var(--text-secondary)]">本应用提供以下服务：</p>
    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li className="text-[var(--text-secondary)]">古典诗文的收录、整理与顺序阅览</li>
      <li className="text-[var(--text-secondary)]">自建清单的创建、排序与管理</li>
      <li className="text-[var(--text-secondary)]">
        诗文收藏标记与阅览主题、朗读等偏好设置
      </li>
      <li className="text-[var(--text-secondary)]">诗文默记与「选句补诗」闲趣玩法</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-4">3. 用户义务</h2>
    <p className="mb-3 text-[var(--text-secondary)]">作为本应用的用户，您同意：</p>
    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li className="text-[var(--text-secondary)]">遵守本协议的所有条款</li>
      <li className="text-[var(--text-secondary)]">不使用本应用进行任何非法活动</li>
      <li className="text-[var(--text-secondary)]">不干扰本应用的正常运行</li>
      <li className="text-[var(--text-secondary)]">保护您的设备安全，防止未授权访问</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-4">4. 知识产权</h2>
    <p className="mb-3 text-[var(--text-secondary)]">
      本应用的界面设计、软件代码及整理编排内容，均受知识产权法律保护。
    </p>
    <p className="mb-3 text-[var(--text-secondary)]">
      应用内收录的诗文作品源自公开传世古典文献，仅供个人阅览与整理之用。未经我们的书面许可，您不得复制、修改、分发或商业使用本应用的软件内容。
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-4">5. 免责声明</h2>
    <p className="mb-3 text-[var(--text-secondary)]">
      本应用按「原样」提供，不做任何形式的保证。
    </p>
    <p className="mb-3 text-[var(--text-secondary)]">我们不保证：</p>
    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li className="text-[var(--text-secondary)]">本应用将符合您的要求</li>
      <li className="text-[var(--text-secondary)]">本应用将无中断、及时、安全或无错误地运行</li>
      <li className="text-[var(--text-secondary)]">本应用的使用结果将是准确或可靠的</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-4">6. 终止</h2>
    <p className="mb-3 text-[var(--text-secondary)]">
      我们有权在任何时候，出于任何原因，终止或暂停您对本应用的访问。
    </p>
    <p className="mb-3 text-[var(--text-secondary)]">您也可以随时停止使用本应用。</p>

    <h2 className="text-xl font-semibold mt-8 mb-4">7. 适用法律</h2>
    <p className="mb-3 text-[var(--text-secondary)]">
      本协议受中华人民共和国法律管辖。
    </p>
    <p className="mb-3 text-[var(--text-secondary)]">
      任何与本协议相关的争议，应通过友好协商解决；协商不成的，应提交至温州市有管辖权的人民法院诉讼解决。
    </p>
  </div>
);
