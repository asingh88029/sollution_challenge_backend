

// Register a Hospital

// Request Type : POST
const  Body = {
    "hospitalName" : "AyushHospital",
    "hospitalType" : ["Ayurvedic","Homeopathy"],
    "email" : "AyushHospital",
    "password" : "ayushHospital",
    "contactInfo" : {
        "mobileNumber" : [09546496737],
        "address" : {
            "addressLine1 ": "IOC Main Rd , near Bus Stand ",
            "street ": "Pragati Nagar , Sipara",
            "city" : "patna",
            "pincode": 800020,
            "state ": "Bihar",
            "country ": "India"
        }
    } ,
  
  "coordinates" : {
        "latitude ": "25.579378",
        "longitude" : "85.124936"
    }
}