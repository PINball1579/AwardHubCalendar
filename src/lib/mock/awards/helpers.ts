import type { CreditRow } from "../types";

/** Zip the parallel Company / Location / Role columns from Figma into rows. */
export function credits(
  companies: string[],
  locations: string[],
  roles: string[],
): CreditRow[] {
  return companies.map((company, i) => ({
    company,
    location: locations[i] ?? "",
    role: roles[i] ?? "",
  }));
}
