import React, { useEffect, useMemo, useRef, useState } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { API_BASE_URL } from "../../apiConfig";
import { IconButton } from "../../components/IconButton";

// ─────────────────────────────────────────────────────────────────────────────
// FileViewer — full-page-style image viewer with annotation overlay. Renders
// in place of the Reports/Files list when a row is clicked. All annotations
// are stored as percentages (0–1) of the image's natural dimensions so they
// survive any container resize; the SVG overlay maps that range to a 100×100
// viewBox stretched to fit the image. Pins are HTML markers (clickable +
// popover); strokes / arrows / rects live inside the SVG.
//
// Scope (v1 — images only; PDFs fall back to a download link):
//   • Tools: Pin (click → comment popover), Pencil (freehand), Arrow, Rect.
//   • Eye toggle hides the layer per-session (not persisted).
//   • Save-on-add → annotation persists to localStorage keyed by file id.
//   • Download:
//       - "Original" downloads the source blob untouched.
//       - "With annotations" composes image + annotations into a PNG via
//         canvas.drawImage + 2D path ops, then triggers a blob download.
//
// Backend follow-up: replace the localStorage reads/writes with GET/POST to
// `/api/files/:id/annotations`. The shape below maps 1:1 to a future table.
// ─────────────────────────────────────────────────────────────────────────────

type Tool = "none" | "pin" | "pencil" | "arrow" | "rect";

type Point = { x: number; y: number }; // 0..1, percentage of image
type Pin = { id: string; type: "pin"; x: number; y: number; comment: string; author: string; createdAt: number };
type PencilStroke = { id: string; type: "pencil"; points: Point[]; author: string; createdAt: number };
type Arrow = { id: string; type: "arrow"; x1: number; y1: number; x2: number; y2: number; author: string; createdAt: number };
type Rect = { id: string; type: "rect"; x: number; y: number; w: number; h: number; author: string; createdAt: number };
type Annotation = Pin | PencilStroke | Arrow | Rect;

const ANNOTATION_COLOR = colors.red100; // clinical red
const PIN_RADIUS = 16;

type Props = {
  file: { id: string; name: string; fileUrl: string | null; mimeType: string | null };
  onBack: () => void;
};

let annotationCounter = 0;
const nextAnnotationId = () => `ann-${++annotationCounter}-${Date.now()}`;

const storageKey = (fileId: string) => `docodile_annotations_${fileId}`;

function loadAnnotations(fileId: string): Annotation[] {
  try {
    const raw = localStorage.getItem(storageKey(fileId));
    return raw ? (JSON.parse(raw) as Annotation[]) : [];
  } catch {
    return [];
  }
}

function saveAnnotations(fileId: string, annotations: Annotation[]) {
  try {
    localStorage.setItem(storageKey(fileId), JSON.stringify(annotations));
  } catch {
    /* quota exceeded — ignore for now */
  }
}

