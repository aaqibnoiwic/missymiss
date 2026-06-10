import { AdminShell } from "@/components/admin/admin-shell";
import { CmsManagementPanel } from "@/components/admin/cms-management-panel";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminCmsData } from "@/lib/cms";

export default async function AdminContentPage() {
  await requireAdmin();
  return <AdminShell eyebrow="Editorial CMS" title="Pages & collections"><CmsManagementPanel data={await getAdminCmsData()} /></AdminShell>;
}
