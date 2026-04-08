"use client";

import { useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchBar({ value, onChange, className }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Search icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <path
          d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
          stroke="#8492A8"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search make, model, or keyword"
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          fontFamily: 'var(--ac-font-body, "Inter", sans-serif)',
          fontSize: "16px",
          fontWeight: 400,
          color: "#0F1724",
          padding: "16px 56px 16px 48px",
          backgroundColor: "transparent",
        }}
        onFocus={(e) => {
          const container = e.currentTarget.parentElement;
          if (container) {
            container.style.borderColor = "#008C7C";
            container.style.boxShadow = "0 0 0 3px rgba(0,140,124,0.1)";
          }
        }}
        onBlur={(e) => {
          const container = e.currentTarget.parentElement;
          if (container) {
            container.style.borderColor = "#E2E8F0";
            container.style.boxShadow = "none";
          }
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#C8CDD6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
