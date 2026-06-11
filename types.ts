
export enum MainModule {
  DATA_ANALYSIS = 'data_analysis',
  TAG_MANAGEMENT = 'tag_management',
  REQUIREMENT_CENTER = 'requirement_center',
  ITERATION_RECORD = 'iteration_record',
  MATERIAL_UPLOAD = 'material_upload',
  ASSET_LIBRARY = 'asset_library',
  UI_SPECIFICATION = 'ui_specification'
}

export enum Page {
  OVERVIEW = 'overview',
  RECOVERY_DATA = 'recovery_data',
  CONSUMPTION_DATA = 'consumption_data',
  CREATIVE_ANALYSIS = 'creative_analysis',
  PERSONNEL = 'personnel',
  BENCHMARK = 'benchmark'
}

export enum AnalysisDimension {
  DIRECTION = 'direction',
  PLOT_3D = 'plot_3d',
  GAMEPLAY_TYPE = 'gameplay_type',
  GAMEPLAY_CORE = 'gameplay_core',
  VOICEOVER = 'voiceover',
  COPYWRITING = 'copywriting',
  SECTION_A = 'section_a',
  SECTION_B = 'section_b',
  STRUCTURE = 'structure'
}

export interface TagNode {
  id: string;
  name: string;
  level: number;
  type?: 'single' | 'multi' | 'none';
  children?: TagNode[];
  parentId?: string;
}

export interface ChartDataPoint {
  name: string;
  totalCost: number;
  count: number;
  [key: string]: any;
}

export interface AdMaterial {
  id: string;
  name: string;
  thumbnail: string;
  cost: number;
  creator: string;
  launchDate: string;
  daysRunning: number;
  tags: string[];
  description: string;
  isGood: boolean;
  isPlot: boolean;
  result: string;
  liveCampCost: number;
  liveCampShare: number;
  language: string;
}

export interface MaterialDetailRow {
  id: string;
  date: string;
  thumbnail: string;
  title: string;
  direction: string;
  language: string;
  owner: string;
  cost: number;
  costRatio: number;
  cpm: number;
  cpi: number;
  ctr: number;
  cvr: number;
  roas: number;
  installs: number;
  payingUsers: number;
  diffHighestCost: number;
  diffAvgCost: number;
}

export interface PersonnelData {
  name: string;
  costHigh: number;
  successRate: number;
  successCost: number;
  successCostShare: number;
  totalMaterialCount: number;
  avgMaterialCost: number;
  efficiencyScore: number;
}

export interface KeywordTag {
  name: string;
  score: number;
}

export interface KeywordAnalysisData {
  positiveTags: KeywordTag[];
  negativeTags: KeywordTag[];
  summary: string;
}

export type RequirementPriority = 'Low' | 'Mid' | 'High' | 'Highest';
export type RequirementReqStatus = 'Draft' | 'Pending' | 'Approved' | 'Modification';
export type RequirementProdStatus = 'Scheduled' | 'InProgress' | 'Completed';
export type RequirementDeliveryStatus = 'Delivering' | 'Paused';

export interface ProjectInfo {
  name: string;
  code: string;
}

export const PROJECTS: ProjectInfo[] = [
  { name: 'Panthia', code: 'pan' },
  { name: 'Infinity 8 Ball', code: 'i8b' },
  { name: 'Joy Tycoon', code: 'jt' }
];

export const CHANNELS = [
  { id: 'all', name: 'all' },
  { id: 'apl', name: 'apl (Applovin)' },
  { id: 'fb', name: 'fb (Meta)' },
  { id: 'uac', name: 'uac (Google)' },
  { id: 'adjoe', name: 'adjoe (Adjoe)' },
  { id: 'moloco', name: 'moloco (Moloco)' },
  { id: 'unity', name: 'unity (Unity)' },
];

export const TEST_DIRECTIONS = [
  '前贴', '奖励', '玩法', '角色', '场景', '文案', '音效'
];

export type RequirementStageType = 
  | 'Original Gameplay' | 'Original Master'
  | 'Test Attraction' | 'Test Gameplay' | 'Test Master'
  | 'Iterative Attraction' | 'Iterative B-segment';

export interface ScriptSection {
  id: string;
  title: string;
  previewUrl?: string;
  description: string;
  tags: string[];
  refLibraryItem?: string;
  duration: string;
}

export interface ClipMetrics {
  assetId: string;
  creator: string;
  designer: string;
  language: string;
  country: string;
  ratio: string;
  originalSize: string;
  duration: number;
  newUsers: number;
  updateTime: string;
  totalCost: number;
}

export interface ProductionTask {
  id: string;
  type: 'Graphic' | 'Video' | 'Composition' | 'Program' | 'Model3D' | 'Scene3D' | 'AI' | 'Other';
  role?: string;
  version?: string;
  versionName?: string;
  status: string;
  designer: string;
  startDate: string;
  endDate: string;
  duration: string;
  estimatedWorkDays?: number;
  dependencyIds?: string[];
}

export type CreativeDifficulty = 'Senior' | 'Junior' | 'Test';
export type CreativeForm = 'Video' | 'Playable' | 'Image';
export type CreativeScenario = 'Standard' | 'Localized' | 'ASO';
export type CreativeDirectionType = 
  | 'Original-Gameplay' | 'Original-Hook' | 'Original-Master' 
  | 'Scaling-Iteration' | 'Scaling-Editing' 
  | 'Test-Hook' | 'Test-Gameplay';

