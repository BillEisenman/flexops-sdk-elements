// Copyright (c) FlexOps, LLC. All rights reserved.

/**
 * Carrier display names and brand colors for rendering in widgets.
 * Uses text-based identifiers instead of embedded SVGs to keep bundle small.
 */

interface CarrierInfo {
  displayName: string;
  color: string;
  abbreviation: string;
}

const carriers: Record<string, CarrierInfo> = {
  usps: { displayName: 'USPS', color: '#333366', abbreviation: 'USPS' },
  ups: { displayName: 'UPS', color: '#351C15', abbreviation: 'UPS' },
  fedex: { displayName: 'FedEx', color: '#4D148C', abbreviation: 'FDX' },
  dhl: { displayName: 'DHL Express', color: '#D40511', abbreviation: 'DHL' },
  ontrac: { displayName: 'OnTrac', color: '#00843D', abbreviation: 'OT' },
  royalmail: { displayName: 'Royal Mail', color: '#D4003A', abbreviation: 'RM' },
  australiapost: { displayName: 'Australia Post', color: '#DC1928', abbreviation: 'AP' },
  canadapost: { displayName: 'Canada Post', color: '#DA291C', abbreviation: 'CP' },
};

/** Get carrier display info by carrier code (case-insensitive). */
export function getCarrierInfo(carrierCode: string): CarrierInfo {
  const key = carrierCode.toLowerCase().replace(/[\s-_]/g, '');
  return carriers[key] ?? {
    displayName: carrierCode,
    color: '#64748b',
    abbreviation: carrierCode.slice(0, 3).toUpperCase(),
  };
}
