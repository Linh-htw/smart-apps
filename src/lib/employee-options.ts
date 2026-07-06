export const rollen = ["Admin", "Werkstatt-Hilfe", "Packer"] as const;

export type Rolle = (typeof rollen)[number];

export type Permission =
  | "manageCustomers"
  | "manageEmployees"
  | "manageInventory"
  | "manageOrders"
  | "manageProducts"
  | "createBatches"
  | "viewPacklists";

export function isRolle(value: string): value is Rolle {
  return rollen.includes(value as Rolle);
}

export function getPermissionsForRolle(rolle: Rolle): Permission[] {
  if (rolle === "Admin") {
    return [
      "manageCustomers",
      "manageEmployees",
      "manageInventory",
      "manageOrders",
      "manageProducts",
      "createBatches",
      "viewPacklists",
    ];
  }

  if (rolle === "Werkstatt-Hilfe") {
    return ["createBatches"];
  }

  return ["viewPacklists"];
}

export function canAccess(rolle: Rolle, permission: Permission) {
  return getPermissionsForRolle(rolle).includes(permission);
}
