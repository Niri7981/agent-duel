export type ArenaProgramClient = {
  programId: string;
};

export function getArenaProgramClient(): ArenaProgramClient {
  return {
    programId: process.env.NEXT_PUBLIC_ARENA_PROGRAM_ID ?? "ARENA_DEMO_PROGRAM",
  };
}
