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
} from "@fluentui/react-components";
import { ChevronLeftRegular, ChevronRightRegular } from "@fluentui/react-icons";
import type {
  OptionOnSelectData,
  SelectionEvents,
} from "@fluentui/react-combobox";

const totalRecords = sampleData.length;

function App() {
  const [nodePositions, setNodePositions] = useState<
    Record<string, PositionType>
  >({});
  const containerRef = useRef<HTMLTableSectionElement | null>(null);
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(totalRecords / parseInt(perPage));
  const start = (page - 1) * parseInt(perPage);
  const end = start + parseInt(perPage);

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

                    return (
                      <polyline
                        key={index}
                        points={`${startX},${startY} ${middleX},${middleY} ${endX},${endY}`}
                        fill="none"
                        strokeLinejoin="miter"
                      />
                    );
                  })}
                </svg>
              </TableCell>
            </TableRow>

            {commits.map((commit, index) => (
              <TableRow key={`${index}-${commit.hash}`}>
                <TableCell>
                  <CommitCell
                    containerRef={containerRef}
                    data={commit}
                    onPositionChange={handlePositionChange}
                  />
                </TableCell>
                <TableCell>{commit.version}</TableCell>
                <TableCell>{commit.message}</TableCell>
              </TableRow>
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
