export const EMPLOYEE_DESIGNATION_OPTIONS = [
  { id: "SEO", label: "SEO" },
  { id: "ADS_MANAGER", label: "Ads Manager" },
  { id: "WEB_DEVELOPER", label: "Web Development" },
  { id: "SOCIAL_MEDIA", label: "Social Media" },
  { id: "SALES", label: "Sales" },
  { id: "OTHER", label: "Other" },
];

export const EMPLOYEE_SUB_DESIGNATION_MAP = {
  SEO: [
    { id: "ON_PAGE_SEO", label: "On Page SEO" },
    { id: "OFF_PAGE_SEO", label: "Off Page SEO" },
    { id: "TECHNICAL_SEO", label: "Technical SEO" },
    { id: "LOCAL_SEO", label: "Local SEO" },
  ],
  WEB_DEVELOPER: [
    { id: "FRONTEND_DEVELOPER", label: "Frontend Developer" },
    { id: "BACKEND_DEVELOPER", label: "Backend Developer" },
    { id: "FULL_STACK_DEVELOPER", label: "Full Stack Developer" },
    { id: "WORDPRESS_DEVELOPER", label: "WordPress Developer" },
  ],
  SOCIAL_MEDIA: [
    { id: "CONTENT_CREATOR", label: "Content Creator" },
    { id: "SOCIAL_MEDIA_STRATEGIST", label: "Social Media Strategist" },
    { id: "COMMUNITY_MANAGER", label: "Community Manager" },
  ],
  ADS_MANAGER: [
    { id: "GOOGLE_ADS", label: "Google Ads" },
    { id: "META_ADS", label: "Meta Ads" },
    { id: "PERFORMANCE_MARKETER", label: "Performance Marketer" },
  ],
  SALES: [
    { id: "BUSINESS_DEVELOPMENT", label: "Business Development" },
  ],
  OTHER: [{ id: "OTHER", label: "Other" }],
};

export const EMPLOYEE_AUTH_ROLE_OPTIONS = [
  { id: "INTERN", label: "Intern" },
  { id: "EXECUTIVE", label: "Executive" },
  { id: "SR_EXECUTIVE", label: "Sr Executive" },
  { id: "ASSISTANCE_MANAGER", label: "Assistance Manager" },
  { id: "MANAGER", label: "Manager" },
  { id: "SR_MANAGER", label: "Sr Manager" },
];

export function getSubDesignationOptions(designation) {
  if (!designation) return [];
  return EMPLOYEE_SUB_DESIGNATION_MAP[designation] || [];
}

export function isValidSubDesignation(designation, subDesignation) {
  if (!designation || !subDesignation) return false;
  const options = getSubDesignationOptions(designation);
  return options.some((item) => item.id === subDesignation);
}
