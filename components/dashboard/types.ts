/** Identite affichee dans la barre superieure. */
export interface ShellUser {
  email: string;
  initials: string;
}

/** Consommation cumulee de tous les assistants du compte. */
export interface ShellUsage {
  used: number;
  quota: number;
}
