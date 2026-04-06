import { FC } from "react";

interface AdminSearchBarProps {
  search: string;
  setSearch: (v: string) => void;
  filter: string;
  setFilter: (v: string) => void;
  filterOptions: { value: string; label: string }[];
  onRefresh: () => void;
  refreshing: boolean;
  refreshLabel?: string;
}

const AdminSearchBar: FC<AdminSearchBarProps> = ({
  search,
  setSearch,
  filter,
  setFilter,
  filterOptions,
  onRefresh,
  refreshing,
  refreshLabel = "Refresh",
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder="Search engines…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="admin-search-input"
      />
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="admin-filter-select"
        title="Filter engines by status"
      >
        {filterOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="admin-refresh-btn"
      >
        {refreshing ? "Checking…" : refreshLabel}
      </button>
    </div>
  );
};

export default AdminSearchBar;
