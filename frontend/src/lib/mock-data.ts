export type QueryType = 'facility_search' | 'regional_gap' | 'validation';

export interface Facility {
  rank: number;
  facility_name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  match_score: number;
  trust_score: number;
  confidence: number;
  reasoning_summary: string[];
  evidence: string[];
  flags: string[];
}

export interface Region {
  region_id: string;
  name: string;
  risk_score: number;
  coverage_score: number;
  confidence: number;
  primary_gap: string;
  supporting_facts: string[];
}

export interface Constraint {
  dimension: string;
  field: string;
  operator: string;
  value: any;
  priority: string;
}

export interface MockResponse {
  query: string;
  query_type: QueryType;
  map_mode: 'facility_markers' | 'choropleth';
  summary: string;
  
  // New AI Analysis fields
  medical_need?: string;
  urgency?: string;
  reasoning_steps?: string[];
  constraints?: Constraint[];
  candidate_pool_size?: number;
  recommended_result_count?: number;
  
  filters_interpreted?: Record<string, any>;
  ranking: Facility[];
  regions: Region[];
  follow_up_questions: string[];
}

export const MOCK_RESPONSES: Record<string, MockResponse> = {
  facility_search: {
    query: "Find the nearest facility in rural Bihar that can perform an emergency appendectomy and typically leverages parttime doctors",
    query_type: "facility_search",
    map_mode: "facility_markers",
    summary: "3 facilities match strongly; 1 has the highest trust score.",
    filters_interpreted: {
      state: "Bihar",
      rural: true,
      procedure: "emergency appendectomy",
      staffing: "parttime doctors"
    },
    ranking: [
      {
        rank: 1,
        facility_name: "Patna Emergency Care",
        state: "Bihar",
        district: "Patna",
        lat: 25.6,
        lng: 85.1,
        match_score: 0.91,
        trust_score: 0.84,
        confidence: 0.78,
        reasoning_summary: [
          "Surgery-related capability detected",
          "Emergency support indicators present",
          "Part-time staffing signal found"
        ],
        evidence: [
          "Performs emergency appendectomy according to 2023 survey",
          "24/7 emergency surgical services verified by local reports"
        ],
        flags: [
          "Anesthesia evidence incomplete"
        ]
      },
      {
        rank: 2,
        facility_name: "Arrah District Hospital",
        state: "Bihar",
        district: "Bhojpur",
        lat: 25.55,
        lng: 84.66,
        match_score: 0.85,
        trust_score: 0.72,
        confidence: 0.65,
        reasoning_summary: [
          "Government facility with surgical capacity",
          "Variable staffing patterns noted"
        ],
        evidence: [
          "Designated surgical center",
          "Recent equipment upgrades noted in budget"
        ],
        flags: []
      }
    ],
    regions: [],
    follow_up_questions: [
      "Should the search prioritize government facilities?",
      "Do you want to exclude low-confidence matches?"
    ]
  },
  regional_gap: {
    query: "Show the highest-risk medical deserts in India for dialysis, oncology, and emergency trauma",
    query_type: "regional_gap",
    map_mode: "choropleth",
    summary: "Several states show low coverage for high-acuity specialties.",
    regions: [
      {
        region_id: "IN-BR",
        name: "Bihar",
        risk_score: 0.87,
        coverage_score: 0.22,
        confidence: 0.64,
        primary_gap: "Emergency Trauma",
        supporting_facts: [
          "Severe lack of level 1 trauma centers",
          "Sparse emergency coverage signals in public datasets"
        ]
      },
      {
        region_id: "IN-JH",
        name: "Jharkhand",
        risk_score: 0.75,
        coverage_score: 0.35,
        confidence: 0.71,
        primary_gap: "Dialysis",
        supporting_facts: [
          "High patient load for existing small clinics",
          "Growing population outpaces infrastructure"
        ]
      },
      {
        region_id: "IN-MH",
        name: "Maharashtra",
        risk_score: 0.32,
        coverage_score: 0.78,
        confidence: 0.85,
        primary_gap: "None",
        supporting_facts: [
          "Strong private healthcare presence",
          "Well-connected transport links"
        ]
      },
      {
        region_id: "IN-LA",
        name: "Ladakh",
        risk_score: 0.92,
        coverage_score: 0.08,
        confidence: 0.45,
        primary_gap: "Emergency Oxygen",
        supporting_facts: [
          "Extremely sparse facility density in high-altitude zones",
          "Logistical challenges for oxygen supply chain"
        ]
      },
      {
        region_id: "IN-UP",
        name: "Uttar Pradesh",
        risk_score: 0.95,
        coverage_score: 0.12,
        confidence: 0.58,
        primary_gap: "Oncology",
        supporting_facts: [
          "Critical shortage of specialized chemotherapy units",
          "Over 200km to nearest cancer center for many residents"
        ]
      }
    ],
    ranking: [],
    follow_up_questions: [
      "Should the analysis focus only on rural areas?",
      "Would you like to see population density overlays?"
    ]
  },
  validation: {
    query: "Find facilities claiming advanced surgery but lacking supporting evidence such as anesthesia capability",
    query_type: "validation",
    map_mode: "facility_markers",
    summary: "4 facilities identified with contradictory capability claims.",
    ranking: [
      {
        rank: 1,
        facility_name: "MediHealth Advanced Clinic",
        state: "Maharashtra",
        district: "Pune",
        lat: 18.52,
        lng: 73.85,
        match_score: 1.0,
        trust_score: 0.35,
        confidence: 0.88,
        reasoning_summary: [
          "High contradiction detected between claims and equipment",
          "No registered anesthesiologists found in database"
        ],
        evidence: [
          "Claims 'Complex General Surgery' in brochure",
          "Equipment audit (2024) shows missing critical surgical support"
        ],
        flags: [
          "Critical evidence missing: Anesthesia",
          "High-risk claim mismatch"
        ]
      }
    ],
    regions: [],
    follow_up_questions: [
      "Show all facilities with low trust scores?",
      "Filter by specific equipment requirements?"
    ]
  }
};
