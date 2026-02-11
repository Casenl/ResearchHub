import fs from "fs";
import path from "path";
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

/**
 * Custom Playwright reporter that generates a single-file HTML report
 * with a "Copy" button for sharing test results via Slack, email, etc.
 */

interface TestEntry {
  title: string;
  file: string;
  line: number;
  project: string;
  status: "passed" | "failed" | "timedOut" | "skipped" | "interrupted";
  duration: number;
  error?: string;
  screenshot?: string;
}

class ClipboardReporter implements Reporter {
  private tests: TestEntry[] = [];
  private outputFile: string;

  constructor(options: { outputFile?: string } = {}) {
    this.outputFile =
      options.outputFile ??
      path.join(process.cwd(), "playwright-report", "summary.html");
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const entry: TestEntry = {
      title: test.titlePath().slice(1).join(" > "),
      file: path.relative(process.cwd(), test.location.file).replace(/\\/g, "/"),
      line: test.location.line,
      project: test.parent.project()?.name ?? "",
      status: result.status,
      duration: result.duration,
    };

    if (result.status === "failed" || result.status === "timedOut") {
      const err = result.errors?.[0];
      if (err) {
        entry.error = err.message ?? err.stack ?? String(err);
      }
    }

    this.tests.push(entry);
  }

  onEnd(result: FullResult): void {
    const passed = this.tests.filter((t) => t.status === "passed").length;
    const failed = this.tests.filter(
      (t) => t.status === "failed" || t.status === "timedOut"
    ).length;
    const skipped = this.tests.filter((t) => t.status === "skipped").length;
    const total = this.tests.length;
    const totalDuration = this.tests.reduce((s, t) => s + t.duration, 0);

    const dir = path.dirname(this.outputFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(this.outputFile, this.buildHtml(passed, failed, skipped, total, totalDuration, result.status));
    console.log(`\nClipboard report: ${this.outputFile}`);
  }

  private buildHtml(
    passed: number,
    failed: number,
    skipped: number,
    total: number,
    totalDuration: number,
    overallStatus: string
  ): string {
    const failedTests = this.tests.filter(
      (t) => t.status === "failed" || t.status === "timedOut"
    );
    const passedTests = this.tests.filter((t) => t.status === "passed");
    const skippedTests = this.tests.filter((t) => t.status === "skipped");

    const statusColor =
      failed > 0 ? "#ef4444" : passed === total ? "#22c55e" : "#f59e0b";

    const testsJson = JSON.stringify(this.tests);

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>E2E Test Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0f1117;color:#e5e5e5;padding:24px;line-height:1.5}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
  .header h1{font-size:20px;font-weight:700;color:#fff}
  .header p{font-size:13px;color:#888;margin-top:4px}
  .actions{display:flex;gap:8px;flex-shrink:0}
  button{padding:8px 16px;border-radius:6px;border:1px solid #333;background:#1a1a2e;color:#e5e5e5;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:6px}
  button:hover{background:#252540;border-color:#555}
  button.primary{background:#1d4ed8;border-color:#1d4ed8;color:#fff}
  button.primary:hover{background:#2563eb}
  button svg{width:14px;height:14px}
  .stats{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
  .stat{padding:12px 20px;border-radius:8px;background:#1a1a2e;border:1px solid #2a2a3e;min-width:100px}
  .stat .value{font-size:24px;font-weight:700}
  .stat .label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
  .stat.pass .value{color:#22c55e}
  .stat.fail .value{color:#ef4444}
  .stat.skip .value{color:#f59e0b}
  .stat.total .value{color:#3b82f6}
  .filters{display:flex;gap:8px;margin-bottom:16px}
  .filters button{padding:6px 14px;font-size:12px}
  .filters button.active{background:#1d4ed8;border-color:#1d4ed8;color:#fff}
  .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.3px}
  .badge.passed{background:#052e16;color:#22c55e}
  .badge.failed,.badge.timedOut{background:#350a0a;color:#ef4444}
  .badge.skipped{background:#352a04;color:#f59e0b}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:10px 12px;border-bottom:1px solid #2a2a3e;color:#888;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
  td{padding:10px 12px;border-bottom:1px solid #1a1a2e;vertical-align:top}
  tr:hover td{background:#1a1a2e}
  .test-title{font-weight:500;color:#fff}
  .test-file{font-size:11px;color:#666;margin-top:2px;font-family:monospace}
  .test-error{margin-top:8px;padding:10px;background:#1c0a0a;border:1px solid #3a1515;border-radius:6px;font-family:monospace;font-size:11px;color:#f87171;white-space:pre-wrap;word-break:break-word;max-height:200px;overflow-y:auto}
  .duration{color:#888;font-variant-numeric:tabular-nums;white-space:nowrap}
  .project{font-size:11px;color:#666;font-family:monospace}
  .toast{position:fixed;bottom:24px;right:24px;background:#22c55e;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;opacity:0;transition:opacity .3s;pointer-events:none}
  .toast.show{opacity:1}
  .empty{text-align:center;padding:40px;color:#666;font-size:14px}
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>ITQ E2E Test Report</h1>
    <p>${new Date().toLocaleString()} &mdash; ${this.formatDuration(totalDuration)} total</p>
  </div>
  <div class="actions">
    <button onclick="copyVisible()" class="primary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      Copy to clipboard
    </button>
    <button onclick="copyFailed()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      Copy failures only
    </button>
  </div>
</div>

<div class="stats">
  <div class="stat pass"><div class="value">${passed}</div><div class="label">Passed</div></div>
  <div class="stat fail"><div class="value">${failed}</div><div class="label">Failed</div></div>
  <div class="stat skip"><div class="value">${skipped}</div><div class="label">Skipped</div></div>
  <div class="stat total"><div class="value">${total}</div><div class="label">Total</div></div>
</div>

<div class="filters">
  <button class="active" onclick="filterTests('all', this)">All (${total})</button>
  <button onclick="filterTests('failed', this)">Failed (${failed})</button>
  <button onclick="filterTests('passed', this)">Passed (${passed})</button>
  ${skipped > 0 ? `<button onclick="filterTests('skipped', this)">Skipped (${skipped})</button>` : ""}
</div>

<table>
<thead><tr><th>Status</th><th>Test</th><th>Project</th><th style="text-align:right">Duration</th></tr></thead>
<tbody id="results">
${this.tests
  .sort((a, b) => {
    const order = { failed: 0, timedOut: 0, skipped: 1, passed: 2, interrupted: 3 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  })
  .map(
    (t) => `<tr data-status="${t.status === "timedOut" ? "failed" : t.status}">
  <td><span class="badge ${t.status}">${t.status === "timedOut" ? "timeout" : t.status}</span></td>
  <td>
    <div class="test-title">${this.escapeHtml(t.title)}</div>
    <div class="test-file">${this.escapeHtml(t.file)}:${t.line}</div>
    ${t.error ? `<div class="test-error">${this.escapeHtml(this.truncate(t.error, 800))}</div>` : ""}
  </td>
  <td><span class="project">${this.escapeHtml(t.project)}</span></td>
  <td class="duration" style="text-align:right">${this.formatDuration(t.duration)}</td>
</tr>`
  )
  .join("\n")}
</tbody>
</table>

${total === 0 ? '<div class="empty">No test results.</div>' : ""}

<div class="toast" id="toast">Copied to clipboard</div>

<script>
const tests = ${testsJson};

function filterTests(filter, btn) {
  document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#results tr').forEach(row => {
    const status = row.dataset.status;
    row.style.display = (filter === 'all' || status === filter) ? '' : 'none';
  });
}

function formatDuration(ms) {
  if (ms < 1000) return ms + 'ms';
  return (ms / 1000).toFixed(1) + 's';
}

function buildText(items) {
  const lines = ['ITQ E2E Test Report - ' + new Date().toLocaleString(), ''];
  const passed = items.filter(t => t.status === 'passed').length;
  const failed = items.filter(t => t.status === 'failed' || t.status === 'timedOut').length;
  lines.push('Summary: ' + passed + ' passed, ' + failed + ' failed, ' + items.length + ' total', '');

  for (const t of items) {
    const icon = t.status === 'passed' ? 'PASS' : t.status === 'timedOut' ? 'TIMEOUT' : t.status.toUpperCase();
    lines.push('[' + icon + '] ' + t.title + ' (' + formatDuration(t.duration) + ')');
    lines.push('       ' + t.file + ':' + t.line);
    if (t.error) {
      const errLines = t.error.split('\\n').slice(0, 6).map(l => '       ' + l);
      lines.push(...errLines);
    }
    lines.push('');
  }
  return lines.join('\\n');
}

function copyVisible() {
  const visibleStatuses = new Set();
  document.querySelectorAll('#results tr').forEach(row => {
    if (row.style.display !== 'none') visibleStatuses.add(row.dataset.status);
  });
  const activeFilter = document.querySelector('.filters button.active')?.textContent;
  let items;
  if (activeFilter?.startsWith('Failed')) {
    items = tests.filter(t => t.status === 'failed' || t.status === 'timedOut');
  } else if (activeFilter?.startsWith('Passed')) {
    items = tests.filter(t => t.status === 'passed');
  } else if (activeFilter?.startsWith('Skipped')) {
    items = tests.filter(t => t.status === 'skipped');
  } else {
    items = tests;
  }
  navigator.clipboard.writeText(buildText(items));
  showToast();
}

function copyFailed() {
  const items = tests.filter(t => t.status === 'failed' || t.status === 'timedOut');
  if (items.length === 0) {
    navigator.clipboard.writeText('All tests passed!');
  } else {
    navigator.clipboard.writeText(buildText(items));
  }
  showToast();
}

function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
</script>
</body>
</html>`;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  private truncate(str: string, max: number): string {
    if (str.length <= max) return str;
    return str.slice(0, max) + "\n... (truncated)";
  }
}

export default ClipboardReporter;
