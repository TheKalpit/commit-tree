import { useCallback, useMemo, useRef, useState } from "react";
import styles from "./App.module.scss";
import type {
  CommitWithLevel,
  onPositionChangeType,
  PositionType,
} from "./types.ts";
import { COMMIT_DOT_SIZE } from "./constants.ts";
import sampleData from "./sample-data.ts";
import { CommitCell } from "./commit-cell.tsx";
import {
  Dropdown,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Option,
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import { ChevronLeftRegular, ChevronRightRegular } from "@fluentui/react-icons";
import type {
  OptionOnSelectData,
  SelectionEvents,
} from "@fluentui/react-combobox";
import * as React from "react";

const totalRecords = sampleData.length;

function App() {
  const [nodePositions, setNodePositions] = useState<
    Record<string, PositionType>
  >({});
  const containerRef = useRef<HTMLTableSectionElement | null>(null);

  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);
  const [hoveredHash, setHoveredHash] = useState<string | undefined>(undefined);

  const totalPages = Math.ceil(totalRecords / parseInt(perPage));
  const start = (page - 1) * parseInt(perPage);
  const end = start + parseInt(perPage);

  const pageId = useMemo(() => `p-${page}-${perPage}`, [page, perPage]);

  const commits: CommitWithLevel[] = useMemo(() => {
    // transform sample data: add level field
    let levelCounter = 0;
    const levelMaps: Record<string, number> = {};
    const annotatedCommits: CommitWithLevel[] = sampleData
      .slice(start, end)
      .reverse()
      .map((commit) => {
        if (!(commit.branch in levelMaps)) {
          levelMaps[commit.branch] = levelCounter;
          levelCounter += 1;
        }
        return {
          ...commit,
          level: levelMaps[commit.branch],
        };
      })
      .reverse();
    return annotatedCommits;
  }, [start, end]);

  const handlePositionChange: onPositionChangeType = useCallback(
    (hash, pos) => {
      setNodePositions((prevPositions) => {
        const newPositions = { ...prevPositions };
        if (!pos) {
          delete newPositions[hash];
        } else {
          newPositions[hash] = pos;
        }
        return newPositions;
      });
    },
    [],
  );

  const onPerPageSelect: (
    event: SelectionEvents,
    data: OptionOnSelectData,
  ) => void = (_ev, data) => {
    if (data.optionValue) {
      setPerPage(data.optionValue);
      setPage(1);
    }
  };

  const onNextPageClick = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const onPrevPageClick = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleRowMouseOver = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const hash = event.currentTarget.dataset.hash;
    setHoveredHash(hash);
  };

  const handleRowMouseOut = () => {
    setHoveredHash(undefined);
  };

  const highlightHashes = useMemo(() => {
    const hashes = new Set<string>();
    let currentHash = hoveredHash;
    commits.forEach((commit) => {
      if (commit.hash === currentHash) {
        hashes.add(commit.hash);
        if (commit.source_hash) {
          currentHash = commit.source_hash;
        }
      }
    });
    return hashes;
  }, [commits, hoveredHash]);

  return (
    <div className={styles.mainWrap}>
      <div className={styles.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Map</TableHeaderCell>
              <TableHeaderCell>Version</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody ref={containerRef}>
            <TableRow className={styles.svgRow}>
              <TableCell colSpan={3}>
                <svg className={styles.connectorSvg}>
                  {commits.map((commit, index) => {
                    if (!commit.source_hash) {
                      return null;
                    }

                    const startPos = nodePositions[commit.hash];
                    const endPos = nodePositions[commit.source_hash];

                    if (!startPos || !endPos) {
                      return null;
                    }

                    // line coordinates
                    const startX = startPos.x + COMMIT_DOT_SIZE / 2;
                    const startY = startPos.y + COMMIT_DOT_SIZE / 2;
                    const middleX = startPos.x + COMMIT_DOT_SIZE / 2;
                    const middleY = endPos.y - 20;
                    const endX = endPos.x + COMMIT_DOT_SIZE / 2;
                    const endY = endPos.y + COMMIT_DOT_SIZE / 2;

                    const isHighlighted = highlightHashes.has(commit.hash);

                    return (
                      <polyline
                        key={`${index}-${commit.hash}-${pageId}`}
                        points={`${startX},${startY} ${middleX},${middleY} ${endX},${endY}`}
                        fill="none"
                        strokeWidth={isHighlighted ? 2.5 : 1}
                        strokeLinejoin="miter"
                      />
                    );
                  })}
                </svg>
              </TableCell>
            </TableRow>

            {commits.map((commit, index) => (
              <Dialog key={`${index}-${commit.hash}-${pageId}`}>
                <DialogTrigger disableButtonEnhancement>
                  <TableRow
                    data-hash={commit.hash}
                    onMouseOver={handleRowMouseOver}
                    onMouseOut={handleRowMouseOut}
                  >
                    <TableCell>
                      <CommitCell
                        containerRef={containerRef}
                        data={commit}
                        onPositionChange={handlePositionChange}
                        isHighlighted={highlightHashes.has(commit.hash)}
                      />
                    </TableCell>
                    <TableCell>{commit.version}</TableCell>
                    <TableCell>{commit.message}</TableCell>
                  </TableRow>
                </DialogTrigger>
                <DialogSurface>
                  <DialogBody>
                    <DialogTitle>#{commit.hash}</DialogTitle>
                    <DialogContent>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Hash</TableCell>
                            <TableCell>#{commit.hash}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Branch</TableCell>
                            <TableCell>{commit.branch}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Version</TableCell>
                            <TableCell>{commit.version}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Message</TableCell>
                            <TableCell>{commit.message}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </DialogContent>
                    <DialogActions>
                      <DialogTrigger disableButtonEnhancement>
                        <Button appearance="secondary">Close</Button>
                      </DialogTrigger>
                    </DialogActions>
                  </DialogBody>
                </DialogSurface>
              </Dialog>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className={styles.paginationWrap}>
        <div className={styles.perPageWrap}>
          <span>Items per page:</span>
          <Dropdown value={perPage} onOptionSelect={onPerPageSelect}>
            {["10", "20", "50", "100", "200"].map((option) => (
              <Option key={option} text={option}>
                {option}
              </Option>
            ))}
          </Dropdown>
        </div>
        <span>
          {start + 1} - {end} of {totalRecords}
        </span>
        <div className={styles.btnWrap}>
          <Button
            appearance="subtle"
            icon={<ChevronLeftRegular />}
            disabled={page === 1}
            onClick={onPrevPageClick}
          />
          <Button
            appearance="subtle"
            icon={<ChevronRightRegular />}
            disabled={page === totalPages}
            onClick={onNextPageClick}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
