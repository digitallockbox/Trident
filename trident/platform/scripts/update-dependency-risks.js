// update-dependency-risks.js
// Usage: node update-dependency-risks.js snyk-results.json ./docs/DEPENDENCY_RISKS.md

const fs = require('fs');
const path = require('path');

function parseSnykResults(snykJson) {
  const issues = [];
  if (Array.isArray(snykJson)) {
    snykJson.forEach(project => {
      if (project.issues && project.issues.vulnerabilities) {
        issues.push(...project.issues.vulnerabilities);
      }
    });
  } else if (snykJson.issues && snykJson.issues.vulnerabilities) {
    issues.push(...snykJson.issues.vulnerabilities);
  }
  return issues;
}

function groupIssues(issues) {
  const grouped = {};
  for (const issue of issues) {
    const severity = issue.severity || 'unknown';
    if (!grouped[severity]) grouped[severity] = [];
    grouped[severity].push(issue);
  }
  return grouped;
}

function formatIssue(issue) {
  return `### ${issue.title}\n- **Package:** ${issue.packageName || 'N/A'}\n- **Severity:** ${issue.severity}\n- **Location:** ${issue.from ? issue.from.join(' > ') : 'N/A'}\n- **ID:** ${issue.id}\n- **URL:** ${issue.url || ''}\n- **Description:** ${issue.description || ''}\n`;
}

function generateMarkdown(issues, date) {
  let md = `# DEPENDENCY RISKS\n\n## Overview\nThis document lists all known high/medium security risks in third-party dependencies, with mitigations and monitoring plans. Updated after every Snyk scan.\n\n---\n\n## 1. High/Medium Issues (as of ${date})\n`;
  const grouped = groupIssues(issues);
  ['critical','high','medium'].forEach(sev => {
    if (grouped[sev] && grouped[sev].length) {
      md += `\n## ${sev.charAt(0).toUpperCase() + sev.slice(1)} Severity\n`;
      grouped[sev].forEach(issue => {
        md += formatIssue(issue) + '\n';
      });
    }
  });
  if ((!grouped['critical'] || !grouped['critical'].length) && (!grouped['high'] || !grouped['high'].length) && (!grouped['medium'] || !grouped['medium'].length)) {
    md += '\nNo high or medium severity issues found.\n';
  }
  md += `\n---\n\n## 2. Monitoring Plan\n- Snyk scans run on every PR and deploy (see ci/security-audit.yml).\n- Dependency updates reviewed monthly.\n- Critical issues block deployment until resolved or mitigated.\n\n## 3. Documentation\n- This file is updated after every audit.\n- All mitigations are referenced in SECURITY_MODEL.md.\n\n## Contact\nFor dependency risk questions, contact: security@trident-platform.example\n`;
  return md;
}

function main() {
  const [,, snykPath, outPath] = process.argv;
  if (!snykPath || !outPath) {
    console.error('Usage: node update-dependency-risks.js snyk-results.json ./docs/DEPENDENCY_RISKS.md');
    process.exit(1);
  }
  const snykRaw = fs.readFileSync(snykPath, 'utf8');
  let snykJson;
  try {
    snykJson = JSON.parse(snykRaw);
  } catch (e) {
    console.error('Failed to parse Snyk JSON:', e);
    process.exit(1);
  }
  const issues = parseSnykResults(snykJson);
  const date = new Date().toISOString().slice(0,10);
  const md = generateMarkdown(issues, date);
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`Updated ${outPath} with ${issues.length} issues.`);
}

main();
