const mongoose = require("mongoose");
const Speciality = [
  "General",
  "Allergists",
  "Dermatologists",
  "Infectious",
  "Ophthalmologist",
  "Obstetrician",
  "Cardiologist",
  "Endocrinologists",
  "Gastroenterologists",
  "Nephrologists",
  "Urologist",
  "Pulmonologist",
  "Otolaryngologists",
  "Neurologists",
  "Psychiatrists",
  "Oncologists",
  "Radiologists",
  "Rheumatologists",
  "General surgeons",
  "Orthopedic surgeons",
  "Cardiac surgeons",
  "Anesthesiologists",
];
const Department = [
  "medicine",
  "surgery",
  "gynaecology",
  "obstetrics",
  "paediatrics",
  "eye",
  "ENT",
  "dental",
  "orthopaedics",
  "neurology",
  "cardiology",
  "psychiatry",
  "skin",
  "V.D.",
  "plastic surgery",
  "nuclear medicine",
  "infectious disease",
];

const doctorToHospitalSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospital",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  department: {
    type: "String",
    enum: Department,
    required: true,
  },
});

const doctorToHospital = mongoose.model(
  "doctorToHospital",
  doctorToHospitalSchema
);
module.exports = doctorToHospital;
