// Central place for dropdown/checkbox options so we stay consistent.

export const facilityUseOptions = [
  { value: "STORAGE_LIGHT", label: "Storage / light pallet storage" },
  { value: "ECOM_SOLO", label: "Solo e-commerce packing (few days/week)" },
  { value: "SMALL_ASSEMBLY", label: "Small assembly (≤4 staff, 5 days/week)" },
  { value: "HOBBY_CAR_STORAGE", label: "Hobby vehicle storage (classic cars, etc.)" },
  { value: "AUTO_MECHANIC", label: "Auto mechanic work" },
  { value: "MAKER_FULL_SERVICE", label: "Maker/production + fulfillment support" },
  { value: "OTHER", label: "Other (describe)" },
];

export const securityOptions = [
  { key: "gatedAccess", label: "Gated Access" },
  { key: "onSiteGuards", label: "On-site Guards" },
  { key: "securitySystem", label: "Security System" },
  { key: "securityCameras", label: "Security Cameras" },
];

export const amenityOptions = [
  { value: "SPECIALTY_POWER", label: "Specialty Power" },
  { value: "WATER_DRAIN", label: "Water & Drain" },
  { value: "INTERNET", label: "Internet" },
  { value: "OVERNIGHT_PARKING", label: "Overnight Parking" },
  { value: "OFFICE_SPACE", label: "Office Space" },
  { value: "RESTROOMS", label: "Restrooms" },
  { value: "LOADING_DOCK", label: "Loading Dock" },
  { value: "DRIVE_IN_DOORS", label: "Drive-in Doors" },
  { value: "RACKING", label: "Racking" },
  { value: "SHELVING", label: "Shelving" },
];

export const approvedUseOptions = [
  { value: "AGRI_FOOD", label: "Agriculture/Food" },
  { value: "APPAREL", label: "Apparel" },
  { value: "AUTOMOTIVE", label: "Automotive" },
  { value: "CANNABIS", label: "Cannabis" },
  { value: "CONSUMER_PRODUCTS", label: "Consumer Products" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "GENERAL_WORK", label: "General Work in Space" },
  { value: "INDUSTRIAL_MATERIALS", label: "Industrial Materials" },
  { value: "MACHINERY", label: "Machinery" },
  { value: "METAL_WORK", label: "Metal Work" },
  { value: "PETROLEUM", label: "Petroleum" },
  { value: "PHARMACEUTICAL", label: "Pharmaceutical" },
  { value: "RETAIL", label: "Retail" },
  { value: "WOOD_WORK", label: "Wood Work" },
  { value: "LOGISTICS_3PL", label: "3PL-style Fulfillment" },
];

export const qualificationOptions = [
  { value: "DRY", label: "Dry – Ambient" },
  { value: "TEMP_CONTROLLED", label: "Temperature Controlled" },
  { value: "FROZEN", label: "Frozen – Refrigerated" },
  { value: "FDA_REGISTERED", label: "FDA Registered" },
  { value: "FOOD_GRADE", label: "Food Grade" },
];

export const daysOfWeek = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export const addOnServices = {
  inbound: [
    { key: "palletReceiving", label: "Pallet Receiving" },
    { key: "cartonReceiving", label: "Carton Receiving" },
  ],
  outbound: [
    { key: "unitPickPack", label: "Unit Pick & Pack" },
    { key: "ecommerceFulfillment", label: "eCommerce Fulfillment" },
    { key: "cartonPick", label: "Carton Pick" },
    { key: "palletPick", label: "Pallet Pick" },
  ],
  valueAdd: [
    { key: "masterCartonLabeling", label: "Master Carton Labeling" },
    { key: "kitting", label: "Kitting" },
    { key: "ticketing", label: "Ticketing" },
    { key: "crossDock", label: "Cross Dock" },
    { key: "repacking", label: "Repacking" },
    { key: "shipLabeling", label: "Ship Labeling" },
    { key: "priceLabeling", label: "Price Labeling" },
  ],
};
