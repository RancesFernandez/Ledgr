import React from "react";
export function usePagination(rows, page, setPage, size, setSize) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pages);
  return {
    items: rows.slice((current - 1) * size, current * size),
    current,
    pages,
    controls: (
      <nav className="pagination-controls" aria-label="Paginación">
        <span>{rows.length} resultados</span>
        <label>
          Por página{" "}
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={current === 1}
          onClick={() => setPage(current - 1)}
        >
          Anterior
        </button>
        <span>
          Página {current} de {pages}
        </span>
        <button
          type="button"
          disabled={current === pages}
          onClick={() => setPage(current + 1)}
        >
          Siguiente
        </button>
      </nav>
    ),
  };
}
