import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Globe } from 'lucide-react';

/**
 * Lightweight, beautiful Cybernetic Markdown Renderer
 * Directly renders ChatGPT/Gemini style formatted answers with:
 * - Styled Code Blocks with Language tag and 1-click Copy
 * - Headers, Bold, Italic, Inline Code
 * - Bullet and Numbered Lists
 * - External Source citations and links
 */
export default function MarkdownViewer({ content = '', sources = [] }) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  if (!content) return null;

  // Split content by code blocks first
  // Pattern: ```lang\ncode\n```
  const parts = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'code',
      code: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex)
    });
  }

  // Format inline markdown (bold, italic, inline code, links)
  const renderInlineFormatted = (rawText) => {
    if (!rawText) return null;

    // Tokenize for inline code, bold, links, italic
    // Split by inline code `...`
    const codeSegments = rawText.split(/(`[^`]+`)/g);

    return codeSegments.map((segment, segIdx) => {
      if (segment.startsWith('`') && segment.endsWith('`') && segment.length > 2) {
        return (
          <code
            key={segIdx}
            style={{
              background: 'rgba(0, 243, 255, 0.12)',
              color: 'var(--accent-cyan)',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-code)',
              fontSize: '0.85em',
              border: '1px solid rgba(0, 243, 255, 0.25)'
            }}
          >
            {segment.slice(1, -1)}
          </code>
        );
      }

      // Check for links [label](url)
      const linkSegments = segment.split(/(\[[^\]]+\]\([^)]+\))/g);
      return (
        <span key={segIdx}>
          {linkSegments.map((subSeg, subIdx) => {
            const linkMatch = subSeg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (linkMatch) {
              return (
                <a
                  key={subIdx}
                  href={linkMatch[2]}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent-cyan)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  {linkMatch[1]}
                  <ExternalLink size={11} style={{ opacity: 0.8 }} />
                </a>
              );
            }

            // Bold **text**
            const boldSegments = subSeg.split(/(\*\*[^*]+\*\*)/g);
            return (
              <span key={subIdx}>
                {boldSegments.map((bSeg, bIdx) => {
                  if (bSeg.startsWith('**') && bSeg.endsWith('**') && bSeg.length > 4) {
                    return <strong key={bIdx} style={{ color: '#ffffff', fontWeight: '600' }}>{bSeg.slice(2, -2)}</strong>;
                  }

                  // Italic *text*
                  const italicSegments = bSeg.split(/(\*[^*]+\*)/g);
                  return (
                    <span key={bIdx}>
                      {italicSegments.map((iSeg, iIdx) => {
                        if (iSeg.startsWith('*') && iSeg.endsWith('*') && iSeg.length > 2) {
                          return <em key={iIdx} style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>{iSeg.slice(1, -1)}</em>;
                        }
                        return iSeg;
                      })}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </span>
      );
    });
  };

  // Render prose blocks (paragraphs, headers, lists)
  const renderTextParagraphs = (textBlock, blockIdx) => {
    const lines = textBlock.split('\n');
    const elements = [];
    let currentList = null;

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        if (currentList) {
          elements.push(currentList);
          currentList = null;
        }
        return;
      }

      // Headers: #, ##, ###
      if (trimmed.startsWith('### ')) {
        if (currentList) { elements.push(currentList); currentList = null; }
        elements.push(
          <h4 key={`${blockIdx}-${lineIdx}`} style={{ margin: '0.85rem 0 0.35rem 0', fontSize: '1rem', color: 'var(--accent-cyan)', fontWeight: '600', letterSpacing: '0.3px' }}>
            {renderInlineFormatted(trimmed.slice(4))}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        if (currentList) { elements.push(currentList); currentList = null; }
        elements.push(
          <h3 key={`${blockIdx}-${lineIdx}`} style={{ margin: '1rem 0 0.4rem 0', fontSize: '1.1rem', color: '#ffffff', fontWeight: '600', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '0.25rem' }}>
            {renderInlineFormatted(trimmed.slice(3))}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('# ')) {
        if (currentList) { elements.push(currentList); currentList = null; }
        elements.push(
          <h2 key={`${blockIdx}-${lineIdx}`} style={{ margin: '1.1rem 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--accent-cyan)', fontWeight: '700' }}>
            {renderInlineFormatted(trimmed.slice(2))}
          </h2>
        );
        return;
      }

      // Horizontal divider
      if (trimmed === '---' || trimmed === '***') {
        if (currentList) { elements.push(currentList); currentList = null; }
        elements.push(
          <hr key={`${blockIdx}-${lineIdx}`} style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '0.85rem 0' }} />
        );
        return;
      }

      // Bullet List (- item, * item, • item)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const itemText = trimmed.replace(/^[-*•]\s+/, '');
        if (!currentList || currentList.type !== 'ul') {
          if (currentList) elements.push(currentList);
          currentList = {
            type: 'ul',
            key: `${blockIdx}-${lineIdx}`,
            items: []
          };
        }
        currentList.items.push(itemText);
        return;
      }

      // Numbered List (1. item, 2. item)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        if (!currentList || currentList.type !== 'ol') {
          if (currentList) elements.push(currentList);
          currentList = {
            type: 'ol',
            key: `${blockIdx}-${lineIdx}`,
            items: []
          };
        }
        currentList.items.push(numMatch[2]);
        return;
      }

      // Blockquote (> text)
      if (trimmed.startsWith('> ')) {
        if (currentList) { elements.push(currentList); currentList = null; }
        elements.push(
          <blockquote
            key={`${blockIdx}-${lineIdx}`}
            style={{
              margin: '0.6rem 0',
              padding: '0.4rem 0.8rem',
              borderLeft: '3px solid var(--accent-cyan)',
              background: 'rgba(0, 243, 255, 0.05)',
              borderRadius: '0 6px 6px 0',
              color: 'var(--text-main)',
              fontStyle: 'italic',
              fontSize: '0.9rem'
            }}
          >
            {renderInlineFormatted(trimmed.slice(2))}
          </blockquote>
        );
        return;
      }

      // Standard Paragraph
      if (currentList) { elements.push(currentList); currentList = null; }
      elements.push(
        <p key={`${blockIdx}-${lineIdx}`} style={{ margin: '0.45rem 0', lineHeight: '1.6', fontSize: '0.92rem', color: 'var(--text-main)' }}>
          {renderInlineFormatted(trimmed)}
        </p>
      );
    });

    if (currentList) {
      elements.push(currentList);
    }

    return elements.map((item, idx) => {
      if (item.type === 'ul') {
        return (
          <ul key={item.key || idx} style={{ margin: '0.45rem 0 0.65rem 1rem', paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {item.items.map((it, iIdx) => (
              <li key={iIdx} style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {renderInlineFormatted(it)}
              </li>
            ))}
          </ul>
        );
      }
      if (item.type === 'ol') {
        return (
          <ol key={item.key || idx} style={{ margin: '0.45rem 0 0.65rem 1rem', paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {item.items.map((it, iIdx) => (
              <li key={iIdx} style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {renderInlineFormatted(it)}
              </li>
            ))}
          </ol>
        );
      }
      return item;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return (
            <div
              key={pIdx}
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#04060c',
                border: '1px solid rgba(0, 243, 255, 0.25)',
                margin: '0.6rem 0'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(0, 243, 255, 0.08)',
                  padding: '0.35rem 0.75rem',
                  borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-code)',
                  color: 'var(--accent-cyan)'
                }}
              >
                <span>{part.lang ? part.lang.toUpperCase() : 'CODE'}</span>
                <button
                  onClick={() => handleCopyCode(part.code, pIdx)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copiedCodeIdx === pIdx ? 'var(--accent-green)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                  title="Copy code to clipboard"
                >
                  {copiedCodeIdx === pIdx ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCodeIdx === pIdx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre
                style={{
                  padding: '0.85rem 1rem',
                  margin: 0,
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  color: '#e2e8f0',
                  overflowX: 'auto',
                  whiteSpace: 'pre'
                }}
              >
                {part.code}
              </pre>
            </div>
          );
        }

        return (
          <div key={pIdx}>
            {renderTextParagraphs(part.content, pIdx)}
          </div>
        );
      })}

      {/* Verified Sources & References Section */}
      {sources && sources.length > 0 && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.6rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-hud)',
              letterSpacing: '0.5px'
            }}
          >
            <Globe size={12} color="var(--accent-green)" /> SOURCES & REFERENCES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {sources.map((src, sIdx) => (
              <a
                key={sIdx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(5, 8, 17, 0.8)',
                  border: '1px solid rgba(0, 243, 255, 0.25)',
                  borderRadius: '12px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  color: 'var(--accent-cyan)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.background = 'rgba(0, 243, 255, 0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.25)';
                  e.currentTarget.style.background = 'rgba(5, 8, 17, 0.8)';
                }}
              >
                <span>{src.title}</span>
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
