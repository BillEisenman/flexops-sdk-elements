// Copyright (c) FlexOps, LLC. All rights reserved.

import type { HsCodeClassification } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';

export interface HsCodeLookupProps {
  /** Pre-fill product title. */
  defaultTitle?: string;
  /** Pre-fill product description. */
  defaultDescription?: string;
  /** Pre-fill product category. */
  defaultCategory?: string;
  /** Whether to show the material field (default: true). */
  showMaterialField?: boolean;
  /** Whether to show the category field (default: true). */
  showCategoryField?: boolean;
  /** Destination country code for classification context. */
  destinationCountry?: string;
  /** Maximum number of classification results to return (default: 3). */
  maxResults?: number;
  /** Called with all classifications after a successful classify. */
  onClassified?: (classifications: HsCodeClassification[]) => void;
  /** Called when a user clicks a specific classification result. */
  onCodeSelected?: (classification: HsCodeClassification) => void;
  /** Called on classification or API error. */
  onError?: (error: Error) => void;
  /** Additional CSS class for the outer container. */
  className?: string;
  /** Inline styles for the outer container. */
  style?: React.CSSProperties;
  /** Widget-level theme overrides. */
  theme?: Partial<FlexOpsTheme>;
}
