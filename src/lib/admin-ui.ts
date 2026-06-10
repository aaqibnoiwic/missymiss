export const ADMIN_PAGE_SIZE = 25;

export function readPage(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function readQuery(value: string | string[] | undefined) {
  return String(Array.isArray(value) ? value[0] : value ?? "").trim();
}

export type AdminActionState = {
  success: boolean;
  message: string;
  fieldErrors: Record<string, string>;
  formError: string;
  entityId?: string;
};

export const initialAdminActionState: AdminActionState = {
  success: false,
  message: "",
  fieldErrors: {},
  formError: "",
};