export function FileViewer({ file, onBack }: Props) {
  // If the fileUrl is an authenticated API endpoint, fetch it with the JWT
  // and create a local blob URL so <img> and canvas can read it cross-origin.
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(file.fileUrl ?? null);
  useEffect(() => {
    const url = file.fileUrl;
    if (!url || !url.startsWith(API_BASE_URL)) {
      setResolvedUrl(url ?? null);
      return;
    }
    let objectUrl: string | null = null;
    const token = localStorage.getItem("docodile_token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.blob() : null)
      .then((blob) => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setResolvedUrl(objectUrl);
        }
      })
      .catch(() => {});
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [file.fileUrl]);

  const isImage = (file.mimeType ?? "").startsWith("image/");
  const [tool, setTool] = useState<Tool>("none");
  const [visible, setVisible] = useState(true);
  const [annotations, setAnnotations] = useState<Annotation[]>(() => loadAnnotations(file.id));
  // Active in-progress drawing — separate from saved annotations so we don't
  // re-persist on every pointer move. Committed on pointer-up.
  const [drafting, setDrafting] = useState<Annotation | null>(null);
  // Pin-comment popover state when adding a new pin.
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pendingComment, setPendingComment] = useState("");
  // Currently-expanded pin (showing its comment thread on click).
  const [openPinId, setOpenPinId] = useState<string | null>(null);
  // Currently-selected non-pin shape (pencil/arrow/rect). Surfaces a small
  // Delete popover next to the shape. Only one annotation is "active" at a
  // time across both popovers — selecting a shape clears `openPinId`, and
  // vice versa.
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const imgWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Persist on every annotation change (save-on-add semantics).
  useEffect(() => {
    saveAnnotations(file.id, annotations);
  }, [file.id, annotations]);

  // Keyboard: Delete / Backspace removes the currently-selected annotation
  // (either a pin or a shape). Skipped when focus is in an input/textarea so
  // the comment composer's Backspace works normally.
  useEffect(() => {
    const active = openPinId ?? selectedShapeId;
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      e.preventDefault();
      setAnnotations((prev) => prev.filter((a) => a.id !== active));
      setOpenPinId(null);
      setSelectedShapeId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPinId, selectedShapeId]);

  // ── Coord conversion ─────────────────────────────────────────────────────
  // Translate a pointer event into image-relative percentages (0..1).
  const eventToPercent = (e: React.PointerEvent | React.MouseEvent): Point | null => {
    const wrap = imgWrapRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    return { x, y };
  };

  // ── Pointer handlers ─────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    // Any background click (Move tool or otherwise) clears the current
    // selection so the floating Delete popover dismisses cleanly.
    if (selectedShapeId) setSelectedShapeId(null);
    if (tool === "none") return;
    const p = eventToPercent(e);
    if (!p) return;
    e.preventDefault();
    if (tool === "pin") {
      setPendingPin(p);
      setPendingComment("");
      setOpenPinId(null);
      return;
    }
    const author = "You"; // backend follow-up: pull doctor name from JWT
    if (tool === "pencil") {
      setDrafting({ id: nextAnnotationId(), type: "pencil", points: [p], author, createdAt: Date.now() });
    } else if (tool === "arrow") {
      setDrafting({ id: nextAnnotationId(), type: "arrow", x1: p.x, y1: p.y, x2: p.x, y2: p.y, author, createdAt: Date.now() });
    } else if (tool === "rect") {
      setDrafting({ id: nextAnnotationId(), type: "rect", x: p.x, y: p.y, w: 0, h: 0, author, createdAt: Date.now() });
    }
    // Capture so move/up events keep firing even off-image.
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drafting) return;
    const p = eventToPercent(e);
    if (!p) return;
    if (drafting.type === "pencil") {
      setDrafting({ ...drafting, points: [...drafting.points, p] });
    } else if (drafting.type === "arrow") {
      setDrafting({ ...drafting, x2: p.x, y2: p.y });
    } else if (drafting.type === "rect") {
      setDrafting({ ...drafting, w: p.x - drafting.x, h: p.y - drafting.y });
    }
  };

  const onPointerUp = () => {
    if (!drafting) return;
    // Drop degenerate shapes (e.g., a "click" with no drag).
    const keep =
      (drafting.type === "pencil" && drafting.points.length > 1) ||
      (drafting.type === "arrow" && Math.hypot(drafting.x2 - drafting.x1, drafting.y2 - drafting.y1) > 0.005) ||
      (drafting.type === "rect" && Math.abs(drafting.w) > 0.005 && Math.abs(drafting.h) > 0.005);
    if (keep) {
      // Normalize rects so w/h are positive (mouse can drag any direction).
      const norm: Annotation = drafting.type === "rect"
        ? {
            ...drafting,
            x: drafting.w < 0 ? drafting.x + drafting.w : drafting.x,
            y: drafting.h < 0 ? drafting.y + drafting.h : drafting.y,
            w: Math.abs(drafting.w),
            h: Math.abs(drafting.h),
          }
        : drafting;
      setAnnotations((prev) => [...prev, norm]);
    }
    setDrafting(null);
  };

  // ── Pin commit ───────────────────────────────────────────────────────────
  const commitPin = () => {
    if (!pendingPin) return;
    const text = pendingComment.trim();
    if (!text) {
      setPendingPin(null);
      return;
    }
    const pin: Pin = {
      id: nextAnnotationId(),
      type: "pin",
      x: pendingPin.x,
      y: pendingPin.y,
      comment: text,
      author: "You",
      createdAt: Date.now(),
    };
    setAnnotations((prev) => [...prev, pin]);
    setPendingPin(null);
    setPendingComment("");
  };
  const cancelPin = () => {
    setPendingPin(null);
    setPendingComment("");
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setOpenPinId(null);
    setSelectedShapeId(null);
  };

  // ── Download (flatten composer) ──────────────────────────────────────────
  const downloadOriginal = () => {
    if (!resolvedUrl) return;
    const a = document.createElement("a");
    a.href = resolvedUrl;
    a.download = file.name || "file";
    a.click();
  };

  const downloadFlattened = async () => {
    if (!isImage || !imgRef.current || !resolvedUrl) {
      downloadOriginal();
      return;
    }
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    // Pin annotations exist only to anchor a comment — they aren't drawing
    // markup on the image itself, so exclude them from the exported PNG.
    drawAnnotationsOnCanvas(
      ctx,
      annotations.filter((a) => a.type !== "pin"),
      canvas.width,
      canvas.height,
    );
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = stripExtension(file.name) + "_annotated.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  };

  // ── Render helpers ───────────────────────────────────────────────────────
  const liveAnnotations = useMemo(
    () => (drafting ? [...annotations, drafting] : annotations),
    [annotations, drafting]
  );
  const pins = liveAnnotations.filter((a): a is Pin => a.type === "pin");
  const shapes = liveAnnotations.filter((a) => a.type !== "pin");

  const cursor = tool === "none" ? "default" : tool === "pin" ? "crosshair" : "crosshair";

  return (
    <div style={styles.container}>
      {/* Toolbar — no Back arrow now that this lives inside a Modal; the
          parent's overlay click + an explicit × in the header handle dismiss. */}
      <header style={styles.toolbar}>
        <span style={styles.title}>{file.name}</span>

        <div style={styles.tools}>
          <ToolBtn label="Move" active={tool === "none"} onClick={() => setTool("none")}>
            <CursorIcon />
          </ToolBtn>
          <ToolBtn label="Pin a comment" active={tool === "pin"} onClick={() => setTool("pin")}>
            <PinIcon />
          </ToolBtn>
          <ToolBtn label="Freehand" active={tool === "pencil"} onClick={() => setTool("pencil")}>
            <PencilIcon />
          </ToolBtn>
          <ToolBtn label="Arrow" active={tool === "arrow"} onClick={() => setTool("arrow")}>
            <ArrowGlyph />
          </ToolBtn>
          <ToolBtn label="Rectangle" active={tool === "rect"} onClick={() => setTool("rect")}>
            <RectIcon />
          </ToolBtn>
        </div>

        <div style={styles.right}>
          <ToolBtn
            label={visible ? "Hide annotations" : "Show annotations"}
            active={!visible}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeIcon /> : <EyeOffIcon />}
          </ToolBtn>
          <button type="button" onClick={downloadOriginal} style={styles.iconBtn} title="Download original">
            <DownloadIcon />
          </button>
          {isImage && (
            <button type="button" onClick={downloadFlattened} style={styles.flattenBtn} title="Download with annotations">
              Download w/ markup
            </button>
          )}
          {/* Close — dismisses the file viewer. */}
          <IconButton ariaLabel="Close" onClick={onBack} style={{ marginLeft: 4 }} />
        </div>
      </header>

      {/* Stage + annotations rail in a two-column flex row. Rail appears only
          when there's at least one annotation, keeping the empty-viewer view
          uncluttered. */}
      <div style={styles.stageRow}>
      <div style={styles.stage}>
        {!resolvedUrl ? (
          <p style={styles.empty}>File not available.</p>
        ) : !isImage ? (
          <div style={styles.nonImage}>
            <p style={styles.empty}>Preview not available for this file type yet.</p>
            <button type="button" onClick={downloadOriginal} style={styles.flattenBtn}>
              Download file
            </button>
          </div>
        ) : (
          <div
            ref={imgWrapRef}
            style={{ ...styles.imgWrap, cursor }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              ref={imgRef}
              src={resolvedUrl ?? undefined}
              alt={file.name}
              style={styles.img}
              draggable={false}
            />

            {visible && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={styles.svgLayer}
              >
                {shapes.map((a) =>
                  renderShape(
                    a,
                    a.id === selectedShapeId,
                    tool === "none",
                    (id) => {
                      setSelectedShapeId(id);
                      setOpenPinId(null);
                    },
                  ),
                )}
              </svg>
            )}

            {/* Delete popover for the currently-selected shape. Same plain
                "Delete" affordance as the pin popover. */}
            {visible && selectedShapeId && (() => {
              const a = annotations.find((x) => x.id === selectedShapeId);
              if (!a || a.type === "pin") return null;
              const anchor = shapeAnchor(a);
              return (
                <div
                  style={{
                    ...styles.commentPopover,
                    left: `${anchor.x * 100}%`,
                    top: `${anchor.y * 100}%`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div style={styles.commentMeta}>{a.author} · {labelForType(a.type)}</div>
                  <button type="button" onClick={() => deleteAnnotation(a.id)} style={styles.commentDelete}>
                    Delete
                  </button>
                </div>
              );
            })()}

            {visible && pins.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPinId(openPinId === p.id ? null : p.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  ...styles.pin,
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                }}
                title={p.comment}
              >
                {i + 1}
              </button>
            ))}

            {/* Open pin's comment popover */}
            {visible && openPinId && (() => {
              const p = pins.find((p) => p.id === openPinId);
              if (!p) return null;
              return (
                <div
                  style={{
                    ...styles.commentPopover,
                    left: `${p.x * 100}%`,
                    top: `${p.y * 100}%`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div style={styles.commentMeta}>{p.author}</div>
                  <div style={styles.commentText}>{p.comment}</div>
                  <button type="button" onClick={() => deleteAnnotation(p.id)} style={styles.commentDelete}>
                    Delete
                  </button>
                </div>
              );
            })()}

            {/* New-pin inline composer */}
            {pendingPin && (
              <div
                style={{
                  ...styles.commentPopover,
                  left: `${pendingPin.x * 100}%`,
                  top: `${pendingPin.y * 100}%`,
                }}
                onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
              >
                <textarea
                  autoFocus
                  rows={2}
                  value={pendingComment}
                  onChange={(e) => setPendingComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") cancelPin();
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitPin();
                  }}
                  placeholder="Add a comment"
                  style={styles.commentInput}
                />
                <div style={styles.commentActions}>
                  <button type="button" onClick={cancelPin} style={styles.commentCancel}>
                    Cancel
                  </button>
                  <button type="button" onClick={commitPin} style={styles.commentSave}>
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right rail — annotation list. Shown only when there are
          annotations. Clicking a row selects the underlying shape/pin (same
          state model as clicking on the canvas); the trash icon deletes inline. */}
      {annotations.length > 0 && (
        <aside style={styles.rail}>
          <div style={styles.railHeader}>
            Annotations · {annotations.length}
          </div>
          <div style={styles.railList}>
            {annotations.map((a, i) => {
              const isPin = a.type === "pin";
              const active = isPin ? openPinId === a.id : selectedShapeId === a.id;
              const subtitle = isPin
                ? a.comment
                : labelForType(a.type);
              const pinNumber = isPin
                ? annotations.filter((x, j) => x.type === "pin" && j <= i).length
                : null;
              return (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (isPin) {
                      setOpenPinId(a.id);
                      setSelectedShapeId(null);
                    } else {
                      setSelectedShapeId(a.id);
                      setOpenPinId(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (isPin) { setOpenPinId(a.id); setSelectedShapeId(null); }
                      else { setSelectedShapeId(a.id); setOpenPinId(null); }
                    }
                  }}
                  style={{
                    ...styles.railItem,
                    ...(active ? styles.railItemActive : null),
                  }}
                >
                  <span style={styles.railItemBadge} aria-hidden>
                    {isPin
                      ? <span style={styles.railPinDot}>{pinNumber}</span>
                      : annotationGlyph(a.type)}
                  </span>
                  <span style={styles.railItemText}>
                    <span style={styles.railItemTitle}>
                      {isPin ? "Comment" : labelForType(a.type)}
                    </span>
                    <span style={styles.railItemSubtitle} title={subtitle}>
                      {isPin ? a.comment : `by ${a.author}`}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteAnnotation(a.id); }}
                    aria-label="Delete annotation"
                    style={styles.railDelete}
                  >
                    <TrashIcon />
                  </button>
                </div>
              );
            })}
          </div>
          <div style={styles.railActions}>
            <button
              type="button"
              onClick={() => {
                setAnnotations([]);
                setOpenPinId(null);
                setSelectedShapeId(null);
              }}
              style={styles.clearAllBtn}
            >
              Clear all
            </button>
          </div>
        </aside>
      )}
      </div>

      <footer style={styles.footer}>
        <span style={styles.footerCount}>
          {annotations.length} annotation{annotations.length === 1 ? "" : "s"} ·{" "}
          {visible ? "visible" : "hidden"}
        </span>
      </footer>
    </div>
  );
}

