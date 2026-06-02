import { getActiveTrackingSettings, isTrackingPlatformActive } from "@/lib/tracking/runtime";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function getProjectId(): string {
  if (!isTrackingPlatformActive("microsoftClarity")) return "";
  return getActiveTrackingSettings().microsoftClarity.id;
}

export function initClarity(projectId?: string): void {
  const id = projectId ?? getProjectId();
  if (!id || initialized) return;
  initialized = true;
}

export function isClarityEnabled(): boolean {
  return getProjectId().length > 0;
}

/** Microsoft Clarity bootstrap — injected once via next/script. */
export function clarityBootstrap(projectId: string): string {
  return `
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${projectId}");
`;
}
