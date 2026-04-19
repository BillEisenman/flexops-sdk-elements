// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState, useCallback } from 'react';
import { useFlexOps, resolveTheme } from '../../provider/context';
import { classifyHsCode } from '../../api/client';
import type { HsCodeClassification } from '../../api/types';
import type { HsCodeLookupProps } from './types';
import { getStyles } from './styles';

function confidenceColor(percent: number): string {
  if (percent >= 80) return '#16a34a';
  if (percent >= 50) return '#d97706';
  return '#dc2626';
}

/**
 * Embeddable HS code lookup widget. Classifies products into harmonized
 * system codes via the FlexOps HS code classification API.
 *
 * @example
 * ```tsx
 * <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io', apiKey: 'fxk_live_...' }}>
 *   <HsCodeLookup onCodeSelected={(code) => console.log(code)} />
 * </FlexOpsProvider>
 * ```
 */
export function HsCodeLookup({
  defaultTitle = '',
  defaultDescription = '',
  defaultCategory = '',
  showMaterialField = true,
  showCategoryField = true,
  destinationCountry,
  maxResults = 3,
  onClassified,
  onCodeSelected,
  onError,
  className,
  style,
  theme: themeOverride,
}: HsCodeLookupProps) {
  const { config, theme: providerTheme } = useFlexOps();
  const theme = themeOverride ? resolveTheme({ ...providerTheme, ...themeOverride }) : providerTheme;
  const s = getStyles(theme);

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [category, setCategory] = useState(defaultCategory);
  const [material, setMaterial] = useState('');

  const [loading, setLoading] = useState(false);
  const [classifications, setClassifications] = useState<HsCodeClassification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a product title.');
      return;
    }

    setLoading(true);
    setError(null);
    setClassifications([]);

    try {
      const response = await classifyHsCode(config, {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        material: material.trim() || undefined,
        destinationCountry,
        maxResults,
      });
      setClassifications(response.classifications);
      onClassified?.(response.classifications);
    } catch (err) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string }).message ?? 'HS code classification failed';
      setError(message);
      onError?.(new Error(message));
    } finally {
      setLoading(false);
    }
  }, [title, description, category, material, config, destinationCountry, maxResults, onClassified, onError]);

  function handleSelect(classification: HsCodeClassification) {
    onCodeSelected?.(classification);
  }

  return (
    <div style={{ ...s.container, ...style }} className={className}>
      <h3 style={s.heading}>HS Code Lookup</h3>

      <form onSubmit={handleSubmit}>
        <div style={s.fieldGroupFull}>
          <label style={s.label}>Product Title</label>
          <input style={s.input} type="text" placeholder="e.g. Cotton T-Shirt"
            value={title} onChange={(e) => { setTitle(e.target.value); setError(null); setClassifications([]); }} required />
        </div>

        <div style={s.fieldGroupFull}>
          <label style={s.label}>Description</label>
          <textarea style={s.textarea} placeholder="Optional product description"
            value={description} onChange={(e) => { setDescription(e.target.value); setClassifications([]); }} />
        </div>

        {showCategoryField && (
          <div style={s.fieldGroupFull}>
            <label style={s.label}>Category</label>
            <input style={s.input} type="text" placeholder="e.g. Apparel"
              value={category} onChange={(e) => { setCategory(e.target.value); setClassifications([]); }} />
          </div>
        )}

        {showMaterialField && (
          <div style={s.fieldGroupFull}>
            <label style={s.label}>Material</label>
            <input style={s.input} type="text" placeholder="e.g. 100% Cotton"
              value={material} onChange={(e) => { setMaterial(e.target.value); setClassifications([]); }} />
          </div>
        )}

        <button type="submit" style={loading ? s.buttonDisabled : s.button} disabled={loading}>
          {loading ? 'Classifying...' : 'Classify Product'}
        </button>
      </form>

      {error && <div style={s.errorMessage}>{error}</div>}
      {loading && <div style={s.loading}>Classifying product...</div>}

      {classifications.length > 0 && !loading && (
        <ul style={s.resultsList}>
          {classifications.map((cls, i) => (
            <li
              key={cls.hsCode}
              style={hoveredIndex === i ? s.resultItemHover : s.resultItem}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleSelect(cls)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(cls); }}
            >
              <span style={s.hsCodeBadge}>{cls.hsCode}</span>
              <div style={s.resultInfo}>
                <div style={s.codeName}>{cls.chapterDescription}</div>
                <div style={s.codeDescription}>{cls.description}</div>
                <div style={s.confidenceBar}>
                  <div
                    data-testid={`confidence-fill-${i}`}
                    style={{
                      width: `${cls.confidencePercent}%`,
                      height: '100%',
                      borderRadius: '3px',
                      backgroundColor: confidenceColor(cls.confidencePercent),
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <div style={s.confidenceLabel}>{cls.confidencePercent}% confidence</div>
                {cls.dutyRatePercent !== null && (
                  <div style={s.dutyRate}>Duty: {cls.dutyRatePercent}%</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
