const escapeXml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
const colName = (n) => { let s = ""; while (n) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
export function exportStyledWorkbook(filename, sheets) {
  const styles = `
  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Aptos" ss:Size="10" ss:Color="#263238"/><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/></Style>
  <Style ss:ID="title"><Font ss:FontName="Aptos Display" ss:Size="18" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#344F78" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/><Protection ss:Protected="1"/></Style>
  <Style ss:ID="subtitle"><Font ss:Size="10" ss:Italic="1" ss:Color="#64748B"/><Alignment ss:Vertical="Center"/></Style>
  <Style ss:ID="header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#5878A8" ss:Pattern="Solid"/><Alignment ss:Vertical="Center" ss:WrapText="1"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#344F78"/></Borders></Style>
  <Style ss:ID="text"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E7ECF3"/></Borders></Style>
  <Style ss:ID="money"><NumberFormat ss:Format="&quot;$&quot; #,##0.00;[Red]-&quot;$&quot; #,##0.00"/><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E7ECF3"/></Borders></Style>
  <Style ss:ID="number"><NumberFormat ss:Format="#,##0.00"/><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E7ECF3"/></Borders></Style>
  <Style ss:ID="percent"><NumberFormat ss:Format="0.0%"/><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E7ECF3"/></Borders></Style>
  <Style ss:ID="total"><Font ss:Bold="1" ss:Color="#263238"/><Interior ss:Color="#EAF0F8" ss:Pattern="Solid"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#5878A8"/></Borders></Style>`;
  const worksheets = sheets.map((sheet) => {
    const rows = sheet.rows || [];
    const xmlRows = rows.map((row, ri) => {
      const cells = row.map((cell, ci) => {
        const obj = cell && typeof cell === "object" && !Array.isArray(cell) ? cell : { value: cell };
        const value = obj.value ?? "";
        const type = typeof value === "number" && Number.isFinite(value) ? "Number" : "String";
        const style = obj.style || (ri === 0 ? "title" : ri === 1 ? "subtitle" : ri === 2 ? "header" : "text");
        return `<Cell ss:StyleID="${style}"${obj.mergeAcross ? ` ss:MergeAcross="${obj.mergeAcross}"` : ""}><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
      }).join("");
      return `<Row ss:Height="${ri === 0 ? 30 : ri === 2 ? 32 : 22}">${cells}</Row>`;
    }).join("");
    const widths = (sheet.widths || []).map((w, i) => `<Column ss:Index="${i + 1}" ss:Width="${w}"/>`).join("");
    return `<Worksheet ss:Name="${escapeXml(sheet.name || "Datos")}"><Table>${widths}${xmlRows}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>3</SplitHorizontal><TopRowBottomPane>3</TopRowBottomPane><ActivePane>2</ActivePane></WorksheetOptions></Worksheet>`;
  }).join("");
  const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel"><Styles>${styles}</Styles>${worksheets}</Workbook>`;
  const blob = new Blob(["\ufeff", xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename.endsWith(".xls") ? filename : `${filename}.xls`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
