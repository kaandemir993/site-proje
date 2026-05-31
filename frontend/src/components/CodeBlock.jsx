import React from "react";

// Minimal Assembly / x86 syntax highlighter (regex-based, dependency-free)
const KEYWORDS = new Set([
  "mov","push","pop","call","ret","retn","jmp","je","jne","jz","jnz","jc","jnc","jg","jl","jge","jle",
  "add","sub","mul","div","inc","dec","cmp","test","xor","and","or","not","shl","shr","rol","ror",
  "lea","int","cli","sti","hlt","loop","nop","syscall","sysenter","leave","enter","in","out",
  "movzx","movsx","cdq","cwd","stos","lods","movs","scas","rep","repe","repne","cpuid"
]);
const REGISTERS = new Set([
  "eax","ebx","ecx","edx","esi","edi","ebp","esp","eip",
  "rax","rbx","rcx","rdx","rsi","rdi","rbp","rsp","rip",
  "ax","bx","cx","dx","si","di","bp","sp",
  "al","ah","bl","bh","cl","ch","dl","dh",
  "ds","es","cs","ss","fs","gs",
  "r8","r9","r10","r11","r12","r13","r14","r15"
]);

function highlightLine(line) {
  // comment
  const commentIdx = line.indexOf(";");
  let code = line, comment = "";
  if (commentIdx >= 0) {
    code = line.slice(0, commentIdx);
    comment = line.slice(commentIdx);
  }

  // tokenize keeping whitespace and punctuation
  const tokens = code.split(/(\s+|,|\[|\]|:|\+|-|\*)/);
  const out = [];
  tokens.forEach((tok, i) => {
    if (!tok) return;
    const lower = tok.toLowerCase();

    if (/^\s+$/.test(tok) || [",", "[", "]", "+", "-", "*"].includes(tok)) {
      out.push(<span key={i}>{tok}</span>);
      return;
    }
    if (tok === ":") {
      out.push(<span key={i}>{tok}</span>);
      return;
    }
    // label like "start:" — detect when next non-ws token is ":"
    const nextNonWs = tokens.slice(i + 1).find((t) => t && !/^\s+$/.test(t));
    if (nextNonWs === ":" && /^[A-Za-z_][\w]*$/.test(tok)) {
      out.push(<span key={i} className="tok-label">{tok}</span>);
      return;
    }
    if (tok.startsWith(".") || tok.startsWith("[") || /^\[BITS|ORG|SECTION/i.test(tok)) {
      out.push(<span key={i} className="tok-directive">{tok}</span>);
      return;
    }
    if (KEYWORDS.has(lower)) {
      out.push(<span key={i} className="tok-keyword">{tok}</span>);
      return;
    }
    if (REGISTERS.has(lower)) {
      out.push(<span key={i} className="tok-register">{tok}</span>);
      return;
    }
    if (/^(0x[0-9a-fA-F]+|\d+)$/.test(tok)) {
      out.push(<span key={i} className="tok-number">{tok}</span>);
      return;
    }
    if (/^['"].*['"]$/.test(tok)) {
      out.push(<span key={i} className="tok-string">{tok}</span>);
      return;
    }
    out.push(<span key={i}>{tok}</span>);
  });

  if (comment) out.push(<span key="cmt" className="tok-comment">{comment}</span>);
  return out;
}

export default function CodeBlock({ code, language = "asm", title }) {
  if (!code) return null;
  const lines = code.split("\n");
  return (
    <div className="my-6" data-testid="code-block">
      <div className="flex items-center justify-between mb-2">
        <div className="label-overline">// {title || language.toUpperCase()}</div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "#FF003C" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#FFB800" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#00FF66" }} />
        </div>
      </div>
      <pre className="code-block scrollbar-cyber">
        <code>
          {lines.map((line, idx) => (
            <div key={idx} className="flex">
              <span className="tok-comment select-none pr-4 text-right" style={{ minWidth: "2.5rem" }}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 whitespace-pre">{highlightLine(line) || " "}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
