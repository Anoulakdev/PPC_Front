"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

export interface SearchSelectOption {
  value: string;
  label: string;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
  emptyText?: string;
}

export default function SearchSelect({
  options,
  value = "",
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
  allowClear = true,
  showAllOption = true,
  allOptionLabel,
  emptyText = "No results found",
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allOption = useMemo(() => {
    if (!showAllOption) return null;
    return {
      value: "",
      label: allOptionLabel || placeholder || "Select All",
    };
  }, [showAllOption, allOptionLabel, placeholder]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result: SearchSelectOption[] = [];

    if (allOption) {
      if (!query || allOption.label.toLowerCase().includes(query)) {
        result.push(allOption);
      }
    }

    const filtered = options.filter(
      (opt) =>
        opt.value !== "" &&
        (opt.label || "").toLowerCase().includes(query)
    );

    return [...result, ...filtered];
  }, [options, searchQuery, allOption]);

  // Find currently selected option label
  const selectedLabel = useMemo(() => {
    if (!value || value === "") {
      return allOption ? allOption.label : "";
    }
    const found = options.find((opt) => opt.value === value);
    return found ? found.label : value;
  }, [value, options, allOption]);

  const isDefaultSelected = !value || value === "";

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-select-option]");
      const target = items[highlightedIndex] as HTMLElement;
      if (target) {
        target.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`shadow-theme-xs flex h-11 w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition focus:outline-hidden ${
          isOpen
            ? "border-brand-500 ring-3 ring-brand-500/10 dark:border-brand-500"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
        } bg-white dark:bg-gray-900 ${className}`}
      >
        <span
          className={`truncate font-normal ${
            isDefaultSelected
              ? "text-gray-500 dark:text-gray-400"
              : "text-gray-800 dark:text-white/90"
          }`}
        >
          {selectedLabel || placeholder}
        </span>

        <div className="flex items-center gap-1.5 pl-2 shrink-0">
          {allowClear && !isDefaultSelected && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
              title="Clear selection"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          )}

          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-gray-400 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
            <div className="relative flex items-center">
              <svg
                className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-200 bg-white py-1.5 pl-9 pr-8 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div ref={listRef} className="max-h-60 overflow-y-auto py-1 text-sm">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = (value ?? "") === opt.value;
                const isHighlighted = highlightedIndex === index;

                return (
                  <div
                    key={opt.value || `opt-all-${index}`}
                    data-select-option
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between px-3.5 py-2 cursor-pointer select-none transition-colors ${
                      isSelected
                        ? "bg-brand-50 text-brand-600 font-medium dark:bg-brand-900/30 dark:text-brand-300"
                        : isHighlighted
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <svg
                        className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                {emptyText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
