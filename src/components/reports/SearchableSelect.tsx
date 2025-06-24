// components/reports/SearchableSelect.tsx
import React, { useState, useMemo } from "react";

interface SearchableSelectProps {
  options: string[];
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  label,
  value,
  onChange,
  placeholder = "Select...",
}) => {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  return (
    <label className="block mb-2">
      <span className="block font-medium mb-1">{label}</span>
      <input
        type="text"
        className="w-full border rounded px-3 py-2 mb-1"
        placeholder={`Search ${placeholder}`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="w-full border rounded px-3 py-2"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setSearch("");
        }}
        size={5}
      >
        {filteredOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SearchableSelect;
