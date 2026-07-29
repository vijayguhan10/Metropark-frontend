import { useState, useMemo } from "react";
import { SearchInput } from "./SearchInput";
import { SelectFilter } from "./SelectFilter";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { X } from "lucide-react";

export const DataTable = ({
  columns,
  data,
  keyField,
  emptyMessage = "No data available",
  searchKey,
  filters = {},
  onFiltersChange,
  filterOptions = {},
  showSearch = true,
  showFilters = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const filteredData = useMemo(() => {
    const dataArray = Array.isArray(data) ? data : [];
    return dataArray.filter((row) => {
      if (searchTerm && searchKey) {
        const searchValue = String(row[searchKey] || "").toLowerCase();
        if (!searchValue.includes(searchTerm.toLowerCase())) return false;
      }

      for (const [filterKey, filterValue] of Object.entries(localFilters)) {
        if (
          !filterValue ||
          (Array.isArray(filterValue) && filterValue.length === 0)
        )
          continue;

        const rowValue = row[filterKey];
        if (Array.isArray(filterValue)) {
          if (!filterValue.includes(rowValue)) return false;
        } else if (rowValue !== filterValue) {
          return false;
        }
      }
      return true;
    });
  }, [data, searchTerm, searchKey, localFilters]);

  const hasActiveFilters = Object.values(localFilters).some(
    (v) => v && (Array.isArray(v) ? v.length > 0 : true),
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setLocalFilters({});
    onFiltersChange?.({});
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {(showSearch || showFilters) && (
        <div className="border-b border-slate-200 p-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {showSearch && (
              <div className="w-full sm:w-72">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search..."
                  onClear={() => setSearchTerm("")}
                />
              </div>
            )}
            {showFilters && (
              <div className="flex flex-wrap gap-3">
                {Object.entries(filterOptions).map(([key, options]) => (
                  <div key={key} className="w-48">
                    {options.type === "multi" ? (
                      <MultiSelectFilter
                        value={localFilters[key] || []}
                        onChange={(v) => handleFilterChange(key, v)}
                        options={options.options}
                        placeholder={options.placeholder}
                      />
                    ) : (
                      <SelectFilter
                        value={localFilters[key] || ""}
                        onChange={(v) => handleFilterChange(key, v)}
                        options={options.options}
                        placeholder={options.placeholder}
                      />
                    )}
                  </div>
                ))}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-slate-600 uppercase tracking-[0.1em] ${col.align ? `text-${col.align}` : ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr
                  key={row[keyField]}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-slate-700 ${col.align ? `text-${col.align}` : ""}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filteredData.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          Showing {filteredData.length} of {data.length} records
        </div>
      )}
    </div>
  );
};