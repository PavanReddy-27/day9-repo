import { memo, useMemo, useState } from "react";

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Pagination,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import "./DrillDownContent.css";

export interface DrillDownItem {
  id: string;
  label: string;
  value: number | string;
  percentage?: number;
}

interface DrillDownContentProps {
  items: DrillDownItem[];
  title?: string;
  loading?: boolean;
  emptyMessage?: string;
}

const ROWS_PER_PAGE = 8;

const DrillDownContent = ({
  items,
  title = "Breakdown",
  loading = false,
  emptyMessage = "No records found.",
}: DrillDownContentProps) => {
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState<
    "value" | "label"
  >("value");

  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) =>
      item.label
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === "label") {
        return a.label.localeCompare(b.label);
      }

      return Number(b.value) - Number(a.value);
    });
  }, [items, search, sortBy]);

  const totalPages = Math.ceil(
    filteredItems.length / ROWS_PER_PAGE
  );

  const pageItems = filteredItems.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  if (loading) {
    return (
      <Box className="drilldown-content">
        <Typography>
          Loading analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="drilldown-content">
      {/* Header */}

      <Box className="drilldown-content__header">
        <Typography variant="h6">
          {title}
        </Typography>

        <Chip
          color="primary"
          label={`${filteredItems.length} Records`}
        />
      </Box>

      {/* Controls */}

      <Box className="drilldown-content__toolbar">
       <TextField
  fullWidth
  size="small"
  value={search}
  placeholder="Search..."
  onChange={(event) => {
    setSearch(event.target.value);
    setPage(1);
  }}
  slotProps={{
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      ),
    },
  }}

        />

       <TextField
  select
  size="small"
  value={sortBy}
  sx={{ width: 180 }}
  onChange={(event) =>
    setSortBy(event.target.value as "label" | "value")
  }
  slotProps={{
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <SortIcon />
        </InputAdornment>
      ),
    },
  }}
        >
          <MenuItem value="value">
            Highest Value
          </MenuItem>

          <MenuItem value="label">
            Alphabetical
          </MenuItem>
        </TextField>
      </Box>

      <Divider />

      {/* Empty */}

      {!filteredItems.length && (
        <Box className="drilldown-content__empty">
          <FolderOpenIcon />

          <Typography variant="h6">
            {emptyMessage}
          </Typography>
        </Box>
      )}

      {/* List */}

      {!!filteredItems.length && (
        <>
          <Box className="drilldown-content__list">
            {pageItems.map((item) => (
              <Box
                key={item.id}
                className="drilldown-content__card"
              >
                <Box>
                  <Typography
                    className="drilldown-content__label"
                  >
                    {item.label}
                  </Typography>

                  {item.percentage !==
                    undefined && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {item.percentage}%
                    </Typography>
                  )}
                </Box>

                <Chip
                  color="primary"
                  label={item.value}
                />
              </Box>
            ))}
          </Box>

          {totalPages > 1 && (
            <Box className="drilldown-content__pagination">
              <Pagination
                color="primary"
                page={page}
                count={totalPages}
                onChange={(_, value) =>
                  setPage(value)
                }
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default memo(DrillDownContent);