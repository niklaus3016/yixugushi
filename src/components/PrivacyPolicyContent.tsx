import React from 'react';

export const PrivacyPolicyContent: React.FC = () => (
  <div className="max-w-none">
    <h1 className="text-2xl font-bold text-(--accent) text-center mb-2">
      隐私政策
    </h1>
    <p className="text-center text-(--text-muted) mb-6">
      <strong>生效日期</strong>：2026年11月22日
    </p>

    <div className="bg-(--accent-soft) p-6 rounded-lg border-l-4 border-(--accent) mb-6">
      <p className="text-(--text-secondary)">
        欢迎使用「忆序古诗」（以下简称“本应用”）。本应用由
        <strong>光年跃迁（温州）科技有限公司</strong>
        （以下简称“我们”）开发并运营。我们深知个人信息对您的重要性，将严格遵守《中华人民共和国个人信息保护法》等相关法律法规，保护您的个人信息安全。
      </p>
    </div>

    <p className="mb-6 text-(--text-secondary)">
      本隐私政策旨在说明我们如何收集、使用、存储和保护您在使用本应用过程中提供的信息，以及您对这些信息所享有的权利。请您在使用本应用前仔细阅读并充分理解本政策的全部内容，尤其是加粗的条款。如您对本政策有任何疑问、意见或建议，可通过本政策末尾提供的联系方式与我们联系。
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-(--border-hairline) pb-2">
      一、我们收集的信息
    </h2>
    <p className="mb-4 text-(--text-secondary)">
      本应用为古典诗文整理与阅览工具，不设账号体系，亦不设置后端服务器。我们不会收集、读取或向任何外部服务器传输您的姓名、联系方式、设备唯一识别码（如
      IMEI、OAID、MAC 地址）、位置信息、通讯录或操作日志。
    </p>
    <p className="mb-4 text-(--text-secondary)">
      在您使用本应用的过程中，仅会在您当前设备的本地存储空间内保存以下由您主动产生的内容，以提供、维护和改进服务：
    </p>
    <ol className="list-decimal pl-6 mb-6">
      <li className="mb-3 text-(--text-secondary)">
        <strong>自建清单数据</strong>
        ：您主动创建的清单名称、备注，以及清单内收录篇目的排序。这些数据用于为您提供诗文整理与顺序阅览服务。
      </li>
      <li className="mb-3 text-(--text-secondary)">
        <strong>收藏与偏好数据</strong>
        ：您对诗文的收藏标记，以及阅览主题、朗读语速、字号等界面偏好设置。这些数据用于为您提供个性化的阅览体验。
      </li>
    </ol>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-(--border-hairline) pb-2">
      二、我们如何使用收集的信息
    </h2>
    <p className="mb-4 text-(--text-secondary)">
      我们仅会在为您提供本应用功能所必需的范围内使用上述数据：
    </p>
    <ol className="list-decimal pl-6 mb-6">
      <li className="mb-3 text-(--text-secondary)">
        <strong>提供核心功能</strong>
        ：使用您的自建清单、收藏与偏好数据，实现诗文收录、排序阅览、默记、选句补诗、朗读及主题切换等功能。
      </li>
      <li className="mb-3 text-(--text-secondary)">
        <strong>本地处理</strong>
        ：上述数据的全部处理均在您的设备本地完成，不会上传或同步至任何外部服务器。
      </li>
    </ol>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-(--border-hairline) pb-2">
      三、我们如何共享、转让和公开披露信息
    </h2>
    <p className="mb-4 text-(--text-secondary)">
      我们郑重承诺，严格保护您的信息，不会向任何第三方共享、转让或公开披露您的信息，仅在以下情形例外：
    </p>
    <ol className="list-decimal pl-6 mb-6">
      <li className="mb-3 text-(--text-secondary)">
        <strong>法定情形</strong>
        ：根据法律法规的规定、行政或司法机关的强制性要求，我们可能会向有关部门披露您的相关信息。
      </li>
      <li className="mb-3 text-(--text-secondary)">
        <strong>获得明确同意</strong>
        ：在获得您的明确同意后，我们才会向第三方共享您的信息。
      </li>
    </ol>
    <p className="mb-6 text-(--text-secondary)">
      本应用不接入任何第三方统计分析、推送通知、云存储或社交分享类软件开发工具包（SDK），亦不存在因合作而向第三方共享信息的情形。
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-(--border-hairline) pb-2">
      四、我们如何存储和保护信息
    </h2>
    <ol className="list-decimal pl-6 mb-6">
      <li className="mb-3 text-(--text-secondary)">
        <strong>存储地点和期限</strong>
        ：您的数据仅保存在您当前设备的本地存储空间内，不会被传输至境外或任何外部服务器。我们会在实现本政策所述目的所必需的期限内保留您的信息；您可随时主动清除。
      </li>
      <li className="mb-3 text-(--text-secondary)">
        <strong>安全措施</strong>
        ：本应用所有数据均隔离存储于应用自身的本地沙盒中，不会被其他应用读取。请您妥善保管设备，防止未授权访问。
      </li>
    </ol>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-(--border-hairline) pb-2">
      五、您的权利
    </h2>
    <p className="mb-4 text-(--text-secondary)">
      根据相关法律法规，您对您的信息享有以下权利：
    </p>
    <ol className="list-decimal pl-6 mb-6">
      <li className="mb-3 text-(--text-secondary)">
        <strong>访问权</strong>
        ：您可以随时在本应用中查看和管理您的自建清单、收藏与偏好设置。
      </li>
      <li className="mb-3 text-(--text-secondary)">
        <strong>更正权</strong>
        ：如您发现清单内容存在错误，您可以在应用内进行修改和更正。
      </li>
      <li className="mb-3 text-(--text-secondary)">
        <strong>删除权</strong>
        ：您可以随时在「我的 → 本机数据重置」中清空全部自建清单或全部收藏标记，应用将立即删除相关数据。
      </li>
      <li className="mb-3 text-(--text-secondary)">
        <strong>数据导出</strong>
        ：本应用所有数据均存储在您的设备本地，您可以通过设备备份等方式留存您的数据。
      </li>
    </ol>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-(--border-hairline) pb-2">
      六、未成年人保护
    </h2>
    <p className="mb-6 text-(--text-secondary)">
      我们非常重视对未成年人个人信息的保护。如您是未满14周岁的未成年人，在使用本应用前，应在监护人的指导下仔细阅读本政策，并征得监护人的同意。
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-(--border-hairline) pb-2">
      七、本政策的更新
    </h2>
    <p className="mb-6 text-(--text-secondary)">
      我们可能会根据法律法规的更新、业务的调整或技术的发展，适时对本隐私政策进行修订。修订后的政策将在本应用内显著位置公示。如您继续使用本应用，即表示您同意接受修订后的政策。
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-(--border-hairline) pb-2">
      八、联系我们
    </h2>
    <p className="mb-4 text-(--text-secondary)">
      如您对本隐私政策有任何疑问、意见或建议，或需要行使您的相关权利，请通过以下方式与我们联系：
    </p>
    <div className="bg-(--bg-subtle) p-4 rounded-lg border border-(--border-hairline) mb-6">
      <p className="mb-2 text-(--text-secondary)">
        <strong>电子邮箱</strong>：Jp112022@163.com
      </p>
    </div>

    <div className="mt-8 pt-6 border-t border-(--border-hairline) text-center">
      <p className="mb-2 text-(--text-muted)">感谢您使用忆序古诗！</p>
      <p className="mb-4 text-(--text-muted)">
        我们致力于为您提供沉静、雅致的诗文整理与阅览体验。
      </p>
      <p className="text-sm text-(--text-muted)">
        © 2026 光年跃迁（温州）科技有限公司 版权所有
      </p>
    </div>
  </div>
);
