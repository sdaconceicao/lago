/**
 * Generated from libphonenumber-js 1.13.15 metadata.min.json, schema 4:
 * countries[ISO][0] supplies the calling code, countries[ISO][3] possible lengths.
 * https://github.com/catamphetamine/libphonenumber-js/tree/v1.13.15
 * Copyright (c) 2016 @catamphetamine <purecatamphetamine@gmail.com> (MIT).
 * The complete license is included in THIRD_PARTY_NOTICES.md.
 *
 * Entries group countries with the same maximum national significant length,
 * capped to 15 minus the calling-code length. Each token is the two-letter ISO
 * country code followed by its calling code; for example, US1 means US / +1.
 * This table limits input length; it does not validate individual numbers.
 */

export interface TelephoneCountryDefinition {
  /** Uppercase ISO country or territory code used by the country selector. */
  readonly country: string;
  /** International calling code without the leading plus sign. */
  readonly callingCode: string;
  /** Maximum national significant digits within the 15-digit international limit. */
  readonly maxLength: number;
}

const COUNTRY_DATA: readonly (readonly [
  maxLength: number,
  countries: string,
])[] = [
  [4, "TA290"],
  [5, "CK682 FK500 SH290"],
  [6, "AC247 FO298 GL299 NC687 NF672"],
  [
    7,
    "AW297 BN673 BQ599 CV238 ER291 FM691 GY592 IO246 KM269 MH692 " +
      "NR674 NU683 PW680 SB677 SC248 SR597 ST239 TK690 TO676 TV688 " +
      "VU678",
  ],
  [
    8,
    "AM374 BF226 BH973 BI257 BT975 CF236 CW599 CY357 DJ253 DK45 " +
      "GA241 GI350 HT509 KI686 KW965 LB961 LS266 LT370 LV371 MD373 " +
      "MK389 ML223 MO853 MR222 MT356 NE227 NI505 NO47 PG675 SI386 " +
      "SJ47 SL232 TD235 TG228 TL670 TM993 TN216",
  ],
  [
    9,
    "AD376 AF93 AL355 AO244 AZ994 BA387 BE32 BL590 BO591 CG242 " +
      "CM237 DZ213 EH212 ES34 ET251 FR33 GE995 GF594 GH233 GM220 " +
      "GN224 GP590 GQ240 GW245 HR385 HU36 IS354 JO962 LI423 LK94 " +
      "LR231 LY218 MA212 MC377 ME382 MF590 MG261 MQ596 MW265 MZ258 " +
      "NA264 OM968 PE51 PF689 PM508 PT351 RE262 RO40 RW250 SD249 " +
      "SK421 SN221 SO252 SS211 SY963 SZ268 TJ992 TZ255 UG256 UZ998 " +
      "WF681 YE967 YT262 ZM260",
  ],
  [
    10,
    "AG1 AI1 AS1 BB1 BD880 BJ229 BM1 BS1 BW267 CA1 CD243 CI225 " +
      "CR506 CU53 DM1 DO1 EE372 EG20 GB44 GD1 GG44 GU1 IE353 IM44 " +
      "IQ964 IR98 JE44 JM1 KE254 KG996 KH855 KN1 KP850 KY1 LA856 LC1 " +
      "MM95 MN976 MP1 MS1 MU230 MV960 MX52 MY60 NZ64 PL48 PR1 PS970 " +
      "SA966 SM378 SX1 TC1 TT1 UA380 US1 VC1 VE58 VG1 VI1 VN84 WS685 " +
      "ZA27 ZW263",
  ],
  [
    11,
    "AR54 BR55 BY375 BZ501 CL56 CO57 EC593 FJ679 GT502 HK852 HN504 " +
      "LU352 NL31 NP977 PA507 PY595 QA974 SG65 SV503 TW886",
  ],
  [
    12,
    "AE971 AU61 AX358 BG359 CC61 CH41 CN86 CX61 CZ420 FI358 GR30 " +
      "IL972 IT39 NG234 PK92 RS381 SE46 UY598 VA39 XK383",
  ],
  [13, "AT43 DE49 ID62 IN91 JP81 KR82 PH63 TH66 TR90"],
  [14, "KZ7 RU7"],
];

export const TELEPHONE_COUNTRIES: readonly TelephoneCountryDefinition[] =
  COUNTRY_DATA.flatMap(([maxLength, countries]) =>
    countries.split(" ").map((code) => ({
      country: code.slice(0, 2),
      callingCode: code.slice(2),
      maxLength,
    }))
  ).sort((left, right) => left.country.localeCompare(right.country));