export interface CreativeSchedule {
  id: string;
  weekRange: string; // e.g. "2026-05-12 ~ 2026-05-19"
  directionName: string;
  priority: RequirementPriority;
  difficulty: CreativeDifficulty;
  form: CreativeForm;
  scenario: CreativeScenario;
  directionType: CreativeDirectionType;
  validCount: number;
  totalRequiredCount: number;
  submittedCount: number;
  owner: string;
  requirementStart: string;
  requirementEnd: string;
  productionEnd: string;
  validationGoal?: string;
  broadDirection?: '3D玩法' | '大字报' | '原始玩法';
  materialStage?: '新' | '老' | '迭';
  channels?: string[];
  campaign?: string;
  acceptanceDate?: string;
  submissionDeadline?: string;
}

export interface AssetVersionItem {
  version: string;
  name: string;
  testDirections: string[];
}

export interface Requirement {
  id: string;
  parentId?: string; 
  scheduleId?: string; 
  name: string; // This is the Creative Name / custom input
  assetType: CreativeForm;
  assetIndex: number;
  assetVersion: string; // e.g. '01'
  projectName: string; // e.g. 'Panthia'
  broadDirection: '大字报' | '原始玩法' | '3D玩法';
  materialStage: '新' | '迭' | '老';
  creativePersonnel: string; // Name
  productionPersonnel: string[]; // List of names
  language: string;
  channels: string[]; // IDs
  testDirections: string[]; // Strings from TEST_DIRECTIONS
  dimensions: string[];
  previews: string[];
  testStatus?: '待测试' | '测试中' | '数据合格' | '不达标';
  subVersions?: AssetVersionItem[];
  
  duration: string;
  goal: string;
  template: string;
  has3DPlot: boolean;
  direction: string;
  owner: string; // Requester
  
  priority: RequirementPriority;
  reqStatus: RequirementReqStatus;
  prodStatus: RequirementProdStatus;
  deliveryStatus: RequirementDeliveryStatus;
  status: string; 
  rating: number;
  createdAt: string;
  completedAt?: string;
  description?: string;
  sections?: ScriptSection[];
  metrics?: ClipMetrics;
  stageType?: RequirementStageType;
  aTags?: string[];
  bTags?: string[];
  difficulty?: 'S' | 'A' | 'B' | 'C';
  startDate?: string;
  endDate?: string;
  tasks?: ProductionTask[];
  testRequirementId?: string;
  parentRequirementId?: string;
  masterVersion?: string;
  script?: string;
}

export interface PerformanceData {
  channel: string;
  spent: number;
  installs: number;
  paidUsers: number;
  ir: number;
  cpi: number;
  cpm: number;
  cpa: number;
}

export type CreativeFeedbackStatus = 'Learning' | 'Winner' | 'Flat' | 'Failed' | 'Paused';
export type CreativeFeedbackNextAction = 'Scale' | 'Iterate' | 'Pause' | 'Observe';

export interface FinishedCreativePerformance {
  id: string;
  requirementId: string;
  scheduleId?: string;
  version: string;
  versionName: string;
  creativeName: string;
  thumbnail: string;
  channel: string;
  country: string;
  language: string;
  ratio: string;
  launchedAt: string;
  daysRunning: number;
  spent: number;
  impressions: number;
  installs: number;
  paidUsers: number;
  cpm: number;
  cpi: number;
  cpa: number;
  ctr: number;
  cvr: number;
  ir: number;
  roasD7: number;
  status: CreativeFeedbackStatus;
  insight: string;
  nextAction: CreativeFeedbackNextAction;
}

export interface RequirementFeedbackSummary {
  requirementId: string;
  totalSpent: number;
  totalInstalls: number;
  bestVersion?: string;
  bestChannel?: string;
  status: CreativeFeedbackStatus;
  insight: string;
  nextAction: CreativeFeedbackNextAction;
}

export interface DirectionFeedbackSummary {
  scheduleId: string;
  requirementCount: number;
  launchedCreativeCount: number;
  totalSpent: number;
  totalInstalls: number;
  winnerCount: number;
  failedCount: number;
  avgCpi: number;
  avgCpa: number;
  avgIr: number;
  status: CreativeFeedbackStatus;
  insight: string;
}

export interface LibraryItem {
  id: string;
  type: 'Fragment' | 'Component';
  subType: string; 
  name: string;
  tags: string[];
  citationCount: number;
  status: 'Insufficient Data' | 'Recommended' | 'Not Recommended' | 'Disabled';
  createdAt: string;
  previewUrl: string;
  sourceFileUrl: string;
  duration?: string;
  parentComponent?: string;
  relatedRequirements?: string[]; 
  positionInTimeline?: string;
  relatedComponents?: string[];
  performance: PerformanceData[];
  theme?: string;
  relatedAssets?: string[];
}

export interface BenchmarkRule {
  id: string;
  channel: string;
  status: 'active' | 'expired';
  effectiveTime: string; // ISO string or formatted YYYY-MM-DD HH:00
  cpi: number;
  cpa7: number;
  roi7: number; // percentage
  payRate: number; // percentage
  paidUsers: number;
  newUsersPaid: number;
  newUsersRecovery: number;
  modifiedTime: string;
}
