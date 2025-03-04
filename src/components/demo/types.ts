
export interface PageToCaptureType {
  path: string;
  name: string;
  description: string;
}

export interface DemoProgressProps {
  progress: number;
  currentPage: string;
  complete: boolean;
}

export interface DemoCaptureControlsProps {
  generating: boolean;
  complete: boolean;
  startCapture: () => void;
}

export interface CapturedPagesListProps {
  complete: boolean;
  pages: PageToCaptureType[];
}

export interface DemoInstructionsProps {
  complete: boolean;
}
