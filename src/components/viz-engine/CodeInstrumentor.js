/**
 * CodeInstrumentor v3 — Ultra-conservative, every trace wrapped in try-catch
 * 
 * Rule: the instrumented code MUST be syntactically valid if the original was.
 * We ONLY append lines, NEVER modify existing lines.
 * Every appended __step is wrapped in try-catch so it can't break anything.
 */

export function instrumentCode(jsCode) {
  if (!jsCode) return { code: '' };

  const lines = jsCode.split('\n');
  const output = [];

  // Safety guard
  output.push('let __sc=0;');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const ln = i + 1;

    // Always emit the original line unchanged
    output.push(raw);

    // Skip lines that aren't complete statements
    if (!trimmed || !trimmed.endsWith(';')) continue;
    if (trimmed.length < 3) continue;
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
    if (trimmed.startsWith('return ') || trimmed === 'return;') continue;
    if (trimmed === 'break;' || trimmed === 'continue;') continue;

    // Find what variable is being set (if any)
    const assign = trimmed.match(/^(?:let\s+|const\s+)?(\w+)\s*(?:=|\+=|-=|\*=|\/=)/);
    const arrSet = trimmed.match(/^(\w+)\s*\[/);
    const methodMut = trimmed.match(/^(\w+)\s*\.\s*(push|pop|shift|unshift|sort|reverse|fill|set|delete|add|clear|splice)\s*\(/);
    const incr = trimmed.match(/^(\w+)\s*(\+\+|--)/) || trimmed.match(/^(\+\+|--)(\w+)/);

    let varName = null;
    if (assign) varName = assign[1];
    else if (arrSet) varName = arrSet[1];
    else if (methodMut) varName = methodMut[1];
    else if (incr) varName = incr[1].match(/\w+/) ? incr[1] : incr[2];

    // Build safe step call — wrapped in try-catch
    if (varName && /^\w+$/.test(varName)) {
      output.push(`try{if(++__sc<500)__step(${ln},"${varName} = "+__sf(${varName}),{["${varName}"]:__cl(${varName})})}catch(e){}`);
    } else {
      // Generic step — just log what line executed
      const msg = trimmed.substring(0, 60).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      output.push(`try{if(++__sc<500)__step(${ln},"${msg}")}catch(e){}`);
    }
  }

  return { code: output.join('\n') };
}