// ─── Inline SVG icons (1.5 stroke, currentColor) ─────────────────────────────

function ToolBtn({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      style={{
        ...styles.iconBtn,
        ...(active ? styles.iconBtnActive : null),
      }}
    >
      {children}
    </button>
  );
}

function CursorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 3l5 16 2-6 6-2-13-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s-7-7.6-7-12a7 7 0 1 1 14 0c0 4.4-7 12-7 12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M16.5 3.5l4 4-11 11H5.5v-4l11-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 19L19 5M19 5h-7M19 5v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RectIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18M10.6 6.2A10.4 10.4 0 0 1 12 6c6.4 0 10 6 10 6a14 14 0 0 1-3 3.5M6.4 6.4A14 14 0 0 0 2 12s3.6 6 10 6c1.3 0 2.5-.2 3.6-.6"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Small glyph for the rail badge per annotation type. Pin gets its own
// numbered dot rendered inline (matches the canvas pin); other shapes get a
// scaled-down tool icon.
function annotationGlyph(type: Annotation["type"]): React.ReactNode {
  if (type === "pencil") return <PencilIcon />;
  if (type === "arrow") return <ArrowGlyph />;
  if (type === "rect") return <RectIcon />;
  return null;
}

// ─── Shape rendering inside <svg viewBox="0 0 100 100"> ─────────────────────
//
// `interactive` controls whether the shape captures pointer events. When the
// Move tool is active, shapes are clickable (so the user can select & delete).
// While a drawing tool is active, shapes are pass-through so the user can
// freely draw over them.

