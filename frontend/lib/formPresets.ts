const toStrings = (values: Record<string, string | number>): Record<string, string> =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)]));

// Verified against trained models + threshold.json
export const DIABETES_AUTO_FILL = toStrings({
  pregnancies: 0,
  glucose: 90,
  blood_pressure: 70,
  skin_thickness: 25,
  insulin: 100,
  bmi: 24,
  diabetes_pedigree_function: 0.2,
  age: 30,
});

export const HEART_AUTO_FILL = toStrings({
  age: 58,
  sex: 1,
  chest_pain_type: 2,
  resting_bp: 130,
  serum_cholesterol: 210,
  fasting_blood_sugar: 0,
  resting_ecg: 1,
  max_heart_rate: 138,
  exercise_induced_angina: 0,
  st_depression: 1.1,
  slope: 2,
  num_major_vessels: 0,
  thalassemia: 3,
});

export const KIDNEY_AUTO_FILL = toStrings({
  age: 65,
  blood_pressure: 180,
  specific_gravity: 1.005,
  albumin: 4,
  sugar: 4,
  red_blood_cells: 'abnormal',
  pus_cell: 'abnormal',
  pus_cell_clumps: 'present',
  bacteria: 'present',
  blood_glucose_random: 200,
  blood_urea: 150,
  serum_creatinine: 5.0,
  sodium: 130,
  potassium: 5.5,
  hemoglobin: 8,
  packed_cell_volume: 25,
  white_blood_cell_count: 12000,
  red_blood_cell_count: 3,
  hypertension: 'yes',
  diabetes_mellitus: 'yes',
  coronary_artery_disease: 'yes',
  appetite: 'poor',
  pedal_edema: 'yes',
  anemia: 'yes',
});
