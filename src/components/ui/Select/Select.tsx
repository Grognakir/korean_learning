"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { classNames } from "@/lib/utilities";

import styles from "./Select.module.css";

export type SelectOption = {
  readonly value: string;
  readonly label: string;
  readonly lang?: string;
};

export type SelectProps = {
  readonly id?: string;
  readonly value: string;
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly "aria-labelledby"?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly onChange: (value: string) => void;
};

export function Select({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  disabled = false,
  id,
  onChange,
  options,
  placeholder = "Выберите значение",
  value,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedOption = options.find((option) => option.value === value) ?? null;
  const selectedLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  function close() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function open() {
    if (disabled) {
      return;
    }

    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }

  function selectValue(nextValue: string) {
    onChange(nextValue);
    close();
  }

  function moveActive(delta: number) {
    if (options.length === 0) {
      return;
    }

    setActiveIndex((current) => {
      const start = current < 0 ? (delta > 0 ? -1 : 0) : current;
      return (start + delta + options.length) % options.length;
    });
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          open();
        } else {
          moveActive(1);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          open();
        } else {
          moveActive(-1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen) {
          open();
          break;
        }
        if (activeIndex >= 0 && options[activeIndex]) {
          selectValue(options[activeIndex].value);
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;
      case "Tab":
        close();
        break;
      default:
        break;
    }
  }

  return (
    <div className={classNames(styles.root, className)} data-select-root="" ref={rootRef}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={styles.trigger}
        disabled={disabled}
        id={selectId}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        role="combobox"
        type="button"
      >
        <span
          className={classNames(styles.value, !selectedOption && styles.placeholder)}
          lang={selectedOption?.lang}
        >
          {selectedLabel}
        </span>
        <span aria-hidden="true" className={styles.chevron} />
      </button>

      {isOpen ? (
        <ul
          aria-activedescendant={
            activeIndex >= 0 ? `${selectId}-option-${options[activeIndex]?.value}` : undefined
          }
          className={styles.listbox}
          id={listboxId}
          role="listbox"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            const optionDomId = `${selectId}-option-${option.value}`;

            return (
              <li
                aria-selected={isSelected}
                className={classNames(
                  styles.option,
                  isSelected && styles.optionSelected,
                  isActive && styles.optionActive,
                )}
                id={optionDomId}
                key={option.value}
                lang={option.lang}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectValue(option.value);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
