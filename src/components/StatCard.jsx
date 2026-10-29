import React from "react";
export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  tone = "cream",
  note,
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        {change && (
          <span className={change.startsWith("-") ? "negative" : "positive"}>
            {change}
          </span>
        )}
        <span>{note}</span>
      </div>
    </article>
  );
}
