import { AdminShell } from "@/components/admin/admin-shell";
import { MediaUploadPanel } from "@/components/admin/media-upload-panel";
import { requireAdmin } from "@/lib/admin-auth";
import { isImageKitConfigured } from "@/lib/imagekit";
import { listMediaAssets } from "@/lib/media-assets";
export default async function ManageMediaPage() { await requireAdmin(); return <AdminShell eyebrow="Asset library" title="Upload media"><MediaUploadPanel initialAssets={await listMediaAssets().catch(() => [])} storageEnabled={isImageKitConfigured()} /></AdminShell>; }
