export type AdmissionLease = {
  release: () => void;
};

export type AdmissionGate = {
  acquire: () => AdmissionLease | null;
  activeCount: () => number;
};

export function createAdmissionGate(maxConcurrent = 1): AdmissionGate {
  if (!Number.isInteger(maxConcurrent) || maxConcurrent < 1) {
    throw new Error("maxConcurrent must be a positive integer");
  }

  let active = 0;

  return {
    acquire() {
      if (active >= maxConcurrent) return null;
      active += 1;
      let released = false;

      return {
        release() {
          if (released) return;
          released = true;
          active = Math.max(0, active - 1);
        },
      };
    },
    activeCount() {
      return active;
    },
  };
}

const globalAdmission = globalThis as typeof globalThis & {
  portfolioChatAdmission?: AdmissionGate;
};

export const portfolioChatAdmission =
  globalAdmission.portfolioChatAdmission ?? createAdmissionGate(1);

globalAdmission.portfolioChatAdmission = portfolioChatAdmission;
