const NOTCH = "clamp(10px, 5vw, 28px)";
const NOTCH_X = "50%";
 
export const ticketMaskX = {
  "--notch": NOTCH,
  "--notch-x": NOTCH_X,
  WebkitMaskImage: `radial-gradient(circle at var(--notch-x) 0, transparent var(--notch), black calc(var(--notch) + 0.5px)),
    radial-gradient(circle at var(--notch-x) 100%, transparent var(--notch), black calc(var(--notch) + 0.5px))`,
  maskImage: `radial-gradient(circle at var(--notch-x) 0, transparent var(--notch), black calc(var(--notch) + 0.5px)),
    radial-gradient(circle at var(--notch-x) 100%, transparent var(--notch), black calc(var(--notch) + 0.5px))`,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};
const NOTCH_Y = "50%";

export const ticketMaskY = {
  "--notch": NOTCH,
  "--notch-y": NOTCH_Y,
  WebkitMaskImage: `radial-gradient(circle at 0 var(--notch-y), transparent var(--notch), black calc(var(--notch) + 0.5px)),
    radial-gradient(circle at 100% var(--notch-y), transparent var(--notch), black calc(var(--notch) + 0.5px))`,
  maskImage: `radial-gradient(circle at 0 var(--notch-y), transparent var(--notch), black calc(var(--notch) + 0.5px)),
    radial-gradient(circle at 100% var(--notch-y), transparent var(--notch), black calc(var(--notch) + 0.5px))`,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};