const SELECTED_COLOR = "#FFB020"; // amber — distinct from the red drawing color

function renderShape(
  a: Annotation,
  selected: boolean,
  interactive: boolean,
  onSelect: (id: string) => void,
): React.ReactNode {
  const stroke = selected ? SELECTED_COLOR : ANNOTATION_COLOR;
  const strokeWidth = selected ? 3 : 2;
  const cursor = interactive ? "pointer" : "default";
  const pointerEvents: React.CSSProperties["pointerEvents"] = interactive ? "stroke" : "none";
  const click = interactive
    ? (e: React.MouseEvent) => { e.stopPropagation(); onSelect(a.id); }
    : undefined;

  if (a.type === "pencil") {
    if (a.points.length < 2) return null;
    const d = a.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * 100} ${p.y * 100}`).join(" ");
    return (
      <path
        key={a.id}
        d={d}
        stroke={stroke}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        onClick={click}
        style={{ strokeWidth, pointerEvents, cursor }}
      />
    );
  }
  if (a.type === "arrow") {
    const x1 = a.x1 * 100, y1 = a.y1 * 100, x2 = a.x2 * 100, y2 = a.y2 * 100;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = 3; // viewBox units
    const hx1 = x2 - head * Math.cos(angle - Math.PI / 6);
    const hy1 = y2 - head * Math.sin(angle - Math.PI / 6);
    const hx2 = x2 - head * Math.cos(angle + Math.PI / 6);
    const hy2 = y2 - head * Math.sin(angle + Math.PI / 6);
    return (
      <g key={a.id} stroke={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round"
         onClick={click} style={{ strokeWidth, pointerEvents, cursor }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
        <line x1={x2} y1={y2} x2={hx1} y2={hy1} />
        <line x1={x2} y1={y2} x2={hx2} y2={hy2} />
      </g>
    );
  }
  if (a.type === "rect") {
    return (
      <rect
        key={a.id}
        x={a.x * 100}
        y={a.y * 100}
        width={a.w * 100}
        height={a.h * 100}
        stroke={stroke}
        fill="none"
        onClick={click}
        style={{ strokeWidth, pointerEvents, cursor }}
      />
    );
  }
  return null;
}

// Compute a (x, y) anchor in 0..1 coords for placing the floating delete
// popover near the selected shape — top-right of its bounding box.
function shapeAnchor(a: Annotation): Point {
  if (a.type === "pin") return { x: a.x, y: a.y };
  if (a.type === "arrow") return {
    x: Math.max(a.x1, a.x2),
    y: Math.min(a.y1, a.y2),
  };
  if (a.type === "rect") return { x: a.x + a.w, y: a.y };
  if (a.type === "pencil") {
    let maxX = 0, minY = 1;
    for (const p of a.points) {
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
    }
    return { x: maxX, y: minY };
  }
  return { x: 0, y: 0 };
}

// Flatten annotations onto a raster context (for "Download w/ markup").
function drawAnnotationsOnCanvas(
  ctx: CanvasRenderingContext2D,
  annotations: Annotation[],
  W: number,
  H: number,
) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = ANNOTATION_COLOR;
  ctx.fillStyle = ANNOTATION_COLOR;
  // SVG overlay uses strokeWidth:2 in a 0–100 viewBox = 2% of image width.
  // Match that here so the exported PNG looks identical to what the user sees.
  ctx.lineWidth = Math.max(2, W * 0.02);

  let pinIndex = 0;
  for (const a of annotations) {
    if (a.type === "pencil") {
      if (a.points.length < 2) continue;
      ctx.beginPath();
      a.points.forEach((p, i) => {
        const x = p.x * W, y = p.y * H;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    } else if (a.type === "arrow") {
      const x1 = a.x1 * W, y1 = a.y1 * H, x2 = a.x2 * W, y2 = a.y2 * H;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = Math.max(12, W * 0.015);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else if (a.type === "rect") {
      ctx.strokeRect(a.x * W, a.y * H, a.w * W, a.h * H);
    } else if (a.type === "pin") {
      pinIndex++;
      const cx = a.x * W, cy = a.y * H;
      const r = Math.max(14, W * 0.012);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // White index label
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.round(r * 1.2)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(pinIndex), cx, cy);
      ctx.fillStyle = ANNOTATION_COLOR;
    }
  }
}

function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

// Friendly label for an annotation type — surfaced in the Delete popover so
// the user knows what they're about to remove.
function labelForType(type: Annotation["type"]): string {
  switch (type) {
    case "pencil": return "Freehand";
    case "arrow": return "Arrow";
    case "rect": return "Rectangle";
    case "pin": return "Pin";
  }
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    // Sized for the wrapping Modal — the modal caps width at 90vw and adds
    // its own 32px padding, so we target a comfortable mid-size and let the
    // image scale down via `maxHeight: 70vh` on the <img>.
    width: "min(1100px, 86vw)",
    maxHeight: "82vh",
    overflow: "auto",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    padding: `${spacing.s} ${spacing.m}`,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    border: `1px solid ${colors.neutral200}`,
    flexWrap: "wrap",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    cursor: "pointer",
    padding: "4px 8px",
  },
  title: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral700,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tools: {
    display: "inline-flex",
    gap: 4,
    padding: 4,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
  },
  right: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconBtn: {
    width: 32,
    height: 32,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    borderRadius: radii.s,
    color: colors.neutral700,
    cursor: "pointer",
    padding: 0,
    transition: "background-color 0.15s ease, color 0.15s ease",
  },
  iconBtnActive: {
    backgroundColor: colors.primary600,
    color: colors.neutral100,
  },
  flattenBtn: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral100,
    backgroundColor: colors.primary700,
    border: "none",
    borderRadius: radii.full,
    padding: "8px 16px",
    cursor: "pointer",
  },
  // Two-column row: image stage + (optional) right rail.
  stageRow: {
    display: "flex",
    gap: spacing.s,
    alignItems: "stretch",
    minHeight: 400,
  },
  // Image stage — flex:1 so it shrinks to fit when the rail is shown.
  stage: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: spacing.m,
    backgroundColor: colors.neutral150,
    borderRadius: radii.m,
    minHeight: 400,
  },
  // Annotation rail. Fixed-width column on the right, only shown when
  // annotations exist. Scrolls vertically when the list grows long.
  rail: {
    width: 240,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.neutral200}`,
    borderRadius: radii.m,
    overflow: "hidden",
  },
  railHeader: {
    padding: `${spacing.xs} ${spacing.s}`,
    borderBottom: `1px solid ${colors.neutral200}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    fontWeight: fonts.weight.medium,
    color: colors.neutral700,
    letterSpacing: 0.3,
  },
  railActions: {
    padding: `${spacing.xs} ${spacing.s}`,
    borderTop: `1px solid ${colors.neutral200}`,
    display: "flex",
    justifyContent: "flex-end",
  },
  clearAllBtn: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    fontWeight: fonts.weight.medium,
    color: "#C53030",
    background: "transparent",
    border: `1px solid #FC8181`,
    borderRadius: radii.full,
    padding: `4px ${spacing.s}`,
    cursor: "pointer",
    lineHeight: 1.4,
  },
  railList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  railItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `${spacing.xs} ${spacing.s}`,
    borderBottom: `1px solid ${colors.neutral150}`,
    cursor: "pointer",
    backgroundColor: "transparent",
    transition: "background-color 0.15s ease",
  },
  railItemActive: {
    backgroundColor: colors.primary100,
  },
  railItemBadge: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: colors.neutral150,
    color: colors.neutral700,
  },
  // Numbered red dot used for pin rows in the rail — mirrors the canvas pin
  // so the user can visually correlate.
  railPinDot: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    backgroundColor: colors.red100,
    color: colors.neutral100,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.family.primary,
    fontSize: 11,
    fontWeight: fonts.weight.bold,
  },
  railItemText: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  railItemTitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    fontWeight: fonts.weight.medium,
  },
  railItemSubtitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  railDelete: {
    width: 24,
    height: 24,
    border: "none",
    background: "transparent",
    color: colors.neutral500,
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.s,
  },
  imgWrap: {
    position: "relative",
    display: "inline-block",
    maxWidth: "100%",
    userSelect: "none",
    touchAction: "none",
  },
  img: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    userSelect: "none",
    pointerEvents: "none",
  },
  svgLayer: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  pin: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    width: PIN_RADIUS * 2,
    height: PIN_RADIUS * 2,
    borderRadius: "50%",
    backgroundColor: ANNOTATION_COLOR,
    color: colors.neutral100,
    border: `2px solid ${colors.neutral100}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    fontWeight: fonts.weight.bold,
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
  },
  commentPopover: {
    position: "absolute",
    transform: "translate(20px, -10px)",
    minWidth: 220,
    maxWidth: 280,
    padding: spacing.s,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    zIndex: 10,
  },
  commentMeta: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
    fontWeight: fonts.weight.medium,
  },
  commentText: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    whiteSpace: "pre-wrap",
  },
  commentDelete: {
    alignSelf: "flex-start",
    background: "transparent",
    border: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.red200,
    padding: 0,
    cursor: "pointer",
  },
  commentInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: spacing.xs,
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.s,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    resize: "vertical",
    outline: "none",
  },
  commentActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  commentCancel: {
    background: "transparent",
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.full,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral900,
    padding: "4px 12px",
    cursor: "pointer",
  },
  commentSave: {
    background: colors.primary700,
    border: "none",
    borderRadius: radii.full,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral100,
    padding: "4px 12px",
    cursor: "pointer",
  },
  nonImage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.m,
    padding: spacing.xl,
  },
  empty: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral500,
    margin: 0,
  },
  footer: {
    padding: `${spacing.xs} ${spacing.m}`,
  },
  footerCount: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
  },
};
