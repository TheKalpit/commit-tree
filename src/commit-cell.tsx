import type { CommitWithLevel, onPositionChangeType } from "./types.ts";
import { useLayoutEffect, useRef } from "react";
import styles from "./App.module.scss";
import { COMMIT_DOT_SIZE, COMMIT_MAP_GAP } from "./constants.ts";
import * as React from "react";

const CommitCell = ({
  data,
  onPositionChange,
  containerRef,
  isHighlighted,
}: {
  data: CommitWithLevel;
  onPositionChange: onPositionChangeType;
  containerRef: React.RefObject<HTMLElement>;
  isHighlighted?: boolean;
}) => {
  const ref = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    // useLayoutEffect instead of useEffect to avoid UI "flickering" on some devices
    if (ref.current && containerRef.current) {
      const wrapperRect = containerRef.current.getBoundingClientRect();
      const dotRect = ref.current.getBoundingClientRect();

      // Calculate position relative to the grid wrapper, not the viewport
      const relativePos = {
        x: dotRect.x - wrapperRect.x,
        y: dotRect.y - wrapperRect.y,
      };
      onPositionChange(data.hash, relativePos);
    }

    return () => {
      onPositionChange(data.hash, null);
    };
  }, [data.hash, onPositionChange, data.level]);

  return (
    <span
      id={`node-${data.hash}`}
      ref={ref}
      className={styles.commitDot}
      data-version={data.version}
      style={{
        width: `${COMMIT_DOT_SIZE}px`,
        height: `${COMMIT_DOT_SIZE}px`,
        marginLeft: `${COMMIT_MAP_GAP * data.level}px`,
        transform: isHighlighted ? "scale(2)" : "scale(1)",
      }}
    />
  );
};

export { CommitCell };
