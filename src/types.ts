export interface Commit {
  hash: string;
  message: string;
  branch: string;
  version: "branch" | "commit" | "release";
  source_hash: string | null;
}

export interface CommitWithLevel extends Commit {
  level: number;
}

export type PositionType = { x: number; y: number };

export type onPositionChangeType = (
  hash: string,
  pos: PositionType | null,
) => void;
